// ==UserScript==
// @name         Black Duck - Review Status Quick Filter
// @namespace    blackduck-review-status
// @version      1.0
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const BTN_ID = 'bd-rs-btn';

    const STYLE =
        'display:inline-flex;' +
        'align-items:center;' +
        'justify-content:center;' +
        'margin-left:6px;' +
        'padding:0 8px;' +
        'height:32px;' +
        'border:1px solid #ccc;' +
        'border-radius:4px;' +
        'cursor:pointer;' +
        'font-weight:600;' +
        'background:#fff;';

    function findFilterButton() {
        return [...document.querySelectorAll('button')]
            .find(b =>
                b.querySelector('span')?.textContent?.trim() === 'Filter'
            );
    }

    function findReviewStatusButton() {
        return [...document.querySelectorAll('#blackduck-menus button')]
            .find(b =>
                b.textContent.trim() === 'Review Status'
            );
    }

    async function openReviewStatusFilter() {
        const filterBtn = findFilterButton();

        if (!filterBtn) {
            console.log('[BD-RS] Filter button not found');
            return;
        }

        filterBtn.click();

        let tries = 0;

        const interval = setInterval(() => {
            const reviewBtn = findReviewStatusButton();

            if (reviewBtn) {
                clearInterval(interval);
                reviewBtn.click();
                console.log('[BD-RS] Review Status clicked');
            }

            if (++tries > 30) {
                clearInterval(interval);
                console.log('[BD-RS] Review Status menu item not found');
            }
        }, 100);
    }

    function addRSButton() {
        const filterBtn = findFilterButton();

        if (!filterBtn) return;

        if (document.getElementById(BTN_ID)) return;

        const btn = document.createElement('button');
        btn.id = BTN_ID;
        btn.type = 'button';
        btn.textContent = 'RS';
        btn.title = 'Review Status Filter';
        btn.style.cssText = STYLE;

        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            openReviewStatusFilter();
        });

        filterBtn.insertAdjacentElement('afterend', btn);
    }

    function run() {
        addRSButton();
    }

    const observer = new MutationObserver(() => {
        run();
    });

    observer.observe(document.body, {
        subtree: true,
        childList: true
    });

    run();

    console.log('[BD-RS] Loaded');
})();
