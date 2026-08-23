// ==UserScript==
// @name        GitCloneCopy
// @namespace   com.dinesh
// @description GitCloneCopy - Adds git clone to copy command in git repository page
// @include     https://github.com/*/*
// @include     https://git.*.com/*/*
// @include     https://gitext.*.com/*/*
// @version     11.0.0
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    // Path segments that are GitHub sections, not repo owners, so we don't
    // try to build a "clone" button for e.g. github.com/settings/profile
    const RESERVED_OWNERS = new Set([
        'settings', 'notifications', 'marketplace', 'sponsors', 'topics',
        'trending', 'collections', 'events', 'dashboard', 'explore',
        'codespaces', 'organizations', 'orgs', 'users', 'login', 'join',
        'new', 'about', 'contact', 'pricing', 'features', 'security',
        'issues', 'pulls', 'apps', 'search'
    ]);

    let lastInjectedUrl = null;

    GM_addStyle(`
        #gcc-toolbar {
            position: fixed;
            top: 60px;
            right: 12px;
            z-index: 999999;
            display: flex;
            gap: 6px;
            flex-direction: column;
            align-items: flex-end;
        }
        #gcc-toolbar button {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid rgba(140,149,159,0.4);
            background: #f6f8fa;
            color: #24292f;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        #gcc-toolbar button:hover {
            background: #eaeef2;
        }
        #gcc-toolbar button.gcc-copied {
            background: #2da44e;
            color: #fff;
        }
    `);

    function parseRepoFromPath() {
        // Strip query/hash, split path into segments
        const path = window.location.pathname.replace(/\/+$/, '');
        const segments = path.split('/').filter(Boolean);

        if (segments.length < 2) return null;

        const [owner, repo, maybeTree, ...rest] = segments;
        if (RESERVED_OWNERS.has(owner.toLowerCase())) return null;
        if (repo.toLowerCase() === 'download') return null; // e.g. /owner/repo/archive/...

        const origin = window.location.origin;
        const repoUrl = `${origin}/${owner}/${repo}`;

        let branch = null;
        if (maybeTree === 'tree' && rest.length) {
            branch = rest.join('/');
        }

        return { owner, repo, repoUrl, branch };
    }

    function buildCommands({ repo, repoUrl, branch }) {
        // https://host/owner/repo -> git@host:owner/repo.git
        // Only the FIRST "/" after the protocol becomes ":" (host/owner boundary)
        const sshTarget = repoUrl
            .replace('https://', 'git@')
            .replace('/', ':') + '.git';

        let httpsCmd = `git clone ${repoUrl}.git && cd ${repo}`;
        let sshCmd = `git clone ${sshTarget} && cd ${repo}`;

        if (branch) {
            const checkout = ` && git checkout ${branch}`;
            httpsCmd += checkout;
            sshCmd += checkout;
        }

        return { httpsCmd, sshCmd };
    }

    function injectToolbar() {
        const repoInfo = parseRepoFromPath();

        // Not a repo page (or a reserved section) -> remove any stale toolbar
        if (!repoInfo) {
            const existing = document.getElementById('gcc-toolbar');
            if (existing) existing.remove();
            lastInjectedUrl = null;
            return;
        }

        const currentUrl = window.location.href;
        if (currentUrl === lastInjectedUrl && document.getElementById('gcc-toolbar')) {
            return; // already injected for this exact URL
        }

        // Remove old toolbar before re-adding (branch/repo may have changed)
        const existing = document.getElementById('gcc-toolbar');
        if (existing) existing.remove();

        const { httpsCmd, sshCmd } = buildCommands(repoInfo);

        const toolbar = document.createElement('div');
        toolbar.id = 'gcc-toolbar';

        const httpsBtn = document.createElement('button');
        httpsBtn.id = 'gcc-https-btn';
        httpsBtn.textContent = 'HTTPS Clone';
        httpsBtn.title = httpsCmd;

        const sshBtn = document.createElement('button');
        sshBtn.id = 'gcc-ssh-btn';
        sshBtn.textContent = 'SSH Clone';
        sshBtn.title = sshCmd;

        toolbar.appendChild(httpsBtn);
        toolbar.appendChild(sshBtn);
        document.body.appendChild(toolbar);

        function flashCopied(btn) {
            btn.classList.add('gcc-copied');
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.classList.remove('gcc-copied');
                btn.textContent = original;
            }, 1200);
        }

        function copyText(text, btn) {
            // navigator.clipboard requires a secure context (github.com is https, so fine)
            navigator.clipboard.writeText(text).then(
                () => flashCopied(btn),
                () => {
                    // Fallback for odd sandbox cases where the async clipboard API is blocked
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    flashCopied(btn);
                }
            );
        }

        httpsBtn.addEventListener('click', () => copyText(httpsCmd, httpsBtn));
        sshBtn.addEventListener('click', () => copyText(sshCmd, sshBtn));

        lastInjectedUrl = currentUrl;
    }

    // Debounce so rapid mutation bursts don't re-run this dozens of times
    let debounceTimer = null;
    function scheduleInject() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(injectToolbar, 150);
    }

    document.addEventListener('DOMContentLoaded', scheduleInject);
    // GitHub's current client-side navigation (Turbo/Hotwire) fires these
    document.addEventListener('turbo:load', scheduleInject);
    document.addEventListener('turbo:render', scheduleInject);
    // Older pjax-based navigation, kept for other git hosts that still use it
    document.addEventListener('pjax:end', scheduleInject);

    // Belt-and-suspenders: catch any DOM/URL change we didn't get an event for
    let lastSeenPath = window.location.pathname;
    const observer = new MutationObserver(() => {
        if (window.location.pathname !== lastSeenPath) {
            lastSeenPath = window.location.pathname;
            scheduleInject();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    scheduleInject();
})();
