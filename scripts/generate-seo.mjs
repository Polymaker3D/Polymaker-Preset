// generate-seo.mjs — Injects crawlable SEO/GEO content into index.html.
//
// Most of this page's substance (the preset table) is rendered client-side from
// index.json, so non-rendering crawlers and LLM scrapers see an empty shell. This
// script reads index.json and writes two things into index.html, between marker
// comments, so the catalog exists in the static HTML:
//
//   1. A visible "About these presets" section: keyword-rich body copy plus a
//      static catalog of materials, printers, slicers, and an FAQ.
//   2. JSON-LD structured data: an ItemList of every material x printer x slicer
//      preset combination, and an FAQPage mirroring the visible FAQ.
//
// Run after generate-index-json.mjs. Re-running is idempotent.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const INDEX_JSON_PATH = path.join(REPO_ROOT, 'index.json');
const INDEX_HTML_PATH = path.join(REPO_ROOT, 'index.html');
const SITE_URL = 'https://presets.polymaker.com/';

// Folder/slicer codes -> human-readable, keyword-friendly display names.
const BRAND_DISPLAY = {
  BBL: 'Bambu Lab',
  Anycubic: 'Anycubic',
  Elegoo: 'Elegoo',
  Prusa: 'Prusa',
  Snapmaker: 'Snapmaker',
};

const MODEL_DISPLAY = {
  A1: 'A1',
  A1M: 'A1 mini',
  CC2: 'Centauri Carbon 2',
  'Core One': 'Core One',
  H2C: 'H2C',
  H2D: 'H2D',
  H2S: 'H2S',
  'Kobra S1': 'Kobra S1',
  P1P: 'P1P',
  P1S: 'P1S',
  P2S: 'P2S',
  U1: 'U1',
  X1: 'X1',
  X1C: 'X1 Carbon',
  X1E: 'X1E',
  X2D: 'X2D',
};

