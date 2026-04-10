let editorInput;
let editorOutput;

function initEditors() {
    ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/');

    editorInput = ace.edit("editor-input");
    editorInput.session.setMode("ace/mode/yaml");
    editorInput.session.setUseWorker(false);
    editorInput.setOptions({
        showPrintMargin: false,
        wrap: true,
        fontSize: "14px",
        displayIndentGuides: true,
        useSoftTabs: true,
        tabSize: 2
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
        tabSize: 2
    });

    // Handle auto-format on paste or input change
    editorInput.session.on('change', () => {
        validateYamlSilent();
    });

    updateEditorTheme();
}

function updateEditorTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? "ace/theme/twilight" : "ace/theme/textmate";
    if (editorInput) editorInput.setTheme(theme);
    if (editorOutput) editorOutput.setTheme(theme);
}

function validateYamlSilent() {
    const val = editorInput.getValue();
    const statusEl = document.getElementById('yaml-status');
    
    if (!val.trim()) {
        editorOutput.setValue("");
        statusEl.textContent = "";
        return;
    }
    
    try {
        const parsed = jsyaml.load(val);
        const formattedJson = JSON.stringify(parsed, null, 4);
        editorOutput.setValue(formattedJson);
        editorOutput.clearSelection();
        
        statusEl.textContent = currentLang === 'zh' ? "有效 YAML" : "Valid YAML";
        statusEl.className = "text-xs font-medium text-green-600 dark:text-green-400";
    } catch (e) {
        statusEl.textContent = currentLang === 'zh' ? "无效 YAML: " + e.message : "Invalid YAML: " + e.message;
        statusEl.className = "text-xs font-medium text-red-600 dark:text-red-400 max-w-[200px] truncate";
        statusEl.title = e.message;
    }
}

function validateYaml() {
    try {
        const val = editorInput.getValue();
        if (!val.trim()) return;
        const parsed = jsyaml.load(val);
        const formattedYaml = jsyaml.dump(parsed, { indent: 2, lineWidth: -1 });
        editorInput.setValue(formattedYaml);
        editorInput.clearSelection();
        showToast(currentLang === 'zh' ? '校验/格式化成功' : 'Validated and formatted successfully');
    } catch (e) {
        showToast((currentLang === 'zh' ? '无效 YAML: ' : 'Invalid YAML: ') + e.message, 'error');
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
