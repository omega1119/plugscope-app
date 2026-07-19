(function(){
  const root = document.documentElement;
  const themeBtn = document.querySelector('.theme-toggle');
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const yearEl = document.getElementById('year');

  // ── Language Helper ─────────────────────────────────────
  // Returns the full lowercase lang code from <html lang>, e.g. 'en'.
  // Additional languages can be added to the dictionaries below later.
  function getPageLang() {
    return (root.getAttribute('lang') || 'en').toLowerCase();
  }
  function resolveLang(dict) {
    var full = getPageLang();
    if (dict[full]) return full;
    var base = full.split('-')[0];
    return dict[base] ? base : 'en';
  }

  // ── Language Dropdown Injector ──────────────────────────────
  // Usage: <div class="language-selector"
  //             data-languages='{"en":"./"}'
  //             data-active-lang="en"></div>
  const LANG_NAMES = {
    en:'English', de:'Deutsch', es:'Español', fr:'Français',
    pl:'Polski', ja:'日本語', ko:'한국어', pt:'Português',
    'pt-br':'Português (Brasil)', 'pt-pt':'Português (Portugal)',
    'zh-hans':'简体中文', 'zh-hant':'繁體中文'
  };
  const GLOBE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="currentColor" fill-rule="evenodd" d="M2 16c0 7.72 6.28 14 14 14s14-6.28 14-14S23.72 2 16 2S2 8.28 2 16m2.041-1c.15-1.81.703-3.506 1.568-5h3.55a16 16 0 0 0-1.128 5zm5.994 0a14 14 0 0 1 1.31-5H15v5zM15 17h-4.965a14 14 0 0 0 1.31 5H15zm0 7h-2.494A14 14 0 0 0 15 26.73zm4.005 3.62A12 12 0 0 0 24.94 24h-3.074a16 16 0 0 1-2.86 3.62M22.84 22h3.55v.002A11.9 11.9 0 0 0 27.959 17h-3.99a16 16 0 0 1-1.13 5m-.875-5a14 14 0 0 1-1.31 5H17v-5zm2.004-2h3.99a11.9 11.9 0 0 0-1.569-5.002V10h-3.55a16 16 0 0 1 1.13 5m-3.315-5a14 14 0 0 1 1.31 5H17v-5zm1.212-2h3.073a12 12 0 0 0-5.926-3.618A16 16 0 0 1 21.865 8M17 5.27V8h2.494A14 14 0 0 0 17 5.27m-2 0A14 14 0 0 0 12.506 8H15zM17 24v2.73A14 14 0 0 0 19.494 24zM5.609 22h3.554a16 16 0 0 1-1.132-5H4.04c.15 1.81.703 3.506 1.568 5M13 27.621A16 16 0 0 1 10.14 24H7.06a12 12 0 0 0 5.941 3.621M10.134 8a16 16 0 0 1 2.853-3.617A12 12 0 0 0 7.061 8z" clip-rule="evenodd"/></svg>';

  function initLanguageDropdowns() {
    document.querySelectorAll('.language-selector[data-languages]').forEach((el) => {
      let langs;
      try { langs = JSON.parse(el.getAttribute('data-languages')); } catch { return; }
      const activeLang = (el.getAttribute('data-active-lang') || '').toLowerCase();
      const keys = Object.keys(langs);
      if (!keys.length) return;
      // Hide the selector entirely when only one language is available.
      if (keys.length < 2) { el.style.display = 'none'; return; }

      const btn = document.createElement('button');
      btn.className = 'language-btn';
      btn.setAttribute('aria-label', 'Change language');
      btn.setAttribute('title', 'Change language');
      btn.innerHTML = GLOBE_SVG;

      const dropdown = document.createElement('div');
      dropdown.className = 'language-dropdown';
      keys.forEach((code) => {
        const a = document.createElement('a');
        a.className = 'language-option';
        a.setAttribute('href', langs[code]);
        a.setAttribute('lang', code);
        a.textContent = LANG_NAMES[code] || code;
        if (code === activeLang) a.classList.add('active');
        dropdown.appendChild(a);
      });

      el.innerHTML = '';
      el.appendChild(btn);
      el.appendChild(dropdown);
    });
  }
  initLanguageDropdowns();

  // ── Footer Injector ─────────────────────────────────────
  // Usage: <footer class="site-footer" data-footer-type="full"></footer>
  //    or: <footer class="site-footer" data-footer-type="simple"></footer>
  // "full" = copyright + Privacy link (index pages)
  // "simple" = copyright only (privacy page)
  const FOOTER_STRINGS = {
    en: { privacy: 'Privacy' }
  };

  function initFooter() {
    const footer = document.querySelector('footer.site-footer[data-footer-type]');
    if (!footer) return;

    const type = footer.getAttribute('data-footer-type') || 'simple';
    const lang = resolveLang(FOOTER_STRINGS);
    const s = FOOTER_STRINGS[lang] || FOOTER_STRINGS.en;

    const privacyHref = './privacy.html';

    let html = '<div class="container footer-inner">' +
      '<small>\u00a9 <span id="year"></span> Greenwood IT Consultancy Ltd</small>';

    if (type === 'full') {
      html += '<ul class="footer-links">' +
        '<li><a href="' + privacyHref + '">' + s.privacy + '</a></li>' +
        '</ul>';
    }

    html += '</div>';
    footer.innerHTML = html;

    const y = footer.querySelector('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }
  initFooter();

  // ── Hreflang Injector ───────────────────────────────────
  // Generates <link rel="alternate" hreflang="..."> tags for every
  // supported language. Currently English-only; add codes here as
  // localized pages are created.
  const HREFLANG_LANGS = ['en'];
  const HREFLANG_ORIGIN = 'https://plugscope.app';

  function initHreflang() {
    const path = window.location.pathname;
    const match = path.match(/^\/([a-z]{2}(?:-[a-z]+)?)(\/.*)?$/);
    if (!match) return;

    const pagePart = match[2] || '/';

    const head = document.head;
    HREFLANG_LANGS.forEach(function(lang) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = HREFLANG_ORIGIN + '/' + lang + pagePart;
      head.appendChild(link);
    });

    const xd = document.createElement('link');
    xd.rel = 'alternate';
    xd.hreflang = 'x-default';
    xd.href = HREFLANG_ORIGIN + '/en' + pagePart;
    head.appendChild(xd);
  }
  initHreflang();

  // ── Skip-Link Injector ──────────────────────────────────
  const SKIP_STRINGS = {
    en: 'Skip to content'
  };

  function initSkipLink() {
    const lang = resolveLang(SKIP_STRINGS);
    const text = SKIP_STRINGS[lang] || SKIP_STRINGS.en;
    const a = document.createElement('a');
    a.className = 'skip-link';
    a.href = '#main';
    a.textContent = text;
    document.body.insertBefore(a, document.body.firstChild);
  }
  initSkipLink();

  // ── Nav Items Injector ──────────────────────────────────
  // Populates <ul id="primary-menu" class="nav-list"></ul> based on page type.
  const NAV_STRINGS = {
    en: { features: 'Features', screenshots: 'Screenshots', home: 'Home' }
  };

  function initNavItems() {
    const ul = document.querySelector('ul#primary-menu.nav-list');
    if (!ul) return;

    const lang = resolveLang(NAV_STRINGS);
    const s = NAV_STRINGS[lang] || NAV_STRINGS.en;

    const path = window.location.pathname;
    const isIndex = /\/[a-z]{2}(?:-[a-z]+)?\/$/.test(path) || /\/[a-z]{2}(?:-[a-z]+)?\/index\.html$/.test(path);

    const items = [];
    if (isIndex) {
      items.push({ label: s.features, href: '#features' });
      items.push({ label: s.screenshots, href: '#screenshots' });
    } else {
      items.push({ label: s.home, href: './' });
      items.push({ label: s.features, href: './#features' });
    }

    ul.innerHTML = '';
    items.forEach(function(item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }
  initNavItems();

  // ── Store Badge Injector ────────────────────────────────
  // Usage: <span class="store-badge store-badge--disabled"
  //              data-store="mac"
  //              data-store-product="PlugScope"></span>
  // Products with a URL in STORE_URLS become clickable links;
  // all others render as disabled "Coming Soon" badges.
  const STORE_URLS = {
    'PlugScope': 'https://apps.apple.com/us/app/plugscope/id6790723352?mt=12'
  };
  const STORE_BADGE_DATA = {
    en: {
      comingSoon: 'Coming Soon',
      mac: {
        alt: 'Download on the Mac App Store',
        ariaPrefix: 'coming soon on the Mac App Store',
        dark: 'Download-on-the-Mac-App-Store/US/Download_on_Mac_App_Store/Black_lockup/SVG/Download_on_the_Mac_App_Store_Badge_US-UK_RGB_blk_092917.svg',
        light: 'Download-on-the-Mac-App-Store/US/Download_on_Mac_App_Store/White_lockup/SVG/Download_on_the_Mac_App_Store_Badge_US-UK_RGB_wht_092917.svg'
      }
    }
  };

  function initStoreBadges() {
    var lang = resolveLang(STORE_BADGE_DATA);
    var data = STORE_BADGE_DATA[lang] || STORE_BADGE_DATA.en;
    var assetsPrefix = '../assets/images/';

    document.querySelectorAll('.store-badge[data-store]').forEach(function(el) {
      var store = el.getAttribute('data-store'); // "mac"
      var product = el.getAttribute('data-store-product') || '';
      var info = data[store];
      if (!info) return;

      var storeUrl = STORE_URLS[product];

      var img = document.createElement('img');
      img.src = assetsPrefix + info.dark;
      img.setAttribute('data-theme-src-light', assetsPrefix + info.light);
      img.setAttribute('data-theme-src-dark', assetsPrefix + info.dark);
      img.alt = info.alt;
      img.width = 180;
      img.height = 53;

      if (storeUrl) {
        el.classList.remove('store-badge--disabled');
        el.setAttribute('aria-label', info.alt + ': ' + product);
        var a = document.createElement('a');
        a.href = storeUrl;
        a.appendChild(img);
        el.appendChild(a);
      } else {
        el.setAttribute('aria-label', product + ' ' + info.ariaPrefix);
        el.appendChild(img);
        var label = document.createElement('span');
        label.className = 'coming-soon-label';
        label.textContent = data.comingSoon;
        el.appendChild(label);
      }
    });
  }
  initStoreBadges();

  // ── Software Application JSON-LD Injector ────────────────
  // Injects the SoftwareApplication schema block into <head> on the
  // index page.
  function initAppJsonLd() {
    var path = window.location.pathname;
    var isIndex = /\/[a-z]{2}(?:-[a-z]+)?\/$/.test(path) || /\/[a-z]{2}(?:-[a-z]+)?\/index\.html$/.test(path);
    if (!isIndex) return;

    var schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'PlugScope',
      'operatingSystem': 'macOS',
      'applicationCategory': 'UtilitiesApplication',
      'description': 'A lightweight menu-bar utility that maps and explains your Mac\u2019s USB and Thunderbolt topology (buses, hubs, devices, link speeds, power budgets, live disk throughput, and attached storage) in one clean, glanceable view.',
      'url': 'https://plugscope.app/en/',
      'author': {
        '@type': 'Organization',
        'name': 'Greenwood IT Consultancy Ltd'
      },
      'offers': {
        '@type': 'Offer',
        'price': '4.99',
        'priceCurrency': 'GBP'
      },
      'featureList': [
        'USB topology (host controllers, hubs, devices)',
        'Colour-coded power budget meter',
        'Over-budget and underpowered device alerts',
        'Degraded-link detection',
        'Live disk read/write throughput with history graph',
        'Thunderbolt / USB4 bus, mode and link-speed detail',
        'Dashboard summary with per-type breakdown',
        'Human-readable storage and SMART status',
        'Menu-bar native popover'
      ]
    };

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
  initAppJsonLd();

  // Theme-aware <picture> swapping
  function updateThemeImages(theme) {
    document.querySelectorAll('img[data-theme-src-light][data-theme-src-dark]').forEach((img) => {
      const lightSrc = img.getAttribute('data-theme-src-light') || '';
      const darkSrc = img.getAttribute('data-theme-src-dark') || '';
      const targetSrc = theme === 'light' ? lightSrc : darkSrc;
      if (!targetSrc) return;
      if (img.getAttribute('src') !== targetSrc) img.setAttribute('src', targetSrc);
    });

    document.querySelectorAll('picture').forEach((picture) => {
      const darkSource = picture.querySelector('source[data-theme="dark"]');
      const img = picture.querySelector('img');
      if (!darkSource || !img) return;

      if (!img.hasAttribute('data-default-src')) {
        img.setAttribute('data-default-src', img.getAttribute('src') || '');
      }
      if (!darkSource.hasAttribute('data-dark-srcset')) {
        darkSource.setAttribute('data-dark-srcset', darkSource.getAttribute('srcset') || '');
      }

      const defaultSrc = img.getAttribute('data-default-src') || '';
      const darkSrcset = darkSource.getAttribute('data-dark-srcset') || '';

      const shouldEnableDarkSource = theme === 'dark';

      if (shouldEnableDarkSource) {
        if (darkSrcset) darkSource.setAttribute('srcset', darkSrcset);
        if (darkSrcset) img.setAttribute('src', darkSrcset);
      } else {
        darkSource.removeAttribute('srcset');
        if (defaultSrc) img.setAttribute('src', defaultSrc);
      }
    });
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) {
      const icon = theme === 'dark'
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="currentColor" d="M18.362 3.202a2.936 2.936 0 0 0-4.724 0a2.94 2.94 0 0 1-3.25 1.055a2.936 2.936 0 0 0-3.822 2.778a2.94 2.94 0 0 1-2.008 2.763a2.936 2.936 0 0 0-1.46 4.494a2.94 2.94 0 0 1 0 3.416a2.936 2.936 0 0 0 1.46 4.494a2.94 2.94 0 0 1 2.008 2.763a2.936 2.936 0 0 0 3.823 2.778a2.94 2.94 0 0 1 3.249 1.055a2.936 2.936 0 0 0 4.724 0a2.94 2.94 0 0 1 3.25-1.055a2.936 2.936 0 0 0 3.822-2.778a2.94 2.94 0 0 1 2.008-2.763a2.936 2.936 0 0 0 1.46-4.494a2.94 2.94 0 0 1 0-3.416a2.936 2.936 0 0 0-1.46-4.494a2.94 2.94 0 0 1-2.008-2.763a2.936 2.936 0 0 0-3.823-2.778a2.94 2.94 0 0 1-3.249-1.055m-7.594 21.86c-5.005-2.89-6.72-9.29-3.83-14.294s9.29-6.72 14.294-3.83s6.72 9.29 3.83 14.294s-9.29 6.72-14.294 3.83"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><g fill="none"><g fill="currentColor" clip-path="url(#a)"><path d="M26.3 14.132a1.57 1.57 0 1 0 0-3.14a1.57 1.57 0 0 0 0 3.14m-12.92 12.88a1.57 1.57 0 1 0 0-3.14a1.57 1.57 0 0 0 0 3.14m14.41-9.03a.99.99 0 1 1-1.98 0a.99.99 0 0 1 1.98 0m-5.99 7a3 3 0 1 0 0-6a3 3 0 0 0 0 6"/><path d="m21.466 6.102l.002.006c.428 1.745.48 3.645.016 5.626c-1.08 4.562-4.84 8.143-9.428 8.97h-.004a11.9 11.9 0 0 1-6.927-.783c-1.202-.53-2.395-.065-3.05.707a2.67 2.67 0 0 0-.316 3l.004.009c3.027 5.574 9.271 9.142 16.24 8.218h.002c7.14-.951 12.833-6.753 13.691-13.894l.001-.008c.684-5.903-1.83-11.254-6.031-14.554l-.01-.007l-.01-.007c-1.932-1.48-4.772.263-4.18 2.717m-9.055 16.57c5.38-.97 9.76-5.15 11.02-10.48a14 14 0 0 0 .096-6.04l-.004-.024a14 14 0 0 0-.113-.496c-.14-.58.55-1.02 1.02-.66q.196.154.388.316l.004.004a14 14 0 0 1 .7.631c3.013 2.91 4.727 7.154 4.189 11.8c-.75 6.24-5.74 11.32-11.97 12.15c-5.593.74-10.64-1.81-13.488-5.99a13 13 0 0 1-.51-.806l-.008-.014a14 14 0 0 1-.214-.38c-.29-.54.24-1.18.8-.93q.256.111.518.213l.009.003a14 14 0 0 0 .715.256c2.101.685 4.426.888 6.848.447"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h32v32H0z"/></clipPath></defs></g></svg>';
      themeBtn.innerHTML = icon;
    }
    updateThemeImages(theme);
  }

  const stored = (() => {
    try { return localStorage.getItem('theme'); } catch { return null; }
  })();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(initial);

  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
      let hasStored = false;
      try { hasStored = !!localStorage.getItem('theme'); } catch { hasStored = false; }
      if (hasStored) return;
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch { /* ignore */ }
      applyTheme(next);
    });
  }

  // Mobile nav
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!isOpen));
      navToggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  // Year (for any static #year placeholder outside the footer)
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Screenshot modal/lightbox (desktop only)
  function initScreenshotModal() {
    if (window.innerWidth < 900) return;
    if (!document.querySelector('.product-page')) return;

    const modal = document.createElement('div');
    modal.className = 'screenshot-modal';
    modal.innerHTML = '<div class="screenshot-modal__backdrop"></div><div class="screenshot-modal__content"><button class="screenshot-modal__close" aria-label="Close">&times;</button><img class="screenshot-modal__image" alt="" /></div>';
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.screenshot-modal__image');
    const closeBtn = modal.querySelector('.screenshot-modal__close');
    const backdrop = modal.querySelector('.screenshot-modal__backdrop');

    function openModal(imgSrc, imgAlt) {
      modalImg.src = imgSrc;
      modalImg.alt = imgAlt || '';
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    const screenshotImages = document.querySelectorAll('.device-shot__screen picture img');
    screenshotImages.forEach((img) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openModal(this.src, this.alt);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScreenshotModal);
  } else {
    initScreenshotModal();
  }

  // ── Cookie Consent Injector ──────────────────────────────
  // Usage: <body data-cookie-consent>
  const COOKIE_STRINGS = {
    en: { text: 'We use cookies to analyze site traffic and improve your experience. By clicking "Accept", you consent to our use of cookies.', accept: 'Accept', deny: 'Deny', privacy: 'Privacy Policy' }
  };

  function initCookieConsent() {
    if (!document.body.hasAttribute('data-cookie-consent')) return;

    const lang = resolveLang(COOKIE_STRINGS);
    const s = COOKIE_STRINGS[lang] || COOKIE_STRINGS.en;
    const privacyHref = './privacy.html';
    const sep = ' ';

    const banner = document.createElement('div');
    banner.className = 'cookie-consent';
    banner.innerHTML =
      '<div class="cookie-consent__content">' +
        '<div class="cookie-consent__text">' +
          s.text + sep + '<a href="' + privacyHref + '">' + s.privacy + '</a>' +
        '</div>' +
        '<div class="cookie-consent__buttons">' +
          '<button class="cookie-consent__btn cookie-consent__btn--accept">' + s.accept + '</button>' +
          '<button class="cookie-consent__btn cookie-consent__btn--deny">' + s.deny + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    const acceptBtn = banner.querySelector('.cookie-consent__btn--accept');
    const denyBtn = banner.querySelector('.cookie-consent__btn--deny');
    const consent = (() => { try { return localStorage.getItem('cookieConsent'); } catch { return null; } })();

    if (!consent) {
      banner.classList.add('show');
    } else if (consent === 'accepted') {
      enableAnalytics();
    }

    acceptBtn.addEventListener('click', () => {
      try { localStorage.setItem('cookieConsent', 'accepted'); } catch { /* ignore */ }
      banner.classList.remove('show');
      enableAnalytics();
    });

    denyBtn.addEventListener('click', () => {
      try { localStorage.setItem('cookieConsent', 'denied'); } catch { /* ignore */ }
      banner.classList.remove('show');
      disableAnalytics();
    });
  }

  function enableAnalytics() {
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', { 'analytics_storage': 'granted' });
      const pagePath = window.location.pathname + window.location.search + window.location.hash;
      const gaScript = document.querySelector('script[src*="googletagmanager.com/gtag/js?id="]');
      let measurementId = null;
      if (gaScript && gaScript.getAttribute('src')) {
        try {
          const u = new URL(gaScript.getAttribute('src'), window.location.href);
          measurementId = u.searchParams.get('id');
        } catch (_) { measurementId = null; }
      }
      if (measurementId) {
        gtag('config', measurementId, { page_path: pagePath });
      } else {
        gtag('event', 'page_view', { page_path: pagePath });
      }
    }
  }

  function disableAnalytics() {
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', { 'analytics_storage': 'denied' });
    }
  }

  initCookieConsent();

  // Email obfuscation - protects email from scrapers
  // Usage: <a href="#" data-email="user|domain.com">Reveal email</a>
  document.querySelectorAll('[data-email]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const val = a.getAttribute('data-email');
      if (!val) return;
      const [user, domain] = val.split('|');
      if (!user || !domain) return;
      const mailto = `mailto:${user}@${domain}`;
      a.textContent = `${user}@${domain}`;
      a.setAttribute('href', mailto);
    });
  });
})();
