import { describe, it } from 'node:test';
import assert from 'node:assert';
import { injectSeo } from './generate-seo.mjs';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Polymaker Filament Presets</title>
  <!-- SEO-JSONLD:START -->
  <!-- SEO-JSONLD:END -->
</head>
<body>
  <!-- SEO-CONTENT:START -->
  <!-- SEO-CONTENT:END -->
  <footer></footer>
</body>
</html>`;

const SAMPLE_DATA = {
  materials: ['PolyLite PETG', 'PolyLite PLA', 'Fiberon ASA-CF08'],
  brands: ['BBL', 'Prusa'],
  models: ['X1C', 'Core One'],
  slicers: ['BambuStudio', 'OrcaSlicer', 'Orcaslicer', 'PrusaSlicer'],
  presets: [
    { material: 'PolyLite PETG', brand: 'BBL', model: 'X1C', slicer: 'BambuStudio' },
    { material: 'PolyLite PLA', brand: 'BBL', model: 'X1C', slicer: 'OrcaSlicer' },
    { material: 'Fiberon ASA-CF08', brand: 'Prusa', model: 'Core One', slicer: 'PrusaSlicer' },
  ],
};

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1])
  );
}

describe('injectSeo', () => {
  it('renders material names as static HTML text (not only JS)', () => {
    const out = injectSeo(SAMPLE_HTML, SAMPLE_DATA);
    const visible = out.slice(
      out.indexOf('<!-- SEO-CONTENT:START'),
      out.indexOf('<!-- SEO-CONTENT:END')
    );
    assert.match(visible, /PolyLite PETG/);
    assert.match(visible, /Fiberon ASA-CF08/);
  });

  it('renders human-readable printer names, including ones without metadata', () => {
    const out = injectSeo(SAMPLE_HTML, SAMPLE_DATA);
    assert.match(out, /Bambu Lab X1 Carbon/);
    assert.match(out, /Prusa Core One/);
  });

  it('normalizes duplicate-cased slicers (OrcaSlicer/Orcaslicer)', () => {
    const out = injectSeo(SAMPLE_HTML, SAMPLE_DATA);
    const count = (out.match(/OrcaSlicer/g) || []).length;
    const badCase = (out.match(/Orcaslicer/g) || []).length;
    assert.equal(badCase, 0, 'lowercased variant should be normalized away');
    assert.ok(count >= 1);
  });

  it('emits valid ItemList and FAQPage JSON-LD', () => {
    const out = injectSeo(SAMPLE_HTML, SAMPLE_DATA);
    const blocks = jsonLdBlocks(out);
    const itemList = blocks.find((b) => b['@type'] === 'ItemList');
    const faq = blocks.find((b) => b['@type'] === 'FAQPage');
    assert.ok(itemList, 'ItemList present');
    assert.ok(faq, 'FAQPage present');
    assert.equal(itemList.numberOfItems, itemList.itemListElement.length);
    assert.equal(itemList.itemListElement.length, 3);
    assert.match(itemList.itemListElement[0].item.name, /Polymaker .* preset for .* \(.*\)/);
    assert.ok(faq.mainEntity.length >= 1);
    assert.ok(faq.mainEntity[0].acceptedAnswer.text.length > 0);
  });

  it('is idempotent', () => {
    const once = injectSeo(SAMPLE_HTML, SAMPLE_DATA);
    const twice = injectSeo(once, SAMPLE_DATA);
    assert.equal(once, twice);
  });

  it('throws when a marker is missing', () => {
    assert.throws(() => injectSeo('<html></html>', SAMPLE_DATA));
  });
});
