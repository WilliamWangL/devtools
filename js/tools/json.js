let editorInput;
let editorOutput;

function initEditors() {
    ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/');

    editorInput = ace.edit("editor-input");
    editorInput.session.setMode("ace/mode/json");
    editorInput.session.setUseWorker(false);
    editorInput.setOptions({
        showPrintMargin: false,
        wrap: true,
        fontSize: "14px",
        displayIndentGuides: true,
        useSoftTabs: true,
        tabSize: 4
    });

    editorOutput = ace.edit("editor-output");
    editorOutput.session.setMode("ace/mode/json");
    editorOutput.session.setUseWorker(false);
    editorOutput.setOptions({
        showPrintMargin: false,
        wrap: true,
        readOnly: true,
        fontSize: "14px",
        displayIndentGuides: true,
        useSoftTabs: true,
        tabSize: 4
    });

    // Handle auto-format on paste or input change
    let debounceTimer;
    editorInput.session.on('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const val = editorInput.getValue();
            if (!val.trim()) {
                editorOutput.setValue("");
                document.getElementById('json-status').textContent = "";
                return;
            }
            
            try {
                const parsed = JSON.parse(val);
                const formatted = JSON.stringify(parsed, null, 4);
                // -1 moves cursor to the start, avoids selecting all text
                editorOutput.setValue(formatted, -1);
                
                const statusEl = document.getElementById('json-status');
                statusEl.textContent = currentLang === 'zh' ? "有效 JSON" : "Valid JSON";
                statusEl.className = "text-xs font-medium text-green-600 dark:text-green-400";
            } catch (e) {
                const statusEl = document.getElementById('json-status');
                statusEl.textContent = currentLang === 'zh' ? "无效 JSON" : "Invalid JSON";
                statusEl.className = "text-xs font-medium text-red-600 dark:text-red-400";
            }
        }, 300);
    });

    updateEditorTheme();
}

function updateEditorTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? "ace/theme/twilight" : "ace/theme/textmate";
    if (editorInput) editorInput.setTheme(theme);
    if (editorOutput) editorOutput.setTheme(theme);
}

function formatJson() {
    try {
        const val = editorInput.getValue();
        if (!val.trim()) return;
        const parsed = JSON.parse(val);
        const formatted = JSON.stringify(parsed, null, 4);
        editorInput.setValue(formatted);
        editorInput.clearSelection();
        showToast(currentLang === 'zh' ? '格式化成功' : 'Formatted successfully');
    } catch (e) {
        showToast(currentLang === 'zh' ? '无效 JSON' : 'Invalid JSON', 'error');
    }
}

function compressJson() {
    try {
        const val = editorInput.getValue();
        if (!val.trim()) return;
        const parsed = JSON.parse(val);
        const compressed = JSON.stringify(parsed);
        editorOutput.setValue(compressed);
        editorOutput.clearSelection();
        showToast(currentLang === 'zh' ? '压缩成功' : 'Compressed successfully');
    } catch (e) {
        showToast(currentLang === 'zh' ? '无效 JSON' : 'Invalid JSON', 'error');
    }
}

function copyOutput() {
    const val = editorOutput.getValue();
    copyToClipboard(val);
}

function clearEditor() {
    editorInput.setValue("");
    editorOutput.setValue("");
    editorInput.focus();
}

// Hook into the main.js theme toggle
const originalToggleTheme = window.toggleTheme;
window.toggleTheme = function() {
    originalToggleTheme();
    updateEditorTheme();
};

document.addEventListener('DOMContentLoaded', () => {
    initEditors();
});
