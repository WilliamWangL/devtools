const timezones = [
    { id: 'local', titleI18n: 'world.local', tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
    { id: 'utc', titleI18n: 'world.utc', tz: 'UTC' },
    { id: 'beijing', titleI18n: 'world.beijing', tz: 'Asia/Shanghai' },
    { id: 'newyork', titleI18n: 'world.newyork', tz: 'America/New_York' },
    { id: 'london', titleI18n: 'world.london', tz: 'Europe/London' },
    { id: 'tokyo', titleI18n: 'world.tokyo', tz: 'Asia/Tokyo' },
    { id: 'sydney', titleI18n: 'world.sydney', tz: 'Australia/Sydney' }
];

function initCards() {
    const container = document.getElementById('time-cards');
    let html = '';
    
    timezones.forEach(tz => {
        // Find translation or fallback
        let title = tz.titleI18n;
        if (translations[currentLang] && translations[currentLang][tz.titleI18n]) {
            title = translations[currentLang][tz.titleI18n];
        } else if (currentLang === 'en' && translations['zh'][tz.titleI18n]) {
            // Primitive fallback for english hardcoded names
            const enNames = {
                'world.local': 'Local Time',
                'world.utc': 'UTC',
                'world.beijing': 'Beijing (CST)',
                'world.newyork': 'New York (EST/EDT)',
                'world.london': 'London (GMT/BST)',
                'world.tokyo': 'Tokyo (JST)',
                'world.sydney': 'Sydney (AEST)'
            };
            title = enNames[tz.titleI18n];
        }

        html += `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center group hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4" data-i18n="${tz.titleI18n}">${title}</h3>
                <div id="time-${tz.id}" class="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">--:--:--</div>
                <div id="date-${tz.id}" class="text-sm text-gray-500 dark:text-gray-400">----/--/--</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function updateTimes() {
    const now = new Date();

    timezones.forEach(tz => {
        try {
            const timeStr = now.toLocaleTimeString('en-US', {
                timeZone: tz.tz,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const dateStr = now.toLocaleDateString('en-US', {
                timeZone: tz.tz,
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                weekday: 'short'
            });

            document.getElementById(`time-${tz.id}`).innerText = timeStr;
            document.getElementById(`date-${tz.id}`).innerText = dateStr;
        } catch (e) {
            console.error(`Invalid timezone: ${tz.tz}`);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCards();
    updateTimes();
    setInterval(updateTimes, 1000);
});
