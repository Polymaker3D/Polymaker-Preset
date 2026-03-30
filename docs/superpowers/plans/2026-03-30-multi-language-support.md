# Multi-Language Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Chinese (Simplified) language support with a top-right dropdown that auto-detects browser language; all translations stored in a single `i18n.js` file.

**Architecture:** A `data-i18n="key"` attribute contract ties HTML elements to translation keys. `i18n.js` holds all EN/ZH strings plus `applyLanguage()`, `detectLang()`, and `t()`. `app.js` replaces hardcoded strings with `t('key')` calls. The language dropdown is a fixed-position element rendered at the top-right corner.

**Tech Stack:** Vanilla JS (ES5), no build tools, no external i18n library.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `i18n.js` | **Create** | All translations + `t()`, `applyLanguage()`, `detectLang()` |
| `index.html` | **Modify** | Add `data-i18n` attributes, lang dropdown HTML, load `i18n.js` |
| `app.js` | **Modify** | Replace hardcoded strings with `t('key')` calls |
| `style.css` | **Modify** | Styles for the language dropdown |

---

## Task 1: Create `i18n.js` with all translations

**Files:**
- Create: `i18n.js`

- [ ] **Step 1: Create `i18n.js`**

```js
// i18n.js — Single source of truth for all UI translations.
// To add a new language: add a new key block below and a <li> in the lang dropdown in index.html.

var I18N = (function () {
  var TRANSLATIONS = {
    en: {
      // Hero
      'hero.title': 'Filament Presets',
      'hero.desc': 'Select your slicer to view and download Polymaker print profiles and filament presets',
      'hero.howto': 'How to use?',

      // Filters
      'filter.slicer.label': 'Select Your Slicer',
      'filter.slicer.placeholder': 'Select Slicer',
      'filter.series.label': 'Series',
      'filter.brand.label': 'Printer Brand',
      'filter.model.label': 'Printer Model',
      'filter.all': 'All',
      'filter.all.series': 'All Series',
      'filter.all.brands': 'All Brands',
      'filter.all.models': 'All Models',
      'filter.strict': 'Strict mode: Only show presets made specifically for this printer',

      // List / table
      'list.title': 'Presets',
      'list.loading': 'Loading\u2026',
      'list.count': '{n} presets in {m} materials.',
      'list.failed': 'Failed to load: {msg}',
      'table.material': 'Material',
      'table.brand': 'Printer Brand',
      'table.printer': 'Printer',
      'table.compatible': 'Compatible Printers',
      'table.modified': 'Last Modified',
      'table.action': 'Download Action',

      // Buttons
      'btn.download.selected': 'Download Selected',
      'btn.download.selected.loading': 'Loading...',
      'btn.download.bundle': 'Download Bundle (.bbsflmt)',
      'btn.download.bundle.loading': 'Loading...',

      // Folder row
      'folder.presets': '{n} presets',
      'folder.expand': 'Click to expand',

      // Alerts / errors
      'alert.no.bambu': 'No BambuStudio presets available to download. Please make sure BambuStudio is selected as the slicer.',
      'alert.load.failed': 'Failed to load preset data. Please check your connection and try again.',
      'alert.error.loading': 'Error loading presets: {msg}',
      'alert.invalid.url': 'Invalid preset URL',
      'alert.error.preset': 'Error loading preset: {msg}. Please try again.',

      // Duplicate modal
      'dup.title': '\u26a0\ufe0f Duplicate Files Detected',
      'dup.intro': 'Multiple presets are generating the same filename. Please select which preset to keep for each duplicate:',
      'dup.for.printer': 'For printer: {name}',
      'dup.use.profile': 'Use {name} profile',
      'dup.compatible': 'Compatible with: {list}',
      'dup.cancel': 'Cancel',
      'dup.confirm': 'Confirm Export',

      // Install modal
      'modal.install.title': '\ud83d\udce6 Manual Installation',
      'modal.bambu.title': 'Bambu Studio',
      'modal.bambu.method1.title': 'Method 1: Bundle Method (Recommended)',
      'modal.bambu.method1.steps': [
        'Download the preset <strong>.bbsflmt</strong> file (or bundle ZIP) from the <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">download page</a>.',
        'If it\'s a ZIP file, unzip it to extract the .bbsflmt file(s).',
        'Open Bambu Studio.',
        'Go to <strong>File</strong> \u2192 <strong>Import</strong> \u2192 <strong>Import Preset...</strong>.',
        'Select the <strong>.bbsflmt</strong> file(s).',
        'Click on a material in the project consumables list, select the imported custom preset, and the preset will appear in the preset list.'
      ],
      'modal.bambu.method1.note': '<strong>Note:</strong> .bbsflmt bundles are only available for BambuStudio. The bundle download button only appears when no printer filter is applied.',
      'modal.bambu.method2.title': 'Method 2: Individual File Method',
      'modal.bambu.method2.steps': [
        'Download the preset JSON file (or single-file ZIP) from the <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">download page</a>.',
        'Open Bambu Studio.',
        'Go to <strong>File</strong> \u2192 <strong>Import</strong> \u2192 <strong>Import Preset...</strong>.',
        'Select a JSON or ZIP file.',
        'Click on a material in the project consumables list, select the imported custom preset, and the preset will appear in the preset list.'
      ],
      'modal.orca.title': 'OrcaSlicer / ElegooSlicer',
      'modal.orca.steps': [
        'Download the preset as <strong>JSON</strong> or <strong>single-file ZIP</strong> from the <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">download page</a>.',
        'Open OrcaSlicer or ElegooSlicer.',
        'Go to <strong>File</strong> \u2192 <strong>Import</strong>:<ul><li>For a <strong>JSON</strong> file: choose <strong>Import Configs...</strong> (OrcaSlicer) or <strong>Import Preset...</strong> (ElegooSlicer), then select the JSON file.</li><li>For a <strong>ZIP</strong> file: choose <strong>Import Zip Archive...</strong> (or the equivalent, e.g. "Import Zip Archive\u2026" in ElegooSlicer), then select the ZIP file (no need to unzip).</li></ul>',
        'The preset will appear in your preset list.'
      ],

      // Known Issues
      'issues.title': 'Known Issues',
      'issues.p2s.title': 'P2S Overheating Issue - Temporary Fix Applied',
      'issues.p2s.issue': '<strong>Issue:</strong> P2S printer may overheat when printing materials with vitrification temperature &gt; 50\u00b0C due to starting G-code issues.',
      'issues.p2s.solution': '<strong>Solution:</strong> We have implemented a temporary fix by adding cooling G-code commands to P2S presets with vitrification temperature &gt; 50\u00b0C. This is a temporary workaround until Bambu Lab fixes this issue.',
      'issues.p2s.link': 'View BambuStudio Issue #8801 \u2192',
      'issues.p2s.credits': 'Thanks to alexbreinig and capsel22 for identifying this issue.',

      // Footer
      'footer.links': 'Links',
      'footer.social': 'Social Accounts',
      'footer.readme': 'For more information, see',
      'footer.readme.link': 'README',

      // Language switcher
      'lang.en': 'English',
      'lang.zh': '\u4e2d\u6587'
    },

    zh: {
      // Hero
      'hero.title': '\u8033\u6750\u9884\u8bbe\u6587\u4ef6',
      'hero.desc': '\u9009\u62e9\u60a8\u7684\u5207\u7247\u8f6f\u4ef6\uff0c\u67e5\u770b\u5e76\u4e0b\u8f7d Polymaker \u6253\u5370\u914d\u7f6e\u6587\u4ef6\u548c\u8033\u6750\u9884\u8bbe',
      'hero.howto': '\u5982\u4f55\u4f7f\u7528\uff1f',

      // Filters
      'filter.slicer.label': '\u9009\u62e9\u5207\u7247\u8f6f\u4ef6',
      'filter.slicer.placeholder': '\u8bf7\u9009\u62e9',
      'filter.series.label': '\u7cfb\u5217',
      'filter.brand.label': '\u6253\u5370\u673a\u54c1\u724c',
      'filter.model.label': '\u6253\u5370\u673a\u578b\u53f7',
      'filter.all': '\u5168\u90e8',
      'filter.all.series': '\u5168\u90e8\u7cfb\u5217',
      'filter.all.brands': '\u5168\u90e8\u54c1\u724c',
      'filter.all.models': '\u5168\u90e8\u578b\u53f7',
      'filter.strict': '\u4e25\u683c\u6a21\u5f0f\uff1a\u4ec5\u663e\u793a\u4e3a\u8be5\u6253\u5370\u673a\u4e13\u9580\u5236\u4f5c\u7684\u9884\u8bbe',

      // List / table
      'list.title': '\u9884\u8bbe\u5217\u8868',
      'list.loading': '\u52a0\u8f7d\u4e2d\u2026',
      'list.count': '{m} \u79cd\u8033\u6750\u5171 {n} \u4e2a\u9884\u8bbe\u3002',
      'list.failed': '\u52a0\u8f7d\u5931\u8d25\uff1a{msg}',
      'table.material': '\u8033\u6750',
      'table.brand': '\u6253\u5370\u673a\u54c1\u724c',
      'table.printer': '\u6253\u5370\u673a',
      'table.compatible': '\u517c\u5bb9\u6253\u5370\u673a',
      'table.modified': '\u6700\u540e\u4fee\u6539',
      'table.action': '\u4e0b\u8f7d',

      // Buttons
      'btn.download.selected': '\u4e0b\u8f7d\u6240\u9009',
      'btn.download.selected.loading': '\u52a0\u8f7d\u4e2d...',
      'btn.download.bundle': '\u4e0b\u8f7d\u6253\u5305 (.bbsflmt)',
      'btn.download.bundle.loading': '\u52a0\u8f7d\u4e2d...',

      // Folder row
      'folder.presets': '{n} \u4e2a\u9884\u8bbe',
      'folder.expand': '\u70b9\u51fb\u5c55\u5f00',

      // Alerts / errors
      'alert.no.bambu': '\u6ca1\u6709\u53ef\u7528\u7684 BambuStudio \u9884\u8bbe\u3002\u8bf7\u786e\u4fdd\u5df2\u9009\u62e9 BambuStudio \u4e3a\u5207\u7247\u8f6f\u4ef6\u3002',
      'alert.load.failed': '\u9884\u8bbe\u6570\u636e\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u8fde\u63a5\u5e76\u91cd\u8bd5\u3002',
      'alert.error.loading': '\u52a0\u8f7d\u9884\u8bbe\u51fa\u9519\uff1a{msg}',
      'alert.invalid.url': '\u65e0\u6548\u7684\u9884\u8bbe\u94fe\u63a5',
      'alert.error.preset': '\u52a0\u8f7d\u9884\u8bbe\u51fa\u9519\uff1a{msg}\uff0c\u8bf7\u91cd\u8bd5\u3002',

      // Duplicate modal
      'dup.title': '\u26a0\ufe0f \u68c0\u6d4b\u5230\u91cd\u590d\u6587\u4ef6',
      'dup.intro': '\u591a\u4e2a\u9884\u8bbe\u751f\u6210\u4e86\u76f8\u540c\u7684\u6587\u4ef6\u540d\uff0c\u8bf7\u4e3a\u6bcf\u4e2a\u91cd\u590d\u9009\u62e9\u4fdd\u7559\u54ea\u4e2a\u9884\u8bbe\uff1a',
      'dup.for.printer': '\u9488\u5bf9\u6253\u5370\u673a\uff1a{name}',
      'dup.use.profile': '\u4f7f\u7528 {name} \u914d\u7f6e\u6587\u4ef6',
      'dup.compatible': '\u517c\u5bb9\uff1a{list}',
      'dup.cancel': '\u53d6\u6d88',
      'dup.confirm': '\u786e\u8ba4\u5bfc\u51fa',

      // Install modal
      'modal.install.title': '\ud83d\udce6 \u624b\u52a8\u5b89\u88c5',
      'modal.bambu.title': 'Bambu Studio',
      'modal.bambu.method1.title': '\u65b9\u6cd5\u4e00\uff1a\u6253\u5305\u6a21\u5f0f\uff08\u63a8\u8350\uff09',
      'modal.bambu.method1.steps': [
        '\u4ece<a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">\u4e0b\u8f7d\u9875\u9762</a>\u4e0b\u8f7d\u9884\u8bbe <strong>.bbsflmt</strong> \u6587\u4ef6\uff08\u6216\u6253\u5305 ZIP\uff09\u3002',
        '\u5982\u679c\u662f ZIP \u6587\u4ef6\uff0c\u8bf7\u89e3\u538b\u4ee5\u63d0\u53d6 .bbsflmt \u6587\u4ef6\u3002',
        '\u6253\u5f00 Bambu Studio\u3002',
        '\u8fdb\u5165 <strong>\u6587\u4ef6</strong> \u2192 <strong>\u5bfc\u5165</strong> \u2192 <strong>\u5bfc\u5165\u9884\u8bbe...</strong>\u3002',
        '\u9009\u62e9 <strong>.bbsflmt</strong> \u6587\u4ef6\u3002',
        '\u5355\u51fb\u9879\u76ee\u6d88\u8017\u54c1\u5217\u8868\u4e2d\u7684\u8033\u6750\uff0c\u9009\u62e9\u5bfc\u5165\u7684\u81ea\u5b9a\u4e49\u9884\u8bbe\uff0c\u9884\u8bbe\u5c06\u51fa\u73b0\u5728\u9884\u8bbe\u5217\u8868\u4e2d\u3002'
      ],
      'modal.bambu.method1.note': '<strong>\u6ce8\u610f\uff1a</strong>.bbsflmt \u6253\u5305\u4ec5\u9002\u7528\u4e8e BambuStudio\u3002\u4ec5\u5728\u672a\u5e94\u7528\u6253\u5370\u673a\u7b5b\u9009\u65f6\uff0c\u6253\u5305\u4e0b\u8f7d\u6309\u9215\u624d\u4f1a\u663e\u793a\u3002',
      'modal.bambu.method2.title': '\u65b9\u6cd5\u4e8c\uff1a\u5355\u6587\u4ef6\u6a21\u5f0f',
      'modal.bambu.method2.steps': [
        '\u4ece<a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">\u4e0b\u8f7d\u9875\u9762</a>\u4e0b\u8f7d JSON \u6587\u4ef6\uff08\u6216\u5355\u6587\u4ef6 ZIP\uff09\u3002',
        '\u6253\u5f00 Bambu Studio\u3002',
        '\u8fdb\u5165 <strong>\u6587\u4ef6</strong> \u2192 <strong>\u5bfc\u5165</strong> \u2192 <strong>\u5bfc\u5165\u9884\u8bbe...</strong>\u3002',
        '\u9009\u62e9 JSON \u6216 ZIP \u6587\u4ef6\u3002',
        '\u5355\u51fb\u9879\u76ee\u6d88\u8017\u54c1\u5217\u8868\u4e2d\u7684\u8033\u6750\uff0c\u9009\u62e9\u5bfc\u5165\u7684\u81ea\u5b9a\u4e49\u9884\u8bbe\uff0c\u9884\u8bbe\u5c06\u51fa\u73b0\u5728\u9884\u8bbe\u5217\u8868\u4e2d\u3002'
      ],
      'modal.orca.title': 'OrcaSlicer / ElegooSlicer',
      'modal.orca.steps': [
        '\u4ece<a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">\u4e0b\u8f7d\u9875\u9762</a>\u4e0b\u8f7d <strong>JSON</strong> \u6216\u5355\u6587\u4ef6 <strong>ZIP</strong>\u3002',
        '\u6253\u5f00 OrcaSlicer \u6216 ElegooSlicer\u3002',
        '\u8fdb\u5165 <strong>\u6587\u4ef6</strong> \u2192 <strong>\u5bfc\u5165</strong>\uff1a<ul><li><strong>JSON</strong> \u6587\u4ef6\uff1a\u9009\u62e9 <strong>\u5bfc\u5165\u914d\u7f6e...</strong>\uff08OrcaSlicer\uff09\u6216 <strong>\u5bfc\u5165\u9884\u8bbe...</strong>\uff08ElegooSlicer\uff09\u3002</li><li><strong>ZIP</strong> \u6587\u4ef6\uff1a\u9009\u62e9 <strong>\u5bfc\u5165 ZIP \u5305...</strong>\uff0c\u65e0\u9700\u89e3\u538b\u3002</li></ul>',
        '\u9884\u8bbe\u5c06\u51fa\u73b0\u5728\u9884\u8bbe\u5217\u8868\u4e2d\u3002'
      ],

      // Known Issues
      'issues.title': '\u5df2\u77e5\u95ee\u9898',
      'issues.p2s.title': 'P2S \u8fc7\u70ed\u95ee\u9898 - \u5df2\u5e94\u7528\u4e34\u65f6\u4fee\u590d',
      'issues.p2s.issue': '<strong>\u95ee\u9898\uff1a</strong>P2S \u6253\u5370\u673a\u5728\u6253\u5370\u73bb\u7092\u5316\u6e29\u5ea6 &gt; 50\u00b0C \u7684\u8033\u6750\u65f6\uff0c\u53ef\u80fd\u56e0\u8d77\u59cb G-code \u95ee\u9898\u800c\u8fc7\u70ed\u3002',
      'issues.p2s.solution': '<strong>\u89e3\u51b3\u65b9\u6848\uff1a</strong>\u6211\u4eec\u5df2\u5411\u73bb\u7092\u5316\u6e29\u5ea6 &gt; 50\u00b0C \u7684 P2S \u9884\u8bbe\u6dfb\u52a0\u51b7\u5374 G-code \u547d\u4ee4\u4f5c\u4e3a\u4e34\u65f6\u4fee\u590d\uff0c\u5c45\u5f85 Bambu Lab \u5b98\u65b9\u4fee\u590d\u6b64\u95ee\u9898\u3002',
      'issues.p2s.link': '\u67e5\u770b BambuStudio Issue #8801 \u2192',
      'issues.p2s.credits': '\u611f\u8c22 alexbreinig \u548c capsel22 \u53d1\u73b0\u4e86\u8fd9\u4e2a\u95ee\u9898\u3002',

      // Footer
      'footer.links': '\u94fe\u63a5',
      'footer.social': '\u793e\u4ea4\u5e73\u53f0',
      'footer.readme': '\u66f4\u591a\u4fe1\u606f\u8bf7\u67e5\u9605',
      'footer.readme.link': 'README',

      // Language switcher
      'lang.en': 'English',
      'lang.zh': '\u4e2d\u6587'
    }
  };

  var currentLang = 'en';

  function detectLang() {
    var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return lang.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  function t(key, vars) {
    var str = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
              (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) ||
              key;
    if (vars) {
      for (var k in vars) {
        if (vars.hasOwnProperty(k)) {
          str = str.replace('{' + k + '}', vars[k]);
        }
      }
    }
    return str;
  }

  function renderModalSteps(key) {
    var steps = TRANSLATIONS[currentLang][key] || TRANSLATIONS['en'][key] || [];
    return steps.map(function (step, i) {
      return '<li>' + step + '</li>';
    }).join('');
  }

  function applyLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;

    // Update data-i18n elements
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    }

    // Update data-i18n-html elements (allow HTML content)
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlEls.length; j++) {
      var hEl = htmlEls[j];
      var hKey = hEl.getAttribute('data-i18n-html');
      hEl.innerHTML = t(hKey);
    }

    // Render install modal step lists
    var stepTargets = document.querySelectorAll('[data-i18n-steps]');
    for (var k = 0; k < stepTargets.length; k++) {
      var stepEl = stepTargets[k];
      var stepKey = stepEl.getAttribute('data-i18n-steps');
      stepEl.innerHTML = renderModalSteps(stepKey);
    }

    // Update active lang label in dropdown
    var activeLangLabel = document.getElementById('lang-dropdown-label');
    if (activeLangLabel) {
      activeLangLabel.textContent = lang === 'zh' ? '\u4e2d\u6587' : 'EN';
    }

    // Mark active item in lang list
    var langItems = document.querySelectorAll('.lang-option');
    for (var m = 0; m < langItems.length; m++) {
      var item = langItems[m];
      if (item.getAttribute('data-lang') === lang) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    }

    // Re-render dynamic content by dispatching a custom event
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  function getCurrentLang() {
    return currentLang;
  }

  return { t: t, applyLanguage: applyLanguage, detectLang: detectLang, getCurrentLang: getCurrentLang };
})();

// Expose globals used by app.js
function t(key, vars) { return I18N.t(key, vars); }
```

