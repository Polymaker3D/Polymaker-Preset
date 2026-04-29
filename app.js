// Same repo: index.json and preset files are served from the same origin as the page
var INDEX_JSON_URL = './index.json';
var X2D_PROGRESS_JSON_URL = './x2d-progress.json';
// Use relative URL so fetch is same-origin (no CORS). Works on GitHub Pages and local.
var RAW_BASE = '';
var THEME_STORAGE_KEY = 'polymaker-preset-theme';

// Defensive fallback for t() function if i18n.js fails to load
var t = (typeof window !== 'undefined' && window.t) ? window.t : function(key) { return key; };

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function applyTheme(theme) {
  var body = document.body;
  if (theme === 'wiki') {
    body.classList.add('theme-wiki');
  } else {
    body.classList.remove('theme-wiki');
    theme = 'dark';
  }
  var btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.setAttribute('data-theme', theme);
  }
}

function formatDisplayDate(dateString) {
  if (!dateString) return '';

  var parts = String(dateString).split('-');
  var year = parts[0];
  var month = parseInt(parts[1], 10);
  var day = parseInt(parts[2], 10);
  var monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (!year || isNaN(month) || isNaN(day) || month < 1 || month > 12) {
    return dateString;
  }

  return monthNames[month - 1] + ' ' + day + ', ' + year;
}

function parseLocalDate(dateString) {
  if (!dateString) return null;

  var parts = String(dateString).split('-');
  var year = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);
  var day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getTimelineLabel(dateString) {
  var targetDate = parseLocalDate(dateString);
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var daysLeft;

  if (!targetDate) {
    return 'Date not set';
  }

  daysLeft = Math.round((targetDate.getTime() - today.getTime()) / 86400000);

  if (daysLeft > 1) {
    return daysLeft + ' days left';
  }
  if (daysLeft === 1) {
    return '1 day left';
  }
  if (daysLeft === 0) {
    return 'Due today';
  }
  if (daysLeft === -1) {
    return '1 day overdue';
  }
  return Math.abs(daysLeft) + ' days overdue';
}

function buildX2DChecklist(items) {
  var html = '';
  var i;
  var item;
  var itemClass;
  var statusText;

  for (i = 0; i < items.length; i++) {
    item = items[i] || {};
    itemClass = item.completed ? ' is-complete' : ' is-pending';
    statusText = item.completed ? 'Done' : 'Pending';

    html += '<li class="adaptation-item' + itemClass + '">';
    html += '<span class="adaptation-item-name">' + escapeHtml(item.productName || 'Unknown product') + '</span>';
    html += '<span class="adaptation-item-status">' + statusText + '</span>';
    html += '</li>';
  }

  return html;
}

function renderX2DProgress(progressData) {
  var titleEl = document.getElementById('x2d-progress-title');
  var metaEl = document.getElementById('x2d-progress-meta');
  var percentEl = document.getElementById('x2d-progress-percentage');
  var barEl = document.getElementById('x2d-progress-bar');
  var fillEl = document.getElementById('x2d-progress-fill');
  var scopeEl = document.getElementById('x2d-progress-scope');
  var completeEl = document.getElementById('x2d-progress-complete');
  var remainingEl = document.getElementById('x2d-progress-remaining');
  var deadlineEl = document.getElementById('x2d-progress-deadline');
  var timelineEl = document.getElementById('x2d-progress-timeline');
  var listEl = document.getElementById('x2d-progress-list');
  var items = progressData && progressData.items ? progressData.items : [];
  var completedCount = 0;
  var totalCount = items.length;
  var remainingCount;
  var percent;
  var title;
  var goal;
  var formattedDeadline;
  var timelineLabel;
  var i;

  if (!titleEl || !metaEl || !percentEl || !barEl || !fillEl || !scopeEl || !completeEl || !remainingEl || !deadlineEl || !timelineEl || !listEl) {
    return;
  }

  for (i = 0; i < totalCount; i++) {
    if (items[i] && items[i].completed === true) {
      completedCount += 1;
    }
  }

  remainingCount = Math.max(totalCount - completedCount, 0);
  percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  title = progressData && progressData.title ? progressData.title : 'Bambu X2D Preset Adaptation Progress';
  goal = progressData && progressData.goal ? progressData.goal : 'We are planning to finish X2D presets for all active products';
  formattedDeadline = formatDisplayDate(progressData && progressData.targetDate);
  timelineLabel = getTimelineLabel(progressData && progressData.targetDate);

  titleEl.textContent = title;
  metaEl.textContent = goal + (formattedDeadline ? ' before ' + formattedDeadline + '.' : '.');
  percentEl.textContent = percent + '%';
  fillEl.style.width = percent + '%';
  barEl.setAttribute('aria-valuenow', String(percent));
  scopeEl.textContent = 'View product checklist (' + totalCount + ')';
  completeEl.textContent = completedCount + ' / ' + totalCount;
  remainingEl.textContent = String(remainingCount);
  deadlineEl.textContent = formattedDeadline ? formattedDeadline : 'Date not set';
  timelineEl.textContent = timelineLabel;
  listEl.innerHTML = buildX2DChecklist(items);
}

function renderX2DProgressError(message) {
  var metaEl = document.getElementById('x2d-progress-meta');
  var percentEl = document.getElementById('x2d-progress-percentage');
  var barEl = document.getElementById('x2d-progress-bar');
  var fillEl = document.getElementById('x2d-progress-fill');
  var scopeEl = document.getElementById('x2d-progress-scope');
  var completeEl = document.getElementById('x2d-progress-complete');
  var remainingEl = document.getElementById('x2d-progress-remaining');
  var deadlineEl = document.getElementById('x2d-progress-deadline');
  var timelineEl = document.getElementById('x2d-progress-timeline');
  var listEl = document.getElementById('x2d-progress-list');

  if (metaEl) metaEl.textContent = message;
  if (percentEl) percentEl.textContent = '0%';
  if (fillEl) fillEl.style.width = '0%';
  if (barEl) barEl.setAttribute('aria-valuenow', '0');
  if (scopeEl) scopeEl.textContent = 'View product checklist (0)';
  if (completeEl) completeEl.textContent = '0 / 0';
  if (remainingEl) remainingEl.textContent = '0';
  if (deadlineEl) deadlineEl.textContent = 'Date not set';
  if (timelineEl) timelineEl.textContent = 'Unavailable';
  if (listEl) listEl.innerHTML = '';
}

function initX2DProgress() {
  fetch(X2D_PROGRESS_JSON_URL)
    .then(function (r) {
      if (!r.ok) {
        throw new Error('Network response was not ok: ' + r.statusText);
      }
      return r.json();
    })
    .then(function (data) {
      renderX2DProgress(data);
    })
    .catch(function (err) {
      console.warn('Failed to load X2D progress:', err);
      renderX2DProgressError('Unable to load adaptation progress right now.');
    });
}

function initTheme() {
  var initial = 'dark';
  try {
    // Check if window and localStorage are available (SSR/strict environments)
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      // safe to proceed
    } else {
      return; // fallback to default
    }
    var params = new URLSearchParams(window.location.search || '');
    var fromUrl = params.get('theme');
    if (fromUrl === 'wiki' || fromUrl === 'dark') {
      initial = fromUrl;
    } else {
      var stored = null;
      try {
        stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      } catch (e) {
        console.warn('LocalStorage access denied:', e);
      }
      if (stored === 'wiki' || stored === 'dark') {
        initial = stored;
      }
    }
  } catch (e) {
    // ignore URL/localStorage errors, fallback to default
  }

  applyTheme(initial);

  var btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', function () {
      var next = document.body.classList.contains('theme-wiki') ? 'dark' : 'wiki';
      applyTheme(next);
      try {
        if (window.localStorage) {
          try {
            window.localStorage.setItem(THEME_STORAGE_KEY, next);
          } catch (e) {
            console.warn('LocalStorage setItem failed:', e);
          }
        }
      } catch (e) {
        // ignore
      }
    });
  }
}

