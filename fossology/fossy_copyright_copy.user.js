// ==UserScript==
// @name        Fossology copyright copy Button
// @namespace   com.dinesh
// @description Adds a copy button to Fossology breadcrumbs that copies copyright
// @version     9.6.1
// @include     https://*fossology*?mod=copyright-hist*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @require     https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.0/jquery-ui.min.js
// @require     https://cdn.rawgit.com/zenorocha/clipboard.js/v1.5.12/dist/clipboard.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @grant GM_xmlhttpRequest
// ==/UserScript==


// Startup
$(document).ready(function () {
    'use strict';
    // Initial execution
    identifyPageAndExecuteScripts();

    // GitHub does not provide custom events like Jira. Instead, use MutationObserver and navigation events (pjax:end) to detect page changes.
    // Listen for GitHub's pjax:end event (triggered on partial page navigation)
    document.addEventListener('pjax:end', identifyPageAndExecuteScripts);

    // Use MutationObserver to detect DOM changes (e.g., repo page updates)
    var targetNode = document.body;
    var observer = new MutationObserver(function (mutationsList, observer) {
        identifyPageAndExecuteScripts();
    });
    observer.observe(targetNode, { childList: true, subtree: true });

});

// Identify Page and execute corresponding scripts
function identifyPageAndExecuteScripts() {
    if ($("#ui-id-1").length) {
        modifyDashboard();
    }
}
// Export the identification function to the website itself to make it accessible for the JIRA events.
unsafeWindow.identifyPageAndExecuteScripts = exportFunction(identifyPageAndExecuteScripts, unsafeWindow);

// Modify the dashboard view
function modifyDashboard() {
    addCopyIssueIdButton();


}

// Adding a button which copies a special formatted issue Id to the clipboard
function addCopyIssueIdButton() {
    // get base URL without query string
    var baseUrl = window.location.href;
    console.log(baseUrl);
    var target = $("#copyrightstatement_length");

    if (!$("#bdButton").length) {
        const collated_copyrights = $('#copyrightstatement_wrapper table tbody td.left.sorting_2,#copyrightstatement_wrapper table tbody td.left.sorting_1') // Selects grandchildren 'td.left.sorting_2, td.left.sorting_1') // Matches both td.left.sorting_2 and td.left.sorting_1
            .map(function () {
                return $(this).text().trim();
            })
            .get()
            .join(',');


        if (collated_copyrights) {
            console.log(collated_copyrights);
        } else {
            console.log("No copyrights found");
            return;
        }

        var plainBd = $("<input />", {
            "type": "button",
            "value": "Copy Copyrights",
            "id": "bdButton",
            "title": "Copy copyrights to clipboard",
            "data-clipboard-text": collated_copyrights,
            "style": "font-size: 10px; padding: 2px 6px;" // inline styling for small size
        });

        target.after(plainBd);

        new Clipboard('#bdButton');
    }
}
