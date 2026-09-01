import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '..', 'index.html');
const stylePath = path.join(__dirname, '..', 'style.css');
const appPath = path.join(__dirname, '..', 'app.js');
const i18nPath = path.join(__dirname, '..', 'i18n.js');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const styleContent = fs.readFileSync(stylePath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const i18nContent = fs.readFileSync(i18nPath, 'utf-8');

describe('LayerHub banner HTML', () => {
  it('places the banner between hero and slicer card', () => {
    var heroEnd = htmlContent.indexOf('</header>');
    var banner = htmlContent.indexOf('id="layerhub-banner"');
    var slicer = htmlContent.indexOf('id="slicer-card"');
    assert.ok(heroEnd !== -1 && banner !== -1 && slicer !== -1);
    assert.ok(heroEnd < banner && banner < slicer);
  });

  it('is a CTA link to the official LayerHub site', () => {
    var bannerStart = htmlContent.indexOf('id="layerhub-banner"');
    var bannerEnd = htmlContent.indexOf('id="slicer-card"');
    var bannerHtml = htmlContent.slice(bannerStart, bannerEnd);
    assert.ok(bannerHtml.includes('id="layerhub-banner-cta"'));
    assert.ok(bannerHtml.includes('href="https://www.layerhub3d.com"'));
    assert.ok(bannerHtml.includes('target="_blank"'));
    assert.ok(bannerHtml.includes('rel="noopener noreferrer"'));
    assert.ok(bannerHtml.includes('data-i18n="banner.title"'));
    assert.ok(bannerHtml.includes('data-i18n="banner.title.line2"'));
    assert.ok(bannerHtml.includes('data-i18n-html="banner.subtitle"'));
    assert.ok(bannerHtml.includes('data-i18n="banner.submit"'));
    assert.ok(bannerHtml.includes('Explore Now'));
    assert.ok(!bannerHtml.includes('id="layerhub-banner-form"'));
    assert.ok(!bannerHtml.includes('id="layerhub-banner-email"'));
    assert.ok(!bannerHtml.includes('id="layerhub-banner-honeypot"'));
    assert.ok(!bannerHtml.includes('id="layerhub-banner-status"'));
    assert.ok(!bannerHtml.includes('data-subscribe-url='));
    assert.ok(!bannerHtml.includes('data-i18n="banner.email.placeholder"'));
    assert.ok(!bannerHtml.includes('data-i18n="banner.privacy"'));
    assert.ok(!bannerHtml.includes('icon-mail.svg'));
    assert.ok(!bannerHtml.includes('<form'));
    assert.ok(!bannerHtml.includes('<input'));
  });

  it('uses exported decorative assets, not inline SVG paths', () => {
    assert.ok(htmlContent.includes('assets/banner/banner-art-dark.jpg'));
    assert.ok(htmlContent.includes('assets/banner/banner-art-wiki.jpg'));
    assert.ok(htmlContent.includes('assets/banner/layerhub-logo-white.svg'));
    assert.ok(htmlContent.includes('assets/banner/layerhub-logo-dark.svg'));
    var bannerStart = htmlContent.indexOf('id="layerhub-banner"');
    var bannerEnd = htmlContent.indexOf('id="slicer-card"');
    var bannerHtml = htmlContent.slice(bannerStart, bannerEnd);
    assert.ok(!bannerHtml.includes('<path'));
  });
});

describe('LayerHub banner CSS themes', () => {
  it('uses the Figma dark canvas and wiki overrides', () => {
    assert.match(styleContent, /\.layerhub-banner\s*\{[^}]*background:\s*#0e0c25/s);
    assert.match(
      styleContent,
      /body\.theme-wiki \.layerhub-banner\s*\{[^}]*background:\s*#f9f9fb/s
    );
    assert.match(styleContent, /body\.theme-wiki \.layerhub-banner-art--wiki/);
    assert.match(
      styleContent,
      /body\.theme-wiki \.layerhub-banner-glow--magenta\s*\{[^}]*radial-gradient\(ellipse 50% 78% at 0% 100%/s
    );
    assert.match(
      styleContent,
      /body\.theme-wiki \.layerhub-banner-glow--cyan\s*\{[^}]*radial-gradient\(ellipse 46% 74% at 100% 100%/s
    );
    assert.ok(!/body\.theme-wiki \.layerhub-banner-art[^{]*\{[^}]*mask-image/s.test(styleContent));
    assert.match(styleContent, /body\.theme-wiki \.layerhub-banner-logo--wiki/);
    assert.match(
      styleContent,
      /\.layerhub-banner-submit\s*\{[^}]*linear-gradient\(90deg, #bc2b86 0%, #ec4f59 58%, #ffb52c 100%\)/s
    );
    assert.match(
      styleContent,
      /body\.theme-wiki \.layerhub-banner-submit\s*\{[^}]*linear-gradient\(90deg, #ea4c5c 0%, #f57a48 50%, #ffac34 100%\)/s
    );
    assert.match(
      styleContent,
      /\.layerhub-banner-glow--magenta\s*\{[^}]*radial-gradient\(ellipse 50% 50% at 50% 50%, rgb\(188, 43, 134\)/s
    );
    assert.match(
      styleContent,
      /\.layerhub-banner-glow--cyan\s*\{[^}]*radial-gradient\(ellipse 50% 50% at 50% 50%, rgb\(0, 192, 198\)/s
    );
    assert.match(styleContent, /\.layerhub-banner-title span:first-child\s*\{[^}]*white-space:\s*nowrap/s);
    assert.match(styleContent, /\.layerhub-banner-subtitle\s*\{[^}]*max-width:\s*27\.5rem/s);
    assert.match(styleContent, /\.layerhub-banner-submit\s*\{[^}]*text-decoration:\s*none/s);
    assert.ok(!styleContent.includes('.layerhub-banner-email-wrap'));
    assert.ok(!styleContent.includes('.layerhub-banner-form'));
    assert.ok(!styleContent.includes('.layerhub-banner-status'));
  });
});

describe('LayerHub banner i18n', () => {
  it('keeps CTA copy and drops subscribe-only keys', () => {
    assert.ok(i18nContent.includes("'banner.submit': 'Explore Now'"));
    assert.ok(i18nContent.includes("'banner.submit': '立即探索'"));
    assert.ok(!i18nContent.includes('banner.email.placeholder'));
    assert.ok(!i18nContent.includes('banner.success'));
    assert.ok(!i18nContent.includes('banner.error'));
    assert.ok(!i18nContent.includes('banner.invalid'));
    assert.ok(!i18nContent.includes('subscribe here to stay updated'));
  });
});

describe('app.js CTA wiring', () => {
  it('initializes the banner CTA and tracks banner_explore', () => {
    assert.ok(appContent.includes('function initBannerCta()'));
    assert.ok(appContent.includes('initBannerCta();'));
    assert.ok(appContent.includes("trackGaEvent('banner_explore'"));
    assert.ok(appContent.includes("getElementById('layerhub-banner-cta')"));
    assert.ok(!appContent.includes('function initBannerSubscribe()'));
    assert.ok(!appContent.includes("trackGaEvent('banner_subscribe'"));
    assert.ok(!appContent.includes('isSubscribeHoneypotFilled'));
  });
});