- [ ] **Step 2: Commit**

```bash
git add i18n.js
git commit -m "feat: add i18n.js with EN and ZH translations"
```

---

## Task 2: Add lang dropdown styles to `style.css`

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Append lang dropdown CSS to the bottom of `style.css`**

```css
/* ── Language Switcher ─────────────────────────────────── */
.lang-switcher {
  position: fixed;
  top: 12px;
  right: 16px;
  z-index: 1000;
}

.lang-switcher-toggle {
  background: var(--card-bg, #1e1e2e);
  border: 1px solid var(--border, rgba(255,255,255,0.1));
  border-radius: 6px;
  color: var(--text, #e0e0e0);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.lang-switcher-toggle:hover {
  border-color: var(--accent, #00b4b4);
  color: var(--accent, #00b4b4);
}

.lang-switcher-arrow {
  font-size: 9px;
  opacity: 0.6;
}

.lang-menu {
  display: none;
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--card-bg, #1e1e2e);
  border: 1px solid var(--border, rgba(255,255,255,0.1));
  border-radius: 6px;
  min-width: 90px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.lang-switcher.is-open .lang-menu {
  display: block;
}

.lang-option {
  cursor: pointer;
  font-size: 13px;
  padding: 8px 12px;
  color: var(--text, #e0e0e0);
}

.lang-option:hover {
  background: rgba(255,255,255,0.05);
}

.lang-option.is-active {
  color: var(--accent, #00b4b4);
  font-weight: 600;
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "feat: add lang switcher styles"
```

