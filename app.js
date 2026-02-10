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
  var filterState = {
    series: '',
    material: '',
    brand: '',
    model: '',
    slicer: ''
  };

  // Material series for filtering: Panchroma / Polymaker / Fiberon / PolyTerra / PolyLite
  var MATERIAL_SERIES = ['Panchroma', 'Polymaker', 'Fiberon', 'PolyTerra', 'PolyLite'];

  initTheme();

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
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
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

      /** Return presets matching current filters except the given dimension (for building "has result" option lists). */
      function getMatchingPresets(exceptFilter) {
        return presets.filter(function (p) {
          if (exceptFilter !== 'series' && filterState.series && (p.material || '').indexOf(filterState.series + ' ') !== 0) return false;
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

      /** Only show filter options that have at least one preset to avoid zero-result combinations. */
      function updateAllFilterOptions() {
        var matchSeries = getMatchingPresets('series');
        var seriesList = MATERIAL_SERIES.filter(function (s) {
          return matchSeries.some(function (p) { return (p.material || '').indexOf(s + ' ') === 0; });
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

        var matchSlicer = getMatchingPresets('slicer');
        var slicerList = [];
        var seenSlicer = {};
        matchSlicer.forEach(function (p) {
          var s = p.slicer || '';
          if (!seenSlicer[s]) { seenSlicer[s] = true; slicerList.push(s); }
        });
        slicerList.sort();
        updateDropdownOptions('slicer', slicerList);
      }

      function render() {
        // Update visibility based on slicer selection
        updateVisibility();

        // Don't render table if slicer not selected
        if (!isSlicerSelected()) {
          if (status) status.textContent = '';
          if (tbody) tbody.innerHTML = '';
          return;
        }

        updateAllFilterOptions();
        var series = filterState.series;
        var brand = filterState.brand;
        var model = filterState.model;
        var slicer = filterState.slicer;
        var filtered = presets.filter(function (p) {
          if (series && (p.material || '').indexOf(series + ' ') !== 0) return false;
          if (brand && p.brand !== brand) return false;
          if (model && p.model !== model) return false;
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
        function displayFilename(filename, slicer) {
          var fn = filename || 'preset.json';
          var ext = fn.replace(/^.*\./, '') || 'json';
          var baseName = fn.replace(/\.[^.]+$/, '') || 'preset';
          return slicer ? (baseName + ' - ' + slicer + '.' + ext) : fn;
        }

        // Chevron right SVG icon
        var folderIconSvg = '<svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

        for (var mat in groups) {
          var list = groups[mat];
          totalPresets += list.length;
          var first = list[0];
          var folderId = 'folder-' + folderIdCounter++;

          if (list.length > 1) {
            // Folder row (parent) - expandable
            rowsHtml.push('<tr class="folder-row" data-folder-id="' + folderId + '">' +
              '<td>' + folderIconSvg + escapeHtml(mat) + '</td>' +
              '<td>' + list.length + ' presets</td>' +
              '<td class="td-actions"><span class="folder-hint">Click to expand</span></td>' +
              '</tr>');

            // Child rows for each preset
            list.forEach(function (p) {
              var url = p.path ? (base + encodeURI(p.path)) : '#';
              var filename = displayFilename(p.filename, p.slicer);
              var presetLabel = (p.brand || '') + ' ' + (p.model || '') + ' ' + (p.slicer || '');
              rowsHtml.push('<tr class="child-row" data-parent-folder="' + folderId + '">' +
                '<td>' + escapeHtml(mat) + '</td>' +
                '<td>' + escapeHtml(presetLabel.trim()) + '</td>' +
                '<td class="td-actions"><a href="' + url + '" class="btn-download" data-download-url="' + escapeHtml(url) + '" data-download-filename="' + escapeHtml(filename) + '" role="button" title="Download as JSON file">JSON</a></td>' +
                '</tr>');
            });
          } else {
            // Single preset - no folder needed
            var url0 = first.path ? (base + encodeURI(first.path)) : '#';
            var filename0 = displayFilename(first.filename, first.slicer);
            var presetLabel = (first.brand || '') + ' ' + (first.model || '') + ' ' + (first.slicer || '');
            rowsHtml.push('<tr>' +
              '<td>' + escapeHtml(mat) + '</td>' +
              '<td>' + escapeHtml(presetLabel.trim()) + '</td>' +
              '<td class="td-actions"><a href="' + url0 + '" class="btn-download" data-download-url="' + escapeHtml(url0) + '" data-download-filename="' + escapeHtml(filename0) + '" role="button" title="Download as JSON file">JSON</a></td>' +
              '</tr>');
          }
        }

        tbody.innerHTML = rowsHtml.join('');

        // Add click handlers for folder rows
        var folderRows = tbody.querySelectorAll('tr.folder-row');
        for (var i = 0; i < folderRows.length; i++) {
          (function (folderRow) {
            folderRow.addEventListener('click', function (e) {
              // Don't toggle if clicking on a button/link
              var target = e.target;
              while (target && target !== folderRow) {
                if (target.tagName === 'A' || target.tagName === 'BUTTON') return;
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

        if (status) status.textContent = totalPresets + ' presets in ' + Object.keys(groups).length + ' materials.';
      }

      tbody.addEventListener('click', function (e) {
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

// Tooltip positioning to prevent clipping
init();
initModal();
