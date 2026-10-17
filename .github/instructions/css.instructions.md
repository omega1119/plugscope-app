---
applyTo: "assets/css/styles.css"
---

- Reuse the custom properties already declared in `:root` and
  `[data-theme="dark"]` instead of hardcoding a colour, spacing, or shadow value
  that already has a token.
- Every new rule needs a dark-mode counterpart under `[data-theme="dark"]`, unless
  it already only uses tokens that are themed automatically. Don't ship
  light-only styling.
- Reuse existing layout primitives (`.container`, `.product-grid`,
  `.theory-table-wrap`, `.language-selector`, `.skip-link`, etc.) instead of
  inventing a new class for something an existing one already does.
