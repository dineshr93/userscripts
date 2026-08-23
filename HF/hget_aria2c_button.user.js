// ==UserScript==
// @name         HF GGUF aria2c "hget" Button
// @namespace    hf-gguf-aria2c
// @version      1.0
// @description  Adds an "hget" button on HuggingFace .gguf file pages that copies a ready-to-run aria2c download command to your clipboard.
// @author       you
// @match        https://huggingface.co/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Only act on URLs whose path ends in .gguf (ignoring any query string)
    function parseUrl() {
        const url = window.location.href;
        if (!/\.gguf(\?.*)?$/i.test(url)) return null;

        // Matches: https://huggingface.co/{owner}/{model}/(resolve|blob)/{branch}/{path...}.gguf
        const m = url.match(/^https:\/\/huggingface\.co\/([^\/]+)\/([^\/]+)\/(?:resolve|blob)\/([^\/]+)\/(.+)$/);
        if (!m) return null;

        const [, owner, model, branch, path] = m;
        const filename = decodeURIComponent(path.split('/').pop().split('?')[0]);

        // "blob" pages are the same file, just needs /resolve/ to be directly downloadable
        const downloadUrl = url.replace('/blob/', '/resolve/').split('?')[0];

        return { owner, model, branch, filename, downloadUrl };
    }

    function buildCommand(info) {
        return `mkdir -p ~/models/${info.model} && aria2c -x 16 -s 16 -k 1M --continue=true "${info.downloadUrl}" -o ${info.filename}`;
    }

    function addButton(info) {
        // Avoid duplicate injection on SPA re-renders
        if (document.getElementById('hget-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'hget-btn';
        btn.textContent = 'hget';
        btn.title = 'Copy aria2c download command';
        btn.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            z-index: 999999;
            background: #ff9d00;
            color: #000;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 14px;
            font-family: sans-serif;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        `;

        btn.addEventListener('click', () => {
            const cmd = buildCommand(info);
            GM_setClipboard(cmd, 'text');
            console.log('[hget]', cmd);

            const original = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = original; }, 1500);
        });

        document.body.appendChild(btn);
    }

    function run() {
        const info = parseUrl();
        if (info) addButton(info);
    }

    run();

    // HuggingFace is a React SPA; re-check on URL/DOM changes (branch switches, etc.)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            document.getElementById('hget-btn')?.remove();
            run();
        }
    }).observe(document.body, { childList: true, subtree: true });
})();