const SLICER_DISPLAY = {
  bambustudio: 'Bambu Studio',
  orcaslicer: 'OrcaSlicer',
  elegooslicer: 'ElegooSlicer',
  prusaslicer: 'PrusaSlicer',
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function brandDisplay(brand) {
  return BRAND_DISPLAY[brand] || brand;
}

function modelDisplay(model) {
  return MODEL_DISPLAY[model] || model;
}

function slicerDisplay(slicer) {
  return SLICER_DISPLAY[slicer.toLowerCase()] || slicer;
}

function printerDisplay(brand, model) {
  return `${brandDisplay(brand)} ${modelDisplay(model)}`.trim();
}

// Build the FAQ. Questions/answers mirror the on-page install instructions and
// "Known Issues" content so the FAQPage structured data stays truthful and the
// visible <dl> below satisfies Google's "answer must be visible" requirement.
function buildFaq(data) {
  const slicerNames = uniqueSlicerNames(data).join(', ');
  const brandNames = data.brands.map(brandDisplay).join(', ');
  return [
    {
      q: 'How do I install Polymaker filament presets in Bambu Studio?',
      a: `Select Bambu Studio on this page, choose your printer and material, then download the preset as a .bbsflmt bundle or as individual JSON files. Import the file in Bambu Studio's filament settings, then restart Bambu Studio before slicing.`,
    },
    {
      q: 'How do I add Polymaker presets to OrcaSlicer or ElegooSlicer?',
      a: `Select OrcaSlicer or ElegooSlicer on this page, download the preset file for your printer and material, then import it through the filament preset menu in the slicer.`,
    },
    {
      q: 'Do I need to restart Bambu Studio after importing a preset?',
      a: `Yes. Bambu Studio may not apply a newly imported filament preset until it is restarted. Restart Bambu Studio before slicing or printing, otherwise incorrect temperature, flow rate, or other filament settings may be used.`,
    },
    {
      q: 'Why don’t the AMS temperatures populate after importing into Bambu Studio?',
      a: `Download presets using the JSON or .bbsflmt buttons on this page rather than copying raw JSON from GitHub. The download rewrites the preset name to the full printer preset name (for example "Bambu Lab X1 Carbon 0.4 nozzle"), so AMS slot temperature and filament type populate correctly.`,
    },
    {
      q: 'Which slicers and printers do Polymaker presets support?',
      a: `Presets are available for ${slicerNames}, covering ${brandNames} printers. Use the filters on this page to find the preset for your exact printer model and material.`,
    },
  ];
}

function uniqueSlicerNames(data) {
  const seen = new Set();
  const out = [];
  for (const s of data.slicers) {
    const display = slicerDisplay(s);
    const key = display.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(display);
  }
  return out;
}

// Unique "Brand Model" printers, derived from preset folder structure so that
// printers without compatible_printers metadata (e.g. PrusaSlicer .ini presets)
// are still represented.
function uniquePrinters(data) {
  const seen = new Set();
  const out = [];
  for (const p of data.presets) {
    const key = `${p.brand}|${p.model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ brand: p.brand, model: p.model, display: printerDisplay(p.brand, p.model) });
  }
  out.sort((a, b) => a.display.localeCompare(b.display));
  return out;
}

// Group materials by family (first word) for readable, structured body copy.
function groupMaterialsByFamily(materials) {
  const groups = new Map();
  for (const m of materials) {
    const family = m.split(' ')[0];
    if (!groups.has(family)) groups.set(family, []);
    groups.get(family).push(m);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function buildVisibleSection(data, faq) {
  const slicerNames = uniqueSlicerNames(data);
  const printers = uniquePrinters(data);
  const families = groupMaterialsByFamily(data.materials);
  const presetCount = data.presets.length;
  const materialCount = data.materials.length;

  const materialItems = families
    .map(([family, items]) => {
      const list = items.map(escapeHtml).join(', ');
      return `        <li><strong>${escapeHtml(family)}:</strong> ${list}</li>`;
    })
    .join('\n');

  const printerItems = printers
    .map((p) => `        <li>${escapeHtml(p.display)}</li>`)
    .join('\n');

  const faqItems = faq
    .map(
      (f) =>
        `        <div class="seo-faq-item">\n` +
        `          <dt>${escapeHtml(f.q)}</dt>\n` +
        `          <dd>${escapeHtml(f.a)}</dd>\n` +
        `        </div>`
    )
    .join('\n');

  // Wrapped in <noscript> so users (who always have JS enabled — the preset
  // table requires it) see no UI change, while non-rendering crawlers and AI
  // scrapers still receive the catalog text in the static HTML.
  return `    <noscript>
    <section class="card seo-content" id="about-presets" aria-labelledby="about-presets-title">
      <h2 id="about-presets-title" class="seo-content-title">Polymaker filament presets for Bambu Studio, OrcaSlicer, ElegooSlicer &amp; PrusaSlicer</h2>
      <p>Download free, official Polymaker print profiles and 3D printing filament presets. This page provides ${presetCount} ready-to-use presets covering ${materialCount} Polymaker materials, tuned for ${slicerNames.join(', ')}. Each preset sets the recommended nozzle and bed temperature, flow rate, cooling, and other parameters so your Polymaker filament prints correctly on the first try.</p>
      <p>Presets are organized by slicer, material, printer brand, and printer model. Whether you need a PolyLite PETG preset for the Bambu Lab X1 Carbon, a Fiberon ASA-CF preset for Bambu Studio, or a PolyTerra PLA profile for OrcaSlicer, use the filters above to download the exact preset file for your printer.</p>

      <h3 class="seo-section-title">Materials with presets</h3>
      <ul class="seo-material-list">
${materialItems}
      </ul>

      <h3 class="seo-section-title">Supported printers</h3>
      <ul class="seo-printer-list">
${printerItems}
      </ul>

      <h3 class="seo-section-title">Supported slicers</h3>
      <p>${slicerNames.map(escapeHtml).join(', ')}.</p>

      <h3 class="seo-section-title" id="faq">Frequently asked questions</h3>
      <dl class="seo-faq">
${faqItems}
      </dl>
    </section>
    </noscript>`;
}

function buildItemListJsonLd(data) {
  const seen = new Set();
  const items = [];
  for (const p of data.presets) {
    const name = `Polymaker ${p.material} filament preset for ${printerDisplay(p.brand, p.model)} (${slicerDisplay(p.slicer)})`;
    if (seen.has(name)) continue;
    seen.add(name);
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      item: {
        '@type': 'Product',
        name,
        brand: { '@type': 'Brand', name: 'Polymaker' },
        category: p.material,
        url: SITE_URL,
      },
    });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Polymaker filament presets',
    description:
      'Official Polymaker 3D printing filament presets by material, printer, and slicer for Bambu Studio, OrcaSlicer, ElegooSlicer, and PrusaSlicer.',
    numberOfItems: items.length,
    itemListElement: items,
  };
}

function buildFaqJsonLd(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function buildJsonLdBlock(data, faq) {
  const itemList = buildItemListJsonLd(data);
  const faqPage = buildFaqJsonLd(faq);
  return (
    `  <script type="application/ld+json">\n` +
    `${JSON.stringify(itemList, null, 2)}\n` +
    `  </script>\n` +
    `  <script type="application/ld+json">\n` +
    `${JSON.stringify(faqPage, null, 2)}\n` +
    `  </script>`
  );
}

function replaceBetweenMarkers(html, startMarkerPrefix, endMarker, replacement) {
  const startIdx = html.indexOf(startMarkerPrefix);
  if (startIdx === -1) {
    throw new Error(`Missing start marker beginning with: ${startMarkerPrefix}`);
  }
  // The start marker comment may carry trailing text; find the end of its line.
  const startLineEnd = html.indexOf('\n', startIdx);
  const endIdx = html.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    throw new Error(`Missing end marker: ${endMarker}`);
  }
  return (
    html.slice(0, startLineEnd + 1) +
    replacement +
    '\n  ' +
    html.slice(endIdx)
  );
}

export function injectSeo(html, data) {
  const faq = buildFaq(data);
  const visible = buildVisibleSection(data, faq);
  const jsonLd = buildJsonLdBlock(data, faq);

  let out = replaceBetweenMarkers(
    html,
    '<!-- SEO-CONTENT:START',
    '<!-- SEO-CONTENT:END -->',
    visible
  );
  out = replaceBetweenMarkers(
    out,
    '<!-- SEO-JSONLD:START',
    '<!-- SEO-JSONLD:END -->',
    jsonLd
  );
  return out;
}

async function main() {
  const data = JSON.parse(await fs.readFile(INDEX_JSON_PATH, 'utf8'));
  const html = await fs.readFile(INDEX_HTML_PATH, 'utf8');
  const next = injectSeo(html, data);
  if (next === html) {
    console.log('index.html SEO content unchanged.');
    return;
  }
  await fs.writeFile(INDEX_HTML_PATH, next, 'utf8');
  console.log(
    `Injected SEO content: ${data.presets.length} presets, ${data.materials.length} materials.`
  );
}

// Only run when executed directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
