// ==UserScript==
// @name        Fossology license copy Button
// @namespace   com.dinesh
// @description Adds a copy button to Fossology breadcrumbs that copies copyright
// @version     9.6.1
// @include     https://*fossology*?mod=view-license&upload=*
// @include     https://fossology*/repo/?mod=copyright-view&agent=*&upload=*&item=*
// @include     https://fossology*/repo/?mod=view-license&pfile=*&upload=*&item=*
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
    if ($("#leftrightalignment > table > tbody > tr > td:nth-child(1) > div.centered > button.legendHider.btn.btn-default.btn-sm").length) {

        modifyDashboard();
    }
}
// Export the identification function to the website itself to make it accessible for the JIRA events.
unsafeWindow.identifyPageAndExecuteScripts = exportFunction(identifyPageAndExecuteScripts, unsafeWindow);

// Modify the dashboard view
function modifyDashboard() {
    addCopyIssueIdButton();
}

function extractTextFromBoxNew() {
    const boxNewElement = document.querySelector('.boxnew');

    if (boxNewElement) {
        return boxNewElement.innerText.trim();
    }

    return '';
}

// Adding a button which copies a special formatted issue Id to the clipboard
function addCopyIssueIdButton() {
    // get base URL without query string
    var baseUrl = window.location.href;
    console.log(baseUrl);
    var target = $("#leftrightalignment > table > tbody > tr > td:nth-child(1) > div.centered > button.legendHider.btn.btn-default.btn-sm");

    if (!$("#bdButton").length) {
        const collated_copyrights = extractTextFromBoxNew();
        //console.log(collated_copyrights);

        if (collated_copyrights) {
            console.log(collated_copyrights);
        } else {
            console.log("No copyrights found");
            return;
        }

        var plainBd = $("<input />", {
            "type": "button",
            "value": "Copy license",
            "id": "bdButton",
            "title": "Copy license to clipboard",
            "data-clipboard-text": collated_copyrights,
            "style": "font-size: 10px; padding: 2px 6px;" // inline styling for small size
        });

        target.before(plainBd);

        new Clipboard('#bdButton');
    }
}
