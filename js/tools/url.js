function encodeUrl() {
    const input = document.getElementById('input').value;
    if (!input) {
        showToast(currentLang === 'zh' ? '请输入内容' : 'Please input text', 'error');
        return;
    }
    try {
        const result = encodeURIComponent(input);
        document.getElementById('output').value = result;
    } catch (e) {
        showToast(currentLang === 'zh' ? '编码失败' : 'Encoding failed', 'error');
    }
}

function decodeUrl() {
    const input = document.getElementById('input').value;
    if (!input) {
        showToast(currentLang === 'zh' ? '请输入内容' : 'Please input text', 'error');
        return;
    }
    try {
        const result = decodeURIComponent(input);
        document.getElementById('output').value = result;
    } catch (e) {
        showToast(currentLang === 'zh' ? '解码失败, 可能不是有效的 URL 编码' : 'Decode failed, maybe not valid encoded string', 'error');
    }
}

function clearText() {
    document.getElementById('input').value = '';
    document.getElementById('output').value = '';
    document.getElementById('input').focus();
}

function copyOutput() {
    const val = document.getElementById('output').value;
    copyToClipboard(val);
}
