/**
 * Yogi_PLY - SRT and WebVTT Parser
 * Created By Shiv Yogi
 */

import { parseTime } from '../utils/time.js';

/**
 * Parse SRT/VTT timestamp string (00:01:23,456 or 00:01:23.456 or 01:23.456) to seconds
 * @param {string} timestamp
 * @returns {number}
 */
export function parseSrtTimestamp(timestamp) {
  if (!timestamp) return 0;
  const normalized = timestamp.trim().replace(',', '.');
  const [timePart, millisPart = '0'] = normalized.split('.');
  const baseSeconds = parseTime(timePart);
  const millis = parseFloat('0.' + millisPart);
  return baseSeconds + millis;
}

/**
 * Parse SRT or WebVTT cue string into an array of cues: [{ start, end, text }]
 * Strips UTF-8 BOM, handles multi-line text and arbitrary arrow whitespace.
 * @param {string} content
 * @returns {Array<{ start: number, end: number, text: string }>}
 */
export function parseSrt(content) {
  if (!content || typeof content !== 'string') return [];

  // Strip UTF-8 Byte Order Mark (BOM)
  const clean = content.replace(/^\uFEFF/, '').trim();
  const normalized = clean.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);
  const cues = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length === 0) continue;

    // Skip WebVTT header block or style blocks
    if (lines[0].startsWith('WEBVTT') || lines[0].startsWith('NOTE') || lines[0].startsWith('STYLE')) {
      continue;
    }

    let timeLineIndex = 0;
    if (!lines[0].includes('-->') && lines.length > 1 && lines[1].includes('-->')) {
      timeLineIndex = 1;
    }

    const timeLine = lines[timeLineIndex];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const parts = timeLine.split(/\s*-->\s*/);
    if (parts.length < 2) continue;

    const start = parseSrtTimestamp(parts[0]);
    // The end timestamp can contain cue settings (e.g. "00:04.000 line:0 position:20%")
    const endStr = parts[1].split(/\s+/)[0];
    const end = parseSrtTimestamp(endStr);

    const textLines = lines.slice(timeLineIndex + 1);
    const text = textLines.join('\n').trim();

    if (text && !isNaN(start) && !isNaN(end) && end > start) {
      cues.push({ start, end, text });
    }
  }

  return cues;
}

/**
 * Convert SRT content to standard WebVTT string
 * @param {string} srtContent
 * @returns {string}
 */
export function srtToVtt(srtContent) {
  const cues = parseSrt(srtContent);
  let vtt = 'WEBVTT\n\n';

  const formatVttTime = (sec) => {
    const s = (sec % 60).toFixed(3);
    const m = Math.floor((sec / 60) % 60);
    const h = Math.floor(sec / 3600);
    const pad = (n) => (n < 10 ? '0' + n : String(n));
    const padSec = (n) => (parseFloat(n) < 10 ? '0' + n : String(n));
    return `${pad(h)}:${pad(m)}:${padSec(s)}`;
  };

  cues.forEach((cue, i) => {
    vtt += `${i + 1}\n`;
    vtt += `${formatVttTime(cue.start)} --> ${formatVttTime(cue.end)}\n`;
    vtt += `${cue.text}\n\n`;
  });

  return vtt;
}
