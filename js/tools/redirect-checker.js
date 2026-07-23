const MAX_REDIRECTS = 10;

function normalizeUrl(url) {
    url = url.trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    return url;
}

function getStatusClass(status) {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (status >= 300 && status < 400) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    if (status >= 400) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
}

function getStatusText(status) {
    const map = {
        200: 'OK',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
    };
    return map[status] || '';
}

async function fetchWithTimeout(url, options, timeout = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

async function checkSingleRedirect(url) {
    try {
        const response = await fetchWithTimeout(url, {
            method: 'HEAD',
            redirect: 'manual',
            mode: 'cors',
            cache: 'no-store'
        });

        const location = response.headers.get('Location');
        return {
            url: url,
            status: response.status,
            location: location,
            ok: response.ok,
            type: response.type,
            cors: response.type !== 'opaque' && response.type !== 'opaqueredirect'
        };
    } catch (error) {
        return {
            url: url,
            error: error.message || 'Network error',
            status: 0
        };
    }
}

async function traceRedirectChain(startUrl) {
    const chain = [];
    let currentUrl = startUrl;
    let redirectCount = 0;

    while (redirectCount < MAX_REDIRECTS) {
        const step = await checkSingleRedirect(currentUrl);
        chain.push(step);

        if (step.error) {
            break;
        }

        // If not a redirect or no location header, stop
        if (!step.location || step.status < 300 || step.status >= 400) {
            break;
        }

        // Resolve relative Location header
        currentUrl = new URL(step.location, currentUrl).href;
        redirectCount++;
    }

    // If manual mode couldn't follow due to CORS, try follow mode for final URL
    const lastStep = chain[chain.length - 1];
    if (lastStep && (lastStep.status >= 300 && lastStep.status < 400) && !lastStep.location) {
        try {
            const response = await fetchWithTimeout(startUrl, {
                method: 'HEAD',
                redirect: 'follow',
                mode: 'cors',
                cache: 'no-store'
            });
            if (response.url !== startUrl) {
                chain.push({
                    url: response.url,
                    status: response.status,
                    location: null,
                    ok: response.ok,
                    type: response.type,
                    cors: true,
                    estimated: true
                });
            }
        } catch (e) {
            // ignore fallback error
        }
    }

    return chain;
}

async function checkRedirects() {
    const inputEl = document.getElementById('url-input');
    const resultArea = document.getElementById('result-area');
    const chainContainer = document.getElementById('chain-container');
    const errorArea = document.getElementById('error-area');
    const countEl = document.getElementById('redirect-count');

    let url = normalizeUrl(inputEl.value);
    if (!url) {
        showToast(currentLang === 'zh' ? '请输入 URL' : 'Please enter a URL', 'error');
        return;
    }

    inputEl.value = url;
    resultArea.classList.add('hidden');
    errorArea.classList.add('hidden');
    errorArea.textContent = '';
    chainContainer.innerHTML = '';

    const isZh = currentLang === 'zh';
    const checkingText = isZh ? '正在检查...' : 'Checking...';
    chainContainer.innerHTML = `<div class="text-sm text-gray-500 dark:text-gray-400">${checkingText}</div>`;
    resultArea.classList.remove('hidden');

    try {
        const chain = await traceRedirectChain(url);
        chainContainer.innerHTML = '';

        const redirectSteps = chain.filter((step, index) => index > 0 || (step.status >= 300 && step.status < 400));
        const redirectCount = redirectSteps.length;

        countEl.textContent = redirectCount > 0
            ? (isZh ? `${redirectCount} 次重定向` : `${redirectCount} redirect${redirectCount > 1 ? 's' : ''}`)
            : (isZh ? '无重定向' : 'No redirects');

        chain.forEach((step, index) => {
            const isLast = index === chain.length - 1;
            const statusClass = getStatusClass(step.status);
            const statusText = getStatusText(step.status);
            const hasError = !!step.error;

            const div = document.createElement('div');
            div.className = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm';

            let html = `
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-bold px-2 py-1 rounded-md ${statusClass}">${hasError ? 'ERR' : (step.status || '---')}</span>
                        ${statusText ? `<span class="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">${statusText}</span>` : ''}
                    </div>
                    <code class="text-sm text-gray-800 dark:text-gray-200 break-all flex-1 font-mono">${escapeHtml(step.url)}</code>
                </div>
            `;

            if (hasError) {
                html += `<p class="text-xs text-red-600 dark:text-red-400 mt-1">${escapeHtml(step.error)}</p>`;
            } else if (step.location) {
                const nextUrl = new URL(step.location, step.url).href;
                html += `
                    <div class="mt-2 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <i data-lucide="arrow-down" class="w-4 h-4 mt-0.5 shrink-0"></i>
                        <span class="break-all font-mono">${escapeHtml(nextUrl)}</span>
                    </div>
                `;
            } else if (step.estimated) {
                html += `<p class="text-xs text-amber-600 dark:text-amber-400 mt-1">${isZh ? '最终跳转目标（CORS 限制下估算）' : 'Final destination (estimated due to CORS limitation)'}</p>`;
            } else if (isLast && step.ok) {
                html += `<p class="text-xs text-green-600 dark:text-green-400 mt-1">${isZh ? '最终目标' : 'Final destination'}</p>`;
            }

            div.innerHTML = html;
            chainContainer.appendChild(div);
        });

        // Add CORS note if any step was opaque/opaqueredirect
        const hasCorsLimitation = chain.some(s => s.type === 'opaqueredirect' || s.type === 'opaque');
        if (hasCorsLimitation) {
            const note = document.createElement('div');
            note.className = 'text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3';
            note.textContent = isZh
                ? '提示：由于浏览器 CORS 安全策略，部分重定向细节无法获取。建议配合服务端工具或浏览器开发者工具使用。'
                : 'Note: Some redirect details are unavailable due to browser CORS security policy. Consider using a server-side tool or browser dev tools for complete chains.';
            chainContainer.appendChild(note);
        }

        lucide.createIcons();

    } catch (error) {
        resultArea.classList.add('hidden');
        errorArea.classList.remove('hidden');
        errorArea.textContent = (isZh ? '检查失败：' : 'Check failed: ') + (error.message || 'Unknown error');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Allow Enter key to trigger check
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('url-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkRedirects();
            }
        });
    }
});
