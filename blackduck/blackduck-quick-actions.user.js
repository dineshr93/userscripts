
// ==UserScript==
// @name         Black Duck - Quick Edit + Deactivate
// @namespace    blackduck-quick-actions
// @version      1.0
// @description  Adds quick Edit and Deactivate buttons beside More Actions
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const isBD = () =>
        /Black Duck/i.test(document.title) ||
        !!document.getElementById('blackduck-app');

    const STYLE =
        'display:inline-flex;align-items:center;justify-content:center;' +
        'width:18px;height:18px;border-radius:9px;font-size:11px;' +
        'line-height:1;border:1px solid rgba(0,0,0,.15);' +
        'background:rgba(0,0,0,.05);color:#333;font-weight:700;' +
        'cursor:pointer;padding:0;margin-right:3px;';

    function createButton(label, title, color, action) {
        const btn = document.createElement('button');

        btn.type = 'button';
        btn.className = 'bd-quick-' + label.toLowerCase();
        btn.textContent = label;
        btn.title = title;
        btn.style.cssText = STYLE + color;

        btn.addEventListener('click', async e => {
            e.preventDefault();
            e.stopPropagation();

            try {
                await action(btn);
            } catch (err) {
                console.error('[BD-QuickActions]', err);
            }
        });

        return btn;
    }

    function findMenuButton(menu) {
        return [...menu.querySelectorAll('button')]
            .find(b => b.textContent.trim().toLowerCase() ===
                menu.dataset.bdAction);
    }

    async function executeAction(moreBtn, action, quickBtn) {
        // Close any previously opened menu
        moreBtn.click();

        // Wait for Black Duck to render its floating menu
        const menu = await waitForMenu(moreBtn);

        if (!menu) {
            console.warn('[BD-QuickActions] Menu not found:', action);
            return;
        }

        const target = [...menu.querySelectorAll(
            '[role="menuitem"] button'
        )].find(b =>
            b.textContent.trim().toLowerCase() === action.toLowerCase()
        );

        if (!target) {
            console.warn('[BD-QuickActions] Action not found:', action);
            return;
        }

        // Execute the original Black Duck action
        target.click();
    }

    function waitForMenu(moreBtn, timeout = 2000) {
        return new Promise(resolve => {
            const start = Date.now();

            const check = () => {
                const menu = [...document.querySelectorAll(
                    '[data-floating-ui-portal] ul[role="menu"]'
                )].find(m =>
                    m.getAttribute('aria-labelledby') === moreBtn.id
                );

                if (menu) {
                    resolve(menu);
                    return;
                }

                if (Date.now() - start > timeout) {
                    resolve(null);
                    return;
                }

                requestAnimationFrame(check);
            };

            check();
        });
    }

    function addButtons(moreBtn) {
        if (moreBtn.dataset.bdQuickAdded) return;

        moreBtn.dataset.bdQuickAdded = '1';

        const edit = createButton(
            'E',
            'Edit',
            'background:#e8f2ff;color:#1765b1;',
            btn => executeAction(moreBtn, 'Edit', btn)
        );

        const deactivate = createButton(
            'D',
            'Deactivate',
            'background:#fff0e8;color:#b44b16;',
            btn => executeAction(moreBtn, 'Deactivate', btn)
        );

        moreBtn.parentNode.insertBefore(edit, moreBtn);
        moreBtn.parentNode.insertBefore(deactivate, moreBtn);
    }

    function run() {
        if (!isBD()) return;

        document.querySelectorAll(
            'button[title="More Actions"][aria-haspopup="menu"]'
        ).forEach(btn => {
            try {
                addButtons(btn);
            } catch (e) {
                console.error('[BD-QuickActions]', e);
            }
        });
    }

    let timer;

    const observer = new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(run, 250);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    run();

    console.log('[BD-QuickActions] v1.0 loaded');
})();
