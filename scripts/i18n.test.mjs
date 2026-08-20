import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

var source = readFileSync(new URL('../i18n.js', import.meta.url), 'utf8');
var html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
var languages = ['en', 'zh', 'de', 'it', 'fr', 'es'];

function translationKeys(language) {
  var start = source.indexOf('    ' + language + ': {');
  var next = languages.indexOf(language) + 1;
  var end = next < languages.length
    ? source.indexOf('\n\n    ' + languages[next] + ': {', start)
    : source.indexOf('\n    }\n  };', start);
  assert.ok(start >= 0 && end > start, 'missing ' + language + ' translation block');
  return Array.from(source.slice(start, end).matchAll(/^      '([^']+)':/gm), function (match) { return match[1]; }).sort();
}

function detectLanguage(locale) {
  var context = {
    navigator: { language: locale },
    document: {
      querySelectorAll: function () { return []; },
      getElementById: function () { return null; },
      documentElement: { setAttribute: function () {} },
      dispatchEvent: function () {}
    },
    CustomEvent: function () {}
  };
  vm.runInNewContext(source, context);
  return context.I18N.detectLang();
}

describe('i18n', function () {
  it('keeps every language in sync with English', function () {
    var englishKeys = translationKeys('en');
    languages.slice(1).forEach(function (language) {
      assert.deepStrictEqual(translationKeys(language), englishKeys);
    });
  });

  it('detects supported browser languages and exposes each switcher option', function () {
    assert.deepStrictEqual(
      ['en-US', 'zh-CN', 'de-DE', 'de_DE', 'it-IT', 'fr-FR', 'es-ES', 'pt-BR'].map(detectLanguage),
      ['en', 'zh', 'de', 'de', 'it', 'fr', 'es', 'en']
    );
    languages.forEach(function (language) {
      assert.match(html, new RegExp('class="lang-option" data-lang="' + language + '"'));
    });
  });
});
