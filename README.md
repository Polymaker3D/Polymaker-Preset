# Polymaker Print Presets

Official print presets for Polymaker 3D printing filaments, optimized for use with BambuStudio, OrcaSlicer, ElegooSlicer, and other compatible slicers.

## 🌐 Download

**Visit our download page:** [https://polymaker3d.github.io/Polymaker-Preset/](https://polymaker3d.github.io/Polymaker-Preset/)

## 📦 Manual Installation

### BambuStudio / OrcaSlicer

1. Download the preset JSON file from the [download page](https://polymaker3d.github.io/Polymaker-Preset/) or from this repository's `preset/` folder.
2. Open your slicer (BambuStudio or OrcaSlicer).
3. Navigate to: **Settings** → **User Presets** → **Filament** (or **Process**).
4. Click **Import** and select the downloaded JSON file.
5. The preset will appear in your filament/process dropdown.

### ElegooSlicer

1. Download the preset JSON file.
2. Open ElegooSlicer.
3. Go to **Settings** → **Filament** → **Import**.
4. Select the downloaded JSON file.

## 📁 Repository Structure

```
Polymaker-Preset/
├── index.json          # Full index of all presets (materials, brands, models, slicers, paths)
├── preset/             # All preset JSON files organized by material/brand/model/slicer
│   ├── <Material>/
│   │   └── <Brand>/
│   │       └── <Model>/
│   │           └── <Slicer>/
│   │               └── <Preset>.json
│   └── ...
├── index.html          # Download page (GitHub Pages, custom dropdowns + theme toggle)
├── app.js              # Download page logic (custom dropdowns, theme handling, fetch + Blob download)
├── style.css           # Download page styles (dark theme + Wiki-embedded light theme)
├── TECHNICAL_OVERVIEW.md # Technical overview of implementation details
├── README.md           # This file (English)
└── README.zh-CN.md     # Chinese README (optional)
```

## 🔄 Updates

Presets are updated regularly based on:

- Polymaker material specifications
- Community feedback （after validataion）
- Testing with various printer models

The repository is synchronized with our internal preset management system. Check the `index.json` file for the latest update timestamp.

### index.json auto-generation

`index.json` is **auto-generated** from the `preset/` directory structure by a GitHub Actions workflow.

- When a Pull Request changes files under `preset/`, the workflow will regenerate `index.json` and push a bot commit back to the PR branch.
- Please **do not edit `index.json` manually**. Instead, update files under `preset/` and let the workflow keep the index in sync.

### Themes and embedding

- The download page supports **two themes**:
  - A default dark theme (used when visiting the page directly).
  - A light **Wiki-embedded theme** that matches `wiki.polymaker.com` (background gradient based on `#E8F6F9` and `#FFF`, table header `#00787C`).
- Use the toggle button in the top-right corner to switch themes, or append `?theme=wiki` when embedding the page in an iframe, for example:  
  `https://polymaker3d.github.io/Polymaker-Preset/?theme=wiki`

## 📝 Usage Notes

- These presets are starting points. You may need to fine-tune settings based on your specific printer, nozzle size, and environmental conditions.
- Always run a temperature tower when trying a new material.
- Adjust retraction settings based on your printer's configuration.
- Clean the nozzle between material changes.

## 🤝 Contributing

This repository is maintained by the Polymaker team. For issues or suggestions, create a issus or contact us through official channels.

## 📄 License

These presets are provided as-is for use with Polymaker materials. Feel free to modify them for your specific needs.

## 🔗 Links

- **Download Page**: [https://polymaker3d.github.io/Polymaker-Preset/](https://polymaker3d.github.io/Polymaker-Preset/)
- **Polymaker Website**: [https://polymaker.com](https://polymaker.com)
- **GitHub Repository**: [https://github.com/Polymaker3D/Polymaker-Preset](https://github.com/Polymaker3D/Polymaker-Preset)

---

**Last Updated**: See `index.json` → `updatedAt` field
