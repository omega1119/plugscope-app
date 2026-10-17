---
applyTo: "assets/js/*.js"
---

- Locale-keyed config lives in string maps (e.g. `LANG_NAMES`, `FOOTER_STRINGS`,
  `HREFLANG_LANGS`, `NAV_STRINGS`, `STORE_URLS`, `SUPPORTED_LANGS`,
  `COUNTRY_TO_LANG`, `LOCALE_ALIASES`). Adding a locale means adding an entry to
  every one of these maps that the repo has, not just the ones a feature happens
  to touch.
- Locale lookups go through the repo's `resolveLang()` helper (or equivalent):
  try the full code first (`pt-br`, `zh-hans`), then fall back to the base code
  (`pt`, `zh`). Don't add a new lookup path that skips this fallback.
- Hyphenated locale codes in `data-*` attributes map to camelCase in `dataset`
  (`data-redirect-pt-br` → `dataset.redirectPtBr`). Preserve that mapping when
  wiring up a new locale.
