# PlugScope

Marketing website for **PlugScope** — a lightweight macOS menu-bar utility that maps and
explains your Mac's USB and Thunderbolt topology (buses, hubs, devices, link speeds, power
budgets, live disk throughput, and attached storage) in one clean, glanceable view.

Published by **Greenwood IT Consultancy Ltd**. Live at [plugscope.app](https://plugscope.app).

## Structure

Static HTML/CSS/JS site hosted on GitHub Pages.

```
plugscope-app/
├── index.html          # Root redirect → /en/
├── privacy.html        # Root redirect → /en/privacy.html
├── CNAME               # plugscope.app
├── _config.yml         # Jekyll/GitHub Pages metadata
├── favicon.svg
├── assets/
│   ├── css/styles.css  # Shared stylesheet (dark/light theme)
│   ├── js/main.js      # Nav, footer, theme toggle, cookie consent, store badge, JSON-LD
│   ├── js/redirect.js  # Language redirect (English-only for now)
│   └── images/         # Bezels, Mac App Store badges, screenshots
└── en/
    ├── index.html      # Landing page
    └── privacy.html    # Privacy policy
```

## Localization

The site currently ships **English only**, but the infrastructure mirrors the multilingual
setup used across the other Greenwood sites. To add a language later:

1. Create a folder for the locale (e.g. `de/`) with `index.html` and `privacy.html`.
2. Set `<html lang="…">`, translate the copy, and update each page's
   `data-languages` selector map + `data-active-lang`.
3. Add translated strings to the dictionaries in `assets/js/main.js`
   (`FOOTER_STRINGS`, `NAV_STRINGS`, `SKIP_STRINGS`, `COOKIE_STRINGS`, `STORE_BADGE_DATA`).
4. Add the language code to `HREFLANG_LANGS` in `main.js`, to `SUPPORTED_LANGS`
   (and `COUNTRY_TO_LANG` / `LOCALE_ALIASES`) in `assets/js/redirect.js`, and add a
   matching `data-redirect-<lang>` attribute to the root `index.html` / `privacy.html`.

## Local preview

See [LOCAL_DEV.md](LOCAL_DEV.md).