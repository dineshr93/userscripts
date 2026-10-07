// ==UserScript==
// @name         HF GGUF/HGN/Safetensors aria2c "hget" Button
// @namespace    hf-gguf-aria2c
// @version      1.4
// @description  Adds "hget" button on HF .gguf / .hgn / .safetensors pages. Copies aria2c cmd
// @author       you
// @match        https://huggingface.co/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==
(function () {
    'use strict';

    function parseUrl() {
        const url = window.location.href;
        if (!/\.(gguf|hgn|safetensors)(\?.*)?$/i.test(url)) return null;

        const m = url.match(/^https:\/\/huggingface\.co\/([^\/]+)\/([^\/]+)\/(?:resolve|blob)\/([^\/]+)\/(.+)$/);
        if (!m) return null;

        const [, owner, model, branch, path] = m;
        const filename = decodeURIComponent(path.split('/').pop().split('?')[0]);
        const downloadUrl = url.replace('/blob/', '/resolve/').split('?')[0];
        const isHgn = /\.hgn$/i.test(filename);

        return { owner, model, branch, filename, downloadUrl, isHgn };
    }

    function buildCommand(info) {
        if (info.isHgn) {
            return `mkdir -p ~/halogen-models && cd ~/halogen-models && aria2c -x 16 -s 16 -k 1M --continue=true "${info.downloadUrl}" -o ${info.filename}`;
        }
        // gguf + safetensors → ~/models/<model>
        return `mkdir -p ~/models/${info.model} && cd ~/models/${info.model} && aria2c -x 16 -s 16 -k 1M --continue=true "${info.downloadUrl}" -o ${info.filename}`;
    }

    function addButton(info) {
        if (document.getElementById('hget-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'hget-btn';
        btn.textContent = 'hget';
        btn.title = info.isHgn
            ? 'Copy aria2c → ~/halogen-models'
            : 'Copy aria2c → ~/models/<model>';
        btn.style.cssText = `
            position: fixed; top: 90px; right: 20px; z-index: 999999;
            background: ${info.isHgn ? '#00c853' : '#ff9d00'};
            color: #000; border: none; padding: 10px 18px; border-radius: 6px;
            font-weight: 700; font-size: 14px; font-family: sans-serif;
            cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.35);
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

    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            document.getElementById('hget-btn')?.remove();
            run();
        }
    }).observe(document.body, { childList: true, subtree: true });
})();