---

## Task 3: Update `index.html` — add `data-i18n` attributes and lang dropdown

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add `data-i18n` to static text nodes in the `<header>`**

Replace the existing `<header class="hero">` block:

```html
<header class="hero">
  <div class="hero-main">
    <h1 class="hero-title">
      <img src="./assets/logo/Polymaker%20Teal.png" alt="Polymaker" class="hero-logo">
      <span class="preset-text" data-i18n="hero.title">Filament Presets</span>
    </h1>
    <div class="hero-actions">
      <button id="help-btn" class="help-icon-btn" type="button" aria-label="Manual Installation" title="Manual Installation" data-i18n="hero.howto">How to use?</button>
      <button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Toggle theme" title="Toggle theme">
        <span class="theme-toggle-icon" aria-hidden="true"></span>
      </button>
    </div>
  </div>
  <p class="hero-desc" data-i18n="hero.desc">Select your slicer to view and download Polymaker print profiles and filament presets</p>
</header>
```

- [ ] **Step 2: Add `data-i18n` to the slicer card**

Replace the existing slicer-card section:

```html
<section class="card slicer-card" id="slicer-card">
  <div class="slicer-filter">
    <div class="filter-group slicer-filter-group">
      <label class="filter-label" data-i18n="filter.slicer.label">Select Your Slicer</label>
      <div class="dropdown" data-filter="slicer">
        <button class="dropdown-toggle" type="button">
          <span class="dropdown-label" data-i18n="filter.slicer.placeholder">Select Slicer</span>
          <span class="dropdown-arrow" aria-hidden="true"></span>
        </button>
        <div class="dropdown-menu"></div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add `data-i18n` to the filters card**

Replace the existing filters-card section:

```html
<section class="card filters-card is-hidden" id="filters-card">
  <div class="filters">
    <div class="filter-group">
      <label class="filter-label" data-i18n="filter.series.label">Series</label>
      <div class="dropdown" data-filter="series">
        <button class="dropdown-toggle" type="button">
          <span class="dropdown-label" data-i18n="filter.all">All</span>
          <span class="dropdown-arrow" aria-hidden="true"></span>
        </button>
        <div class="dropdown-menu"></div>
      </div>
    </div>
    <div class="filter-group">
      <label class="filter-label" data-i18n="filter.brand.label">Printer Brand</label>
      <div class="dropdown" data-filter="brand">
        <button class="dropdown-toggle" type="button">
          <span class="dropdown-label" data-i18n="filter.all">All</span>
          <span class="dropdown-arrow" aria-hidden="true"></span>
        </button>
        <div class="dropdown-menu"></div>
      </div>
    </div>
    <div class="filter-group">
      <label class="filter-label" data-i18n="filter.model.label">Printer Model</label>
      <div class="dropdown" data-filter="model">
        <button class="dropdown-toggle" type="button">
          <span class="dropdown-label" data-i18n="filter.all">All</span>
          <span class="dropdown-arrow" aria-hidden="true"></span>
        </button>
        <div class="dropdown-menu"></div>
      </div>
    </div>
  </div>
  <div class="filter-options">
    <label class="checkbox-option">
      <input type="checkbox" id="strict-checkbox" class="checkbox-input">
      <span class="checkbox-custom"></span>
      <span class="checkbox-label-text" data-i18n="filter.strict">Strict mode: Only show presets made specifically for this printer</span>
    </label>
  </div>
