<!-- BEGIN GENERATED (web-common/agents/copilot-instructions.md -- edits here are overwritten by tools/sync-agent-config.sh) -->

# Agent instructions

This is a static site: hand-written HTML, CSS, and vanilla JS, deployed to GitHub
Pages from the `main` branch. There is no build step, no npm, no bundler, and no
framework (React, Vue, a static site generator's templating, etc.). Edit the HTML
files directly: do not introduce a build pipeline to "improve" this.

## Never change these without explicit approval

These are load-bearing. Changing them silently breaks live URLs, analytics history,
or JS that reads them by exact string:

- **URL slugs and file paths** (e.g. `en/products/metric.html`). Renaming or moving
  a page breaks bookmarks, search rankings, and inbound links from the App Store or
  other sites.
- **Anchor IDs** (`id="..."` targeted by in-page links or external deep links).
- **The Google Analytics measurement ID** (`G-XXXXXXXXXX` in the `gtag.js` snippet).
  Changing it silently orphans historical analytics data.
- **`data-*` attribute contracts** read by `assets/js/main.js` and
  `assets/js/redirect.js`, e.g. `data-languages`, `data-active-lang`,
  `data-footer-type`, `data-store` / `data-store-product`, `data-redirect-<lang>`,
  `data-theme` on `<source>` elements. These scripts parse specific attribute names
  and values; renaming or restructuring one without updating the JS (and every HTML
  file that uses it) breaks the feature with no error.

## General conventions

- No external `<script src>` beyond Google's `gtag.js`: do not add other
  third-party scripts without asking first.
- Fonts are self-hosted (`assets/fonts/*.woff2` + `@font-face` in `styles.css`), not
  loaded from Google Fonts or any other external stylesheet host. Every repo used to
  load its body font (usually Inter) from `fonts.googleapis.com`; all were migrated
  to self-hosted `@font-face` declarations in Sep 2026. Don't reintroduce an external
  font `<link>`: add a new self-hosted woff2 instead.
- When adding a page, copy an existing locale's page as the template rather than
  writing one from scratch, to keep markup structure consistent across locales.

<!-- END GENERATED -->

<!-- Per-repo notes go below this line. Never touched by the sync script. -->

## plugscope-app specifics

- Domain `plugscope.app`. Publisher Greenwood IT Consultancy Ltd. One product:
  PlugScope, a macOS menu-bar utility that maps USB and Thunderbolt topology. Mac App
  Store only (no iOS version).
- Google Analytics measurement ID `G-WMME265SQC`: unique to this repo. It is NOT shared
  with `harmonic-tools` (`G-JQ9FPYHNVR`).
- English only today (`en`), but the JS is built for more locales: `main.js` has
  `LANG_NAMES`, `NAV_STRINGS`, `FOOTER_STRINGS`, `STORE_URLS`, `HREFLANG_LANGS`
  (currently `['en']`) and `resolveLang()`, and `redirect.js` has `SUPPORTED_LANGS`,
  `COUNTRY_TO_LANG` and `LOCALE_ALIASES`. Adding a locale means touching all of them
  (see `prompts/add-locale.prompt.md` in `web-common`).
- Root `index.html` and `privacy.html` are redirect shells into `en/`. The real pages
  are `en/index.html` and `en/privacy.html`. There is no terms page.
- Store badge behaviour: `STORE_URLS` maps a product name to its App Store URL. A
  product without an entry renders a non-clickable badge. `data-store` and
  `data-store-product` on the page drive this, so keep them in step with the JS.
- `assets/css/styles.css` is currently byte-identical to the one in `harmonic-tools`.
  If you change shared rules here, say so in the PR so the two can be kept in step.
- Cache-busting: CSS and JS are referenced with a `?v=N` query string. Bump it when
  you change `styles.css` or `main.js`.
