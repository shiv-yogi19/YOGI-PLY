import test from 'node:test';
import assert from 'node:assert';
import { formatTime, parseTime } from '../src/utils/time.js';

test('formatTime formats seconds accurately', () => {
  assert.strictEqual(formatTime(0), '00:00');
  assert.strictEqual(formatTime(9), '00:09');
  assert.strictEqual(formatTime(65), '01:05');
  assert.strictEqual(formatTime(599), '09:59');
  assert.strictEqual(formatTime(3600), '01:00:00');
  assert.strictEqual(formatTime(3665), '01:01:05');
  assert.strictEqual(formatTime(7325), '02:02:05');
  assert.strictEqual(formatTime(45, true), '00:00:45');
});

test('formatTime handles invalid inputs safely', () => {
  assert.strictEqual(formatTime(NaN), '00:00');
  assert.strictEqual(formatTime(-10), '00:00');
  assert.strictEqual(formatTime(Infinity), '00:00');
  assert.strictEqual(formatTime(NaN, true), '00:00:00');
});

test('parseTime parses time strings to seconds correctly', () => {
  assert.strictEqual(parseTime('00:45'), 45);
  assert.strictEqual(parseTime('01:30'), 90);
  assert.strictEqual(parseTime('01:02:03'), 3723);
  assert.strictEqual(parseTime(120), 120);
  assert.strictEqual(parseTime('invalid'), 0);
  assert.strictEqual(parseTime(null), 0);
});
