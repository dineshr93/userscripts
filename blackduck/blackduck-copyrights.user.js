// ==UserScript==
// @name         Black Duck - Copyrights quick button
// @namespace    blackduck-copyrights
// @version      1.2
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function isBlackDuck() {
    return /Black Duck/i.test(document.title) ||
           !!document.getElementById('blackduck-app');
  }

  function addButtons() {
    if (!location.pathname.includes('/components')) return;

    document.querySelectorAll('table tbody tr').forEach(row => {
      if (row.querySelector('.bd-copyright-btn')) return;

      const src = row.querySelector('a[href*="bomComponents:"]');
      if (!src) return;

      let base;
      try {
        const b64 = decodeURIComponent(src.href.split('bomComponents:')[1].split('&')[0]);
        base = atob(b64);
      } catch (e) { return; }
      if (!/\/api\/components\/[^/]+\/versions\/[^/]+/.test(base)) return;

      const a = document.createElement('a');
      a.className = 'bd-copyright-btn';
      a.href = base + '/origins';
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = 'Copyrights';
      a.textContent = 'C';
      a.style.cssText =
        'display:flex;align-items:center;justify-content:center;' +
        'width:18px;height:18px;margin:0 0 2px 0;border-radius:9px;' +
        'font-size:11px;line-height:1;' +
        'border:1px solid rgba(0,0,0,.1);background:rgba(0,0,0,.05);' +
        'color:#333;font-weight:700;text-decoration:none;';

      // place above the file icon / "1 Match" link
      src.parentNode.insertBefore(a, src);
    });
  }

  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (isBlackDuck()) addButtons();
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  if (isBlackDuck()) addButtons();
})();
