#!/usr/bin/env python3
"""Mechanically check the static-site conventions documented in agents/ and skills/.

Checks, per repo root passed on the command line:

  - locale file parity: every locale directory (e.g. de/, pt-br/) has the same
    set of relative HTML pages as every other one. The `data-languages` JSON on
    each page and the `HREFLANG_LANGS`-driven hreflang injector in main.js (see
    below) both assume this and would otherwise point at a 404.
  - HREFLANG_LANGS in assets/js/main.js (if the repo uses that pattern) matches
    the locale directories actually on disk. NOTE: hreflang <link> tags are
    injected client-side by main.js's initHreflang(), not written statically
    into the HTML -- do not expect to find <link rel="alternate" hreflang> by
    grepping the HTML source.
  - `data-languages` JSON on `.language-selector` elements: valid JSON, no
    missing/extra locale keys, and every relative path resolves to a real file
    or directory (with an implied index.html) from the page.
  - `<img>` missing `alt`; pages missing `<title>`, meta `description`, or
    `og:image`.
  - external `<script src>` outside the Google Analytics allowlist.
  - CSS line-count drift against reference/styles.css. Report only -- per
    decision 0.3, this repo does not own the canonical stylesheet yet.

Exit codes:
  0  files were scanned and nothing was found
  1  no files were scanned, so a clean result would be meaningless
  2  violations found
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

SKIP_DIRS = {".git", "node_modules", ".jekyll-cache", "_site", "vendor"}

LOCALE_DIR_RE = re.compile(r"^[a-z]{2}(-[a-z]{2,4})?$")
HREFLANG_ARRAY_RE = re.compile(r"HREFLANG_LANGS\s*=\s*\[([^\]]*)\]")
LOCALE_CODE_RE = re.compile(r"'([a-z]{2}(?:-[a-z]{2,4})?)'")
DATA_LANGUAGES_RE = re.compile(r"data-languages\s*=\s*(['\"])(.*?)\1", re.DOTALL)
IMG_TAG_RE = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
ALT_ATTR_RE = re.compile(r"""\balt\s*=\s*(["']).*?\1""", re.IGNORECASE)
TITLE_RE = re.compile(r"<title>\s*\S", re.IGNORECASE)
META_DESC_RE = re.compile(
    r"""<meta\s+[^>]*name\s*=\s*["']description["'][^>]*>""", re.IGNORECASE
)
OG_IMAGE_RE = re.compile(
    r"""<meta\s+[^>]*property\s*=\s*["']og:image["'][^>]*>""", re.IGNORECASE
)
SCRIPT_SRC_RE = re.compile(
    r"""<script\b[^>]*\bsrc\s*=\s*["'](https?://[^"']+)["']""", re.IGNORECASE
)
SCRIPT_SRC_ALLOWLIST = ("https://www.googletagmanager.com/",)

# Linktree-style social-links pages (harmonic-tools and nullform-audio both
# have en/links/index.html) are not expected to be translated into every
# locale or to list every locale in data-languages -- exempt them from those
# two checks, but still check their markup like any other page.
PARITY_EXEMPT_DIRS = {"links"}


def _is_parity_exempt(rel_to_locale: str) -> bool:
    return Path(rel_to_locale).parts[0] in PARITY_EXEMPT_DIRS


def iter_files(root: Path, extensions: tuple[str, ...]):
    suffixes = {f".{e.lstrip('.')}" for e in extensions}
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix not in suffixes:
            continue
        if set(path.parts) & SKIP_DIRS:
            continue
        yield path


def find_locale_dirs(root: Path) -> list[Path]:
    dirs = []
    for child in sorted(root.iterdir()):
        if child.is_dir() and child.name not in SKIP_DIRS and LOCALE_DIR_RE.match(child.name):
            if any(child.rglob("*.html")):
                dirs.append(child)
    return dirs


def check_locale_parity(root: Path, locale_dirs: list[Path]) -> list[str]:
    violations = []
    per_locale = {
        d.name: {
            str(p.relative_to(d)) for p in d.rglob("*.html") if not _is_parity_exempt(str(p.relative_to(d)))
        }
        for d in locale_dirs
    }
    if len(per_locale) < 2:
        return violations
    union = set().union(*per_locale.values())
    for lang, files in sorted(per_locale.items()):
        for missing in sorted(union - files):
            violations.append(
                f"{root.name}: locale '{lang}/' is missing {missing} "
                f"(present in at least one other locale)"
            )
    return violations


def check_hreflang_sync(root: Path, locale_dirs: list[Path]) -> list[str]:
    violations = []
    main_js = root / "assets" / "js" / "main.js"
    if not main_js.exists():
        return violations
    text = main_js.read_text(encoding="utf-8", errors="replace")
    match = HREFLANG_ARRAY_RE.search(text)
    if not match:
        return violations
    js_codes = set(LOCALE_CODE_RE.findall(match.group(1)))
    disk_codes = {d.name for d in locale_dirs}
    for lang in sorted(disk_codes - js_codes):
        violations.append(
            f"{root.name}: {lang}/ exists on disk but is missing from "
            f"HREFLANG_LANGS in assets/js/main.js"
        )
    for lang in sorted(js_codes - disk_codes):
        violations.append(
            f"{root.name}: HREFLANG_LANGS in assets/js/main.js lists '{lang}' "
            f"but there is no {lang}/ directory"
        )
    return violations


def _resolve_data_languages_target(page: Path, rel: str) -> bool:
    target = (page.parent / rel).resolve()
    if target.is_dir():
        return (target / "index.html").exists()
    return target.exists()


def check_data_languages(page: Path, locale_codes: set[str], parity_exempt: bool) -> list[str]:
    violations = []
    text = page.read_text(encoding="utf-8", errors="replace")
    for match in DATA_LANGUAGES_RE.finditer(text):
        raw = html.unescape(match.group(2))
        try:
            mapping = json.loads(raw)
        except json.JSONDecodeError as exc:
            violations.append(f"{page}: invalid data-languages JSON ({exc})")
            continue
        if not isinstance(mapping, dict):
            violations.append(f"{page}: data-languages JSON is not an object")
            continue
        if locale_codes and not parity_exempt:
            for lang in sorted(locale_codes - mapping.keys()):
                violations.append(f"{page}: data-languages is missing entry for '{lang}'")
            for lang in sorted(mapping.keys() - locale_codes):
                violations.append(f"{page}: data-languages has entry for unknown locale '{lang}'")
        for lang, rel in mapping.items():
            if not isinstance(rel, str) or not _resolve_data_languages_target(page, rel):
                violations.append(
                    f"{page}: data-languages['{lang}'] = '{rel}' does not resolve "
                    f"to an existing file"
                )
    return violations


def check_page_markup(page: Path) -> list[str]:
    violations = []
    text = page.read_text(encoding="utf-8", errors="replace")

    for img in IMG_TAG_RE.findall(text):
        if not ALT_ATTR_RE.search(img):
            snippet = img if len(img) <= 100 else img[:97] + "..."
            violations.append(f"{page}: <img> missing alt: {snippet}")

    if not TITLE_RE.search(text):
        violations.append(f"{page}: missing <title>")
    if not META_DESC_RE.search(text):
        violations.append(f"{page}: missing meta description")
    if not OG_IMAGE_RE.search(text):
        violations.append(f"{page}: missing og:image")

    for src in SCRIPT_SRC_RE.findall(text):
        if not src.startswith(SCRIPT_SRC_ALLOWLIST):
            violations.append(f"{page}: external <script src=\"{src}\"> not in the allowlist")

    return violations


def check_css_drift(root: Path, reference: Path | None) -> list[str]:
    if reference is None:
        return []
    css = root / "assets" / "css" / "styles.css"
    if not css.exists():
        return []
    ref_lines = reference.read_text(encoding="utf-8", errors="replace").splitlines()
    repo_lines = css.read_text(encoding="utf-8", errors="replace").splitlines()
    if ref_lines == repo_lines:
        return []
    return [
        f"{root.name}: assets/css/styles.css differs from reference/styles.css "
        f"({len(repo_lines)} lines vs {len(ref_lines)}; report only, not enforced)"
    ]


def check_repo(root: Path, reference: Path | None) -> tuple[list[str], int]:
    violations: list[str] = []

    html_files = list(iter_files(root, ("html",)))
    css_files = list(iter_files(root, ("css",)))
    scanned = len(html_files) + len(css_files)

    locale_dirs = find_locale_dirs(root)
    locale_codes = {d.name for d in locale_dirs} if len(locale_dirs) > 1 else set()
    locale_dir_by_name = {d.name: d for d in locale_dirs}

    violations += check_locale_parity(root, locale_dirs)
    violations += check_hreflang_sync(root, locale_dirs)
    for page in html_files:
        locale_dir = locale_dir_by_name.get(page.relative_to(root).parts[0])
        parity_exempt = bool(locale_dir) and _is_parity_exempt(str(page.relative_to(locale_dir)))
        violations += check_data_languages(page, locale_codes, parity_exempt)
        violations += check_page_markup(page)
    for css in css_files:
        if css.name == "styles.css":
            violations += check_css_drift(root, reference)

    return violations, scanned


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("paths", nargs="+", type=Path, help="one or more site repo roots")
    parser.add_argument(
        "--reference",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "reference" / "styles.css",
        help="canonical styles.css used only for drift reporting (default: web-common/reference/styles.css)",
    )
    parser.add_argument("--quiet", action="store_true", help="summary only")
    args = parser.parse_args()

    missing = [p for p in args.paths if not p.exists()]
    if missing:
        print(f"error: path not found: {', '.join(str(m) for m in missing)}", file=sys.stderr)
        return 1

    reference = args.reference if args.reference.exists() else None
    if reference is None:
        print(f"warning: reference stylesheet not found at {args.reference}, skipping CSS drift check", file=sys.stderr)

    total_violations: list[str] = []
    total_scanned = 0
    for root in args.paths:
        violations, scanned = check_repo(root.resolve(), reference)
        total_scanned += scanned
        total_violations += violations

    if not args.quiet:
        for v in total_violations:
            print(v)

    print(f"\nscanned {total_scanned} files (.html + .css) across {len(args.paths)} repo(s)", file=sys.stderr)

    if total_scanned == 0:
        print(
            "error: scanned 0 files, so this result proves nothing. Check the paths.",
            file=sys.stderr,
        )
        return 1

    if total_violations:
        print(f"FAIL: {len(total_violations)} violation(s)", file=sys.stderr)
        return 2

    print("OK: no violations", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
