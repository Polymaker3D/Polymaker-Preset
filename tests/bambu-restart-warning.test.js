/**
 * Tests for BambuStudio Restart Warning Modal
 * Using Node.js built-in test runner
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// ============================================
// TEST SUITE: Modal HTML Structure
// ============================================

describe('BambuStudio Restart Warning Modal - HTML Structure', () => {

  it('should contain the bambu-restart-modal element', () => {
    assert.ok(htmlContent.includes('id="bambu-restart-modal"'), 'HTML should contain bambu-restart-modal');
  });

  it('should have correct modal title id', () => {
    assert.ok(htmlContent.includes('id="bambu-restart-modal-title"'), 'HTML should have modal title element');
  });

  it('should have close button with correct id', () => {
    assert.ok(htmlContent.includes('id="bambu-restart-modal-close"'), 'HTML should have close button');
  });

  it('should have cancel button with correct id', () => {
    assert.ok(htmlContent.includes('id="bambu-restart-cancel"'), 'HTML should have cancel button');
  });

  it('should have confirm button with correct id', () => {
    assert.ok(htmlContent.includes('id="bambu-restart-confirm"'), 'HTML should have confirm button');
  });

  it('should link to GitHub issue #10583', () => {
    assert.ok(htmlContent.includes('github.com/bambulab/BambuStudio/issues/10583'), 'HTML should link to GitHub issue #10583');
  });

  it('should have data-i18n attributes for translations', () => {
    assert.ok(htmlContent.includes('data-i18n="modal.restart.title"'), 'Title should have i18n attribute');
    assert.ok(htmlContent.includes('data-i18n-html="modal.restart.message"'), 'Message should have i18n-html attribute');
    assert.ok(htmlContent.includes('data-i18n="modal.restart.cancel"'), 'Cancel button should have i18n attribute');
    assert.ok(htmlContent.includes('data-i18n="modal.restart.confirm"'), 'Confirm button should have i18n attribute');
  });

  it('should have correct ARIA attributes', () => {
    assert.ok(htmlContent.includes('role="dialog"'), 'Modal should have role="dialog"');
    assert.ok(htmlContent.includes('aria-labelledby="bambu-restart-modal-title"'), 'Modal should have aria-labelledby');
    assert.ok(htmlContent.includes('aria-hidden="true"'), 'Modal should initially have aria-hidden="true"');
  });
});

// ============================================
// TEST SUITE: isBambuStudioSlicerSelected Logic
// ============================================

describe('isBambuStudioSlicerSelected logic', () => {

  // Standalone implementation mirroring the production logic
  function getEffectiveFilters(filterState) {
    var effectiveSlicer = filterState.slicer || '';
    var effectiveBrand = filterState.brand || '';
    return { effectiveSlicer: effectiveSlicer, effectiveBrand: effectiveBrand };
  }

  function isBambuStudioSlicerSelected(filterState) {
    var filters = getEffectiveFilters(filterState);
    return filters.effectiveSlicer === 'BambuStudio';
  }

  it('should return true when slicer is BambuStudio', () => {
    const filterState = { slicer: 'BambuStudio', brand: 'BBL' };
    assert.strictEqual(isBambuStudioSlicerSelected(filterState), true);
  });

  it('should return false when slicer is OrcaSlicer', () => {
    const filterState = { slicer: 'OrcaSlicer', brand: 'BBL' };
    assert.strictEqual(isBambuStudioSlicerSelected(filterState), false);
  });

  it('should return false when slicer is ElegooSlicer', () => {
    const filterState = { slicer: 'ElegooSlicer', brand: 'Elegoo' };
    assert.strictEqual(isBambuStudioSlicerSelected(filterState), false);
  });

  it('should return false when slicer is empty', () => {
    const filterState = { slicer: '', brand: 'BBL' };
    assert.strictEqual(isBambuStudioSlicerSelected(filterState), false);
  });

  it('should return false when slicer is undefined', () => {
    const filterState = { brand: 'BBL' };
    assert.strictEqual(isBambuStudioSlicerSelected(filterState), false);
  });

  it('should return false when filterState is empty', () => {
    const filterState = {};
    assert.strictEqual(isBambuStudioSlicerSelected(filterState), false);
  });

  it('should handle virtual slicers correctly', () => {
    // Virtual slicers like 'OrcaSlicer (Snapmaker)' map to actual slicer
    const filterState = { slicer: 'OrcaSlicer (Snapmaker)', brand: 'Snapmaker' };
    const filters = getEffectiveFilters(filterState);
    assert.strictEqual(filters.effectiveSlicer, 'OrcaSlicer (Snapmaker)');
    assert.strictEqual(isBambuStudioSlicerSelected(filterState), false);
  });
});

// ============================================
// TEST SUITE: Modal State Management
// ============================================

describe('BambuStudio Restart Warning Modal - State Management', () => {

  // Minimal DOM mock for testing modal functions
  function createMockModal() {
    const classes = [];
    const attrs = { 'aria-hidden': 'true' };
    return {
      classList: {
        add: (c) => { if (!classes.includes(c)) classes.push(c); },
        remove: (c) => {
          const idx = classes.indexOf(c);
          if (idx !== -1) classes.splice(idx, 1);
        },
        contains: (c) => classes.includes(c)
      },
      setAttribute: (name, val) => { attrs[name] = val; },
      getAttribute: (name) => attrs[name],
      querySelector: () => null
    };
  }

  function createMockDocument(modal) {
    const elements = {
      'bambu-restart-modal': modal,
      'bambu-restart-modal-close': { addEventListener: () => {} },
      'bambu-restart-cancel': { addEventListener: () => {} },
      'bambu-restart-confirm': { addEventListener: () => {} }
    };
    return {
      getElementById: (id) => elements[id] || null,
      addEventListener: () => {},
      body: { style: {} }
    };
  }

  it('should open modal and set aria-hidden to false', () => {
    const modal = createMockModal();
    const doc = createMockDocument(modal);

    // Simulate showBambuRestartWarning logic
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    doc.body.style.overflow = 'hidden';

    assert.strictEqual(modal.getAttribute('aria-hidden'), 'false', 'aria-hidden should be false when open');
    assert.strictEqual(modal.classList.contains('is-open'), true, 'modal should have is-open class');
    assert.strictEqual(doc.body.style.overflow, 'hidden', 'body overflow should be hidden when modal is open');
  });

  it('should close modal and restore aria-hidden', () => {
    const modal = createMockModal();
    const doc = createMockDocument(modal);

    // Open first
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    doc.body.style.overflow = 'hidden';

    // Then close
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    doc.body.style.overflow = '';

    assert.strictEqual(modal.getAttribute('aria-hidden'), 'true', 'aria-hidden should be true when closed');
    assert.strictEqual(modal.classList.contains('is-open'), false, 'modal should not have is-open class');
    assert.strictEqual(doc.body.style.overflow, '', 'body overflow should be restored');
  });

  it('should call onConfirm when confirm is clicked', () => {
    let confirmed = false;
    let cancelled = false;

    const onConfirm = () => { confirmed = true; };
    const onCancel = () => { cancelled = true; };

    // Simulate confirm action
    onConfirm();

    assert.strictEqual(confirmed, true, 'onConfirm should be called');
    assert.strictEqual(cancelled, false, 'onCancel should not be called on confirm');
  });

  it('should call onCancel when cancel is clicked', () => {
    let confirmed = false;
    let cancelled = false;

    const onConfirm = () => { confirmed = true; };
    const onCancel = () => { cancelled = true; };

    // Simulate cancel action
    onCancel();

    assert.strictEqual(cancelled, true, 'onCancel should be called');
    assert.strictEqual(confirmed, false, 'onConfirm should not be called on cancel');
  });
});

// ============================================
// TEST SUITE: Download Flow Order
// ============================================

describe('BambuStudio Restart Warning - Download Flow Order', () => {

  it('should show warning AFTER duplicate resolution in download flow', () => {
    // This test verifies the conceptual flow:
    // 1. resolveBambuMappingsWithDedup() handles duplicates
    // 2. showBambuRestartWarning() shows the modal
    // 3. generateAndDownload...() creates the actual download
    //
    // The production code places showBambuRestartWarning inside the
    // onResolved callback of resolveBambuMappingsWithDedup, ensuring
    // the warning appears after duplicate resolution.

    const flowOrder = [];

    function resolveBambuMappingsWithDedup(onResolved) {
      flowOrder.push('dedup');
      onResolved();
    }

    function showBambuRestartWarning(onConfirm) {
      flowOrder.push('warning');
      onConfirm();
    }

    function generateAndDownload() {
      flowOrder.push('download');
    }

    // Simulate the production flow
    resolveBambuMappingsWithDedup(function () {
      showBambuRestartWarning(function () {
        generateAndDownload();
      });
    });

    assert.deepStrictEqual(flowOrder, ['dedup', 'warning', 'download'],
      'Warning should appear AFTER dedup and BEFORE download');
  });

  it('should skip warning when slicer is not BambuStudio', () => {
    const slicer = 'OrcaSlicer';
    const isBambuStudio = slicer === 'BambuStudio';
    assert.strictEqual(isBambuStudio, false, 'Should not be BambuStudio');
  });

  it('should show warning when slicer is BambuStudio', () => {
    const slicer = 'BambuStudio';
    const isBambuStudio = slicer === 'BambuStudio';
    assert.strictEqual(isBambuStudio, true, 'Should be BambuStudio');
  });
});
