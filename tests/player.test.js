import test from 'node:test';
import assert from 'node:assert';
import { setupMockDOM, MockDOMElement } from './setup-dom.js';

// Setup Mock DOM
setupMockDOM();

const { Player } = await import('../src/core/Player.js');

test('Player throws error when container target is not found', () => {
  assert.throws(
    () => new Player('#non-existent'),
    /Target container element "#non-existent" was not found/
  );
});

test('Player initializes cleanly with default options', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container, {
    source: 'https://example.com/test.mp4'
  });

  assert.ok(player.id.startsWith('yogi-ply-'));
  assert.strictEqual(player.state.get('theme'), 'liquid-glass');
  assert.strictEqual(player.state.get('loop'), false);
  assert.strictEqual(player.getPlaybackRate(), 1);
  assert.strictEqual(player.getVolume(), 1);
  assert.strictEqual(player.isMuted(), false);
  assert.strictEqual(player.isPaused(), true);

  player.destroy();
});

test('Player handles missing source gracefully without throwing', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container);

  assert.strictEqual(player.options.source, '');
  assert.strictEqual(player.state.get('error'), null);

  player.destroy();
});

test('Player play, pause, togglePlay, and restart methods', async () => {
  const container = new MockDOMElement('div');
  const player = new Player(container, {
    source: 'https://example.com/video.mp4'
  });

  await player.play();
  assert.strictEqual(player.isPaused(), false);

  player.pause();
  assert.strictEqual(player.isPaused(), true);

  player.togglePlay();
  assert.strictEqual(player.isPaused(), false);

  player.seek(50);
  assert.strictEqual(player.getCurrentTime(), 50);

  await player.restart();
  assert.strictEqual(player.getCurrentTime(), 0);
  assert.strictEqual(player.isPaused(), false);

  player.destroy();
});

test('Player volume, mute, and unmute controls with boundary clamping', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container);

  player.setVolume(0.5);
  assert.strictEqual(player.getVolume(), 0.5);

  // Clamp above 1
  player.setVolume(1.8);
  assert.strictEqual(player.getVolume(), 1);

  // Clamp below 0
  player.setVolume(-0.4);
  assert.strictEqual(player.getVolume(), 0);

  // Mute / Unmute
  player.setVolume(0.8);
  player.mute();
  assert.strictEqual(player.isMuted(), true);

  player.unmute();
  assert.strictEqual(player.isMuted(), false);
  assert.strictEqual(player.getVolume(), 0.8);

  player.destroy();
});

test('Player playback rate setting and speeds', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container);

  player.setPlaybackRate(1.5);
  assert.strictEqual(player.getPlaybackRate(), 1.5);

  player.setPlaybackRate(2.5);
  assert.strictEqual(player.getPlaybackRate(), 2.5);

  player.setPlaybackRate(3);
  assert.strictEqual(player.getPlaybackRate(), 3);

  player.destroy();
});

test('Player loop setting and toggling', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container, { loop: false });

  assert.strictEqual(player.isLoop(), false);

  player.setLoop(true);
  assert.strictEqual(player.isLoop(), true);

  player.toggleLoop();
  assert.strictEqual(player.isLoop(), false);

  player.destroy();
});

test('Player theme switching dynamically', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container, { theme: 'liquid-glass' });

  assert.strictEqual(player.state.get('theme'), 'liquid-glass');

  let themeEvent = null;
  player.on('themechange', (t) => { themeEvent = t; });

  player.setTheme('dark');
  assert.strictEqual(player.state.get('theme'), 'dark');
  assert.strictEqual(themeEvent, 'dark');

  player.setTheme('cinematic-oled');
  assert.strictEqual(player.state.get('theme'), 'cinematic-oled');

  player.setTheme('light');
  assert.strictEqual(player.state.get('theme'), 'light');

  player.destroy();
});

