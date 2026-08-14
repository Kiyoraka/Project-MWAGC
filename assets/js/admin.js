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

  /* View hosts survive re-renders, so a listener attached on every render would
     stack up and fire N times. Bind delegated handlers through this instead. */
  function bindOnce(host, type, fn) {
    var flag = 'bound' + type;          // per event type - a view may bind several
    if (host.dataset[flag] === '1') { return; }
    host.dataset[flag] = '1';
    host.addEventListener(type, fn);
  }

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
    bindOnce: bindOnce,
    boot: boot,
    D: D
  };
}(GETTA));

/* ==========================================================================
   View 1 - Dashboard
   ========================================================================== */

(function (A) {
  'use strict';

  var D = A.D;
  var BOLT = 'M13 2 3 14h6l-2 8 10-12h-6l2-8z';

  /* chart geometry, lifted from the design component */
  function chartPoints(data) {
    var mx = Math.max.apply(null, data);
    var mn = Math.min.apply(null, data);
    return data.map(function (v, i) {
      return (i * (640 / (data.length - 1))).toFixed(1) + ',' +
             (195 - ((v - mn) / (mx - mn)) * 175 + 8).toFixed(1);
    }).join(' ');
  }

  A.VIEWS.dash = function (s, host) {
    var pts  = chartPoints(s.range === 7 ? D.D7 : D.D30);
    var fill = '0,210 ' + pts + ' 640,210';

    host.innerHTML =
      '<div class="stats">' +
        '<div class="stat stat--primary">' +
          '<svg class="stat__bolt" width="64" height="64" viewBox="0 0 24 24"><path d="' + BOLT + '" fill="#EE7623"></path></svg>' +
          '<div class="stat__label">TODAY\'S SALES</div>' +
          '<div class="stat__value">RM 4,286</div>' +
          '<div class="stat__delta">&#9650; 12% vs yesterday</div>' +
        '</div>' +
        '<div class="stat">' +
          '<div class="stat__label">ORDERS TODAY</div>' +
          '<div class="stat__value">186</div>' +
          '<div class="stat__delta">&#9650; 23 in the last hour</div>' +
        '</div>' +
        '<div class="stat">' +
          '<div class="stat__label">ACTIVE CUSTOMERS</div>' +
          '<div class="stat__value">1,204</div>' +
          '<div class="stat__delta">&#9650; 48 new this week</div>' +
        '</div>' +
        '<div class="stat">' +
          '<div class="stat__label">TOP PRODUCT</div>' +
          '<div class="stat__value stat__value--sm">Gula Melaka Latte</div>' +
          '<div class="stat__delta stat__delta--orange">341 cups this week</div>' +
        '</div>' +
      '</div>' +

      '<div class="dash-grid">' +

        /* sales trend */
        '<div class="dash-grid__wide">' +
          '<div class="card-head">' +
            '<div class="card__title">Sales trend</div>' +
            '<div class="range">' +
              '<button class="range-chip' + (s.range === 7 ? ' range-chip--on' : '') + '" data-r="7">7 days</button>' +
              '<button class="range-chip' + (s.range === 30 ? ' range-chip--on' : '') + '" data-r="30">30 days</button>' +
            '</div>' +
          '</div>' +
          '<svg class="chart" width="100%" height="210" viewBox="0 0 640 210" preserveAspectRatio="none">' +
            '<line x1="0" y1="52" x2="640" y2="52" stroke="#F4EDDC" stroke-width="1"></line>' +
            '<line x1="0" y1="104" x2="640" y2="104" stroke="#F4EDDC" stroke-width="1"></line>' +
            '<line x1="0" y1="156" x2="640" y2="156" stroke="#F4EDDC" stroke-width="1"></line>' +
            '<polyline points="' + pts + '" fill="none" stroke="#EE7623" stroke-width="3.5" ' +
              'stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" ' +
              'style="stroke-dashoffset:' + (s.chartOn ? 0 : 1) + ';transition:stroke-dashoffset 1.3s ease-out"></polyline>' +
            '<polygon points="' + fill + '" fill="rgba(238,118,35,.12)"></polygon>' +
          '</svg>' +
          '<div class="chart-labels">' +
            '<span>' + (s.range === 7 ? 'Thu 7 Aug' : '15 Jul') + '</span>' +
            '<span>' + (s.range === 7 ? 'Sun 10 Aug' : '30 Jul') + '</span>' +
            '<span>Today</span>' +
          '</div>' +
        '</div>' +

        /* live orders */
        '<div class="dash-grid__tall">' +
          '<div class="card-head">' +
            '<div class="card__title">Live orders</div>' +
            '<div class="live"><div class="live__dot"></div>LIVE</div>' +
          '</div>' +
          '<div class="feed">' +
            s.feed.map(function (f) {
              return '<div class="feed__row' + (f.fresh ? ' feed__row--fresh' : '') + '">' +
                       '<div class="feed__avatar">' + A.esc(A.initials(f.who)) + '</div>' +
                       '<div class="feed__mid">' +
                         '<div class="feed__who">' + A.esc(f.who) + '</div>' +
                         '<div class="feed__items">' + A.esc(f.items) + '</div>' +
                       '</div>' +
                       '<div class="feed__right">' +
                         '<div class="feed__amt">' + A.esc(f.amt) + '</div>' +
                         '<div class="feed__type">' + A.esc(f.type) + '</div>' +
                       '</div>' +
                     '</div>';
            }).join('') +
          '</div>' +
        '</div>' +

        /* pickup vs delivery */
        '<div class="split">' +
          '<svg width="150" height="150" viewBox="0 0 120 120">' +
            '<circle cx="60" cy="60" r="46" fill="none" stroke="#F0E4C6" stroke-width="17"></circle>' +
            '<circle cx="60" cy="60" r="46" fill="none" stroke="#7A2418" stroke-width="17" pathLength="100" ' +
              'transform="rotate(-90 60 60)" ' +
              'style="stroke-dasharray:' + (s.chartOn ? '64 100' : '0 100') + ';transition:stroke-dasharray 1.2s ease-out"></circle>' +
            '<text x="60" y="57" text-anchor="middle" fill="#2B1510" ' +
              'style="font-family:\'Baloo 2\',sans-serif;font-weight:800;font-size:20px">64%</text>' +
            '<text x="60" y="74" text-anchor="middle" fill="#8A6A55" ' +
              'style="font-family:Outfit,sans-serif;font-weight:600;font-size:9px">PICKUP</text>' +
          '</svg>' +
          '<div class="split__body">' +
            '<div class="card__title">Pickup vs Delivery</div>' +
            '<div class="split__legend">' +
              '<div>' +
                '<div class="split__key"><div class="split__swatch split__swatch--pickup"></div>Pickup</div>' +
                '<div class="split__count">119 <span>orders</span></div>' +
              '</div>' +
              '<div>' +
                '<div class="split__key"><div class="split__swatch split__swatch--delivery"></div>Delivery</div>' +
                '<div class="split__count">67 <span>orders</span></div>' +
              '</div>' +
            '</div>' +
            '<div class="split__note">Pickup keeps climbing since the queue-skip campaign &mdash; consider a bolt-points boost for delivery.</div>' +
          '</div>' +
        '</div>' +

      '</div>';

    /* range switch re-arms the chart draw-in, exactly as the design does */
    host.querySelector('.range').addEventListener('click', function (e) {
      var b = e.target.closest('.range-chip');
      if (!b) { return; }
      A.setState({ range: +b.dataset.r, chartOn: false });
      A.later(function () { A.setState({ chartOn: true }); }, 60);
    });
  };
}(APP));

