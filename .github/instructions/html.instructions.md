---
applyTo: "**/*.html"
---

- Use semantic markup (`header`, `nav`, `main`, `section`, `footer`) over generic
  `div`s where an element already means the right thing.
- Localized `hreflang` `<link>` tags are injected client-side by `main.js`'s
  hreflang injector from a `HREFLANG_LANGS` array (see
  `agents/instructions/common/js.instructions.md`), do not look for them as
  static markup in the HTML, and do not hand-add static `<link rel="alternate"
  hreflang="...">` tags (that would duplicate what the script already injects).
  When adding a locale, the array and the locale directory must be kept in
  sync, not the HTML.
- The `data-languages` JSON attribute on `.language-selector` elements must be
  valid JSON, list every supported locale, and use correct relative paths for the
  page's depth (e.g. `./`, `../de/`, `../../de/products/metric.html`). Keep
  `data-active-lang` in sync with the page's actual locale.
- Every `<img>` needs `alt` text. Empty `alt=""` is only correct for a purely
  decorative image.
- Every page needs a `<title>`, a meta `description`, and `og:` / `twitter:` image
  tags that match what the page actually shows: don't copy another page's tags
  without updating them.
