// ==UserScript==
// @name        Fossology open Component + Copyright
// @namespace   com.dinesh
// @description Adds a button after each row checkbox in Browse that opens the component and copyright pages
// @version     1.1.0
// @include     /^https?:\/\/[^\/]*fossology[^\/]*\/.*[?&]mod=browse(&|$).*/
// @grant       GM_openInTab
// ==/UserScript==

(function () {
  'use strict';

  function addButtons() {
    document.querySelectorAll('input.browse-upload-checkbox').forEach(function (cb) {
      if (cb.nextElementSibling && cb.nextElementSibling.classList.contains('fo-open-both')) return;

      var row = cb.closest('tr');
      if (!row) return;

      var upload = cb.value;
      var link = row.querySelector('a[href*="item="]');
      if (!upload || !link) return;

      var u = new URL(link.getAttribute('href'), location.href);
      var item = u.searchParams.get('item');
      var folder = u.searchParams.get('folder') || '';
      if (!item) return;

      var base = location.origin + location.pathname;
      var componentUrl = base + '?mod=license&upload=' + upload +
        '&folder=' + folder + '&item=' + item + '&show=quick';
      var copyrightUrl = base + '?mod=copyright-hist&show=quick&upload=' + upload +
        '&item=' + item;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fo-open-both';
      btn.textContent = 'Comp + ©';
      btn.title = 'Open component page and copyright page';
      btn.style.cssText = 'font-size:10px;padding:2px 6px;margin-left:6px;';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        GM_openInTab(componentUrl, { active: false, insert: true });
        GM_openInTab(copyrightUrl, { active: false, insert: true });
      });

      cb.insertAdjacentElement('afterend', btn);
    });
  }

  var timer;
  new MutationObserver(function () {
    clearTimeout(timer);
    timer = setTimeout(addButtons, 150);
  }).observe(document.body, { childList: true, subtree: true });

  addButtons();
})();
