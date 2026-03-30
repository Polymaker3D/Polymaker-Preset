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
      'alert.error.download': 'Error downloading preset: {msg}',

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
      'lang.zh': '中文',

      // Missing value fallbacks
      'value.unknown': 'Unknown',
      'value.unknown.filament': 'Unknown Filament',
      'value.none': '-',

      // Download button titles
      'title.download.json': 'Download as JSON file',
      'title.download.bundle': 'Download as BambuStudio Bundle',

      // Filename defaults
      'filename.preset': 'preset.json',
      'filename.bundle': 'polymaker-bundle.bbsflmt'
    },

    zh: {
      // Hero
      'hero.title': '耗材预设文件',
      'hero.desc': '选择您的切片软件，查看并下载 Polymaker 打印配置文件和耗材预设',
      'hero.howto': '如何使用？',

      // Filters
      'filter.slicer.label': '选择切片软件',
      'filter.slicer.placeholder': '请选择',
      'filter.series.label': '耗材系列',
      'filter.brand.label': '打印机品牌',
      'filter.model.label': '打印机型号',
      'filter.all': '全部',
      'filter.all.series': '全部系列',
      'filter.all.brands': '全部品牌',
      'filter.all.models': '全部型号',
      'filter.strict': '严格模式：仅显示为该打印机专门制作的预设',

      // List / table
      'list.title': '预设列表',
      'list.loading': '加载中…',
      'list.count': '{m} 种耗材共 {n} 个预设。',
      'list.failed': '加载失败：{msg}',
      'table.material': '耗材',
      'table.brand': '打印机品牌',
      'table.printer': '打印机',
      'table.compatible': '兼容打印机',
      'table.modified': '最后修改',
      'table.action': '下载',

      // Buttons
      'btn.download.selected': '下载所选',
      'btn.download.selected.loading': '加载中...',
      'btn.download.bundle': '下载打包 (.bbsflmt)',
      'btn.download.bundle.loading': '加载中...',

      // Folder row
      'folder.presets': '{n} 个预设',
      'folder.expand': '点击展开',

      // Alerts / errors
      'alert.no.bambu': '没有可用的 BambuStudio 预设。请确保已选择 BambuStudio 为切片软件。',
      'alert.load.failed': '预设数据加载失败，请检查网络连接并重试。',
      'alert.error.loading': '加载预设出错：{msg}',
      'alert.invalid.url': '无效的预设链接',
      'alert.error.preset': '加载预设出错：{msg}，请重试。',
      'alert.error.download': '下载预设出错：{msg}',

      // Duplicate modal
      'dup.title': '⚠️ 检测到重复文件',
      'dup.intro': '多个预设生成了相同的文件名，请为每个重复选择保留哪个预设：',
      'dup.for.printer': '针对打印机：{name}',
      'dup.use.profile': '使用 {name} 配置文件',
      'dup.compatible': '兼容：{list}',
      'dup.cancel': '取消',
      'dup.confirm': '确认导出',

      // Install modal
      'modal.install.title': '📦 手动安装',
      'modal.bambu.title': 'Bambu Studio',
      'modal.bambu.method1.title': '方法一：打包模式（推荐）',
      'modal.bambu.method1.steps': [
        '从<a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">下载页面</a>下载预设 <strong>.bbsflmt</strong> 文件（或打包 ZIP）。',
        '如果是 ZIP 文件，请解压以提取 .bbsflmt 文件。',
        '打开 Bambu Studio。',
        '进入 <strong>文件</strong> → <strong>导入</strong> → <strong>导入预设...</strong>。',
        '选择 <strong>.bbsflmt</strong> 文件。',
        '单击项目耗材列表中的耗材，即可选择导入的自定义预设'
      ],
      'modal.bambu.method1.note': '<strong>注意：</strong>.bbsflmt 打包仅适用于 BambuStudio。仅在未应用打印机筛选时，打包下载按钮才会显示。',
      'modal.bambu.method2.title': '方法二：单文件模式',
      'modal.bambu.method2.steps': [
        '从<a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">下载页面</a>下载 JSON 文件（或单文件 ZIP）。',
        '打开 Bambu Studio。',
        '进入 <strong>文件</strong> → <strong>导入</strong> → <strong>导入预设...</strong>。',
        '选择 JSON 或 ZIP 文件。',
        '单击项目消耗品列表中的耗材，选择导入的自定义预设，预设将出现在预设列表中。'
      ],
      'modal.orca.title': 'OrcaSlicer / ElegooSlicer',
      'modal.orca.steps': [
        '从<a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">下载页面</a>下载 <strong>JSON</strong> 或单文件 <strong>ZIP</strong>。',
        '打开 OrcaSlicer 或 ElegooSlicer。',
        '进入 <strong>文件</strong> → <strong>导入</strong>：<ul><li><strong>JSON</strong> 文件：选择 <strong>导入配置...</strong>（OrcaSlicer）或 <strong>导入预设...</strong>（ElegooSlicer）。</li><li><strong>ZIP</strong> 文件：选择 <strong>导入 ZIP 包...</strong>，无需解压。</li></ul>',
        '预设将出现在预设列表中。'
      ],

      // Known Issues
      'issues.title': '已知问题',
      'issues.p2s.title': 'P2S 过热问题 - 已应用临时修复',
      'issues.p2s.issue': '<strong>问题：</strong>P2S 打印机在打印玻璃化转变温度 > 50°C 的耗材时，可能因起始 G-code 问题而过热。',
      'issues.p2s.solution': '<strong>解决方案：</strong>我们已向玻璃化转变温度 > 50°C 的 P2S 预设添加冷却 G-code 命令作为临时修复，期待 Bambu Lab 官方修复此问题。',
      'issues.p2s.link': '查看 BambuStudio Issue #8801 →',
      'issues.p2s.credits': '感谢 alexbreinig 和 capsel22 发现了这个问题。',

      // Footer
      'footer.links': '链接',
      'footer.social': '社交平台',
      'footer.readme': '更多信息请查阅',
      'footer.readme.link': 'README',

      // Language switcher
      'lang.en': 'English',
      'lang.zh': '中文',

      // Missing value fallbacks
      'value.unknown': '未知',
      'value.unknown.filament': '未知耗材',
      'value.none': '-',

      // Download button titles
      'title.download.json': '下载 JSON 文件',
      'title.download.bundle': '下载 BambuStudio 打包文件',

      // Filename defaults
      'filename.preset': 'preset.json',
      'filename.bundle': 'polymaker-bundle.bbsflmt'
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
      activeLangLabel.textContent = lang === 'zh' ? '中文' : 'EN';
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
