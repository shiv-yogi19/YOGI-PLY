import test from 'node:test';
import assert from 'node:assert';
import { inspectMediaCompatibility, extractExtension, FORMAT_DEFINITIONS } from '../src/core/MediaCompatibility.js';

test('extractExtension extracts file extensions from URLs with query params', () => {
  assert.strictEqual(extractExtension('https://cdn.example.com/movie.mp4?token=123'), 'mp4');
  assert.strictEqual(extractExtension('video.webm#t=10'), 'webm');
  assert.strictEqual(extractExtension('https://stream.mux.dev/live.m3u8'), 'm3u8');
  assert.strictEqual(extractExtension('stream.mpd'), 'mpd');
  assert.strictEqual(extractExtension('archive.avi'), 'avi');
  assert.strictEqual(extractExtension(''), '');
  assert.strictEqual(extractExtension(null), '');
});

test('FORMAT_DEFINITIONS contains all required video containers and codecs', () => {
  const required = ['mp4', 'webm', 'ogg', 'mov', 'm4v', 'm3u8', 'mpd', 'mkv', 'avi', 'wmv', 'flv', 'ts', '3gp'];
  for (const ext of required) {
    assert.ok(FORMAT_DEFINITIONS[ext], `Missing format definition for: ${ext}`);
  }
});

test('inspectMediaCompatibility correctly distinguishes web-supported from non-web legacy formats', () => {
  // Web Standard MP4
  const mp4Check = inspectMediaCompatibility('https://example.com/test.mp4', null);
  assert.strictEqual(mp4Check.supported, true);
  assert.strictEqual(mp4Check.extension, 'mp4');

  // Web Standard WebM
  const webmCheck = inspectMediaCompatibility('https://example.com/test.webm', null);
  assert.strictEqual(webmCheck.supported, true);
  assert.strictEqual(webmCheck.extension, 'webm');

  // Legacy Non-Web Container (AVI)
  const aviCheck = inspectMediaCompatibility('https://example.com/sample.avi', null);
  assert.strictEqual(aviCheck.supported, false);
  assert.ok(aviCheck.reason.includes('not supported natively'));
  assert.ok(aviCheck.recommendation.includes('Convert'));

  // Legacy Non-Web Container (WMV)
  const wmvCheck = inspectMediaCompatibility('https://example.com/sample.wmv', null);
  assert.strictEqual(wmvCheck.supported, false);

  // Legacy Non-Web Container (FLV)
  const flvCheck = inspectMediaCompatibility('https://example.com/sample.flv', null);
  assert.strictEqual(flvCheck.supported, false);

  // External YouTube URL
  const ytCheck = inspectMediaCompatibility('https://www.youtube.com/watch?v=aqz-KE-bpKQ', null);
  assert.strictEqual(ytCheck.supported, true);
  assert.strictEqual(ytCheck.type, 'external');
});
