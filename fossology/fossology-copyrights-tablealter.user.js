
// ==UserScript==
// @name         FOSSology - Copyright History Column Reorder
// @namespace    fossology-copyrights
// @version      9.0
// @description  Checkbox first, Delete second, Findings third, Count last
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    if (new URLSearchParams(location.search).get('mod') !== 'copyright-hist') {
        return;
    }

    const TABLE_ID = 'copyrightstatement';
    let timer;

    function reorderRow(row) {
        if (row.dataset.fossologyReordered === 'true') return;

        const cells = row.children;
        if (cells.length !== 4) return;

        // Original: Count | Findings | Delete | Checkbox
        // Target:   Checkbox | Delete | Findings | Count

        const [count, findings, action, checkbox] = [...cells];

        row.appendChild(checkbox);
        row.insertBefore(checkbox, row.firstChild);

        row.insertBefore(action, findings);
        row.appendChild(count);

        row.dataset.fossologyReordered = 'true';
    }

    function apply() {
        const table = document.getElementById(TABLE_ID);
        if (!table) return;

        table.querySelectorAll('tr').forEach(reorderRow);
    }

    function schedule() {
        clearTimeout(timer);
        timer = setTimeout(apply, 150);
    }

    const observer = new MutationObserver(schedule);

    function init() {
        apply();

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        if (window.jQuery) {
            window.jQuery('#' + TABLE_ID).on('draw.dt', schedule);
        }
    }

    init();

    console.log('[FOSSology] Column reorder v9.0 loaded');
})();
