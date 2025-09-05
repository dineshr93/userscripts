// ==UserScript==
// @name        BlackDuck Copy Button
// @namespace   com.dinesh
// @description Adds a copy button to BlackDuck breadcrumbs that copies project, version, and API URL without
// @version     9.6.1
// @include     https://blackduck*.com/api/projects/*/versions/*
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
    if ($("main#appContent").length) {
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
    if (!$("#copyButton").length) {
        //var target = $("nav[aria-label='Breadcrumbs']");
        var target = $("h1 nav[aria-label='Breadcrumbs'] ol")
        // get base URL without query string
        var baseUrl = window.location.href.split("?")[0];
        var parts = baseUrl.split("/");
        parts[parts.length - 1] = "components"; // replace last segment
        baseUrl = parts.join("/");

        var projectName = $("h1 nav[aria-label='Breadcrumbs'] ol li:first-child a").text().trim();
        var versionName = $("h1 nav[aria-label='Breadcrumbs'] ol li[aria-current='page'] span").text().trim();
        if (!projectName || !versionName) return;
        //var projectName = pn.textContent.trim()

        const textToCopy =
            `Project: ${projectName}
Version: ${versionName}
URL: ${baseUrl}`;

        var plainCopy = $("<input />", {
            "type": "button",
            "value": "Copy",
            "id": "copyButton",
            "title": "Copy ID and Name to Clipboard",
            "data-clipboard-text": textToCopy,
            "style": "font-size: 10px; padding: 2px 6px;" // inline styling for small size
        });

        target.after(plainCopy);

        new Clipboard('#copyButton');
    }
}
