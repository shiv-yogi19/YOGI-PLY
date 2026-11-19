/**
 * Yogi_PLY - Player State Store
 * Created By Shiv Yogi
 */

import { EventEmitter } from './EventEmitter.js';

export class State extends EventEmitter {
  constructor(initialValues = {}) {
    super();

    this.data = {
      playing: false,
      paused: true,
      currentTime: 0,
      duration: 0,
      buffered: 0,
      volume: 1,
      muted: false,
      playbackRate: 1,
      quality: 'auto',
      qualities: [{ label: 'Auto', value: 'auto' }],
      subtitles: [],
      currentSubtitle: 'off',
      subtitleSize: 'medium', // small, medium, large
      subtitlePosition: 'bottom', // bottom, top
      audioTracks: [],
      currentAudioTrack: 'default',
      fullscreen: false,
      theatre: false,
      pip: false,
      controlsVisible: true,
      seeking: false,
      loading: false,
      buffering: false,
      ended: false,
      error: null,
      theme: 'liquid-glass',
      loop: false,
      playlist: [],
      playlistIndex: 0,
      chapters: [],
      currentChapter: null,
      skipIntro: null, // { start: number, end: number }
      skipOutro: null, // { start: number, end: number }
      watermark: {
        enabled: true,
        text: 'Created By Shiv Yogi',
        color: '#ffffff',
        opacity: 0.28,
        fontSize: '13px',
        interval: 12000,
        movement: true,
        animationStyle: 'fade-slide'
      },
      ...initialValues
    };
  }

  /**
   * Get state property
   * @param {string} key
   */
  get(key) {
    return this.data[key];
  }

  /**
   * Set state property and notify listeners
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    const oldValue = this.data[key];
    if (oldValue === value && typeof value !== 'object') {
      return;
    }

    this.data[key] = value;
    this.emit('change', { key, value, oldValue });
    this.emit(`change:${key}`, value, oldValue);
  }

  /**
   * Update multiple state properties at once
   * @param {Object} partialState
   */
  update(partialState) {
    for (const [key, value] of Object.entries(partialState)) {
      this.set(key, value);
    }
  }

  /**
   * Subscribe to changes on a specific state key
   * @param {string} key
   * @param {Function} callback
   */
  subscribe(key, callback) {
    const handler = (val, oldVal) => callback(val, oldVal);
    this.on(`change:${key}`, handler);
    return () => this.off(`change:${key}`, handler);
  }
}
