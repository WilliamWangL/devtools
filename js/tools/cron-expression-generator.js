const state = {
    frequency: 'minute',
    minute: { interval: 1 },
    hourly: { minute: 0, interval: 1 },
    daily: { hour: 0, minute: 0, interval: 1 },
    weekly: { day: 1, hour: 0, minute: 0 },
    monthly: { day: 1, hour: 0, minute: 0 },
    yearly: { month: 1, day: 1, hour: 0, minute: 0 },
    custom: { expression: '0 0 * * *' }
};

const weekDays = [
    { value: 0, en: 'Sunday', zh: '周日' },
    { value: 1, en: 'Monday', zh: '周一' },
    { value: 2, en: 'Tuesday', zh: '周二' },
    { value: 3, en: 'Wednesday', zh: '周三' },
    { value: 4, en: 'Thursday', zh: '周四' },
    { value: 5, en: 'Friday', zh: '周五' },
    { value: 6, en: 'Saturday', zh: '周六' }
];

const months = [
    { value: 1, en: 'January', zh: '1月' },
    { value: 2, en: 'February', zh: '2月' },
    { value: 3, en: 'March', zh: '3月' },
    { value: 4, en: 'April', zh: '4月' },
    { value: 5, en: 'May', zh: '5月' },
    { value: 6, en: 'June', zh: '6月' },
    { value: 7, en: 'July', zh: '7月' },
    { value: 8, en: 'August', zh: '8月' },
    { value: 9, en: 'September', zh: '9月' },
    { value: 10, en: 'October', zh: '10月' },
    { value: 11, en: 'November', zh: '11月' },
    { value: 12, en: 'December', zh: '12月' }
];

function t(key, fallback) {
    return currentLang === 'zh' && translations.zh[key] ? translations.zh[key] : fallback;
}

