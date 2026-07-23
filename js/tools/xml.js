let editorInput;
let editorOutput;

function initEditors() {
    ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/');

    editorInput = ace.edit("editor-input");
    editorInput.session.setMode("ace/mode/xml");
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
    editorOutput.session.setMode("ace/mode/xml");
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

    // Auto-validate on input change
    editorInput.session.on('change', () => {
        validateXmlSilent();
    });

    updateEditorTheme();
}

function updateEditorTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? "ace/theme/twilight" : "ace/theme/textmate";
    if (editorInput) editorInput.setTheme(theme);
    if (editorOutput) editorOutput.setTheme(theme);
}

/**
 * Format XML string with proper indentation
 */
function formatXml(xml) {
    const PADDING = '  ';
    let formatted = '';
    let indent = 0;

    // Remove existing whitespace between tags
    xml = xml.replace(/>\s*</g, '><').trim();

    // Handle XML declaration
    if (xml.startsWith('<?')) {
        const end = xml.indexOf('?>');
        if (end !== -1) {
            formatted += xml.substring(0, end + 2) + '\n';
            xml = xml.substring(end + 2);
        }
    }

    const tokens = xml.match(/<[^>]+>|[^<]+/g) || [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        if (!token) continue;

        // Text content
        if (!token.startsWith('<')) {
            formatted += token;
            continue;
        }

        // Self-closing tag
        if (token.endsWith('/>')) {
            formatted += '\n' + PADDING.repeat(indent) + token;
            continue;
        }

        // Closing tag
        if (token.startsWith('</')) {
            indent--;
            formatted += '\n' + PADDING.repeat(Math.max(indent, 0)) + token;
            continue;
        }

        // Opening tag
        if (token.startsWith('<')) {
            // Check if next token is text content followed by closing tag
            const nextText = (i + 1 < tokens.length) ? tokens[i + 1] : '';
            const nextClose = (i + 2 < tokens.length) ? tokens[i + 2] : '';

            if (nextText && !nextText.startsWith('<') && nextClose && nextClose.startsWith('</')) {
                // Inline: <tag>text</tag>
                formatted += '\n' + PADDING.repeat(indent) + token + nextText.trim() + nextClose.trim();
                i += 2;
                continue;
            }

            if (indent > 0) {
                formatted += '\n' + PADDING.repeat(indent);
            } else if (formatted.length > 0) {
                formatted += '\n';
            }
            formatted += token;
            indent++;
            continue;
        }
    }

    return formatted.trim();
}

function validateXmlSilent() {
    const val = editorInput.getValue();
    const statusEl = document.getElementById('xml-status');

    if (!val.trim()) {
        editorOutput.setValue("");
        statusEl.textContent = "";
        return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(val, 'text/xml');
    const errorNode = doc.querySelector('parsererror');

    if (errorNode) {
        const msg = errorNode.textContent || 'Parse error';
        statusEl.textContent = (currentLang === 'zh' ? '无效 XML: ' : 'Invalid XML: ') + msg.substring(0, 80);
        statusEl.className = "text-xs font-medium text-red-600 dark:text-red-400 max-w-[200px] truncate";
        statusEl.title = msg;
    } else {
        try {
            const formatted = formatXml(val);
            editorOutput.setValue(formatted);
            editorOutput.clearSelection();
        } catch (e) {
            // formatting failed, show raw
            editorOutput.setValue(val);
        }
        statusEl.textContent = currentLang === 'zh' ? '有效 XML' : 'Valid XML';
        statusEl.className = "text-xs font-medium text-green-600 dark:text-green-400";
    }
}

function validateXml() {
    const val = editorInput.getValue();
    if (!val.trim()) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(val, 'text/xml');
    const errorNode = doc.querySelector('parsererror');

    if (errorNode) {
        const msg = errorNode.textContent || 'Parse error';
        showToast((currentLang === 'zh' ? '无效 XML: ' : 'Invalid XML: ') + msg.substring(0, 120), 'error');
    } else {
        try {
            const formatted = formatXml(val);
            editorInput.setValue(formatted);
            editorInput.clearSelection();
            validateXmlSilent();
            showToast(currentLang === 'zh' ? '校验/格式化成功' : 'Validated and formatted successfully');
        } catch (e) {
            showToast((currentLang === 'zh' ? '格式化失败: ' : 'Format failed: ') + e.message, 'error');
        }
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
