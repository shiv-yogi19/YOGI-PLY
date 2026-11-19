import test from 'node:test';
import assert from 'node:assert';
import { setupMockDOM, MockDOMElement } from './setup-dom.js';

setupMockDOM();

const { PlaylistManager } = await import('../src/playlist/PlaylistManager.js');
const { EventEmitter } = await import('../src/core/EventEmitter.js');
const { State } = await import('../src/core/State.js');

// Mock Player
function createMockPlayer() {
  const state = new State();
  const player = Object.assign(new EventEmitter(), {
    state,
    currentSource: '',
    currentPoster: '',
    setSource(src) {
      this.currentSource = src;
      return Promise.resolve();
    },
    setPoster(url) {
      this.currentPoster = url;
    },
    play() {
      return Promise.resolve();
    }
  });

  return player;
}

test('PlaylistManager initializes playlist items and controls currentIndex', () => {
  const container = new MockDOMElement('div');
  const player = createMockPlayer();
  const items = [
    { title: 'Video 1', src: 'https://example.com/1.mp4' },
    { title: 'Video 2', src: 'https://example.com/2.mp4' },
    { title: 'Video 3', src: 'https://example.com/3.mp4' }
  ];

  const playlist = new PlaylistManager(container, player, items, true);

  assert.strictEqual(playlist.items.length, 3);
  assert.strictEqual(playlist.currentIndex, 0);
  assert.strictEqual(playlist.hasNext(), true);
  assert.strictEqual(playlist.hasPrev(), false);

  playlist.next();
  assert.strictEqual(playlist.currentIndex, 1);
  assert.strictEqual(player.currentSource, 'https://example.com/2.mp4');
  assert.strictEqual(playlist.hasNext(), true);
  assert.strictEqual(playlist.hasPrev(), true);

  playlist.next();
  assert.strictEqual(playlist.currentIndex, 2);
  assert.strictEqual(playlist.hasNext(), false);

  playlist.prev();
  assert.strictEqual(playlist.currentIndex, 1);
  assert.strictEqual(player.currentSource, 'https://example.com/2.mp4');

  playlist.destroy();
});

test('PlaylistManager automatically advances to next video when video ends', () => {
  const container = new MockDOMElement('div');
  const player = createMockPlayer();
  const items = [
    { title: 'Clip A', src: 'https://example.com/a.mp4' },
    { title: 'Clip B', src: 'https://example.com/b.mp4' }
  ];

  const playlist = new PlaylistManager(container, player, items, true);
  assert.strictEqual(playlist.currentIndex, 0);

  // Trigger ended event on player state
  player.state.emit('ended');
  assert.strictEqual(playlist.currentIndex, 1);
  assert.strictEqual(player.currentSource, 'https://example.com/b.mp4');

  playlist.destroy();
});
