// Same repo: index.json and preset files are served from the same origin as the page
var INDEX_JSON_URL = './index.json';
// Use relative URL so fetch is same-origin (no CORS). Works on GitHub Pages and local.
var RAW_BASE = '';
var THEME_STORAGE_KEY = 'polymaker-preset-theme';

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

  initTheme();

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
      throw new Error('No presets provided');
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
      filamentName = presets[0].material || 'Unknown Filament';
    }

    // Generate bundle_id in BambuStudio format: {user_id}_{filament_name}_{timestamp}
    // Using "0" as user_id since we're generating publicly
    var bundleId = '0_' + filamentName + '_' + timestamp;

    // Build structure with CORRECT FIELD ORDER (bundle_id first, version LAST)
    var structure = {};
    structure.bundle_id = bundleId;
    structure.bundle_type = 'filament config bundle';
    structure.filament_name = filamentName;
    structure.filament_vendor = Object.values(vendorMap);
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
      return 'polymaker-bundle.bbsflmt';
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

    return 'Unknown';
  }

  /**
   * Download preset(s) as .bbsflmt bundle
   * @param {Array} presets - Array of preset objects to bundle
   */
  function downloadAsBbsflmt(presets) {
    if (!presets || presets.length === 0) {
      console.warn('No presets to bundle');
      return;
    }

    var zip = new JSZip();
    var promises = [];

    // Generate bundle structure
    var structure = generateBundleStructure(presets, presets.length > 1 ? 'batch' : 'single');

    // Group files by vendor
    var vendorFolders = {};

    presets.forEach(function(preset) {
      var vendor = extractVendorFromPreset(preset);
      if (!vendorFolders[vendor]) {
        vendorFolders[vendor] = zip.folder(vendor);
      }

      var url = preset.path ? (RAW_BASE + encodeURI(preset.path)) : '#';
      if (!url || url === '#') {
        console.warn('Invalid URL for preset:', preset.filename);
        return;
      }

      var promise = fetch(url, { mode: 'cors' })
        .then(function(r) {
          if (!r.ok) {
            throw new Error('Failed to fetch ' + preset.filename + ': ' + r.statusText);
          }
          return r.blob();
        })
        .then(function(blob) {
          vendorFolders[vendor].file(preset.filename, blob);
        })
        .catch(function(err) {
          console.warn('Error downloading preset:', preset.filename, err);
        });

      promises.push(promise);
    });

    Promise.all(promises).then(function() {
      // Add bundle_structure.json
      zip.file('bundle_structure.json', JSON.stringify(structure, null, 2));

      return zip.generateAsync({ type: 'blob' });
    }).then(function(content) {
      var objectUrl = URL.createObjectURL(content);
      var a = document.createElement('a');
      a.href = objectUrl;
      a.download = generateBundleFilename(presets);
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
      slicers = normalizedSlicers;

      // Normalize slicer names in presets
      presets.forEach(function(p) {
        p.slicer = normalizeSlicerName(p.slicer);
      });

      function escapeHtml(s) {
        if (s === null || s === undefined) return '';
        return String(s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

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
        var defaultLabel = isSlicer ? 'Select Slicer' : ('All ' + (name === 'series' ? 'Series' : name === 'brand' ? 'Brands' : 'Models'));

        function renderOptions(options) {
          var html = '';
          if (!isSlicer) {
            html += '<div class="dropdown-option' + (filterState[name] ? '' : ' is-active') + '" data-value="">All</div>';
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

      /** Return presets matching current filters except the given dimension (for building "has result" option lists). */
      function getMatchingPresets(exceptFilter) {
        return presets.filter(function (p) {
          if (exceptFilter !== 'series' && filterState.series && !materialMatchesSeries(p.material, filterState.series)) return false;
          if (exceptFilter !== 'brand' && filterState.brand && p.brand !== filterState.brand) return false;
          if (exceptFilter !== 'model' && filterState.model && p.model !== filterState.model) return false;
          if (exceptFilter !== 'slicer' && filterState.slicer && p.slicer !== filterState.slicer) return false;
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
          '<div class="dropdown-option' + (display ? '' : ' is-active') + '" data-value="">All</div>'
        ].concat(list.map(function (x) {
          var active = x === display ? ' is-active' : '';
          return '<div class="dropdown-option' + active + '" data-value="' + escapeHtml(x) + '">' + escapeHtml(x) + '</div>';
        }));
        menu.innerHTML = html.join('');
        if (labelEl) labelEl.textContent = display || 'All';
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

      // Update the selected count display and button state
      function updateSelectedCount() {
        var count = Object.keys(selectedPresets).length;
        if (selectedCountSpan) selectedCountSpan.textContent = count;
        if (downloadSelectedBtn) downloadSelectedBtn.disabled = count === 0;
        updateBundleButtonState();
      }

      // Update bundle button state based on BambuStudio presets
      function updateBundleButtonState() {
        if (!downloadBundleBtn) return;

        // Bundle download only available when:
        // 1. Slicer is BambuStudio
        // 2. No printer model filter is applied
        if (filterState.slicer !== 'BambuStudio') {
          downloadBundleBtn.disabled = true;
          return;
        }

        if (filterState.model) {
          downloadBundleBtn.disabled = true;
          return;
        }

        // Enable button when slicer is BambuStudio and no model filter
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
          downloadSelectedBtn.textContent = 'Loading...';
        }

        var zip = new JSZip();
        var folder = zip.folder('polymaker-presets');
        var promises = [];

        presetIds.forEach(function (presetId) {
          var preset = selectedPresets[presetId];
          // Validate URL before fetch
          if (!preset.url || preset.url === '#') {
            console.warn('Invalid URL for preset:', presetId);
            return;
          }
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
          promises.push(promise);
        });

        Promise.all(promises).then(function () {
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
            if (downloadSelectedBtn) {
              downloadSelectedBtn.disabled = false;
              downloadSelectedBtn.textContent = 'Download Selected';
            }
          });
        }).catch(function (err) {
          console.error('Error generating ZIP:', err);
          // Reset button state on error
          if (downloadSelectedBtn) {
            downloadSelectedBtn.disabled = false;
            downloadSelectedBtn.textContent = 'Download Selected';
          }
        });
      }

      // Download selected BambuStudio presets as .bbsflmt bundle
      function downloadSelectedBundle() {
        // Filter for BambuStudio presets only
        var bambuPresets = [];
        for (var key in selectedPresets) {
          var preset = selectedPresets[key];
          if (preset.slicer === 'BambuStudio') {
            bambuPresets.push(preset);
          }
        }

        // If no presets selected, download ALL visible BambuStudio presets
        if (bambuPresets.length === 0) {
          bambuPresets = presets.filter(function(p) {
            if (p.slicer !== 'BambuStudio') return false;
            if (filterState.series && !materialMatchesSeries(p.material, filterState.series)) return false;
            if (filterState.brand && p.brand !== filterState.brand) return false;
            return true;
          }).map(function(p) {
            var base = (typeof RAW_BASE === 'string' && RAW_BASE !== null) ? RAW_BASE : (RAW_BASE || '');
            return {
              url: base + encodeURI(p.path),
              filename: p.filename,
              material: p.material,
              slicer: p.slicer,
              path: p.path
            };
          });
        }

        if (bambuPresets.length === 0) {
          alert('No BambuStudio presets available to download.');
          return;
        }

        // Show loading state
        if (downloadBundleBtn) {
          downloadBundleBtn.disabled = true;
          downloadBundleBtn.textContent = 'Loading...';
        }

        // First, fetch all preset JSON files to get filament_vendor
        var presetDataPromises = [];
        var presetDataMap = {};

        bambuPresets.forEach(function(preset) {
          var promise = fetch(preset.url, { mode: 'cors' })
            .then(function(r) {
              if (!r.ok) throw new Error('Failed to fetch ' + preset.filename);
              return r.json();
            })
            .then(function(data) {
              // Use preset.material (filament name) not data.name (full preset name with printer)
              presetDataMap[preset.filename] = {
                material: preset.material,
                filament_vendor: data.filament_vendor || ['Polymaker']
              };
            })
            .catch(function() {
              presetDataMap[preset.filename] = {
                material: preset.material,
                filament_vendor: ['Polymaker']
              };
            });
          presetDataPromises.push(promise);
        });

        Promise.all(presetDataPromises).then(function() {
          // Group presets by material
          var presetsByMaterial = {};
          bambuPresets.forEach(function(preset) {
            var data = presetDataMap[preset.filename];
            var material = data ? data.material : preset.material;
            if (!presetsByMaterial[material]) {
              presetsByMaterial[material] = [];
            }
            presetsByMaterial[material].push({
              preset: preset,
              filament_vendor: data ? data.filament_vendor : ['Polymaker']
            });
          });

          // Create outer ZIP to hold all .bbsflmt files
          var outerZip = new JSZip();
          var materials = Object.keys(presetsByMaterial);
          var materialPromises = [];

          materials.forEach(function(material, index) {
            var materialItems = presetsByMaterial[material];
            // Add index to timestamp for unique bundle_id per material
            var timestamp = Math.floor(Date.now() / 1000) + index;
            var bundleId = '0_' + material + '_' + timestamp;

            // Group by vendor
            var vendorMap = {};
            materialItems.forEach(function(item) {
              var vendor = item.filament_vendor[0] || 'Polymaker';
              if (!vendorMap[vendor]) {
                vendorMap[vendor] = {
                  filament_path: [],
                  vendor: vendor
                };
              }
              vendorMap[vendor].filament_path.push(vendor + '/' + item.preset.filename);
            });

            // Create structure
            var structure = {
              bundle_id: bundleId,
              bundle_type: 'filament config bundle',
              filament_name: material,
              filament_vendor: Object.values(vendorMap),
              version: '02.05.00.56'
            };

            // Create inner ZIP for this material
            var innerZip = new JSZip();
            innerZip.file('bundle_structure.json', JSON.stringify(structure, null, 2));

            // Fetch and add all preset files
            var filePromises = [];
            Object.keys(vendorMap).forEach(function(vendor) {
              var vendorFolder = innerZip.folder(vendor);
              materialItems.forEach(function(item) {
                if ((item.filament_vendor[0] || 'Polymaker') === vendor) {
                  var fp = fetch(item.preset.url, { mode: 'cors' })
                    .then(function(r) { return r.blob(); })
                    .then(function(blob) {
                      vendorFolder.file(item.preset.filename, blob);
                    })
                    .catch(function() {
                      console.warn('Failed to fetch:', item.preset.filename);
                    });
                  filePromises.push(fp);
                }
              });
            });

            // After all files added, generate the .bbsflmt
            var mp = Promise.all(filePromises).then(function() {
              return innerZip.generateAsync({ type: 'blob' });
            }).then(function(content) {
              var sanitizedName = material.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
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
              downloadBundleBtn.textContent = 'Download Bundle (.bbsflmt)';
            }
          }).catch(function(err) {
            console.error('Error creating bundles:', err);
            if (downloadBundleBtn) {
              downloadBundleBtn.disabled = false;
              downloadBundleBtn.textContent = 'Download Bundle (.bbsflmt)';
            }
          });
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
        var series = filterState.series;
        var brand = filterState.brand;
        var model = filterState.model;
        var slicer = filterState.slicer;
        var filtered = presets.filter(function (p) {
          if (series && !materialMatchesSeries(p.material, series)) return false;
          if (brand) {
              var brandMatches = p.brand === brand;
              // Non-strict mode: also check compatiblePrinters for brand match
              if (!filterState.strict && !brandMatches && p.compatiblePrinters && p.compatiblePrinters.length > 0) {
                  for (var idx = 0; idx < p.compatiblePrinters.length; idx++) {
                      if (p.compatiblePrinters[idx].brand === brand) {
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
          if (slicer && p.slicer !== slicer) return false;
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
          var fn = filename || 'preset.json';
          var ext = fn.replace(/^.*\./, '') || 'json';
          var baseName = fn.replace(/\.[^.]+$/, '') || 'preset';
          return slicer ? (baseName + ' - ' + slicer + '.' + ext) : fn;
        }

        // Chevron right SVG icon
        var folderIconSvg = '<svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

        // Format date for display
        function formatDate(dateString) {
          if (!dateString) return '-';
          try {
            var date = new Date(dateString);
            return date.toLocaleDateString();
          } catch (e) {
            return '-';
          }
        }

        function formatCompatiblePrinters(compatiblePrinters) {
          if (!compatiblePrinters || compatiblePrinters.length === 0) {
            return '-';
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
            return fallbackBrand || '-';
          }

          // Get the first printer's brand (they should all be the same for a preset)
          return compatiblePrinters[0].brand || fallbackBrand || '-';
        }

        // Helper function to generate table row HTML for a preset
        function generatePresetRowHtml(p, options) {
          var url = p.path ? (base + encodeURI(p.path)) : '#';
          var filename = displayFilename(p.filename, p.slicer);
          var presetId = p.path || (p.material + '-' + p.brand + '-' + p.model + '-' + p.slicer);
          var isChecked = selectedPresets[presetId] ? ' checked' : '';
          var presetData = JSON.stringify({ url: url, filename: filename, slicer: p.slicer, path: p.path, material: p.material });
          var checkboxHtml = '<label class="checkbox-label preset-checkbox" data-preset-id="' + escapeHtml(presetId) + '" data-preset-data="' + escapeHtml(presetData) + '"><input type="checkbox" class="checkbox-input preset-checkbox-input"' + isChecked + '><span class="checkbox-custom"></span></label>';
          var printerBrand = getPrinterBrand(p.compatiblePrinters, p.brand);
          var compatiblePrintersList = formatCompatiblePrinters(p.compatiblePrinters);
          
          var rowClass = options.isChild ? 'child-row' : '';
          var parentAttr = options.parentFolder ? ' data-parent-folder="' + options.parentFolder + '"' : '';
          var materialClass = options.isChild ? 'child-material' : '';
          
          // Only show Bundle button for BambuStudio presets
          var isBambuStudio = p.slicer === 'BambuStudio';
          var bundleButtonHtml = isBambuStudio
            ? '<a href="#" class="btn-download btn-bundle" data-bundle-url="' + escapeHtml(url) + '" data-bundle-filename="' + escapeHtml(p.filename) + '" data-bundle-material="' + escapeHtml(options.material) + '" role="button" title="Download as BambuStudio Bundle">.bbsflmt</a>'
            : '';

          return '<tr' + (rowClass ? ' class="' + rowClass + '"' : '') + parentAttr + '>' +
            '<td>' + checkboxHtml + '</td>' +
            '<td' + (materialClass ? ' class="' + materialClass + '"' : '') + '>' + escapeHtml(options.material) + '</td>' +
            '<td>' + escapeHtml(printerBrand) + '</td>' +
            '<td>' + escapeHtml(p.model || '-') + '</td>' +
            '<td>' + escapeHtml(compatiblePrintersList) + '</td>' +
            '<td>' + formatDate(p.updatedAt) + '</td>' +
            '<td class="td-actions"><a href="' + url + '" class="btn-download" data-download-url="' + escapeHtml(url) + '" data-download-filename="' + escapeHtml(filename) + '" role="button" title="Download as JSON file">JSON</a>' + bundleButtonHtml + '</td>' +
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
              '<td colspan="4">' + folderIconSvg + escapeHtml(mat) + ' <span class="folder-count">(' + list.length + ' presets)</span></td>' +
              '<td>-</td>' +
              '<td class="td-actions"><span class="folder-hint">Click to expand</span></td>' +
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

        if (status) status.textContent = totalPresets + ' presets in ' + Object.keys(groups).length + ' materials.';
        
        // Update bundle button state when filters change
        updateBundleButtonState();
      }

      tbody.addEventListener('click', function (e) {
        // Handle Bundle button click (only for BambuStudio)
        var bundleLink = e.target.closest('a.btn-bundle');
        if (bundleLink) {
          e.preventDefault();
          var url = bundleLink.getAttribute('data-bundle-url');
          var filename = bundleLink.getAttribute('data-bundle-filename');
          var material = bundleLink.getAttribute('data-bundle-material');
          
          if (!url || url === '#') return;
          
          // Fetch the preset JSON to get filament_vendor
          fetch(url, { mode: 'cors' })
            .then(function (r) {
              if (!r.ok) throw new Error('Failed to fetch preset');
              return r.json();
            })
            .then(function (data) {
              // Create preset object for bundle
              var preset = {
                path: url,
                filename: filename,
                material: data.name || material,
                slicer: 'BambuStudio',
                filament_vendor: data.filament_vendor || ['Polymaker']
              };
              downloadAsBbsflmt([preset]);
            })
            .catch(function (err) {
              console.error('Error downloading bundle:', err);
              // Fallback: try to download without fetching full data
              var preset = {
                path: url,
                filename: filename,
                material: material,
                slicer: 'BambuStudio',
                filament_vendor: ['Polymaker']
              };
              downloadAsBbsflmt([preset]);
            });
          return;
        }
        
        // Download as JSON (single file)
        var link = e.target.closest('a.btn-download');
        if (!link) return;
        var url = link.getAttribute('data-download-url');
        var filename = link.getAttribute('data-download-filename');
        if (!url || url === '#') return;
        e.preventDefault();
        fetch(url, { mode: 'cors' })
          .then(function (r) { return r.blob(); })
          .then(function (blob) {
            var objectUrl = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename || 'preset.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
          })
          .catch(function () {
            window.open(url, '_blank', 'noopener');
          });
      });

      render();
    })
    .catch(function (err) {
      document.getElementById('status').textContent = 'Failed to load: ' + err.message;
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

// Tooltip positioning to prevent clipping
init();
initModal();
initAccordion();