function renderOptions() {
    const panel = document.getElementById('options-panel');
    const isZh = currentLang === 'zh';
    panel.innerHTML = '';

    switch (state.frequency) {
        case 'minute':
            panel.innerHTML = createNumberRow('cron.opt.interval', 'Every', 'minutes', state.minute.interval, 1, 60, v => state.minute.interval = v, 'cron.opt.minutes');
            break;
        case 'hourly':
            panel.innerHTML = createNumberRow('cron.opt.minute', 'At minute', '', state.hourly.minute, 0, 59, v => state.hourly.minute = v) +
                createNumberRow('cron.opt.interval', 'Every', 'hours', state.hourly.interval, 1, 24, v => state.hourly.interval = v, 'cron.opt.hours');
            break;
        case 'daily':
            panel.innerHTML = createTimeRow('cron.opt.at', state.daily.hour, state.daily.minute, (h, m) => { state.daily.hour = h; state.daily.minute = m; }) +
                createNumberRow('cron.opt.interval', 'Every', 'days', state.daily.interval, 1, 31, v => state.daily.interval = v, 'cron.opt.days');
            break;
        case 'weekly':
            panel.innerHTML = createSelectRow('cron.opt.day', 'On', weekDays, state.weekly.day, v => state.weekly.day = parseInt(v)) +
                createTimeRow('cron.opt.at', state.weekly.hour, state.weekly.minute, (h, m) => { state.weekly.hour = h; state.weekly.minute = m; });
            break;
        case 'monthly':
            panel.innerHTML = createNumberRow('cron.opt.day', 'On day', '', state.monthly.day, 1, 31, v => state.monthly.day = v) +
                createTimeRow('cron.opt.at', state.monthly.hour, state.monthly.minute, (h, m) => { state.monthly.hour = h; state.monthly.minute = m; });
            break;
        case 'yearly':
            panel.innerHTML = createSelectRow('cron.opt.month', 'In', months, state.yearly.month, v => state.yearly.month = parseInt(v)) +
                createNumberRow('cron.opt.day', 'On day', '', state.yearly.day, 1, 31, v => state.yearly.day = v) +
                createTimeRow('cron.opt.at', state.yearly.hour, state.yearly.minute, (h, m) => { state.yearly.hour = h; state.yearly.minute = m; });
            break;
        case 'custom':
            panel.innerHTML = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('cron.custom', 'Custom Expression')}</label>
                    <input type="text" id="custom-expression" value="${state.custom.expression}" 
                        class="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                        placeholder="* * * * *">
                    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">${t('cron.custom.hint', 'Format: minute hour day month weekday')}</p>
                </div>
            `;
            document.getElementById('custom-expression')?.addEventListener('input', (e) => {
                state.custom.expression = e.target.value;
                updateResult();
            });
            break;
    }

    // Attach listeners for dynamic number inputs
    panel.querySelectorAll('input[data-type="number"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const handler = window[e.target.dataset.handler];
            if (handler) handler(parseInt(e.target.value) || 0);
            updateResult();
        });
    });

    panel.querySelectorAll('select[data-type="select"]').forEach(select => {
        select.addEventListener('change', (e) => {
            const handler = window[e.target.dataset.handler];
            if (handler) handler(e.target.value);
            updateResult();
        });
    });

    panel.querySelectorAll('input[data-type="time-hour"], input[data-type="time-minute"]').forEach(input => {
        input.addEventListener('input', () => {
            const h = parseInt(document.getElementById('opt-hour')?.value || 0);
            const m = parseInt(document.getElementById('opt-minute')?.value || 0);
            const handler = window['timeHandler'];
            if (handler) handler(h, m);
            updateResult();
        });
    });
}

function createNumberRow(labelKey, prefix, suffix, value, min, max, onChange, suffixKey) {
    const suffixText = suffixKey && currentLang === 'zh' ? translations.zh[suffixKey] : suffix;
    const labelText = currentLang === 'zh' && translations.zh[labelKey] ? translations.zh[labelKey] : prefix;
    const handlerName = 'numHandler_' + Math.random().toString(36).substr(2, 8);
    window[handlerName] = onChange;
    return `
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 sm:w-32">${labelText}</label>
            <div class="flex items-center gap-3">
                <input type="number" min="${min}" max="${max}" value="${value}" data-type="number" data-handler="${handlerName}"
                    class="w-24 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none">
                <span class="text-sm text-gray-500 dark:text-gray-400">${suffixText}</span>
            </div>
        </div>
    `;
}

function createTimeRow(labelKey, hour, minute, onChange) {
    const labelText = currentLang === 'zh' && translations.zh[labelKey] ? translations.zh[labelKey] : 'At';
    window['timeHandler'] = onChange;
    return `
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 sm:w-32">${labelText}</label>
            <div class="flex items-center gap-2">
                <input type="number" id="opt-hour" min="0" max="23" value="${hour}" data-type="time-hour"
                    class="w-20 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none text-center">
                <span class="text-gray-500">:</span>
                <input type="number" id="opt-minute" min="0" max="59" value="${minute}" data-type="time-minute"
                    class="w-20 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none text-center">
            </div>
        </div>
    `;
}

function createSelectRow(labelKey, prefix, options, value, onChange) {
    const labelText = currentLang === 'zh' && translations.zh[labelKey] ? translations.zh[labelKey] : prefix;
    const handlerName = 'selHandler_' + Math.random().toString(36).substr(2, 8);
    window[handlerName] = onChange;
    const opts = options.map(o => `<option value="${o.value}" ${o.value === value ? 'selected' : ''}>${currentLang === 'zh' ? o.zh : o.en}</option>`).join('');
    return `
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 sm:w-32">${labelText}</label>
            <select data-type="select" data-handler="${handlerName}"
                class="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none">
                ${opts}
            </select>
        </div>
    `;
}

function generateCron() {
    switch (state.frequency) {
        case 'minute':
            return state.minute.interval === 1 ? '* * * * *' : `*/${state.minute.interval} * * * *`;
        case 'hourly':
            const hInt = state.hourly.interval === 1 ? '*' : `*/${state.hourly.interval}`;
            return `${state.hourly.minute} ${hInt} * * *`;
        case 'daily':
            const dInt = state.daily.interval === 1 ? '*' : `*/${state.daily.interval}`;
            return `${state.daily.minute} ${state.daily.hour} ${dInt} * *`;
        case 'weekly':
            return `${state.weekly.minute} ${state.weekly.hour} * * ${state.weekly.day}`;
        case 'monthly':
            return `${state.monthly.minute} ${state.monthly.hour} ${state.monthly.day} * *`;
        case 'yearly':
            return `${state.yearly.minute} ${state.yearly.hour} ${state.yearly.day} ${state.yearly.month} *`;
        case 'custom':
            return state.custom.expression.trim() || '* * * * *';
    }
    return '* * * * *';
}

function parseCron(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return null;
    return parts.map(p => parseField(p));
}

function parseField(field) {
    if (field === '*') return { type: 'any' };
    if (field.startsWith('*/')) {
        return { type: 'step', step: parseInt(field.slice(2)) };
    }
    if (field.includes(',')) {
        return { type: 'list', values: field.split(',').map(v => parseInt(v)) };
    }
    if (field.includes('-')) {
        const [start, end] = field.split('-').map(v => parseInt(v));
        return { type: 'range', start, end };
    }
    return { type: 'value', value: parseInt(field) };
}

function matchesField(parsed, value) {
    if (!parsed) return false;
    switch (parsed.type) {
        case 'any': return true;
        case 'step': return value % parsed.step === 0;
        case 'list': return parsed.values.includes(value);
        case 'range': return value >= parsed.start && value <= parsed.end;
        case 'value': return parsed.value === value;
    }
    return false;
}

function getNextRuns(expr, count = 5) {
    const parsed = parseCron(expr);
    if (!parsed) return [];
    const [minuteP, hourP, dayP, monthP, weekdayP] = parsed;
    const runs = [];
    let cursor = new Date();
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);

    const maxIterations = 100000;
    let iterations = 0;

    while (runs.length < count && iterations < maxIterations) {
        iterations++;
        const m = cursor.getMinutes();
        const h = cursor.getHours();
        const d = cursor.getDate();
        const mo = cursor.getMonth() + 1;
        const wd = cursor.getDay();

        if (matchesField(monthP, mo) &&
            matchesField(dayP, d) &&
            matchesField(weekdayP, wd) &&
            matchesField(hourP, h) &&
            matchesField(minuteP, m)) {
            runs.push(new Date(cursor));
        }
        cursor.setMinutes(cursor.getMinutes() + 1);
    }
    return runs;
}

function describeCron(expr) {
    const isZh = currentLang === 'zh';
    switch (state.frequency) {
        case 'minute':
            return state.minute.interval === 1
                ? (isZh ? '每分钟执行' : 'Every minute')
                : (isZh ? `每 ${state.minute.interval} 分钟执行` : `Every ${state.minute.interval} minutes`);
        case 'hourly':
            return state.hourly.interval === 1
                ? (isZh ? `每小时的第 ${state.hourly.minute} 分钟执行` : `Every hour at minute ${state.hourly.minute}`)
                : (isZh ? `每 ${state.hourly.interval} 小时的第 ${state.hourly.minute} 分钟执行` : `Every ${state.hourly.interval} hours at minute ${state.hourly.minute}`);
        case 'daily':
            return state.daily.interval === 1
                ? (isZh ? `每天 ${pad(state.daily.hour)}:${pad(state.daily.minute)} 执行` : `Daily at ${pad(state.daily.hour)}:${pad(state.daily.minute)}`)
                : (isZh ? `每 ${state.daily.interval} 天 ${pad(state.daily.hour)}:${pad(state.daily.minute)} 执行` : `Every ${state.daily.interval} days at ${pad(state.daily.hour)}:${pad(state.daily.minute)}`);
        case 'weekly':
            const wd = weekDays[state.weekly.day];
            return isZh
                ? `每周${wd.zh} ${pad(state.weekly.hour)}:${pad(state.weekly.minute)} 执行`
                : `Every ${wd.en} at ${pad(state.weekly.hour)}:${pad(state.weekly.minute)}`;
        case 'monthly':
            return isZh
                ? `每月 ${state.monthly.day} 日 ${pad(state.monthly.hour)}:${pad(state.monthly.minute)} 执行`
                : `Monthly on day ${state.monthly.day} at ${pad(state.monthly.hour)}:${pad(state.monthly.minute)}`;
        case 'yearly':
            const mo = months[state.yearly.month - 1];
            return isZh
                ? `每年 ${mo.zh}${state.yearly.day} 日 ${pad(state.yearly.hour)}:${pad(state.yearly.minute)} 执行`
                : `Yearly on ${mo.en} ${state.yearly.day} at ${pad(state.yearly.hour)}:${pad(state.yearly.minute)}`;
        case 'custom':
            return isZh ? '自定义表达式' : 'Custom expression';
    }
}

function pad(n) {
    return String(n).padStart(2, '0');
}

function updateResult() {
    const expr = generateCron();
    document.getElementById('cron-output').value = expr;
    document.getElementById('cron-desc').textContent = describeCron(expr);

    const runs = getNextRuns(expr, 5);
    const list = document.getElementById('next-runs');
    if (runs.length === 0) {
        list.innerHTML = `<li class="text-sm text-gray-500 dark:text-gray-400">${currentLang === 'zh' ? '无法计算下次执行时间（请检查表达式）' : 'Unable to calculate next runs (check expression)'}</li>`;
        return;
    }
    list.innerHTML = runs.map(date => {
        const iso = date.toLocaleString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        return `<li class="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-violet-500"></span>${iso}</li>`;
    }).join('');
}

function setFrequency(freq) {
    state.frequency = freq;
    document.querySelectorAll('.freq-tab').forEach(btn => {
        const active = btn.dataset.freq === freq;
        btn.className = active
            ? 'freq-tab px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
            : 'freq-tab px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700';
    });
    renderOptions();
    updateResult();
}

function copyCron() {
    const val = document.getElementById('cron-output').value;
    copyToClipboard(val);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.freq-tab').forEach(btn => {
        btn.addEventListener('click', () => setFrequency(btn.dataset.freq));
    });
    renderOptions();
    updateResult();
});

window.addEventListener('languageChanged', () => {
    renderOptions();
    updateResult();
});