function init() {
  var tbody = document.getElementById('tbody');
  var status = document.getElementById('status');
  var slicerCard = document.getElementById('slicer-card');
  var filtersCard = document.getElementById('filters-card');
  var listCard = document.getElementById('list-card');
  var selectAllCheckbox = document.getElementById('select-all-checkbox');
  var downloadSelectedBtn = document.getElementById('download-selected-btn');
  var downloadBundleBtn = document.getElementById('download-bundle-btn');
  var selectedCountSpan = document.getElementById('selected-count');
  var filterState = {
    series: '',
    material: '',
    brand: '',
    model: '',
    slicer: '',
    strict: false
  };

  // Track selected presets
  var selectedPresets = {};

  // Material series for filtering: Panchroma / Polymaker (includes PolyTerra/PolyLite) / Fiberon
  var MATERIAL_SERIES = ['Panchroma', 'Polymaker', 'Fiberon'];

  var VIRTUAL_SLICERS = {
    'OrcaSlicer (Snapmaker)': { actualSlicer: 'OrcaSlicer', forcedBrand: 'Snapmaker' }
  };

  function isVirtualSlicer(slicer) {
    return !!(slicer && VIRTUAL_SLICERS.hasOwnProperty(slicer));
  }

  function getActualSlicer(slicer) {
    return isVirtualSlicer(slicer) ? VIRTUAL_SLICERS[slicer].actualSlicer : slicer;
  }

  function getForcedBrand(slicer) {
    return isVirtualSlicer(slicer) ? VIRTUAL_SLICERS[slicer].forcedBrand : null;
  }

  function getEffectiveFilters(exceptFilter) {
    var effectiveSlicer = filterState.slicer;
    var effectiveBrand = filterState.brand;
    if (filterState.slicer && isVirtualSlicer(filterState.slicer)) {
      if (exceptFilter !== 'slicer') {
        effectiveSlicer = getActualSlicer(filterState.slicer);
      }
      if (exceptFilter !== 'brand') {
        effectiveBrand = getForcedBrand(filterState.slicer);
      }
    }
    return { effectiveSlicer: effectiveSlicer, effectiveBrand: effectiveBrand };
  }

  initTheme();
  initX2DProgress();

  // ============================================
  // .bbsflmt Bundle Helper Functions
  // ============================================

  /**
   * Generate bundle_structure.json content
   * @param {Array} presets - Array of preset objects
   * @param {string} type - 'single' or 'batch'
   * @returns {Object} Bundle structure object
   */
  function generateBundleStructure(presets, type) {
    if (!presets || presets.length === 0) {
      throw new Error(t('alert.no.presets'));
    }

    // Use numeric timestamp format like BambuStudio (seconds since epoch)
    var timestamp = Math.floor(Date.now() / 1000).toString();
    var isBatch = type === 'batch' || presets.length > 1;

    // Group presets by vendor
    var vendorMap = {};

    presets.forEach(function(preset) {
      var vendor = extractVendorFromPreset(preset);

      if (!vendorMap[vendor]) {
        vendorMap[vendor] = {
          // IMPORTANT: filament_path comes FIRST, vendor SECOND
          filament_path: [],
          vendor: vendor
        };
      }

      // Path format: {vendor}/{filename}
      vendorMap[vendor].filament_path.push(vendor + '/' + preset.filename);
    });

    // Determine filament_name
    var filamentName;
    if (isBatch) {
      filamentName = 'Multiple Filaments';
    } else {
      filamentName = presets[0].material || t('value.unknown.filament');
    }

    // Generate bundle_id in BambuStudio format: {user_id}_{filament_name}_{timestamp}
    // Using "0" as user_id since we're generating publicly
    var bundleId = '0_' + filamentName + '_' + timestamp;

    // Build structure with CORRECT FIELD ORDER (bundle_id first, version LAST)
    var structure = {};
    structure.bundle_id = bundleId;
    structure.bundle_type = 'filament config bundle';
    structure.filament_name = filamentName;
    structure.filament_vendor = Object.keys(vendorMap).map(function(k) { return vendorMap[k]; });
    structure.version = '02.05.00.56';  // BambuStudio version format, LAST field

    return structure;
  }

  /**
   * Generate filename for bundle download
   * @param {Array} presets - Array of preset objects
   * @returns {string} Bundle filename
   */
  function generateBundleFilename(presets) {
    if (!presets || presets.length === 0) {
      return t('filename.bundle');
    }

    var timestamp = new Date().toISOString().slice(0, 10);

    if (presets.length === 1) {
      // Single preset: use material name
      var material = presets[0].material || 'bundle';
      var sanitized = material.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
      return sanitized + '-' + timestamp + '.bbsflmt';
    } else {
      // Multiple presets: use count
      return 'polymaker-bundle-' + presets.length + '-' + timestamp + '.bbsflmt';
    }
  }

  /**
   * Extract vendor name from preset
   * @param {Object} preset - Preset object
   * @returns {string} Vendor name
   */
  function extractVendorFromPreset(preset) {
    // Use filament_vendor field if available
    if (preset.filament_vendor && Array.isArray(preset.filament_vendor) && preset.filament_vendor.length > 0) {
      return preset.filament_vendor[0];
    }

    // Extract vendor from filename: "Name @Vendor Model.json"
    var filename = preset.filename || '';
    var match = filename.match(/@([^\s]+)/);

    if (match && match[1]) {
      return match[1];
    }

    // Fallback: try to extract from path
    var path = preset.path || '';
    var pathParts = path.split('/');

    // Path format: preset/<Material>/<Brand>/<Model>/<Slicer>/<Preset>.json
    if (pathParts.length >= 4) {
      return pathParts[2]; // Brand is at index 2
    }

    return t('value.unknown');
  }

  /**
   * Generate filenames from compatible_printers field
   * @param {Object} preset - Preset object with material and presetData
   * @param {Object} presetData - The parsed JSON content of the preset
   * @returns {Array} Array of filename mappings
   */
  function generateFilenamesFromPrinters(preset, presetData) {
    var mappings = [];
    var material = preset.material || t('value.unknown');
    var compatiblePrinters = presetData && presetData.compatible_printers;

    if (!compatiblePrinters || !Array.isArray(compatiblePrinters) || compatiblePrinters.length === 0) {
      // Fallback: use original filename if no compatible_printers
      mappings.push({
        originalPreset: preset,
        presetData: presetData,
        printerName: null,
        generatedFilename: preset.filename
      });
      return mappings;
    }

    compatiblePrinters.forEach(function(printerName) {
      var filename = material + ' @' + printerName + '.json';
      mappings.push({
        originalPreset: preset,
        presetData: presetData,
        printerName: printerName,
        generatedFilename: filename
      });
    });

    return mappings;
  }

  /**
   * Find duplicate filenames across all mappings
   * Groups conflicts by material -> target printer -> source preset options
   * @param {Array} filenameMappings - Array of filename mappings from generateFilenamesFromPrinters
   * @returns {Array} Array of duplicate groups organized by material with target printer conflicts
   */
  function findDuplicateFilenames(filenameMappings) {
    if (!filenameMappings || !Array.isArray(filenameMappings) || filenameMappings.length === 0) {
      return [];
    }

    // Group by material first
    var materialGroups = {};

    filenameMappings.forEach(function(mapping) {
      var material = mapping.originalPreset.material || t('value.unknown');
      var targetPrinter = mapping.printerName;

      if (!materialGroups[material]) {
        materialGroups[material] = {};
      }

      // Group by target printer within material
      if (!materialGroups[material][targetPrinter]) {
        materialGroups[material][targetPrinter] = [];
      }

      materialGroups[material][targetPrinter].push(mapping);
    });

    // Build conflicts list: only include groups with multiple source options
    var conflicts = [];

    for (var material in materialGroups) {
      if (!materialGroups.hasOwnProperty(material)) continue;

      var targetPrinters = materialGroups[material];
      var targetPrinterConflicts = [];

      for (var targetPrinter in targetPrinters) {
        if (!targetPrinters.hasOwnProperty(targetPrinter)) continue;

        var options = targetPrinters[targetPrinter];
        // Only include if multiple source presets generate this filename
        if (options.length > 1) {
          targetPrinterConflicts.push({
            targetPrinter: targetPrinter,
            generatedFilename: options[0].generatedFilename,
            options: options  // Different source presets for same target
          });
        }
      }

      // Only add material if it has conflicts
      if (targetPrinterConflicts.length > 0) {
        conflicts.push({
          material: material,
          targets: targetPrinterConflicts
        });
      }
    }

    return conflicts;
  }

  /**
   * Generate bundle_structure.json content with multiple filenames per preset
   * @param {Array} filenameMappings - Array of filename mappings
   * @param {string} type - 'single' or 'batch'
   * @param {string} materialName - Optional material name override
   * @returns {Object} Bundle structure object
   */
  function generateBundleStructureFromMappings(filenameMappings, type, materialName) {
    if (!filenameMappings || filenameMappings.length === 0) {
      throw new Error(t('alert.load.failed'));
    }

    // Use numeric timestamp format like BambuStudio (seconds since epoch)
    var timestamp = Math.floor(Date.now() / 1000).toString();
    var isBatch = type === 'batch';

    // Group by vendor
    var vendorMap = {};

    filenameMappings.forEach(function(mapping) {
      var vendor = extractVendorFromPreset(mapping.originalPreset);

      if (!vendorMap[vendor]) {
        vendorMap[vendor] = {
          // IMPORTANT: filament_path comes FIRST, vendor SECOND
          filament_path: [],
          vendor: vendor
        };
      }

      // Path format: {vendor}/{filename}
      vendorMap[vendor].filament_path.push(vendor + '/' + mapping.generatedFilename);
    });

    // Determine filament_name
    var filamentName;
    if (materialName) {
      filamentName = materialName;
    } else if (isBatch) {
      filamentName = 'Multiple Filaments';
    } else {
      filamentName = filenameMappings[0].originalPreset.material || t('value.unknown.filament');
    }

    // Generate bundle_id in BambuStudio format: {user_id}_{filament_name}_{timestamp}
    // Using "0" as user_id since we're generating publicly
    var bundleId = '0_' + filamentName + '_' + timestamp;

    // Build structure with CORRECT FIELD ORDER (bundle_id first, version LAST)
    var structure = {};
    structure.bundle_id = bundleId;
    structure.bundle_type = 'filament config bundle';
    structure.filament_name = filamentName;
    structure.filament_vendor = Object.keys(vendorMap).map(function(k) { return vendorMap[k]; });
    structure.version = '02.05.00.56';  // BambuStudio version format, LAST field

    return structure;
  }

  /**
   * Download preset(s) as .bbsflmt bundle with compatible_printers expansion
   * @param {Array} presets - Array of preset objects to bundle
   */
  function downloadAsBbsflmt(presets) {
    if (!presets || presets.length === 0) {
      console.warn('No presets to bundle');
      return;
    }

    resolveBambuMappingsWithDedup(presets, function(filteredMappings) {
      generateAndDownloadBbsflmt(filteredMappings, presets);
    }, function(err) {
      if (err) {
        console.error('Error fetching presets:', err);
        alert(t('alert.error.download', { msg: err.message }));
      } else {
        console.log('Export cancelled by user');
      }
    });
  }

  /**
   * Generate and download the BBSFLMT bundle
   * @param {Array} filenameMappings - Filtered filename mappings
   * @param {Array} originalPresets - Original preset objects for reference
   */
  function generateAndDownloadBbsflmt(filenameMappings, originalPresets) {
    console.log('generateAndDownloadBbsflmt called with', filenameMappings ? filenameMappings.length : 0, 'mappings');
    if (!filenameMappings || filenameMappings.length === 0) {
      console.warn('No filename mappings to bundle');
      return;
    }

    var zip = new JSZip();
    var materialName = originalPresets.length === 1 ? originalPresets[0].material : null;

    // Generate bundle structure from mappings
    var structure = generateBundleStructureFromMappings(filenameMappings, 'single', materialName);

    // Group files by vendor
    var vendorFolders = {};

    filenameMappings.forEach(function(mapping) {
      var vendor = extractVendorFromPreset(mapping.originalPreset);
      if (!vendorFolders[vendor]) {
        vendorFolders[vendor] = zip.folder(vendor);
      }

      var presetData = mapping.presetData;
      if (!presetData) {
        console.error('No preset data available for:', mapping.generatedFilename);
        return;
      }

      // Skip generateFilenamesFromPrinters' fallback (printerName === null when
      // compatible_printers is missing/empty). Without a full printer name we
      // cannot rewrite `name` to bypass BambuStudio's substring check (#14),
      // and emitting the raw filename would re-introduce the bug.
      if (!mapping.printerName) {
        console.warn('Skipping preset without compatible_printers:', mapping.generatedFilename);
        return;
      }

      var modifiedData = JSON.parse(JSON.stringify(presetData));
      var nameWithoutExtension = mapping.generatedFilename.replace(/\.json$/, '');
      modifiedData.name = nameWithoutExtension;

      var jsonContent = JSON.stringify(modifiedData, null, 4);
      var blob = new Blob([jsonContent], { type: 'application/json' });
      vendorFolders[vendor].file(mapping.generatedFilename, blob);
    });

    // Add bundle_structure.json
    zip.file('bundle_structure.json', JSON.stringify(structure, null, 2));

    // Generate and download
    zip.generateAsync({ type: 'blob' }).then(function(content) {
      var objectUrl = URL.createObjectURL(content);
      var a = document.createElement('a');
      a.href = objectUrl;
      a.download = generateBundleFilename(originalPresets);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    }).catch(function(err) {
      console.error('Error generating bundle:', err);
    });
  }

  // Expand one BambuStudio source preset into per-printer JSONs whose `name`
  // field matches the full printer preset name. Works around BambuStudio's
  // substring check in AMSMaterialsSetting::on_select_filament — see issue #14.
  // Returns [] when compatible_printers is missing/empty so callers refuse to
  // emit a file that would still trigger the bug.
  function expandBambuPresetForDownload(preset, presetData) {
    if (!presetData) return [];

    var mappings = generateFilenamesFromPrinters(preset, presetData);
    var rewritable = mappings.filter(function(m) { return m.printerName; });
    if (rewritable.length === 0) return [];

    return rewritable.map(function(mapping) {
      var modifiedData = JSON.parse(JSON.stringify(presetData));
      var nameWithoutExtension = mapping.generatedFilename.replace(/\.json$/, '');
      modifiedData.name = nameWithoutExtension;
      return {
        filename: mapping.generatedFilename,
        content: JSON.stringify(modifiedData, null, 4)
      };
    });
  }

  /**
   * Fetch BambuStudio preset data, generate per-printer filename mappings,
   * and resolve duplicate filenames through the user dialog.
   * @param {Array} presets - BambuStudio preset objects (may have presetData pre-attached)
   * @param {Function} onResolved - Callback(filteredMappings, presetDataMap)
   * @param {Function} onCancelled - Callback(err) when user cancels or error occurs
   */
  function resolveBambuMappingsWithDedup(presets, onResolved, onCancelled) {
    var presetDataMap = {};
    var fetchPromises = [];

    presets.forEach(function(preset) {
      if (preset.presetData) {
        presetDataMap[preset.path] = preset.presetData;
        return;
      }

      var url = preset.url || (preset.path ? (RAW_BASE + encodeURI(preset.path)) : '#');
      if (!url || url === '#') {
        console.warn('Invalid URL for preset:', preset.filename);
        presetDataMap[preset.path] = null;
        return;
      }

      var promise = fetch(url, { mode: 'cors' })
        .then(function(r) {
          if (!r.ok) {
            throw new Error('Failed to fetch ' + preset.filename + ': ' + r.statusText);
          }
          return r.json();
        })
        .then(function(data) {
          presetDataMap[preset.path] = data;
        })
        .catch(function(err) {
          console.warn('Error downloading preset:', preset.filename, err);
          presetDataMap[preset.path] = null;
        });

      fetchPromises.push(promise);
    });

    Promise.all(fetchPromises).then(function() {
      var allMappings = [];
      presets.forEach(function(preset) {
        var data = presetDataMap[preset.path];
        if (!data) return;
        var mappings = generateFilenamesFromPrinters(preset, data);
        allMappings = allMappings.concat(mappings);
      });

      if (allMappings.length === 0) {
        onResolved([], presetDataMap);
        return;
      }

      var duplicates = findDuplicateFilenames(allMappings);

      if (duplicates.length > 0) {
        showDuplicateResolutionDialog(duplicates, function(selectedOptions) {
          var filteredMappings = filterDuplicates(allMappings, selectedOptions, duplicates);
          onResolved(filteredMappings, presetDataMap);
        }, function() {
          onCancelled();
        });
      } else {
        onResolved(allMappings, presetDataMap);
      }
    }).catch(function(err) {
      console.error('Error fetching presets:', err);
      onCancelled(err);
    });
  }

  fetch(INDEX_JSON_URL)
    .then(function (r) {
      if (!r.ok) {
        throw new Error('Network response was not ok: ' + r.statusText);
      }
      return r.json();
    })
    .then(function (data) {
      var materials = data.materials || [];
      var brands = data.brands || [];
      var models = data.models || [];
      var slicers = data.slicers || [];
      var presets = data.presets || [];

      // Normalize slicer names: combine 'Orcaslicer' and 'OrcaSlicer' into 'OrcaSlicer'
      function normalizeSlicerName(slicer) {
        if (!slicer) return slicer;
        if (slicer.toLowerCase() === 'orcaslicer') return 'OrcaSlicer';
        if (slicer.toLowerCase() === 'prusaslicer') return 'PrusaSlicer';
        return slicer;
      }

      // Normalize slicers list
      var normalizedSlicers = [];
      var seenSlicers = {};
      slicers.forEach(function(s) {
        var normalized = normalizeSlicerName(s);
        if (!seenSlicers[normalized]) {
          seenSlicers[normalized] = true;
          normalizedSlicers.push(normalized);
        }
      });

      for (var virtualSlicer in VIRTUAL_SLICERS) {
        if (VIRTUAL_SLICERS.hasOwnProperty(virtualSlicer) && !seenSlicers[virtualSlicer]) {
          normalizedSlicers.push(virtualSlicer);
        }
      }

      slicers = normalizedSlicers.sort();

      // Normalize slicer names in presets
      presets.forEach(function(p) {
        p.slicer = normalizeSlicerName(p.slicer);
      });

      // Check if slicer is selected
      function isSlicerSelected() {
        return !!filterState.slicer;
      }

      // Show/hide cards based on slicer selection
      function updateVisibility() {
        if (isSlicerSelected()) {
          if (filtersCard) filtersCard.classList.remove('is-hidden');
          if (listCard) listCard.classList.remove('is-hidden');
        } else {
          if (filtersCard) filtersCard.classList.add('is-hidden');
          if (listCard) listCard.classList.add('is-hidden');
        }
      }

      // Show/hide list card based on slicer selection
      function updateListVisibility() {
        if (isSlicerSelected()) {
          if (listCard) listCard.classList.remove('is-hidden');
        } else {
          if (listCard) listCard.classList.add('is-hidden');
        }
      }

      function setupDropdown(name, list, isSlicer) {
        var dropdown = document.querySelector('.dropdown[data-filter="' + name + '"]');
        if (!dropdown) return;
        var toggle = dropdown.querySelector('.dropdown-toggle');
        var labelEl = dropdown.querySelector('.dropdown-label');
        var menu = dropdown.querySelector('.dropdown-menu');
        var defaultLabel = isSlicer ? t('filter.slicer.placeholder') : (name === 'series' ? t('filter.all.series') : name === 'brand' ? t('filter.all.brands') : t('filter.all.models'));

        function renderOptions(options) {
          var html = '';
          if (!isSlicer) {
            html += '<div class="dropdown-option' + (filterState[name] ? '' : ' is-active') + '" data-value="">' + t('filter.all') + '</div>';
          }
          html += options.map(function (x) {
            var active = x === filterState[name] ? ' is-active' : '';
            return '<div class="dropdown-option' + active + '" data-value="' + escapeHtml(x) + '">' + escapeHtml(x) + '</div>';
          }).join('');
          menu.innerHTML = html;
          if (labelEl) labelEl.textContent = filterState[name] || defaultLabel;
        }

        renderOptions(list || []);

        toggle.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = dropdown.classList.contains('is-open');
          closeAllDropdowns();
          if (!isOpen) {
            dropdown.classList.add('is-open');
          }
        });

        menu.addEventListener('click', function (e) {
          var option = e.target.closest('.dropdown-option');
          if (!option) return;
          var value = option.getAttribute('data-value') || '';
          var text = option.textContent || '';
          filterState[name] = value;

          var prevActive = menu.querySelector('.dropdown-option.is-active');
          if (prevActive) prevActive.classList.remove('is-active');
          option.classList.add('is-active');

          if (labelEl) labelEl.textContent = text || defaultLabel;
          dropdown.classList.remove('is-open');

          // Update visibility when slicer changes
          if (isSlicer) {
            updateVisibility();
            updateBrandDropdownState();
            selectedPresets = {};
            updateSelectedCount();
          }

          render();
        });
      }

      function closeAllDropdowns() {
        var open = document.querySelectorAll('.dropdown.is-open');
        for (var i = 0; i < open.length; i++) {
          open[i].classList.remove('is-open');
        }
      }

      document.addEventListener('click', function (e) {
        if (!e.target.closest('.dropdown')) {
          closeAllDropdowns();
        }
      });

      setupDropdown('slicer', slicers, true);

      // Update filter state slicer to normalized value if needed
      if (filterState.slicer) {
        filterState.slicer = normalizeSlicerName(filterState.slicer);
      }
      setupDropdown('series', MATERIAL_SERIES, false);
      setupDropdown('brand', brands, false);
      setupDropdown('model', models, false);

      // Material filter removed - filtering by series only

      // Initial visibility check
      updateVisibility();

      /** Check if material belongs to a series (handles Polymaker including PolyTerra/PolyLite) */
      function materialMatchesSeries(material, series) {
        if (!series) return true;
        if (!material) return false;
        // Polymaker series includes Polymaker, PolyTerra, and PolyLite materials
        if (series === 'Polymaker') {
          return material.indexOf('Polymaker ') === 0 ||
                 material.indexOf('PolyTerra ') === 0 ||
                 material.indexOf('PolyLite ') === 0;
        }
        return material.indexOf(series + ' ') === 0;
      }

      function getMatchingPresets(exceptFilter) {
        var filters = getEffectiveFilters(exceptFilter);
        var effectiveSlicer = filters.effectiveSlicer;
        var effectiveBrand = filters.effectiveBrand;

        return presets.filter(function (p) {
          if (exceptFilter !== 'series' && filterState.series && !materialMatchesSeries(p.material, filterState.series)) return false;
          if (exceptFilter !== 'brand' && effectiveBrand && p.brand !== effectiveBrand) return false;
          if (exceptFilter !== 'model' && filterState.model && p.model !== filterState.model) return false;
          if (exceptFilter !== 'slicer' && effectiveSlicer && p.slicer !== effectiveSlicer) return false;
          return true;
        });
      }
      // Note: material filter has been removed, only series filtering is used

      function updateDropdownOptions(name, list) {
        var current = filterState[name];
        var inList = list.indexOf(current) !== -1;
        if (current && !inList) filterState[name] = '';
        var display = inList ? current : '';
        var dropdown = document.querySelector('.dropdown[data-filter="' + name + '"]');
        if (!dropdown) return;
        var menu = dropdown.querySelector('.dropdown-menu');
        var labelEl = dropdown.querySelector('.dropdown-label');
        var html = [
          '<div class="dropdown-option' + (display ? '' : ' is-active') + '" data-value="">' + t('filter.all') + '</div>'
        ].concat(list.map(function (x) {
          var active = x === display ? ' is-active' : '';
          return '<div class="dropdown-option' + active + '" data-value="' + escapeHtml(x) + '">' + escapeHtml(x) + '</div>';
        }));
        menu.innerHTML = html.join('');
        if (labelEl) labelEl.textContent = display || t('filter.all');
      }

      /** Only show filter options that have at least one preset to avoid zero-result combinations.
       *  Note: Slicer dropdown is NOT updated here - it remains independent of other filters. */
      function updateAllFilterOptions() {
        var matchSeries = getMatchingPresets('series');
        var seriesList = MATERIAL_SERIES.filter(function (s) {
          return matchSeries.some(function (p) { return materialMatchesSeries(p.material, s); });
        });
        updateDropdownOptions('series', seriesList);

        var matchBrand = getMatchingPresets('brand');
        var brandList = [];
        var seenBrand = {};
        matchBrand.forEach(function (p) {
          var b = p.brand || '';
          if (!seenBrand[b]) { seenBrand[b] = true; brandList.push(b); }
        });
        brandList.sort();
        updateDropdownOptions('brand', brandList);

        var matchModel = getMatchingPresets('model');
        var modelList = [];
        var seenModel = {};
        matchModel.forEach(function (p) {
          var m = p.model || '';
          if (!seenModel[m]) { seenModel[m] = true; modelList.push(m); }
        });
        modelList.sort();
        updateDropdownOptions('model', modelList);

        // Slicer dropdown is NOT updated here - it should show all available slicers
        // regardless of other filter selections
      }

      function updateBrandDropdownState() {
        var brandDropdown = document.querySelector('.dropdown[data-filter="brand"]');
        if (!brandDropdown) return;

        var isVirtual = isVirtualSlicer(filterState.slicer);
        var toggle = brandDropdown.querySelector('.dropdown-toggle');
        var labelEl = brandDropdown.querySelector('.dropdown-label');

        if (isVirtual) {
          brandDropdown.classList.add('is-disabled');
          if (toggle) toggle.disabled = true;

          var forcedBrand = getForcedBrand(filterState.slicer);
          if (labelEl && forcedBrand) {
            labelEl.textContent = forcedBrand;
          }
        } else {
          brandDropdown.classList.remove('is-disabled');
          if (toggle) toggle.disabled = false;
          if (labelEl) labelEl.textContent = filterState.brand || 'All Brands';
        }
      }

      // Update the selected count display and button state
      function updateSelectedCount() {
        var count = Object.keys(selectedPresets).length;
        if (selectedCountSpan) selectedCountSpan.textContent = count;
        if (downloadSelectedBtn) downloadSelectedBtn.disabled = count === 0;
        updateBundleButtonState();
      }

      // Update bundle button state based on BambuStudio presets
      // Bundle download only available when:
      // 1. Slicer is BambuStudio
      // 2. At least one preset is selected
      // 3. No printer model filter is applied
      function updateBundleButtonState() {
        if (!downloadBundleBtn) return;

        var effectiveSlicer = getEffectiveFilters().effectiveSlicer;
        var isBambuStudio = effectiveSlicer === 'BambuStudio';
        var selectedCount = Object.keys(selectedPresets).length;

        downloadBundleBtn.classList.toggle('is-hidden', !isBambuStudio);

        if (!isBambuStudio) {
          downloadBundleBtn.disabled = true;
          return;
        }

        if (selectedCount === 0) {
          downloadBundleBtn.disabled = true;
          return;
        }

        if (filterState.model) {
          downloadBundleBtn.disabled = true;
          return;
        }

        // Enable button when slicer is BambuStudio, presets are selected, and no model filter is applied
        downloadBundleBtn.disabled = false;
      }

      // Generate checkbox HTML
      function getCheckboxHtml(presetId, isChecked) {
        var checkedAttr = isChecked ? ' checked' : '';
        return '<label class="checkbox-label preset-checkbox" data-preset-id="' + escapeHtml(presetId) + '">' +
          '<input type="checkbox" class="checkbox-input preset-checkbox-input"' + checkedAttr + '>' +
          '<span class="checkbox-custom"></span>' +
          '</label>';
      }

      // Download multiple presets as ZIP
      function downloadSelectedPresets() {
        var presetIds = Object.keys(selectedPresets);
        if (presetIds.length === 0) return;

        // Show loading state
        if (downloadSelectedBtn) {
          downloadSelectedBtn.disabled = true;
          var dlSelSpan = downloadSelectedBtn.querySelector('[data-i18n="btn.download.selected"]');
          if (dlSelSpan) dlSelSpan.textContent = t('btn.download.selected.loading');
        }

        var zip = new JSZip();
        var folder = zip.folder('polymaker-presets');
        var bambuPresets = [];
        var nonBambuPromises = [];

        // Separate BambuStudio and non-BambuStudio presets
        presetIds.forEach(function (presetId) {
          var preset = selectedPresets[presetId];
          // Validate URL before fetch
          if (!preset.url || preset.url === '#') {
            console.warn('Invalid URL for preset:', presetId);
            return;
          }
          if (preset.slicer === 'BambuStudio') {
            bambuPresets.push(preset);
          } else {
            var promise = fetch(preset.url, { mode: 'cors' })
              .then(function (r) {
                if (!r.ok) {
                  throw new Error('Failed to fetch ' + preset.filename + ': ' + r.statusText);
                }
                return r.blob();
              })
              .then(function (blob) {
                folder.file(preset.filename, blob);
              })
              .catch(function (err) {
                console.warn('Error downloading preset:', presetId, err);
                // Continue with other downloads, don't fail entire batch
              });
            nonBambuPromises.push(promise);
          }
        });

        function resetButton() {
          if (downloadSelectedBtn) {
            downloadSelectedBtn.disabled = false;
            var dlSelSpan = downloadSelectedBtn.querySelector('[data-i18n="btn.download.selected"]');
            if (dlSelSpan) dlSelSpan.textContent = t('btn.download.selected');
          }
        }

        function finishZip() {
          zip.generateAsync({ type: 'blob' }).then(function (content) {
            var objectUrl = URL.createObjectURL(content);
            var a = document.createElement('a');
            a.href = objectUrl;
            a.download = 'polymaker-presets-' + presetIds.length + '.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Delay revoking object URL to ensure download starts
            setTimeout(function () {
              URL.revokeObjectURL(objectUrl);
            }, 1000);

            // Reset button state
            resetButton();
          }).catch(function (err) {
            console.error('Error generating ZIP:', err);
            resetButton();
          });
        }

        function addBambuMappingsToZip(mappings) {
          mappings.forEach(function (mapping) {
            // Skip generateFilenamesFromPrinters' fallback (printerName === null when
            // compatible_printers is missing/empty). Without a full printer name we
            // cannot rewrite `name` to bypass BambuStudio's substring check (#14),
            // and emitting the raw filename would re-introduce the bug.
            if (!mapping.printerName) {
              console.warn('Skipping preset without compatible_printers:', mapping.generatedFilename);
              return;
            }
            var modifiedData = JSON.parse(JSON.stringify(mapping.presetData));
            var nameWithoutExtension = mapping.generatedFilename.replace(/\.json$/, '');
            modifiedData.name = nameWithoutExtension;
            folder.file(mapping.generatedFilename, JSON.stringify(modifiedData, null, 4));
          });
        }

        // If no Bambu presets, just finish with non-Bambu
        if (bambuPresets.length === 0) {
          Promise.all(nonBambuPromises).then(finishZip).catch(function (err) {
            console.error('Error generating ZIP:', err);
            resetButton();
          });
          return;
        }

        resolveBambuMappingsWithDedup(bambuPresets, function (filteredMappings) {
          addBambuMappingsToZip(filteredMappings);
          Promise.all(nonBambuPromises).then(finishZip).catch(function (err) {
            console.error('Error generating ZIP:', err);
            resetButton();
          });
        }, function (err) {
          if (err) console.error('Error fetching BambuStudio presets:', err);
          resetButton();
        });
      }

      function downloadSelectedBundle() {
        // Filter for BambuStudio presets only
        var bambuPresets = [];
        for (var key in selectedPresets) {
          var preset = selectedPresets[key];
          if (preset.slicer === 'BambuStudio') {
            bambuPresets.push(preset);
          }
        }

        // Debug logging to help diagnose issues
        console.log('downloadSelectedBundle called, bambuPresets count:', bambuPresets.length);
        if (bambuPresets.length === 0) {
          console.log('No BambuStudio presets found. filterState:', filterState);
          alert(t('alert.no.bambu'));
          return;
        }

        // Show loading state
        if (downloadBundleBtn) {
          downloadBundleBtn.disabled = true;
          var dlBndSpanLoad = downloadBundleBtn.querySelector('[data-i18n="btn.download.bundle"]');
          if (dlBndSpanLoad) dlBndSpanLoad.textContent = t('btn.download.bundle.loading');
        }

        function resetButton() {
          if (downloadBundleBtn) {
            downloadBundleBtn.disabled = false;
            var dlBndSpan = downloadBundleBtn.querySelector('[data-i18n="btn.download.bundle"]');
            if (dlBndSpan) dlBndSpan.textContent = t('btn.download.bundle');
          }
        }

        resolveBambuMappingsWithDedup(bambuPresets, function(filteredMappings) {
          if (filteredMappings.length === 0) {
            alert(t('alert.load.failed'));
            resetButton();
            return;
          }
          generateAndDownloadBundleBatch(filteredMappings, bambuPresets);
        }, function(err) {
          if (err) {
            console.error('Error fetching presets:', err);
            alert(t('alert.error.loading', { msg: err.message }));
          }
          resetButton();
        });
      }

      function generateAndDownloadBundleBatch(filenameMappings, originalPresets) {
        console.log('generateAndDownloadBundleBatch called with', filenameMappings ? filenameMappings.length : 0, 'mappings');
        if (!filenameMappings || filenameMappings.length === 0) {
          console.warn('No filename mappings to bundle');
          if (downloadBundleBtn) {
            downloadBundleBtn.disabled = false;
            var dlBndSpanRst = downloadBundleBtn.querySelector('[data-i18n="btn.download.bundle"]');
            if (dlBndSpanRst) dlBndSpanRst.textContent = t('btn.download.bundle');
          }
          return;
        }

        var mappingsByMaterial = {};
        filenameMappings.forEach(function(mapping) {
          var material = mapping.originalPreset.material || t('value.unknown');
          if (!mappingsByMaterial[material]) {
            mappingsByMaterial[material] = [];
          }
          mappingsByMaterial[material].push(mapping);
        });

        var outerZip = new JSZip();
        var materials = Object.keys(mappingsByMaterial);
        var materialPromises = [];

        materials.forEach(function(materialName, index) {
          var materialMappings = mappingsByMaterial[materialName];
          var timestamp = Math.floor(Date.now() / 1000) + index;
          var bundleId = '0_' + materialName + '_' + timestamp;

          var vendorMap = {};
          materialMappings.forEach(function(mapping) {
            var vendor = extractVendorFromPreset(mapping.originalPreset);
            if (!vendorMap[vendor]) {
              vendorMap[vendor] = {
                filament_path: [],
                vendor: vendor
              };
            }
            vendorMap[vendor].filament_path.push(vendor + '/' + mapping.generatedFilename);
          });

          var structure = {
            bundle_id: bundleId,
            bundle_type: 'filament config bundle',
            filament_name: materialName,
            filament_vendor: Object.keys(vendorMap).map(function(k) { return vendorMap[k]; }),
            version: '02.05.00.56'
          };

          var innerZip = new JSZip();
          innerZip.file('bundle_structure.json', JSON.stringify(structure, null, 2));

          Object.keys(vendorMap).forEach(function(vendor) {
            var vendorFolder = innerZip.folder(vendor);
            materialMappings.forEach(function(mapping) {
              var mappingVendor = extractVendorFromPreset(mapping.originalPreset);
              if (mappingVendor === vendor) {
                var modifiedData = JSON.parse(JSON.stringify(mapping.presetData || {}));
                var nameWithoutExtension = mapping.generatedFilename.replace(/\.json$/, '');
                modifiedData.name = nameWithoutExtension;

                var jsonContent = JSON.stringify(modifiedData, null, 4);
                var blob = new Blob([jsonContent], { type: 'application/json' });
                vendorFolder.file(mapping.generatedFilename, blob);
              }
            });
          });

          var mp = innerZip.generateAsync({ type: 'blob' }).then(function(content) {
            var sanitizedName = materialName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
            outerZip.file(sanitizedName + '.bbsflmt', content);
          });

          materialPromises.push(mp);
        });

        // After all materials processed, generate final ZIP
        Promise.all(materialPromises).then(function() {
          return outerZip.generateAsync({ type: 'blob' });
        }).then(function(finalContent) {
          var objectUrl = URL.createObjectURL(finalContent);
          var a = document.createElement('a');
          a.href = objectUrl;
          a.download = 'polymakerPresetBundle-' + materials.length + '.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function() { URL.revokeObjectURL(objectUrl); }, 1000);

          if (downloadBundleBtn) {
            downloadBundleBtn.disabled = false;
            var dlBndSpanRst = downloadBundleBtn.querySelector('[data-i18n="btn.download.bundle"]');
            if (dlBndSpanRst) dlBndSpanRst.textContent = t('btn.download.bundle');
          }
        }).catch(function(err) {
          console.error('Error creating bundles:', err);
          if (downloadBundleBtn) {
            downloadBundleBtn.disabled = false;
            var dlBndSpanRst = downloadBundleBtn.querySelector('[data-i18n="btn.download.bundle"]');
            if (dlBndSpanRst) dlBndSpanRst.textContent = t('btn.download.bundle');
          }
        });
      }

      // Handle checkbox change
      function handleCheckboxChange(e) {
        var checkbox = e.target;
        if (!checkbox) return;

        // Handle folder checkbox
        if (checkbox.classList.contains('folder-checkbox-input')) {
          handleFolderCheckboxChange(checkbox);
          return;
        }

        // Handle preset checkbox
        if (!checkbox.classList.contains('preset-checkbox-input')) return;

        var label = checkbox.closest('.preset-checkbox');
        if (!label) return;
        var presetId = label.getAttribute('data-preset-id');
        var presetData = label.getAttribute('data-preset-data');

        if (checkbox.checked) {
          try {
            selectedPresets[presetId] = JSON.parse(presetData);
          } catch (err) {
            console.warn('Failed to parse preset data:', err);
          }
        } else {
          delete selectedPresets[presetId];
        }

        updateSelectedCount();

        // Update folder checkbox state for this preset's folder
        var parentFolder = checkbox.closest('tr.child-row');
        if (parentFolder) {
          var folderId = parentFolder.getAttribute('data-parent-folder');
          updateFolderCheckboxState(folderId);
        }

        // Update select all checkbox state
        updateSelectAllCheckboxState();
      }

      // Handle folder checkbox change (select/deselect all children)
      function handleFolderCheckboxChange(checkbox) {
        var label = checkbox.closest('.folder-checkbox-label');
        if (!label) return;
        var folderId = label.getAttribute('data-folder-id');
        var isChecked = checkbox.checked;

        // Find all child checkboxes for this folder
        var childRows = tbody.querySelectorAll('tr[data-parent-folder="' + folderId + '"]');
        for (var i = 0; i < childRows.length; i++) {
          var childCheckbox = childRows[i].querySelector('.preset-checkbox-input');
          if (!childCheckbox) continue;

          var childLabel = childCheckbox.closest('.preset-checkbox');
          if (!childLabel) continue;

          var presetId = childLabel.getAttribute('data-preset-id');
          var presetData = childLabel.getAttribute('data-preset-data');

          childCheckbox.checked = isChecked;

          if (isChecked) {
          try {
            selectedPresets[presetId] = JSON.parse(presetData);
          } catch (err) {
            console.warn('Failed to parse preset data:', err);
          }
          } else {
            delete selectedPresets[presetId];
          }
        }

        // Remove indeterminate state
        checkbox.indeterminate = false;
        checkbox.removeAttribute('data-indeterminate');

        updateSelectedCount();
        updateSelectAllCheckboxState();
      }

      // Update folder checkbox state based on its children
      function updateFolderCheckboxState(folderId) {
        var folderRow = tbody.querySelector('tr[data-folder-id="' + folderId + '"]');
        if (!folderRow) return;

        var folderCheckbox = folderRow.querySelector('.folder-checkbox-input');
        if (!folderCheckbox) return;

        var childRows = tbody.querySelectorAll('tr[data-parent-folder="' + folderId + '"]');
        var checkedCount = 0;

        for (var i = 0; i < childRows.length; i++) {
          var childCheckbox = childRows[i].querySelector('.preset-checkbox-input');
          if (childCheckbox && childCheckbox.checked) {
            checkedCount++;
          }
        }

        if (checkedCount === 0) {
          folderCheckbox.checked = false;
          folderCheckbox.indeterminate = false;
          folderCheckbox.removeAttribute('data-indeterminate');
        } else if (checkedCount === childRows.length) {
          folderCheckbox.checked = true;
          folderCheckbox.indeterminate = false;
          folderCheckbox.removeAttribute('data-indeterminate');
        } else {
          folderCheckbox.checked = false;
          folderCheckbox.indeterminate = true;
          folderCheckbox.setAttribute('data-indeterminate', 'true');
        }
      }

      // Update select all checkbox state
      function updateSelectAllCheckboxState() {
        if (!selectAllCheckbox) return;

        var allCheckboxes = tbody.querySelectorAll('.preset-checkbox-input');
        var checkedCount = tbody.querySelectorAll('.preset-checkbox-input:checked').length;
        var totalCount = allCheckboxes.length;

        if (checkedCount === 0) {
          selectAllCheckbox.checked = false;
          selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === totalCount) {
          selectAllCheckbox.checked = true;
          selectAllCheckbox.indeterminate = false;
        } else {
          selectAllCheckbox.checked = false;
          selectAllCheckbox.indeterminate = true;
        }
      }

      // Handle select all checkbox
      function handleSelectAllChange() {
        var isChecked = selectAllCheckbox.checked;
        var checkboxes = tbody.querySelectorAll('.preset-checkbox-input');

        for (var i = 0; i < checkboxes.length; i++) {
          var cb = checkboxes[i];
          var label = cb.closest('.preset-checkbox');
          if (!label) continue;
          var presetId = label.getAttribute('data-preset-id');
          var presetData = label.getAttribute('data-preset-data');

          cb.checked = isChecked;

          if (isChecked) {
          try {
            selectedPresets[presetId] = JSON.parse(presetData);
          } catch (e) {
            console.warn('Failed to parse preset data:', e);
          }
          } else {
            delete selectedPresets[presetId];
          }
        }

        var folderCheckboxes = tbody.querySelectorAll('.folder-checkbox-input');
        for (var j = 0; j < folderCheckboxes.length; j++) {
          var fc = folderCheckboxes[j];
          fc.checked = isChecked;
          fc.indeterminate = false;
          fc.removeAttribute('data-indeterminate');
        }

        updateSelectedCount();
        selectAllCheckbox.indeterminate = false;
      }

      // Attach checkbox event listeners
      if (tbody) {
        tbody.addEventListener('change', handleCheckboxChange);
      }

      if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAllChange);
      }

      if (downloadSelectedBtn) {
        downloadSelectedBtn.addEventListener('click', downloadSelectedPresets);
      }

      if (downloadBundleBtn) {
        downloadBundleBtn.addEventListener('click', downloadSelectedBundle);
      }

      // Handle strict checkbox change
      var strictCheckbox = document.getElementById('strict-checkbox');
      if (strictCheckbox) {
        strictCheckbox.addEventListener('change', function () {
          filterState.strict = strictCheckbox.checked;
          render();
        });
      }

      function render() {
        // Update visibility based on slicer selection
        updateVisibility();

        // Don't render table if slicer not selected
        if (!isSlicerSelected()) {
          if (status) status.textContent = '';
          if (tbody) tbody.innerHTML = '';
          selectedPresets = {};
          updateSelectedCount();
          if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
          }
          return;
        }

        updateAllFilterOptions();
        updateBrandDropdownState();
        var series = filterState.series;
        var model = filterState.model;
        var slicer = filterState.slicer;

        var filters = getEffectiveFilters();
        var effectiveSlicer = filters.effectiveSlicer;
        var effectiveBrand = filters.effectiveBrand;

        var filtered = presets.filter(function (p) {
          if (series && !materialMatchesSeries(p.material, series)) return false;
          if (effectiveBrand) {
              var brandMatches = p.brand === effectiveBrand;
              // Non-strict mode: also check compatiblePrinters for brand match
              if (!filterState.strict && !brandMatches && p.compatiblePrinters && p.compatiblePrinters.length > 0) {
                  for (var idx = 0; idx < p.compatiblePrinters.length; idx++) {
                      if (p.compatiblePrinters[idx].brand === effectiveBrand) {
                          brandMatches = true;
                          break;
                      }
                  }
              }
              if (!brandMatches) return false;
          }
          if (model) {
              var modelMatches = p.model === model;
              // Non-strict mode: also check compatiblePrinters for model match
              if (!filterState.strict && !modelMatches && p.compatiblePrinters && p.compatiblePrinters.length > 0) {
                  for (var idx = 0; idx < p.compatiblePrinters.length; idx++) {
                      if (p.compatiblePrinters[idx].model === model) {
                          modelMatches = true;
                          break;
                      }
                  }
              }
              if (!modelMatches) return false;
          }
          if (effectiveSlicer && p.slicer !== effectiveSlicer) return false;
          return true;
        });

        // Group by material; when one material has multiple presets, show one row with a dropdown
        var groups = {};
        filtered.forEach(function (p) {
          var key = p.material || '';
          if (!groups[key]) groups[key] = [];
          groups[key].push(p);
        });

        var base = (typeof RAW_BASE === 'string' && RAW_BASE !== null) ? RAW_BASE : (RAW_BASE || '');
        var rowsHtml = [];
        var totalPresets = 0;
        var folderIdCounter = 0;
        var FOLDER_ID_PREFIX = 'folder-';
        function displayFilename(filename, slicer) {
          var fn = filename || t('filename.preset');
          var ext = fn.replace(/^.*\./, '') || 'json';
          var baseName = fn.replace(/\.[^.]+$/, '') || 'preset';
          return slicer ? (baseName + ' - ' + slicer + '.' + ext) : fn;
        }

        function getDownloadButtonLabel(filename) {
          var fn = filename || t('filename.preset');
          var match = fn.match(/\.([^.]+)$/);
          var ext = match && match[1] ? match[1].toUpperCase() : 'FILE';
          return ext;
        }

        // Chevron right SVG icon
        var folderIconSvg = '<svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

        // Format date for display
        function formatDate(dateString) {
          if (!dateString) return t('value.none');
          try {
            var date = new Date(dateString);
            return date.toLocaleDateString();
          } catch (e) {
            return t('value.none');
          }
        }

        function formatCompatiblePrinters(compatiblePrinters) {
          if (!compatiblePrinters || compatiblePrinters.length === 0) {
            return t('value.none');
          }

          // Model name mapping: full name -> display abbreviation
          var modelDisplayMap = {
            'Centauri Carbon 2': 'CC2'
          };

          // Extract unique models
          var models = [];
          var seen = {};
          for (var i = 0; i < compatiblePrinters.length; i++) {
            var model = compatiblePrinters[i].model;
            // Map to display name if available
            if (model && modelDisplayMap[model]) {
              model = modelDisplayMap[model];
            }
            if (model && !seen[model]) {
              seen[model] = true;
              models.push(model);
            }
          }

          return models.join(', ');
        }

        function getPrinterBrand(compatiblePrinters, fallbackBrand) {
          if (!compatiblePrinters || compatiblePrinters.length === 0) {
            return fallbackBrand || t('value.none');
          }

          // Get the first printer's brand (they should all be the same for a preset)
          return compatiblePrinters[0].brand || fallbackBrand || t('value.none');
        }

        // Helper function to generate table row HTML for a preset
        function generatePresetRowHtml(p, options) {
          var url = p.path ? (base + encodeURI(p.path)) : '#';
          var filename = displayFilename(p.filename, p.slicer);
          var presetId = p.path || (p.material + '-' + p.brand + '-' + p.model + '-' + p.slicer);
          var isChecked = selectedPresets[presetId] ? ' checked' : '';
          var presetData = JSON.stringify({ url: url, filename: filename, slicer: p.slicer, path: p.path, material: p.material, model: p.model, brand: p.brand });
          var checkboxHtml = '<label class="checkbox-label preset-checkbox" data-preset-id="' + escapeHtml(presetId) + '" data-preset-data="' + escapeHtml(presetData) + '"><input type="checkbox" class="checkbox-input preset-checkbox-input"' + isChecked + '><span class="checkbox-custom"></span></label>';
          var printerBrand = getPrinterBrand(p.compatiblePrinters, p.brand);
          var compatiblePrintersList = formatCompatiblePrinters(p.compatiblePrinters);
          
          var rowClass = options.isChild ? 'child-row' : '';
          var parentAttr = options.parentFolder ? ' data-parent-folder="' + options.parentFolder + '"' : '';
          var materialClass = options.isChild ? 'child-material' : '';
          
          // Only show Bundle button for BambuStudio presets
          var isBambuStudio = p.slicer === 'BambuStudio';
          var bundleButtonHtml = isBambuStudio
            ? '<a href="#" class="btn-download btn-bundle" data-bundle-url="' + escapeHtml(url) + '" data-bundle-filename="' + escapeHtml(p.filename) + '" data-bundle-material="' + escapeHtml(options.material) + '" data-bundle-model="' + escapeHtml(p.model || '') + '" role="button" title="' + t('title.download.bundle') + '">.bbsflmt</a>'
            : '';
          var downloadLabel = getDownloadButtonLabel(p.filename);

          // For BambuStudio, the JSON anchor goes through a click handler that
          // expands compatible_printers and zips the result (issue #14). For
          // other slicers, keep the direct download anchor.
          var jsonButtonHtml = isBambuStudio
            ? '<a href="#" class="btn-download btn-bambu-json" data-bambu-json="1" data-bundle-url="' + escapeHtml(url) + '" data-bundle-filename="' + escapeHtml(p.filename) + '" data-bundle-material="' + escapeHtml(options.material) + '" role="button" title="' + t('title.download.json') + '">JSON</a>'
            : '<a href="' + url + '" class="btn-download" data-download-url="' + escapeHtml(url) + '" data-download-filename="' + escapeHtml(filename) + '" role="button" title="' + t('title.download.json') + '" download="' + escapeHtml(filename) + '">JSON</a>';

          return '<tr' + (rowClass ? ' class="' + rowClass + '"' : '') + parentAttr + '>' +
            '<td>' + checkboxHtml + '</td>' +
            '<td' + (materialClass ? ' class="' + materialClass + '"' : '') + '>' + escapeHtml(options.material) + '</td>' +
            '<td>' + escapeHtml(printerBrand) + '</td>' +
            '<td>' + escapeHtml(p.model || t('value.none')) + '</td>' +
            '<td>' + escapeHtml(compatiblePrintersList) + '</td>' +
            '<td>' + formatDate(p.updatedAt) + '</td>' +
            '<td class="td-actions">' + jsonButtonHtml + bundleButtonHtml + '</td>' +
            '</tr>';
        }

        for (var mat in groups) {
          var list = groups[mat];
          totalPresets += list.length;
          var first = list[0];
          var folderId = FOLDER_ID_PREFIX + folderIdCounter++;

          if (list.length > 1) {
            // Folder row (parent) - expandable with checkbox

            // Check if all children are selected
            var allChildrenSelected = list.every(function (p) {
              var pid = p.path || (p.material + '-' + p.brand + '-' + p.model + '-' + p.slicer);
              return !!selectedPresets[pid];
            });
            var someChildrenSelected = list.some(function (p) {
              var pid = p.path || (p.material + '-' + p.brand + '-' + p.model + '-' + p.slicer);
              return !!selectedPresets[pid];
            });
            var folderChecked = allChildrenSelected ? ' checked' : '';
            var folderIndeterminate = (!allChildrenSelected && someChildrenSelected) ? ' data-indeterminate="true"' : '';

            rowsHtml.push('<tr class="folder-row" data-folder-id="' + folderId + '">' +
              '<td><label class="checkbox-label folder-checkbox-label" data-folder-id="' + folderId + '"><input type="checkbox" class="checkbox-input folder-checkbox-input"' + folderChecked + folderIndeterminate + '><span class="checkbox-custom"></span></label></td>' +
              '<td colspan="4">' + folderIconSvg + escapeHtml(mat) + ' <span class="folder-count">(' + t('folder.presets', { n: list.length }) + ')</span></td>' +
              '<td>-</td>' +
              '<td class="td-actions"><span class="folder-hint">' + t('folder.expand') + '</span></td>' +
              '</tr>');

            // Child rows for each preset
            list.forEach(function (p) {
              rowsHtml.push(generatePresetRowHtml(p, {
                material: mat,
                isChild: true,
                parentFolder: folderId
              }));
            });
          } else {
            // Single preset - no folder needed
            rowsHtml.push(generatePresetRowHtml(first, {
              material: mat,
              isChild: false
            }));
          }
        }

        tbody.innerHTML = rowsHtml.join('');

        // Add click handlers for folder rows
        var folderRows = tbody.querySelectorAll('tr.folder-row');
        for (var i = 0; i < folderRows.length; i++) {
          (function (folderRow) {
            folderRow.addEventListener('click', function (e) {
              // Don't toggle if clicking on a button/link/checkbox
              var target = e.target;
              while (target && target !== folderRow) {
                if (target.tagName === 'A' || target.tagName === 'BUTTON') return;
                if (target.tagName === 'INPUT' && target.type === 'checkbox') return;
                if (target.classList && target.classList.contains('checkbox-label')) return;
                if (target.classList && target.classList.contains('checkbox-custom')) return;
                target = target.parentElement;
              }

              var folderId = folderRow.getAttribute('data-folder-id');
              var isExpanded = folderRow.classList.contains('expanded');

              if (isExpanded) {
                // Collapse
                folderRow.classList.remove('expanded');
                var childRows = tbody.querySelectorAll('tr[data-parent-folder="' + folderId + '"]');
                for (var j = 0; j < childRows.length; j++) {
                  childRows[j].classList.remove('expanded');
                }
              } else {
                // Expand
                folderRow.classList.add('expanded');
                var childRows = tbody.querySelectorAll('tr[data-parent-folder="' + folderId + '"]');
                for (var j = 0; j < childRows.length; j++) {
                  childRows[j].classList.add('expanded');
                }
              }
            });
          })(folderRows[i]);
        }

        // Update folder checkbox states after rendering
        for (var k = 0; k < folderRows.length; k++) {
          var fRow = folderRows[k];
          var fCheckbox = fRow.querySelector('.folder-checkbox-input');
          if (fCheckbox && fCheckbox.getAttribute('data-indeterminate') === 'true') {
            fCheckbox.indeterminate = true;
          }
        }

        // Update select all checkbox state after rendering
        updateSelectAllCheckboxState();

        if (status) status.textContent = t('list.count', { n: totalPresets, m: Object.keys(groups).length });
        
        // Update bundle button state when filters change
        updateBundleButtonState();
      }

      tbody.addEventListener('click', function (e) {
        // Handle BambuStudio JSON button click — fetch, expand per-printer,
        // zip, and download (issue #14).
        var bambuJsonLink = e.target.closest('a[data-bambu-json="1"]');
        if (bambuJsonLink) {
          e.preventDefault();
          var bjUrl = bambuJsonLink.getAttribute('data-bundle-url');
          var bjFilename = bambuJsonLink.getAttribute('data-bundle-filename') || 'preset.json';
          var bjMaterial = bambuJsonLink.getAttribute('data-bundle-material') || '';

          if (!bjUrl || bjUrl === '#') {
            alert(t('alert.invalid.url'));
            return;
          }

          fetch(bjUrl, { mode: 'cors' })
            .then(function (r) {
              if (!r.ok) throw new Error('Failed to fetch preset: ' + r.statusText);
              return r.json();
            })
            .then(function (data) {
              var preset = { filename: bjFilename, material: bjMaterial, slicer: 'BambuStudio' };
              var expanded = expandBambuPresetForDownload(preset, data);
              if (expanded.length === 0) {
                throw new Error('Preset has no compatible_printers');
              }
              var zip = new JSZip();
              expanded.forEach(function (entry) {
                zip.file(entry.filename, entry.content);
              });
              return zip.generateAsync({ type: 'blob' }).then(function (content) {
                var zipName = (bjMaterial || bjFilename.replace(/\.json$/, '')) + '.zip';
                var objectUrl = URL.createObjectURL(content);
                var a = document.createElement('a');
                a.href = objectUrl;
                a.download = zipName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 1000);
              });
            })
            .catch(function (err) {
              console.error('Error downloading JSON:', err);
              alert(t('alert.error.preset', { msg: err.message }));
            });
          return;
        }

        // Handle Bundle button click (only for BambuStudio)
        var bundleLink = e.target.closest('a.btn-bundle');
        if (bundleLink) {
          e.preventDefault();
          var url = bundleLink.getAttribute('data-bundle-url');
          var filename = bundleLink.getAttribute('data-bundle-filename');
          var material = bundleLink.getAttribute('data-bundle-material');
          var model = bundleLink.getAttribute('data-bundle-model');

          if (!url || url === '#') {
            alert(t('alert.invalid.url'));
            return;
          }

          // Fetch the preset JSON to get filament_vendor
          fetch(url, { mode: 'cors' })
            .then(function (r) {
              if (!r.ok) throw new Error('Failed to fetch preset: ' + r.statusText);
              return r.json();
            })
            .then(function (data) {
              if (!data || !data.compatible_printers) {
                console.warn('Preset data missing compatible_printers:', data);
              }
              var preset = {
                path: url,
                filename: filename,
                material: data.name || material,
                model: model,
                slicer: 'BambuStudio',
                filament_vendor: data.filament_vendor || ['Polymaker'],
                presetData: data
              };
              downloadAsBbsflmt([preset]);
            })
            .catch(function (err) {
              console.error('Error downloading bundle:', err);
              alert(t('alert.error.preset', { msg: err.message }));
            });
          return;
        }
      });

      render();

      // Re-render table and dynamic strings when language changes
      document.addEventListener('langchange', function () {
        render();
      });
    })
    .catch(function (err) {
      document.getElementById('status').textContent = t('list.failed', { msg: err.message });
    });
}

