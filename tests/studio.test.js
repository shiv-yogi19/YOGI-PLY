import test from 'node:test';
import assert from 'node:assert';
import { validateConfiguration, PERMANENT_BRANDING } from '../studio/configuration/schema.js';
import { STUDIO_PRESETS } from '../studio/presets/index.js';
import {
  generateConfigJson,
  generateJsCode,
  generateHtmlCode,
  generateCssCode,
  generateReactCode,
  generateVueCode,
  generatePythonCode
} from '../studio/generator/codeGenerators.js';

test('Studio Schema: validates and fills default configuration', () => {
  const result = validateConfiguration({});
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.sanitizedConfig.theme, 'liquid-glass');
  assert.strictEqual(result.sanitizedConfig.layout, 'cinematic');
  assert.strictEqual(result.sanitizedConfig.watermark.enabled, true);
  assert.strictEqual(result.sanitizedConfig.watermark.text, PERMANENT_BRANDING.text);
});

test('Studio Schema: Permanent Watermark Policy Enforcement', () => {
  // Test that passing false or custom text does NOT remove or replace watermark
  const result = validateConfiguration({
    watermark: {
      enabled: false,
      text: 'Fake Creator',
      opacity: 0.99 // clamped to 0.85
    }
  });

  assert.strictEqual(result.sanitizedConfig.watermark.enabled, true, 'Watermark must remain enabled');
  assert.strictEqual(result.sanitizedConfig.watermark.text, 'Created By Shiv Yogi', 'Text must remain permanent');
  assert.strictEqual(result.sanitizedConfig.watermark.opacity, 0.85, 'Opacity must clamp within safe branding range');
});

test('Studio Presets: all predefined presets are valid against schema', () => {
  const presetKeys = Object.keys(STUDIO_PRESETS);
  assert.ok(presetKeys.length >= 4);

  presetKeys.forEach((key) => {
    const preset = STUDIO_PRESETS[key];
    const val = validateConfiguration(preset.config);
    assert.strictEqual(val.valid, true, `Preset "${key}" failed validation: ${val.errors.join(', ')}`);
    assert.strictEqual(val.sanitizedConfig.watermark.text, PERMANENT_BRANDING.text);
  });
});

test('Studio Generator: produces all required integration outputs', () => {
  const sampleConfig = {
    source: 'https://example.com/movie.mp4',
    title: 'Test Movie',
    theme: 'liquid-glass',
    watermark: {
      enabled: true,
      text: 'Created By Shiv Yogi'
    }
  };

  const jsonStr = generateConfigJson(sampleConfig);
  assert.ok(jsonStr.includes('Created By Shiv Yogi'));

  const jsStr = generateJsCode(sampleConfig);
  assert.ok(jsStr.includes('new YogiPLY.Player'));
  assert.ok(jsStr.includes('Created By Shiv Yogi'));

  const htmlStr = generateHtmlCode(sampleConfig);
  assert.ok(htmlStr.includes('<!DOCTYPE html>'));
  assert.ok(htmlStr.includes('Created By Shiv Yogi'));

  const cssStr = generateCssCode(sampleConfig);
  assert.ok(cssStr.includes('.yogi-ply'));

  const reactStr = generateReactCode(sampleConfig);
  assert.ok(reactStr.includes('export default function YogiPlayer'));
  assert.ok(reactStr.includes('useEffect'));

  const vueStr = generateVueCode(sampleConfig);
  assert.ok(vueStr.includes('<script setup>'));
  assert.ok(vueStr.includes('onMounted'));

  const pyStr = generatePythonCode(sampleConfig);
  assert.ok(pyStr.includes('HTTP 206 Partial Content'));
  assert.ok(pyStr.includes('app.run'));
  assert.ok(pyStr.includes('Created By Shiv Yogi'));
});
