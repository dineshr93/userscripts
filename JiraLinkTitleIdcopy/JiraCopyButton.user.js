// ==UserScript==
// @name        JiraLinkTitleIdcopy
// @namespace   com.dinesh
// @description JiraLinkTitleIdcopy - Jira Link Title Id copy User Script
// @include     https://jira.*.com/*
// @version     9.6.1
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

    // Fetch meta information
    userLogin = unsafeWindow.JIRA.Users.LoggedInUser.userName();

    // Initial execution
    identifyPageAndExecuteScripts();

    // Bind to Jira events
    unsafeWindow.JIRA.bind(unsafeWindow.JIRA.Events.ISSUE_REFRESHED, unsafeWindow.identifyPageAndExecuteScripts);
    unsafeWindow.JIRA.bind(unsafeWindow.JIRA.Events.INLINE_EDIT_STARTED, unsafeWindow.identifyPageAndExecuteScripts);
    unsafeWindow.JIRA.bind(unsafeWindow.JIRA.Events.INLINE_EDIT_SAVE_COMPLETE, unsafeWindow.identifyPageAndExecuteScripts);
    unsafeWindow.JIRA.bind(unsafeWindow.JIRA.Events.NEW_CONTENT_ADDED, unsafeWindow.identifyPageAndExecuteScripts);
    unsafeWindow.JIRA.bind(unsafeWindow.JIRA.Events.NEW_PAGE_ADDED, unsafeWindow.identifyPageAndExecuteScripts);
    unsafeWindow.JIRA.bind(unsafeWindow.JIRA.Events.PANEL_REFRESHED, unsafeWindow.identifyPageAndExecuteScripts);
    unsafeWindow.JIRA.bind(unsafeWindow.JIRA.Events.REFRESH_ISSUE_PAGE, unsafeWindow.identifyPageAndExecuteScripts);
    unsafeWindow.JIRA.bind(unsafeWindow.JIRA.Events.REFRESH_TOGGLE_BLOCKS, unsafeWindow.identifyPageAndExecuteScripts);
    unsafeWindow.JIRA.bind(unsafeWindow.JIRA.Events.UNLOCK_PANEL_REFRESHING, unsafeWindow.identifyPageAndExecuteScripts);

});

// Identify Page and execute corresponding scripts
function identifyPageAndExecuteScripts() {
    if ($("#dashboard").length) {
        modifyDashboard();
    }
    else if ($("#content > .navigator-container").length) {
        unsafeWindow.JIRA.ViewIssueTabs.onTabReady(unsafeWindow.identifyPageAndExecuteScripts);

        modifyNavigator();
    }
    else if ($("#issue-content").length) {
        unsafeWindow.JIRA.ViewIssueTabs.onTabReady(unsafeWindow.identifyPageAndExecuteScripts);

        modifyIssue();
    }
}

// Export the identification function to the website itself to make it accessible for the JIRA events.
unsafeWindow.identifyPageAndExecuteScripts = exportFunction(identifyPageAndExecuteScripts, unsafeWindow);

// Modify the dashboard view
function modifyDashboard() {
}

// Modify the navigator issue view
function modifyNavigator() {
    setTimeout(
        function () {

            addCopyIssueIdButton();
        },
        100);
}

// Modify the plain issue view
function modifyIssue() {

    addCopyIssueIdButton();

}
// Adding a button which copies a special formatted issue Id to the clipboard
function addCopyIssueIdButton() {
    if (!$("#titlecopyButton").length) {
        var target = $("#summary-val");

        var plainCopy = $("<input />", {
            "type": "button",
            "value": "Title",
            "id": "titlecopyButton",
            "title": "Copy ID and Name to Clipboard",
            "data-clipboard-text": "[" + unsafeWindow.JIRA.Issue.getIssueKey().trim() + "] " + $("#summary-val").text().trim(),
            "class": "aui-button"
        });

        target.after(plainCopy);

        new Clipboard('#titlecopyButton');
    }

    if (!$("#idCopyButton").length) {
        var target = $("#summary-val");

        var plainCopy = $("<input />", {
            "type": "button",
            "value": "Id",
            "id": "idCopyButton",
            "title": "Copy ID to Clipboard",
            "data-clipboard-text": "" + unsafeWindow.JIRA.Issue.getIssueKey().trim() + "",
            "class": "aui-button"
        });

        target.after(plainCopy);

        new Clipboard('#idCopyButton');
    }

    if (!$("#linkCopyButton").length) {
        var target = $("#summary-val");
        let currentUrl = window.location.href;

        var plainCopy = $("<input />", {
            "type": "button",
            "value": "Link",
            "id": "linkCopyButton",
            "title": "Copy Link to Clipboard",
            "data-clipboard-text": currentUrl,
            "class": "aui-button"
        });

        target.after(plainCopy);

        new Clipboard('#linkCopyButton');
    }


    if (!$("#allCopyButton").length) {
        var target = $("#summary-val");
        let currentUrl = window.location.href;

        var plainCopy = $("<input />", {
            "type": "button",
            "value": "All",
            "id": "allCopyButton",
            "title": "Copy All to Clipboard",
            "data-clipboard-text": "[" + unsafeWindow.JIRA.Issue.getIssueKey().trim() + "] " + $("#summary-val").text().trim() + " " + currentUrl,
            "class": "aui-button"
        });

        target.after(plainCopy);

        new Clipboard('#allCopyButton');
    }
}