/* ==========================================================================
   View 2 - Orders
   ========================================================================== */

(function (A) {
  'use strict';

  var D = A.D;
  var SEQ = ['New', 'Preparing', 'Ready', 'Completed'];

  var CHIP = {
    New:       'chip--new',
    Preparing: 'chip--preparing',
    Ready:     'chip--ready',
    Completed: 'chip--completed'
  };

  /* dot state: pending / current / passed, driven by the 1-based step number */
  function dot(step, n) {
    if (step > n) { return 'rail__dot rail__dot--passed'; }
    if (step === n) { return 'rail__dot rail__dot--current'; }
    return 'rail__dot';
  }

  function bar(step, n) {
    return 'rail__fill' + (step > n ? ' rail__fill--full' : '');
  }

  A.VIEWS.orders = function (s, host) {
    var open   = s.selOrder >= 0;
    var selO   = D.ORDERS[Math.max(0, s.selOrder)];
    var status = open ? s.statuses[s.selOrder] : 'New';
    var step   = SEQ.indexOf(status) + 1;
    var done   = status === 'Completed';

    host.innerHTML =
      '<div class="split-layout">' +

        '<div class="split-layout__main">' +
          '<div class="table-head orders-grid">' +
            '<div>ORDER</div><div>CUSTOMER</div><div>ITEMS</div>' +
            '<div>TOTAL</div><div>TYPE</div><div>STATUS</div>' +
          '</div>' +
          D.ORDERS.map(function (o, i) {
            var st = s.statuses[i];
            return '<div class="order-row' + (s.selOrder === i ? ' order-row--selected' : '') + '" data-i="' + i + '">' +
                     '<div class="order-row__id">' + A.esc(o.id) + '</div>' +
                     '<div class="order-row__who">' + A.esc(o.who) + '</div>' +
                     '<div class="order-row__items">' + A.esc(o.items) + '</div>' +
                     '<div class="order-row__amt">' + A.esc(o.amt) + '</div>' +
                     '<div class="order-row__type">' + A.esc(o.type) + '</div>' +
                     '<div><span class="chip ' + CHIP[st] + '">' + A.esc(st) + '</span></div>' +
                   '</div>';
          }).join('') +
        '</div>' +

        (open ?
        '<div class="panel panel--order">' +
          '<div class="card-head">' +
            '<div class="panel__id">' + A.esc(selO.id) + '</div>' +
            '<button class="panel__close" data-close="1">&#10005;</button>' +
          '</div>' +
          '<div class="panel__meta">' + A.esc(selO.who) + ' &middot; ' + A.esc(selO.type) + ' &middot; 9:32 AM</div>' +

          '<div class="rail">' +
            '<div class="' + dot(step, 1) + '"></div>' +
            '<div class="rail__bar"><div class="' + bar(step, 1) + '"></div></div>' +
            '<div class="' + dot(step, 2) + '"></div>' +
            '<div class="rail__bar"><div class="' + bar(step, 2) + '"></div></div>' +
            '<div class="' + dot(step, 3) + '"></div>' +
            '<div class="rail__bar"><div class="' + bar(step, 3) + '"></div></div>' +
            '<div class="' + dot(step, 4) + '"></div>' +
          '</div>' +
          '<div class="rail-labels">' +
            '<span>Received</span><span>Preparing</span><span>Ready</span><span>Done</span>' +
          '</div>' +

          '<div class="lines">' +
            selO.lines.map(function (ln) {
              return '<div class="lines__row"><span>' + A.esc(ln.n) + '</span><span>' + A.esc(ln.p) + '</span></div>';
            }).join('') +
            '<div class="lines__total"><span>Total</span><span>' + A.esc(selO.amt) + '</span></div>' +
          '</div>' +

          '<button class="btn-orange-wide' + (done ? ' btn-advance--done' : '') + '" data-adv="1">' +
            (done ? 'Order completed &#10003;' : 'Advance to ' + SEQ[step]) +
          '</button>' +
        '</div>' : '') +

      '</div>';

    A.bindOnce(host, 'click', function (e) {
      if (e.target.closest('[data-close]')) {
        A.setState({ selOrder: -1 });
        return;
      }
      if (e.target.closest('[data-adv]')) {
        var i = A.state.selOrder;
        if (i < 0) { return; }
        var st = A.state.statuses.slice();
        var cur = SEQ.indexOf(st[i]);
        if (cur < 3) {
          st[i] = SEQ[cur + 1];
          A.setState({ statuses: st });
        }
        return;
      }
      var row = e.target.closest('.order-row');
      if (row) { A.setState({ selOrder: +row.dataset.i }); }
    });
  };
}(APP));

