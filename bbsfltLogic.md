BambuStudio .bbsflmt File Generation and Structure Report
Overview
.bbsflmt files are Filament Preset Bundle archives used by BambuStudio to package and share filament preset configurations. These files use ZIP compression and contain JSON-formatted preset files along with a metadata manifest.
---
Generation Process
1. Entry Point
The generation is triggered through the ExportConfigsDialog class:
File: src/slic3r/GUI/CreatePresetsDialog.cpp:4146
ExportConfigsDialog::ExportCase ExportConfigsDialog::archive_filament_bundle_to_file(const wxString &path)
2. Generation Flow
flowchart TD
    A[User selects filament bundle export] --> B[data_init - Gather presets]
    B --> C[Create ZIP archive]
    C --> D[Generate bundle_structure.json]
    D --> E[Add preset files to ZIP]
    E --> F[Finalize ZIP archive]
    F --> G[Output .bbsflmt file]
3. Data Collection (data_init)
File: src/slic3r/GUI/CreatePresetsDialog.cpp:4450-4530
The system collects filament presets from the current PresetBundle:
const std::deque<Preset> &filament_presets = preset_bundle.filaments.get_presets();
for (const Preset &filament_preset : filament_presets) {
    if (filament_preset.is_system || filament_preset.is_default) continue;
    Preset *new_filament_preset = new Preset(filament_preset);
    const Preset *base_filament_preset = preset_bundle.filaments.get_preset_base(*new_filament_preset);
    
    std::string filament_preset_name = base_filament_preset->name;
    m_filament_name_to_presets[get_filament_name(filament_preset_name)]
        .push_back(std::make_pair(get_vendor_name(new_filament_preset), new_filament_preset));
}
Key filtering criteria:
- Skips system presets (is_system)
- Skips default presets (is_default)
- Groups by filament name (extracted from preset name)
- Organizes by vendor name
4. Bundle Structure Creation
File: src/slic3r/GUI/CreatePresetsDialog.cpp:4156-4220
json bundle_structure;
// Metadata generation
if (agent) {
    bundle_structure["version"]   = agent->get_version();
    bundle_structure["bundle_id"] = agent->get_user_id() + "_" + filament_name + "_" + clock;
} else {
    bundle_structure["version"]   = "";
    bundle_structure["bundle_id"] = "offline_" + filament_name + "_" + clock;
}
bundle_structure["bundle_type"]   = "filament config bundle";
bundle_structure["filament_name"] = filament_name;
5. File Packaging
ZIP Archive Operations:
1. Initialize ZIP: initial_zip_archive() creates a new ZIP file
2. Add Presets: Each preset is added as vendor_name/preset_name.json
3. Add Metadata: bundle_structure.json is added to the root
4. Finalize: save_zip_archive_to_file() completes the archive
---
Internal Structure
File Organization
{bundle_name}.bbsflmt (ZIP Archive)
├── bundle_structure.json          # Metadata manifest
├── {vendor1}/
│   ├── preset1.json
│   ├── preset2.json
│   └── ...
├── {vendor2}/
│   ├── preset3.json
│   └── ...
└── {vendorN}/
    └── ...
bundle_structure.json Format
{
    version: 01.09.00.60,
    bundle_id: user123_PLA-Basic_20240115_143022,
    bundle_type: filament config bundle,
    filament_name: PLA-Basic,
    filament_vendor: [
        {
            vendor: Bambu Lab,
            filament_path: [
                Bambu Lab/PLA-Basic @Bambu Lab X1C 0.4 nozzle.json,
                Bambu Lab/PLA-Basic @Bambu Lab P1P 0.4 nozzle.json
            ]
        },
        {
            vendor: Generic,
            filament_path: [
                Generic/PLA-Basic @Generic printer.json
            ]
        }
    ]
}
Field Descriptions
| Field | Type | Description |
|-------|------|-------------|
| version | string | BambuStudio version that created the bundle |
| bundle_id | string | Unique identifier (user_id + filament_name + timestamp) |
| bundle_type | string | Fixed value: "filament config bundle" |
| filament_name | string | Base name of the filament |
| filament_vendor | array | List of vendors and their associated presets |
Filament Preset JSON Structure
Each .json file contains a complete filament preset configuration with:
- Print settings (temperatures, speeds, retractions)
- Compatibility information
- Vendor and filament type metadata
- Custom G-code sequences
---
Loading Process
File: src/libslic3r/PresetBundle.cpp:999-1071
flowchart LR
    A[.bbsflmt file] --> B[Extract to temp folder]
    B --> C[Parse each JSON preset]
    C --> D[Import to PresetBundle]
    D --> E[Clean up temp files]
Loading Steps:
1. Detection: Files ending with .bbsflmt are recognized as filament bundles
2. Extraction: ZIP contents extracted to data_dir/PRESET_USER_DIR/DEFAULT_USER_FOLDER_NAME/temp/
3. Import: Each JSON preset is imported via import_json_presets()
4. Cleanup: Temp folder is removed after import
---
Code Locations Summary
| Component | File | Line(s) |
|-----------|------|---------|
| Generation Entry | CreatePresetsDialog.cpp | 4146 |
| Structure Creation | CreatePresetsDialog.cpp | 4156-4220 |
| ZIP Operations | CreatePresetsDialog.cpp | 4170-4233 |
| Data Init | CreatePresetsDialog.cpp | 4450-4530 |
| Structure JSON Helper | CreatePresetsDialog.cpp | 3869 |
| Loading/Import | PresetBundle.cpp | 999-1071 |
| Metadata Constant | PresetBundle.hpp | 14 |
---
Key Design Decisions
1. ZIP Format: Enables compression and bundling of multiple presets
2. Vendor-based Organization: Presets grouped by vendor for logical separation
3. Metadata Manifest: bundle_structure.json provides bundle identification and organization
4. Offline Mode Support: Generates bundle_id with "offline_" prefix when no network agent
5. Deduplication: Uses std::set to prevent duplicate preset entries during export