import test from 'node:test';
import assert from 'node:assert';
import { escapeHtml, isValidMediaUrl } from '../src/utils/sanitize.js';

test('escapeHtml prevents script and tag injection', () => {
  assert.strictEqual(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  assert.strictEqual(escapeHtml('Hello "Shiv" & \'Yogi\''), 'Hello &quot;Shiv&quot; &amp; &#39;Yogi&#39;');
  assert.strictEqual(escapeHtml(null), '');
  assert.strictEqual(escapeHtml(undefined), '');
});

test('isValidMediaUrl prevents dangerous URL protocols', () => {
  // Dangerous schemes
  assert.strictEqual(isValidMediaUrl('javascript:alert(1)'), false);
  assert.strictEqual(isValidMediaUrl('vbscript:msgbox(1)'), false);
  assert.strictEqual(isValidMediaUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.strictEqual(isValidMediaUrl('data:application/javascript,alert(1)'), false);

  // Safe valid schemes
  assert.strictEqual(isValidMediaUrl('https://example.com/video.mp4'), true);
  assert.strictEqual(isValidMediaUrl('http://example.com/stream.m3u8'), true);
  assert.strictEqual(isValidMediaUrl('/media/clip.webm'), true);
  assert.strictEqual(isValidMediaUrl('./relative/path.mp4'), true);
  assert.strictEqual(isValidMediaUrl('blob:http://localhost/1234-uuid'), true);
  assert.strictEqual(isValidMediaUrl('data:video/mp4;base64,AAA...'), true);
});
