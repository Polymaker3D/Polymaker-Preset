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

    var logoEl = document.getElementById('hero-logo');
    if (logoEl) {
      logoEl.src = LOGO_SRC[lang] || LOGO_SRC.en;
      logoEl.alt = t('hero.logo.alt');
    }

    if (document.documentElement) {
      document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh' : 'en');
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
