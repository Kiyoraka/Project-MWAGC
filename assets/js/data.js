/* ==========================================================================
   Getta Coffee - Admin console data

   Copied verbatim from the Claude Design source (Getta Admin.dc.html, the
   DCLogic constructor). Every figure, name, price and SVG path matches the
   mockup exactly - do not "tidy" these values, the console is meant to be
   pixel-identical to the design.

   All of it is hardcoded demo content. The Spring Boot API replaces this file.
   ========================================================================== */

var GETTA = (function () {
  'use strict';

  /* --- sidebar navigation ------------------------------------------------- */

  var NAV = [
    { v: 'dash',      lbl: 'Dashboard',        ic: 'M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h8v8H3v-8zm10-3h8v11h-8V10z' },
    { v: 'orders',    lbl: 'Orders',           ic: 'M5 3h14v18l-2-1.5L15 21l-2-1.5L11 21l-2-1.5L7 21l-2-1.5V3zm3 5h8v1.8H8V8zm0 4h8v1.8H8V12z' },
    { v: 'products',  lbl: 'Products',         ic: 'M8 2h8l-1 4H9L8 2zm-1 6h10l-1.2 14H8.2L7 8z' },
    { v: 'cats',      lbl: 'Categories',       ic: 'M4 5h16v3H4V5zm0 5.5h16v3H4v-3zM4 16h16v3H4v-3z' },
    { v: 'banners',   lbl: 'Banners & Promos', ic: 'M3 4h18v12H3V4zm4 14h10v2H7v-2zm2-10 6 4-6 4V8z' },
    { v: 'rewards',   lbl: 'Rewards Engine',   ic: 'M13 2 3 14h6l-2 8 10-12h-6l2-8z' },
    { v: 'outlets',   lbl: 'Outlets',          ic: 'M4 9 6 4h12l2 5H4zm1 2h14v9H5v-9zm5 3v6h4v-6h-4z' },
    { v: 'customers', lbl: 'Customers',        ic: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7 .5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20a7 7 0 0 1 14 0H2zm15.5 0a5.5 5.5 0 0 0-2.6-4.7A5 5 0 0 1 22 20h-4.5z' },
    { v: 'settings',  lbl: 'Settings',         ic: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 4a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L16 3H8l-.4 2.6a7 7 0 0 0-2 1.2l-2.5-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.5-1a7 7 0 0 0 2 1.2L8 21h8l.4-2.6a7 7 0 0 0 2-1.2l2.5 1 2-3.4-2-1.6c.06-.4.1-.8.1-1.2z' }
  ];

  var TITLES = {
    dash:      'Dashboard',
    orders:    'Orders',
    products:  'Products',
    cats:      'Categories',
    banners:   'Banners & Promos',
    rewards:   'Rewards Engine',
    outlets:   'Outlets',
    customers: 'Customers',
    settings:  'Settings'
  };

  /* --- sales trend series ------------------------------------------------- */

  var D7 = [520, 610, 480, 700, 640, 810, 780];

  var D30 = [420, 460, 510, 470, 540, 500, 560, 620, 580, 530,
             610, 660, 640, 700, 650, 690, 720, 680, 740, 700,
             760, 730, 690, 780, 750, 800, 770, 820, 790, 840];

  /* --- live order feed queue ---------------------------------------------- */

  var FEEDQ = [
    { who: 'Syafiq R.', items: '2× Kopi Getta, 1× Polo Bun',            amt: 'RM 26.70', type: 'Pickup' },
    { who: 'Aina M.',   items: '1× Pandan Cream Cold Brew',             amt: 'RM 13.90', type: 'Delivery' },
    { who: 'Hafiz O.',  items: '1× Teh Tarik Frappe, 1× Kaya Toast',    amt: 'RM 21.80', type: 'Pickup' },
    { who: 'Mei Ling',  items: '2× Uji Matcha Latte',                   amt: 'RM 29.80', type: 'Delivery' },
    { who: 'Danish A.', items: '1× Duo Bolt Bundle',                    amt: 'RM 19.90', type: 'Pickup' },
    { who: 'Farah N.',  items: '1× Gula Melaka Latte, 1× Polo Bun',     amt: 'RM 21.80', type: 'Pickup' }
  ];

  /* --- orders ------------------------------------------------------------- */

  var ORDERS = [
    {
      id: '#GC-2841', who: 'Afif Maahi', items: 'Gula Melaka Latte, Kopi Getta, Kaya Toast',
      amt: 'RM 32.70', type: 'Pickup',
      lines: [
        { n: '1× Gula Melaka Latte (L, Oat)', p: 'RM 16.90' },
        { n: '1× Kopi Getta',                 p: 'RM 8.90' },
        { n: '1× Kaya Butter Toast',          p: 'RM 9.90' }
      ]
    },
    {
      id: '#GC-2840', who: 'Nur Aisyah', items: 'Pandan Cream Cold Brew ×2',
      amt: 'RM 27.80', type: 'Delivery',
      lines: [{ n: '2× Pandan Cream Cold Brew', p: 'RM 27.80' }]
    },
    {
      id: '#GC-2839', who: 'Syafiq Rahman', items: 'Teh Tarik Frappe, Polo Bun',
      amt: 'RM 20.80', type: 'Pickup',
      lines: [
        { n: '1× Teh Tarik Frappe', p: 'RM 11.90' },
        { n: '1× Polo Bun',         p: 'RM 8.90' }
      ]
    },
    {
      id: '#GC-2838', who: 'Mei Ling Tan', items: 'Uji Matcha Latte',
      amt: 'RM 14.90', type: 'Pickup',
      lines: [{ n: '1× Uji Matcha Latte', p: 'RM 14.90' }]
    },
    {
      id: '#GC-2837', who: 'Hafiz Omar', items: 'Nasi Lemak Brekkie Box, Kopi O',
      amt: 'RM 24.80', type: 'Delivery',
      lines: [
        { n: '1× Nasi Lemak Brekkie Box', p: 'RM 15.90' },
        { n: '1× Kopi O Kosong',          p: 'RM 8.90' }
      ]
    },
    {
      id: '#GC-2836', who: 'Farah Nadia', items: 'Choc Bolt Blended',
      amt: 'RM 15.90', type: 'Pickup',
      lines: [{ n: '1× Choc Bolt Blended', p: 'RM 15.90' }]
    },
    {
      id: '#GC-2835', who: 'Danish Aiman', items: 'Duo Bolt Bundle',
      amt: 'RM 19.90', type: 'Pickup',
      lines: [{ n: '1× Duo Bolt Bundle', p: 'RM 19.90' }]
    }
  ];

  /* --- products ----------------------------------------------------------- */

  var PRODUCTS = [
    { n: 'Kopi Getta',              tag: 'THE OG BOLT',            cat: 'Signature Series', pr: 'RM 8.90',  c1: '#8A5A3B', c2: '#4A2C18' },
    { n: 'Gula Melaka Latte',       tag: 'SWEET LIKE KAMPUNG',     cat: 'Signature Series', pr: 'RM 12.90', c1: '#C08A52', c2: '#6B4423' },
    { n: 'Pandan Cream Cold Brew',  tag: 'GREEN & GORGEOUS',       cat: 'Signature Series', pr: 'RM 13.90', c1: '#9BB86A', c2: '#3E2418' },
    { n: 'Uji Matcha Latte',        tag: 'CALM BUT CHARGED',       cat: 'Matcha',           pr: 'RM 14.90', c1: '#A8C57C', c2: '#5F7F3E' },
    { n: 'Teh Tarik Frappe',        tag: 'PULLED. BLENDED. DONE.', cat: 'Ice Blended',      pr: 'RM 11.90', c1: '#D9A96E', c2: '#9C6B3A' },
    { n: 'Cempedak Cream Blended',  tag: 'LOUD & LOCAL',           cat: 'Ice Blended',      pr: 'RM 16.90', c1: '#E5C063', c2: '#B98B2E' },
    { n: 'Kaya Butter Toast',       tag: 'CRUNCH TIME',            cat: 'Pastry',           pr: 'RM 9.90',  c1: '#E0B060', c2: '#A87428' },
    { n: 'Nasi Lemak Brekkie Box',  tag: 'FUEL OF CHAMPIONS',      cat: 'All Day Brekkie',  pr: 'RM 15.90', c1: '#7FA05A', c2: '#4E6B33' }
  ];

  /* --- categories (the PWA left rail order) -------------------------------- */

  var CATLIST = [
    { n: 'Signature Series', ic: 'M8 2h8l-1 4H9L8 2zm-1 6h10l-1.2 14H8.2L7 8zm5 3-2.4 4.6h2l-1 3.8 3.8-5.4h-2l.8-3z', count: 4 },
    { n: 'Fresh Brew',       ic: 'M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z',                                     count: 2 },
    { n: 'Matcha',           ic: 'M20 4C8 6 4 12 4 20c8 0 14-4 16-16z',                                                 count: 2 },
    { n: 'Ice Blended',      ic: 'M11 2h2v20h-2zM4.2 6.5l15.6 9-1 1.7-15.6-9zM19.8 6.5l-15.6 9 1 1.7 15.6-9z',          count: 3 },
    { n: 'Pastry',           ic: 'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',               count: 2 },
    { n: 'Bundle Promo',     ic: 'M3 3h8l10 10-8 8L3 11V3zm5 3a2 2 0 1 0 .01 0z',                                       count: 1 },
    { n: 'Top Picks',        ic: 'M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z',                                  count: 2 },
    { n: 'All Day Brekkie',  ic: 'M12 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',               count: 2 }
  ];

  /* --- banners ------------------------------------------------------------ */

  var BANS = [
    { t: 'BOLT HOUR — 20% OFF 3–5PM',      bg: 'linear-gradient(112deg,#7A2418,#93331F)', fg: '#F7F1DC', win: '1–31 Aug · 3:00–5:00 PM', taps: 1284 },
    { t: 'NEW: PANDAN CREAM COLD BREW',    bg: 'linear-gradient(112deg,#EE7623,#D2601A)', fg: '#fff',    win: '8–22 Aug · all day',      taps: 921 },
    { t: 'REFER A FRIEND, GET RM5',        bg: 'linear-gradient(112deg,#2B1510,#4E2A16)', fg: '#F7F1DC', win: 'Always on',               taps: 468 }
  ];

  /* --- outlets ------------------------------------------------------------ */

  var OUTLETS = [
    { n: 'Getta Coffee Kubang Kerian',  addr: 'Jalan Raja Perempuan Zainab II, Kota Bharu', hours: '7:00 AM – 11:00 PM', zones: ['Kubang Kerian', 'Kota Bharu 5km'], flagship: true },
    { n: 'Getta Coffee Wakaf Che Yeh',  addr: 'Jalan Kuala Krai, Kota Bharu',                hours: '8:00 AM – 12:00 AM', zones: ['Wakaf Che Yeh'] },
    { n: 'Getta Coffee Pengkalan Chepa', addr: 'Near UMK Campus, Pengkalan Chepa',           hours: '7:00 AM – 10:00 PM', zones: ['Pengkalan Chepa', 'Kampus UMK'] },
    { n: 'Getta Coffee Tanah Merah',    addr: 'Pusat Bandar Tanah Merah',                    hours: '8:00 AM – 10:00 PM', zones: ['Tanah Merah'] }
  ];

  /* --- customers ---------------------------------------------------------- */

  var CUST = [
    {
      n: 'Afif Maahi Abu Bakar', email: 'afif.maahi@gmail.com', tier: 'Easy Goer',
      pts: 240, wal: 'RM 24.60', ord: 38, streak: '4/10',
      hist: [
        { n: 'Gula Melaka Latte +2', d: 'Today, 9:32 AM', p: 'RM 32.70' },
        { n: 'Kopi Getta',           d: 'Yesterday',      p: 'RM 8.90' },
        { n: 'Duo Bolt Bundle',      d: '11 Aug',         p: 'RM 19.90' }
      ]
    },
    {
      n: 'Nur Aisyah Zainal', email: 'aisyah.z@gmail.com', tier: 'Gold Bolt',
      pts: 1240, wal: 'RM 58.00', ord: 112, streak: '8/10',
      hist: [
        { n: 'Pandan Cold Brew ×2', d: 'Today, 8:15 AM', p: 'RM 27.80' },
        { n: 'Uji Matcha Latte',    d: '12 Aug',         p: 'RM 14.90' }
      ]
    },
    {
      n: 'Syafiq Rahman', email: 'syafiq.r@yahoo.com', tier: 'Easy Goer',
      pts: 420, wal: 'RM 12.30', ord: 54, streak: '2/10',
      hist: [{ n: 'Teh Tarik Frappe', d: 'Today, 10:02 AM', p: 'RM 20.80' }]
    },
    {
      n: 'Mei Ling Tan', email: 'meiling.tan@gmail.com', tier: 'Gold Bolt',
      pts: 1080, wal: 'RM 35.50', ord: 96, streak: '6/10',
      hist: [{ n: 'Uji Matcha Latte', d: 'Today, 9:50 AM', p: 'RM 14.90' }]
    },
    {
      n: 'Hafiz Omar', email: 'hafiz.omar@gmail.com', tier: 'Easy Goer',
      pts: 180, wal: 'RM 5.00', ord: 21, streak: '1/10',
      hist: [{ n: 'Brekkie Box + Kopi O', d: 'Today, 8:40 AM', p: 'RM 24.80' }]
    },
    {
      n: 'Farah Nadia', email: 'farah.nd@gmail.com', tier: 'New Bolt',
      pts: 60, wal: 'RM 0.00', ord: 4, streak: '1/10',
      hist: [{ n: 'Choc Bolt Blended', d: 'Today, 10:15 AM', p: 'RM 15.90' }]
    }
  ];

  return {
    NAV: NAV,
    TITLES: TITLES,
    D7: D7,
    D30: D30,
    FEEDQ: FEEDQ,
    ORDERS: ORDERS,
    PRODUCTS: PRODUCTS,
    CATLIST: CATLIST,
    BANS: BANS,
    OUTLETS: OUTLETS,
    CUST: CUST
  };
}());
