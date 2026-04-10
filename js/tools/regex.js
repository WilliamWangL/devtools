function clearTestString() {
    document.getElementById('test-string').value = '';
    testRegex();
    document.getElementById('test-string').focus();
}

// Escape HTML utility
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function testRegex() {
    const patternInput = document.getElementById('regex-pattern').value;
    const flagsInput = document.getElementById('regex-flags').value;
    const testString = document.getElementById('test-string').value;
    
    const errEl = document.getElementById('regex-error');
    const outEl = document.getElementById('match-output');
    const countEl = document.getElementById('match-count');
    const groupsPanel = document.getElementById('groups-panel');
    const groupsOutput = document.getElementById('groups-output');

    // Reset UI
    errEl.classList.add('hidden');
    countEl.classList.add('hidden');
    groupsPanel.classList.add('hidden');
    groupsOutput.innerHTML = '';
    
    if (!patternInput) {
        outEl.innerHTML = escapeHtml(testString);
        return;
    }

    let regex;
    try {
        regex = new RegExp(patternInput, flagsInput);
    } catch (e) {
        errEl.classList.remove('hidden');
        errEl.querySelector('.err-msg').innerText = e.message;
        outEl.innerHTML = escapeHtml(testString);
        return;
    }

    if (!testString) {
        outEl.innerHTML = '';
        return;
    }

    // Since regex object stores state when 'g' flag is used, we need to clone it or reset lastIndex
    let matchRegex = new RegExp(regex);
    
    // Logic for Highlighting
    let resultHtml = '';
    let lastIndex = 0;
    let matchCount = 0;
    
    let match;
    let matchesData = [];

    // Avoid infinite loops with empty matching regexes like `.*` or `^`
    let preventInfinite = 0;

    // We must use 'g' flag to loop through all matches for highlighting
    let highlightRegex = new RegExp(patternInput, flagsInput.includes('g') ? flagsInput : flagsInput + 'g');

    while ((match = highlightRegex.exec(testString)) !== null) {
        matchCount++;
        matchesData.push(match);

        const start = match.index;
        const end = highlightRegex.lastIndex;

        // Append non-matching string
        resultHtml += escapeHtml(testString.substring(lastIndex, start));

        // Append matching string (highlighted)
        const matchedText = match[0];
        resultHtml += `<span class="highlight-match">${escapeHtml(matchedText)}</span>`;

        lastIndex = end;

        // Prevent infinite loops for zero-length matches
        if (match[0].length === 0) {
            highlightRegex.lastIndex++;
        }
        
        if (preventInfinite++ > 5000) break; // Safety net
        
        // If original regex didn't have 'g', only find first match
        if (!flagsInput.includes('g')) break;
    }

    // Append remaining string
    resultHtml += escapeHtml(testString.substring(lastIndex));

    outEl.innerHTML = resultHtml;

    // Update count
    if (matchCount > 0) {
        countEl.innerText = `${matchCount} ${currentLang === 'zh' ? '匹配' : 'Matches'}`;
        countEl.classList.remove('hidden');
        
        // Render groups
        renderGroups(matchesData);
    } else {
        outEl.innerHTML = `<span class="text-gray-400 dark:text-gray-500">${currentLang === 'zh' ? '未找到匹配项' : 'No matches found'}</span><br><br>${escapeHtml(testString)}`;
    }
}

function renderGroups(matchesData) {
    const groupsPanel = document.getElementById('groups-panel');
    const groupsOutput = document.getElementById('groups-output');
    let html = '';

    matchesData.forEach((match, idx) => {
        html += `
            <tr class="bg-gray-100 dark:bg-gray-800/80">
                <td class="px-4 py-2 font-bold text-rose-600 dark:text-rose-400 w-32">Match ${idx + 1}</td>
                <td class="px-4 py-2 font-mono text-gray-900 dark:text-gray-100 break-all">${escapeHtml(match[0])}</td>
            </tr>
        `;
        
        // Render capturing groups
        for (let i = 1; i < match.length; i++) {
            const groupVal = match[i] === undefined ? '<undefined>' : escapeHtml(match[i]);
            html += `
                <tr>
                    <td class="px-4 py-2 text-gray-500 dark:text-gray-400 text-right text-xs">Group ${i}</td>
                    <td class="px-4 py-2 font-mono text-gray-700 dark:text-gray-300 break-all">${groupVal}</td>
                </tr>
            `;
        }
    });

    groupsOutput.innerHTML = html;
    groupsPanel.classList.remove('hidden');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Populate some default examples to show it works
    const testStr = `// Test email extraction
Contact us at support@example.com or sales@company.co.uk.
For admin, email root@server.net.`;
    document.getElementById('test-string').value = testStr;
    document.getElementById('regex-pattern').value = '([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})';
    
    testRegex();
});