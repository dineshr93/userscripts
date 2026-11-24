// ==UserScript==
// @name        BlackDuck Copy Button
// @namespace   com.dinesh
// @description Adds a copy button to BlackDuck breadcrumbs that copies project, version, and API URL without
// @version     9.6.1
// @include     https://blackduck*.com/api/projects/*/versions/*
// @include https://blackduck*.com/api/projects/*/versions/*
// @include https://osrb-tools.com/job/*
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

    if (location.hostname.includes("osrb-tools.com")) {
        populateJenkinsParameters();
        return;
    }

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
function createUrlButton(id, label, url, target) {
    if (!$("#" + id).length) {

        var btn = $("<input />", {
            type: "button",
            value: label,
            id: id,
            title: url,
            style: "font-size: 10px; padding: 2px 6px;"
        });

        btn.on("click", function () {

            var projectName = $("h1 nav[aria-label='Breadcrumbs'] ol li:first-child a")
                .text().trim();

            var versionName = $("h1 nav[aria-label='Breadcrumbs'] ol li[aria-current='page'] span")
                .text().trim();

            GM_setValue("PROJECT_NAME", projectName);
            GM_setValue("PROJECT_VERSION", versionName);

            window.open(url, "_blank");
        });

        target.after(btn);
    }
}
function populateJenkinsParameters() {

    var projectName = GM_getValue("PROJECT_NAME", "");
    var projectVersion = GM_getValue("PROJECT_VERSION", "");

    if (!projectName || !projectVersion) {
        return;
    }

    $("div[name='parameter']").each(function () {

        var parameterName = $(this)
            .find("input[name='name']")
            .val();

        var valueField = $(this)
            .find("input[name='value']");

        if (parameterName === "PROJECT_NAME") {
            valueField.val(projectName).trigger("input").trigger("change");
        }

        if (parameterName === "PROJECT_VERSION") {
            valueField.val(projectVersion).trigger("input").trigger("change");
        }
    });
}
// Adding a button which copies a special formatted issue Id to the clipboard
function addCopyIssueIdButton() {
    // get base URL without query string
    var baseUrl = window.location.href.split("?")[0];
    var target = $("h1 nav[aria-label='Breadcrumbs'] ol")
    var projectName = $("h1 nav[aria-label='Breadcrumbs'] ol li:first-child a").text().trim();
    if (!$("#copyButton").length) {
        //var target = $("nav[aria-label='Breadcrumbs']");

        var parts = baseUrl.split("/");
        parts[parts.length - 1] = "components"; // replace last segment
        baseUrl = parts.join("/");

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
    if (!$("#titleButton").length) {
    var titleVersion = $("h1 nav[aria-label='Breadcrumbs'] ol li[aria-current='page'] span").text().trim();
    if (projectName && titleVersion) {
        var plainTitle = $("<input />", {
            "type": "button",
            "value": "title",
            "id": "titleButton",
            "title": "Copy title only",
            "data-clipboard-text": `${projectName} - ${titleVersion}`,
            "style": "font-size: 10px; padding: 2px 6px;"
        });
        target.after(plainTitle);
        new Clipboard('#titleButton');
    }
// Unreviewed sync jobs
createUrlButton(
    "npmButton",
    "NPM",
    "https://osrb-tools.com/job/bd_to_fossy_to_bd_npm_unreviewed/build",
    target
);

createUrlButton(
    "cratesButton",
    "CRATES",
    "https://osrb-tools.com/job/bd_to_fossy_to_bd_crates_unreviewed/build?delay=0sec",
    target
);

createUrlButton(
    "mavenButton",
    "MAVEN",
    "https://osrb-tools.com/job/bd_to_fossy_to_bd_maven_unreviewed/build?delay=0sec",
    target
);

createUrlButton(
    "pypiButton",
    "PYPI",
    "https://osrb-tools.com/job/bd_to_fossy_to_bd_pypi_unreviewed/build?delay=0sec",
    target
);
}
    if (!$("#okdButton").length) {
        // get base URL without query string
        var okdUrl_prod = "https://console-openshift-console.apps.caas.elektrobit.com/k8s/ns/blackduck/pods"
        var okdUrl_eval = "https://console-openshift-console.apps.eval-okd.elektrobit.com/k8s/ns/blackduck-test/pods"

        var okdUrl = okdUrl_prod;
        if (baseUrl.includes("blackduck-test")) {
            okdUrl = okdUrl_eval;
        }
        var plainOkd = $("<input />", {
            "type": "button",
            "value": "Okd",
            "id": "okdButton",
            "title": "OKD URL",
            "data-clipboard-text": okdUrl,
            "style": "font-size: 10px; padding: 2px 6px;" // inline styling for small size
        });
        // Attach click event to redirect
        plainOkd.on("click", function () {
            window.open(okdUrl);
        });

        target.after(plainOkd);

        new Clipboard('#okdButton');
    }
    if (!$("#sreButton").length) {
        // get base URL without query string
        var sreUrl = "https://jira.elektrobit.com/servicedesk/customer/portal/44"

        var plainsre = $("<input />", {
            "type": "button",
            "value": "SRE BUG",
            "id": "sreButton",
            "title": "SRE Bug",
            "data-clipboard-text": sreUrl,
            "style": "font-size: 10px; padding: 2px 6px;" // inline styling for small size
        });
        // Attach click event to redirect
        plainsre.on("click", function () {
            window.open(sreUrl);
        });

        target.after(plainsre);

        new Clipboard('#sreButton');
    }
    if (!$("#bdButton").length) {
        // get base URL without query string
        var bdUrl = "https://community.blackduck.com/s/my-support-home"

        var plainbd = $("<input />", {
            "type": "button",
            "value": "BD Cases",
            "id": "bdButton",
            "title": "BD Cases",
            "data-clipboard-text": bdUrl,
            "style": "font-size: 10px; padding: 2px 6px;" // inline styling for small size
        });
        // Attach click event to redirect
        plainbd.on("click", function () {
            window.open(bdUrl);
        });

        target.after(plainbd);

        new Clipboard('#bdButton');
    }
    if (!$("#bdtButton").length) {
        // get base URL without query string
        var bdtUrl = "https://community.blackduck.com/s/contactsupport"

        var plainbdt = $("<input />", {
            "type": "button",
            "value": "BD bug",
            "id": "bdtButton",
            "title": "BD Bug",
            "data-clipboard-text": bdUrl,
            "style": "font-size: 10px; padding: 2px 6px;" // inline styling for small size
        });
        // Attach click event to redirect
        plainbdt.on("click", function () {
            window.open(bdUrl);
        });

        target.after(plainbdt);

        new Clipboard('#bdtButton');
    }
    if (!$("#jenkinsButton").length && (projectName.includes("SHM") || projectName.includes("ASTERIX2CLU3D") || projectName.includes("PACCAR"))) {
        // get base URL without query string
        var aosp = "https://jenkins.elektrobit.com/job/CI/job/aosp/job/playground/job/FOSS_SCAN/";
        var ac = "https://jenkins.elektrobit.com/job/CI/job/ac/job/playground/job/oss_AC/";
        var qnx = "https://jenkins.elektrobit.com/job/CI/job/aosp/job/playground/job/qnx_foss_scan/";
        var pc_qnx = "https://jenkins.com/job/BRI/job/qnx_foss_scan/";
        var pc_aosp = "https://jenkins.com/job/BRI/job/paccar_31_0_OSS_GC_AOSP/";
        var pc_ac = "https://jenkins.com/job/BRI/job/paccar_oss_AC/";
        var asterix3dplus = "https://jenkins.com/job/BRI/job/asterix2_OSS_SCAN_c3d_plus/";
        var asterix3d = "https://jenkins.com/job/BRI/job/asterix2_OSS_SCAN_Variants/";
        var cibac = "https://jenkins/job/BRI/job/FOSS_SCAN/job/conticib_eb_31_0_OSS_AC_4m_3/";
        var cibaosp = "https://jenkins/job/BRI/job/FOSS_SCAN/job/conticib_eb_31_0_OSS/";

        projectName = $("h1 nav[aria-label='Breadcrumbs'] ol li:first-child a").text().trim();
        var jenkins = aosp;
        if (projectName.includes("AC")) {
            jenkins = ac;
        } else if (projectName.includes("QNX")) {
            jenkins = qnx;
        } else if (projectName.includes("AOSP")) {
            jenkins = aosp;
        } else if (projectName.includes("PACCAR_QNX")) {
            jenkins = pc_qnx;
        } else if (projectName.includes("PACCAR_AUTOSAR")) {
            jenkins = pc_ac;
        } else if (projectName.includes("PACCAR_AOSP")) {
            jenkins = pc_aosp;
        } else if (projectName.includes("ASTERIX2CLU3D_PLUS_BY")) {
            jenkins = asterix3dplus;
        } else if (projectName.includes("ASTERIX2CLU3D_PROGRAM")) {
            jenkins = asterix3d;
        } else if (projectName.includes("CONTICIB_AUTOSAR")) {
            jenkins = cibac;
        } else if (projectName.includes("CONTICIB_AOSP")) {
            jenkins = cibaosp;
        }
        var plainJenkins = $("<input />", {
            "type": "button",
            "value": "jenkins",
            "id": "jenkinsButton",
            "title": "Jenkins",
            "data-clipboard-text": jenkins,
            "style": "font-size: 10px; padding: 2px 6px;" // inline styling for small size
        });
        // Attach click event to redirect
        plainJenkins.on("click", function () {
            window.open(jenkins);
        });

        target.after(plainJenkins);

        new Clipboard('#jenkinsButton');
    }
}
