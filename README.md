# Polymaker Filament Presets

Official print presets for Polymaker 3D printing filaments, optimized for use with BambuStudio, OrcaSlicer, ElegooSlicer, and other compatible slicers.

## 🌐 Download Presets

**Visit our download page:** [https://presets.polymaker.com](https://presets.polymaker.com) 

## 📦 Manual Installation

### Bambu Studio

1. Download the preset JSON file (or single-file ZIP) from the [download page](https://presets.polymaker.com).
2. Open Bambu Studio.
3. Go to **File** → **Import** → **Import Preset...**.
4. Select a JSON or ZIP file.
5. Click on a material in the project consumables list, select the imported custom preset, and the preset will appear in the preset list.

### OrcaSlicer / ElegooSlicer

1. Download the preset as **JSON** or **single-file ZIP** from the [download page](https://presets.polymaker.com).
2. Open OrcaSlicer or ElegooSlicer.
3. Go to **File** → **Import**:
   - For a **JSON** file: choose **Import Configs...** (OrcaSlicer) or **Import Preset...** (ElegooSlicer), then select the JSON file.
   - For a **ZIP** file: choose **Import Zip Archive...** (or the equivalent, e.g. “Import Zip Archive…” in ElegooSlicer), then select the ZIP file (no need to unzip).
4. The preset will appear in your preset list.

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

## 🔗 Links

- **Download Page**: [https://presets.polymaker.com](https://presets.polymaker.com) 
- **Polymaker Official Website**: [https://polymaker.com/](https://polymaker.com/)
- **Polymaker Wiki**: [https://wiki.polymaker.com/](https://wiki.polymaker.com/)
- **Polymaker Store**: [https://shop.polymaker.com/](https://shop.polymaker.com/)
- **GitHub Repository**: [https://github.com/Polymaker3D/Polymaker-Preset](https://github.com/Polymaker3D/Polymaker-Preset)

## 📱 Social Accounts

- **YouTube**: [https://www.youtube.com/@Polymaker](https://www.youtube.com/@Polymaker)
- **Instagram**: [https://www.instagram.com/polymaker_3d](https://www.instagram.com/polymaker_3d)
- **Facebook**: [https://www.facebook.com/Polymaker.3D](https://www.facebook.com/Polymaker.3D)
