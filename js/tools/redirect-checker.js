const MAX_REDIRECTS = 10;

function normalizeUrl(url) {
    url = url.trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    return url;
}

function getStepTheme(status, index, isLast) {
    if (isLast && status >= 200 && status < 300) {
        return {
            bar: 'bg-green-600 dark:bg-green-700',
            badge: 'bg-green-700 text-white',
            card: 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-900/50'
        };
    }
    if (status >= 300 && status < 400) {
        return {
            bar: 'bg-gray-600 dark:bg-gray-700',
            badge: 'bg-gray-700 text-white',
            card: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        };
    }
    if (index === 0) {
        return {
            bar: 'bg-amber-500 dark:bg-amber-600',
            badge: 'bg-amber-600 text-white',
            card: 'bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-900/50'
        };
    }
    return {
        bar: 'bg-gray-600 dark:bg-gray-700',
        badge: 'bg-gray-700 text-white',
        card: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    };
}

function getStatusLabel(status) {
    if (status >= 200 && status < 300) return '200';
    if (status >= 300 && status < 400) return String(status);
    if (status >= 400) return String(status);
    if (status === 0) return 'ERR';
    return String(status);
}

function getStatusDescription(status, isLast) {
    const isZh = currentLang === 'zh';
    if (status >= 200 && status < 300) {
        return isLast 
            ? (isZh ? '最终目标' : 'Final destination')
            : (isZh ? '页面加载后跳转' : 'then JS redirect');
    }
    if (status === 301) return isZh ? '永久重定向至' : '301 redirect to';
    if (status === 302) return isZh ? '临时重定向至' : '302 redirect to';
    if (status === 303) return isZh ? '参见其他地址' : '303 redirect to';
    if (status === 307) return isZh ? '临时重定向至' : '307 redirect to';
    if (status === 308) return isZh ? '永久重定向至' : '308 redirect to';
    if (status >= 300 && status < 400) return `${status} ${isZh ? '重定向至' : 'redirect to'}`;
    if (status >= 400) return `${status} ${isZh ? '错误' : 'error'}`;
    return '';
}

