import test from 'node:test';
import assert from 'node:assert';
import { setupMockDOM, MockDOMElement } from './setup-dom.js';

setupMockDOM();

const { AnimationEngine, ANIMATION_VARIANTS, ANIMATION_PRESETS } = await import('../src/animations/AnimationEngine.js');

test('AnimationEngine exports at least 30 distinct animation variants', () => {
  assert.ok(ANIMATION_VARIANTS.length >= 30, `Expected at least 30 variants, got ${ANIMATION_VARIANTS.length}`);
  // Check required variants
  const required = [
    'player-enter',
    'player-exit',
    'play-tap',
    'pause-tap',
    'btn-press',
    'btn-glow',
    'dock-enter',
    'dock-exit',
    'more-tap',
    'menu-expand',
    'menu-collapse',
    'panel-enter',
    'panel-exit',
    'seek-active',
    'seek-preview',
    'volume-slide',
    'spinner',
    'buffering',
    'sub-enter',
    'sub-exit',
    'playlist-enter',
    'playlist-exit',
    'doubletap-ripple',
    'gesture-hud',
    'watermark-move',
    'screenshot-flash'
  ];

  required.forEach((variant) => {
    assert.ok(ANIMATION_VARIANTS.includes(variant), `Missing variant: ${variant}`);
  });
});

test('AnimationEngine supports animation presets', () => {
  assert.ok(ANIMATION_PRESETS.cinematic);
  assert.ok(ANIMATION_PRESETS.smooth);
  assert.ok(ANIMATION_PRESETS.instant);
  assert.ok(ANIMATION_PRESETS.subtle);
  assert.ok(ANIMATION_PRESETS.spring);

  const container = new MockDOMElement('div');
  const engine = new AnimationEngine(container, { preset: 'spring' });
  assert.strictEqual(engine.preset, 'spring');

  engine.setPreset('cinematic');
  assert.strictEqual(engine.preset, 'cinematic');
});

test('AnimationEngine triggers animation class safely', async () => {
  const container = new MockDOMElement('div');
  const engine = new AnimationEngine(container);
  const btn = new MockDOMElement('button');

  // Triggering does not throw
  await engine.trigger(btn, 'play-tap', 50);
  assert.ok(true);
});
