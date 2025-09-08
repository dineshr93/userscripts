// ==UserScript==
// @name        jenkins blackduck Button
// @namespace   com.dinesh
// @description Adds a copy button to BlackDuck breadcrumbs that copies project, version, and API URL without
// @version     9.6.1
// @include     https://*jenkins*/job/*/console
// @include     https://*jenkins*/job/*
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
    if ($(".jenkins-app-bar__content.jenkins-build-caption").length) {
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
    var target = $("h1");

    if (!$("#bdButton").length) {
        // get base URL without query string
        var asterix3dplusby = "https://blackduck.com/api/projects/5c-1f928";
        var asterix3d = "https://blackduck.com/api/projects/bfc73-9ba8-4729-aea4-58c8dea6af40";
        var shmaosp = "https://blackduck.com/api/projects/2d-2492-4295-86ee-80130310d44b";
        var shmac = "https://blackduck.com/api/projects/b5d1-43f4-ab43-1acb70500b53";
        var shmqnx = "https://blackduck.com/api/projects/5ed50-97ff-95adb5652682";
        var pcaosp = "https://blackduck.com/api/projects/0e06b-a6d4-1efb8578be4e";
        var pcac = "https://blackduck.com/api/projects/3f02b5ac-5a3-7ed8580352da";
        var pcqnx = "https://blackduck.com/api/projects/6cc9-9d30-0e9e7dfdc9e6";
        var cibaosp = "https://blackduck.com/api/projects/4cda-9302-c888ad562024";
        var cibac = "https://blackduck.com/api/projects/b-a40d-5210e042feab";
        var bdUrl = "https://infohub.automotive.elektrobit.com/";
        if (baseUrl.includes("pj1OSS_SCAN_c3d_plus")) {
            bdUrl = asterix3dplusby;
        } else if (baseUrl.includes("pj1OSS_SCAN_Variants")) {
            bdUrl = asterix3d;
        } else if (baseUrl.includes("pj3FOSS_SCAN")) {
            bdUrl = shmaosp;
        } else if (baseUrl.includes("qnx_foss_scan")) {
            bdUrl = shmqnx;
        } else if (baseUrl.includes("pj3oss_AC")) {
            bdUrl = shmac;
        } else if (baseUrl.includes("pj531_0_OSS_GC_AOSP")) {
            bdUrl = pcaosp;
        } else if (baseUrl.includes("pj5oss_AC")) {
            bdUrl = pcac;
        } else if (baseUrl.includes("qnx_foss_scan")) {
            bdUrl = pcqnx;
        } else if (baseUrl.includes("pj2OSS_AC_4m_3")) {
            bdUrl = cibac;
        } else if (baseUrl.includes("pj2OSS")) {
            bdUrl = cibaosp;
        }
        var plainBd = $("<input />", {
            "type": "button",
            "value": "Blackduck",
            "id": "bdButton",
            "title": "BD URL",
            "data-clipboard-text": bdUrl,
            "style": "font-size: 10px; padding: 2px 6px;" // inline styling for small size
        });
        // Attach click event to redirect
        plainBd.on("click", function () {
            window.open(bdUrl);
        });

        target.after(plainBd);

        new Clipboard('#bdButton');
    }
}