</section>
```

- [ ] **Step 4: Add `data-i18n` to the list card**

Replace the existing list-card section:

```html
<section class="card list-card is-hidden" id="list-card">
  <div class="list-header">
    <div class="list-header-left">
      <h2 class="list-title" data-i18n="list.title">Presets</h2>
      <p id="status" class="list-count" data-i18n="list.loading">Loading…</p>
    </div>
    <div class="list-header-right">
      <button id="download-selected-btn" class="btn-download-selected" type="button" disabled>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span data-i18n="btn.download.selected">Download Selected</span> (<span id="selected-count">0</span>)
      </button>
      <button id="download-bundle-btn" class="btn-download-bundle" type="button" disabled>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span data-i18n="btn.download.bundle">Download Bundle (.bbsflmt)</span>
      </button>
    </div>
  </div>
  <div class="table-wrap">
    <table class="preset-table">
      <thead>
        <tr>
          <th class="th-checkbox">
            <label class="checkbox-label">
              <input type="checkbox" id="select-all-checkbox" class="checkbox-input">
              <span class="checkbox-custom"></span>
            </label>
          </th>
          <th data-i18n="table.material">Material</th>
          <th data-i18n="table.brand">Printer Brand</th>
          <th data-i18n="table.printer">Printer</th>
          <th data-i18n="table.compatible">Compatible Printers</th>
          <th data-i18n="table.modified">Last Modified</th>
          <th data-i18n="table.action">Download Action</th>
        </tr>
      </thead>
      <tbody id="tbody"></tbody>
    </table>
  </div>
