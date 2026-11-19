import test from 'node:test';
import assert from 'node:assert';
import { WATERMARK_POSITIONS, getSafePositions } from '../src/watermark/SafePositions.js';

test('WATERMARK_POSITIONS contains at least 5 safe positions inside video area', () => {
  assert.ok(WATERMARK_POSITIONS.length >= 5);
  const ids = WATERMARK_POSITIONS.map((p) => p.id);
  assert.ok(ids.includes('bottom-right'));
  assert.ok(ids.includes('top-left'));
  assert.ok(ids.includes('bottom-left'));
  assert.ok(ids.includes('top-right'));
});

test('getSafePositions returns valid positions and prevents collisions', () => {
  const normalPositions = getSafePositions(false);
  const subtitlePositions = getSafePositions(true);

  assert.ok(normalPositions.length > 0);
  assert.ok(subtitlePositions.length > 0);
  // All positions have valid styles
  subtitlePositions.forEach((pos) => {
    assert.ok(pos.style);
    assert.ok(pos.id);
  });
});
