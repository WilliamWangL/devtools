// Real-time clocks
function updateClocks() {
    const now = Date.now();
    document.getElementById('current-ms').innerText = now;
    document.getElementById('current-sec').innerText = Math.floor(now / 1000);
}

setInterval(updateClocks, 1000);
updateClocks();

function convertToTime() {
    const val = document.getElementById('ts-input').value.trim();
    if (!val) return;

    let date;
    const num = parseInt(val, 10);
    if (isNaN(num)) {
        showToast(currentLang === 'zh' ? '请输入有效的时间戳' : 'Please enter a valid timestamp', 'error');
        return;
    }

    if (val.length <= 11) {
        date = new Date(num * 1000);
    } else {
        date = new Date(num);
    }

    if (isNaN(date.getTime())) {
        showToast(currentLang === 'zh' ? '无效的时间戳格式' : 'Invalid timestamp format', 'error');
        return;
    }

    document.getElementById('res-totm-local').innerText = date.toLocaleString();
    document.getElementById('res-totm-utc').innerText = date.toUTCString();
    document.getElementById('res-totm-iso').innerText = date.toISOString();

    document.getElementById('result-totm').classList.remove('hidden');
}

function fillCurrentTime() {
    const now = new Date();
    // YYYY-MM-DD HH:mm:ss
    const pad = (n) => n.toString().padStart(2, '0');
    const str = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    document.getElementById('time-input').value = str;
    convertToTs();
}

function convertToTs() {
    const val = document.getElementById('time-input').value.trim();
    if (!val) return;

    let date = new Date(val);
    
    if (isNaN(date.getTime())) {
        showToast(currentLang === 'zh' ? '无效的日期时间格式' : 'Invalid date format', 'error');
        return;
    }

    document.getElementById('res-tots-ms').innerText = date.getTime();
    document.getElementById('res-tots-sec').innerText = Math.floor(date.getTime() / 1000);

    document.getElementById('result-tots').classList.remove('hidden');
}

// Support enter key to convert
document.getElementById('ts-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') convertToTime();
});
document.getElementById('time-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') convertToTs();
});