</section>
```

- [ ] **Step 5: Add `data-i18n` to the Known Issues section**

Replace the existing known-issues-section:

```html
<section class="known-issues-section">
  <h2 class="known-issues-title" data-i18n="issues.title">Known Issues</h2>
  <div class="accordion">
    <div class="accordion-item is-collapsed">
      <button class="accordion-header" type="button" aria-expanded="false">
        <span class="accordion-title" data-i18n="issues.p2s.title">P2S Overheating Issue - Temporary Fix Applied</span>
        <span class="accordion-icon" aria-hidden="true">▼</span>
      </button>
      <div class="accordion-content">
        <div class="accordion-body">
          <p data-i18n-html="issues.p2s.issue"><strong>Issue:</strong> P2S printer may overheat when printing materials with vitrification temperature &gt; 50°C due to starting G-code issues.</p>
          <p data-i18n-html="issues.p2s.solution"><strong>Solution:</strong> We have implemented a temporary fix by adding cooling G-code commands to P2S presets with vitrification temperature &gt; 50°C. This is a temporary workaround until Bambu Lab fixes this issue.</p>
          <p class="accordion-links">
            <a href="https://github.com/bambulab/BambuStudio/issues/8801" target="_blank" rel="noopener noreferrer" data-i18n="issues.p2s.link">View BambuStudio Issue #8801 →</a>
          </p>
          <p class="accordion-credits" data-i18n="issues.p2s.credits">Thanks to alexbreinig and capsel22 for identifying this issue.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 6: Add `data-i18n` to the footer**

