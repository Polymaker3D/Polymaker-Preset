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
    var steps = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
                (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) || [];
    return steps.map(function (step) {
      return '<li>' + step + '</li>';
    }).join('');
  }

  function applyLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;

    // Update data-i18n elements (plain text)
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

    // Notify app.js to re-render dynamic content
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  function getCurrentLang() {
    return currentLang;
  }

  return { t: t, applyLanguage: applyLanguage, detectLang: detectLang, getCurrentLang: getCurrentLang };
})();

// Expose global t() used by app.js
function t(key, vars) { return I18N.t(key, vars); }
