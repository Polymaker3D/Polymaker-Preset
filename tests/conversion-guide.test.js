import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const htmlContent = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');
const appContent = fs.readFileSync(path.join(root, 'app.js'), 'utf-8');
const i18nContent = fs.readFileSync(path.join(root, 'i18n.js'), 'utf-8');

describe('Preset conversion guide', () => {
  it('adds a translated conversion notice to the slicer card', () => {
    assert.ok(htmlContent.includes('class="slicer-notice"'));
    assert.ok(htmlContent.includes('data-i18n="filter.slicer.notice"'));
    assert.ok(htmlContent.includes('id="conversion-guide-btn"'));
    assert.ok(htmlContent.includes('data-i18n="filter.slicer.guide"'));
  });

  it('provides an accessible translated conversion popup', () => {
    assert.ok(htmlContent.includes('id="conversion-guide-modal"'));
    assert.ok(htmlContent.includes('aria-labelledby="conversion-guide-modal-title"'));
    assert.ok(htmlContent.includes('aria-modal="true"'));
    assert.ok(htmlContent.includes('data-i18n="modal.convert.title"'));
    assert.ok(htmlContent.includes('data-i18n="modal.convert.warning"'));
    assert.ok(htmlContent.includes('data-i18n="modal.convert.intro"'));
    assert.ok(htmlContent.includes('data-i18n-steps="modal.convert.steps"'));
  });

  it('wires the conversion popup to the shared modal interaction pattern', () => {
    assert.ok(appContent.includes('function initConversionModal()'));
    assert.ok(appContent.includes("document.getElementById('conversion-guide-btn')"));
    assert.ok(appContent.includes("document.getElementById('conversion-guide-modal')"));
    assert.ok(appContent.includes('initConversionModal();'));
  });

  it('includes English and Chinese copy', () => {
    assert.strictEqual(i18nContent.split("'filter.slicer.notice':").length - 1, 2);
    assert.strictEqual(i18nContent.split("'modal.convert.steps':").length - 1, 2);
  });

  it('renders every Feishu guide screenshot from local assets', () => {
    const assetsDir = path.join(root, 'assets', 'conversion-guide');
    const imageNames = fs.readdirSync(assetsDir).filter(function (name) {
      return name.endsWith('.png');
    });

    assert.strictEqual(imageNames.length, 14);
    assert.strictEqual(i18nContent.split('class="conversion-step-image"').length - 1, 14);

    imageNames.forEach(function (name) {
      assert.ok(fs.statSync(path.join(assetsDir, name)).size > 0, `${name} should not be empty`);
      assert.ok(i18nContent.includes(`assets/conversion-guide/${name}`), `${name} should be used by the guide`);
    });
  });
});
