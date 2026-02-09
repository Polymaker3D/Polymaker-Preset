# Polymaker Print Presets

Official print presets for Polymaker 3D printing filaments, optimized for use with BambuStudio, OrcaSlicer, ElegooSlicer, and other compatible slicers.

## 🌐 Download Presets

**Visit our download page:** [https://polymaker3d.github.io/Polymaker-Preset/](https://polymaker3d.github.io/Polymaker-Preset/)

## 📦 Instruction on Manual Installation

### BambuStudio / OrcaSlicer / ElegooSlicer

1. Download the preset JSON file from the [download page](https://polymaker3d.github.io/Polymaker-Preset/) or from this repository's `preset/` folder.
2. Open your slicer (BambuStudio or OrcaSlicer).
3. Navigate to: **File** → **Import** → **Import Configs** .
4. The preset will appear in your filament/process dropdown.

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

**Last Updated**: Check the `index.json` file for the latest update timestamp. See `index.json` → `updatedAt` field

## 📝 Usage Notes

- These presets are starting points. You may need to fine-tune settings (especially process presets) based on your specific printer, nozzle size, and environmental conditions.
- Always run a temperature tower when trying a new material.
- Adjust retraction settings based on your printer's configuration.
- Clean the nozzle between material changes.

## 🔗 Links

- **Download Page**: [https://polymaker3d.github.io/Polymaker-Preset/](https://polymaker3d.github.io/Polymaker-Preset/)
- **Polymaker Website**: [https://polymaker.com](https://polymaker.com)
- **GitHub Repository**: [https://github.com/Polymaker3D/Polymaker-Preset](https://github.com/Polymaker3D/Polymaker-Preset)
