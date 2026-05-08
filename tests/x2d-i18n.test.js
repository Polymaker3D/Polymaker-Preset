import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '..', 'index.html');
const appPath = path.join(__dirname, '..', 'app.js');
const i18nPath = path.join(__dirname, '..', 'i18n.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const i18nContent = fs.readFileSync(i18nPath, 'utf-8');

describe('X2D progress i18n wiring', () => {
  it('should mark static X2D labels with translation attributes', () => {
    assert.ok(htmlContent.includes('data-i18n="x2d.kicker"'), 'X2D kicker should use data-i18n');
    assert.ok(htmlContent.includes('data-i18n="x2d.meta.loading"'), 'X2D loading text should use data-i18n');
    assert.ok(htmlContent.includes('data-i18n="x2d.score.label"'), 'X2D score label should use data-i18n');
    assert.ok(htmlContent.includes('data-i18n="x2d.metric.completed"'), 'Completed metric label should use data-i18n');
    assert.ok(htmlContent.includes('data-i18n="x2d.metric.remaining"'), 'Remaining metric label should use data-i18n');
    assert.ok(htmlContent.includes('data-i18n="x2d.metric.deadline"'), 'Deadline metric label should use data-i18n');
    assert.ok(htmlContent.includes('data-i18n="x2d.metric.timeline"'), 'Timeline metric label should use data-i18n');
  });

  it('should define X2D translation keys in both English and Chinese dictionaries', () => {
    var requiredKeys = [
      'x2d.kicker',
      'x2d.meta.loading',
      'x2d.meta.error',
      'x2d.score.label',
      'x2d.metric.completed',
      'x2d.metric.remaining',
      'x2d.metric.deadline',
      'x2d.metric.timeline',
      'x2d.title.fallback',
      'x2d.goal.fallback',
      'x2d.scope',
      'x2d.status.incompatible',
      'x2d.status.done',
      'x2d.status.pending',
      'x2d.value.unknown.product'
    ];

    requiredKeys.forEach(function (key) {
      assert.ok(i18nContent.includes("'" + key + "':"), 'Missing translation key: ' + key);
    });
  });

  it('should use translation lookups for X2D dynamic text in app.js', () => {
    assert.match(appContent, /t\('x2d\.status\.incompatible'\)/, 'Checklist should translate the incompatible label');
    assert.match(appContent, /t\('x2d\.status\.done'\)/, 'Checklist should translate the done label');
    assert.match(appContent, /t\('x2d\.status\.pending'\)/, 'Checklist should translate the pending label');
    assert.match(appContent, /t\('x2d\.scope', \{ n: totalCount \}\)/, 'Scope label should be translated');
    assert.match(appContent, /t\('x2d\.title\.fallback'\)/, 'Title fallback should be translated');
    assert.match(appContent, /t\('x2d\.goal\.fallback'\)/, 'Goal text should be translated');
    assert.match(appContent, /t\('x2d\.meta\.error'\)/, 'Error text should be translated');
  });

  it('should rerender X2D progress when the language changes', () => {
    assert.match(appContent, /document\.addEventListener\('langchange', function \(\) \{[\s\S]*renderX2DProgress\(x2dProgressData\)/, 'X2D progress should rerender on langchange');
  });
});
