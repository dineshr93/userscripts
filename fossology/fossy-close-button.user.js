
// ==UserScript==
// @name         Quick Close - Auto Comment
// @namespace    custom
// @version      3.0
// @description  Close status with automatic Done comment
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addClosedButtons() {
        document.querySelectorAll('select[id^="Status1Of_"]').forEach(select => {
            if (select.dataset.closedButtonAdded) return;

            if (![...select.options].some(o => o.value === '3')) return;

            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Closed';

            button.style.cssText = `
                margin-left: 8px;
                padding: 4px 10px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;

            button.addEventListener('click', () => {
                // Start watching for the comment modal
                let attempts = 0;
                let submitted = false;

                select.value = '3';

                // Trigger original onchange function
                select.dispatchEvent(new Event('change', {
                    bubbles: true
                }));

                const timer = setInterval(() => {
                    attempts++;

                    if (submitted || attempts > 150) {
                        clearInterval(timer);
                        return;
                    }

                    // Find the correct visible comment modal
                    const modal = [...document.querySelectorAll('.modal-content')]
                        .find(m => {
                            const title = m.querySelector('.modal-title');
                            return title &&
                                title.textContent.trim() === 'Enter Comment' &&
                                m.getClientRects().length > 0 &&
                                getComputedStyle(m).visibility !== 'hidden';
                        });

                    if (!modal) return;

                    const textarea = modal.querySelector('#commentText');

                    const okButton = [...modal.querySelectorAll('.modal-footer button')]
                        .find(b => b.textContent.trim().toLowerCase() === 'ok');

                    if (!textarea || !okButton || okButton.disabled) return;

                    // Fill comment
                    const setter = Object.getOwnPropertyDescriptor(
                        HTMLTextAreaElement.prototype, 'value'
                    ).set;

                    setter.call(textarea, 'Done');

                    textarea.dispatchEvent(new Event('input', {
                        bubbles: true
                    }));

                    textarea.dispatchEvent(new Event('change', {
                        bubbles: true
                    }));

                    submitted = true;
                    clearInterval(timer);

                    // Automatically submit
                    setTimeout(() => {
                        okButton.click();
                    }, 300);

                }, 100);
            });

            select.insertAdjacentElement('afterend', button);
            select.dataset.closedButtonAdded = 'true';
        });
    }

    addClosedButtons();

    // Support dynamically loaded table rows
    new MutationObserver(addClosedButtons).observe(document.body, {
        childList: true,
        subtree: true
    });

})();
