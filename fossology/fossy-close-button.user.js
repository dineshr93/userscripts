// ==UserScript==
// @name         Add External Closed Button
// @namespace    custom
// @version      1.0
// @description  Adds a Closed button next to the status dropdown
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addClosedButtons() {
        document.querySelectorAll('select[id^="Status1Of_"]').forEach(select => {
            if (select.dataset.closedButtonAdded) return;

            const closedOption = [...select.options].find(
                option => option.value === '3'
            );

            if (!closedOption) return;

            const button = document.createElement('button');
            button.textContent = 'Closed';
            button.type = 'button';
            button.style.cssText = `
                margin-left: 8px;
                padding: 4px 10px;
                cursor: pointer;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
            `;

            button.addEventListener('click', () => {
                select.value = '3';

                // Trigger the original onchange handler
                select.dispatchEvent(new Event('change', {
                    bubbles: true
                }));
            });

            select.insertAdjacentElement('afterend', button);
            select.dataset.closedButtonAdded = 'true';
        });
    }

    addClosedButtons();

    // Support dynamically loaded table rows
    new MutationObserver(addClosedButtons).observe(
        document.body,
        { childList: true, subtree: true }
    );
})();