Replace the existing footer:

```html
<footer class="footer">
  <div class="footer-columns">
    <div class="footer-col footer-col-links">
      <h3 class="footer-col-title" data-i18n="footer.links">Links</h3>
      <div class="footer-links">
        <a href="https://polymaker.com/" target="_blank" rel="noopener noreferrer" class="footer-link-item">
          <span class="footer-label">Official Website:</span>
          <span class="footer-link-url">https://polymaker.com/</span>
        </a>
        <a href="https://wiki.polymaker.com/" target="_blank" rel="noopener noreferrer" class="footer-link-item">
          <span class="footer-label">Wiki:</span>
          <span class="footer-link-url">https://wiki.polymaker.com/</span>
        </a>
        <a href="https://shop.polymaker.com/" target="_blank" rel="noopener noreferrer" class="footer-link-item">
          <span class="footer-label">Store:</span>
          <span class="footer-link-url">https://shop.polymaker.com/</span>
        </a>
      </div>
    </div>
    <div class="footer-col footer-col-social">
      <h3 class="footer-col-title" data-i18n="footer.social">Social Accounts</h3>
      <div class="footer-social-list">
        <a href="https://www.youtube.com/@Polymaker" target="_blank" rel="noopener noreferrer" class="footer-social-item" title="YouTube">
          <i class="fab fa-youtube footer-social-icon"></i>
          <span class="footer-social-url">https://www.youtube.com/@Polymaker</span>
        </a>
        <a href="https://www.instagram.com/polymaker_3d" target="_blank" rel="noopener noreferrer" class="footer-social-item" title="Instagram">
          <i class="fab fa-instagram footer-social-icon"></i>
          <span class="footer-social-url">https://www.instagram.com/polymaker_3d</span>
        </a>
        <a href="https://www.facebook.com/Polymaker.3D" target="_blank" rel="noopener noreferrer" class="footer-social-item" title="Facebook">
          <i class="fab fa-facebook footer-social-icon"></i>
          <span class="footer-social-url">https://www.facebook.com/Polymaker.3D</span>
        </a>
      </div>
    </div>
  </div>
  <p class="footer-readme"><span data-i18n="footer.readme">For more information, see</span> <a href="https://github.com/Polymaker3D/Polymaker-Preset#readme" target="_blank" rel="noopener noreferrer" data-i18n="footer.readme.link">README</a></p>
</footer>
```

- [ ] **Step 7: Add `data-i18n` to the duplicate modal**

Replace the duplicate modal HTML:

