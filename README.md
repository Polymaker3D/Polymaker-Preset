# Polymaker Filament Preset

Official print presets for Polymaker 3D printing filaments, optimized for use with BambuStudio, OrcaSlicer, ElegooSlicer, and other compatible slicers.

## 🌐 Download Presets

**Visit our download page:** [https://jingxi-polymaker.github.io/Polymaker-Preset/](hhttps://jingxi-polymaker.github.io/Polymaker-Preset/)

## 📦 Manual Installation

### BambuStudio / OrcaSlicer / ElegooSlicer

1. Download the preset JSON file from the [download page](https://jingxi-polymaker.github.io/Polymaker-Preset/) or from this repository's `preset/` folder.
2. Open your slicer (BambuStudio, OrcaSlicer, or ElegooSlicer).
3. Navigate to: **File** → **Import** → **Import Configs**.
4. The preset will appear in your filament/process dropdown.

## 📁 Repository Structure

```
Polymaker-Preset/
├── index.html          # Main download page (GitHub Pages)
├── app.js              # Frontend logic (filters, downloads, themes)
├── style.css           # Styling (dark theme + wiki light theme)
├── index.json          # Auto-generated index of all presets
├── preset/             # All preset JSON files
│   └── <Material>/
│       └── <Brand>/
│           └── <Model>/
│               └── <Slicer>/
│                   └── <Preset>.json
├── scripts/            # Build/maintenance scripts
│   └── generate-index-json.mjs
├── .github/workflows/  # CI/CD automation
│   └── auto-update-index-json.yml
├── README.md           # This file
└── AGENTS.md           # Developer documentation
```

## 🎨 Supported Materials

**Panchroma Series** - Premium PLA variants including Galaxy, Matte, Silk, Metallic, Neon, Luminous, Glow, Translucent, Marble, Celestial, Starlight, Satin, UV Shift, and more.

**PolyLite Series** - Entry-level PLA and PETG including standard PLA, PETG, Galaxy, Glow, Luminous, Neon, Pro variants, and Translucent options.

**PolyTerra Series** - Eco-friendly PLA including standard PLA, PLA+, and Marble variants.

**Fiberon Series** - Engineering-grade composites including PA-CF, PA-GF, PET-CF, PETG-ESD, and PETG-rCF materials.

**Polymaker Series** - Standard filaments including PLA, PLA Pro, PETG, and HT-PLA variants.

## 🖨️ Supported Printers

- **BBL** (Bambu Lab): X1, P1P, P1S, A1, A1M, H2D
- **Anycubic**: Kobra S1
- **Elegoo**: CC2, U1
- **Snapmaker**: H2S, P2S

## 🔄 Updates

Presets are updated regularly based on:

- Polymaker material specifications
- Community feedback (after validation)
- Testing with various printer models

**Last Updated**: Check the `index.json` file for the latest update timestamp (`updatedAt` field).

## 📝 Usage Notes

- These presets are starting points. You may need to fine-tune settings based on your specific printer, nozzle size, and environmental conditions.
- Always run a temperature tower when trying a new material.
- Adjust retraction settings based on your printer's configuration.
- Clean the nozzle between material changes.

## 🔗 Links

- **Download Page**: [https://polymaker3d.github.io/Polymaker-Preset/](https://polymaker3d.github.io/Polymaker-Preset/)
- **Polymaker Website**: [https://polymaker.com](https://polymaker.com)
- **GitHub Repository**: [https://github.com/Polymaker3D/Polymaker-Preset](https://github.com/Polymaker3D/Polymaker-Preset)
