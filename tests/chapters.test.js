import test from 'node:test';
import assert from 'node:assert';
import { ChapterManager } from '../src/chapters/ChapterManager.js';
import { EventEmitter } from '../src/core/EventEmitter.js';
import { State } from '../src/core/State.js';

// Mock Player for ChapterManager unit testing
function createMockPlayer(currentTime = 0) {
  let time = currentTime;
  const state = new State({
    chapters: [],
    currentTime: time
  });

  const player = Object.assign(new EventEmitter(), {
    state,
    currentTime: time,
    getCurrentTime() {
      return this.currentTime;
    },
    seek(seconds) {
      this.currentTime = seconds;
      this.state.set('currentTime', seconds);
      this.state.emit('timeupdate', seconds);
    }
  });

  return player;
}

test('ChapterManager validates and normalizes raw chapters', () => {
  const player = createMockPlayer();
  const rawChapters = [
    { start: 60, end: 120, title: 'Chapter 2' },
    { start: 0, end: 60, title: 'Chapter 1' },
    { start: -5, end: 10, title: 'Negative Start Handled' }, // start should become 0
    { start: 200, end: 150, title: 'Invalid End Handled' }, // end <= start should become start + 30
    null, // filtered out
    { invalid: true } // given default title and range
  ];

  const manager = new ChapterManager(player, rawChapters);
  const chapters = manager.getChapters();

  assert.ok(Array.isArray(chapters));
  // All should be sorted by start time
  for (let i = 0; i < chapters.length - 1; i++) {
    assert.ok(chapters[i].start <= chapters[i + 1].start);
  }

  // All valid chapters have positive end > start and non-empty title
  chapters.forEach((ch) => {
    assert.ok(ch.start >= 0);
    assert.ok(ch.end > ch.start);
    assert.ok(typeof ch.title === 'string' && ch.title.length > 0);
  });

  manager.destroy();
});

test('ChapterManager detects active chapter accurately based on time', () => {
  const player = createMockPlayer(15);
  const chapters = [
    { start: 0, end: 30, title: 'Intro' },
    { start: 30, end: 90, title: 'Core Content' },
    { start: 90, end: 150, title: 'Conclusion' }
  ];

  const manager = new ChapterManager(player, chapters);

  // Time = 15 -> Intro
  let current = manager.getCurrentChapter(15);
  assert.strictEqual(current.chapter.title, 'Intro');
  assert.strictEqual(current.index, 0);

  // Time = 45 -> Core Content
  current = manager.getCurrentChapter(45);
  assert.strictEqual(current.chapter.title, 'Core Content');
  assert.strictEqual(current.index, 1);

  // Time = 120 -> Conclusion
  current = manager.getCurrentChapter(120);
  assert.strictEqual(current.chapter.title, 'Conclusion');
  assert.strictEqual(current.index, 2);

  manager.destroy();
});

test('ChapterManager navigation (nextChapter, prevChapter, seekToChapter)', () => {
  const player = createMockPlayer(0);
  const chapters = [
    { start: 0, end: 50, title: 'Part 1' },
    { start: 50, end: 100, title: 'Part 2' },
    { start: 100, end: 150, title: 'Part 3' }
  ];

  const manager = new ChapterManager(player, chapters);

  // Start at 0, navigate to next chapter
  manager.nextChapter();
  assert.strictEqual(player.getCurrentTime(), 50);

  // Navigate to next again
  manager.nextChapter();
  assert.strictEqual(player.getCurrentTime(), 100);

  // Already at last chapter, nextChapter should return null
  assert.strictEqual(manager.nextChapter(), null);

  // In Part 3 at 101s, prevChapter should go back to Part 2 (since < 3s into chapter)
  player.currentTime = 101;
  manager.prevChapter();
  assert.strictEqual(player.getCurrentTime(), 50);

  // Seek to specific chapter index
  manager.seekToChapter(0);
  assert.strictEqual(player.getCurrentTime(), 0);

  manager.destroy();
});

test('ChapterManager emits chapterchange event when playback moves into new chapter', () => {
  const player = createMockPlayer(5);
  const chapters = [
    { start: 0, end: 30, title: 'Prologue' },
    { start: 30, end: 60, title: 'Action' }
  ];

  const manager = new ChapterManager(player, chapters);
  let changedChapter = null;
  player.on('chapterchange', (ch) => {
    changedChapter = ch;
  });

  // Advance time into next chapter
  player.seek(35);
  assert.ok(changedChapter);
  assert.strictEqual(changedChapter.title, 'Action');

  manager.destroy();
});
