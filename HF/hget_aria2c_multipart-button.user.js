// ==UserScript==
// @name         HF GGUF Multi-part aria2c Downloader (hget)
// @namespace    https://tampermonkey.net/
// @version      1.1
// @description  Adds "hget" buttons on Hugging Face model tree pages that generate an aria2c batch-download command for split GGUF files (name-00001-of-00002.gguf style)
// @author       you
// @match        https://huggingface.co/*
// @grant        GM_setClipboard
// @grant        GM_notification
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const PANEL_ID = 'hget-panel';

  // Scan all <a href="/org/repo/blob/main/.../file-00001-of-00002.gguf"> links on the page
  // and group them by (org, repo, subfolder, basename, total-part-count).
  function parseFileLinks() {
    const anchors = Array.from(document.querySelectorAll('a[href*="/blob/main/"]'));
    const groups = new Map();

    for (const a of anchors) {
      const href = a.getAttribute('href');
      if (!href) continue;

      const m = href.match(/^\/([^/]+)\/([^/]+)\/blob\/main\/(.+)$/);
      if (!m) continue;
      const [, org, repo, restPath] = m;

      const filename = decodeURIComponent(restPath.split('/').pop());
      const dir = restPath.slice(0, restPath.length - restPath.split('/').pop().length).replace(/\/$/, '');

      // Matches: <base>-<index>-of-<total>.gguf  e.g. Llama-4-Scout-...-IQ4_XS-00001-of-00002.gguf
      const fm = filename.match(/^(.+)-(\d{2,})-of-(\d{2,})\.gguf$/i);
      if (!fm) continue;

      const [, base, idxStr, totalStr] = fm;
      const total = parseInt(totalStr, 10);
      const key = `${org}/${repo}/${dir}/${base}/${totalStr}`;

      if (!groups.has(key)) {
        groups.set(key, {
          org, repo, dir, base, total, totalStr,
          idxLen: idxStr.length,
          files: new Set(),
        });
      }
      groups.get(key).files.add(idxStr);
    }
    return groups;
  }

  function buildCommand(g) {
    const { org, repo, dir, base, totalStr, idxLen } = g;

    const parts = [];
    for (let i = 1; i <= g.total; i++) {
      parts.push(String(i).padStart(idxLen, '0'));
    }
    const loopList = parts.join(' ');

    const urlBase = `https://huggingface.co/${org}/${repo}/resolve/main/${dir ? dir + '/' : ''}${base}`;

    return `mkdir -p ~/models/${repo} && \\
cd ~/models/${repo} && \\
for i in ${loopList}; do
  aria2c -x 16 -s 16 -k 1M --continue=true \\
    "${urlBase}-\${i}-of-${totalStr}.gguf" -o ${base}-\${i}-of-${totalStr}.gguf
done`;
  }

  function copyToClipboard(text) {
    if (typeof GM_setClipboard === 'function') {
      GM_setClipboard(text, 'text');
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  function toast(msg) {
    if (typeof GM_notification === 'function') {
      GM_notification({ text: msg, title: 'hget', timeout: 3000 });
      return;
    }
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '20px', right: '20px',
      background: '#222', color: '#fff', padding: '8px 14px',
      borderRadius: '6px', zIndex: 999999, fontSize: '13px',
      fontFamily: 'sans-serif',
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function removePanel() {
    const old = document.getElementById(PANEL_ID);
    if (old) old.remove();
  }

  function renderPanel(groups) {
    removePanel();
    if (groups.size === 0) return;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    Object.assign(panel.style, {
      position: 'fixed', top: '80px', right: '16px', zIndex: 999999,
      background: '#1f1f1f', color: '#fff', padding: '10px 12px',
      borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px',
      maxWidth: '340px', boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
    });

    const title = document.createElement('div');
    title.textContent = 'GGUF split files detected';
    Object.assign(title.style, { marginBottom: '8px', fontWeight: 'bold' });
    panel.appendChild(title);

    for (const g of groups.values()) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        marginBottom: '6px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '8px',
      });

      const label = document.createElement('span');
      label.textContent = `${g.base} (${g.total} parts)`;
      label.title = g.dir || '(root)';
      Object.assign(label.style, {
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      });

      const btn = document.createElement('button');
      btn.textContent = 'hget';
      Object.assign(btn.style, {
        cursor: 'pointer', background: '#ffcc00', border: 'none',
        borderRadius: '4px', padding: '3px 10px', fontWeight: 'bold',
        flexShrink: 0,
      });
      btn.addEventListener('click', () => {
        const cmd = buildCommand(g);
        copyToClipboard(cmd);
        toast(`Copied aria2c command for ${g.base}`);
        console.log(cmd);
      });

      row.appendChild(label);
      row.appendChild(btn);
      panel.appendChild(row);
    }

    document.body.appendChild(panel);
  }

  function scanAndRender() {
    renderPanel(parseFileLinks());
  }

  // HF is a client-side rendered app, so re-scan whenever the DOM changes
  // (folder switches, pagination, "load more" clicks, etc).
  let debounceTimer = null;
  function scheduleScan() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scanAndRender, 500);
  }

  new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
  scheduleScan();
})();