/* ==========================================================================
   View 3 - Products
   ========================================================================== */

(function (A) {
  'use strict';

  var D = A.D;

  function toggle(on, attrs) {
    return '<div class="toggle' + (on ? ' toggle--on' : '') + '" ' + attrs + '>' +
             '<div class="toggle__knob"></div>' +
           '</div>';
  }

  A.VIEWS.products = function (s, host) {
    /* the design binds the edit panel to PRODUCTS[1] and shows a bare price */
    var ep = D.PRODUCTS[1];

    host.innerHTML =
      '<div class="split-layout">' +

        '<div class="split-layout__main">' +
          '<div class="products-bar">' +
            '<div class="products-bar__count">18 products &middot; edits publish straight to the PWA menu</div>' +
            '<button class="btn-maroon">+ New product</button>' +
          '</div>' +
          D.PRODUCTS.map(function (p, i) {
            return '<div class="product-row">' +
                     '<div class="product-row__thumb" style="background:linear-gradient(160deg,' + p.c1 + ',' + p.c2 + ')"></div>' +
                     '<div>' +
                       '<div class="product-row__name">' + A.esc(p.n) + '</div>' +
                       '<div class="product-row__tag">' + A.esc(p.tag) + '</div>' +
                     '</div>' +
                     '<div class="product-row__cat">' + A.esc(p.cat) + '</div>' +
                     '<div class="product-row__price">' + A.esc(p.pr) + '</div>' +
                     toggle(s.avail[i], 'data-avail="' + i + '"') +
                     '<div class="product-row__edit" data-edit="' + i + '">Edit</div>' +
                   '</div>';
          }).join('') +
        '</div>' +

        '<div class="panel panel--edit">' +
          '<div class="panel__title">Edit product</div>' +
          '<div class="edit__photo" style="background:linear-gradient(160deg,' + ep.c1 + ',' + ep.c2 + ')">' +
            '<div class="edit__replace">Replace photo</div>' +
          '</div>' +

          '<div class="edit__section">NAME</div>' +
          '<input class="field-input" value="' + A.esc(ep.n) + '" readonly>' +

          '<div class="edit__pair">' +
            '<div>' +
              '<div class="field-label">PRICE (RM)</div>' +
              '<input class="field-input" value="12.90" readonly>' +
            '</div>' +
            '<div>' +
              '<div class="field-label">CATEGORY</div>' +
              '<input class="field-input" value="' + A.esc(ep.cat) + '" readonly>' +
            '</div>' +
          '</div>' +

          '<div class="edit__section">CUSTOMIZATION GROUPS</div>' +
          '<div class="group-chips">' +
            '<div class="group-chip">Size</div>' +
            '<div class="group-chip">Sugar level</div>' +
            '<div class="group-chip">Milk</div>' +
            '<div class="group-chip">Add-ons</div>' +
            '<div class="group-chip group-chip--add">+ Group</div>' +
          '</div>' +

          '<div class="edit__section">AVAILABLE AT</div>' +
          '<div class="outlet-toggles">' +
            D.OUTLETS.map(function (o, i) {
              return '<div class="outlet-toggles__row">' +
                       '<span>' + A.esc(o.n.replace('Getta Coffee ', '')) + '</span>' +
                       toggle(s.epo[i], 'data-epo="' + i + '"') +
                     '</div>';
            }).join('') +
          '</div>' +

          '<button class="btn-orange-wide">Publish to PWA</button>' +
        '</div>' +

      '</div>';

    A.bindOnce(host, 'click', function (e) {
      var av = e.target.closest('[data-avail]');
      if (av) {
        var a = A.state.avail.slice();
        var i = +av.dataset.avail;
        a[i] = !a[i];
        A.setState({ avail: a });
        return;
      }
      var eo = e.target.closest('[data-epo]');
      if (eo) {
        var b = A.state.epo.slice();
        var j = +eo.dataset.epo;
        b[j] = !b[j];
        A.setState({ epo: b });
      }
    });
  };
}(APP));

