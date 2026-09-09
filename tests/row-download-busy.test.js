import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const appContent = fs.readFileSync(path.join(root, 'app.js'), 'utf-8');
const styleContent = fs.readFileSync(path.join(root, 'style.css'), 'utf-8');

describe('Row download busy state', () => {
  it('exposes helpers that mark a row download button busy', () => {
    assert.ok(appContent.includes('function setRowDownloadBusy(link, busy)'));
    assert.ok(appContent.includes('function isRowDownloadBusy(link)'));
    assert.ok(appContent.includes("link.classList.add('is-busy')"));
    assert.ok(appContent.includes("link.setAttribute('aria-busy', 'true')"));
  });

  it('guards every async row download against a repeat click', () => {
    assert.ok(appContent.includes('if (isRowDownloadBusy(directJsonLink)) return;'));
    assert.ok(appContent.includes('if (isRowDownloadBusy(bambuJsonLink)) return;'));
    assert.ok(appContent.includes('if (isRowDownloadBusy(bundleLink)) return;'));
  });

  it('clears the busy state on both success and failure', () => {
    ['directJsonLink', 'bambuJsonLink', 'bundleLink'].forEach((link) => {
      assert.ok(appContent.includes('setRowDownloadBusy(' + link + ', true)'));
      const cleared = appContent.split('setRowDownloadBusy(' + link + ', false)').length - 1;
      assert.ok(cleared >= 2, link + ' must clear busy on success and on error');
    });
  });

  it('styles the busy state in a theme-neutral way', () => {
    assert.ok(styleContent.includes('.btn-download.is-busy'));
    assert.ok(styleContent.includes('.btn-bundle.is-busy'));
    assert.ok(styleContent.includes('@keyframes row-download-spin'));
    assert.ok(styleContent.includes('prefers-reduced-motion'));
  });
});
