/**
 * Yogi_PLY - Subtitle Manager
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

import { createElement, ListenerTracker } from '../utils/dom.js';
import { escapeHtml } from '../utils/sanitize.js';
import { parseSrt } from './SrtParser.js';

export class SubtitleManager {
  /**
   * @param {HTMLElement} container
   * @param {HTMLVideoElement} video
   * @param {State} state
   * @param {Array} initialTracks
   */
  constructor(container, video, state, initialTracks = []) {
    this.container = container;
    this.video = video;
    this.state = state;
    this.tracks = [];
    this.activeTrackId = 'off';
    this.currentCues = [];
    this.delay = 0; // Subtitle delay in seconds (+ or -)
    this.tracker = new ListenerTracker();

    this.element = null;
    this.init(initialTracks);
  }

  init(initialTracks) {
    this.element = createElement('div', {
      className: 'yogi-ply-subtitles yogi-ply-subtitles-medium yogi-ply-subtitles-bottom',
      'aria-live': 'assertive',
      'aria-atomic': 'true'
    });
    this.container.appendChild(this.element);

    if (Array.isArray(initialTracks)) {
      initialTracks.forEach((t) => this.addTrack(t));
    }

    // Video time tracking
    this.tracker.add(this.video, 'timeupdate', () => this.updateDisplay());
    this.tracker.add(this.video, 'seeking', () => this.updateDisplay());

    // State bindings
    this.state.subscribe('currentSubtitle', (trackId) => this.setTrack(trackId));
    this.state.subscribe('subtitleSize', (size) => this.setSize(size));
    this.state.subscribe('subtitlePosition', (pos) => this.setPosition(pos));
    this.state.subscribe('subtitleDelay', (delay) => this.setDelay(delay));

    // Auto-select default track if present
    const defaultTrack = this.tracks.find((t) => t.default);
    if (defaultTrack) {
      this.setTrack(defaultTrack.id);
    }
  }

  /**
   * Add a subtitle track
   * @param {Object} track { id, label, src, srclang, default, cues }
   */
  async addTrack(track) {
    const id = track.id || track.srclang || `track-${this.tracks.length + 1}`;
    const newTrack = {
      id,
      label: track.label || track.srclang || `Track ${this.tracks.length + 1}`,
      src: track.src,
      srclang: track.srclang || 'en',
      default: Boolean(track.default),
      cues: Array.isArray(track.cues) ? track.cues : []
    };

    this.tracks.push(newTrack);
    this.state.set('subtitles', [...this.tracks]);

    // If active, load cues now
    if (this.activeTrackId === id) {
      await this.loadTrackCues(newTrack);
      this.updateDisplay();
    }
  }

  /**
   * Load and parse cues for a track
   * @param {Object} track
   */
  async loadTrackCues(track) {
    if (track.cues && track.cues.length > 0) {
      this.currentCues = track.cues;
      return;
    }

    if (!track.src) return;

    try {
      const response = await fetch(track.src);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rawText = await response.text();
      const cleanText = rawText.replace(/^\uFEFF/, '').trim();
      track.cues = parseSrt(cleanText);
      this.currentCues = track.cues;
    } catch (err) {
      console.warn(`[Yogi_PLY] Failed to load subtitle track "${track.label}":`, err);
      this.currentCues = [];
    }
  }

  /**
   * Switch active subtitle track by ID ('off' to disable)
   * @param {string} trackId
   */
  async setTrack(trackId) {
    this.activeTrackId = trackId;
    this.state.set('currentSubtitle', trackId);

    if (trackId === 'off') {
      this.currentCues = [];
      this.element.innerHTML = '';
      this.element.style.display = 'none';
      return;
    }

    const track = this.tracks.find((t) => t.id === trackId);
    if (track) {
      this.element.style.display = 'block';
      await this.loadTrackCues(track);
      this.updateDisplay();
    }
  }

  /**
   * Set subtitle text size: 'small' | 'medium' | 'large'
   * @param {string} size
   */
  setSize(size) {
    if (!this.element) return;
    this.element.classList.remove('yogi-ply-subtitles-small', 'yogi-ply-subtitles-medium', 'yogi-ply-subtitles-large');
    this.element.classList.add(`yogi-ply-subtitles-${size || 'medium'}`);
    this.state.set('subtitleSize', size);
  }

  /**
   * Set subtitle position: 'bottom' | 'top'
   * @param {string} position
   */
  setPosition(position) {
    if (!this.element) return;
    this.element.classList.remove('yogi-ply-subtitles-bottom', 'yogi-ply-subtitles-top');
    this.element.classList.add(`yogi-ply-subtitles-${position || 'bottom'}`);
    this.state.set('subtitlePosition', position);
  }

  /**
   * Set subtitle synchronization delay in seconds
   * @param {number} delaySeconds
   */
  setDelay(delaySeconds) {
    this.delay = Number(delaySeconds) || 0;
    this.state.set('subtitleDelay', this.delay);
    this.updateDisplay();
  }

  /**
   * Update rendered subtitle cue based on current video time + delay
   */
  updateDisplay() {
    if (!this.element || this.activeTrackId === 'off') return;

    const time = (this.video ? this.video.currentTime : 0) + this.delay;
    const activeCue = this.currentCues.find(
      (cue) => time >= cue.start && time <= cue.end
    );

    if (activeCue) {
      // Escape HTML and format safely
      const safeLines = activeCue.text
        .split('\n')
        .map((line) => {
          const escaped = escapeHtml(line);
          // Allow safe emphasis tags
          return escaped
            .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, '<i>$1</i>')
            .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi, '<b>$1</b>')
            .replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u>$1</u>');
        })
        .join('<br>');

      this.element.innerHTML = `<span class="yogi-ply-subtitle-cue yogi-anim-sub-enter">${safeLines}</span>`;
      this.element.style.display = 'block';
    } else {
      this.element.innerHTML = '';
    }
  }

  destroy() {
    this.tracker.destroy();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.tracks = [];
    this.currentCues = [];
  }
}
