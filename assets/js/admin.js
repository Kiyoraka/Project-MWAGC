/* ==========================================================================
   Getta Coffee - Admin console runtime

   Stands in for the Claude Design DCLogic component. Same state shape, same
   handlers, same timings - a plain render loop instead of the design runtime.

   Views register themselves into VIEWS[key] = function (state, host) { ... }
   and are re-rendered whenever state changes. Each view file section lives
   further down this file, in the same order as the sidebar.
   ========================================================================== */

var APP = (function (D) {
  'use strict';

  var SESSION_KEY = 'getta_admin_session';

  /* --- auth guard --------------------------------------------------------- */

  if (!sessionStorage.getItem(SESSION_KEY)) {
    window.location.replace('index.html');
  }

  /* --- state (copied from the design component) --------------------------- */

  var state = {
    view: 'dash',
    range: 7,
    chartOn: false,
    feed: D.FEEDQ.slice(0, 3).map(function (f) { return assign({}, f, { fresh: false }); }),
    feedPtr: 3,
    selOrder: -1,
    statuses: ['Preparing', 'New', 'Ready', 'Preparing', 'New', 'Completed', 'Ready'],
    avail: [true, true, true, true, true, false, true, true],
    epo: [true, true, true, false],
    cats: D.CATLIST.map(function (c, i) { return i; }),
    dragFrom: -1,
    banOn: [true, true, false],
    earnRate: 1,
    outletPk: [true, true, true, false],
    selCust: -1
  };

  var timers = [];
  var feedTimer = null;

  /* --- tiny helpers ------------------------------------------------------- */

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      for (var k in src) { if (src.hasOwnProperty(k)) { target[k] = src[k]; } }
    }
    return target;
  }

  /* escape anything that reaches innerHTML as text */
  function esc(v) {
    return String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* "Mei Ling Tan" -> "MT" : first letter of the first two words */
  function initials(name) {
    return name.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('');
  }

  function el(id) { return document.getElementById(id); }

  /* --- state plumbing ----------------------------------------------------- */

  function setState(patch) {
    assign(state, typeof patch === 'function' ? patch(state) : patch);
    render();
  }

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  /* --- view registry ------------------------------------------------------ */

  var VIEWS = {};

  function render() {
    // sidebar
    el('nav').innerHTML = D.NAV.map(function (n) {
      var on = state.view === n.v;
      return '<div class="nav-item' + (on ? ' nav-item--active' : '') + '" data-v="' + n.v + '">' +
               '<svg width="17" height="17" viewBox="0 0 24 24"><path d="' + n.ic + '" fill="' +
                 (on ? '#F7F1DC' : '#C79383') + '" fill-rule="evenodd"></path></svg>' +
               '<div>' + esc(n.lbl) + '</div>' +
             '</div>';
    }).join('');

    el('view-title').textContent = D.TITLES[state.view];

    // views - only the active one is rendered and shown
    Object.keys(D.TITLES).forEach(function (key) {
      var host = el('view-' + key);
      if (!host) { return; }
      if (key === state.view) {
        host.hidden = false;
        if (VIEWS[key]) { VIEWS[key](state, host); }
      } else {
        host.hidden = true;
      }
    });
  }

  /* --- navigation --------------------------------------------------------- */

  el('nav').addEventListener('click', function (e) {
    var item = e.target.closest('.nav-item');
    if (!item) { return; }
    var v = item.dataset.v;
    setState({ view: v, chartOn: false });
    if (v === 'dash') { later(function () { setState({ chartOn: true }); }, 250); }
  });

  /* --- sign out (bound to the existing user block) ------------------------ */

  el('signout').addEventListener('click', function () {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  });

  /* --- live order feed ---------------------------------------------------- */

  function startFeed() {
    feedTimer = setInterval(function () {
      if (state.view !== 'dash') { return; }
      setState(function (s) {
        var nxt = D.FEEDQ[s.feedPtr % D.FEEDQ.length];
        var feed = [assign({}, nxt, { fresh: true })].concat(
          s.feed.map(function (f) { return assign({}, f, { fresh: false }); })
        ).slice(0, 6);
        return { feed: feed, feedPtr: s.feedPtr + 1 };
      });
    }, 4500);
  }

  window.addEventListener('beforeunload', function () {
    timers.forEach(clearTimeout);
    clearInterval(feedTimer);
  });

  /* --- boot --------------------------------------------------------------- */

  function boot() {
    render();
    later(function () { setState({ chartOn: true }); }, 300);
    startFeed();
  }

  return {
    VIEWS: VIEWS,
    state: state,
    setState: setState,
    later: later,
    assign: assign,
    esc: esc,
    initials: initials,
    boot: boot,
    D: D
  };
}(GETTA));

/* ==========================================================================
   Views are appended below this line, one section per sidebar entry.
   ========================================================================== */

APP.boot();
