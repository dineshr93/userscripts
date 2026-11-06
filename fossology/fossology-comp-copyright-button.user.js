// ==UserScript==
// @name        Fossology open Component + Copyright
// @namespace   com.dinesh
// @description Adds a button per row in Browse that opens the component page and the copyright page
// @version     1.0.0
// @include     /^https?:\/\/[^\/]*fossology[^\/]*\/.*[?&]mod=browse(&|$).*/
// @grant       GM_openInTab
// ==/UserScript==

(function () {
  'use strict';

  function addButtons() {
    document.querySelectorAll('#browsetbl tbody tr').forEach(function (row) {
      if (row.querySelector('.fo-open-both')) return;

      var a = row.querySelector('a[href*="upload="][href*="item="]');
      if (!a) return;

      var u = new URL(a.getAttribute('href'), location.href);
      var upload = u.searchParams.get('upload');
      var item = u.searchParams.get('item');
      if (!upload || !item) return;

      var base = location.origin + location.pathname;
      var componentUrl = base + '?mod=license&upload=' + upload +
        '&folder=' + (u.searchParams.get('folder') || '') +
        '&item=' + item + '&show=quick';
      var copyrightUrl = base + '?mod=copyright-hist&show=quick&upload=' + upload +
        '&item=' + item;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fo-open-both';
      btn.textContent = 'Open Comp + ©';
      btn.title = 'Open component page and copyright page';
      btn.style.cssText = 'font-size:10px;padding:2px 6px;margin-left:6px;';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        GM_openInTab(componentUrl, { active: false, insert: true });
        GM_openInTab(copyrightUrl, { active: false, insert: true });
      });

      a.parentNode.insertBefore(btn, a.nextSibling);
    });
  }

  // Rows are loaded via AJAX (DataTables), so watch for changes
  var timer;
  new MutationObserver(function () {
    clearTimeout(timer);
    timer = setTimeout(addButtons, 150);
  }).observe(document.body, { childList: true, subtree: true });

  addButtons();
})();
