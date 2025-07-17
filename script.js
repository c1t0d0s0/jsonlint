document.addEventListener('DOMContentLoaded', () => {
    const jsonEditor = document.getElementById('json-editor');
    const validateBtn = document.getElementById('validate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const compressBtn = document.getElementById('compress-btn');
    const errorMessage = document.getElementById('error-message');
    const lineNumbers = document.getElementById('line-numbers');
    const copyBtn = document.getElementById('copy-btn');

    // --- Helper Functions ---

    const updateLineNumbers = () => {
        const text = jsonEditor.value || '';
        const lines = text.split('\n');
        const lineCount = lines.length > 0 ? lines.length : 1;
        lineNumbers.innerHTML = Array.from({ length: lineCount }, (_, i) => `<div>${i + 1}</div>`).join('');
    };

    const syncScroll = () => {
        lineNumbers.scrollTop = jsonEditor.scrollTop;
        lineNumbers.scrollLeft = jsonEditor.scrollLeft;
    };

    const isEscaped = (text, index) => {
        if (index === 0) return false;
        let backslashCount = 0;
        for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) {
            backslashCount++;
        }
        return backslashCount % 2 === 1;
    };

    const formatJsonPreservingNumbers = (jsonString) => {
        let formatted = '';
        let indentLevel = 0;
        const indent = '    '; // 4 spaces
        let inString = false;

        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString[i];
            if (char === '"' && !isEscaped(jsonString, i)) inString = !inString;
            if (inString) { formatted += char; continue; }
            if (' \n\r\t'.includes(char)) continue;

            if (char === '{' || char === '[') {
                indentLevel++;
                formatted += char + '\n' + indent.repeat(indentLevel);
            } else if (char === '}' || char === ']') {
                indentLevel--;
                formatted += '\n' + indent.repeat(indentLevel) + char;
            } else if (char === ',') {
                formatted += char + '\n' + indent.repeat(indentLevel);
            } else if (char === ':') {
                formatted += char + ' ';
            } else {
                formatted += char;
            }
        }
        return formatted;
    };

    const compressJsonPreservingNumbers = (jsonString) => {
        let compressed = '';
        let inString = false;
        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString[i];
            if (char === '"' && !isEscaped(jsonString, i)) inString = !inString;
            if (inString || !' \n\r\t'.includes(char)) compressed += char;
        }
        return compressed;
    };

    // --- Main Application Logic ---

    const clearMessage = () => { errorMessage.textContent = ''; errorMessage.className = ''; };
    const showError = (message) => { errorMessage.textContent = message; errorMessage.className = 'error'; };
    const showSuccess = (message) => { errorMessage.textContent = message; errorMessage.className = 'success'; };

    jsonEditor.addEventListener('input', () => {
        updateLineNumbers();
        clearMessage();
    });

    jsonEditor.addEventListener('scroll', syncScroll);

    // Sync scrolling from line numbers to editor as well
    lineNumbers.addEventListener('scroll', () => {
        jsonEditor.scrollTop = lineNumbers.scrollTop;
        jsonEditor.scrollLeft = lineNumbers.scrollLeft;
    });

    validateBtn.addEventListener('click', () => {
        const text = jsonEditor.value;
        if (text.trim() === '') { clearMessage(); return; }
        try {
            JSON.parse(text); // Use for validation only
            const formattedText = formatJsonPreservingNumbers(text);
            jsonEditor.value = formattedText;
            updateLineNumbers();
            showSuccess('JSON is Valid!');
        } catch (e) {
            showError(`Invalid JSON! ${e.message}`);
        }
    });

    clearBtn.addEventListener('click', () => {
        jsonEditor.value = '';
        clearMessage();
        updateLineNumbers();
    });

    compressBtn.addEventListener('click', () => {
        const text = jsonEditor.value;
        if (text.trim() === '') { clearMessage(); return; }
        try {
            JSON.parse(text); // Use for validation only
            const compressedText = compressJsonPreservingNumbers(text);
            jsonEditor.value = compressedText;
            updateLineNumbers();
            clearMessage();
        } catch (e) {
            showError(`Invalid JSON! Cannot compress. ${e.message}`);
        }
    });

    // Initial state
    updateLineNumbers();
    clearMessage();

    copyBtn.addEventListener('click', () => {
        const originalIcon = copyBtn.innerHTML;
        navigator.clipboard.writeText(jsonEditor.value).then(() => {
            copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z"/>
                </svg>`;
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text.');
        });
    });
});