// ==UserScript==
// @name         Run Button for Code Blocks + Append to Chat
// @namespace    http://chatgpt.com/
// @version      2025-03-28
// @description  Add "Run" button for sh/bash/zsh/cmd/powershell blocks, display result inline, and insert output into ChatGPT input box via "→ Chat" button. CSP-safe via GM_xmlhttpRequest. By Steven 🧠🐍
// @author       Steven
// @match        https://chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function () {
    'use strict';

    const LANG_SELECTOR = [
        'code.language-sh',
        'code.language-bash',
        'code.language-zsh',
        'code.language-cmd',
        'code.language-ps'
    ].join(', ');

    function createOutputContainer(resultText, commandText) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '8px';
        wrapper.style.marginTop = '4px';
        wrapper.style.marginLeft = '24px';
        wrapper.style.borderLeft = '2px solid #888';
        wrapper.style.paddingLeft = '12px';

        const resultContainer = document.createElement('div');
        resultContainer.style.display = 'flex';
        resultContainer.style.gap = '12px';
        resultContainer.style.alignItems = 'flex-start';

        const pre = document.createElement('pre');
        pre.textContent = resultText.replace(/\\n/g, '\n').replace(/^"|"$/g, '') || '[No output]';
        pre.style.margin = '0';
        pre.style.padding = '0';
        pre.style.background = 'transparent';
        pre.style.color = '#b4b4b4';
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.overflowX = 'auto';
        pre.style.flex = '1';
        pre.style.fontSize = '0.875rem';
        pre.style.fontFamily = 'monospace';

        const toChatBtn = document.createElement('button');
        toChatBtn.textContent = '→ Chat';
        toChatBtn.style.background = '#2d2d2d';
        toChatBtn.style.color = '#b4b4b4';
        toChatBtn.style.border = '1px solid #404040';
        toChatBtn.style.padding = '0.5rem 0.75rem';
        toChatBtn.style.borderRadius = '0.375rem';
        toChatBtn.style.cursor = 'pointer';
        toChatBtn.style.height = 'fit-content';
        toChatBtn.style.fontSize = '0.875rem';
        toChatBtn.style.transition = 'all 0.2s';
        toChatBtn.className = 'tm-to-chat-btn';

        toChatBtn.addEventListener('mouseover', () => {
            toChatBtn.style.background = '#404040';
        });

        toChatBtn.addEventListener('mouseout', () => {
            toChatBtn.style.background = '#2d2d2d';
        });

        toChatBtn.addEventListener('click', () => {
            const editor = document.querySelector('div.ProseMirror');
            if (editor) {
                editor.focus();
                const outputText = pre.textContent.trim();
                const codeText = `Execute:\n\`\`\`bash\n${commandText}\n\`\`\`\nResult:\n\`\`\`bash\n${outputText}\n\`\`\``;

                const p = document.createElement('p');
                p.textContent = codeText;
                editor.appendChild(p);
                
                // 移动光标到末尾
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                alert("⚠️ Could not find chat input box.");
            }
        });

        resultContainer.appendChild(pre);
        resultContainer.appendChild(toChatBtn);
        wrapper.appendChild(resultContainer);
        wrapper.classList.add('tm-run-output');

        return wrapper;
    }

    function addRunButtons() {
        const codeBlocks = document.querySelectorAll(LANG_SELECTOR);

        codeBlocks.forEach(code => {
            const container = code.closest('.contain-inline-size');
            if (!container || container.dataset.runButtonAdded) return;

            const toolbar = container.querySelector('div.absolute.bottom-0.right-0.flex');
            if (!toolbar) return;

            const runBtn = document.createElement('button');
            runBtn.textContent = 'Run';
            runBtn.style.marginLeft = '8px';
            runBtn.style.padding = '4px 12px';
            runBtn.style.background = '#2d2d2d';
            runBtn.style.color = '#b4b4b4';
            runBtn.style.border = '1px solid #404040';
            runBtn.style.borderRadius = '0.375rem';
            runBtn.style.cursor = 'pointer';
            runBtn.style.transition = 'all 0.2s';
            runBtn.className = 'tm-run-button';

            runBtn.addEventListener('mouseover', () => {
                runBtn.style.background = '#404040';
            });

            runBtn.addEventListener('mouseout', () => {
                runBtn.style.background = '#2d2d2d';
            });

            runBtn.addEventListener('click', () => {
                const codeText = code.innerText;

                const oldOutput = container.querySelector('.tm-run-output');
                if (oldOutput) oldOutput.remove();

                const placeholder = createOutputContainer('⏳ Running...', codeText);
                container.appendChild(placeholder);

                GM_xmlhttpRequest({
                    method: "POST",
                    url: "http://localhost:8080/run/",
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": "YOUR_SECRET_KEY"
                    },
                    data: JSON.stringify({ code: codeText }),
                    onload: function (response) {
                        const newOutput = createOutputContainer(response.responseText || '[No output]', codeText);
                        placeholder.replaceWith(newOutput);
                    },
                    onerror: function (error) {
                        const errText = '❌ Run failed:\n' + JSON.stringify(error);
                        const newOutput = createOutputContainer(errText, codeText);
                        placeholder.replaceWith(newOutput);
                    }
                });
            });

            toolbar.appendChild(runBtn);
            container.dataset.runButtonAdded = "true";
        });
    }

    const observer = new MutationObserver(() => addRunButtons());
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', addRunButtons);
    setInterval(addRunButtons, 2000);
})();