// Modal functionality for Manual Installation
function initModal() {
  var modal = document.getElementById('install-modal');
  var helpBtn = document.getElementById('help-btn');
  var closeBtn = modal.querySelector('.modal-close');
  var overlay = modal.querySelector('.modal-overlay');

  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (helpBtn) {
    helpBtn.addEventListener('click', openModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

// Duplicate Resolution Modal functionality
var duplicateModalState = {
  duplicates: [],
  selectedOptions: {},
  onConfirm: null,
  onCancel: null
};

function initDuplicateModal() {
  var modal = document.getElementById('duplicate-modal');
  if (!modal) return;

  var closeBtn = document.getElementById('duplicate-modal-close');
  var cancelBtn = document.getElementById('duplicate-cancel');
  var confirmBtn = document.getElementById('duplicate-confirm');
  var overlay = modal.querySelector('.modal-overlay');

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (duplicateModalState.onCancel) {
      duplicateModalState.onCancel();
    }
  }

  function confirmSelection() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (duplicateModalState.onConfirm) {
      console.log('Confirm clicked, selectedOptions:', duplicateModalState.selectedOptions);
      duplicateModalState.onConfirm(duplicateModalState.selectedOptions);
    } else {
      console.warn('No onConfirm callback found');
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmSelection);
  }

  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/**
 * Format printer model name for display
 * @param {string} model - Raw model name (e.g., "A1M", "A1")
 * @returns {string} Formatted display name
 */
function formatModelDisplayName(model) {
  if (!model) return t('value.unknown');
  var modelMap = {
    'A1M': 'A1 mini',
    'A1': 'A1',
    'P1P': 'P1P',
    'P1S': 'P1S',
    'X1': 'X1',
    'X1C': 'X1C',
    'H2D': 'H2D',
    'H2S': 'H2S',
    'P2S': 'P2S',
    'CC2': 'CC2',
    'U1': 'U1',
    'Kobra S1': 'Kobra S1'
  };
  return modelMap[model] || model;
}

/**
 * Check if source model is the native match for target printer
 * Native match means the source model matches the target printer name
 * @param {string} sourceModel - Source model code (e.g., "A1", "A1M")
 * @param {string} targetPrinter - Target printer name (e.g., "Bambu Lab A1 0.4 nozzle")
 * @returns {boolean} True if native match
 */
function isNativeMatch(sourceModel, targetPrinter) {
  if (!sourceModel || !targetPrinter) return false;

  var displayName = formatModelDisplayName(sourceModel);

  // Check if target printer contains the display name (e.g., "A1" in "Bambu Lab A1 0.4 nozzle")
  // For A1 mini, need to check for "A1 mini" specifically to avoid matching "A1" first
  if (sourceModel === 'A1M') {
    return targetPrinter.indexOf('A1 mini') !== -1 || targetPrinter.indexOf('A1M') !== -1;
  }
  if (sourceModel === 'A1') {
    // A1 should match "A1" but not "A1 mini" - check for A1 followed by non-letter or end
    return targetPrinter.indexOf('A1') !== -1 && targetPrinter.indexOf('A1 mini') === -1;
  }

  return targetPrinter.indexOf(displayName) !== -1;
}

/**
 * Show duplicate resolution dialog
 * Groups conflicts by material, then by target printer
 * Allows users to select which source preset to use for each target printer
 * @param {Array} duplicates - Array of duplicate groups organized by material with target printer conflicts
 * @param {Function} onConfirm - Callback when user confirms selection
 * @param {Function} onCancel - Callback when user cancels
 */
function showDuplicateResolutionDialog(duplicates, onConfirm, onCancel) {
  var modal = document.getElementById('duplicate-modal');
  var listContainer = document.getElementById('duplicate-list');

  if (!modal || !listContainer) {
    console.error('Duplicate modal elements not found');
    return;
  }

  // Store state - now organized by material and target printer
  duplicateModalState.duplicates = duplicates;
  duplicateModalState.selectedOptions = {};
  duplicateModalState.onConfirm = onConfirm;
  duplicateModalState.onCancel = onCancel;

  // Initialize default selections - prefer native match (source model matches target printer)
  duplicates.forEach(function(materialGroup, materialIndex) {
    duplicateModalState.selectedOptions[materialIndex] = {};
    materialGroup.targets.forEach(function(target, targetIndex) {
      var defaultIndex = 0;
      var targetPrinter = target.targetPrinter;

      // Find the option where source model matches target printer (native support)
      for (var i = 0; i < target.options.length; i++) {
        var sourceModel = target.options[i].originalPreset.model;
        if (isNativeMatch(sourceModel, targetPrinter)) {
          defaultIndex = i;
          break;
        }
      }

      duplicateModalState.selectedOptions[materialIndex][targetIndex] = defaultIndex;
    });
  });

  // Render duplicate list - grouped by material
  var html = '';
  duplicates.forEach(function(materialGroup, materialIndex) {
    html += '<div class="duplicate-material-group">';
    html += '<div class="duplicate-material-header">' + escapeHtml(materialGroup.material) + '</div>';

    // Each target printer within this material
    materialGroup.targets.forEach(function(target, targetIndex) {
      html += '<div class="duplicate-target-section">';
      html += '<div class="duplicate-target-label">' + t('dup.for.printer', { name: escapeHtml(target.targetPrinter) }) + '</div>';
      html += '<div class="duplicate-options">';

      // Each source preset option for this target
      var selectedOptionIndex = duplicateModalState.selectedOptions[materialIndex][targetIndex];
      target.options.forEach(function(mapping, optionIndex) {
        var preset = mapping.originalPreset;
        var presetData = mapping.presetData;
        var sourceModel = preset.model || t('value.unknown');
        var sourceDisplayName = formatModelDisplayName(sourceModel);
        var isSelected = optionIndex === selectedOptionIndex ? ' checked' : '';

        // Get compatible printers list for this source preset
        var compatiblePrinters = [];
        if (presetData && presetData.compatible_printers && Array.isArray(presetData.compatible_printers)) {
          compatiblePrinters = presetData.compatible_printers;
        }

        html += '<label class="duplicate-option">';
        html += '<input type="radio" name="dup-' + materialIndex + '-' + targetIndex + '"' +
                ' value="' + optionIndex + '"' + isSelected +
                ' data-material-index="' + materialIndex + '"' +
                ' data-target-index="' + targetIndex + '"' +
                ' data-option-index="' + optionIndex + '">';
        html += '<div class="duplicate-option-label">';
        html += '<div class="duplicate-option-source">' + t('dup.use.profile', { name: escapeHtml(sourceDisplayName) }) + '</div>';
        html += '<div class="duplicate-option-compatible">' + t('dup.compatible', { list: escapeHtml(compatiblePrinters.join(', ')) }) + '</div>';
        html += '</div>';
        html += '</label>';
      });

      html += '</div>'; // end duplicate-options
      html += '</div>'; // end duplicate-target-section
    });

    html += '</div>'; // end duplicate-material-group
  });

  listContainer.innerHTML = html;

  // Add change listeners to radio buttons
  var radioButtons = listContainer.querySelectorAll('input[type="radio"]');
  for (var i = 0; i < radioButtons.length; i++) {
    radioButtons[i].addEventListener('change', function(e) {
      var materialIndex = parseInt(e.target.getAttribute('data-material-index'), 10);
      var targetIndex = parseInt(e.target.getAttribute('data-target-index'), 10);
      var optionIndex = parseInt(e.target.getAttribute('data-option-index'), 10);
      duplicateModalState.selectedOptions[materialIndex][targetIndex] = optionIndex;
    });
  }

  // Show modal
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

/**
 * Filter out unselected duplicates based on user selection
 * @param {Array} filenameMappings - All filename mappings
 * @param {Object} selectedOptions - User's selected options from dialog (organized by materialIndex -> targetIndex -> optionIndex)
 * @param {Array} duplicates - Original duplicates array (organized by material with target printer conflicts)
 * @returns {Array} Filtered mappings
 */
function filterDuplicates(filenameMappings, selectedOptions, duplicates) {
  console.log('filterDuplicates called:', {
    mappingsCount: filenameMappings.length,
    duplicatesCount: duplicates.length,
    selectedOptions: selectedOptions
  });
  
  if (!duplicates || duplicates.length === 0) {
    return filenameMappings;
  }

  // Build exclusion set: keys of mappings to exclude
  var excludeSet = {};

  // Iterate through material groups
  duplicates.forEach(function(materialGroup, materialIndex) {
    var materialTargets = materialGroup.targets;

    // Iterate through target printer conflicts within this material
    materialTargets.forEach(function(target, targetIndex) {
      var selectedOptionIndex = selectedOptions[materialIndex][targetIndex];
      console.log('Processing material', materialIndex, 'target', targetIndex, 'selected:', selectedOptionIndex);

      // Mark all unselected options for exclusion
      target.options.forEach(function(mapping, optionIndex) {
        if (optionIndex !== selectedOptionIndex) {
          // Create unique key for this mapping
          var key = mapping.generatedFilename + '|' + mapping.originalPreset.path;
          console.log('  Excluding option', optionIndex, 'key:', key);
          excludeSet[key] = true;
        }
      });
    });
  });

  console.log('excludeSet keys:', Object.keys(excludeSet));

  // Filter out excluded mappings
  var result = filenameMappings.filter(function(mapping) {
    var key = mapping.generatedFilename + '|' + mapping.originalPreset.path;
    var isExcluded = excludeSet[key];
    if (isExcluded) {
      console.log('Filtering out:', key);
    }
    return !isExcluded;
  });
  
  console.log('filterDuplicates result:', result.length, 'mappings');
  return result;
}

// Accordion functionality for Known Issues
function initAccordion() {
  var accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(function (header) {
    header.addEventListener('click', function () {
      var item = header.parentElement;
      var isCollapsed = item.classList.contains('is-collapsed');
      var icon = header.querySelector('.accordion-icon');

      if (isCollapsed) {
        item.classList.remove('is-collapsed');
        header.setAttribute('aria-expanded', 'true');
        icon.textContent = '▼';
      } else {
        item.classList.add('is-collapsed');
        header.setAttribute('aria-expanded', 'false');
        icon.textContent = '▼';
      }
    });
  });
}

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

init();
initModal();
initDuplicateModal();
initAccordion();
