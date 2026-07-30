import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '..', 'index.html');
const stylePath = path.join(__dirname, '..', 'style.css');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const styleContent = fs.readFileSync(stylePath, 'utf-8');

function extractSection(className) {
  const openingTag = `<section class="${className}">`;
  const start = htmlContent.indexOf(openingTag);

  assert.notStrictEqual(start, -1, `${className} should exist`);

  const end = htmlContent.indexOf('</section>', start);
  assert.notStrictEqual(end, -1, `${className} should have a closing tag`);

  return htmlContent.slice(start, end + '</section>'.length);
}

function countOccurrences(content, value) {
  return content.split(value).length - 1;
}

describe('Resolved Issues group', () => {
  it('keeps resolved history collapsed inside Known Issues', () => {
    const knownIssues = extractSection('known-issues-section');
    const resolvedGroupMarker = '<div class="accordion-item resolved-issues-group is-collapsed">';
    const resolvedGroupStart = knownIssues.indexOf(resolvedGroupMarker);

    assert.ok(
      !htmlContent.includes('<section class="resolved-issues-section">'),
      'Resolved Issues should not be a standalone section'
    );
    assert.notStrictEqual(resolvedGroupStart, -1, 'Known Issues should contain the resolved group');

    const activeIssues = knownIssues.slice(0, resolvedGroupStart);
    const resolvedGroup = knownIssues.slice(resolvedGroupStart);
    const resolvedHeaderPattern = /<div class="accordion-item resolved-issues-group is-collapsed">\s*<button class="accordion-header" type="button" aria-expanded="false">\s*<span class="accordion-title" data-i18n="issues\.resolved\.title">Resolved Issues<\/span>/;
    const resolvedKeys = [
      'data-i18n="issues.restart.title"',
      'data-i18n-html="issues.restart.issue"',
      'data-i18n-html="issues.restart.solution"',
      'github.com/bambulab/BambuStudio/issues/10583'
    ];
    const activeTitleKeys = [
      'data-i18n="issues.import.title"',
      'data-i18n="issues.p2s.title"',
      'data-i18n="issues.aux.title"'
    ];

    assert.match(resolvedGroup, resolvedHeaderPattern, 'The resolved group header should initially be collapsed');

    resolvedKeys.forEach(function (key) {
      assert.strictEqual(countOccurrences(resolvedGroup, key), 1, `${key} should appear once in the resolved group`);
    });

    activeTitleKeys.forEach(function (key) {
      assert.strictEqual(countOccurrences(activeIssues, key), 1, `${key} should remain an active issue`);
      assert.strictEqual(countOccurrences(resolvedGroup, key), 0, `${key} should remain outside the resolved group`);
    });
  });

  it('distinguishes resolved history without a padded header background', () => {
    assert.match(
      styleContent,
      /\.resolved-issues-group\s*{[^}]*border:\s*none;[^}]*border-top:\s*1px solid var\(--border\);[^}]*border-radius:\s*0;/s,
      'Resolved Issues should use a divider instead of an active-issue container'
    );
    assert.match(
      styleContent,
      /\.resolved-issues-group\s*>\s*\.accordion-header\s*{[^}]*padding:\s*0;[^}]*background:\s*transparent;[^}]*color:\s*var\(--text-muted\);/s,
      'Resolved Issues header should have no padding or background and use muted text'
    );
    assert.match(
      styleContent,
      /\.known-issues-section\s*{[^}]*padding:\s*0\.75rem;[^}]*padding-bottom:\s*0;/s,
      'Known Issues should not add separate space below the resolved header'
    );
    assert.match(
      styleContent,
      /\.resolved-issues-group\s*>\s*\.accordion-header\s*{[^}]*min-height:\s*1\.5rem;/s,
      'Resolved Issues should vertically center its label and arrow without padding'
    );
    assert.match(
      styleContent,
      /\.resolved-issues-group\s+\.accordion-title\s*{[^}]*flex:\s*0 1 auto;/s,
      'Resolved Issues should keep its disclosure arrow beside the label'
    );
  });
});
