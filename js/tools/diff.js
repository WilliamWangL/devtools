const dmp = new diff_match_patch();

function compareText() {
    const text1 = document.getElementById('text1').value;
    const text2 = document.getElementById('text2').value;

    if (!text1 && !text2) return;

    // Calculate diff
    const diffs = dmp.diff_main(text1, text2);
    // Cleanup semantics
    dmp.diff_cleanupSemantic(diffs);

    // Format output manually to use custom classes/tags
    let html = '';
    for (let i = 0; i < diffs.length; i++) {
        const op = diffs[i][0];    // Operation (insert, delete, equal)
        const data = diffs[i][1];  // Text of change

        // Escape HTML
        const text = data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        switch (op) {
            case 1: // INSERT
                html += `<ins class="px-0.5 mx-0.5 rounded">${text}</ins>`;
                break;
            case -1: // DELETE
                html += `<del class="px-0.5 mx-0.5 rounded">${text}</del>`;
                break;
            case 0: // EQUAL
                html += `<span>${text}</span>`;
                break;
        }
    }

    document.getElementById('diff-output').innerHTML = html || (currentLang === 'zh' ? '文本相同' : 'Texts are identical.');
}

function clearText() {
    document.getElementById('text1').value = '';
    document.getElementById('text2').value = '';
    document.getElementById('diff-output').innerHTML = '';
}

// Auto-compare on input
document.getElementById('text1').addEventListener('input', compareText);
document.getElementById('text2').addEventListener('input', compareText);