/* ==========================================================================
   View 4 - Categories
   ========================================================================== */

(function (A) {
  'use strict';

  var D = A.D;
  var GRIP = 'M8 5a2 2 0 1 0 .01 0zM16 5a2 2 0 1 0 .01 0zM8 11a2 2 0 1 0 .01 0z' +
             'M16 11a2 2 0 1 0 .01 0zM8 17a2 2 0 1 0 .01 0zM16 17a2 2 0 1 0 .01 0z';

  A.VIEWS.cats = function (s, host) {
    var rows = s.cats.map(function (ci, pos) {
      return { i: ci, c: D.CATLIST[ci], pos: pos + 1 };
    });

    host.innerHTML =
      '<div class="cats-layout">' +

        '<div class="cats-layout__main">' +
          '<div class="card__title">Category rail order</div>' +
          '<div class="card__subtitle">Drag rows to reorder &mdash; this is exactly what the PWA left rail shows.</div>' +
          '<div class="cat-rows">' +
            rows.map(function (r) {
              return '<div class="cat-row' + (s.dragFrom === r.i ? ' cat-row--dragging' : '') + '" ' +
                        'draggable="true" data-i="' + r.i + '">' +
                       '<svg width="14" height="14" viewBox="0 0 24 24"><path d="' + GRIP + '" fill="#B9A48C"></path></svg>' +
                       '<div class="cat-row__icon">' +
                         '<svg width="16" height="16" viewBox="0 0 24 24"><path d="' + r.c.ic + '" fill="#7A2418" fill-rule="evenodd"></path></svg>' +
                       '</div>' +
                       '<div class="cat-row__name">' + A.esc(r.c.n) + '</div>' +
                       '<div class="cat-row__count">' + r.c.count + ' products</div>' +
                       '<div class="cat-row__pos">' + r.pos + '</div>' +
                     '</div>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="rail-preview">' +
          '<div class="rail-preview__label">PWA RAIL PREVIEW</div>' +
          '<div class="rail-preview__strip">' +
            rows.map(function (r, idx) {
              return '<div class="rail-preview__item' + (idx === 0 ? ' rail-preview__item--first' : '') + '">' +
                       '<svg width="17" height="17" viewBox="0 0 24 24"><path d="' + r.c.ic + '" fill="#7A2418" fill-rule="evenodd"></path></svg>' +
                       '<div class="rail-preview__name">' + A.esc(r.c.n) + '</div>' +
                     '</div>';
            }).join('') +
          '</div>' +
        '</div>' +

      '</div>';

    A.bindOnce(host, 'dragstart', function (e) {
      var row = e.target.closest('.cat-row');
      if (!row) { return; }
      e.dataTransfer.effectAllowed = 'move';
      A.setState({ dragFrom: +row.dataset.i });
    });

    /* reorder algorithm copied from the design component, splice for splice */
    A.bindOnce(host, 'dragover', function (e) {
      var row = e.target.closest('.cat-row');
      if (!row) { return; }
      e.preventDefault();
      var over = +row.dataset.i;
      var from = A.state.dragFrom;
      if (from < 0 || from === over) { return; }

      var arr = A.state.cats.slice();
      var fi = arr.indexOf(from);
      arr.splice(fi, 1);
      var oi = arr.indexOf(over);
      arr.splice(oi + (fi <= oi ? 1 : 0), 0, from);
      A.setState({ cats: arr });
    });

    A.bindOnce(host, 'dragend', function () {
      A.setState({ dragFrom: -1 });
    });
  };
}(APP));

/* ==========================================================================
   View 5 - Banners & Promos
   ========================================================================== */

(function (A) {
  'use strict';

  var D = A.D;
  var BOLT = 'M13 2 3 14h6l-2 8 10-12h-6l2-8z';

  A.VIEWS.banners = function (s, host) {
    host.innerHTML =
      '<div class="banners-layout">' +

        '<div class="banners-col">' +
          D.BANS.map(function (b, i) {
            return '<div class="banner-card">' +
                     '<div class="banner-card__preview" style="background:' + b.bg + '">' +
                       '<svg class="banner-card__bolt" width="44" height="44" viewBox="0 0 24 24"><path d="' + BOLT + '" fill="#fff"></path></svg>' +
                       '<div class="banner-card__preview-title" style="color:' + b.fg + '">' + A.esc(b.t) + '</div>' +
                     '</div>' +
                     '<div class="banner-card__body">' +
                       '<div class="banner-card__title">' + A.esc(b.t) + '</div>' +
                       '<div class="banner-card__meta">Schedule: <b>' + A.esc(b.win) + '</b></div>' +
                       '<div class="banner-card__stats">Position ' + (i + 1) + ' of 3 &middot; ' + b.taps + ' taps this week</div>' +
                     '</div>' +
                     '<div class="toggle' + (s.banOn[i] ? ' toggle--on' : '') + '" data-ban="' + i + '">' +
                       '<div class="toggle__knob"></div>' +
                     '</div>' +
                   '</div>';
          }).join('') +
          '<button class="banner-add">+ Schedule new banner</button>' +
        '</div>' +

        '<div class="promo">' +
          '<div class="card__title">Promo-code announcement bar</div>' +
          '<div class="card__subtitle">Shows at the top of the PWA menu.</div>' +

          '<div class="promo__section">MESSAGE</div>' +
          '<input class="field-input promo__input" value="RM3 OFF first pickup order &middot; Code: GETTABOLT10" readonly>' +

          '<div class="promo__section">LIVE PREVIEW</div>' +
          '<div class="promo__preview">' +
            '<svg width="14" height="14" viewBox="0 0 24 24"><path d="' + BOLT + '" fill="#C2570F"></path></svg>' +
            '<div class="promo__preview-text">RM3 OFF first pickup order &middot; Code: <b>GETTABOLT10</b></div>' +
          '</div>' +

          '<button class="btn-maroon-wide">Publish bar</button>' +
        '</div>' +

      '</div>';

    A.bindOnce(host, 'click', function (e) {
      var t = e.target.closest('[data-ban]');
      if (!t) { return; }
      var a = A.state.banOn.slice();
      var i = +t.dataset.ban;
      a[i] = !a[i];
      A.setState({ banOn: a });
    });
  };
}(APP));

/* ==========================================================================
   View 6 - Rewards Engine
   ========================================================================== */

(function (A) {
  'use strict';

  var DAY_VALUES = [1, 1, 1, 3, 1, 1, 21];

  A.VIEWS.rewards = function (s, host) {
    host.innerHTML =
      '<div class="rewards-layout">' +

        '<div class="reward-card">' +
          '<div class="card__title">Earning rules</div>' +

          '<div class="inset-row" style="margin-top:12px">' +
            '<div class="inset-row__label">Points per RM 1 spent</div>' +
            '<div class="stepper">' +
              '<button class="stepper__btn stepper__btn--down" data-earn="-1">&minus;</button>' +
              '<div class="stepper__value">' + s.earnRate + '</div>' +
              '<button class="stepper__btn stepper__btn--up" data-earn="1">+</button>' +
            '</div>' +
          '</div>' +

          '<div class="subhead">Daily check-in values</div>' +
          '<div class="days">' +
            DAY_VALUES.map(function (v, i) {
              return '<div class="days__col">' +
                       '<div class="days__tile' + (v > 1 ? ' days__tile--bonus' : '') + '">' + v + '</div>' +
                       '<div class="days__label">Day ' + (i + 1) + '</div>' +
                     '</div>';
            }).join('') +
          '</div>' +

          '<div class="subhead">Cup streak</div>' +
          '<div class="inset-row" style="margin-top:8px">' +
            '<div class="inset-row__label">Free drink after</div>' +
            '<div class="inset-row__value">10 cups</div>' +
          '</div>' +
        '</div>' +

        '<div class="rewards-col">' +

          '<div class="reward-card">' +
            '<div class="card-head">' +
              '<div class="card__title">Missions</div>' +
              '<button class="btn-ghost">+ New mission</button>' +
            '</div>' +
            '<div class="missions">' +
              '<div class="mission"><div class="mission__name">Order 3 Signature drinks</div><div class="mission__pts">+50 pts &middot; LIVE</div></div>' +
              '<div class="mission"><div class="mission__name">Try anything Matcha</div><div class="mission__pts">+20 pts &middot; LIVE</div></div>' +
              '<div class="mission"><div class="mission__name">Bring your own tumbler</div><div class="mission__pts mission__pts--draft">+30 pts &middot; DRAFT</div></div>' +
            '</div>' +
          '</div>' +

          '<div class="reward-card">' +
            '<div class="card__title">Voucher creator</div>' +
            '<div class="voucher-fields">' +
              '<div><div class="field-label">VALUE</div><input class="field-input field-input--sm" value="RM 3 off" readonly></div>' +
              '<div><div class="field-label">COST</div><input class="field-input field-input--sm" value="240 pts" readonly></div>' +
              '<div><div class="field-label">MIN SPEND</div><input class="field-input field-input--sm" value="RM 15" readonly></div>' +
            '</div>' +
            '<button class="btn-orange-wide btn-orange-wide--tight">Create voucher</button>' +
          '</div>' +

        '</div>' +
      '</div>';

    A.bindOnce(host, 'click', function (e) {
      var b = e.target.closest('[data-earn]');
      if (!b) { return; }
      var delta = +b.dataset.earn;
      /* the design clamps the rate between 1 and 5 */
      A.setState(function (st) {
        return { earnRate: delta > 0 ? Math.min(5, st.earnRate + 1) : Math.max(1, st.earnRate - 1) };
      });
    });
  };
}(APP));

/* ==========================================================================
   View 7 - Outlets
   ========================================================================== */

(function (A) {
  'use strict';

  var D = A.D;

  A.VIEWS.outlets = function (s, host) {
    host.innerHTML =
      '<div class="outlets-grid">' +
        D.OUTLETS.map(function (o, i) {
          /* flagship wins the badge outright; otherwise it reports pickup state */
          var badge = o.flagship ? 'FLAGSHIP' : (s.outletPk[i] ? 'OPEN' : 'PICKUP OFF');
          var mod   = o.flagship ? 'flagship' : (s.outletPk[i] ? 'open' : 'off');

          return '<div class="outlet-card">' +
                   '<div class="outlet-card__head">' +
                     '<div>' +
                       '<div class="outlet-card__name">' + A.esc(o.n) + '</div>' +
                       '<div class="outlet-card__addr">' + A.esc(o.addr) + '</div>' +
                     '</div>' +
                     '<div class="outlet-badge outlet-badge--' + mod + '">' + badge + '</div>' +
                   '</div>' +

                   '<div class="outlet-card__facts">' +
                     '<div>' +
                       '<div class="outlet-card__fact-label">HOURS</div>' +
                       '<div class="outlet-card__hours">' + A.esc(o.hours) + '</div>' +
                     '</div>' +
                     '<div>' +
                       '<div class="outlet-card__fact-label">DELIVERY ZONES</div>' +
                       '<div class="outlet-card__zones">' +
                         o.zones.map(function (z) {
                           return '<div class="zone-pill">' + A.esc(z) + '</div>';
                         }).join('') +
                       '</div>' +
                     '</div>' +
                   '</div>' +

                   '<div class="outlet-card__foot">' +
                     '<div class="outlet-card__foot-label">Pickup orders</div>' +
                     '<div class="toggle' + (s.outletPk[i] ? ' toggle--on' : '') + '" data-outlet="' + i + '">' +
                       '<div class="toggle__knob"></div>' +
                     '</div>' +
                   '</div>' +
                 '</div>';
        }).join('') +
      '</div>';

    A.bindOnce(host, 'click', function (e) {
      var t = e.target.closest('[data-outlet]');
      if (!t) { return; }
      var a = A.state.outletPk.slice();
      var i = +t.dataset.outlet;
      a[i] = !a[i];
      A.setState({ outletPk: a });
    });
  };
}(APP));

/* ==========================================================================
   Views are appended below this line, one section per sidebar entry.
   ========================================================================== */

APP.boot();
