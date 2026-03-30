# Multi-Language Support Design

## Overview

Add Chinese (Simplified) language support to the Polymaker Preset static site, with a language switcher dropdown in the top-right corner. All translations live in a single file for easy editing. Browser language is auto-detected on load; no persistence.

## Architecture

### New File: `i18n.js`

Single source of truth for all translations.

```js
var TRANSLATIONS = {
  en: { "hero.title": "Filament Presets", ... },
  zh: { "hero.title": "耗材预设", ... }
}
```

Exports three functions:
- `applyLanguage(lang)` — walks the DOM, finds all `[data-i18n]` elements, swaps their text content
- `detectLang()` — reads `navigator.language`; returns `'zh'` if it starts with `zh`, else `'en'`
- `t(key)` — returns the translated string for the current active language (used in `app.js` for dynamic strings)

### Changes to `index.html`

- Add `data-i18n="key"` attribute to every static translatable text node
- Add language dropdown fixed to the top-right corner of the viewport (above/outside the hero section)
- Load `i18n.js` before `app.js` in the `<script>` block

### Changes to `app.js`

Replace all hardcoded user-facing strings with `t('key')` calls. Affected strings include:
- Status/loading messages: `"Loading…"`, `"No presets found"`, etc.
- Button labels: `"Download Selected"`, `"Download Bundle (.bbsflmt)"`
- Table headers: `"Material"`, `"Printer Brand"`, `"Printer"`, etc.
- Filter labels: `"Select Slicer"`, `"All"`, `"Series"`, `"Printer Brand"`, `"Printer Model"`
- Checkbox labels: `"Strict mode: Only show presets made specifically for this printer"`
- Modal content: install guide steps for Bambu Studio and OrcaSlicer/ElegooSlicer
- Duplicate modal text: intro, button labels
- Known Issues section: P2S overheating issue title, body text, credits

## Language Dropdown UI

- Fixed position: `top-right` corner of viewport (CSS `position: fixed; top: 12px; right: 16px`)
- Displays current language label (`EN` or `中文`)
- Opens a list on click; closes on outside click
- Supported languages (extensible): `English`, `中文`
- On load: call `detectLang()` → call `applyLanguage(lang)`

## Browser Language Detection

```js
function detectLang() {
  var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  return lang.startsWith('zh') ? 'zh' : 'en';
}
```

No `localStorage`. Each page load re-detects from the browser.

## Translation Coverage

All user-visible text is translated:

| Area | Examples |
|------|---------|
| Hero | Title, description |
| Filter card | Label text, dropdown placeholders |
| List card | Table headers, button labels, status count |
| Checkboxes | Strict mode label |
| Install modal | All step text for Bambu Studio and OrcaSlicer/ElegooSlicer |
| Duplicate modal | Intro text, button labels |
| Known Issues | Section title, accordion title, issue/solution text, credits |
| Footer | Column titles, "For more information" text |

## File Structure After Implementation

```
i18n.js           ← new: all translations + runtime
index.html        ← modified: data-i18n attributes + lang dropdown HTML
app.js            ← modified: hardcoded strings → t('key') calls
style.css         ← modified: styles for lang dropdown
```

## Extensibility

To add a new language (e.g., German):
1. Add a `de: { ... }` block in `i18n.js`
2. Add a list item in the dropdown HTML

No other changes needed.