```html
<div id="duplicate-modal" class="modal" role="dialog" aria-labelledby="duplicate-modal-title" aria-hidden="true">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="duplicate-modal-title" class="modal-title" data-i18n="dup.title">⚠️ Duplicate Files Detected</h2>
      <button class="modal-close" type="button" aria-label="Close modal" id="duplicate-modal-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="modal-body">
      <p class="duplicate-intro" data-i18n="dup.intro">Multiple presets are generating the same filename. Please select which preset to keep for each duplicate:</p>
      <div id="duplicate-list" class="duplicate-list"></div>
      <div class="duplicate-actions">
        <button type="button" class="btn-secondary" id="duplicate-cancel" data-i18n="dup.cancel">Cancel</button>
        <button type="button" class="btn-primary" id="duplicate-confirm" data-i18n="dup.confirm">Confirm Export</button>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 8: Add `data-i18n` to the install modal and rewrite step lists to use `data-i18n-steps`**

Replace the install modal HTML:

```html
<div id="install-modal" class="modal" role="dialog" aria-labelledby="modal-title" aria-hidden="true">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="modal-title" class="modal-title" data-i18n="modal.install.title">📦 Manual Installation</h2>
      <button class="modal-close" type="button" aria-label="Close modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="install-section">
        <h3 class="install-section-title" data-i18n="modal.bambu.title">Bambu Studio</h3>
        <h4 class="install-method-title" data-i18n="modal.bambu.method1.title">Method 1: Bundle Method (Recommended)</h4>
        <ol class="install-steps" data-i18n-steps="modal.bambu.method1.steps"></ol>
        <p class="install-note" data-i18n-html="modal.bambu.method1.note"></p>
        <h4 class="install-method-title" data-i18n="modal.bambu.method2.title">Method 2: Individual File Method</h4>
        <ol class="install-steps" data-i18n-steps="modal.bambu.method2.steps"></ol>
      </div>
      <div class="install-section">
        <h3 class="install-section-title" data-i18n="modal.orca.title">OrcaSlicer / ElegooSlicer</h3>
        <ol class="install-steps" data-i18n-steps="modal.orca.steps"></ol>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 9: Add the language switcher dropdown HTML and load `i18n.js` before `app.js`**

In `index.html`, add the lang switcher just before `</body>`:

```html
<!-- Language Switcher -->
<div class="lang-switcher" id="lang-switcher">
  <button class="lang-switcher-toggle" id="lang-switcher-toggle" type="button" aria-label="Switch language">
    <span id="lang-dropdown-label">EN</span>
    <span class="lang-switcher-arrow" aria-hidden="true">▾</span>
  </button>
  <ul class="lang-menu" id="lang-menu" role="listbox">
    <li class="lang-option" data-lang="en" role="option">English</li>
    <li class="lang-option" data-lang="zh" role="option">中文</li>
  </ul>
</div>
```

And change the script loading order at the bottom:

```html
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
<script src="i18n.js"></script>
<script src="app.js"></script>
```

- [ ] **Step 10: Commit**

```bash
git add index.html
git commit -m "feat: add data-i18n attributes and lang switcher to index.html"
```

---

## Task 4: Update `app.js` — replace hardcoded strings with `t()` calls and wire up lang switcher

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace status text and error in the fetch callback**

Find line 1573:
```js
if (status) status.textContent = totalPresets + ' presets in ' + Object.keys(groups).length + ' materials.';
```
Replace with:
```js
if (status) status.textContent = t('list.count', { n: totalPresets, m: Object.keys(groups).length });
```

Find line 1626:
```js
document.getElementById('status').textContent = 'Failed to load: ' + err.message;
```
Replace with:
```js
document.getElementById('status').textContent = t('list.failed', { msg: err.message });
```

- [ ] **Step 2: Replace loading state text in `downloadSelectedPresets`**

Find (line ~848):
```js
downloadSelectedBtn.textContent = 'Loading...';
```
Replace with:
```js
downloadSelectedBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> <span>' + t('btn.download.selected.loading') + '</span>';
```

Find the two occurrences of (lines ~896, ~904):
```js
downloadSelectedBtn.textContent = 'Download Selected';
```
Replace both with:
```js
downloadSelectedBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> <span data-i18n="btn.download.selected">' + t('btn.download.selected') + '</span> (<span id="selected-count">' + Object.keys(selectedPresets).length + '</span>)';
```

- [ ] **Step 3: Replace loading/reset text in `downloadSelectedBundle` and `generateAndDownloadBundleBatch`**

Find (line ~951):
```js
downloadBundleBtn.textContent = 'Loading...';
```
Replace with:
```js
downloadBundleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> <span>' + t('btn.download.bundle.loading') + '</span>';
```

Find all four occurrences of:
```js
downloadBundleBtn.textContent = 'Download Bundle (.bbsflmt)';
```
Replace each with:
```js
downloadBundleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> <span data-i18n="btn.download.bundle">' + t('btn.download.bundle') + '</span>';
```

- [ ] **Step 4: Replace alert strings**

Find (line ~944):
```js
alert('No BambuStudio presets available to download. Please make sure BambuStudio is selected as the slicer.');
```
Replace with:
```js
alert(t('alert.no.bambu'));
```

Find (line ~983):
```js
alert('Failed to load preset data. Please check your connection and try again.');
```
Replace with:
```js
alert(t('alert.load.failed'));
```

Find (line ~1008):
```js
alert('Error loading presets: ' + err.message);
```
Replace with:
```js
alert(t('alert.error.loading', { msg: err.message }));
```

Find (line ~1590):
```js
alert('Invalid preset URL');
```
Replace with:
```js
alert(t('alert.invalid.url'));
```

Find (line ~1617):
```js
alert('Error loading preset: ' + err.message + '. Please try again.');
```
Replace with:
```js
alert(t('alert.error.preset', { msg: err.message }));
```

- [ ] **Step 5: Replace `setupDropdown` default labels**

Find (line ~617):
```js
var defaultLabel = isSlicer ? 'Select Slicer' : ('All ' + (name === 'series' ? 'Series' : name === 'brand' ? 'Brands' : 'Models'));
```
Replace with:
```js
var defaultLabel = isSlicer ? t('filter.slicer.placeholder') : (name === 'series' ? t('filter.all.series') : name === 'brand' ? t('filter.all.brands') : t('filter.all.models'));
```

