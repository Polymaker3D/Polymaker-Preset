# Polymaker Filament Presets

Official print presets for Polymaker 3D printing filaments, optimized for use with BambuStudio, OrcaSlicer, ElegooSlicer, and other compatible slicers.

## ⚠️ Known Issues

### P2S Overheating Issue (Temporary Fix)

**Issue**: P2S printer overheating when printing materials with vitrification temperature > 50°C due to starting G-code issues.

**Solution**: We have implemented a temporary fix by adding cooling G-code commands to the `filament_start_gcode` for all P2S presets with vitrification temperature > 50°C:

```gcode
M145 P0 ; set airduct mode to cooling mode for cooling
M106 P2 S255 ; turn on auxiliary fan for cooling
M106 P3 S127 ; turn on chamber fan for cooling
M1002 gcode_claim_action : 29
M191 S0 ; wait for chamber temp
M106 P2 S102 ; turn on chamber cooling fan
M106 P10 S0 ; turn off left aux fan
M142 P6 R30 S40 U0.3 V0.8 ; set PETG exhaust chamber autocooling
```

This is a temporary workaround. We will remove this change after Bambu Lab fixes this issue.

**Acknowledgements**: Thanks to alexbreinig for pointing out this issue and capsel22 for reporting it in the BambuStudio issues. For more details, see: https://github.com/bambulab/BambuStudio/issues/8801

## 🌐 Download Presets

**Visit our download page:** [https://presets.polymaker.com](https://presets.polymaker.com) 

## 📦 Manual Installation

### Bambu Studio

#### Method 1: Bundle Method (Recommended)

1. Download the preset **.bbsflmt** file (or bundle ZIP) from the [download page](https://presets.polymaker.com).
2. If it's a ZIP file, unzip it to extract the .bbsflmt file(s).
3. Open Bambu Studio.
4. Go to **File** → **Import** → **Import Preset...**.
5. Select the **.bbsflmt** file(s).
6. Click on a material in the project consumables list, select the imported custom preset, and the preset will appear in the preset list.

**Note:** .bbsflmt bundles are only available for BambuStudio. The bundle download button only appears when no printer filter is applied.

#### Method 2: Individual File Method

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
   - For a **ZIP** file: choose **Import Zip Archive...** (or the equivalent, e.g. "Import Zip Archive…" in ElegooSlicer), then select the ZIP file (no need to unzip).
4. The preset will appear in your preset list.

## 📁 Repository Structure

```
Polymaker-Preset/
├── index.html              # Main download page (GitHub Pages)
├── app.js                  # Frontend logic (filters, downloads, themes)
├── style.css               # Styling (dark theme + wiki light theme)
├── index.json              # Auto-generated index of all presets
├── package.json            # Node.js project configuration
├── preset/                 # All preset JSON files
│   └── <Material>/
│       └── <Brand>/
│           └── <Model>/
│               └── <Slicer>/
│                   └── <Preset>.json
├── scripts/                # Build/maintenance scripts
│   ├── generate-index-json.mjs    # Generates index.json from preset files
│   ├── app-filter.test.mjs        # Filter logic tests
│   └── generate-index-json.test.mjs  # Index generation tests
├── tests/                  # Test suite
│   ├── app.test.mjs        # Frontend application tests
│   ├── rigorous.test.mjs   # Rigorous validation tests
│   ├── bbsflmt.test.js     # BBSFLMT format tests
│   └── bbsflmt-tests.js    # Additional BBSFLMT tests
├── .github/workflows/      # CI/CD automation
│   ├── auto-update-index-json.yml  # Auto-regenerates index.json on PRs
│   └── test.yml            # Test runner workflow
├── README.md               # This file
└── AGENTS.md               # Developer documentation
```

## 🎨 Supported Materials

### Panchroma Series
- **Panchroma PLA**
- **Panchroma PLA Celestial**
- **Panchroma PLA Galaxy**
- **Panchroma PLA Glow**
- **Panchroma PLA Luminous**
- **Panchroma PLA Marble**
- **Panchroma PLA Matte**
- **Panchroma PLA Metallic**
- **Panchroma PLA Neon**
- **Panchroma PLA Satin**
- **Panchroma PLA Silk**
- **Panchroma PLA Starlight**
- **Panchroma PLA Translucent**
- **Panchroma PLA UV Shift**

### PolyLite Series
- **PolyLite CosPLA**
- **PolyLite PETG**
- **PolyLite PETG Translucent**
- **PolyLite PLA**
- **PolyLite PLA Galaxy**
- **PolyLite PLA Glow**
- **PolyLite PLA Luminous**
- **PolyLite PLA Neon**
- **PolyLite PLA Pro**
- **PolyLite PLA Pro Metallic**
- **PolyLite PLA Starlight**
- **PolyLite PLA Translucent**

### PolyTerra Series
- **PolyTerra PLA**
- **PolyTerra PLA+**
- **PolyTerra PLA Marble**

### Polymaker Series
- **Polymaker HT-PLA**
- **Polymaker HT-PLA-GF**
- **Polymaker PETG**
- **Polymaker PETG Galaxy**
- **Polymaker PLA**
- **Polymaker PLA Pro**
- **Polymaker PLA Pro Metallic**

### Fiberon Series
- **Fiberon PA12-CF10**
- **Fiberon PA6-CF20**
- **Fiberon PA6-GF25**
- **Fiberon PA612-CF15**
- **Fiberon PET-CF17**
- **Fiberon PETG-ESD**
- **Fiberon PETG-rCF08**

## 🖨️ Supported Printers

- **BBL** (Bambu Lab): A1, A1M (A1 Mini), H2D, H2S, P1P, P1S, P2S, X1
- **Anycubic**: Kobra S1
- **Elegoo**: CC2
- **Snapmaker**: U1

## 🔄 Updates

Presets are updated regularly based on:

- Polymaker material specifications
- Community feedback (after validation)
- Testing with various printer models

**Last Updated**: Check the `index.json` file for the latest update timestamp (`updatedAt` field).

## 🧪 Testing

This project includes a comprehensive test suite to ensure preset quality and consistency.

### Running Tests

```bash
# Run all tests
npm test

# Run all tests (including both .mjs and .js files)
npm run test:all

# Run tests with coverage report
npm run test:coverage

# Run only app tests
npm run test:app
```

### Test Categories

- **app.test.mjs** - Frontend application logic tests
- **rigorous.test.mjs** - Rigorous validation of preset structure and data
- **bbsflmt.test.js** - BBSFLMT bundle format validation
- **generate-index-json.test.mjs** - Index generation script tests
- **app-filter.test.mjs** - Filter functionality tests

## 🛠️ Development

### Prerequisites

- Node.js 18 or higher

### Local Development

No build step is required for the frontend. To preview locally:

```bash
# Option 1: Python HTTP server
python3 -m http.server 8000

# Option 2: Node.js http-server (if installed)
npx http-server -p 8000
```

Then open http://localhost:8000

### Regenerating index.json

If you add or modify preset files, regenerate the index:

```bash
npm run generate-index
# or
node scripts/generate-index-json.mjs
```

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
