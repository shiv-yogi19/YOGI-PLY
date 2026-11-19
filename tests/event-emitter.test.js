import test from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from '../src/core/EventEmitter.js';

test('EventEmitter registers and emits events', () => {
  const emitter = new EventEmitter();
  let received = null;

  emitter.on('play', (data) => {
    received = data;
  });

  emitter.emit('play', { time: 10 });
  assert.deepStrictEqual(received, { time: 10 });
});

test('EventEmitter once() triggers exactly once', () => {
  const emitter = new EventEmitter();
  let count = 0;

  emitter.once('click', () => {
    count++;
  });

  emitter.emit('click');
  emitter.emit('click');
  emitter.emit('click');

  assert.strictEqual(count, 1);
});

test('EventEmitter off() unregisters listeners correctly', () => {
  const emitter = new EventEmitter();
  let count = 0;
  const listener = () => count++;

  emitter.on('ping', listener);
  emitter.emit('ping');
  assert.strictEqual(count, 1);

  emitter.off('ping', listener);
  emitter.emit('ping');
  assert.strictEqual(count, 1);
});
