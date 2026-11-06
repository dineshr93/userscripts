// ==UserScript==
// @name         Black Duck - Copyrights + Copy quick buttons
// @namespace    blackduck-copyrights
// @version      1.6
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const isBD = () =>
    /Black Duck/i.test(document.title) || !!document.getElementById('blackduck-app');

  const STYLE =
    'display:inline-flex;align-items:center;justify-content:center;' +
    'width:18px;height:18px;border-radius:9px;font-size:11px;line-height:1;' +
    'border:1px solid rgba(0,0,0,.1);background:rgba(0,0,0,.05);' +
    'color:#333;font-weight:700;text-decoration:none;cursor:pointer;padding:0;';

  function addC(row) {
    if (row.querySelector('.bd-copyright-btn')) return;
    const src = row.querySelector('a[href*="bomComponents:"]');
    if (!src) return;
    let base;
    try {
      base = atob(decodeURIComponent(src.href.split('bomComponents:')[1].split('&')[0]));
    } catch (e) { return; }
    if (!/\/api\/components\/[^/]+\/versions\/[^/]+/.test(base)) return;

    const a = document.createElement('a');
    a.className = 'bd-copyright-btn';
    a.href = base + '/origins';
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = 'Copyrights';
    a.textContent = 'C';
    a.style.cssText = STYLE + 'display:flex;margin:0 0 2px 0;';
    src.parentNode.insertBefore(a, src);
  }

  function addT(row) {
    if (row.querySelector('.bd-copy-btn')) return;
    const th = row.querySelector('th');
    const strong = th && th.querySelector('strong');
    if (!strong) return;
    const name = strong.textContent.trim();
    const spans = th.querySelectorAll('span');
    const version = (spans[spans.length - 1]?.textContent || '').trim();
    if (!name || !version || version === name) return;

    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bd-copy-btn';
    b.title = 'Copy: ' + name + ' ' + version;
    b.textContent = 'T';
    b.style.cssText = STYLE + 'margin-left:6px;vertical-align:middle;';
    b.addEventListener('click', async e => {
      e.preventDefault();
      e.stopPropagation();
      const text = name + ' ' + version;
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        const t = document.createElement('textarea');
        t.value = text;
        t.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        t.remove();
      }
      b.textContent = '✓';
      setTimeout(() => (b.textContent = 'T'), 1000);
    });
    th.appendChild(b);
  }

  function run() {
    if (!isBD() || !location.pathname.includes('/components')) return;
    observer.disconnect(); // don't react to our own insertions
    try {
      document.querySelectorAll('table tbody tr').forEach(row => {
        try { addC(row); } catch (e) { console.error('[BD-btns] C', e); }
        try { addT(row); } catch (e) { console.error('[BD-btns] T', e); }
      });
    } finally {
      observe();
    }
  }

  let timer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(run, 250); // debounce while page loads piece by piece
  });
  function observe() {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  observe();
  run();
  console.log('[BD-btns] v1.6 loaded');
})();
