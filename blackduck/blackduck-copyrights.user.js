
// ==UserScript==
// @name         Black Duck - Copyrights + Copy quick buttons
// @namespace    blackduck-copyrights
// @version      1.7
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
        'width:18px;height:18px;border-radius:9px;font-size:11px;line-height:1;' +
        'border:1px solid rgba(0,0,0,.1);background:rgba(0,0,0,.05);' +
        'color:#333;font-weight:700;text-decoration:none;cursor:pointer;padding:0;';

    // Always retrieve the latest copyright URL from the row.
    function getCopyrightUrl(row) {
        const src = row.querySelector('a[href*="bomComponents:"]');
        if (!src) return null;

        try {
            const encoded = src.href.split('bomComponents:')[1].split('&')[0];
            const base = atob(decodeURIComponent(encoded));

            if (!/\/api\/components\/[^/]+\/versions\/[^/]+/.test(base))
                return null;

            return base + '/origins';
        } catch (e) {
            return null;
        }
    }

    // Copyright button: update existing button or create one.
    function addC(row) {
        const url = getCopyrightUrl(row);
        let a = row.querySelector('.bd-copyright-btn');

        if (!url) {
            if (a) a.remove();
            return;
        }

        if (!a) {
            a = document.createElement('a');
            a.className = 'bd-copyright-btn';
            a.target = '_blank';
            a.rel = 'noopener';
            a.title = 'Copyrights';
            a.textContent = 'C';
            a.style.cssText = STYLE + 'display:flex;margin:0 0 2px 0;';

            const src = row.querySelector('a[href*="bomComponents:"]');
            if (src) src.parentNode.insertBefore(a, src);
        }

        if (a.href !== url) a.href = url;
    }

    // Always recalculate current component name and version.
    function getComponentInfo(row) {
        const th = row.querySelector('th');
        const strong = th && th.querySelector('strong');

        if (!strong) return null;

        const name = strong.textContent.trim();
        const spans = th.querySelectorAll('span');
        const version = (spans[spans.length - 1]?.textContent || '').trim();

        if (!name || !version || version === name) return null;

        return { name, version };
    }

    // Copy button: update existing button or create one.
    function addT(row) {
        const info = getComponentInfo(row);
        let b = row.querySelector('.bd-copy-btn');

        if (!info) {
            if (b) b.remove();
            return;
        }

        if (!b) {
            b = document.createElement('button');
            b.type = 'button';
            b.className = 'bd-copy-btn';
            b.textContent = 'T';
            b.style.cssText = STYLE + 'margin-left:6px;vertical-align:middle;';

            b.addEventListener('click', async e => {
                e.preventDefault();
                e.stopPropagation();

                // Read latest values at click time.
                const currentRow = b.closest('tr');
                const current = currentRow && getComponentInfo(currentRow);

                if (!current) return;

                const text = current.name + ' ' + current.version;

                try {
                    await navigator.clipboard.writeText(text);
                } catch (err) {
                    const t = document.createElement('textarea');
                    t.value = text;
                    t.style.cssText = 'position:fixed;opacity:0;';
                    document.body.appendChild(t);
                    t.select();
                    document.execCommand('copy');
                    t.remove();
                }

                b.textContent = '✓';
                setTimeout(() => {
                    if (b.isConnected) b.textContent = 'T';
                }, 1000);
            });

            const th = row.querySelector('th');
            if (th) th.appendChild(b);
        }

        b.title = 'Copy: ' + info.name + ' ' + info.version;
    }

    function processRow(row) {
        if (!row || !row.matches('tr')) return;

        try {
            addC(row);
            addT(row);
        } catch (e) {
            console.error('[BD-btns] Row update error:', e);
        }
    }

    function run() {
        if (!isBD() || !location.pathname.includes('/components')) return;

        document.querySelectorAll('table tbody tr').forEach(processRow);
    }

    let timer = null;
    let scheduled = false;

    function scheduleRun() {
        if (scheduled) return;

        scheduled = true;

        clearTimeout(timer);
        timer = setTimeout(() => {
            scheduled = false;
            run();
        }, 200);
    }

    const observer = new MutationObserver(mutations => {
        let relevant = false;

        for (const mutation of mutations) {
            // Ignore mutations generated by our own buttons.
            if (
                mutation.target.nodeType === 1 &&
                mutation.target.closest?.('.bd-copyright-btn, .bd-copy-btn')
            ) continue;

            if (
                mutation.target.nodeType === 3 &&
                mutation.target.parentElement?.closest('.bd-copyright-btn, .bd-copy-btn')
            ) continue;

            relevant = true;
            break;
        }

        if (relevant) scheduleRun();
    });

    function observe() {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['href']
        });
    }

    if (isBD()) {
        observe();
        run();
        console.log('[BD-btns] v1.7 loaded - dynamic row updates enabled');
    }
})();
