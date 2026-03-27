#!/usr/bin/env node
/**
 * Generate Polymaker filament_id with SEQUENTIAL numbering
 * 
 * Pattern: PM + [MaterialCode] + [SequentialNumber]
 * Example: PMPL01, PMPL02, PMPA01, PMPE01, etc.
 * 
 * Each unique material folder gets the next sequential number
 * within its material code group (PL, PA, PE, HT, etc.)
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const PRESET_DIR = path.join(REPO_ROOT, 'preset');

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walkJsonFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walkJsonFiles(full)));
      continue;
    }
    if (!ent.isFile()) continue;
    if (ent.name.toLowerCase().endsWith('.json')) out.push(full);
  }
  return out;
}

/**
 * Extract material info from directory path
 * e.g., "Panchroma PLA Galaxy" -> { folder: "Panchroma PLA Galaxy", type: "PLA", code: "PL" }
 * e.g., "Fiberon PA6-CF20" -> { folder: "Fiberon PA6-CF20", type: "PA6-CF20", code: "PA" }
 */
function extractMaterialInfo(dirPath) {
  const relPath = path.relative(PRESET_DIR, dirPath);
  const parts = relPath.split(path.sep);
  
  if (parts.length === 0) return null;
  
  const folderName = parts[0];
  const folderParts = folderName.split(' ');
  
  if (folderParts.length < 2) return null;
  
  const materialType = folderParts[1];
  // Use first 2 letters of material type as the code
  const materialCode = materialType.substring(0, 2).toUpperCase();
  
  return { 
    folderName, 
    materialType, 
    materialCode,
    series: folderParts[0] // Panchroma, PolyLite, etc.
  };
}

function generateFilamentId(materialCode, sequentialNumber) {
  return `PM${materialCode}${String(sequentialNumber).padStart(2, '0')}`;
}

/**
 * Group files by unique material folder
 */
function groupFilesByMaterialFolder(jsonFiles) {
  const groups = new Map();
  
  for (const filePath of jsonFiles) {
    const dir = path.dirname(filePath);
    const materialInfo = extractMaterialInfo(dir);
    
    if (!materialInfo) continue;
    
    const { folderName, materialCode, series, materialType } = materialInfo;
    
    if (!groups.has(folderName)) {
      groups.set(folderName, {
        folderName,
        materialCode,
        series,
        materialType,
        files: []
      });
    }
    
    groups.get(folderName).files.push(filePath);
  }
  
  return groups;
}

/**
 * Generate sequential ID assignments
 */
function generateIdAssignments(groups) {
  const assignments = new Map();
  const materialCodeCounters = new Map();
  
  // Sort material folders for deterministic ordering
  // Sort by: materialCode first, then series, then folder name
  const sortedFolders = Array.from(groups.keys()).sort((a, b) => {
    const infoA = groups.get(a);
    const infoB = groups.get(b);
    
    if (infoA.materialCode !== infoB.materialCode) {
      return infoA.materialCode.localeCompare(infoB.materialCode);
    }
    if (infoA.series !== infoB.series) {
      return infoA.series.localeCompare(infoB.series);
    }
    return a.localeCompare(b);
  });
  
  for (const folderName of sortedFolders) {
    const { materialCode, files } = groups.get(folderName);
    
    // Get next sequential number for this material code
    let currentNumber = materialCodeCounters.get(materialCode) || 1;
    
    const filamentId = generateFilamentId(materialCode, currentNumber);
    
    // Assign to all files in this material folder
    for (const filePath of files) {
      assignments.set(filePath, filamentId);
    }
    
    // Increment counter
    materialCodeCounters.set(materialCode, currentNumber + 1);
  }
  
  return assignments;
}

async function updateFiles(assignments, dryRun = true) {
  let updated = 0;
  let skipped = 0;
  
  for (const [filePath, filamentId] of assignments) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      
      // Skip if already correct
      if (data.filament_id === filamentId) {
        skipped++;
        continue;
      }
      
      const oldId = data.filament_id || '(none)';
      data.filament_id = filamentId;
      
      if (dryRun) {
        const relPath = path.relative(REPO_ROOT, filePath);
        console.log(`[DRY-RUN] ${relPath}: ${oldId} -> ${filamentId}`);
      } else {
        await fs.writeFile(filePath, JSON.stringify(data, null, 4) + '\n', 'utf8');
      }
      
      updated++;
    } catch (e) {
      console.error(`Error: ${filePath} - ${e.message}`);
    }
  }
  
  return { updated, skipped };
}

function printSummary(groups, assignments) {
  console.log('\n=== Sequential Filament ID Assignment ===\n');
  
  // Group by material code for display
  const byCode = new Map();
  
  for (const [folderName, info] of groups) {
    const { materialCode } = info;
    if (!byCode.has(materialCode)) {
      byCode.set(materialCode, []);
    }
    
    const sampleFile = info.files[0];
    const filamentId = assignments.get(sampleFile);
    
    byCode.get(materialCode).push({
      folderName,
      series: info.series,
      filamentId,
      fileCount: info.files.length
    });
  }
  
  // Display sorted by material code
  const sortedCodes = Array.from(byCode.keys()).sort();
  
  for (const code of sortedCodes) {
    console.log(`\n${code} Series:`);
    const materials = byCode.get(code);
    
    // Sort by series then folder name
    materials.sort((a, b) => {
      if (a.series !== b.series) return a.series.localeCompare(b.series);
      return a.folderName.localeCompare(b.folderName);
    });
    
    for (const { folderName, filamentId, fileCount } of materials) {
      console.log(`  ${filamentId} - ${folderName.padEnd(35)} (${fileCount} files)`);
    }
  }
  
  console.log(`\n\nTotal materials: ${groups.size}`);
  console.log(`Total files: ${assignments.size}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  
  if (!(await fileExists(PRESET_DIR))) {
    console.error('Error: Missing preset/ directory');
    process.exit(1);
  }
  
  console.log('Scanning preset files...');
  const jsonFiles = await walkJsonFiles(PRESET_DIR);
  console.log(`Found ${jsonFiles.length} JSON files\n`);
  
  console.log('Grouping by material folder...');
  const groups = groupFilesByMaterialFolder(jsonFiles);
  console.log(`Found ${groups.size} unique materials\n`);
  
  console.log('Generating sequential IDs...');
  const assignments = generateIdAssignments(groups);
  
  printSummary(groups, assignments);
  
  console.log(`\n\n=== Mode: ${dryRun ? 'DRY RUN (preview only)' : 'APPLY CHANGES'} ===\n`);
  
  const { updated, skipped } = await updateFiles(assignments, dryRun);
  
  console.log(`\n${dryRun ? 'Would update' : 'Updated'}: ${updated} files`);
  console.log(`Skipped (already correct): ${skipped} files`);
  
  if (dryRun && updated > 0) {
    console.log('\nTo apply changes, run:');
    console.log('  node scripts/generate-filament-ids-sequential.mjs --apply');
  }
}

await main();
