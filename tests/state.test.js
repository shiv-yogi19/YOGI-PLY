import test from 'node:test';
import assert from 'node:assert';
import { State } from '../src/core/State.js';

test('State initializes with default values and custom overrides', () => {
  const state = new State({ theme: 'cinematic-oled' });
  assert.strictEqual(state.get('theme'), 'cinematic-oled');
  assert.strictEqual(state.get('playing'), false);
  assert.strictEqual(state.get('watermark').text, 'Created By Shiv Yogi');
});

test('State sets properties and emits change events', () => {
  const state = new State();
  let changedVolume = null;

  state.subscribe('volume', (vol) => {
    changedVolume = vol;
  });

  state.set('volume', 0.75);
  assert.strictEqual(state.get('volume'), 0.75);
  assert.strictEqual(changedVolume, 0.75);
});

test('State updates multiple properties in batch', () => {
  const state = new State();
  state.update({
    currentTime: 45,
    duration: 120,
    playing: true
  });

  assert.strictEqual(state.get('currentTime'), 45);
  assert.strictEqual(state.get('duration'), 120);
  assert.strictEqual(state.get('playing'), true);
});
