import test from 'node:test';
import assert from 'node:assert';
import { setupMockDOM, MockDOMElement } from './setup-dom.js';

setupMockDOM();

const { Player } = await import('../src/core/Player.js');
const { PERMANENT_WATERMARK_TEXT } = await import('../src/watermark/Watermark.js');

test('Watermark Policy: Watermark cannot be disabled or text changed via constructor or setWatermark', () => {
  const container = new MockDOMElement('div');
  // Attempt to disable via constructor
  const player = new Player(container, {
    watermark: false
  });

  const wmState = player.state.get('watermark');
  assert.strictEqual(wmState.enabled, true, 'Watermark must always remain enabled');
  assert.strictEqual(wmState.text, PERMANENT_WATERMARK_TEXT, `Watermark text must be "${PERMANENT_WATERMARK_TEXT}"`);

  // Attempt to disable and replace text via setWatermark
  player.setWatermark({ enabled: false, text: 'Replaced Branding' });
  assert.strictEqual(player.watermark.options.enabled, true, 'Watermark must never be disabled');
  assert.strictEqual(player.watermark.options.text, PERMANENT_WATERMARK_TEXT, 'Watermark text must remain permanent');

  player.destroy();
});

test('Advanced Playback: Aspect Ratio switching', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container);

  let emittedRatio = null;
  player.on('aspectratiochange', (r) => { emittedRatio = r; });

  player.setAspectRatio('4:3');
  assert.strictEqual(player.state.get('aspectRatio'), '4:3');
  assert.strictEqual(emittedRatio, '4:3');

  player.setAspectRatio('Fill (Cover)');
  assert.strictEqual(player.state.get('aspectRatio'), 'Fill (Cover)');
  assert.strictEqual(emittedRatio, 'Fill (Cover)');

  player.destroy();
});

test('Advanced Playback: Sleep Timer setting and clearing', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container);

  player.setSleepTimer(30);
  assert.strictEqual(player.getSleepTimer(), 30);

  player.setSleepTimer('end');
  assert.strictEqual(player.getSleepTimer(), 'end');

  player.setSleepTimer('off');
  assert.strictEqual(player.getSleepTimer(), 'off');

  player.destroy();
});

test('Advanced Playback: A-B Repeat loop management', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container);

  player.setRepeatPointA(10);
  assert.strictEqual(player.state.get('repeatA'), 10);

  player.setRepeatPointB(25);
  assert.strictEqual(player.state.get('repeatB'), 25);

  player.clearRepeat();
  assert.strictEqual(player.state.get('repeatA'), null);
  assert.strictEqual(player.state.get('repeatB'), null);

  player.destroy();
});

test('Advanced Playback: Frame Stepping navigation', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container);

  player.seek(10);
  player.stepFrame(1);
  assert.ok(player.getCurrentTime() > 10, 'Step forward must advance time');

  player.stepFrame(-1);
  assert.ok(Math.abs(player.getCurrentTime() - 10) < 0.05, 'Step back must rewind time');

  player.destroy();
});

test('Advanced Playback: Diagnostics retrieval', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container, {
    source: 'https://example.com/video.mp4'
  });

  const diag = player.getDiagnostics();
  assert.ok(diag);
  assert.strictEqual(typeof diag.duration, 'number');
  assert.strictEqual(typeof diag.currentTime, 'number');
  assert.strictEqual(typeof diag.volume, 'number');
  assert.strictEqual(typeof diag.isPaused, 'boolean');
  assert.strictEqual(typeof diag.engine, 'string');

  player.destroy();
});
