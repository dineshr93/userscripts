// ==UserScript==
// @name        Fossology license copy Button
// @namespace   com.dinesh
// @description Adds a copy button to Fossology breadcrumbs that copies copyright
// @version     9.6.2
// @include     https://*fossology*?mod=view-license&upload=*
// @include     https://fossology*/repo/?mod=copyright-view&agent=*&upload=*&item=*
// @include     https://fossology*/repo/?mod=view-license&pfile=*&upload=*&item=*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @require     https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.0/jquery-ui.min.js
// @require     https://cdn.rawgit.com/zenorocha/clipboard.js/v1.5.12/dist/clipboard.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// ==/UserScript==

$(document).ready(function () {
    'use strict';
    identifyPageAndExecuteScripts();
    document.addEventListener('pjax:end', identifyPageAndExecuteScripts);
    var observer = new MutationObserver(function () {
        identifyPageAndExecuteScripts();
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

function identifyPageAndExecuteScripts() {
    // updated selector for new bootstrap classes (btn-light)
    if ($("button.legendHider.btn.btn-light.btn-sm").length) {
        modifyDashboard();
    }
}

unsafeWindow.identifyPageAndExecuteScripts = exportFunction(identifyPageAndExecuteScripts, unsafeWindow);

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

function addCopyIssueIdButton() {
    var target = $("button.legendHider.btn.btn-light.btn-sm");
    if (!$("#bdButton").length && target.length) {
        const collated_copyrights = extractTextFromBoxNew();
        if (!collated_copyrights) {
            console.log("No copyrights found");
            return;
        }
        console.log(collated_copyrights);

        var plainBd = $("<input />", {
            "type": "button",
            "value": "Copy license",
            "id": "bdButton",
            "title": "Copy license to clipboard",
            "data-clipboard-text": collated_copyrights,
            "style": "font-size: 10px; padding: 2px 6px; margin-right: 4px;"
        });
        target.before(plainBd);
        new Clipboard('#bdButton');
    }
}
