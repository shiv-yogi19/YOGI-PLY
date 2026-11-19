/**
 * Yogi_PLY - Chapter Navigation & Timeline Marker System
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

import { ListenerTracker } from '../utils/dom.js';

export class ChapterManager {
  /**
   * @param {import('../core/Player.js').Player} player
   * @param {Array<{ start: number, end: number, title: string }>} initialChapters
   */
  constructor(player, initialChapters = []) {
    this.player = player;
    this.state = player.state;
    this.tracker = new ListenerTracker();
    this.chapters = [];
    this.currentChapterIndex = -1;

    this.init(initialChapters);
  }

  init(initialChapters) {
    this.setChapters(initialChapters);

    // Track active chapter during playback
    this.state.on('timeupdate', (time) => {
      this.checkCurrentChapter(time);
    });
  }

  /**
   * Validate and set chapter list safely
   * @param {Array<{ start: number, end: number, title: string }>} rawChapters
   * @returns {Array} Validated chapters
   */
  setChapters(rawChapters = []) {
    if (!Array.isArray(rawChapters)) {
      this.chapters = [];
      this.state.set('chapters', []);
      return [];
    }

    // Filter, validate ranges, and normalize
    const valid = rawChapters
      .filter((ch) => ch && typeof ch === 'object')
      .map((ch, idx) => {
        const start = typeof ch.start === 'number' && !isNaN(ch.start) && ch.start >= 0 ? ch.start : 0;
        const end = typeof ch.end === 'number' && !isNaN(ch.end) && ch.end > start ? ch.end : start + 30;
        const title = typeof ch.title === 'string' && ch.title.trim().length > 0
          ? ch.title.trim()
          : `Chapter ${idx + 1}`;
        return { start, end, title, id: ch.id || `chapter-${idx + 1}` };
      })
      .sort((a, b) => a.start - b.start);

    this.chapters = valid;
    this.state.set('chapters', valid);
    this.currentChapterIndex = -1;
    this.checkCurrentChapter(this.player.getCurrentTime());

    return valid;
  }

  /**
   * Get all registered chapters
   * @returns {Array}
   */
  getChapters() {
    return [...this.chapters];
  }

  /**
   * Detect current active chapter based on time
   * @param {number} [time]
   * @returns {{ chapter: Object, index: number } | null}
   */
  getCurrentChapter(time = null) {
    const curTime = typeof time === 'number' ? time : this.player.getCurrentTime();
    if (this.chapters.length === 0) return null;

    const index = this.chapters.findIndex((ch, i) => {
      if (i === this.chapters.length - 1) {
        return curTime >= ch.start && curTime <= ch.end;
      }
      return curTime >= ch.start && curTime < ch.end;
    });
    if (index !== -1) {
      return { chapter: this.chapters[index], index };
    }

    // Fallback: chapter that started most recently before curTime
    for (let i = this.chapters.length - 1; i >= 0; i--) {
      if (curTime >= this.chapters[i].start) {
        return { chapter: this.chapters[i], index: i };
      }
    }

    return null;
  }

  /**
   * Check if current chapter changed and emit event
   * @param {number} time
   */
  checkCurrentChapter(time) {
    const current = this.getCurrentChapter(time);
    const newIdx = current ? current.index : -1;

    if (newIdx !== this.currentChapterIndex) {
      this.currentChapterIndex = newIdx;
      const chapterData = current ? current.chapter : null;
      this.state.set('currentChapter', chapterData);
      this.player.emit('chapterchange', chapterData);
    }
  }

  /**
   * Seek to specific chapter by index
   * @param {number} index
   */
  seekToChapter(index) {
    if (index >= 0 && index < this.chapters.length) {
      const target = this.chapters[index];
      this.player.seek(target.start);
      return target;
    }
    return null;
  }

  /**
   * Navigate to next chapter
   */
  nextChapter() {
    const cur = this.getCurrentChapter();
    const currentIdx = cur ? cur.index : -1;
    if (currentIdx < this.chapters.length - 1) {
      return this.seekToChapter(currentIdx + 1);
    }
    return null;
  }

  /**
   * Navigate to previous chapter (or start of current chapter)
   */
  prevChapter() {
    const cur = this.getCurrentChapter();
    if (!cur) return null;

    const curTime = this.player.getCurrentTime();
    // If more than 3 seconds into chapter, restart current chapter; otherwise go to previous
    if (curTime - cur.chapter.start > 3 || cur.index === 0) {
      return this.seekToChapter(cur.index);
    } else if (cur.index > 0) {
      return this.seekToChapter(cur.index - 1);
    }
    return null;
  }

  destroy() {
    this.tracker.destroy();
    this.chapters = [];
    this.currentChapterIndex = -1;
  }
}
