/**
 * Yogi_PLY - HTML5 Video Engine
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

import { ListenerTracker } from '../utils/dom.js';

export class Engine {
  /**
   * @param {HTMLVideoElement} video
   * @param {State} state
   * @param {Object} options
   */
  constructor(video, state, options = {}) {
    this.video = video;
    this.state = state;
    this.options = options;
    this.tracker = new ListenerTracker();
    this.resumeKeyPrefix = 'yogi_resume_';

    this.sleepTimerId = null;
    this.sleepTimerEndTimestamp = null;
    this.repeatA = null;
    this.repeatB = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.applyOptions();
    this.setupMediaSession();
  }

  applyOptions() {
    if (this.options.autoplay) {
      this.video.autoplay = true;
    }
    if (this.options.muted) {
      this.video.muted = true;
      this.state.set('muted', true);
    }
    if (this.options.loop) {
      this.video.loop = true;
      this.state.set('loop', true);
    }
    if (this.options.poster) {
      this.video.poster = this.options.poster;
    }
    if (typeof this.options.volume === 'number') {
      this.video.volume = Math.max(0, Math.min(1, this.options.volume));
      this.state.set('volume', this.video.volume);
    }

    // Playsinline is crucial for mobile iOS / Android inline playback
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');
  }

  bindEvents() {
    const v = this.video;
    const s = this.state;

    this.tracker.add(v, 'loadstart', () => {
      s.set('loading', true);
    });

    this.tracker.add(v, 'loadedmetadata', () => {
      s.set('duration', v.duration || 0);
      s.set('videoWidth', v.videoWidth || 0);
      s.set('videoHeight', v.videoHeight || 0);
      s.set('loading', false);
      s.emit('loadedmetadata', v.duration);

      // Check auto-resume
      if (this.options.autoResume !== false) {
        this.checkAutoResume();
      }
      this.updateMediaSession();
    });

    this.tracker.add(v, 'play', () => {
      s.set('playing', true);
      s.set('paused', false);
      s.set('ended', false);
      s.emit('play');
      this.updateMediaSessionPlaybackState('playing');
    });

    this.tracker.add(v, 'pause', () => {
      s.set('playing', false);
      s.set('paused', true);
      s.emit('pause');
      this.updateMediaSessionPlaybackState('paused');
    });

    this.tracker.add(v, 'timeupdate', () => {
      const cur = v.currentTime;
      s.set('currentTime', cur);
      s.emit('timeupdate', cur);
      this.saveResumePosition();

      // Check A-B Repeat loop
      if (this.repeatA !== null && this.repeatB !== null && this.repeatB > this.repeatA) {
        if (cur >= this.repeatB) {
          v.currentTime = this.repeatA;
        }
      }
    });

    this.tracker.add(v, 'progress', () => {
      if (v.buffered && v.buffered.length > 0 && v.duration) {
        const bufferedEnd = v.buffered.end(v.buffered.length - 1);
        const ratio = bufferedEnd / v.duration;
        s.set('buffered', Math.min(1, ratio));
        s.set('bufferedSeconds', bufferedEnd);
      }
    });

    this.tracker.add(v, 'seeking', () => {
      s.set('seeking', true);
      s.emit('seeking', v.currentTime);
    });

    this.tracker.add(v, 'seeked', () => {
      s.set('seeking', false);
      s.emit('seeked', v.currentTime);
    });

    this.tracker.add(v, 'waiting', () => {
      s.set('loading', true);
      s.set('buffering', true);
      s.emit('waiting');
    });

    this.tracker.add(v, 'playing', () => {
      s.set('loading', false);
      s.set('buffering', false);
    });

    this.tracker.add(v, 'canplay', () => {
      s.set('loading', false);
      s.emit('canplay');
    });

    this.tracker.add(v, 'volumechange', () => {
      s.set('volume', v.volume);
      s.set('muted', v.muted);
      s.emit('volumechange', { volume: v.volume, muted: v.muted });
    });

    this.tracker.add(v, 'ratechange', () => {
      s.set('playbackRate', v.playbackRate);
      s.emit('ratechange', v.playbackRate);
    });

    this.tracker.add(v, 'ended', () => {
      s.set('playing', false);
      s.set('paused', true);
      s.set('ended', true);
      s.emit('ended');
      this.clearResumePosition();
      this.updateMediaSessionPlaybackState('none');

      // Check sleep timer 'end-of-video'
      if (this.state.get('sleepTimer') === 'end') {
        this.clearSleepTimer();
      }
    });

    this.tracker.add(v, 'error', () => {
      const err = v.error ? `Video error code ${v.error.code}: ${v.error.message || 'Media playback failed'}` : 'Video playback error';
      s.set('loading', false);
      s.set('error', err);
      s.emit('error', err);
    });
  }

  /* =========================================
     MEDIA SESSION API SUPPORT
     ========================================= */
  setupMediaSession() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => this.play().catch(() => {}));
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        this.seek(this.video.currentTime - offset);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        this.seek(this.video.currentTime + offset);
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
    } catch (e) {
      // Ignore unsupported action handler errors
    }
  }

  updateMediaSession() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      const title = this.options.title || 'Yogi_PLY Video';
      const artwork = this.options.poster ? [{ src: this.options.poster, sizes: '512x512', type: 'image/jpeg' }] : [];

      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: 'Created By Shiv Yogi',
        album: 'Yogi_PLY Universal Player',
        artwork
      });
    } catch (e) {}
  }

  updateMediaSessionPlaybackState(state) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch (e) {}
  }

  /* =========================================
     RESUME & PLAYBACK POSITION
     ========================================= */
  getResumeStorageKey() {
    const src = this.video.currentSrc || this.video.src;
    if (!src) return null;
    return `${this.resumeKeyPrefix}${encodeURIComponent(src)}`;
  }

  saveResumePosition() {
    if (typeof localStorage === 'undefined' || this.options.autoResume === false) return;
    const key = this.getResumeStorageKey();
    if (!key) return;

    const time = this.video.currentTime;
    const dur = this.video.duration;

    // Only save if beyond 5 seconds and not within 10 seconds of end
    if (time > 5 && dur && time < dur - 10) {
      try {
        localStorage.setItem(key, String(Math.floor(time)));
      } catch (e) {}
    }
  }

  checkAutoResume() {
    if (typeof localStorage === 'undefined' || this.options.autoResume === false) return;
    const key = this.getResumeStorageKey();
    if (!key) return;

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const time = parseFloat(saved);
        if (!isNaN(time) && time > 0 && time < (this.video.duration - 10)) {
          this.video.currentTime = time;
          this.state.emit('autoresume', time);
        }
      }
    } catch (e) {}
  }

  clearResumePosition() {
    if (typeof localStorage === 'undefined') return;
    const key = this.getResumeStorageKey();
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  }

  /* =========================================
     SLEEP TIMER
     ========================================= */
  setSleepTimer(minutesOrType) {
    this.clearSleepTimer();

    if (!minutesOrType || minutesOrType === 'off' || minutesOrType === 0) {
      this.state.set('sleepTimer', 'off');
      this.state.set('sleepTimerRemaining', null);
      return;
    }

    if (minutesOrType === 'end') {
      this.state.set('sleepTimer', 'end');
      this.state.set('sleepTimerRemaining', 'End of Video');
      return;
    }

    const minutes = Number(minutesOrType);
    if (isNaN(minutes) || minutes <= 0) return;

    const ms = minutes * 60 * 1000;
    this.sleepTimerEndTimestamp = Date.now() + ms;
    this.state.set('sleepTimer', minutes);
    this.state.set('sleepTimerRemaining', `${minutes}m`);

    this.sleepTimerId = setInterval(() => {
      const remainingMs = this.sleepTimerEndTimestamp - Date.now();
      if (remainingMs <= 0) {
        this.clearSleepTimer();
        this.pause();
        this.state.emit('sleeptimertrigger');
      } else {
        const remainingMin = Math.ceil(remainingMs / 60000);
        this.state.set('sleepTimerRemaining', `${remainingMin}m`);
      }
    }, 1000);
  }

  clearSleepTimer() {
    if (this.sleepTimerId) {
      clearInterval(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    this.sleepTimerEndTimestamp = null;
    this.state.set('sleepTimer', 'off');
    this.state.set('sleepTimerRemaining', null);
  }

  /* =========================================
     A-B REPEAT
     ========================================= */
  setRepeatPointA(time = null) {
    this.repeatA = time !== null ? time : this.video.currentTime;
    this.state.set('repeatA', this.repeatA);
  }

  setRepeatPointB(time = null) {
    this.repeatB = time !== null ? time : this.video.currentTime;
    this.state.set('repeatB', this.repeatB);
    if (this.repeatA !== null && this.repeatB > this.repeatA) {
      this.seek(this.repeatA);
    }
  }

  clearRepeat() {
    this.repeatA = null;
    this.repeatB = null;
    this.state.set('repeatA', null);
    this.state.set('repeatB', null);
  }

  /* =========================================
     FRAME-BY-FRAME NAVIGATION
     ========================================= */
  stepFrame(direction = 1, fps = 30) {
    const frameDuration = 1 / (fps || 30);
    this.pause();
    this.seek(this.video.currentTime + direction * frameDuration);
  }

  /* =========================================
     CORE PLAYBACK CONTROLS
     ========================================= */
  async play() {
    try {
      return await this.video.play();
    } catch (err) {
      // Browser autoplay restriction: if autoplay with sound blocked, fallback or inform
      if (err.name === 'NotAllowedError') {
        console.warn('[Yogi_PLY] Autoplay with audio was prevented by browser policy.');
        if (this.options.mutedAutoplayFallback) {
          this.video.muted = true;
          this.state.set('muted', true);
          return await this.video.play();
        }
      }
      throw err;
    }
  }

  pause() {
    this.video.pause();
  }

  seek(seconds) {
    if (isNaN(seconds)) return;
    const clamped = Math.max(0, Math.min(this.video.duration || 0, seconds));
    this.video.currentTime = clamped;
  }

  setVolume(vol) {
    if (isNaN(vol)) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.video.volume = clamped;
    if (clamped > 0 && this.video.muted) {
      this.video.muted = false;
    }
  }

  mute() {
    this.video.muted = true;
  }

  unmute() {
    this.video.muted = false;
  }

  setPlaybackRate(rate) {
    if (isNaN(rate) || rate <= 0) return;
    this.video.playbackRate = rate;
  }

  destroy() {
    this.clearSleepTimer();
    this.tracker.destroy();
    try {
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.load();
    } catch (e) {}
  }
}
