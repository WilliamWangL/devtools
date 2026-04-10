function generateMD5() {
    const input = document.getElementById('input').value;
    if (!input) {
        document.getElementById('output').innerText = '';
        return;
    }
    const hash = CryptoJS.MD5(input).toString();
    document.getElementById('output').innerText = hash;
}

function clearText() {
    document.getElementById('input').value = '';
    generateMD5();
    document.getElementById('input').focus();
}

function copyOutput() {
    const val = document.getElementById('output').innerText;
    copyToClipboard(val);
}

// Initial empty call
generateMD5();
