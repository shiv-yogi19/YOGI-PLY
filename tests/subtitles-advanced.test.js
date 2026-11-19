import test from 'node:test';
import assert from 'node:assert';
import { parseSrt } from '../src/subtitles/SrtParser.js';

test('parseSrt strips UTF-8 BOM from WebVTT and SRT content', () => {
  const contentWithBom = '\uFEFFWEBVTT\n\n1\n00:00:01.000 --> 00:00:04.000\nBOM Cleaned Subtitle';
  const cues = parseSrt(contentWithBom);
  assert.strictEqual(cues.length, 1);
  assert.strictEqual(cues[0].text, 'BOM Cleaned Subtitle');
  assert.strictEqual(cues[0].start, 1);
  assert.strictEqual(cues[0].end, 4);
});

test('parseSrt handles cue settings and extra attributes on timestamp line', () => {
  const vttWithSettings = `WEBVTT

1
00:00:02.500 --> 00:00:05.500 line:0 position:20% align:start
Positioned Caption Text
`;
  const cues = parseSrt(vttWithSettings);
  assert.strictEqual(cues.length, 1);
  assert.strictEqual(cues[0].start, 2.5);
  assert.strictEqual(cues[0].end, 5.5);
  assert.strictEqual(cues[0].text, 'Positioned Caption Text');
});
