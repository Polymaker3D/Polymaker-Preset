// i18n.js — Single source of truth for all UI translations.
// To add a new language: add a new key block below and a <li> in the lang dropdown in index.html.

var I18N = (function () {
  var LOGO_SRC = {
    en: './assets/logo/Polymaker%20Teal.png',
    zh: './assets/logo/Chinese_NoSlogan_Teal.png'
  };

  var TRANSLATIONS = {
    en: {
      // Hero
      'hero.logo.alt': 'Polymaker',
      'hero.title': 'Filament Presets',
      'hero.desc': 'Select your slicer to view and download Polymaker print profiles and filament presets for Bambu Studio, OrcaSlicer, ElegooSlicer, and PrusaSlicer',
      'hero.howto': 'How to use?',
      'product.htPlaPro.title': 'Introducing Polymaker™ HT-PLA Pro',
      'product.htPlaPro.tagline': 'Heat Ready. Impact Ready. Still PLA.',
      'product.htPlaPro.cta': 'Learn More',

      // Filters
      'filter.slicer.label': 'Select Your Slicer',
      'filter.slicer.placeholder': 'Select Slicer',
    'filter.slicer.notice': 'Each preset we provide is tuned for a specific combination of material, printer model, and slicer. If a preset is unavailable for your slicer but available for another, you can adapt it manually.',
      'filter.slicer.guide': 'Open conversion guide',
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
      'alert.no.presets': 'No presets provided',
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

      // BambuStudio Restart Warning Modal
      'modal.restart.title': '\u26a0\ufe0f Restart BambuStudio Required',
      'modal.restart.message': '<strong>Important:</strong> After importing presets into BambuStudio, you <strong>must restart the slicer</strong> before slicing and printing. Failure to restart may cause incorrect settings to be applied.',
      'modal.restart.link': 'View GitHub Issue #10583 \u2192',
      'modal.restart.cancel': 'Cancel',
      'modal.restart.confirm': 'Continue Download',
      'modal.missingvariant.title': '⚠️ Some Nozzle Options Have No Preset',
      'modal.missingvariant.intro': "Some selected presets don't include every nozzle/extruder option for this printer. We didn't make presets for these variants:",
      'modal.missingvariant.note': "You can still download — those nozzle options just won't have tuned values.",
      'modal.missingvariant.ack': 'Continue Download',

      'modal.convert.title': 'How to Import Bambu Studio Presets into Orca Slicer',
      'modal.convert.warning': 'WARNING: Polymaker does not officially support manual preset conversion. Conversion can remove settings, assign incorrect values, or cause other parameter errors. These errors can cause unpredictable printing results. Review all imported parameters and run a test print before you use the converted preset.',
      'modal.convert.intro': "This guide explains how to import print profiles from Bambu Studio, or another printer brand's slicer, into Orca Slicer.",
      'modal.convert.steps': [
        '<h3 class="conversion-step-title">Select Printer and Filament</h3><p>In Bambu Studio, first make sure you have correctly selected the <b>Printer</b> and <b>Filament</b> you want to export, and have applied the parameter configurations you wish to export.</p><img class="conversion-step-image" src="assets/conversion-guide/en-step-1.png" alt="Printer and filament selection in Bambu Studio" width="1915" height="1021" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">Save Project As 3MF File</h3><p>Once configured, click on the File menu and select <b>Save Project As</b> to save the current project as a <code>.3mf</code> file.</p><img class="conversion-step-image" src="assets/conversion-guide/en-step-2.png" alt="Save Project As command in Bambu Studio" width="1919" height="1011" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">Open Project in Orca Slicer</h3><p>Open Orca Slicer, click <b>Open Project</b> in the File menu, or drag the saved <code>.3mf</code> file into the Orca Slicer window.</p><img class="conversion-step-image" src="assets/conversion-guide/en-step-3.png" alt="Open Project command in Orca Slicer" width="1911" height="1015" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">Review Import Errors</h3><p>Orca Slicer can show errors for unsupported parameters while it opens the file. Review each message, then confirm or close it to continue.</p><img class="conversion-step-image" src="assets/conversion-guide/en-step-4.png" alt="Unsupported parameter message in Orca Slicer" width="1918" height="1005" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">Edit Filament</h3><p>After the project loads, find the imported filament and process settings in the left panel. Click the <b>Edit</b> button next to the filament. Check the parameters, then click the <b>Save</b> icon.</p><img class="conversion-step-image" src="assets/conversion-guide/en-step-5.png" alt="Edit filament settings in Orca Slicer" width="1917" height="1020" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">Save as User Preset</h3><p>In the save dialog, select <b>User preset</b>, then confirm the save. Orca Slicer will store the configuration as a custom preset.</p><img class="conversion-step-image" src="assets/conversion-guide/en-step-6.png" alt="Save as User preset option in Orca Slicer" width="1919" height="1017" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">Check Correctness</h3><p>Check the imported process and filament parameters, including layer height, extruder temperature, bed temperature, and speed. Compare them with the original Bambu Studio settings before you print.</p><img class="conversion-step-image" src="assets/conversion-guide/en-step-7.png" alt="Imported preset parameters in Orca Slicer" width="1915" height="1015" loading="lazy" decoding="async">'
      ],
      'modal.convert.complete': 'After you save the custom preset, you can select it directly from the Orca Slicer preset menu.',

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
      'modal.bambu.method1.note': '<strong>Note:</strong> .bbsflmt bundles are only available for BambuStudio. The bundle download button appears when BambuStudio presets are selected.',
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
      'modal.prusa.title': 'PrusaSlicer',
      'modal.prusa.steps': [
        'Download the preset as an <strong>INI</strong> file from the <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">download page</a>.',
        'Open PrusaSlicer.',
        'Go to <strong>File</strong> \u2192 <strong>Import</strong> \u2192 <strong>Import Config...</strong>, then select the INI file.',
        'The filament preset will appear in your preset list.'
      ],

      // Known Issues
      'issues.title': 'Known Issues',
      'issues.resolved.title': 'Resolved Issues',
      'issues.import.title': 'BambuStudio Preset Import Mismatch - Fixed',
      'issues.import.issue': '<strong>Issue:</strong> BambuStudio matches filament presets to printers by checking whether the full printer preset name (e.g. "Bambu Lab X1 Carbon 0.4 nozzle") appears inside the preset\'s <code>name</code> field. Polymaker source files use the abbreviation <code>@BBL X1</code>, so the substring check fails and AMS slot temperature / type do not populate when assigning the imported filament.',
      'issues.import.solution': '<strong>Solution:</strong> This website now automatically splits BambuStudio downloads into per-printer files and rewrites the <code>name</code> field to contain the full printer preset name. Download presets using the <strong>JSON</strong> or <strong>.bbsflmt</strong> buttons on this page — do not copy raw JSON files directly from GitHub.',
      'issues.import.link': 'View GitHub Issue #14 \u2192',
      'issues.p2s.title': 'P2S Overheating Issue - Temporary Fix Applied',
      'issues.p2s.issue': '<strong>Issue:</strong> P2S printer may overheat when printing materials with vitrification temperature > 50\u00b0C due to starting G-code issues.',
      'issues.p2s.solution': '<strong>Solution:</strong> We have implemented a temporary fix by adding cooling G-code commands to P2S presets with vitrification temperature > 50\u00b0C. This is a temporary workaround until Bambu Lab fixes this issue.',
      'issues.p2s.link': 'View BambuStudio Issue #8801 \u2192',
      'issues.p2s.credits': 'Thanks to alexbreinig and capsel22 for identifying this issue.',
      'issues.restart.title': 'BambuStudio Restart Required After Import',
      'issues.restart.issue': '<strong>Issue:</strong> BambuStudio may not correctly apply newly imported filament presets until the application is restarted. Slicing or printing without restarting may use incorrect temperature, flow rate, or other filament settings.',
      'issues.restart.solution': '<strong>Solution:</strong> Always restart BambuStudio after importing Polymaker presets, before you start slicing or printing. A warning popup will also remind you when downloading BambuStudio presets from this page.',
      'issues.restart.link': 'View BambuStudio Issue #10583 \u2192',
      'issues.aux.title': 'Missing Presets for Some Nozzle / Extruder Options',
      'issues.aux.issue': '<strong>Issue:</strong> Bambu Lab printers that offer more than one extruder/nozzle option (such as the multi-nozzle X2D and the H2 series) store a separate set of values for each option \u2014 <code>Direct Drive Standard</code>, <code>Direct Drive High Flow</code>, <code>Bowden Standard</code>, and <code>Bowden High Flow</code> \u2014 inside a single filament preset. For some materials we have only tuned the main option (usually <code>Direct Drive Standard</code>), so the other nozzle options, including the auxiliary (Bowden) nozzle, are left empty and have no tuned values.',

      // Footer
      'footer.links': 'Links',
      'footer.social': 'Social Accounts',
      'footer.readme': 'For more information, see',
      'footer.readme.link': 'README',

      // Language switcher
      'lang.en': 'English',
      'lang.zh': '中文',
      'lang.de': 'Deutsch',
      'lang.it': 'Italiano',
      'lang.fr': 'Français',
      'lang.es': 'Español',

      // Missing value fallbacks
      'value.unknown': 'Unknown',
      'value.unknown.filament': 'Unknown Filament',
      'value.none': '-',

      // Download button titles
      'title.download.json': 'Download preset file',
      'title.download.bundle': 'Download as BambuStudio Bundle',

      // Filename defaults
      'filename.preset': 'preset.json',
      'filename.bundle': 'polymaker-bundle.bbsflmt'
    },

    zh: {
      // Hero
      'hero.logo.alt': '\u805a\u590d\u79d1\u6280',
      'hero.title': '耗材预设文件',
      'hero.desc': '选择您的切片软件，查看并下载适用于 Bambu Studio、OrcaSlicer、ElegooSlicer 和 PrusaSlicer 的 Polymaker 打印配置文件和耗材预设',
      'hero.howto': '如何使用？',
      'product.htPlaPro.title': '全新 Polymaker™ HT-PLA Pro',
      'product.htPlaPro.tagline': '耐热就绪，抗冲击就绪，依然是 PLA。',
      'product.htPlaPro.cta': '了解更多',

      // Filters
      'filter.slicer.label': '选择切片软件',
      'filter.slicer.placeholder': '请选择',
    'filter.slicer.notice': '我们提供的每个预设均针对特定的耗材、打印机型号和切片软件组合进行调校。如果您的切片软件没有所需预设，但其他切片软件有可用预设，您可以手动进行转换。',
      'filter.slicer.guide': '打开转换指南',
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
      'alert.no.presets': '未提供预设',
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

      // BambuStudio Restart Warning Modal
      'modal.restart.title': '⚠️ 需要重启 BambuStudio',
      'modal.restart.message': '<strong>重要提示：</strong>将预设导入 BambuStudio 后，在切片和打印前<strong>必须重启切片软件</strong>。如不重启，可能会导致设置错误。',
      'modal.restart.link': '查看 GitHub Issue #10583 \u2192',
      'modal.restart.cancel': '取消',
      'modal.restart.confirm': '继续下载',
      'modal.missingvariant.title': '⚠️ 部分喷嘴选项没有预设',
      'modal.missingvariant.intro': '所选的部分预设并未覆盖该打印机的全部喷嘴/挤出机选项。以下变体我们没有制作预设：',
      'modal.missingvariant.note': '你仍然可以下载 —— 这些喷嘴选项只是没有调校好的数值。',
      'modal.missingvariant.ack': '继续下载',

      'modal.convert.title': '如何将 Bambu Studio 预设文件导入到 Orca Slicer',
      'modal.convert.warning': '警告：Polymaker 不正式支持手动转换预设。转换过程可能导致设置丢失、数值错误或其他参数异常。这些问题可能造成不可预测的打印结果。使用转换后的预设前，请检查所有导入参数并进行测试打印。',
      'modal.convert.intro': '本指南介绍如何将 Bambu Studio 或其他打印机品牌自有切片软件中的打印配置导入到 Orca Slicer。',
      'modal.convert.steps': [
        '<h3 class="conversion-step-title">选择设备和耗材</h3><p>在 Bambu Studio 中，确认已经选择要导出的<b>打印机设备</b>和<b>耗材类型</b>，并应用需要导出的参数配置。</p><img class="conversion-step-image" src="assets/conversion-guide/zh-step-1.png" alt="在 Bambu Studio 中选择打印机和耗材" width="1919" height="1017" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">将项目另存为 3MF 文件</h3><p>配置完成后，打开文件菜单，选择<b>另存为</b>或<b>保存项目</b>，将当前项目保存为 <code>.3mf</code> 文件。</p><img class="conversion-step-image" src="assets/conversion-guide/zh-step-2.png" alt="在 Bambu Studio 中将项目另存为 3MF 文件" width="1918" height="1017" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">在 Orca Slicer 中打开项目</h3><p>打开 Orca Slicer，在文件菜单中选择<b>打开项目</b>，或将保存的 <code>.3mf</code> 文件拖到 Orca Slicer 主界面中。</p><img class="conversion-step-image" src="assets/conversion-guide/zh-step-3.png" alt="在 Orca Slicer 中打开 3MF 项目" width="1919" height="1022" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">检查导入错误</h3><p>Orca Slicer 打开文件时，可能提示部分参数不受支持。请检查每条提示，然后确认或关闭提示以继续导入。</p><img class="conversion-step-image" src="assets/conversion-guide/zh-step-4.png" alt="Orca Slicer 中不支持参数的提示" width="1919" height="1009" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">编辑耗材</h3><p>项目加载后，在左侧面板中找到导入的耗材和工艺配置。单击耗材旁边的<b>编辑按钮</b>，检查参数，然后单击上方的<b>保存图标</b>。</p><img class="conversion-step-image" src="assets/conversion-guide/zh-step-5.png" alt="在 Orca Slicer 中编辑耗材设置" width="1894" height="996" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">保存为用户预设</h3><p>在保存对话框中选择 <b>User preset（用户预设）</b>，然后确认保存。Orca Slicer 会将该配置保存为自定义预设。</p><img class="conversion-step-image" src="assets/conversion-guide/zh-step-6.png" alt="在 Orca Slicer 中选择用户预设" width="887" height="706" loading="lazy" decoding="async">',
        '<h3 class="conversion-step-title">检查正确性</h3><p>检查导入的工艺和耗材参数，包括层高、挤出机温度、热床温度和速度。打印前，请将这些参数与 Bambu Studio 中的原始设置进行比较。</p><img class="conversion-step-image" src="assets/conversion-guide/zh-step-7.png" alt="检查 Orca Slicer 中导入的预设参数" width="1917" height="1006" loading="lazy" decoding="async">'
      ],
      'modal.convert.complete': '成功保存自定义预设后，您可以直接从 Orca Slicer 的预设下拉菜单中选择并使用该配置。',

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
      'modal.bambu.method1.note': '<strong>注意：</strong>.bbsflmt 打包仅适用于 BambuStudio。选择 BambuStudio 预设时，打包下载按钮才会显示。',
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
      'modal.prusa.title': 'PrusaSlicer',
      'modal.prusa.steps': [
        '从<a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">下载页面</a>下载 <strong>INI</strong> 文件。',
        '打开 PrusaSlicer。',
        '进入 <strong>文件</strong> → <strong>导入</strong> → <strong>导入配置...</strong>，然后选择该 INI 文件。',
        '耗材预设将出现在预设列表中。'
      ],

      // Known Issues
      'issues.title': '已知问题',
      'issues.resolved.title': '已解决问题',
      'issues.import.title': 'BambuStudio 预设导入不匹配 - 已修复',
      'issues.import.issue': '<strong>问题：</strong>BambuStudio 通过检查完整的打印机预设名称（例如 "Bambu Lab X1 Carbon 0.4 nozzle"）是否出现在预设的 <code>name</code> 字段中来匹配耗材预设。Polymaker 源文件使用缩写 <code>@BBL X1</code>，导致子字符串检查失败，分配导入的耗材到 AMS 槽位时温度/类型无法自动填充。',
      'issues.import.solution': '<strong>解决方案：</strong>本网站现已自动将 BambuStudio 下载拆分为按打印机分类的文件，并将 <code>name</code> 字段重写为完整的打印机预设名称。请使用本页面的 <strong>JSON</strong> 或 <strong>.bbsflmt</strong> 按钮下载预设 — 不要直接从 GitHub 复制原始 JSON 文件。',
      'issues.import.link': '查看 GitHub Issue #14 \u2192',
      'issues.p2s.title': 'P2S 过热问题 - 已应用临时修复',
      'issues.p2s.issue': '<strong>问题：</strong>P2S 打印机在打印玻璃化转变温度 > 50°C 的耗材时，可能因起始 G-code 问题而过热。',
      'issues.p2s.solution': '<strong>解决方案：</strong>我们已向玻璃化转变温度 > 50°C 的 P2S 预设添加冷却 G-code 命令作为临时修复，期待 Bambu Lab 官方修复此问题。',
      'issues.p2s.link': '查看 BambuStudio Issue #8801 →',
      'issues.p2s.credits': '感谢 alexbreinig 和 capsel22 发现了这个问题。',
      'issues.restart.title': '导入 BambuStudio 预设后需要重启软件',
      'issues.restart.issue': '<strong>问题：</strong>BambuStudio 在重启前可能无法正确应用新导入的耗材预设。未重启直接切片或打印可能会导致温度、流量或其他耗材设置错误。',
      'issues.restart.solution': '<strong>解决方案：</strong>导入 Polymaker 预设后，在开始切片或打印前请务必重启 BambuStudio。从本页面下载 BambuStudio 预设时，也会弹出警告提醒您。',
      'issues.aux.title': '部分喷嘴 / 挤出机选项缺少预设',
      'issues.aux.issue': '<strong>问题：</strong>提供多个挤出机/喷嘴选项的 Bambu Lab 打印机（例如多喷嘴的 X2D 和 H2 系列）会在同一个耗材预设中为每个选项分别存储一组数值——<code>Direct Drive Standard</code>、<code>Direct Drive High Flow</code>、<code>Bowden Standard</code> 和 <code>Bowden High Flow</code>。对于部分材料，我们只调校了主选项（通常是 <code>Direct Drive Standard</code>），因此其他喷嘴选项（包括辅助的 Bowden 喷嘴）为空，没有调校好的数值。',
      'issues.restart.link': '查看 BambuStudio Issue #10583 \u2192',

      // Footer
      'footer.links': '链接',
      'footer.social': '社交平台',
      'footer.readme': '更多信息请查阅',
      'footer.readme.link': 'README',

      // Language switcher
      'lang.en': 'English',
      'lang.zh': '中文',
      'lang.de': 'Deutsch',
      'lang.it': 'Italiano',
      'lang.fr': 'Français',
      'lang.es': 'Español',

      // Missing value fallbacks
      'value.unknown': '未知',
      'value.unknown.filament': '未知耗材',
      'value.none': '-',

      // Download button titles
      'title.download.json': '下载预设文件',
      'title.download.bundle': '下载 BambuStudio 打包文件',

      // Filename defaults
      'filename.preset': 'preset.json',
      'filename.bundle': 'polymaker-bundle.bbsflmt'
    },

    de: {
      // Hero
      'hero.logo.alt': 'Polymaker',
      'hero.title': 'Filamentprofile',
      'hero.desc': 'Wählen Sie Ihren Slicer aus, um Polymaker-Druckprofile und Filamentprofile für Bambu Studio, OrcaSlicer, ElegooSlicer und PrusaSlicer anzuzeigen und herunterzuladen',
      'hero.howto': 'Wie funktioniert es?',
      'product.htPlaPro.title': 'Wir stellen vor: Polymaker™ HT-PLA Pro',
      'product.htPlaPro.tagline': 'Hitzebeständig. Schlagfest. Trotzdem PLA.',
      'product.htPlaPro.cta': 'Mehr erfahren',

      // Filters
      'filter.slicer.label': 'Slicer auswählen',
      'filter.slicer.placeholder': 'Slicer auswählen',
      'filter.series.label': 'Serie',
      'filter.brand.label': 'Druckermarke',
      'filter.model.label': 'Druckermodell',
      'filter.all': 'Alle',
      'filter.all.series': 'Alle Serien',
      'filter.all.brands': 'Alle Marken',
      'filter.all.models': 'Alle Modelle',
      'filter.strict': 'Strikter Modus: Nur Profile anzeigen, die speziell für diesen Drucker erstellt wurden',

      // List / table
      'list.title': 'Profile',
      'list.loading': 'Wird geladen…',
      'list.count': '{n} Profile in {m} Materialien.',
      'list.failed': 'Laden fehlgeschlagen: {msg}',
      'table.material': 'Material',
      'table.brand': 'Druckermarke',
      'table.printer': 'Drucker',
      'table.compatible': 'Kompatible Drucker',
      'table.modified': 'Zuletzt geändert',
      'table.action': 'Download-Aktion',

      // Buttons
      'btn.download.selected': 'Auswahl herunterladen',
      'btn.download.selected.loading': 'Wird geladen...',
      'btn.download.bundle': 'Paket herunterladen (.bbsflmt)',
      'btn.download.bundle.loading': 'Wird geladen...',

      // Folder row
      'folder.presets': '{n} Profile',
      'folder.expand': 'Zum Aufklappen klicken',

      // Alerts / errors
      'alert.no.bambu': 'Keine BambuStudio-Profile zum Herunterladen verfügbar. Bitte stellen Sie sicher, dass BambuStudio als Slicer ausgewählt ist.',
      'alert.no.presets': 'Keine Profile verfügbar',
      'alert.load.failed': 'Die Profildaten konnten nicht geladen werden. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
      'alert.error.loading': 'Fehler beim Laden der Profile: {msg}',
      'alert.invalid.url': 'Ungültige Profil-URL',
      'alert.error.preset': 'Fehler beim Laden des Profils: {msg}. Bitte versuchen Sie es erneut.',
      'alert.error.download': 'Fehler beim Herunterladen des Profils: {msg}',

      // Duplicate modal
      'dup.title': '⚠️ Doppelte Dateien erkannt',
      'dup.intro': 'Mehrere Profile erzeugen denselben Dateinamen. Bitte wählen Sie für jedes Duplikat das Profil aus, das beibehalten werden soll:',
      'dup.for.printer': 'Für Drucker: {name}',
      'dup.use.profile': 'Profil {name} verwenden',
      'dup.compatible': 'Kompatibel mit: {list}',
      'dup.cancel': 'Abbrechen',
      'dup.confirm': 'Export bestätigen',

      // BambuStudio Restart Warning Modal
      'modal.restart.title': '⚠️ Neustart von BambuStudio erforderlich',
      'modal.restart.message': '<strong>Wichtig:</strong> Nach dem Importieren von Profilen in BambuStudio <strong>müssen Sie den Slicer neu starten</strong>, bevor Sie slicen und drucken. Ohne Neustart werden möglicherweise falsche Einstellungen angewendet.',
      'modal.restart.link': 'GitHub Issue #10583 anzeigen →',
      'modal.restart.cancel': 'Abbrechen',
      'modal.restart.confirm': 'Download fortsetzen',
      'modal.missingvariant.title': '⚠️ Für einige Düsenoptionen ist kein Profil vorhanden',
      'modal.missingvariant.intro': 'Einige ausgewählte Profile enthalten nicht alle Düsen-/Extruderoptionen für diesen Drucker. Für folgende Varianten haben wir keine Profile erstellt:',
      'modal.missingvariant.note': 'Sie können sie trotzdem herunterladen — diese Düsenoptionen haben einfach keine abgestimmten Werte.',
      'modal.missingvariant.ack': 'Download fortsetzen',

      // Install modal
      'modal.install.title': '📦 Manuelle Installation',
      'modal.bambu.title': 'Bambu Studio',
      'modal.bambu.method1.title': 'Methode 1: Paketmethode (empfohlen)',
      'modal.bambu.method1.steps': [
        'Laden Sie die Profildatei <strong>.bbsflmt</strong> (oder das Paket als ZIP) von der <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">Download-Seite</a> herunter.',
        'Wenn es sich um eine ZIP-Datei handelt, entpacken Sie sie, um die .bbsflmt-Datei(en) zu extrahieren.',
        'Öffnen Sie Bambu Studio.',
        'Navigieren Sie zu <strong>File</strong> → <strong>Import</strong> → <strong>Import Preset...</strong>.',
        'Wählen Sie die <strong>.bbsflmt</strong>-Datei(en) aus.',
        'Klicken Sie in der Filamentliste des Projekts auf ein Material und wählen Sie das importierte benutzerdefinierte Profil aus. Das Profil erscheint anschließend in der Profilliste.'
      ],
      'modal.bambu.method1.note': '<strong>Hinweis:</strong> .bbsflmt-Pakete sind nur für BambuStudio verfügbar. Die Schaltfläche für den Paket-Download erscheint, wenn BambuStudio-Profile ausgewählt sind.',
      'modal.bambu.method2.title': 'Methode 2: Einzeldateimethode',
      'modal.bambu.method2.steps': [
        'Laden Sie die JSON-Profil-Datei (oder das Einzeldatei-ZIP) von der <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">Download-Seite</a> herunter.',
        'Öffnen Sie Bambu Studio.',
        'Navigieren Sie zu <strong>File</strong> → <strong>Import</strong> → <strong>Import Preset...</strong>.',
        'Wählen Sie eine JSON- oder ZIP-Datei aus.',
        'Klicken Sie in der Filamentliste des Projekts auf ein Material und wählen Sie das importierte benutzerdefinierte Profil aus. Das Profil erscheint anschließend in der Profilliste.'
      ],
      'modal.orca.title': 'OrcaSlicer / ElegooSlicer',
      'modal.orca.steps': [
        'Laden Sie das Profil als <strong>JSON</strong> oder <strong>Einzeldatei-ZIP</strong> von der <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">Download-Seite</a> herunter.',
        'Öffnen Sie OrcaSlicer oder ElegooSlicer.',
        'Navigieren Sie zu <strong>File</strong> → <strong>Import</strong>:<ul><li>Für eine <strong>JSON</strong>-Datei: Wählen Sie <strong>Import Configs...</strong> (OrcaSlicer) oder <strong>Import Preset...</strong> (ElegooSlicer) und anschließend die JSON-Datei aus.</li><li>Für eine <strong>ZIP</strong>-Datei: Wählen Sie <strong>Import Zip Archive...</strong> (oder die entsprechende Option, z. B. "Import Zip Archive…" in ElegooSlicer) und anschließend die ZIP-Datei aus (Entpacken ist nicht erforderlich).</li></ul>',
        'Das Profil erscheint in Ihrer Profilliste.'
      ],
      'modal.prusa.title': 'PrusaSlicer',
      'modal.prusa.steps': [
        'Laden Sie das Profil als <strong>INI</strong>-Datei von der <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">Download-Seite</a> herunter.',
        'Öffnen Sie PrusaSlicer.',
        'Navigieren Sie zu <strong>File</strong> → <strong>Import</strong> → <strong>Import Config...</strong> und wählen Sie anschließend die INI-Datei aus.',
        'Das Filamentprofil erscheint in Ihrer Profilliste.'
      ],

      // Known Issues
      'issues.title': 'Bekannte Probleme',
      'issues.import.title': 'Fehlerhafte Zuordnung beim Import von BambuStudio-Profilen - behoben',
      'issues.import.issue': '<strong>Problem:</strong> BambuStudio ordnet Filamentprofile Druckern zu, indem geprüft wird, ob der vollständige Name des Druckerprofils (z. B. "Bambu Lab X1 Carbon 0.4 nozzle") im Feld <code>name</code> des Profils enthalten ist. Die Polymaker-Quelldateien verwenden die Abkürzung <code>@BBL X1</code>, sodass die Teilzeichenfolgenprüfung fehlschlägt und Temperatur / Typ des AMS-Slots beim Zuweisen des importierten Filaments nicht ausgefüllt werden.',
      'issues.import.solution': '<strong>Lösung:</strong> Diese Website teilt BambuStudio-Downloads nun automatisch in druckerspezifische Dateien auf und schreibt das Feld <code>name</code> so um, dass es den vollständigen Namen des Druckerprofils enthält. Laden Sie Profile über die Schaltflächen <strong>JSON</strong> oder <strong>.bbsflmt</strong> auf dieser Seite herunter — kopieren Sie keine rohen JSON-Dateien direkt von GitHub.',
      'issues.import.link': 'GitHub Issue #14 anzeigen →',
      'issues.p2s.title': 'Überhitzungsproblem beim P2S - vorläufige Lösung angewendet',
      'issues.p2s.issue': '<strong>Problem:</strong> Der P2S-Drucker kann beim Drucken von Materialien mit einer Glasübergangstemperatur > 50°C aufgrund von Problemen mit dem Start-G-code überhitzen.',
      'issues.p2s.solution': '<strong>Lösung:</strong> Wir haben eine vorläufige Lösung implementiert, indem wir P2S-Profilen für Materialien mit einer Glasübergangstemperatur > 50°C G-code-Befehle zur Kühlung hinzugefügt haben. Dies ist eine Übergangslösung, bis Bambu Lab das Problem behebt.',
      'issues.p2s.link': 'BambuStudio Issue #8801 anzeigen →',
      'issues.p2s.credits': 'Vielen Dank an alexbreinig und capsel22 für die Identifizierung dieses Problems.',
      'issues.restart.title': 'Neustart von BambuStudio nach dem Import erforderlich',
      'issues.restart.issue': '<strong>Problem:</strong> BambuStudio wendet neu importierte Filamentprofile möglicherweise erst nach einem Neustart der Anwendung korrekt an. Beim Slicen oder Drucken ohne Neustart werden unter Umständen falsche Werte für Temperatur, Flussrate oder andere Filamenteinstellungen verwendet.',
      'issues.restart.solution': '<strong>Lösung:</strong> Starten Sie BambuStudio nach dem Import von Polymaker-Profilen immer neu, bevor Sie mit dem Slicen oder Drucken beginnen. Ein Warnhinweis erinnert Sie auch daran, wenn Sie BambuStudio-Profile von dieser Seite herunterladen.',
      'issues.restart.link': 'BambuStudio Issue #10583 anzeigen →',
      'issues.aux.title': 'Fehlende Profile für einige Düsen / Extruderoptionen',
      'issues.aux.issue': '<strong>Problem:</strong> Bambu Lab-Drucker mit mehr als einer Extruder-/Düsenoption (z. B. der X2D mit mehreren Düsen und die H2-Serie) speichern für jede Option einen eigenen Wertesatz — <code>Direct Drive Standard</code>, <code>Direct Drive High Flow</code>, <code>Bowden Standard</code> und <code>Bowden High Flow</code> — innerhalb eines einzelnen Filamentprofils. Bei einigen Materialien haben wir nur die Hauptoption (in der Regel <code>Direct Drive Standard</code>) abgestimmt. Daher bleiben die anderen Düsenoptionen einschließlich der Hilfsdüse (Bowden) leer und enthalten keine abgestimmten Werte.',

      // Footer
      'footer.links': 'Links',
      'footer.social': 'Soziale Netzwerke',
      'footer.readme': 'Weitere Informationen finden Sie in der',
      'footer.readme.link': 'README',

      // Language switcher
      'lang.en': 'English',
      'lang.zh': '中文',
      'lang.de': 'Deutsch',
      'lang.it': 'Italiano',
      'lang.fr': 'Français',
      'lang.es': 'Español',

      // Missing value fallbacks
      'value.unknown': 'Unbekannt',
      'value.unknown.filament': 'Unbekanntes Filament',
      'value.none': '-',

      // Download button titles
      'title.download.json': 'Profildatei herunterladen',
      'title.download.bundle': 'Als BambuStudio-Paket herunterladen',

      // Filename defaults
      'filename.preset': 'preset.json',
      'filename.bundle': 'polymaker-bundle.bbsflmt'
    },

    it: {
      'hero.logo.alt': 'Polymaker',
      'hero.title': 'Preset per filamenti',
      'hero.desc': 'Seleziona il tuo slicer per visualizzare e scaricare i profili di stampa e i preset per filamenti Polymaker per Bambu Studio, OrcaSlicer, ElegooSlicer e PrusaSlicer',
      'hero.howto': 'Come si usa?',
      'product.htPlaPro.title': 'Presentiamo Polymaker™ HT-PLA Pro',
      'product.htPlaPro.tagline': 'Resistente al calore. Resistente agli urti. Sempre PLA.',
      'product.htPlaPro.cta': 'Scopri di più',

      'filter.slicer.label': 'Seleziona il tuo slicer',
      'filter.slicer.placeholder': 'Seleziona slicer',
      'filter.series.label': 'Serie',
      'filter.brand.label': 'Marca della stampante',
      'filter.model.label': 'Modello della stampante',
      'filter.all': 'Tutti',
      'filter.all.series': 'Tutte le serie',
      'filter.all.brands': 'Tutte le marche',
      'filter.all.models': 'Tutti i modelli',
      'filter.strict': 'Modalità rigorosa: mostra solo i preset creati specificamente per questa stampante',

      'list.title': 'Preset',
      'list.loading': 'Caricamento\u2026',
      'list.count': '{n} preset per {m} materiali.',
      'list.failed': 'Caricamento non riuscito: {msg}',
      'table.material': 'Materiale',
      'table.brand': 'Marca della stampante',
      'table.printer': 'Stampante',
      'table.compatible': 'Stampanti compatibili',
      'table.modified': 'Ultima modifica',
      'table.action': 'Azione di download',

      'btn.download.selected': 'Scarica selezionati',
      'btn.download.selected.loading': 'Caricamento...',
      'btn.download.bundle': 'Scarica pacchetto (.bbsflmt)',
      'btn.download.bundle.loading': 'Caricamento...',

      'folder.presets': '{n} preset',
      'folder.expand': 'Fai clic per espandere',

      'alert.no.bambu': 'Nessun preset BambuStudio disponibile per il download. Assicurati di aver selezionato BambuStudio come slicer.',
      'alert.no.presets': 'Nessun preset disponibile',
      'alert.load.failed': 'Impossibile caricare i dati dei preset. Controlla la connessione e riprova.',
      'alert.error.loading': 'Errore durante il caricamento dei preset: {msg}',
      'alert.invalid.url': 'URL del preset non valido',
      'alert.error.preset': 'Errore durante il caricamento del preset: {msg}. Riprova.',
      'alert.error.download': 'Errore durante il download del preset: {msg}',

      'dup.title': '\u26a0\ufe0f Rilevati file duplicati',
      'dup.intro': 'Più preset generano lo stesso nome file. Seleziona il preset da mantenere per ogni duplicato:',
      'dup.for.printer': 'Per la stampante: {name}',
      'dup.use.profile': 'Usa il profilo {name}',
      'dup.compatible': 'Compatibile con: {list}',
      'dup.cancel': 'Annulla',
      'dup.confirm': 'Conferma esportazione',

      'modal.restart.title': '\u26a0\ufe0f Riavvio di BambuStudio necessario',
      'modal.restart.message': '<strong>Importante:</strong> dopo aver importato i preset in BambuStudio, <strong>devi riavviare lo slicer</strong> prima di eseguire lo slicing e la stampa. Se non lo riavvii, potrebbero essere applicate impostazioni errate.',
      'modal.restart.link': 'Visualizza GitHub Issue #10583 \u2192',
      'modal.restart.cancel': 'Annulla',
      'modal.restart.confirm': 'Continua il download',
      'modal.missingvariant.title': '⚠️ Alcune opzioni dell’ugello non hanno un preset',
      'modal.missingvariant.intro': 'Alcuni preset selezionati non includono tutte le opzioni di ugello/estrusore per questa stampante. Non abbiamo creato preset per queste varianti:',
      'modal.missingvariant.note': 'Puoi comunque scaricare — queste opzioni dell’ugello semplicemente non avranno valori ottimizzati.',
      'modal.missingvariant.ack': 'Continua il download',

      'modal.install.title': '\ud83d\udce6 Installazione manuale',
      'modal.bambu.title': 'Bambu Studio',
      'modal.bambu.method1.title': 'Metodo 1: metodo con pacchetto (consigliato)',
      'modal.bambu.method1.steps': [
        'Scarica il file del preset <strong>.bbsflmt</strong> (o il pacchetto ZIP) dalla <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">pagina di download</a>.',
        'Se è un file ZIP, decomprimilo per estrarre i file .bbsflmt.',
        'Apri Bambu Studio.',
        'Vai a <strong>File</strong> \u2192 <strong>Importa</strong> \u2192 <strong>Importa preset...</strong>.',
        'Seleziona i file <strong>.bbsflmt</strong>.',
        'Fai clic su un materiale nell’elenco dei consumabili del progetto, seleziona il preset personalizzato importato e il preset comparirà nell’elenco dei preset.'
      ],
      'modal.bambu.method1.note': '<strong>Nota:</strong> i pacchetti .bbsflmt sono disponibili solo per BambuStudio. Il pulsante per scaricare il pacchetto compare quando sono selezionati preset BambuStudio.',
      'modal.bambu.method2.title': 'Metodo 2: metodo con file singolo',
      'modal.bambu.method2.steps': [
        'Scarica il file JSON del preset (o lo ZIP con un singolo file) dalla <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">pagina di download</a>.',
        'Apri Bambu Studio.',
        'Vai a <strong>File</strong> \u2192 <strong>Importa</strong> \u2192 <strong>Importa preset...</strong>.',
        'Seleziona un file JSON o ZIP.',
        'Fai clic su un materiale nell’elenco dei consumabili del progetto, seleziona il preset personalizzato importato e il preset comparirà nell’elenco dei preset.'
      ],
      'modal.orca.title': 'OrcaSlicer / ElegooSlicer',
      'modal.orca.steps': [
        'Scarica il preset come <strong>JSON</strong> o <strong>ZIP con un singolo file</strong> dalla <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">pagina di download</a>.',
        'Apri OrcaSlicer o ElegooSlicer.',
        'Vai a <strong>File</strong> \u2192 <strong>Importa</strong>:<ul><li>Per un file <strong>JSON</strong>: scegli <strong>Importa configurazioni...</strong> (OrcaSlicer) o <strong>Importa preset...</strong> (ElegooSlicer), quindi seleziona il file JSON.</li><li>Per un file <strong>ZIP</strong>: scegli <strong>Importa archivio ZIP...</strong> (o l’opzione equivalente, ad es. "Importa archivio ZIP\u2026" in ElegooSlicer), quindi seleziona il file ZIP (non è necessario decomprimerlo).</li></ul>',
        'Il preset comparirà nell’elenco dei preset.'
      ],
      'modal.prusa.title': 'PrusaSlicer',
      'modal.prusa.steps': [
        'Scarica il preset come file <strong>INI</strong> dalla <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">pagina di download</a>.',
        'Apri PrusaSlicer.',
        'Vai a <strong>File</strong> \u2192 <strong>Importa</strong> \u2192 <strong>Importa configurazione...</strong>, quindi seleziona il file INI.',
        'Il preset del filamento comparirà nell’elenco dei preset.'
      ],

      'issues.title': 'Problemi noti',
      'issues.import.title': 'Mancata corrispondenza nell’importazione dei preset BambuStudio - Risolto',
      'issues.import.issue': '<strong>Problema:</strong> BambuStudio associa i preset dei filamenti alle stampanti verificando se il nome completo del preset della stampante (ad es. "Bambu Lab X1 Carbon 0.4 nozzle") compare nel campo <code>name</code> del preset. I file sorgente Polymaker usano l’abbreviazione <code>@BBL X1</code>, quindi il controllo della sottostringa non riesce e la temperatura / il tipo dello slot AMS non vengono compilati quando si assegna il filamento importato.',
      'issues.import.solution': '<strong>Soluzione:</strong> questo sito ora suddivide automaticamente i download BambuStudio in file per singola stampante e riscrive il campo <code>name</code> in modo che contenga il nome completo del preset della stampante. Scarica i preset usando i pulsanti <strong>JSON</strong> o <strong>.bbsflmt</strong> di questa pagina — non copiare i file JSON originali direttamente da GitHub.',
      'issues.import.link': 'Visualizza GitHub Issue #14 \u2192',
      'issues.p2s.title': 'Problema di surriscaldamento di P2S - Applicata una correzione temporanea',
      'issues.p2s.issue': '<strong>Problema:</strong> la stampante P2S potrebbe surriscaldarsi durante la stampa di materiali con temperatura di transizione vetrosa > 50\u00b0C a causa di problemi nel G-code di avvio.',
      'issues.p2s.solution': '<strong>Soluzione:</strong> abbiamo implementato una correzione temporanea aggiungendo comandi G-code di raffreddamento ai preset P2S con temperatura di transizione vetrosa > 50\u00b0C. Si tratta di una soluzione provvisoria in attesa che Bambu Lab risolva il problema.',
      'issues.p2s.link': 'Visualizza BambuStudio Issue #8801 \u2192',
      'issues.p2s.credits': 'Grazie ad alexbreinig e capsel22 per aver individuato questo problema.',
      'issues.restart.title': 'Riavvio di BambuStudio necessario dopo l’importazione',
      'issues.restart.issue': '<strong>Problema:</strong> BambuStudio potrebbe non applicare correttamente i preset dei filamenti appena importati finché l’applicazione non viene riavviata. Eseguire lo slicing o la stampa senza riavviare potrebbe utilizzare impostazioni errate di temperatura, portata o altri parametri del filamento.',
      'issues.restart.solution': '<strong>Soluzione:</strong> riavvia sempre BambuStudio dopo aver importato i preset Polymaker, prima di iniziare lo slicing o la stampa. Un avviso te lo ricorderà anche quando scarichi i preset BambuStudio da questa pagina.',
      'issues.restart.link': 'Visualizza BambuStudio Issue #10583 \u2192',
      'issues.aux.title': 'Preset mancanti per alcune opzioni di ugello / estrusore',
      'issues.aux.issue': '<strong>Problema:</strong> le stampanti Bambu Lab che offrono più opzioni di estrusore/ugello (come la X2D a più ugelli e la serie H2) memorizzano un gruppo di valori separato per ogni opzione — <code>Direct Drive Standard</code>, <code>Direct Drive High Flow</code>, <code>Bowden Standard</code> e <code>Bowden High Flow</code> — all’interno di un singolo preset del filamento. Per alcuni materiali abbiamo ottimizzato solo l’opzione principale (in genere <code>Direct Drive Standard</code>), quindi le altre opzioni dell’ugello, incluso l’ugello ausiliario (Bowden), restano vuote e non hanno valori ottimizzati.',

      'footer.links': 'Link',
      'footer.social': 'Account social',
      'footer.readme': 'Per maggiori informazioni, consulta il',
      'footer.readme.link': 'README',

      'lang.en': 'English',
      'lang.zh': '中文',
      'lang.de': 'Deutsch',
      'lang.it': 'Italiano',
      'lang.fr': 'Français',
      'lang.es': 'Español',

      'value.unknown': 'Sconosciuto',
      'value.unknown.filament': 'Filamento sconosciuto',
      'value.none': '-',

      'title.download.json': 'Scarica il file del preset',
      'title.download.bundle': 'Scarica come pacchetto BambuStudio',

      'filename.preset': 'preset.json',
      'filename.bundle': 'polymaker-bundle.bbsflmt'
    },

    fr: {
      'hero.logo.alt': 'Polymaker',
      'hero.title': 'Profils d\'impression',
      'hero.desc': 'Sélectionnez votre slicer pour consulter et télécharger les profils d’impression et les préréglages de filament Polymaker pour Bambu Studio, OrcaSlicer, ElegooSlicer et PrusaSlicer',
      'hero.howto': 'Comment les utiliser ?',
      'product.htPlaPro.title': 'Découvrez Polymaker™ HT-PLA Pro',
      'product.htPlaPro.tagline': 'Résistant à la chaleur. Résistant aux chocs. Toujours du PLA.',
      'product.htPlaPro.cta': 'En savoir plus',

      'filter.slicer.label': 'Sélectionnez votre slicer',
      'filter.slicer.placeholder': 'Sélectionner un slicer',
      'filter.series.label': 'Gamme',
      'filter.brand.label': 'Marque de l’imprimante',
      'filter.model.label': 'Modèle de l’imprimante',
      'filter.all': 'Tous',
      'filter.all.series': 'Toutes les gammes',
      'filter.all.brands': 'Toutes les marques',
      'filter.all.models': 'Tous les modèles',
      'filter.strict': 'Mode strict : afficher uniquement les préréglages conçus spécifiquement pour cette imprimante',

      'list.title': 'Préréglages',
      'list.loading': 'Chargement\u2026',
      'list.count': '{n} préréglages pour {m} matériaux.',
      'list.failed': 'Échec du chargement : {msg}',
      'table.material': 'Matériau',
      'table.brand': 'Marque de l’imprimante',
      'table.printer': 'Imprimante',
      'table.compatible': 'Imprimantes compatibles',
      'table.modified': 'Dernière modification',
      'table.action': 'Action de téléchargement',

      'btn.download.selected': 'Télécharger la sélection',
      'btn.download.selected.loading': 'Chargement...',
      'btn.download.bundle': 'Télécharger le lot (.bbsflmt)',
      'btn.download.bundle.loading': 'Chargement...',

      'folder.presets': '{n} préréglages',
      'folder.expand': 'Cliquer pour développer',

      'alert.no.bambu': 'Aucun préréglage BambuStudio n’est disponible au téléchargement. Vérifiez que BambuStudio est sélectionné comme logiciel de tranchage.',
      'alert.no.presets': 'Aucun préréglage fourni',
      'alert.load.failed': 'Échec du chargement des données de préréglage. Vérifiez votre connexion et réessayez.',
      'alert.error.loading': 'Erreur lors du chargement des préréglages : {msg}',
      'alert.invalid.url': 'URL du préréglage non valide',
      'alert.error.preset': 'Erreur lors du chargement du préréglage : {msg}. Veuillez réessayer.',
      'alert.error.download': 'Erreur lors du téléchargement du préréglage : {msg}',

      'dup.title': '⚠️ Fichiers doublons détectés',
      'dup.intro': 'Plusieurs préréglages génèrent le même nom de fichier. Sélectionnez le préréglage à conserver pour chaque doublon :',
      'dup.for.printer': 'Pour l’imprimante : {name}',
      'dup.use.profile': 'Utiliser le profil {name}',
      'dup.compatible': 'Compatible avec : {list}',
      'dup.cancel': 'Annuler',
      'dup.confirm': 'Confirmer l’exportation',

      'modal.restart.title': '⚠️ Redémarrage de BambuStudio requis',
      'modal.restart.message': '<strong>Important :</strong> après avoir importé les préréglages dans BambuStudio, vous <strong>devez redémarrer le logiciel</strong> avant de trancher et d’imprimer. Sans redémarrage, des paramètres incorrects risquent d’être appliqués.',
      'modal.restart.link': 'Voir le ticket GitHub #10583 →',
      'modal.restart.cancel': 'Annuler',
      'modal.restart.confirm': 'Continuer le téléchargement',
      'modal.missingvariant.title': '⚠️ Certaines options de buse n’ont pas de préréglage',
      'modal.missingvariant.intro': 'Certains préréglages sélectionnés ne comprennent pas toutes les options de buse ou d’extrudeur de cette imprimante. Nous n’avons pas créé de préréglages pour les variantes suivantes :',
      'modal.missingvariant.note': 'Vous pouvez tout de même les télécharger — ces options de buse n’auront simplement pas de valeurs optimisées.',
      'modal.missingvariant.ack': 'Continuer le téléchargement',

      'modal.install.title': '📦 Installation manuelle',
      'modal.bambu.title': 'Bambu Studio',
      'modal.bambu.method1.title': 'Méthode 1 : lot (recommandée)',
      'modal.bambu.method1.steps': [
        'Téléchargez le fichier de préréglage <strong>.bbsflmt</strong> (ou le lot ZIP) depuis la <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">page de téléchargement</a>.',
        'S’il s’agit d’un fichier ZIP, décompressez-le pour extraire le ou les fichiers .bbsflmt.',
        'Ouvrez Bambu Studio.',
        'Accédez à <strong>File</strong> → <strong>Import</strong> → <strong>Import Preset...</strong>.',
        'Sélectionnez le ou les fichiers <strong>.bbsflmt</strong>.',
        'Cliquez sur un matériau dans la liste des consommables du projet, sélectionnez le préréglage personnalisé importé : il apparaîtra dans la liste des préréglages.'
      ],
      'modal.bambu.method1.note': '<strong>Remarque :</strong> les lots .bbsflmt sont uniquement disponibles pour BambuStudio. Le bouton de téléchargement du lot apparaît lorsque des préréglages BambuStudio sont sélectionnés.',
      'modal.bambu.method2.title': 'Méthode 2 : fichier individuel',
      'modal.bambu.method2.steps': [
        'Téléchargez le fichier JSON du préréglage (ou le ZIP à fichier unique) depuis la <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">page de téléchargement</a>.',
        'Ouvrez Bambu Studio.',
        'Accédez à <strong>File</strong> → <strong>Import</strong> → <strong>Import Preset...</strong>.',
        'Sélectionnez un fichier JSON ou ZIP.',
        'Cliquez sur un matériau dans la liste des consommables du projet, sélectionnez le préréglage personnalisé importé : il apparaîtra dans la liste des préréglages.'
      ],
      'modal.orca.title': 'OrcaSlicer / ElegooSlicer',
      'modal.orca.steps': [
        'Téléchargez le préréglage au format <strong>JSON</strong> ou <strong>ZIP à fichier unique</strong> depuis la <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">page de téléchargement</a>.',
        'Ouvrez OrcaSlicer ou ElegooSlicer.',
        'Accédez à <strong>File</strong> → <strong>Import</strong> :<ul><li>Pour un fichier <strong>JSON</strong> : choisissez <strong>Import Configs...</strong> (OrcaSlicer) ou <strong>Import Preset...</strong> (ElegooSlicer), puis sélectionnez le fichier JSON.</li><li>Pour un fichier <strong>ZIP</strong> : choisissez <strong>Import Zip Archive...</strong> (ou l’équivalent, par exemple "Import Zip Archive\u2026" dans ElegooSlicer), puis sélectionnez le fichier ZIP (inutile de le décompresser).</li></ul>',
        'Le préréglage apparaîtra dans votre liste de préréglages.'
      ],
      'modal.prusa.title': 'PrusaSlicer',
      'modal.prusa.steps': [
        'Téléchargez le préréglage sous forme de fichier <strong>INI</strong> depuis la <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">page de téléchargement</a>.',
        'Ouvrez PrusaSlicer.',
        'Accédez à <strong>File</strong> → <strong>Import</strong> → <strong>Import Config...</strong>, puis sélectionnez le fichier INI.',
        'Le préréglage de filament apparaîtra dans votre liste de préréglages.'
      ],

      'issues.title': 'Problèmes connus',
      'issues.import.title': 'Incompatibilité lors de l’importation d’un préréglage BambuStudio — corrigée',
      'issues.import.issue': '<strong>Problème :</strong> BambuStudio associe les préréglages de filament aux imprimantes en vérifiant si le nom complet du préréglage d’imprimante (par exemple "Bambu Lab X1 Carbon 0.4 nozzle") figure dans le champ <code>name</code> du préréglage. Les fichiers sources Polymaker utilisent l’abréviation <code>@BBL X1</code> : la recherche de sous-chaîne échoue donc, et la température ainsi que le type de l’emplacement AMS ne sont pas renseignés lors de l’affectation du filament importé.',
      'issues.import.solution': '<strong>Solution :</strong> ce site répartit désormais automatiquement les téléchargements BambuStudio dans des fichiers propres à chaque imprimante et réécrit le champ <code>name</code> pour y inclure le nom complet du préréglage d’imprimante. Téléchargez les préréglages à l’aide des boutons <strong>JSON</strong> ou <strong>.bbsflmt</strong> de cette page — ne copiez pas directement les fichiers JSON bruts depuis GitHub.',
      'issues.import.link': 'Voir le ticket GitHub #14 →',
      'issues.p2s.title': 'Surchauffe de la P2S — correctif temporaire appliqué',
      'issues.p2s.issue': '<strong>Problème :</strong> l’imprimante P2S peut surchauffer lors de l’impression de matériaux dont la température de transition vitreuse est > 50°C en raison de problèmes dans le G-code de démarrage.',
      'issues.p2s.solution': '<strong>Solution :</strong> nous avons appliqué un correctif temporaire en ajoutant des commandes G-code de refroidissement aux préréglages P2S dont la température de transition vitreuse est > 50°C. Il s’agit d’une solution de contournement temporaire, dans l’attente d’un correctif de Bambu Lab.',
      'issues.p2s.link': 'Voir le ticket BambuStudio #8801 →',
      'issues.p2s.credits': 'Merci à alexbreinig et capsel22 d’avoir identifié ce problème.',
      'issues.restart.title': 'Redémarrage de BambuStudio requis après l’importation',
      'issues.restart.issue': '<strong>Problème :</strong> BambuStudio peut ne pas appliquer correctement les préréglages de filament nouvellement importés tant que l’application n’a pas été redémarrée. Trancher ou imprimer sans redémarrer peut entraîner l’utilisation d’une température, d’un débit ou d’autres paramètres de filament incorrects.',
      'issues.restart.solution': '<strong>Solution :</strong> redémarrez toujours BambuStudio après avoir importé des préréglages Polymaker, avant de commencer le tranchage ou l’impression. Une fenêtre d’avertissement vous le rappellera également lorsque vous téléchargerez des préréglages BambuStudio depuis cette page.',
      'issues.restart.link': 'Voir le ticket BambuStudio #10583 →',
      'issues.aux.title': 'Préréglages manquants pour certaines options de buse ou d’extrudeur',
      'issues.aux.issue': '<strong>Problème :</strong> les imprimantes Bambu Lab proposant plusieurs options d’extrudeur ou de buse (comme la X2D à plusieurs buses et la série H2) enregistrent un ensemble distinct de valeurs pour chaque option — <code>Direct Drive Standard</code>, <code>Direct Drive High Flow</code>, <code>Bowden Standard</code> et <code>Bowden High Flow</code> — au sein d’un même préréglage de filament. Pour certains matériaux, nous n’avons optimisé que l’option principale (généralement <code>Direct Drive Standard</code>) ; les autres options de buse, y compris la buse auxiliaire (Bowden), restent donc vides et ne disposent d’aucune valeur optimisée.',

      'footer.links': 'Liens',
      'footer.social': 'Réseaux sociaux',
      'footer.readme': 'Pour plus d’informations, consultez le',
      'footer.readme.link': 'README',

      'lang.en': 'English',
      'lang.zh': '中文',
      'lang.de': 'Deutsch',
      'lang.it': 'Italiano',
      'lang.fr': 'Français',
      'lang.es': 'Español',

      'value.unknown': 'Inconnu',
      'value.unknown.filament': 'Filament inconnu',
      'value.none': '-',

      'title.download.json': 'Télécharger le fichier de préréglage',
      'title.download.bundle': 'Télécharger sous forme de lot BambuStudio',

      'filename.preset': 'preset.json',
      'filename.bundle': 'polymaker-bundle.bbsflmt'
    },

    es: {
      // Hero
      'hero.logo.alt': 'Polymaker',
      'hero.title': 'Preajustes de filamento',
      'hero.desc': 'Seleccione su laminador para ver y descargar perfiles de impresión y preajustes de filamento de Polymaker para Bambu Studio, OrcaSlicer, ElegooSlicer y PrusaSlicer',
      'hero.howto': '¿Cómo se usa?',
      'product.htPlaPro.title': 'Presentamos Polymaker™ HT-PLA Pro',
      'product.htPlaPro.tagline': 'Listo para el calor. Listo para los impactos. Y sigue siendo PLA.',
      'product.htPlaPro.cta': 'Más información',

      // Filters
      'filter.slicer.label': 'Seleccione su laminador',
      'filter.slicer.placeholder': 'Seleccionar laminador',
      'filter.series.label': 'Serie',
      'filter.brand.label': 'Marca de la impresora',
      'filter.model.label': 'Modelo de la impresora',
      'filter.all': 'Todos',
      'filter.all.series': 'Todas las series',
      'filter.all.brands': 'Todas las marcas',
      'filter.all.models': 'Todos los modelos',
      'filter.strict': 'Modo estricto: mostrar solo los preajustes creados específicamente para esta impresora',

      // List / table
      'list.title': 'Preajustes',
      'list.loading': 'Cargando\u2026',
      'list.count': '{n} preajustes en {m} materiales.',
      'list.failed': 'Error al cargar: {msg}',
      'table.material': 'Material',
      'table.brand': 'Marca de la impresora',
      'table.printer': 'Impresora',
      'table.compatible': 'Impresoras compatibles',
      'table.modified': 'Última modificación',
      'table.action': 'Acción de descarga',

      // Buttons
      'btn.download.selected': 'Descargar seleccionados',
      'btn.download.selected.loading': 'Cargando...',
      'btn.download.bundle': 'Descargar paquete (.bbsflmt)',
      'btn.download.bundle.loading': 'Cargando...',

      // Folder row
      'folder.presets': '{n} preajustes',
      'folder.expand': 'Hacer clic para expandir',

      // Alerts / errors
      'alert.no.bambu': 'No hay preajustes de BambuStudio disponibles para descargar. Asegúrese de que BambuStudio esté seleccionado como laminador.',
      'alert.no.presets': 'No se proporcionaron preajustes',
      'alert.load.failed': 'No se pudieron cargar los datos de los preajustes. Compruebe su conexión y vuelva a intentarlo.',
      'alert.error.loading': 'Error al cargar los preajustes: {msg}',
      'alert.invalid.url': 'URL de preajuste no válida',
      'alert.error.preset': 'Error al cargar el preajuste: {msg}. Vuelva a intentarlo.',
      'alert.error.download': 'Error al descargar el preajuste: {msg}',

      // Duplicate modal
      'dup.title': '\u26a0\ufe0f Se detectaron archivos duplicados',
      'dup.intro': 'Varios preajustes generan el mismo nombre de archivo. Seleccione qué preajuste desea conservar para cada duplicado:',
      'dup.for.printer': 'Para la impresora: {name}',
      'dup.use.profile': 'Usar el perfil {name}',
      'dup.compatible': 'Compatible con: {list}',
      'dup.cancel': 'Cancelar',
      'dup.confirm': 'Confirmar exportación',

      // BambuStudio Restart Warning Modal
      'modal.restart.title': '\u26a0\ufe0f Es necesario reiniciar BambuStudio',
      'modal.restart.message': '<strong>Importante:</strong> Después de importar los preajustes en BambuStudio, <strong>debe reiniciar el laminador</strong> antes de laminar e imprimir. Si no lo reinicia, podrían aplicarse ajustes incorrectos.',
      'modal.restart.link': 'Ver la incidencia #10583 de GitHub \u2192',
      'modal.restart.cancel': 'Cancelar',
      'modal.restart.confirm': 'Continuar con la descarga',
      'modal.missingvariant.title': '⚠️ Algunas opciones de boquilla no tienen preajuste',
      'modal.missingvariant.intro': 'Algunos preajustes seleccionados no incluyen todas las opciones de boquilla/extrusor para esta impresora. No creamos preajustes para estas variantes:',
      'modal.missingvariant.note': 'Aun así, puede descargar los preajustes — esas opciones de boquilla simplemente no tendrán valores calibrados.',
      'modal.missingvariant.ack': 'Continuar con la descarga',

      // Install modal
      'modal.install.title': '\ud83d\udce6 Instalación del manual',
      'modal.bambu.title': 'Bambu Studio',
      'modal.bambu.method1.title': 'Método 1: método de paquete (recomendado)',
      'modal.bambu.method1.steps': [
        'Descargue el archivo de preajuste <strong>.bbsflmt</strong> (o el paquete ZIP) desde la <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">página de descargas</a>.',
        'Si es un archivo ZIP, descomprímalo para extraer los archivos .bbsflmt.',
        'Abra Bambu Studio.',
        'Vaya a <strong>Archivo</strong> \u2192 <strong>Importar</strong> \u2192 <strong>Importar preajuste...</strong>.',
        'Seleccione los archivos <strong>.bbsflmt</strong>.',
        'Haga clic en un material de la lista de consumibles del proyecto, seleccione el preajuste personalizado importado y este aparecerá en la lista de preajustes.'
      ],
      'modal.bambu.method1.note': '<strong>Nota:</strong> Los paquetes .bbsflmt solo están disponibles para BambuStudio. El botón de descarga de paquetes aparece cuando se seleccionan preajustes de BambuStudio.',
      'modal.bambu.method2.title': 'Método 2: método de archivo individual',
      'modal.bambu.method2.steps': [
        'Descargue el archivo JSON del preajuste (o el ZIP de un solo archivo) desde la <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">página de descargas</a>.',
        'Abra Bambu Studio.',
        'Vaya a <strong>Archivo</strong> \u2192 <strong>Importar</strong> \u2192 <strong>Importar preajuste...</strong>.',
        'Seleccione un archivo JSON o ZIP.',
        'Haga clic en un material de la lista de consumibles del proyecto, seleccione el preajuste personalizado importado y éste aparecerá en la lista de preajustes.'
      ],
      'modal.orca.title': 'OrcaSlicer / ElegooSlicer',
      'modal.orca.steps': [
        'Descargue el preajuste como archivo <strong>JSON</strong> o <strong>ZIP de un solo archivo</strong> desde la <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">página de descargas</a>.',
        'Abra OrcaSlicer o ElegooSlicer.',
        'Vaya a <strong>Archivo</strong> \u2192 <strong>Importar</strong>:<ul><li>Para un archivo <strong>JSON</strong>: elija <strong>Importar configuraciones...</strong> (OrcaSlicer) o <strong>Importar preajuste...</strong> (ElegooSlicer) y, a continuación, seleccione el archivo JSON.</li><li>Para un archivo <strong>ZIP</strong>: elija <strong>Importar archivo ZIP...</strong> (o la opción equivalente, p. ej., "Importar archivo ZIP\u2026" en ElegooSlicer) y, a continuación, seleccione el archivo ZIP (no es necesario descomprimirlo).</li></ul>',
        'El preajuste aparecerá en su lista de preajustes.'
      ],
      'modal.prusa.title': 'PrusaSlicer',
      'modal.prusa.steps': [
        'Descargue el preajuste como archivo <strong>INI</strong> desde la <a href="https://presets.polymaker.com" target="_blank" rel="noopener noreferrer">página de descargas</a>.',
        'Abra PrusaSlicer.',
        'Vaya a <strong>Archivo</strong> \u2192 <strong>Importar</strong> \u2192 <strong>Importar configuración...</strong> y, a continuación, seleccione el archivo INI.',
        'El preajuste de filamento aparecerá en su lista de preajustes.'
      ],

      // Known Issues
      'issues.title': 'Incidencia conocida',
      'issues.import.title': 'Discrepancia al importar preajustes de BambuStudio - Corregida',
      'issues.import.issue': '<strong>Problema:</strong> BambuStudio asocia los preajustes de filamento con las impresoras comprobando si el nombre completo del preajuste de impresora (p. ej., "Bambu Lab X1 Carbon 0.4 nozzle") aparece en el campo <code>name</code> del preajuste. Los archivos fuente de Polymaker usan la abreviatura <code>@BBL X1</code>, por lo que la comprobación de la subcadena falla y la temperatura/el tipo de la ranura AMS no se rellenan al asignar el filamento importado.',
      'issues.import.solution': '<strong>Solución:</strong> Este sitio web ahora divide automáticamente las descargas de BambuStudio en archivos por impresora y reescribe el campo <code>name</code> para que contenga el nombre completo del preajuste de impresora. Descargue los preajustes mediante los botones <strong>JSON</strong> o <strong>.bbsflmt</strong> de esta página \u2014 no copie directamente los archivos JSON sin procesar desde GitHub.',
      'issues.import.link': 'Ver la Incidencia #14 de GitHub \u2192',
      'issues.p2s.title': 'Problema de sobrecalentamiento de P2S - Corrección temporal aplicada',
      'issues.p2s.issue': '<strong>Problema:</strong> La impresora P2S puede sobrecalentarse al imprimir materiales con una temperatura de transición vítrea > 50\u00b0C debido a problemas en el G-code inicial.',
      'issues.p2s.solution': '<strong>Solución:</strong> Implementamos una corrección temporal añadiendo comandos de refrigeración de G-code a los preajustes de P2S con una temperatura de transición vítrea > 50\u00b0C. Esta es una solución provisional hasta que Bambu Lab corrija el problema.',
      'issues.p2s.link': 'Ver la Incidencia #8801 de BambuStudio \u2192',
      'issues.p2s.credits': 'Gracias a alexbreinig y capsel22 por identificar esta incidencia.',
      'issues.restart.title': 'Es necesario reiniciar BambuStudio después de importar',
      'issues.restart.issue': '<strong>Problema:</strong> Es posible que BambuStudio no aplique correctamente los preajustes de filamento recién importados hasta que se reinicie la aplicación. Laminar o imprimir sin reiniciarla puede hacer que se usen valores incorrectos de temperatura, flujo u otros ajustes del filamento.',
      'issues.restart.solution': '<strong>Solución:</strong> Reinicie siempre BambuStudio después de importar los preajustes de Polymaker y antes de comenzar a laminar o imprimir. Una ventana emergente también se lo recordará cuando descargue preajustes de BambuStudio desde esta página.',
      'issues.restart.link': 'Ver la Incidencia #10583 de BambuStudio \u2192',
      'issues.aux.title': 'Faltan preajustes para algunas opciones de boquilla/extrusor',
      'issues.aux.issue': '<strong>Problema:</strong> Las impresoras Bambu Lab que ofrecen más de una opción de extrusor/boquilla (como la X2D de varias boquillas y la serie H2) almacenan un conjunto de valores independiente para cada opción \u2014 <code>Direct Drive Standard</code>, <code>Direct Drive High Flow</code>, <code>Bowden Standard</code> y <code>Bowden High Flow</code> \u2014 dentro de un único preajuste de filamento. Para algunos materiales, solo calibramos la opción principal (normalmente <code>Direct Drive Standard</code>), por lo que las demás opciones de boquilla, incluida la boquilla auxiliar (Bowden), quedan vacías y no tienen valores calibrados.',

      // Footer
      'footer.links': 'Enlaces',
      'footer.social': 'Redes sociales',
      'footer.readme': 'Para obtener más información, consulte ',
      'footer.readme.link': 'README',

      // Language switcher
      'lang.en': 'English',
      'lang.zh': '中文',
      'lang.de': 'Deutsch',
      'lang.it': 'Italiano',
      'lang.fr': 'Français',
      'lang.es': 'Español',

      // Missing value fallbacks
      'value.unknown': 'Desconocido',
      'value.unknown.filament': 'Filamento desconocido',
      'value.none': '-',

      // Download button titles
      'title.download.json': 'Descargar archivo de preajuste',
      'title.download.bundle': 'Descargar como paquete de BambuStudio',

      // Filename defaults
      'filename.preset': 'preset.json',
      'filename.bundle': 'polymaker-bundle.bbsflmt'
    }
  };

  var currentLang = 'en';

  function detectLang() {
    var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase().split(/[-_]/)[0];
    return TRANSLATIONS[lang] ? lang : 'en';
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

    // Update data-i18n-html elements (allow HTML content from trusted translation sources)
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
      activeLangLabel.textContent = lang === 'zh' ? '中文' : lang.toUpperCase();
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

    var logoEl = document.getElementById('hero-logo');
    if (logoEl) {
      logoEl.src = LOGO_SRC[lang] || LOGO_SRC.en;
      logoEl.alt = t('hero.logo.alt');
    }

    if (document.documentElement) {
      document.documentElement.setAttribute('lang', lang);
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