test('Player watermark configuration and dynamic updates', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container, {
    watermark: {
      opacity: 0.28,
      interval: 12000
    }
  });

  const wm = player.state.get('watermark');
  assert.strictEqual(wm.enabled, true);
  assert.strictEqual(wm.text, 'Created By Shiv Yogi');
  assert.strictEqual(wm.opacity, 0.28);

  let wmChangeEvent = null;
  player.on('watermarkchange', (opts) => { wmChangeEvent = opts; });

  // Update visual settings
  player.setWatermark({ opacity: 0.5, animationStyle: 'slide', text: 'Forbidden Change' });
  assert.strictEqual(player.watermark.options.opacity, 0.5);
  assert.strictEqual(player.watermark.options.animationStyle, 'slide');
  // Text remains permanently 'Created By Shiv Yogi' and enabled remains true
  assert.strictEqual(player.watermark.options.text, 'Created By Shiv Yogi');
  assert.strictEqual(player.watermark.options.enabled, true);
  assert.strictEqual(wmChangeEvent.opacity, 0.5);

  player.destroy();
});

test('Player chapter management and navigation integration', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container, {
    chapters: [
      { start: 0, end: 30, title: 'Chapter 1' },
      { start: 30, end: 60, title: 'Chapter 2' }
    ]
  });

  const chapters = player.getChapters();
  assert.strictEqual(chapters.length, 2);
  assert.strictEqual(chapters[0].title, 'Chapter 1');

  // Navigate next chapter
  player.nextChapter();
  assert.strictEqual(player.getCurrentTime(), 30);

  // Navigate prev chapter
  player.prevChapter();
  assert.strictEqual(player.getCurrentTime(), 0);

  player.destroy();
});

test('Player event registration and removal (on, off, once)', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container);

  let count = 0;
  const handler = () => { count++; };

  player.on('test-event', handler);
  player.emit('test-event');
  assert.strictEqual(count, 1);

  player.emit('test-event');
  assert.strictEqual(count, 2);

  player.off('test-event', handler);
  player.emit('test-event');
  assert.strictEqual(count, 2); // No increase

  // once
  let onceCount = 0;
  player.once('single-event', () => { onceCount++; });
  player.emit('single-event');
  player.emit('single-event');
  assert.strictEqual(onceCount, 1);

  player.destroy();
});

test('Multiple Player instances remain completely isolated', () => {
  const c1 = new MockDOMElement('div');
  const c2 = new MockDOMElement('div');

  const p1 = new Player(c1, { theme: 'liquid-glass', volume: 0.8 });
  const p2 = new Player(c2, { theme: 'cinematic-oled', volume: 0.2 });

  assert.notStrictEqual(p1.id, p2.id);
  assert.strictEqual(p1.getVolume(), 0.8);
  assert.strictEqual(p2.getVolume(), 0.2);

  p1.setVolume(0.95);
  p1.setTheme('dark');

  assert.strictEqual(p1.getVolume(), 0.95);
  assert.strictEqual(p2.getVolume(), 0.2); // p2 remains untouched
  assert.strictEqual(p1.state.get('theme'), 'dark');
  assert.strictEqual(p2.state.get('theme'), 'cinematic-oled'); // p2 remains untouched

  p1.destroy();
  p2.destroy();
});

test('Player detects unsupported legacy formats (e.g. AVI) and emits diagnostic error', async () => {
  const container = new MockDOMElement('div');
  const player = new Player(container);

  let unsupportedDetail = null;
  let errorMessage = null;

  player.on('unsupportedformat', (data) => {
    unsupportedDetail = data;
  });

  player.on('error', (err) => {
    errorMessage = err;
  });

  await player.setSource('https://example.com/movie.avi');

  assert.ok(unsupportedDetail);
  assert.strictEqual(unsupportedDetail.supported, false);
  assert.strictEqual(unsupportedDetail.extension, 'avi');
  assert.ok(unsupportedDetail.reason.includes('not supported natively'));
  assert.ok(errorMessage);

  player.destroy();
});

test('Player destroy cleans up all event listeners and components', () => {
  const container = new MockDOMElement('div');
  const player = new Player(container, {
    source: 'https://example.com/test.mp4'
  });

  assert.ok(player.engine);
  assert.ok(player.watermark);

  player.destroy();

  // Verify listeners cleared
  assert.strictEqual(Object.keys(player._events).length, 0);
  assert.strictEqual(player.watermark.element, null);
});
