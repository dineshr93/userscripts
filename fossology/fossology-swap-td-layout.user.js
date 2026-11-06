
// ==UserScript==
// @name         FOSSology - Swap Outer TD Once
// @namespace    fossology-layout
// @version      1.2
// @description  Swap File Listing and License Summary once
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    function swapOnce() {
        const dirlist = document.getElementById('dirlist');
        const histogram = document.getElementById('lichistogram');

        if (!dirlist || !histogram) return false;

        const firstTD = dirlist.closest('td');
        const secondTD = histogram.closest('td');

        if (!firstTD || !secondTD) return false;

        const row = firstTD.parentElement;

        if (row !== secondTD.parentElement) return false;

        // Prevent repeated swapping
        if (row.dataset.outerTdSwapped === 'true') return true;

        // Move second TD before first TD
        row.insertBefore(secondTD, firstTD);

        // Mark as completed
        row.dataset.outerTdSwapped = 'true';

        console.log('[FOSSology] Outer TD swap completed');

        return true;
    }

    // Wait for page content, then stop permanently
    let attempts = 0;

    const timer = setInterval(() => {
        attempts++;

        if (swapOnce() || attempts >= 40) {
            clearInterval(timer);
        }
    }, 250);

})();
