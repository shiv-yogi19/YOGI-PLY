import test from 'node:test';
import assert from 'node:assert';
import { State } from '../src/core/State.js';

test('Multiple state instances maintain independent properties without leakage', () => {
  const player1State = new State({
    theme: 'liquid-glass',
    volume: 0.8,
    watermark: { text: 'Created By Shiv Yogi - Instance 1' }
  });

  const player2State = new State({
    theme: 'cinematic-oled',
    volume: 0.3,
    watermark: { text: 'Created By Shiv Yogi - Instance 2' }
  });

  assert.strictEqual(player1State.get('theme'), 'liquid-glass');
  assert.strictEqual(player2State.get('theme'), 'cinematic-oled');

  player1State.set('volume', 0.95);
  assert.strictEqual(player1State.get('volume'), 0.95);
  assert.strictEqual(player2State.get('volume'), 0.3); // Untouched

  player2State.set('theme', 'dark');
  assert.strictEqual(player2State.get('theme'), 'dark');
  assert.strictEqual(player1State.get('theme'), 'liquid-glass'); // Untouched
});
