/**
 * Compare real vs generated bundle_structure.json
 * 
 * REAL BUNDLE (working):
 * {
 *   "bundle_id": "1144442852_Panchroma PLA Celestial_1772511794",
 *   "bundle_type": "filament config bundle",
 *   "filament_name": "Panchroma PLA Celestial",
 *   "filament_vendor": [{
 *     "filament_path": ["Polymaker/Panchroma PLA Celestial @BBL P2S.json"],
 *     "vendor": "Polymaker"
 *   }],
 *   "version": "02.05.00.56"
 * }
 * 
 * KEY DIFFERENCES:
 * 1. Field ORDER: bundle_id first, version LAST (not first)
 * 2. bundle_id format: {numeric_user_id}_{filament_name}_{numeric_timestamp}
 * 3. version format: "02.05.00.56" (BambuStudio version, not "1.0.0")
 * 4. filament_vendor object order: filament_path first, then vendor
 * 5. Minified JSON (no extra spaces/newlines)
 * 
 * OUR CURRENT CODE:
 * - version is FIRST (should be LAST)
 * - version is "1.0.0" (should be BambuStudio version format)
 * - bundle_id uses "polymaker_" prefix (should be numeric)
 * - filament_vendor has vendor first (should be filament_path first)
 * - Pretty-printed JSON with indentation
 */

// FIXED generateBundleStructure function
function generateBundleStructureFixed(presets, type) {
  if (!presets || presets.length === 0) {
    throw new Error('No presets provided');
  }

  // Use BambuStudio version format
  var version = '02.05.00.56';
  
  // Generate timestamp as numeric string (like BambuStudio)
  var timestamp = Math.floor(Date.now() / 1000).toString();
  
  var isBatch = type === 'batch' || presets.length > 1;
  
  // Group presets by vendor
  var vendorMap = {};
  
  presets.forEach(function(preset) {
    var vendor = extractVendorFromPreset(preset);
    
    if (!vendorMap[vendor]) {
      vendorMap[vendor] = {
        filament_path: [],  // filament_path FIRST
        vendor: vendor       // vendor SECOND
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
  // Using "0" as user_id since we're offline/generating publicly
  var bundleId = '0_' + filamentName.replace(/\s+/g, ' ') + '_' + timestamp;

  // Build structure with CORRECT FIELD ORDER
  var structure = {};
  structure.bundle_id = bundleId;                    // 1st
  structure.bundle_type = 'filament config bundle';  // 2nd
  structure.filament_name = filamentName;            // 3rd
  structure.filament_vendor = Object.values(vendorMap); // 4th
  structure.version = version;                       // 5th (LAST!)

  return structure;
}