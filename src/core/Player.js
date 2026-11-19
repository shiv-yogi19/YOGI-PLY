/**
 * Yogi_PLY - Universal Liquid Glass Video Player
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

import { EventEmitter } from './EventEmitter.js';
import { State } from './State.js';
import { Engine } from './Engine.js';
import { inspectMediaCompatibility } from './MediaCompatibility.js';
import { createElement, ListenerTracker } from '../utils/dom.js';
import { requestFullscreen, exitFullscreen, isFullscreen, getFullscreenChangeEventName } from '../utils/fullscreen.js';
import { captureScreenshot } from '../utils/screenshot.js';
import { Watermark, PERMANENT_WATERMARK_TEXT } from '../watermark/Watermark.js';
import { SubtitleManager } from '../subtitles/SubtitleManager.js';
import { ChapterManager } from '../chapters/ChapterManager.js';
import { Controls } from '../controls/Controls.js';
import { SettingsMenu } from '../settings/SettingsMenu.js';
import { PlaylistManager } from '../playlist/PlaylistManager.js';
import { GestureManager } from '../gestures/GestureManager.js';
import { KeyboardManager } from '../accessibility/KeyboardManager.js';
import { AnimationEngine } from '../animations/AnimationEngine.js';
import { HlsAdapter } from '../streaming/HlsAdapter.js';
import { DashAdapter } from '../streaming/DashAdapter.js';
import { YouTubeAdapter } from '../adapters/YouTubeAdapter.js';
import { VimeoAdapter } from '../adapters/VimeoAdapter.js';
import { THEMES } from '../themes/themes.js';

let instanceCounter = 0;

export class Player extends EventEmitter {
  /**
   * @param {HTMLElement|string} target Selector or element
   * @param {Object} options Configuration options
   */
  constructor(target, options = {}) {
    super();

    this.id = `yogi-ply-${++instanceCounter}`;
    this.options = {
      source: '',
      sources: [],
      poster: '',
      title: 'Yogi_PLY Cinematic Player',
      autoplay: false,
      muted: false,
      loop: false,
      volume: 1,
      theme: 'liquid-glass',
      layout: 'cinematic',
      controls: true,
      showBackButton: false,
      watermark: {
        opacity: 0.28,
        interval: 12000,
        movement: true,
        animationStyle: 'fade-slide'
      },
      features: {
        playbackSpeed: true,
        quality: true,
        subtitles: true,
        chapters: true,
        audioTrack: true,
        aspectRatio: true,
        sleepTimer: true,
        abRepeat: true,
        frameStep: true,
        subtitleDelay: true,
        audioDelay: true,
        loop: true,
        screenshot: true,
        pip: true,
        theatre: true,
        diagnostics: true
      },
      subtitles: [],
      chapters: [],
      playlist: [],
      autoNext: true,
      autoResume: true,
      skipIntro: null,
      skipOutro: null,
      mutedAutoplayFallback: true,
      enableSwipeGestures: 'fullscreen-only',
      ...options
    };

    // Resolve target element
    this.target = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.target) {
      throw new Error(`[Yogi_PLY] Target container element "${target}" was not found in document.`);
    }

    this.state = new State({
      theme: this.options.theme || 'liquid-glass',
      layout: this.options.layout || 'cinematic',
      chapters: this.options.chapters || [],
      skipIntro: this.options.skipIntro || null,
      skipOutro: this.options.skipOutro || null,
      loop: Boolean(this.options.loop),
      aspectRatio: '16:9',
      sleepTimer: 'off',
      sleepTimerRemaining: null,
      repeatA: null,
      repeatB: null,
      audioDelay: 0,
      subtitleDelay: 0
    });

    this.container = null;
    this.video = null;
    this.engine = null;
    this.controls = null;
    this.settingsMenu = null;
    this.watermark = null;
    this.subtitles = null;
    this.chapters = null;
    this.playlist = null;
    this.gestures = null;
    this.keyboard = null;
    this.animations = null;
    this.hlsAdapter = null;
    this.dashAdapter = null;
    this.externalAdapter = null;

    this.tracker = new ListenerTracker();

    this.init();
  }

  init() {
    this.buildDOM();
    this.initTheme();
    this.initWatermark();
    this.initSubtitles();
    this.initAnimations();
    this.chapters = new ChapterManager(this, this.options.chapters || []);

    if (this.options.controls !== false) {
      this.controls = new Controls(this.container, this);
      this.settingsMenu = new SettingsMenu(this.container, this);
    }

    if (this.options.playlist && this.options.playlist.length > 0) {
      this.playlist = new PlaylistManager(this.container, this, this.options.playlist, this.options.autoNext);
    }

    this.gestures = new GestureManager(this.container, this.video, this);
    this.keyboard = new KeyboardManager(this.container, this);

    this.bindEvents();

    // Load initial source
    if (this.options.source) {
      this.setSource(this.options.source);
    } else if (this.options.playlist && this.options.playlist.length > 0) {
      this.playlist.playIndex(0);
    }

    this.emit('ready', { id: this.id });
  }

  buildDOM() {
    if (this.target.tagName && this.target.tagName.toLowerCase() === 'video') {
      this.video = this.target;
      this.container = createElement('div', {
        className: 'yogi-ply yogi-anim-player-enter',
        id: this.id
      });
      this.video.parentNode.insertBefore(this.container, this.video);
      this.container.appendChild(this.video);
    } else {
      this.container = this.target;
      this.container.classList.add('yogi-ply', 'yogi-anim-player-enter');
      this.container.id = this.id;

      let existingVideo = this.container.querySelector('video');
      if (existingVideo) {
        this.video = existingVideo;
      } else {
        this.video = createElement('video', {
          playsinline: true,
          'webkit-playsinline': true
        });
        this.container.appendChild(this.video);
      }
    }

    if (this.options.layout === 'compact') {
      this.container.classList.add('yogi-ply-layout-compact');
    }

    this.engine = new Engine(this.video, this.state, this.options);
  }

  initTheme() {
    this.setTheme(this.options.theme || 'liquid-glass');
  }

  initAnimations() {
    this.animations = new AnimationEngine(this.container, this.options.animation);
  }

  initWatermark() {
    let wmConfig = {
      enabled: true,
      text: PERMANENT_WATERMARK_TEXT,
      color: '#ffffff',
      opacity: 0.28,
      fontSize: '13px',
      interval: 12000,
      movement: true,
      animationStyle: 'fade-slide'
    };

    if (typeof this.options.watermark === 'object' && this.options.watermark !== null) {
      if (typeof this.options.watermark.opacity === 'number') wmConfig.opacity = this.options.watermark.opacity;
      if (this.options.watermark.animationStyle) wmConfig.animationStyle = this.options.watermark.animationStyle;
      if (typeof this.options.watermark.movement === 'boolean') wmConfig.movement = this.options.watermark.movement;
      if (this.options.watermark.interval) wmConfig.interval = this.options.watermark.interval;
      if (this.options.watermark.color) wmConfig.color = this.options.watermark.color;
      if (this.options.watermark.fontSize) wmConfig.fontSize = this.options.watermark.fontSize;
    }

    // Immutable branding enforcement
    wmConfig.enabled = true;
    wmConfig.text = PERMANENT_WATERMARK_TEXT;

    this.state.set('watermark', wmConfig);
    this.watermark = new Watermark(this.container, wmConfig, this.state);
  }

  initSubtitles() {
    this.subtitles = new SubtitleManager(
      this.container,
      this.video,
      this.state,
      this.options.subtitles
    );
  }

  bindEvents() {
    const eventsToForward = [
      'play', 'pause', 'timeupdate', 'seeking', 'seeked',
      'volumechange', 'ratechange', 'ended', 'error', 'loadedmetadata',
      'waiting', 'canplay', 'chapterchange', 'sleeptimertrigger'
    ];

    eventsToForward.forEach((evt) => {
      this.state.on(evt, (...args) => this.emit(evt, ...args));
    });

    const fsEvent = getFullscreenChangeEventName();
    this.tracker.add(document, fsEvent, () => {
      const isFs = isFullscreen(this.container);
      this.state.set('fullscreen', isFs);
      this.emit('fullscreenchange', isFs);
    });

    this.tracker.add(this.video, 'enterpictureinpicture', () => {
      this.state.set('pip', true);
      this.emit('enterpictureinpicture');
    });
    this.tracker.add(this.video, 'leavepictureinpicture', () => {
      this.state.set('pip', false);
      this.emit('leavepictureinpicture');
    });
  }

  /* =========================================
     PUBLIC JAVASCRIPT API METHODS
     ========================================= */

  async play() {
    if (this.externalAdapter) {
      return this.externalAdapter.play();
    }
    return this.engine.play();
  }

  pause() {
    if (this.externalAdapter) {
      return this.externalAdapter.pause();
    }
    this.engine.pause();
  }

  togglePlay() {
    if (this.externalAdapter) {
      return this.externalAdapter.togglePlay();
    }
    if (this.state.get('playing')) {
      this.pause();
    } else {
      this.play().catch(() => {});
    }
  }

  toggle() {
    this.togglePlay();
  }

  restart() {
    this.seek(0);
    return this.play();
  }

  seek(seconds) {
    if (this.externalAdapter) {
      return this.externalAdapter.seek(seconds);
    }
    this.engine.seek(seconds);
  }

  setVolume(value) {
    if (this.externalAdapter) {
      return this.externalAdapter.setVolume(value);
    }
    this.engine.setVolume(value);
  }

  mute() {
    if (this.externalAdapter) {
      return this.externalAdapter.mute();
    }
    this.engine.mute();
  }

  unmute() {
    if (this.externalAdapter) {
      return this.externalAdapter.unmute();
    }
    this.engine.unmute();
  }

  setPlaybackRate(rate) {
    this.engine.setPlaybackRate(rate);
  }

  setLoop(val) {
    const isLoop = Boolean(val);
    this.state.set('loop', isLoop);
    if (this.video) {
      this.video.loop = isLoop;
    }
  }

  toggleLoop() {
    this.setLoop(!this.state.get('loop'));
  }

  isLoop() {
    return Boolean(this.state.get('loop'));
  }

  async setQuality(quality) {
    if (this.hlsAdapter) {
      this.hlsAdapter.setQuality(quality);
      this.emit('qualitychange', quality);
      return;
    }
    if (this.dashAdapter) {
      this.dashAdapter.setQuality(quality);
      this.emit('qualitychange', quality);
      return;
    }

    if (this.options.sources && this.options.sources.length > 0) {
      const match = this.options.sources.find((s) => s.label === quality || s.value === quality);
      if (match) {
        const curTime = this.video.currentTime;
        const wasPlaying = !this.video.paused;

        const onMetadata = () => {
          try {
            this.video.currentTime = curTime;
          } catch (e) {}
          if (wasPlaying) {
            this.play().catch(() => {});
          }
        };

        this.video.addEventListener('loadedmetadata', onMetadata, { once: true });
        this.video.src = match.src;
        this.video.load();

        this.state.set('quality', quality);
        this.emit('qualitychange', quality);
      }
    }
  }

  async setSource(source) {
    this.options.source = source;
    this.state.set('error', null);

    if (this.hlsAdapter) {
      this.hlsAdapter.destroy();
      this.hlsAdapter = null;
    }
    if (this.dashAdapter) {
      this.dashAdapter.destroy();
      this.dashAdapter = null;
    }
    if (this.externalAdapter) {
      this.externalAdapter.destroy();
      this.externalAdapter = null;
    }

    const compat = inspectMediaCompatibility(source, this.video);
    if (!compat.supported && compat.type !== 'external' && compat.type !== 'streaming') {
      const errMsg = compat.reason || 'Unsupported media format';
      this.state.set('error', errMsg);
      this.state.set('compatibilityNotice', compat);
      this.emit('unsupportedformat', compat);
      this.emit('error', errMsg);
      return;
    }

    if (YouTubeAdapter.isYouTubeUrl(source)) {
      this.externalAdapter = new YouTubeAdapter(this.container, this.options, this.state);
      this.video.style.display = 'none';
      await this.externalAdapter.load(source);
      return;
    }

    if (VimeoAdapter.isVimeoUrl(source)) {
      this.externalAdapter = new VimeoAdapter(this.container, this.options, this.state);
      this.video.style.display = 'none';
      await this.externalAdapter.load(source);
      return;
    }

    this.video.style.display = 'block';

    if (typeof source === 'string' && (source.includes('.m3u8') || source.includes('type=hls'))) {
      this.hlsAdapter = new HlsAdapter(this.video, this.state);
      await this.hlsAdapter.load(source);
      return;
    }

    if (typeof source === 'string' && (source.includes('.mpd') || source.includes('type=dash'))) {
      this.dashAdapter = new DashAdapter(this.video, this.state);
      await this.dashAdapter.load(source);
      return;
    }

    this.video.src = source;
    this.video.load();

    if (Array.isArray(this.options.sources) && this.options.sources.length > 0) {
      const qList = this.options.sources.map((s) => ({ label: s.label || s.quality, value: s.label || s.quality }));
      this.state.set('qualities', qList);
    } else {
      this.state.set('qualities', [{ label: 'Auto (Original)', value: 'auto' }]);
    }
  }

  setPoster(url) {
    this.options.poster = url;
    if (this.video) {
      this.video.poster = url;
    }
  }

  setTitle(title) {
    this.options.title = title;
    this.state.set('title', title);
    const titleEl = this.container.querySelector('.yogi-ply-title');
    if (titleEl) titleEl.textContent = title;
    this.engine.updateMediaSession();
  }

  setChapters(chapters) {
    this.options.chapters = chapters;
    if (this.chapters) {
      return this.chapters.setChapters(chapters);
    }
    this.state.set('chapters', chapters);
    return chapters;
  }

  getChapters() {
    return this.chapters ? this.chapters.getChapters() : this.state.get('chapters') || [];
  }

  getCurrentChapter() {
    return this.chapters ? this.chapters.getCurrentChapter() : null;
  }

  nextChapter() {
    return this.chapters ? this.chapters.nextChapter() : null;
  }

  prevChapter() {
    return this.chapters ? this.chapters.prevChapter() : null;
  }

  seekToChapter(index) {
    return this.chapters ? this.chapters.seekToChapter(index) : null;
  }

  /* =========================================
     ADVANCED FEATURES: ASPECT RATIO, SLEEP TIMER,
     A-B REPEAT, FRAME STEPPING, AUDIO/SUB DELAY
     ========================================= */

  setAspectRatio(ratio) {
    this.state.set('aspectRatio', ratio);
    if (!this.video) return;

    if (ratio === 'Fill (Cover)') {
      this.video.style.objectFit = 'cover';
    } else if (ratio === 'Stretch') {
      this.video.style.objectFit = 'fill';
    } else {
      this.video.style.objectFit = 'contain';
    }

    this.emit('aspectratiochange', ratio);
  }

  setSleepTimer(minutesOrType) {
    this.engine.setSleepTimer(minutesOrType);
  }

  getSleepTimer() {
    return this.state.get('sleepTimer');
  }

  setRepeatPointA(time = null) {
    this.engine.setRepeatPointA(time);
  }

  setRepeatPointB(time = null) {
    this.engine.setRepeatPointB(time);
  }

  clearRepeat() {
    this.engine.clearRepeat();
  }

  stepFrame(direction = 1) {
    this.engine.stepFrame(direction);
  }

  setSubtitleDelay(seconds) {
    if (this.subtitles) {
      this.subtitles.setDelay(seconds);
    }
  }

  setAudioDelay(seconds) {
    const val = Number(seconds) || 0;
    this.state.set('audioDelay', val);
    this.emit('audiodelaychange', val);
  }

  getDiagnostics() {
    const v = this.video;
    let engineType = 'HTML5 Native';
    if (this.hlsAdapter) engineType = 'HLS.js Adaptive Bitrate';
    if (this.dashAdapter) engineType = 'DASH.js Adaptive Bitrate';
    if (this.externalAdapter) engineType = this.externalAdapter.providerName || 'External Frame';

    return {
      source: this.options.source || (v ? v.currentSrc : ''),
      resolution: v && v.videoWidth ? `${v.videoWidth}x${v.videoHeight}` : 'Unknown',
      viewport: this.container ? `${this.container.clientWidth}x${this.container.clientHeight}` : '0x0',
      duration: this.getDuration(),
      currentTime: this.getCurrentTime(),
      bufferedRatio: this.state.get('buffered') || 0,
      bufferedSeconds: this.state.get('bufferedSeconds') || 0,
      volume: this.getVolume(),
      isMuted: this.isMuted(),
      isPaused: this.isPaused(),
      playbackRate: this.getPlaybackRate(),
      engine: engineType,
      aspectRatio: this.state.get('aspectRatio') || '16:9',
      sleepTimer: this.state.get('sleepTimer') || 'off'
    };
  }

  async requestFullscreen() {
    await requestFullscreen(this.container, this.video);
  }

  async enterFullscreen() {
    return this.requestFullscreen();
  }

  async exitFullscreen() {
    await exitFullscreen(this.video);
  }

  toggleFullscreen() {
    if (isFullscreen(this.container)) {
      this.exitFullscreen();
    } else {
      this.requestFullscreen();
    }
  }

  toggleTheatre() {
    const isTheatre = !this.state.get('theatre');
    this.state.set('theatre', isTheatre);
    if (isTheatre) {
      this.container.classList.add('yogi-ply-theatre');
    } else {
      this.container.classList.remove('yogi-ply-theatre');
    }
    this.emit('theatrechange', isTheatre);
  }

  async togglePip() {
    if (!document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (this.video && this.video !== document.pictureInPictureElement) {
        await this.video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('[Yogi_PLY] Picture-in-Picture error:', err);
    }
  }

  /**
   * Update watermark visual animation and styling.
   * Note: The watermark text and active state are permanent and cannot be modified or disabled.
   * @param {Object} options Visual options only
   */
  setWatermark(options = {}) {
    if (!this.watermark) return;
    this.watermark.setOptions(options);
    this.state.set('watermark', { ...this.watermark.options });
    this.emit('watermarkchange', this.watermark.options);
  }

  setTheme(themeId) {
    const theme = THEMES[themeId] || THEMES['liquid-glass'];

    Object.values(THEMES).forEach((t) => {
      this.container.classList.remove(t.className);
    });

    this.container.classList.add(theme.className);

    for (const [varName, varVal] of Object.entries(theme.vars)) {
      this.container.style.setProperty(varName, varVal);
    }

    this.state.set('theme', themeId);
    this.emit('themechange', themeId);
  }

  setSubtitle(trackId) {
    if (this.subtitles) {
      this.subtitles.setTrack(trackId);
      this.emit('subtitlechange', trackId);
    }
  }

  toggleControls() {
    if (this.container.classList.contains('yogi-ply-controls-hidden')) {
      if (this.controls) this.controls.showControls();
    } else {
      if (this.controls) this.controls.hideControls();
    }
  }

  getCurrentTime() {
    if (this.externalAdapter) {
      return this.externalAdapter.getCurrentTime();
    }
    return this.video ? this.video.currentTime : 0;
  }

  getDuration() {
    if (this.externalAdapter) {
      return this.externalAdapter.getDuration();
    }
    return this.video ? this.video.duration : 0;
  }

  getVolume() {
    return this.video ? this.video.volume : 1;
  }

  getPlaybackRate() {
    return this.video ? this.video.playbackRate : 1;
  }

  getQuality() {
    return this.state.get('quality');
  }

  getQualities() {
    return this.state.get('qualities') || [];
  }

  getSubtitle() {
    return this.state.get('currentSubtitle');
  }

  getSubtitles() {
    return this.state.get('subtitles') || [];
  }

  isMuted() {
    return this.video ? this.video.muted : false;
  }

  isPaused() {
    return this.video ? this.video.paused : true;
  }

  isFullscreen() {
    return isFullscreen(this.container);
  }

  async captureScreenshot(filename = null) {
    if (!this.video) throw new Error('Video element unavailable');
    if (this.animations) {
      this.animations.flashScreenshot();
    }
    return captureScreenshot(this.video, filename);
  }

  destroy() {
    this.tracker.destroy();
    this.removeAllListeners();

    if (this.hlsAdapter) this.hlsAdapter.destroy();
    if (this.dashAdapter) this.dashAdapter.destroy();
    if (this.externalAdapter) this.externalAdapter.destroy();

    if (this.watermark) this.watermark.destroy();
    if (this.subtitles) this.subtitles.destroy();
    if (this.chapters) this.chapters.destroy();
    if (this.controls) this.controls.destroy();
    if (this.settingsMenu) this.settingsMenu.destroy();
    if (this.playlist) this.playlist.destroy();
    if (this.gestures) this.gestures.destroy();
    if (this.keyboard) this.keyboard.destroy();
    if (this.engine) this.engine.destroy();

    if (typeof window !== 'undefined' && window.YogiPLY && window.YogiPLY.instances) {
      window.YogiPLY.instances.delete(this.id);
    }

    this.container.classList.remove(
      'yogi-ply',
      'yogi-ply-theatre',
      'yogi-ply-controls-hidden',
      'yogi-ply-theme-liquid-glass',
      'yogi-ply-theme-dark',
      'yogi-ply-theme-light',
      'yogi-ply-theme-oled',
      'yogi-anim-player-enter'
    );
  }
}
