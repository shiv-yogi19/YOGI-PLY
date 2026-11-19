import test from 'node:test';
import assert from 'node:assert';
import { parseSrt, parseSrtTimestamp, srtToVtt } from '../src/subtitles/SrtParser.js';

test('parseSrtTimestamp parses comma and period timestamps', () => {
  assert.strictEqual(parseSrtTimestamp('00:01:23,456'), 83.456);
  assert.strictEqual(parseSrtTimestamp('01:00:00.000'), 3600);
  assert.strictEqual(parseSrtTimestamp('00:00:05,500'), 5.5);
});

test('parseSrt extracts cues with timestamps and text', () => {
  const sampleSrt = `
1
00:00:01,000 --> 00:00:04,000
Welcome to Yogi_PLY Video Player!

2
00:00:05,250 --> 00:00:08,750
Created By Shiv Yogi
Universal Liquid Glass Design
  `.trim();

  const cues = parseSrt(sampleSrt);
  assert.strictEqual(cues.length, 2);

  assert.strictEqual(cues[0].start, 1);
  assert.strictEqual(cues[0].end, 4);
  assert.strictEqual(cues[0].text, 'Welcome to Yogi_PLY Video Player!');

  assert.strictEqual(cues[1].start, 5.25);
  assert.strictEqual(cues[1].end, 8.75);
  assert.strictEqual(cues[1].text, 'Created By Shiv Yogi\nUniversal Liquid Glass Design');
});

test('srtToVtt converts SRT format to WebVTT format', () => {
  const sampleSrt = `
1
00:00:02,000 --> 00:00:05,000
Universal Liquid Glass UI
  `.trim();

  const vtt = srtToVtt(sampleSrt);
  assert.match(vtt, /^WEBVTT/);
  assert.match(vtt, /00:00:02\.000 --> 00:00:05\.000/);
  assert.match(vtt, /Universal Liquid Glass UI/);
});
