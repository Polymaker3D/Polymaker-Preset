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
    var params = new URLSearchParams(window.location.search || '');
    var fromUrl = params.get('theme');
    if (fromUrl === 'wiki' || fromUrl === 'dark') {
      initial = fromUrl;
    } else {
      var stored = window.localStorage ? window.localStorage.getItem(THEME_STORAGE_KEY) : null;
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
          window.localStorage.setItem(THEME_STORAGE_KEY, next);
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
  var filterState = {
    material: '',
    brand: '',
    model: '',
    slicer: ''
  };

  initTheme();

  fetch(INDEX_JSON_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var materials = data.materials || [];
      var brands = data.brands || [];
      var models = data.models || [];
      var slicers = data.slicers || [];
      var presets = data.presets || [];

      function escapeHtml(s) {
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
      }

      function setupDropdown(name, list) {
        var dropdown = document.querySelector('.dropdown[data-filter="' + name + '"]');
        if (!dropdown) return;
        var toggle = dropdown.querySelector('.dropdown-toggle');
        var labelEl = dropdown.querySelector('.dropdown-label');
        var menu = dropdown.querySelector('.dropdown-menu');

        function renderOptions(options) {
          var html = [
            '<div class="dropdown-option is-active" data-value="">All</div>'
          ].concat(options.map(function (x) {
            return '<div class="dropdown-option" data-value="' + escapeHtml(x) + '">' +
              escapeHtml(x) +
              '</div>';
          }));
          menu.innerHTML = html.join('');
          filterState[name] = '';
          if (labelEl) labelEl.textContent = 'All';
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

          if (labelEl) labelEl.textContent = text || 'All';
          dropdown.classList.remove('is-open');
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

      setupDropdown('material', materials);
      setupDropdown('brand', brands);
      setupDropdown('model', models);
      setupDropdown('slicer', slicers);

      function render() {
        var material = filterState.material;
        var brand = filterState.brand;
        var model = filterState.model;
        var slicer = filterState.slicer;
        var filtered = presets.filter(function (p) {
          if (material && p.material !== material) return false;
          if (brand && p.brand !== brand) return false;
          if (model && p.model !== model) return false;
          if (slicer && p.slicer !== slicer) return false;
          return true;
        });

        tbody.innerHTML = filtered.map(function (p) {
          // RAW_BASE 可能是空字符串（同源相对路径），不能作为布尔条件判断
          var base = (typeof RAW_BASE === 'string' && RAW_BASE !== null) ? RAW_BASE : (RAW_BASE || '');
          var url = p.path ? (base + encodeURI(p.path)) : '#';
          var label = p.filename || 'Download';
          var downloadFilename = p.filename || 'preset.json';
          return '<tr>' +
            '<td>' + escapeHtml(p.material || '') + '</td>' +
            '<td>' + escapeHtml(p.brand || '') + '</td>' +
            '<td>' + escapeHtml(p.model || '') + '</td>' +
            '<td>' + escapeHtml(p.slicer || '') + '</td>' +
            '<td><a href="' + url + '" class="btn-download" data-download-url="' + escapeHtml(url) + '" data-download-filename="' + escapeHtml(downloadFilename) + '" role="button">' + label + '</a></td>' +
            '</tr>';
        }).join('');

        status.textContent = filtered.length + ' presets found.';
      }

      tbody.addEventListener('click', function (e) {
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

init();