async function fetchWithTimeout(url, options, timeout = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const start = performance.now();
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return { response, duration: Math.round(performance.now() - start) };
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

async function checkSingleRedirect(url) {
    try {
        const { response, duration } = await fetchWithTimeout(url, {
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
            duration: duration,
            cors: response.type !== 'opaque' && response.type !== 'opaqueredirect'
        };
    } catch (error) {
        return {
            url: url,
            error: error.name === 'AbortError' ? 'Timeout' : (error.message || 'Network error'),
            status: 0,
            duration: 0
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

    // Fallback: try follow mode to get final destination when manual mode is blocked
    const lastStep = chain[chain.length - 1];
    if (lastStep && ((lastStep.status >= 300 && lastStep.status < 400 && !lastStep.location) || lastStep.error)) {
        try {
            const { response } = await fetchWithTimeout(startUrl, {
                method: 'HEAD',
                redirect: 'follow',
                mode: 'cors',
                cache: 'no-store'
            });
            if (response.url !== startUrl && !chain.some(s => s.url === response.url)) {
                chain.push({
                    url: response.url,
                    status: response.status,
                    location: null,
                    ok: response.ok,
                    type: response.type,
                    duration: 0,
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
    const summaryEl = document.getElementById('redirect-summary');

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
    chainContainer.innerHTML = `<div class="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">${checkingText}</div>`;
    resultArea.classList.remove('hidden');

    try {
        const chain = await traceRedirectChain(url);
        chainContainer.innerHTML = '';

        const redirectSteps = chain.filter((step, index) => 
            (index > 0 && step.status >= 300 && step.status < 400) || step.estimated
        );
        const redirectCount = redirectSteps.length;

        summaryEl.textContent = redirectCount > 0
            ? (isZh ? `共 ${redirectCount} 次重定向` : `${redirectCount} redirect${redirectCount > 1 ? 's' : ''} detected`)
            : (isZh ? '未检测到重定向' : 'No redirects detected');

        let hasCorsLimitation = false;

        chain.forEach((step, index) => {
            const isLast = index === chain.length - 1;
            const theme = getStepTheme(step.status, index, isLast);
            const statusLabel = getStatusLabel(step.status);
            const statusDesc = getStatusDescription(step.status, isLast);
            const hasError = !!step.error;
            const hasLocation = !!step.location;

            if (step.type === 'opaqueredirect' || step.type === 'opaque') {
                hasCorsLimitation = true;
            }

            const card = document.createElement('div');
            card.className = `rounded-xl overflow-hidden shadow-sm border ${theme.card}`;

            // Header bar with URL
            const header = document.createElement('div');
            header.className = `${theme.bar} px-4 py-3 flex items-center gap-3`;
            header.innerHTML = `
                <i data-lucide="lock" class="w-4 h-4 text-white/80 shrink-0"></i>
                <a href="${escapeHtml(step.url)}" target="_blank" rel="noopener noreferrer" class="text-white text-sm font-mono break-all hover:underline">${escapeHtml(step.url)}</a>
            `;
            card.appendChild(header);

            // Body
            const body = document.createElement('div');
            body.className = 'p-4 flex items-start gap-4';

            let bodyHtml = `
                <div class="w-14 h-14 rounded-full ${theme.badge} flex items-center justify-center text-lg font-bold shrink-0">
                    ${statusLabel}
                </div>
                <div class="flex-1 min-w-0">
            `;

            if (hasError) {
                bodyHtml += `
                    <p class="text-red-600 dark:text-red-400 font-medium mb-1">${isZh ? '请求失败' : 'Request failed'}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${escapeHtml(step.error)}</p>
                `;
            } else if (hasLocation) {
                const nextUrl = new URL(step.location, step.url).href;
                bodyHtml += `
                    <p class="text-gray-700 dark:text-gray-300 font-medium mb-1">${statusDesc}</p>
                    <a href="${escapeHtml(nextUrl)}" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 dark:text-blue-400 break-all hover:underline font-mono">${escapeHtml(nextUrl)}</a>
                `;
            } else if (step.estimated) {
                bodyHtml += `
                    <p class="text-amber-600 dark:text-amber-400 font-medium mb-1">${isZh ? '最终目标（估算）' : 'Final destination (estimated)'}</p>
                    <a href="${escapeHtml(step.url)}" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 dark:text-blue-400 break-all hover:underline font-mono">${escapeHtml(step.url)}</a>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${isZh ? 'CORS 策略阻止了完整链追踪' : 'CORS policy prevented full chain tracing'}</p>
                `;
            } else {
                bodyHtml += `
                    <p class="text-gray-700 dark:text-gray-300 font-medium mb-1">${statusDesc}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${isZh ? 'HTTP 状态正常，无服务器端重定向' : 'HTTP status OK, no server-side redirect'}</p>
                `;
            }

            bodyHtml += `
                </div>
                <div class="text-right shrink-0">
                    <div class="text-lg font-bold text-gray-900 dark:text-white">${step.duration || '-'}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">ms</div>
                </div>
            `;

            body.innerHTML = bodyHtml;
            card.appendChild(body);
            chainContainer.appendChild(card);
        });

        if (hasCorsLimitation) {
            const note = document.createElement('div');
            note.className = 'text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3';
            note.textContent = isZh
                ? '提示：由于浏览器 CORS 安全策略，部分重定向细节无法获取。此工具适用于测试支持跨域访问的端点，完整追踪请使用服务端工具或浏览器开发者工具。'
                : 'Note: Some redirect details are unavailable due to browser CORS security policy. This tool works best for testing CORS-enabled endpoints. Use a server-side tool or browser dev tools for complete chains.';
            chainContainer.appendChild(note);
        }

        lucide.createIcons();

    } catch (error) {
        resultArea.classList.add('hidden');
        errorArea.classList.remove('hidden');
        const errZh = currentLang === 'zh';
        errorArea.textContent = (errZh ? '检查失败：' : 'Check failed: ') + (error.message || 'Unknown error');
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
