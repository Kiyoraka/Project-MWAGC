# Getta Coffee — HQ Console (hardcoded front end)

Software Version: 1.0 (static mockup)

## Description

A static, hardcoded web application demonstrating the **admin side** of the Getta
Coffee ordering platform: a login screen and a nine-view HQ console with live
sales figures, orders, menu management, loyalty rules, outlets and customers.

Everything on screen is demo data. There is no backend, no database and no real
authentication. This build exists to be the **visual and behavioural reference**
the Java / Spring Boot implementation is later wrapped around, and the artifact
shown to the client before that build starts.

## Running it

Double-click `index.html`, or serve the folder with any static server:

```bash
python -m http.server 8080      # then open http://localhost:8080
```

**Any email and any password will sign you in** — see the security note below.
Sign out from the button at the bottom of the sidebar.

Fonts (Baloo 2 + Outfit) load from Google Fonts, so the first load needs an
internet connection. Everything else is local.

## Structure

```
index.html              login (split-screen)
admin.html              console shell + nine view containers
assets/
  css/
    tokens.css          design tokens, base layer, keyframes
    login.css           login page
    admin.css           console shell + all nine views
  js/
    data.js             all demo data, verbatim from the design
    login.js            demo sign-in + session flag
    admin.js            state, render loop, handlers, nine view modules
```

## The nine views

| View | What it shows |
|---|---|
| Dashboard | Sales tiles, animated 7/30-day trend chart, live order feed, pickup/delivery donut |
| Orders | Order table with a detail panel and a four-step status flow |
| Products | Catalogue with availability toggles and an edit panel |
| Categories | Drag-to-reorder rail with a live PWA preview |
| Banners & Promos | Scheduled banners and the promo announcement bar |
| Rewards Engine | Points rules, daily check-in values, missions, voucher creator |
| Outlets | Four outlets with hours, delivery zones and pickup toggles |
| Customers | Loyalty table with a customer detail panel |
| Settings | Brand tokens, logo, payment methods |

## Design source

Ported from the Claude Design project **"Getta Coffee ordering platform"**
(`9b7c1d15-3ef9-4fb5-9689-4a1c26428a10`) — specifically `Getta Admin.dc.html`
and `Getta Design Tokens.dc.html`.

Those files run on Claude Design's own runtime (`<x-dc>`, `sc-for`, `sc-if`,
`DCLogic`), which no browser can execute, so the console was hand-ported to
vanilla JS: same markup, same values, same data, same animation timings, a
different renderer. `support.js` from the design project is not used here.

**Two deliberate departures from the mockup**, both requested during review:

1. **Full-bleed** — the design presents the console as a floating 1440px card on
   a cream page; here it fills the viewport like a deployed app.
2. **Sign out button** — replaces the "Deployed on DigitalOcean App Platform"
   chip in the sidebar footer.

There is no login screen in the design project; that page was composed from the
tokens.

## Brand

| Token | Value | Use |
|---|---|---|
| Brick Maroon | `#7A2418` | Primary, nav fills |
| Vivid Orange | `#EE7623` | CTAs, bolt motif, progress |
| Orange (small text) | `#C2570F` | AA-safe substitute on light surfaces |
| Cream | `#F7F1DC` | Surfaces, text on maroon |
| Dark Roast | `#2B1510` | Body text |

Display type is Baloo 2; body type is Outfit. The lightning bolt always strikes
top-right to bottom-left, and the G-mug is never rotated.

## Security note

`assets/js/login.js` performs **no authentication**. It checks that both fields
are non-empty, writes a flag to `sessionStorage`, and navigates to the console.
Nothing is transmitted and no credential is stored or verified. `admin.html`
checks only for that flag.

This is intentional for a demo. Replace the file wholesale when the real API
lands — do not build on top of it.

## Next

The Spring Boot build consumes this as its static front end. The customer PWA
(nine more screens, also in the design project) is a separate piece of work.
