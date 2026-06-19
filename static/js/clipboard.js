document.addEventListener('DOMContentLoaded', function() {
    function copyToClipboard(text, button) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function() {
                showCopySuccess(button);
            }).catch(function(err) {
                console.error('Clipboard API failed:', err);
                fallbackCopyTextToClipboard(text, button);
            });
        } else {
            fallbackCopyTextToClipboard(text, button);
        }
    }

    function fallbackCopyTextToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.style.opacity = '0';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess(button);
            } else {
                showCopyError(button);
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            showCopyError(button);
        }
        
        document.body.removeChild(textArea);
    }

    function showCopySuccess(button) {
        const originalContent = button.innerHTML;
        button.innerHTML = '✅ Copied!';
        button.classList.add('copied');
        
        setTimeout(function() {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
        }, 2000);
    }

    function showCopyError(button) {
        const originalContent = button.innerHTML;
        button.innerHTML = '❌ Failed';
        button.classList.add('error');
        
        setTimeout(function() {
            button.innerHTML = originalContent;
            button.classList.remove('error');
        }, 2000);
    }

    const codeBlocks = document.querySelectorAll('pre code');

    // data-shell なブロックの行頭プロンプト記号を span で囲んで色付け
    codeBlocks.forEach(function(codeBlock) {
        if (!codeBlock.dataset.shell) return;
        codeBlock.innerHTML = codeBlock.textContent.split('\n').map(function(line) {
            return line.replace(/^([$#])( )/, '<span class="prompt">$1</span>$2');
        }).join('\n');
    });

    codeBlocks.forEach(function(codeBlock) {
        const pre = codeBlock.parentNode;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '📋 Copy';
        copyButton.setAttribute('aria-label', 'Copy code to clipboard');
        copyButton.setAttribute('type', 'button');
        
        copyButton.addEventListener('click', function(e) {
            e.preventDefault();
            const raw = codeBlock.textContent || codeBlock.innerText;
            const code = codeBlock.dataset.shell
                ? raw.split('\n').map(function(line) {
                    return line.replace(/^[$#] /, '');
                }).join('\n')
                : raw;
            copyToClipboard(code, copyButton);
        });
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
    });
});
