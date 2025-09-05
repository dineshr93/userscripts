// ==UserScript==
// @name        GitCloneCopy
// @namespace   com.dinesh
// @description GitCloneCopy - Adds git clone to copy command in git repository page
// @include     https://github.com/*/*
// @include     https://git.*.com/*/*
// @include     https://gitext.*.com/*/*
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
    if ($("#repo-title-component").length) {
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
    let currentUrl = window.location.href;
    let cloneCommand = "";
    let sshClone = "";

    // Remove any trailing slashes
    if (currentUrl.endsWith("/")) {
        currentUrl = currentUrl.slice(0, -1);
    }

    if (currentUrl.includes("/tree/")) {
        // Split repo and branch
        let [repoUrl, branchName] = currentUrl.split("/tree/");
        cloneCommand = `git clone ${repoUrl}.git -b ${branchName}`;

        // Convert repoUrl to ssh
        sshClone = repoUrl
            .replace("https://", "git@")     // replace protocol
            .replace("/", ":", 1) + ".git";  // first slash after host becomes :
        sshClone = `git clone ${sshClone} -b ${branchName}`;
    } else {
        cloneCommand = `git clone ${currentUrl}.git`;

        sshClone = currentUrl
            .replace("https://", "git@")
            .replace("/", ":", 1) + ".git";
        sshClone = `git clone ${sshClone}`;
    }
    if (!$("#titlecopyButton").length) {
        var target = $("#repo-title-component");

        var plainCopy = $("<button>", {
            text: "https Clone",
            id: "titlecopyButton",
            title: "Copy ID and Name to Clipboard",
            "data-clipboard-text": cloneCommand
        });

        target.after(plainCopy);

        new Clipboard('#titlecopyButton');
    }

    if (!$("#sshcopyButton").length) {
        target = $("#repo-title-component");

        plainCopy = $("<button>", {
            text: "SSH Clone",
            id: "sshcopyButton",
            title: "Copy ID and Name to Clipboard",
            "data-clipboard-text": sshClone
        });

        target.after(plainCopy);

        new Clipboard('#sshcopyButton');
    }
}