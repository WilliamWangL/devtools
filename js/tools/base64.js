function encodeBase64() {
    const input = document.getElementById('input').value;
    if (!input) {
        showToast(currentLang === 'zh' ? '请输入内容' : 'Please input text', 'error');
        return;
    }
    try {
        // Handle utf-8 encoding safely
        const utf8Bytes = new TextEncoder().encode(input);
        const binaryString = Array.from(utf8Bytes).map(byte => String.fromCharCode(byte)).join('');
        const result = btoa(binaryString);
        document.getElementById('output').value = result;
    } catch (e) {
        showToast(currentLang === 'zh' ? '编码失败' : 'Encoding failed', 'error');
    }
}

function decodeBase64() {
    const input = document.getElementById('input').value.trim();
    if (!input) {
        showToast(currentLang === 'zh' ? '请输入内容' : 'Please input text', 'error');
        return;
    }
    try {
        const binaryString = atob(input);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const result = new TextDecoder().decode(bytes);
        document.getElementById('output').value = result;
    } catch (e) {
        showToast(currentLang === 'zh' ? '解码失败, 可能不是有效的 Base64 编码' : 'Decode failed, invalid Base64', 'error');
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