Find (line ~622):
```js
html += '<div class="dropdown-option' + (filterState[name] ? '' : ' is-active') + '" data-value="">All</div>';
```
Replace with:
```js
html += '<div class="dropdown-option' + (filterState[name] ? '' : ' is-active') + '" data-value="">' + t('filter.all') + '</div>';
```

Find (line ~629):
```js
if (labelEl) labelEl.textContent = filterState[name] || defaultLabel;
```
Replace with:
```js
if (labelEl) labelEl.textContent = filterState[name] || defaultLabel;
```
(No change needed here — defaultLabel is already translated above.)

Find (line ~741):
```js
if (labelEl) labelEl.textContent = display || 'All';
```
Replace with:
```js
if (labelEl) labelEl.textContent = display || t('filter.all');
```

- [ ] **Step 6: Replace folder row text**

Find (line ~1500):
```js
'<td colspan="4">' + folderIconSvg + escapeHtml(mat) + ' <span class="folder-count">(' + list.length + ' presets)</span></td>' +
```
Replace with:
```js
'<td colspan="4">' + folderIconSvg + escapeHtml(mat) + ' <span class="folder-count">(' + t('folder.presets', { n: list.length }) + ')</span></td>' +
```

Find (line ~1502):
```js
'<td class="td-actions"><span class="folder-hint">Click to expand</span></td>' +
```
Replace with:
```js
'<td class="td-actions"><span class="folder-hint">' + t('folder.expand') + '</span></td>' +
```

- [ ] **Step 7: Replace duplicate dialog dynamic strings**

Find (line ~1829):
```js
html += '<div class="duplicate-target-label">For printer: ' + escapeHtml(target.targetPrinter) + '</div>';
```
Replace with:
```js
html += '<div class="duplicate-target-label">' + t('dup.for.printer', { name: escapeHtml(target.targetPrinter) }) + '</div>';
```

Find (line ~1854):
```js
html += '<div class="duplicate-option-source">Use ' + escapeHtml(sourceDisplayName) + ' profile</div>';
```
Replace with:
```js
html += '<div class="duplicate-option-source">' + t('dup.use.profile', { name: escapeHtml(sourceDisplayName) }) + '</div>';
```

Find (line ~1855):
```js
html += '<div class="duplicate-option-compatible">Compatible with: ' + escapeHtml(compatiblePrinters.join(', ')) + '</div>';
```
Replace with:
```js
html += '<div class="duplicate-option-compatible">' + t('dup.compatible', { list: escapeHtml(compatiblePrinters.join(', ')) }) + '</div>';
```

- [ ] **Step 8: Initialize i18n and wire up the lang switcher**

At the very bottom of `app.js`, before the final `init()` call, add the following block:

```js
// ── i18n initialization ──────────────────────────────────
function initLangSwitcher() {
  var switcher = document.getElementById('lang-switcher');
  var toggle = document.getElementById('lang-switcher-toggle');
  var menu = document.getElementById('lang-menu');
  if (!switcher || !toggle || !menu) return;

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    switcher.classList.toggle('is-open');
  });

  document.addEventListener('click', function () {
    switcher.classList.remove('is-open');
  });

  var options = menu.querySelectorAll('.lang-option');
  for (var i = 0; i < options.length; i++) {
    options[i].addEventListener('click', function (e) {
      e.stopPropagation();
      var lang = this.getAttribute('data-lang');
      I18N.applyLanguage(lang);
      switcher.classList.remove('is-open');
    });
  }
}

// Apply detected browser language on load
var detectedLang = I18N.detectLang();
I18N.applyLanguage(detectedLang);
initLangSwitcher();
```

The existing last 4 lines should remain:
```js
init();
initModal();
initDuplicateModal();
initAccordion();
```

- [ ] **Step 9: Re-apply translations when language changes (for dynamic content)**

In the `init()` function, after `render()` is called (line ~1623), add a listener so that when the language changes, the table re-renders with translated strings:

```js
document.addEventListener('langchange', function () {
  render();
  // Re-sync button labels (they may have been set to loading state and reset)
  var dlSelectedSpan = document.querySelector('#download-selected-btn [data-i18n="btn.download.selected"]');
  if (dlSelectedSpan) dlSelectedSpan.textContent = t('btn.download.selected');
  var dlBundleSpan = document.querySelector('#download-bundle-btn [data-i18n="btn.download.bundle"]');
  if (dlBundleSpan) dlBundleSpan.textContent = t('btn.download.bundle');
});
```

- [ ] **Step 10: Commit**

```bash
git add app.js
git commit -m "feat: wire i18n t() calls into app.js and add lang switcher init"
```

---

## Task 5: Verify everything works

- [ ] **Step 1: Open the page in a browser**

Run a local server (e.g. `python3 -m http.server 8080`) and open `http://localhost:8080`.

- [ ] **Step 2: Check English default**

With browser language set to English, all text should display in English. The lang dropdown in the top-right should show `EN`.

- [ ] **Step 3: Switch to Chinese**

Click the lang dropdown and select `中文`. All visible text — hero, filters, table headers, buttons, footer, modals — should switch to Chinese.

- [ ] **Step 4: Check browser auto-detect**

Set browser language to `zh-CN` (or `zh-TW`) and reload. The page should load in Chinese by default.

- [ ] **Step 5: Check dynamic strings**

Load presets, verify the status count text renders correctly in both languages. Open the install modal — steps should be fully translated.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete multi-language EN/ZH support"
```
