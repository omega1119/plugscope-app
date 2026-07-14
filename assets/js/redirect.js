(function () {
  /**
   * Non-English languages supported by the site.
   * PlugScope currently ships English only. Add codes here
   * (e.g. 'de', 'fr', 'zh-hans') as localized folders are created,
   * and add matching data-redirect-<lang> attributes to the root
   * index.html / privacy.html redirect scripts.
   */
  var SUPPORTED_LANGS = [];

  /** Country-code → language mapping for geo-based fallback. */
  var COUNTRY_TO_LANG = {};

  function normalizeLocale(locale) {
    return String(locale || '').trim().toLowerCase();
  }

  /** Maps browser locale codes to our supported language codes where they differ. */
  var LOCALE_ALIASES = {};

  function getPreferredLanguage() {
    var list = [];
    try {
      if (Array.isArray(navigator.languages) && navigator.languages.length) {
        list = navigator.languages;
      } else if (navigator.language) {
        list = [navigator.language];
      }
    } catch (e) {
      list = [];
    }

    for (var i = 0; i < list.length; i++) {
      var loc = normalizeLocale(list[i]);
      if (LOCALE_ALIASES[loc]) return LOCALE_ALIASES[loc];
      for (var j = 0; j < SUPPORTED_LANGS.length; j++) {
        var lang = SUPPORTED_LANGS[j];
        if (loc === lang || loc.indexOf(lang + '-') === 0) return lang;
      }
      var base = loc.split('-')[0];
      if (LOCALE_ALIASES[base]) return LOCALE_ALIASES[base];
    }

    return 'en';
  }

  function redirectTo(target) {
    var suffix = (location.search || '') + (location.hash || '');
    window.location.replace(String(target) + suffix);
  }

  function findConfigScript() {
    var s = document.currentScript;
    if (s && s.dataset && s.dataset.redirectEn) return s;
    return document.querySelector('script[data-redirect-en]');
  }

  function getTargetsFromScript(scriptEl) {
    var ds = scriptEl && scriptEl.dataset ? scriptEl.dataset : {};
    var targets = {
      en: ds.redirectEn || 'en/',
      defaultLang: (ds.defaultLang || 'en').toLowerCase(),
      countryTimeoutMs: Number(ds.countryTimeoutMs || 2500)
    };
    for (var i = 0; i < SUPPORTED_LANGS.length; i++) {
      var lang = SUPPORTED_LANGS[i];
      var key = 'redirect' + lang.replace(/(^|-)([a-z])/g, function(_, __, c) { return c.toUpperCase(); });
      if (ds[key]) targets[lang] = ds[key];
    }
    return targets;
  }

  function main() {
    var scriptEl = findConfigScript();
    var targets = getTargetsFromScript(scriptEl);

    if (!targets.en) return;

    var preferred = getPreferredLanguage();

    if (preferred !== 'en' && targets[preferred]) {
      redirectTo(targets[preferred]);
      return;
    }

    // No non-English locales configured: go straight to English.
    if (!SUPPORTED_LANGS.length) {
      redirectTo(targets.en);
      return;
    }

    var didRedirect = false;
    var timeoutId = window.setTimeout(function () {
      if (didRedirect) return;
      didRedirect = true;
      redirectTo(targets.en);
    }, targets.countryTimeoutMs);

    fetch('https://ipapi.co/country/', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (text) {
        if (didRedirect) return;
        didRedirect = true;
        window.clearTimeout(timeoutId);
        var cc = String(text || '').trim().toUpperCase();
        cc = /^[A-Z]{2}$/.test(cc) ? cc : '';
        var lang = COUNTRY_TO_LANG[cc];
        if (lang && targets[lang]) {
          redirectTo(targets[lang]);
        } else {
          redirectTo(targets.en);
        }
      })
      .catch(function () {
        if (didRedirect) return;
        didRedirect = true;
        window.clearTimeout(timeoutId);
        redirectTo(targets.en);
      });
  }

  main();
})();
