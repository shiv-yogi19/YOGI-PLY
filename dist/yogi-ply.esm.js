class EventEmitter {
  constructor() {
    this._events = /* @__PURE__ */ new Map();
  }
  /**
   * Register an event listener
   * @param {string} event
   * @param {Function} listener
   */
  on(event, listener) {
    if (typeof listener !== "function") return this;
    if (!this._events.has(event)) {
      this._events.set(event, /* @__PURE__ */ new Set());
    }
    this._events.get(event).add(listener);
    return this;
  }
  /**
   * Register a one-time event listener
   * @param {string} event
   * @param {Function} listener
   */
  once(event, listener) {
    if (typeof listener !== "function") return this;
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    onceWrapper._originalListener = listener;
    this.on(event, onceWrapper);
    return this;
  }
  /**
   * Remove an event listener
   * @param {string} event
   * @param {Function} listener
   */
  off(event, listener) {
    if (!this._events.has(event)) return this;
    const listeners = this._events.get(event);
    for (const fn of listeners) {
      if (fn === listener || fn._originalListener === listener) {
        listeners.delete(fn);
      }
    }
    if (listeners.size === 0) {
      this._events.delete(event);
    }
    return this;
  }
  /**
   * Trigger an event
   * @param {string} event
   * @param  {...any} args
   */
  emit(event, ...args) {
    if (!this._events.has(event)) return false;
    const listeners = Array.from(this._events.get(event));
    for (const listener of listeners) {
      try {
        listener.apply(this, args);
      } catch (err) {
        console.error(`[Yogi_PLY] Error in event listener for "${event}":`, err);
      }
    }
    return true;
  }
  /**
   * Remove all listeners
   * @param {string} [event]
   */
  removeAllListeners(event) {
    if (event) {
      this._events.delete(event);
    } else {
      this._events.clear();
    }
    return this;
  }
}
class State extends EventEmitter {
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
      quality: "auto",
      qualities: [{ label: "Auto", value: "auto" }],
      subtitles: [],
      currentSubtitle: "off",
      subtitleSize: "medium",
      // small, medium, large
      subtitlePosition: "bottom",
      // bottom, top
      audioTracks: [],
      currentAudioTrack: "default",
      fullscreen: false,
      theatre: false,
      pip: false,
      controlsVisible: true,
      seeking: false,
      loading: false,
      buffering: false,
      ended: false,
      error: null,
      theme: "liquid-glass",
      loop: false,
      playlist: [],
      playlistIndex: 0,
      chapters: [],
      currentChapter: null,
      skipIntro: null,
      // { start: number, end: number }
      skipOutro: null,
      // { start: number, end: number }
      watermark: {
        enabled: true,
        text: "Created By Shiv Yogi",
        color: "#ffffff",
        opacity: 0.28,
        fontSize: "13px",
        interval: 12e3,
        movement: true,
        animationStyle: "fade-slide"
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
    if (oldValue === value && typeof value !== "object") {
      return;
    }
    this.data[key] = value;
    this.emit("change", { key, value, oldValue });
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
function createElement(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === void 0) continue;
    if (key === "className" || key === "class") {
      element.className = value;
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else if (key === "textContent" || key === "text") {
      element.textContent = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else if (key.startsWith("data-")) {
      element.setAttribute(key, value);
    } else if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (typeof value === "boolean") {
      if (value) {
        element.setAttribute(key, "");
      }
    } else {
      element.setAttribute(key, String(value));
    }
  }
  const childArray = Array.isArray(children) ? children : [children];
  for (const child of childArray) {
    if (!child) continue;
    if (typeof child === "string" || typeof child === "number") {
      element.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }
  return element;
}
class ListenerTracker {
  constructor() {
    this.listeners = [];
  }
  /**
   * Add an event listener and track it
   */
  add(target, event, handler, options = false) {
    if (!target) return;
    target.addEventListener(event, handler, options);
    this.listeners.push({ target, event, handler, options });
  }
  /**
   * Remove a specific tracked listener
   */
  remove(target, event, handler) {
    if (!target) return;
    target.removeEventListener(event, handler);
    this.listeners = this.listeners.filter(
      (l) => !(l.target === target && l.event === event && l.handler === handler)
    );
  }
  /**
   * Remove all tracked listeners
   */
  destroy() {
    for (const { target, event, handler, options } of this.listeners) {
      try {
        target.removeEventListener(event, handler, options);
      } catch (e) {
      }
    }
    this.listeners = [];
  }
}
function getRelativeX(event, element) {
  const rect = element.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const relativeX = (clientX - rect.left) / rect.width;
  return Math.max(0, Math.min(1, relativeX));
}
class Engine {
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
    this.resumeKeyPrefix = "yogi_resume_";
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
      this.state.set("muted", true);
    }
    if (this.options.loop) {
      this.video.loop = true;
      this.state.set("loop", true);
    }
    if (this.options.poster) {
      this.video.poster = this.options.poster;
    }
    if (typeof this.options.volume === "number") {
      this.video.volume = Math.max(0, Math.min(1, this.options.volume));
      this.state.set("volume", this.video.volume);
    }
    this.video.setAttribute("playsinline", "");
    this.video.setAttribute("webkit-playsinline", "");
  }
  bindEvents() {
    const v = this.video;
    const s = this.state;
    this.tracker.add(v, "loadstart", () => {
      s.set("loading", true);
    });
    this.tracker.add(v, "loadedmetadata", () => {
      s.set("duration", v.duration || 0);
      s.set("videoWidth", v.videoWidth || 0);
      s.set("videoHeight", v.videoHeight || 0);
      s.set("loading", false);
      s.emit("loadedmetadata", v.duration);
      if (this.options.autoResume !== false) {
        this.checkAutoResume();
      }
      this.updateMediaSession();
    });
    this.tracker.add(v, "play", () => {
      s.set("playing", true);
      s.set("paused", false);
      s.set("ended", false);
      s.emit("play");
      this.updateMediaSessionPlaybackState("playing");
    });
    this.tracker.add(v, "pause", () => {
      s.set("playing", false);
      s.set("paused", true);
      s.emit("pause");
      this.updateMediaSessionPlaybackState("paused");
    });
    this.tracker.add(v, "timeupdate", () => {
      const cur = v.currentTime;
      s.set("currentTime", cur);
      s.emit("timeupdate", cur);
      this.saveResumePosition();
      if (this.repeatA !== null && this.repeatB !== null && this.repeatB > this.repeatA) {
        if (cur >= this.repeatB) {
          v.currentTime = this.repeatA;
        }
      }
    });
    this.tracker.add(v, "progress", () => {
      if (v.buffered && v.buffered.length > 0 && v.duration) {
        const bufferedEnd = v.buffered.end(v.buffered.length - 1);
        const ratio = bufferedEnd / v.duration;
        s.set("buffered", Math.min(1, ratio));
        s.set("bufferedSeconds", bufferedEnd);
      }
    });
    this.tracker.add(v, "seeking", () => {
      s.set("seeking", true);
      s.emit("seeking", v.currentTime);
    });
    this.tracker.add(v, "seeked", () => {
      s.set("seeking", false);
      s.emit("seeked", v.currentTime);
    });
    this.tracker.add(v, "waiting", () => {
      s.set("loading", true);
      s.set("buffering", true);
      s.emit("waiting");
    });
    this.tracker.add(v, "playing", () => {
      s.set("loading", false);
      s.set("buffering", false);
    });
    this.tracker.add(v, "canplay", () => {
      s.set("loading", false);
      s.emit("canplay");
    });
    this.tracker.add(v, "volumechange", () => {
      s.set("volume", v.volume);
      s.set("muted", v.muted);
      s.emit("volumechange", { volume: v.volume, muted: v.muted });
    });
    this.tracker.add(v, "ratechange", () => {
      s.set("playbackRate", v.playbackRate);
      s.emit("ratechange", v.playbackRate);
    });
    this.tracker.add(v, "ended", () => {
      s.set("playing", false);
      s.set("paused", true);
      s.set("ended", true);
      s.emit("ended");
      this.clearResumePosition();
      this.updateMediaSessionPlaybackState("none");
      if (this.state.get("sleepTimer") === "end") {
        this.clearSleepTimer();
      }
    });
    this.tracker.add(v, "error", () => {
      const err = v.error ? `Video error code ${v.error.code}: ${v.error.message || "Media playback failed"}` : "Video playback error";
      s.set("loading", false);
      s.set("error", err);
      s.emit("error", err);
    });
  }
  /* =========================================
     MEDIA SESSION API SUPPORT
     ========================================= */
  setupMediaSession() {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler("play", () => this.play().catch(() => {
      }));
      navigator.mediaSession.setActionHandler("pause", () => this.pause());
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const offset = details.seekOffset || 10;
        this.seek(this.video.currentTime - offset);
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const offset = details.seekOffset || 10;
        this.seek(this.video.currentTime + offset);
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== void 0) {
          this.seek(details.seekTime);
        }
      });
    } catch (e) {
    }
  }
  updateMediaSession() {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    try {
      const title = this.options.title || "Yogi_PLY Video";
      const artwork = this.options.poster ? [{ src: this.options.poster, sizes: "512x512", type: "image/jpeg" }] : [];
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: "Created By Shiv Yogi",
        album: "Yogi_PLY Universal Player",
        artwork
      });
    } catch (e) {
    }
  }
  updateMediaSessionPlaybackState(state) {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch (e) {
    }
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
    if (typeof localStorage === "undefined" || this.options.autoResume === false) return;
    const key = this.getResumeStorageKey();
    if (!key) return;
    const time = this.video.currentTime;
    const dur = this.video.duration;
    if (time > 5 && dur && time < dur - 10) {
      try {
        localStorage.setItem(key, String(Math.floor(time)));
      } catch (e) {
      }
    }
  }
  checkAutoResume() {
    if (typeof localStorage === "undefined" || this.options.autoResume === false) return;
    const key = this.getResumeStorageKey();
    if (!key) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const time = parseFloat(saved);
        if (!isNaN(time) && time > 0 && time < this.video.duration - 10) {
          this.video.currentTime = time;
          this.state.emit("autoresume", time);
        }
      }
    } catch (e) {
    }
  }
  clearResumePosition() {
    if (typeof localStorage === "undefined") return;
    const key = this.getResumeStorageKey();
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
      }
    }
  }
  /* =========================================
     SLEEP TIMER
     ========================================= */
  setSleepTimer(minutesOrType) {
    this.clearSleepTimer();
    if (!minutesOrType || minutesOrType === "off" || minutesOrType === 0) {
      this.state.set("sleepTimer", "off");
      this.state.set("sleepTimerRemaining", null);
      return;
    }
    if (minutesOrType === "end") {
      this.state.set("sleepTimer", "end");
      this.state.set("sleepTimerRemaining", "End of Video");
      return;
    }
    const minutes = Number(minutesOrType);
    if (isNaN(minutes) || minutes <= 0) return;
    const ms = minutes * 60 * 1e3;
    this.sleepTimerEndTimestamp = Date.now() + ms;
    this.state.set("sleepTimer", minutes);
    this.state.set("sleepTimerRemaining", `${minutes}m`);
    this.sleepTimerId = setInterval(() => {
      const remainingMs = this.sleepTimerEndTimestamp - Date.now();
      if (remainingMs <= 0) {
        this.clearSleepTimer();
        this.pause();
        this.state.emit("sleeptimertrigger");
      } else {
        const remainingMin = Math.ceil(remainingMs / 6e4);
        this.state.set("sleepTimerRemaining", `${remainingMin}m`);
      }
    }, 1e3);
  }
  clearSleepTimer() {
    if (this.sleepTimerId) {
      clearInterval(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    this.sleepTimerEndTimestamp = null;
    this.state.set("sleepTimer", "off");
    this.state.set("sleepTimerRemaining", null);
  }
  /* =========================================
     A-B REPEAT
     ========================================= */
  setRepeatPointA(time = null) {
    this.repeatA = time !== null ? time : this.video.currentTime;
    this.state.set("repeatA", this.repeatA);
  }
  setRepeatPointB(time = null) {
    this.repeatB = time !== null ? time : this.video.currentTime;
    this.state.set("repeatB", this.repeatB);
    if (this.repeatA !== null && this.repeatB > this.repeatA) {
      this.seek(this.repeatA);
    }
  }
  clearRepeat() {
    this.repeatA = null;
    this.repeatB = null;
    this.state.set("repeatA", null);
    this.state.set("repeatB", null);
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
      if (err.name === "NotAllowedError") {
        console.warn("[Yogi_PLY] Autoplay with audio was prevented by browser policy.");
        if (this.options.mutedAutoplayFallback) {
          this.video.muted = true;
          this.state.set("muted", true);
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
      this.video.removeAttribute("src");
      this.video.load();
    } catch (e) {
    }
  }
}
const FORMAT_DEFINITIONS = {
  // Web Standard Containers
  mp4: {
    container: "MP4 (MPEG-4 Part 14)",
    mimes: [
      'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
      // H.264 + AAC
      'video/mp4; codecs="av01.0.05M.08, mp4a.40.2"',
      // AV1 + AAC
      'video/mp4; codecs="hev1.1.6.L93.B0, mp4a.40.2"'
      // H.265 / HEVC
    ],
    webStandard: true,
    description: "Widely supported across all modern mobile and desktop browsers."
  },
  webm: {
    container: "WebM",
    mimes: [
      'video/webm; codecs="vp9, opus"',
      'video/webm; codecs="vp8, vorbis"',
      'video/webm; codecs="av1, opus"'
    ],
    webStandard: true,
    description: "Open web media format supported by Chrome, Firefox, Edge, and modern Safari."
  },
  ogg: {
    container: "Ogg Video (OGV/OGG)",
    mimes: ['video/ogg; codecs="theora, vorbis"'],
    webStandard: true,
    description: "Open source format supported in Firefox, Chrome, and desktop platforms."
  },
  ogv: {
    container: "Ogg Video",
    mimes: ['video/ogg; codecs="theora, vorbis"'],
    webStandard: true,
    description: "Open source format supported in Firefox, Chrome, and desktop platforms."
  },
  mov: {
    container: "Apple QuickTime Movie",
    mimes: ["video/quicktime", "video/mp4"],
    webStandard: true,
    description: "Supported natively on Apple Safari and iOS devices; may require H.264/AAC for Chromium."
  },
  m4v: {
    container: "Apple iTunes Video",
    mimes: ["video/x-m4v", "video/mp4"],
    webStandard: true,
    description: "MPEG-4 derivative, supported in Safari and modern browsers."
  },
  m3u8: {
    container: "HLS (HTTP Live Streaming)",
    mimes: ["application/vnd.apple.mpegurl", "application/x-mpegURL"],
    streaming: true,
    description: "Supported natively in Safari and via Hls.js in all MSE-compliant browsers."
  },
  mpd: {
    container: "MPEG-DASH",
    mimes: ["application/dash+xml"],
    streaming: true,
    description: "Supported via Dash.js in all MSE-compliant browsers."
  },
  // Legacy & Professional Broadcast Containers (Non-Web Standard)
  mkv: {
    container: "Matroska Video (MKV)",
    mimes: ["video/x-matroska", "video/webm"],
    webStandard: false,
    description: "Flexible container. Plays if containing VP8/VP9/H.264 in Chromium; unsupported in Safari/Firefox without remuxing."
  },
  avi: {
    container: "Audio Video Interleave (AVI)",
    mimes: ["video/x-msvideo", "video/avi"],
    webStandard: false,
    description: "Legacy Microsoft container. Not supported natively by HTML5 web browsers."
  },
  wmv: {
    container: "Windows Media Video (WMV)",
    mimes: ["video/x-ms-wmv"],
    webStandard: false,
    description: "Proprietary Microsoft codec. Not supported natively by HTML5 web browsers."
  },
  flv: {
    container: "Flash Video (FLV)",
    mimes: ["video/x-flv"],
    webStandard: false,
    description: "Deprecated Adobe Flash format. Requires transcoding to MP4 for web playback."
  },
  asf: {
    container: "Advanced Systems Format (ASF)",
    mimes: ["video/x-ms-asf"],
    webStandard: false,
    description: "Legacy Microsoft format. Not supported natively by web browsers."
  },
  mxf: {
    container: "Material Exchange Format (MXF)",
    mimes: ["application/mxf"],
    webStandard: false,
    description: "Professional broadcast format. Not playable in HTML5 video elements."
  },
  vob: {
    container: "DVD Video Object (VOB / MPEG-2)",
    mimes: ["video/x-ms-vob", "video/mpeg"],
    webStandard: false,
    description: "DVD container with MPEG-2 codec. Not supported by HTML5 web standards."
  },
  ts: {
    container: "MPEG Transport Stream (.ts)",
    mimes: ["video/mp2t"],
    webStandard: false,
    description: "Raw transport stream. Plays through HLS (.m3u8) playlists or Safari native HLS."
  },
  mts: {
    container: "AVCHD Transport Stream (.mts)",
    mimes: ["video/mp2t", "video/mts"],
    webStandard: false,
    description: "Camcorder format. Not supported natively by HTML5 video elements."
  },
  m2ts: {
    container: "Blu-ray BDAV Video (.m2ts)",
    mimes: ["video/mp2t"],
    webStandard: false,
    description: "Blu-ray stream format. Not supported natively by web browsers."
  },
  mpeg: {
    container: "MPEG-1 / MPEG-2 Video",
    mimes: ["video/mpeg"],
    webStandard: false,
    description: "Legacy MPEG codec. Broad browser support requires MP4 (H.264)."
  },
  mpg: {
    container: "MPEG-1 / MPEG-2 Video",
    mimes: ["video/mpeg"],
    webStandard: false,
    description: "Legacy MPEG codec. Broad browser support requires MP4 (H.264)."
  },
  "3gp": {
    container: "3GPP Mobile Video",
    mimes: ["video/3gpp", "video/3gp"],
    webStandard: false,
    description: "Legacy 3G mobile format. Partially supported on mobile Android; unsupported on desktop browsers."
  },
  "3g2": {
    container: "3GPP2 Mobile Video",
    mimes: ["video/3gpp2"],
    webStandard: false,
    description: "Legacy 3G mobile format. Requires conversion to MP4 for web compatibility."
  }
};
function extractExtension(url) {
  if (!url || typeof url !== "string") return "";
  const cleanUrl = url.split("?")[0].split("#")[0];
  const parts = cleanUrl.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}
function inspectMediaCompatibility(url, videoElement) {
  if (!url || typeof url !== "string") {
    return {
      supported: false,
      extension: "",
      canPlay: "",
      reason: "No media source URL provided.",
      recommendation: "Provide a valid video URL."
    };
  }
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return {
      supported: true,
      type: "external",
      provider: "youtube",
      canPlay: "probably",
      description: "Handled via official YouTube IFrame Adapter."
    };
  }
  if (url.includes("vimeo.com")) {
    return {
      supported: true,
      type: "external",
      provider: "vimeo",
      canPlay: "probably",
      description: "Handled via official Vimeo Player Adapter."
    };
  }
  const ext = extractExtension(url);
  const def = FORMAT_DEFINITIONS[ext];
  if (ext === "m3u8") {
    const nativeSupport = videoElement && videoElement.canPlayType("application/vnd.apple.mpegurl");
    const hlsJsSupport = typeof window !== "undefined" && ("MediaSource" in window || "WebKitMediaSource" in window);
    const canPlayHls = Boolean(nativeSupport || hlsJsSupport);
    return {
      supported: canPlayHls,
      extension: "m3u8",
      type: "streaming",
      canPlay: canPlayHls ? "probably" : "",
      description: "HLS adaptive stream.",
      reason: canPlayHls ? null : "Browser lacks MediaSource Extensions and native HLS support."
    };
  }
  if (ext === "mpd") {
    const dashSupport = typeof window !== "undefined" && ("MediaSource" in window || "WebKitMediaSource" in window);
    return {
      supported: dashSupport,
      extension: "mpd",
      type: "streaming",
      canPlay: dashSupport ? "probably" : "",
      description: "MPEG-DASH adaptive stream.",
      reason: dashSupport ? null : "Browser lacks MediaSource Extensions support."
    };
  }
  if (!def) {
    return {
      supported: true,
      extension: ext || "unknown",
      canPlay: "maybe",
      description: "Unidentified container. Attempting standard HTML5 playback."
    };
  }
  if (!def.webStandard && !def.streaming) {
    let browserCan = "";
    if (videoElement && def.mimes) {
      for (const mime of def.mimes) {
        const can = videoElement.canPlayType(mime);
        if (can === "probably" || can === "maybe") {
          browserCan = can;
          break;
        }
      }
    }
    if (!browserCan) {
      return {
        supported: false,
        extension: ext,
        canPlay: "",
        container: def.container,
        reason: `${def.container} is not supported natively by HTML5 web browsers.`,
        recommendation: "Convert this video to MP4 (H.264/AAC) or WebM (VP9/Opus) for cross-browser playback."
      };
    }
  }
  let canPlay = "";
  if (videoElement && def.mimes) {
    for (const mime of def.mimes) {
      const res = videoElement.canPlayType(mime);
      if (res === "probably") {
        canPlay = "probably";
        break;
      } else if (res === "maybe" && !canPlay) {
        canPlay = "maybe";
      }
    }
  }
  return {
    supported: Boolean(canPlay || def.webStandard),
    extension: ext,
    container: def.container,
    canPlay: canPlay || (def.webStandard ? "maybe" : ""),
    description: def.description,
    reason: canPlay ? null : `${def.container} codecs may not be supported by this browser.`
  };
}
function isFullscreen(element) {
  const fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (!element) {
    return Boolean(fsElement);
  }
  return fsElement === element;
}
async function requestFullscreen(element, video) {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    return element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    return element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    return element.msRequestFullscreen();
  } else if (video && video.webkitEnterFullscreen) {
    return video.webkitEnterFullscreen();
  }
}
async function exitFullscreen(video) {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    return document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    return document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    return document.msExitFullscreen();
  } else if (video && video.webkitExitFullscreen) {
    return video.webkitExitFullscreen();
  }
}
function getFullscreenChangeEventName() {
  if ("onfullscreenchange" in document) return "fullscreenchange";
  if ("onwebkitfullscreenchange" in document) return "webkitfullscreenchange";
  if ("onmozfullscreenchange" in document) return "mozfullscreenchange";
  if ("onMSFullscreenChange" in document) return "MSFullscreenChange";
  return "fullscreenchange";
}
async function captureScreenshot(video, filename = null) {
  if (!video || !video.videoWidth || !video.videoHeight) {
    throw new Error("Video is not ready or has no valid visual dimensions");
  }
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas 2D rendering context");
  }
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } catch (err) {
    throw new Error("Screenshot failed: Cross-Origin restrictions prevent capturing frames without CORS headers on media.");
  }
  return new Promise((resolve, reject) => {
    try {
      const dataUrl = canvas.toDataURL("image/png");
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to generate image blob"));
          return;
        }
        const actualFilename = filename || `yogi-ply-snap-${Math.floor(video.currentTime)}s-${Date.now()}.png`;
        const link = document.createElement("a");
        link.download = actualFilename;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 5e3);
        resolve({ dataUrl, blob, filename: actualFilename });
      }, "image/png");
    } catch (err) {
      reject(err);
    }
  });
}
const WATERMARK_POSITIONS = [
  {
    id: "bottom-right",
    getStyle: (controlsActive, hasSubtitles) => ({
      bottom: controlsActive ? hasSubtitles ? "140px" : "108px" : hasSubtitles ? "80px" : "28px",
      right: "28px",
      top: "auto",
      left: "auto",
      transform: "none"
    })
  },
  {
    id: "top-left",
    getStyle: () => ({
      top: "24px",
      left: "28px",
      bottom: "auto",
      right: "auto",
      transform: "none"
    })
  },
  {
    id: "bottom-left",
    getStyle: (controlsActive, hasSubtitles) => ({
      bottom: controlsActive ? hasSubtitles ? "140px" : "108px" : hasSubtitles ? "80px" : "28px",
      left: "28px",
      top: "auto",
      right: "auto",
      transform: "none"
    })
  },
  {
    id: "top-right",
    getStyle: () => ({
      top: "24px",
      right: "28px",
      bottom: "auto",
      left: "auto",
      transform: "none"
    })
  },
  {
    id: "mid-right",
    getStyle: () => ({
      top: "45%",
      right: "28px",
      bottom: "auto",
      left: "auto",
      transform: "translateY(-50%)"
    })
  },
  {
    id: "mid-left",
    getStyle: () => ({
      top: "45%",
      left: "28px",
      bottom: "auto",
      right: "auto",
      transform: "translateY(-50%)"
    })
  }
];
function getSafePositions(hasSubtitles = false, controlsActive = true) {
  if (hasSubtitles) {
    return WATERMARK_POSITIONS.filter((p) => p.id.startsWith("top") || p.id.startsWith("mid")).map((pos) => ({
      id: pos.id,
      style: pos.getStyle(controlsActive, hasSubtitles)
    }));
  }
  return WATERMARK_POSITIONS.map((pos) => ({
    id: pos.id,
    style: pos.getStyle(controlsActive, hasSubtitles)
  }));
}
const PERMANENT_WATERMARK_TEXT = "Created By Shiv Yogi";
class Watermark {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   * @param {State} state
   */
  constructor(container, options = {}, state = null) {
    this.container = container;
    this.state = state;
    const permittedOpacity = typeof options.opacity === "number" ? Math.max(0.15, Math.min(0.85, options.opacity)) : 0.28;
    this.options = {
      // NON-NEGOTIABLE BRANDING: Always enabled and permanently fixed text
      enabled: true,
      text: PERMANENT_WATERMARK_TEXT,
      // Permitted visual settings:
      color: options.color || "#ffffff",
      opacity: permittedOpacity,
      fontSize: options.fontSize || "13px",
      interval: Math.max(3e3, Number(options.interval) || 12e3),
      movement: options.movement !== false,
      animationStyle: options.animationStyle || "fade-slide",
      // 'fade' | 'slide' | 'fade-slide' | 'glow' | 'pulse' | 'drift'
      transitionDuration: options.transitionDuration || 600,
      easing: options.easing || "cubic-bezier(0.2, 0.8, 0.2, 1)"
    };
    this.currentIndex = 0;
    this.timer = null;
    this.animTimeout = null;
    this.element = null;
    this.init();
  }
  init() {
    this.element = createElement("div", {
      className: "yogi-ply-watermark yogi-anim-watermark",
      role: "presentation",
      "aria-hidden": "true",
      "data-branding": "shiv-yogi"
    });
    this.updateStyleAndText();
    this.container.appendChild(this.element);
    if (this.state) {
      this.state.on("change:controlsVisible", () => this.refreshPosition());
      this.state.on("change:currentSubtitle", () => this.refreshPosition());
    }
    if (this.options.movement) {
      this.startTimer();
    }
  }
  updateStyleAndText() {
    if (!this.element) return;
    this.element.style.display = "block";
    this.element.textContent = PERMANENT_WATERMARK_TEXT;
    this.element.style.color = this.options.color;
    this.element.style.opacity = String(this.options.opacity);
    this.element.style.fontSize = this.options.fontSize;
    this.refreshPosition();
  }
  refreshPosition() {
    if (!this.element) return;
    const hasSubtitles = Boolean(this.state && this.state.get("currentSubtitle") !== "off");
    const controlsActive = Boolean(!this.state || this.state.get("controlsVisible"));
    const safePositions = getSafePositions(hasSubtitles, controlsActive);
    const pos = safePositions[this.currentIndex % safePositions.length] || safePositions[0];
    this.applyPosition(pos);
  }
  applyPosition(pos) {
    if (!this.element || !pos || !pos.style) return;
    const { top, right, bottom, left, transform } = pos.style;
    this.element.style.top = top;
    this.element.style.right = right;
    this.element.style.bottom = bottom;
    this.element.style.left = left;
    this.element.style.transform = transform;
  }
  /**
   * Smoothly move to next position using configured animation
   */
  moveToNextPosition() {
    if (!this.element || !this.options.movement) return;
    if (this.animTimeout) {
      clearTimeout(this.animTimeout);
      this.animTimeout = null;
    }
    const hasSubtitles = Boolean(this.state && this.state.get("currentSubtitle") !== "off");
    const controlsActive = Boolean(!this.state || this.state.get("controlsVisible"));
    const safePositions = getSafePositions(hasSubtitles, controlsActive);
    this.currentIndex = (this.currentIndex + 1) % safePositions.length;
    const nextPos = safePositions[this.currentIndex];
    const dur = this.options.transitionDuration;
    const easing = this.options.easing;
    if (this.options.animationStyle === "fade") {
      this.element.style.transition = `opacity ${dur}ms ${easing}`;
      this.element.style.opacity = "0";
      this.animTimeout = setTimeout(() => {
        if (!this.element) return;
        this.applyPosition(nextPos);
        this.element.style.opacity = String(this.options.opacity);
      }, dur + 50);
    } else if (this.options.animationStyle === "slide") {
      this.element.style.transition = `all ${dur * 1.5}ms ${easing}`;
      this.applyPosition(nextPos);
    } else if (this.options.animationStyle === "glow") {
      this.element.style.transition = `text-shadow ${dur}ms ease, opacity ${dur}ms ease`;
      this.element.style.textShadow = "0 0 14px rgba(255, 255, 255, 0.9)";
      this.animTimeout = setTimeout(() => {
        if (!this.element) return;
        this.applyPosition(nextPos);
        this.element.style.textShadow = "none";
      }, dur / 2);
    } else {
      this.element.style.transition = `opacity ${dur}ms ${easing}, transform ${dur}ms ${easing}`;
      this.element.style.opacity = "0";
      this.element.style.transform = `${nextPos.style.transform !== "none" ? nextPos.style.transform : ""} translateY(6px) scale(0.96)`.trim();
      this.animTimeout = setTimeout(() => {
        if (!this.element) return;
        this.applyPosition(nextPos);
        void this.element.offsetWidth;
        this.element.style.opacity = String(this.options.opacity);
        this.element.style.transform = nextPos.style.transform;
      }, dur + 50);
    }
  }
  startTimer() {
    this.stopTimer();
    if (!this.options.movement) return;
    const interval = Math.max(3e3, Number(this.options.interval) || 12e3);
    this.timer = setInterval(() => {
      this.moveToNextPosition();
    }, interval);
    if (this.timer && typeof this.timer.unref === "function") {
      this.timer.unref();
    }
  }
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.animTimeout) {
      clearTimeout(this.animTimeout);
      this.animTimeout = null;
    }
  }
  /**
   * Update watermark visual settings dynamically.
   * Permitted visual settings: animationStyle, movement, transitionSpeed/interval,
   * duration, easing, opacity (within sensible branding limits).
   * Attempts to change text or set enabled to false are strictly ignored.
   * @param {Object} newOptions
   */
  setOptions(newOptions = {}) {
    if (typeof newOptions.opacity === "number") {
      this.options.opacity = Math.max(0.15, Math.min(0.85, newOptions.opacity));
    }
    if (typeof newOptions.animationStyle === "string") {
      this.options.animationStyle = newOptions.animationStyle;
    }
    if (typeof newOptions.movement === "boolean") {
      this.options.movement = newOptions.movement;
    }
    if (newOptions.interval) {
      this.options.interval = Math.max(3e3, Number(newOptions.interval));
    }
    if (newOptions.transitionDuration) {
      this.options.transitionDuration = Math.max(200, Number(newOptions.transitionDuration));
    }
    if (newOptions.easing) {
      this.options.easing = newOptions.easing;
    }
    if (newOptions.color) {
      this.options.color = newOptions.color;
    }
    if (newOptions.fontSize) {
      this.options.fontSize = newOptions.fontSize;
    }
    this.options.enabled = true;
    this.options.text = PERMANENT_WATERMARK_TEXT;
    this.updateStyleAndText();
    if (this.options.movement) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }
  destroy() {
    this.stopTimer();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
function escapeHtml(str) {
  if (str === null || str === void 0) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function formatTime(seconds, forceHours = false) {
  if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) {
    return forceHours ? "00:00:00" : "00:00";
  }
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60 % 60);
  const h = Math.floor(seconds / 3600);
  const pad = (n) => n < 10 ? "0" + n : String(n);
  if (h > 0 || forceHours) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}
function parseTime(timeStr) {
  if (typeof timeStr === "number") return timeStr;
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.trim().split(":").map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}
function parseSrtTimestamp(timestamp) {
  if (!timestamp) return 0;
  const normalized = timestamp.trim().replace(",", ".");
  const [timePart, millisPart = "0"] = normalized.split(".");
  const baseSeconds = parseTime(timePart);
  const millis = parseFloat("0." + millisPart);
  return baseSeconds + millis;
}
function parseSrt(content) {
  if (!content || typeof content !== "string") return [];
  const clean = content.replace(/^\uFEFF/, "").trim();
  const normalized = clean.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.split(/\n\s*\n/);
  const cues = [];
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length === 0) continue;
    if (lines[0].startsWith("WEBVTT") || lines[0].startsWith("NOTE") || lines[0].startsWith("STYLE")) {
      continue;
    }
    let timeLineIndex = 0;
    if (!lines[0].includes("-->") && lines.length > 1 && lines[1].includes("-->")) {
      timeLineIndex = 1;
    }
    const timeLine = lines[timeLineIndex];
    if (!timeLine || !timeLine.includes("-->")) continue;
    const parts = timeLine.split(/\s*-->\s*/);
    if (parts.length < 2) continue;
    const start = parseSrtTimestamp(parts[0]);
    const endStr = parts[1].split(/\s+/)[0];
    const end = parseSrtTimestamp(endStr);
    const textLines = lines.slice(timeLineIndex + 1);
    const text = textLines.join("\n").trim();
    if (text && !isNaN(start) && !isNaN(end) && end > start) {
      cues.push({ start, end, text });
    }
  }
  return cues;
}
function srtToVtt(srtContent) {
  const cues = parseSrt(srtContent);
  let vtt = "WEBVTT\n\n";
  const formatVttTime = (sec) => {
    const s = (sec % 60).toFixed(3);
    const m = Math.floor(sec / 60 % 60);
    const h = Math.floor(sec / 3600);
    const pad = (n) => n < 10 ? "0" + n : String(n);
    const padSec = (n) => parseFloat(n) < 10 ? "0" + n : String(n);
    return `${pad(h)}:${pad(m)}:${padSec(s)}`;
  };
  cues.forEach((cue, i) => {
    vtt += `${i + 1}
`;
    vtt += `${formatVttTime(cue.start)} --> ${formatVttTime(cue.end)}
`;
    vtt += `${cue.text}

`;
  });
  return vtt;
}
class SubtitleManager {
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
    this.activeTrackId = "off";
    this.currentCues = [];
    this.delay = 0;
    this.tracker = new ListenerTracker();
    this.element = null;
    this.init(initialTracks);
  }
  init(initialTracks) {
    this.element = createElement("div", {
      className: "yogi-ply-subtitles yogi-ply-subtitles-medium yogi-ply-subtitles-bottom",
      "aria-live": "assertive",
      "aria-atomic": "true"
    });
    this.container.appendChild(this.element);
    if (Array.isArray(initialTracks)) {
      initialTracks.forEach((t) => this.addTrack(t));
    }
    this.tracker.add(this.video, "timeupdate", () => this.updateDisplay());
    this.tracker.add(this.video, "seeking", () => this.updateDisplay());
    this.state.subscribe("currentSubtitle", (trackId) => this.setTrack(trackId));
    this.state.subscribe("subtitleSize", (size) => this.setSize(size));
    this.state.subscribe("subtitlePosition", (pos) => this.setPosition(pos));
    this.state.subscribe("subtitleDelay", (delay) => this.setDelay(delay));
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
      srclang: track.srclang || "en",
      default: Boolean(track.default),
      cues: Array.isArray(track.cues) ? track.cues : []
    };
    this.tracks.push(newTrack);
    this.state.set("subtitles", [...this.tracks]);
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
      const cleanText = rawText.replace(/^\uFEFF/, "").trim();
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
    this.state.set("currentSubtitle", trackId);
    if (trackId === "off") {
      this.currentCues = [];
      this.element.innerHTML = "";
      this.element.style.display = "none";
      return;
    }
    const track = this.tracks.find((t) => t.id === trackId);
    if (track) {
      this.element.style.display = "block";
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
    this.element.classList.remove("yogi-ply-subtitles-small", "yogi-ply-subtitles-medium", "yogi-ply-subtitles-large");
    this.element.classList.add(`yogi-ply-subtitles-${size || "medium"}`);
    this.state.set("subtitleSize", size);
  }
  /**
   * Set subtitle position: 'bottom' | 'top'
   * @param {string} position
   */
  setPosition(position) {
    if (!this.element) return;
    this.element.classList.remove("yogi-ply-subtitles-bottom", "yogi-ply-subtitles-top");
    this.element.classList.add(`yogi-ply-subtitles-${position || "bottom"}`);
    this.state.set("subtitlePosition", position);
  }
  /**
   * Set subtitle synchronization delay in seconds
   * @param {number} delaySeconds
   */
  setDelay(delaySeconds) {
    this.delay = Number(delaySeconds) || 0;
    this.state.set("subtitleDelay", this.delay);
    this.updateDisplay();
  }
  /**
   * Update rendered subtitle cue based on current video time + delay
   */
  updateDisplay() {
    if (!this.element || this.activeTrackId === "off") return;
    const time = (this.video ? this.video.currentTime : 0) + this.delay;
    const activeCue = this.currentCues.find(
      (cue) => time >= cue.start && time <= cue.end
    );
    if (activeCue) {
      const safeLines = activeCue.text.split("\n").map((line) => {
        const escaped = escapeHtml(line);
        return escaped.replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, "<i>$1</i>").replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi, "<b>$1</b>").replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, "<u>$1</u>");
      }).join("<br>");
      this.element.innerHTML = `<span class="yogi-ply-subtitle-cue yogi-anim-sub-enter">${safeLines}</span>`;
      this.element.style.display = "block";
    } else {
      this.element.innerHTML = "";
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
class ChapterManager {
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
    this.state.on("timeupdate", (time) => {
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
      this.state.set("chapters", []);
      return [];
    }
    const valid = rawChapters.filter((ch) => ch && typeof ch === "object").map((ch, idx) => {
      const start = typeof ch.start === "number" && !isNaN(ch.start) && ch.start >= 0 ? ch.start : 0;
      const end = typeof ch.end === "number" && !isNaN(ch.end) && ch.end > start ? ch.end : start + 30;
      const title = typeof ch.title === "string" && ch.title.trim().length > 0 ? ch.title.trim() : `Chapter ${idx + 1}`;
      return { start, end, title, id: ch.id || `chapter-${idx + 1}` };
    }).sort((a, b) => a.start - b.start);
    this.chapters = valid;
    this.state.set("chapters", valid);
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
    const curTime = typeof time === "number" ? time : this.player.getCurrentTime();
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
      this.state.set("currentChapter", chapterData);
      this.player.emit("chapterchange", chapterData);
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
const icons = {
  play: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" fill-opacity="0.2"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" fill-opacity="0.2"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" fill-opacity="0.2"/></svg>`,
  volumeHigh: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.15"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  volumeLow: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.15"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  volumeMute: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.15"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  forward10: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4A8 8 0 1 1 5.3 7.8"/><polyline points="5 3 5 8 10 8"/><text x="12" y="15.5" font-size="7" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui, sans-serif">10</text></svg>`,
  backward10: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4A8 8 0 1 0 18.7 7.8"/><polyline points="19 3 19 8 14 8"/><text x="12" y="15.5" font-size="7" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui, sans-serif">10</text></svg>`,
  more: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  fullscreen: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
  exitFullscreen: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7"/></svg>`,
  pip: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><rect x="12" y="11" width="8" height="7" rx="1" fill="currentColor" fill-opacity="0.25"/></svg>`,
  theatre: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10" stroke-opacity="0.4"/><line x1="2" y1="14" x2="22" y2="14" stroke-opacity="0.4"/></svg>`,
  subtitles: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15h4M7 11h2m6 4h2m-4-4h4"/></svg>`,
  audio: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
  quality: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><text x="12" y="15" font-size="7.5" font-weight="800" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui, sans-serif">HD</text></svg>`,
  speed: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4a10 10 0 1 0 10 10A10 10 0 0 0 12 4zm0 16a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><polygon points="12 12 16 9 13.5 13.5" fill="currentColor"/></svg>`,
  playlist: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="16" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="11" y2="18"/><polygon points="17 13 22 16 17 19" fill="currentColor"/></svg>`,
  screenshot: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  loop: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  loading: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="yogi-ply-spin" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>`,
  replay: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/><polygon points="10 9 15 12 10 15" fill="currentColor"/></svg>`,
  next: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 4 15 12 5 20 5 4" fill="currentColor" fill-opacity="0.2"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="19 20 9 12 19 4 19 20" fill="currentColor" fill-opacity="0.2"/><line x1="5" y1="5" x2="5" y2="19"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  watermark: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  palette: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.562C22 6.5 17.5 2 12 2z"/></svg>`,
  info: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  error: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  volume: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.15"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  forward: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 4 15 12 5 20 5 4" fill="currentColor" fill-opacity="0.2"/><polygon points="13 4 23 12 13 20 13 4" fill="currentColor" fill-opacity="0.2"/></svg>`,
  backward: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="19 20 9 12 19 4 19 20" fill="currentColor" fill-opacity="0.2"/><polygon points="11 20 1 12 11 4 11 20" fill="currentColor" fill-opacity="0.2"/></svg>`,
  pictureInPicture: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><rect x="12" y="11" width="8" height="7" rx="1" fill="currentColor" fill-opacity="0.25"/></svg>`,
  aspectRatio: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="7 9 7 7 9 7"/><polyline points="17 9 17 7 15 7"/><polyline points="7 15 7 17 9 17"/><polyline points="17 15 17 17 15 17"/></svg>`,
  timer: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/><path d="M12 1v2"/></svg>`,
  abRepeat: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><text x="7" y="15" font-size="8" font-weight="800" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui, sans-serif">A</text><text x="17" y="15" font-size="8" font-weight="800" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui, sans-serif">B</text><path d="M10 8h4M14 6l2 2-2 2"/><path d="M14 18h-4M10 16l-2 2 2 2"/></svg>`,
  stepForward: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 6 14 12 6 18 6 6" fill="currentColor" fill-opacity="0.2"/><line x1="16" y1="6" x2="16" y2="18"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>`,
  stepBackward: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="18 18 10 12 18 6 18 18" fill="currentColor" fill-opacity="0.2"/><line x1="8" y1="6" x2="8" y2="18"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/></svg>`,
  back: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`
};
class ProgressBar {
  /**
   * @param {HTMLElement} container
   * @param {Player} player
   */
  constructor(container, player) {
    this.container = container;
    this.player = player;
    this.state = player.state;
    this.tracker = new ListenerTracker();
    this.element = null;
    this.bufferBar = null;
    this.playBar = null;
    this.thumb = null;
    this.tooltip = null;
    this.chaptersContainer = null;
    this.isDragging = false;
    this.init();
  }
  init() {
    this.element = createElement("div", {
      className: "yogi-ply-progress-container",
      role: "slider",
      tabIndex: "0",
      "aria-label": "Seek bar",
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      "aria-valuenow": "0",
      "aria-valuetext": "00:00"
    });
    this.element.innerHTML = `
      <div class="yogi-ply-progress-track">
        <div class="yogi-ply-progress-buffered"></div>
        <div class="yogi-ply-progress-played"></div>
        <div class="yogi-ply-progress-chapters"></div>
        <div class="yogi-ply-progress-thumb"></div>
      </div>
      <div class="yogi-ply-progress-tooltip">00:00</div>
    `;
    this.bufferBar = this.element.querySelector(".yogi-ply-progress-buffered");
    this.playBar = this.element.querySelector(".yogi-ply-progress-played");
    this.thumb = this.element.querySelector(".yogi-ply-progress-thumb");
    this.tooltip = this.element.querySelector(".yogi-ply-progress-tooltip");
    this.chaptersContainer = this.element.querySelector(".yogi-ply-progress-chapters");
    this.container.appendChild(this.element);
    this.bindEvents();
    this.bindState();
  }
  bindEvents() {
    this.tracker.add(this.element, "mousemove", (e) => this.handleMouseMove(e));
    this.tracker.add(this.element, "mouseleave", () => this.handleMouseLeave());
    this.tracker.add(this.element, "mousedown", (e) => this.handleDragStart(e));
    this.tracker.add(window, "mousemove", (e) => this.handleDragMove(e));
    this.tracker.add(window, "mouseup", (e) => this.handleDragEnd(e));
    this.tracker.add(this.element, "touchstart", (e) => this.handleDragStart(e), { passive: false });
    this.tracker.add(window, "touchmove", (e) => this.handleDragMove(e), { passive: false });
    this.tracker.add(window, "touchend", (e) => this.handleDragEnd(e));
  }
  bindState() {
    this.state.on("timeupdate", () => this.updateProgress());
    this.state.on("seeking", () => this.updateProgress());
    this.state.on("change:duration", () => this.updateProgress());
    this.state.on("change:buffered", (pct) => {
      if (this.bufferBar) this.bufferBar.style.width = `${(pct * 100).toFixed(2)}%`;
    });
    this.state.on("change:chapters", (chapters) => this.renderChapters(chapters));
  }
  handleMouseMove(e) {
    if (!this.tooltip) return;
    const duration = this.state.get("duration") || 0;
    if (duration <= 0) return;
    const ratio = getRelativeX(e, this.element);
    const targetTime = ratio * duration;
    const chapters = this.state.get("chapters") || [];
    const activeChap = chapters.find((ch) => targetTime >= ch.start && targetTime <= ch.end);
    const chapText = activeChap ? ` - ${escapeHtml(activeChap.title)}` : "";
    this.tooltip.textContent = `${formatTime(targetTime)}${chapText}`;
    this.tooltip.style.left = `${(ratio * 100).toFixed(2)}%`;
    this.tooltip.classList.add("yogi-ply-tooltip-visible");
  }
  handleMouseLeave() {
    if (this.tooltip && !this.isDragging) {
      this.tooltip.classList.remove("yogi-ply-tooltip-visible");
    }
  }
  handleDragStart(e) {
    e.preventDefault();
    this.isDragging = true;
    this.element.classList.add("yogi-ply-progress-dragging");
    this.seekFromEvent(e);
  }
  handleDragMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.seekFromEvent(e);
  }
  handleDragEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.element.classList.remove("yogi-ply-progress-dragging");
    if (this.tooltip) {
      this.tooltip.classList.remove("yogi-ply-tooltip-visible");
    }
  }
  seekFromEvent(e) {
    const duration = this.state.get("duration") || 0;
    if (duration <= 0) return;
    const ratio = getRelativeX(e, this.element);
    const targetSeconds = ratio * duration;
    this.player.seek(targetSeconds);
    this.setProgressVisual(ratio);
    if (this.tooltip) {
      this.tooltip.textContent = formatTime(targetSeconds);
      this.tooltip.style.left = `${(ratio * 100).toFixed(2)}%`;
      this.tooltip.classList.add("yogi-ply-tooltip-visible");
    }
  }
  setProgressVisual(ratio) {
    const pct = `${(ratio * 100).toFixed(2)}%`;
    if (this.playBar) this.playBar.style.width = pct;
    if (this.thumb) this.thumb.style.left = pct;
    const duration = this.state.get("duration") || 0;
    this.element.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    this.element.setAttribute("aria-valuetext", formatTime(ratio * duration));
  }
  updateProgress() {
    if (this.isDragging) return;
    const current = this.state.get("currentTime") || 0;
    const duration = this.state.get("duration") || 0;
    const ratio = duration > 0 ? current / duration : 0;
    this.setProgressVisual(Math.min(1, Math.max(0, ratio)));
  }
  renderChapters(chapters = []) {
    if (!this.chaptersContainer) return;
    this.chaptersContainer.innerHTML = "";
    const duration = this.state.get("duration") || 0;
    if (duration <= 0 || !Array.isArray(chapters)) return;
    chapters.forEach((chap) => {
      const startRatio = chap.start / duration;
      if (startRatio > 0 && startRatio < 1) {
        const tick = createElement("div", {
          className: "yogi-ply-chapter-tick",
          style: { left: `${(startRatio * 100).toFixed(2)}%` }
        });
        this.chaptersContainer.appendChild(tick);
      }
    });
  }
  destroy() {
    this.tracker.destroy();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
class VolumeControl {
  /**
   * @param {HTMLElement} container
   * @param {Player} player
   */
  constructor(container, player) {
    this.container = container;
    this.player = player;
    this.state = player.state;
    this.tracker = new ListenerTracker();
    this.element = null;
    this.btn = null;
    this.slider = null;
    this.bar = null;
    this.thumb = null;
    this.isDragging = false;
    this.lastNonZeroVolume = 1;
    this.init();
  }
  init() {
    this.element = createElement("div", {
      className: "yogi-ply-volume-group"
    });
    this.element.innerHTML = `
      <button class="yogi-ply-btn yogi-ply-btn-volume" aria-label="Mute or Unmute">
        <span class="yogi-ply-volume-icon">${icons.volumeHigh}</span>
      </button>
      <div class="yogi-ply-volume-slider" role="slider" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" tabIndex="0">
        <div class="yogi-ply-volume-track">
          <div class="yogi-ply-volume-fill"></div>
          <div class="yogi-ply-volume-thumb"></div>
        </div>
      </div>
    `;
    this.btn = this.element.querySelector(".yogi-ply-btn-volume");
    this.slider = this.element.querySelector(".yogi-ply-volume-slider");
    this.fill = this.element.querySelector(".yogi-ply-volume-fill");
    this.thumb = this.element.querySelector(".yogi-ply-volume-thumb");
    this.iconContainer = this.element.querySelector(".yogi-ply-volume-icon");
    this.container.appendChild(this.element);
    this.bindEvents();
    this.updateVisual(this.state.get("volume"), this.state.get("muted"));
  }
  bindEvents() {
    this.tracker.add(this.btn, "click", () => {
      if (this.state.get("muted") || this.state.get("volume") === 0) {
        this.player.unmute();
        this.player.setVolume(this.lastNonZeroVolume || 1);
      } else {
        this.lastNonZeroVolume = this.state.get("volume") || 1;
        this.player.mute();
      }
    });
    this.tracker.add(this.slider, "mousedown", (e) => this.startDrag(e));
    this.tracker.add(window, "mousemove", (e) => this.onDrag(e));
    this.tracker.add(window, "mouseup", () => this.endDrag());
    this.tracker.add(this.slider, "touchstart", (e) => this.startDrag(e), { passive: false });
    this.tracker.add(window, "touchmove", (e) => this.onDrag(e), { passive: false });
    this.tracker.add(window, "touchend", () => this.endDrag());
    this.state.on("change:volume", (vol) => {
      if (vol > 0) this.lastNonZeroVolume = vol;
      this.updateVisual(vol, this.state.get("muted"));
    });
    this.state.on("change:muted", (muted) => {
      this.updateVisual(this.state.get("volume"), muted);
    });
  }
  startDrag(e) {
    e.preventDefault();
    this.isDragging = true;
    this.updateFromEvent(e);
  }
  onDrag(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.updateFromEvent(e);
  }
  endDrag() {
    this.isDragging = false;
  }
  updateFromEvent(e) {
    const ratio = getRelativeX(e, this.slider);
    this.player.setVolume(ratio);
    if (this.state.get("muted") && ratio > 0) {
      this.player.unmute();
    }
  }
  updateVisual(vol, muted) {
    const effectiveVol = muted ? 0 : vol;
    const pct = `${(effectiveVol * 100).toFixed(0)}%`;
    if (this.fill) this.fill.style.width = pct;
    if (this.thumb) this.thumb.style.left = pct;
    if (this.slider) {
      this.slider.setAttribute("aria-valuenow", String(Math.round(effectiveVol * 100)));
    }
    if (effectiveVol === 0 || muted) {
      this.iconContainer.innerHTML = icons.volumeMute;
      this.btn.setAttribute("aria-label", "Unmute");
    } else if (effectiveVol < 0.5) {
      this.iconContainer.innerHTML = icons.volumeLow;
      this.btn.setAttribute("aria-label", "Mute");
    } else {
      this.iconContainer.innerHTML = icons.volumeHigh;
      this.btn.setAttribute("aria-label", "Mute");
    }
  }
  destroy() {
    this.tracker.destroy();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
class TimeDisplay {
  /**
   * @param {HTMLElement} container
   * @param {Player} player
   */
  constructor(container, player) {
    this.container = container;
    this.player = player;
    this.state = player.state;
    this.element = null;
    this.currentSpan = null;
    this.durationSpan = null;
    this.init();
  }
  init() {
    this.element = createElement("div", {
      className: "yogi-ply-time-display",
      "aria-live": "off"
    });
    this.currentSpan = createElement("span", { className: "yogi-ply-time-current", textContent: "00:00" });
    const separator = createElement("span", { className: "yogi-ply-time-separator", textContent: " / " });
    this.durationSpan = createElement("span", { className: "yogi-ply-time-duration", textContent: "00:00" });
    this.element.appendChild(this.currentSpan);
    this.element.appendChild(separator);
    this.element.appendChild(this.durationSpan);
    this.container.appendChild(this.element);
    this.state.on("timeupdate", () => this.update());
    this.state.on("change:duration", () => this.update());
  }
  update() {
    const cur = this.state.get("currentTime") || 0;
    const dur = this.state.get("duration") || 0;
    const forceHours = dur >= 3600;
    if (this.currentSpan) this.currentSpan.textContent = formatTime(cur, forceHours);
    if (this.durationSpan) this.durationSpan.textContent = formatTime(dur, forceHours);
  }
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
class Controls {
  /**
   * @param {HTMLElement} container
   * @param {Player} player
   */
  constructor(container, player) {
    this.container = container;
    this.player = player;
    this.state = player.state;
    this.tracker = new ListenerTracker();
    this.topBar = null;
    this.centerControls = null;
    this.dock = null;
    this.bigPlayBtn = null;
    this.centerRewindBtn = null;
    this.centerForwardBtn = null;
    this.loadingSpinner = null;
    this.endedOverlay = null;
    this.errorOverlay = null;
    this.skipIntroBtn = null;
    this.skipOutroBtn = null;
    this.progressBar = null;
    this.volumeControl = null;
    this.timeDisplay = null;
    this.hideTimeout = null;
    this.isMouseOverControls = false;
    this.init();
  }
  init() {
    this.renderTopBar();
    this.renderCenterControls();
    this.renderCenterOverlays();
    this.renderDock();
    this.bindEvents();
    this.bindState();
  }
  /* =========================================
     TOP UTILITY BAR (MOBILE & DESKTOP)
     ========================================= */
  renderTopBar() {
    this.topBar = createElement("div", {
      className: "yogi-ply-top-bar",
      role: "toolbar",
      "aria-label": "Top utilities and media information"
    });
    const topLeft = createElement("div", { className: "yogi-ply-top-left" });
    if (this.player.options.showBackButton) {
      const backBtn = createElement("button", {
        className: "yogi-ply-btn yogi-ply-btn-back",
        "aria-label": "Back",
        innerHTML: icons.back
      });
      this.tracker.add(backBtn, "click", () => {
        this.player.emit("back");
      });
      topLeft.appendChild(backBtn);
    }
    const titleEl = createElement("div", {
      className: "yogi-ply-title",
      textContent: this.player.options.title || "Yogi_PLY"
    });
    topLeft.appendChild(titleEl);
    const badgeEl = createElement("span", {
      className: "yogi-ply-meta-badge",
      textContent: "Cinematic"
    });
    topLeft.appendChild(badgeEl);
    this.topBar.appendChild(topLeft);
    const topRight = createElement("div", { className: "yogi-ply-top-right" });
    const topSubBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-top-subtitles",
      "aria-label": "Toggle Subtitles",
      innerHTML: icons.subtitles
    });
    this.tracker.add(topSubBtn, "click", () => {
      const cur = this.state.get("currentSubtitle");
      const tracks = this.state.get("subtitles") || [];
      if (tracks.length === 0) return;
      if (cur === "off" || !cur) {
        this.player.setSubtitle(tracks[0].id);
      } else {
        this.player.setSubtitle("off");
      }
    });
    topRight.appendChild(topSubBtn);
    this.topMoreBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-more yogi-ply-top-more",
      "aria-label": "More Features",
      innerHTML: icons.more
    });
    this.tracker.add(this.topMoreBtn, "click", () => {
      if (this.player.settingsMenu) this.player.settingsMenu.toggle();
    });
    topRight.appendChild(this.topMoreBtn);
    this.topBar.appendChild(topRight);
    this.container.appendChild(this.topBar);
  }
  /* =========================================
     CENTER CONTROLS (MOBILE REFERENCE LAYOUT)
     - Central Big Play/Pause
     - Left 10-second rewind
     - Right 10-second forward
     ========================================= */
  renderCenterControls() {
    this.centerControls = createElement("div", {
      className: "yogi-ply-center-controls",
      role: "group",
      "aria-label": "Playback controls"
    });
    this.centerRewindBtn = createElement("button", {
      className: "yogi-ply-center-btn yogi-ply-center-rewind",
      "aria-label": "Rewind 10 seconds",
      innerHTML: icons.backward10
    });
    this.tracker.add(this.centerRewindBtn, "click", () => {
      this.player.seek(this.player.getCurrentTime() - 10);
      if (this.player.animations) {
        this.player.animations.trigger(this.centerRewindBtn, "back-feedback");
      }
    });
    this.centerControls.appendChild(this.centerRewindBtn);
    this.bigPlayBtn = createElement("button", {
      className: "yogi-ply-center-btn yogi-ply-big-play",
      "aria-label": "Play Video",
      innerHTML: icons.play
    });
    this.tracker.add(this.bigPlayBtn, "click", () => this.player.togglePlay());
    this.centerControls.appendChild(this.bigPlayBtn);
    this.centerForwardBtn = createElement("button", {
      className: "yogi-ply-center-btn yogi-ply-center-forward",
      "aria-label": "Forward 10 seconds",
      innerHTML: icons.forward10
    });
    this.tracker.add(this.centerForwardBtn, "click", () => {
      this.player.seek(this.player.getCurrentTime() + 10);
      if (this.player.animations) {
        this.player.animations.trigger(this.centerForwardBtn, "fwd-feedback");
      }
    });
    this.centerControls.appendChild(this.centerForwardBtn);
    this.container.appendChild(this.centerControls);
  }
  /* =========================================
     CENTER OVERLAYS (SPINNER, SKIPS, SCREENS)
     ========================================= */
  renderCenterOverlays() {
    this.loadingSpinner = createElement("div", {
      className: "yogi-ply-spinner",
      "aria-label": "Loading Video",
      role: "status",
      innerHTML: icons.loading
    });
    this.container.appendChild(this.loadingSpinner);
    this.skipIntroBtn = createElement("button", {
      className: "yogi-ply-skip-badge yogi-ply-skip-intro",
      innerHTML: `<span>Skip Intro</span> ${icons.chevronRight}`,
      style: { display: "none" }
    });
    this.tracker.add(this.skipIntroBtn, "click", () => {
      const skip = this.state.get("skipIntro");
      if (skip && skip.end) this.player.seek(skip.end);
    });
    this.container.appendChild(this.skipIntroBtn);
    this.skipOutroBtn = createElement("button", {
      className: "yogi-ply-skip-badge yogi-ply-skip-outro",
      innerHTML: `<span>Skip Outro</span> ${icons.chevronRight}`,
      style: { display: "none" }
    });
    this.tracker.add(this.skipOutroBtn, "click", () => {
      const skip = this.state.get("skipOutro");
      if (skip && skip.end) this.player.seek(skip.end);
    });
    this.container.appendChild(this.skipOutroBtn);
    this.errorOverlay = createElement("div", {
      className: "yogi-ply-error-screen",
      style: { display: "none" },
      innerHTML: `
        <div class="yogi-ply-error-card yogi-anim-error-bounce">
          <div class="yogi-ply-error-icon">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="yogi-ply-error-title">Playback Error</div>
          <div class="yogi-ply-error-msg">Media playback failed</div>
          <div class="yogi-ply-error-advice" style="display: none;"></div>
          <div class="yogi-ply-error-actions">
            <button class="yogi-ply-btn yogi-ply-btn-retry" aria-label="Retry Playback">
              ${icons.replay} <span>Retry</span>
            </button>
          </div>
        </div>
      `
    });
    const retryBtn = this.errorOverlay.querySelector(".yogi-ply-btn-retry");
    this.tracker.add(retryBtn, "click", () => {
      this.errorOverlay.style.display = "none";
      this.state.set("error", null);
      if (this.player.options.source) {
        this.player.setSource(this.player.options.source);
      }
    });
    this.container.appendChild(this.errorOverlay);
    this.endedOverlay = createElement("div", {
      className: "yogi-ply-ended-screen",
      style: { display: "none" },
      innerHTML: `
        <div class="yogi-ply-ended-card">
          <div class="yogi-ply-ended-brand">Yogi_PLY</div>
          <div class="yogi-ply-ended-creator">Created By Shiv Yogi</div>
          <div class="yogi-ply-ended-actions">
            <button class="yogi-ply-btn yogi-ply-btn-replay" aria-label="Replay Video">
              ${icons.replay} <span>Replay</span>
            </button>
            <button class="yogi-ply-btn yogi-ply-btn-next-ended" aria-label="Next Video" style="display: none;">
              ${icons.next} <span>Next</span>
            </button>
          </div>
        </div>
      `
    });
    const replayBtn = this.endedOverlay.querySelector(".yogi-ply-btn-replay");
    this.tracker.add(replayBtn, "click", () => {
      this.endedOverlay.style.display = "none";
      this.player.seek(0);
      this.player.play().catch(() => {
      });
    });
    const nextBtn = this.endedOverlay.querySelector(".yogi-ply-btn-next-ended");
    this.tracker.add(nextBtn, "click", () => {
      this.endedOverlay.style.display = "none";
      if (this.player.playlist) {
        this.player.playlist.next();
      }
    });
    this.container.appendChild(this.endedOverlay);
  }
  /* =========================================
     BOTTOM CONTROL DOCK (DESKTOP & MOBILE)
     ========================================= */
  renderDock() {
    this.dock = createElement("div", {
      className: "yogi-ply-controls",
      role: "toolbar",
      "aria-label": "Video player controls dock"
    });
    this.progressBar = new ProgressBar(this.dock, this.player);
    const barRow = createElement("div", { className: "yogi-ply-controls-row" });
    const leftGroup = createElement("div", { className: "yogi-ply-controls-left" });
    this.playBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-play",
      "aria-label": "Play",
      innerHTML: icons.play
    });
    this.tracker.add(this.playBtn, "click", () => this.player.togglePlay());
    leftGroup.appendChild(this.playBtn);
    this.prevBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-prev",
      "aria-label": "Previous Video",
      innerHTML: icons.prev,
      style: { display: "none" }
    });
    this.tracker.add(this.prevBtn, "click", () => {
      if (this.player.playlist) this.player.playlist.prev();
    });
    leftGroup.appendChild(this.prevBtn);
    this.nextBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-next",
      "aria-label": "Next Video",
      innerHTML: icons.next,
      style: { display: "none" }
    });
    this.tracker.add(this.nextBtn, "click", () => {
      if (this.player.playlist) this.player.playlist.next();
    });
    leftGroup.appendChild(this.nextBtn);
    const back10Btn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-back10",
      "aria-label": "Rewind 10 Seconds",
      innerHTML: icons.backward10
    });
    this.tracker.add(back10Btn, "click", () => this.player.seek(this.player.getCurrentTime() - 10));
    leftGroup.appendChild(back10Btn);
    const fwd10Btn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-fwd10",
      "aria-label": "Forward 10 Seconds",
      innerHTML: icons.forward10
    });
    this.tracker.add(fwd10Btn, "click", () => this.player.seek(this.player.getCurrentTime() + 10));
    leftGroup.appendChild(fwd10Btn);
    this.volumeControl = new VolumeControl(leftGroup, this.player);
    this.timeDisplay = new TimeDisplay(leftGroup, this.player);
    const rightGroup = createElement("div", { className: "yogi-ply-controls-right" });
    this.loopBtn = createElement("button", {
      className: `yogi-ply-btn yogi-ply-btn-loop ${this.state.get("loop") ? "yogi-ply-btn-active" : ""}`,
      "aria-label": "Toggle Loop",
      innerHTML: icons.loop
    });
    this.tracker.add(this.loopBtn, "click", () => this.player.toggleLoop());
    rightGroup.appendChild(this.loopBtn);
    this.playlistBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-playlist",
      "aria-label": "Toggle Playlist",
      innerHTML: icons.playlist,
      style: { display: "none" }
    });
    this.tracker.add(this.playlistBtn, "click", () => {
      if (this.player.playlist) this.player.playlist.toggle();
    });
    rightGroup.appendChild(this.playlistBtn);
    this.subtitlesBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-subtitles",
      "aria-label": "Toggle Subtitles",
      innerHTML: icons.subtitles
    });
    this.tracker.add(this.subtitlesBtn, "click", () => {
      const cur = this.state.get("currentSubtitle");
      const tracks = this.state.get("subtitles") || [];
      if (tracks.length === 0) return;
      if (cur === "off" || !cur) {
        this.player.setSubtitle(tracks[0].id);
      } else {
        this.player.setSubtitle("off");
      }
    });
    rightGroup.appendChild(this.subtitlesBtn);
    const screenshotBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-screenshot",
      "aria-label": "Capture Screenshot",
      innerHTML: icons.screenshot
    });
    this.tracker.add(screenshotBtn, "click", () => this.player.captureScreenshot());
    rightGroup.appendChild(screenshotBtn);
    if (typeof document !== "undefined" && "pictureInPictureEnabled" in document) {
      const pipBtn = createElement("button", {
        className: "yogi-ply-btn yogi-ply-btn-pip",
        "aria-label": "Picture in Picture",
        innerHTML: icons.pip
      });
      this.tracker.add(pipBtn, "click", () => this.player.togglePip());
      rightGroup.appendChild(pipBtn);
    }
    const theatreBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-theatre",
      "aria-label": "Theatre Mode",
      innerHTML: icons.theatre
    });
    this.tracker.add(theatreBtn, "click", () => this.player.toggleTheatre());
    rightGroup.appendChild(theatreBtn);
    this.dockMoreBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-more yogi-ply-btn-settings",
      "aria-label": "More Features and Settings",
      innerHTML: icons.more
    });
    this.tracker.add(this.dockMoreBtn, "click", () => {
      if (this.player.settingsMenu) this.player.settingsMenu.toggle();
    });
    rightGroup.appendChild(this.dockMoreBtn);
    this.fullscreenBtn = createElement("button", {
      className: "yogi-ply-btn yogi-ply-btn-fullscreen",
      "aria-label": "Fullscreen",
      innerHTML: icons.fullscreen
    });
    this.tracker.add(this.fullscreenBtn, "click", () => this.player.toggleFullscreen());
    rightGroup.appendChild(this.fullscreenBtn);
    barRow.appendChild(leftGroup);
    barRow.appendChild(rightGroup);
    this.dock.appendChild(barRow);
    this.container.appendChild(this.dock);
  }
  /* =========================================
     EVENTS & USER ACTIVITY
     ========================================= */
  bindEvents() {
    this.tracker.add(this.dock, "mouseenter", () => {
      this.isMouseOverControls = true;
      this.showControls();
    });
    this.tracker.add(this.dock, "mouseleave", () => {
      this.isMouseOverControls = false;
      this.scheduleHideControls();
    });
    this.tracker.add(this.container, "mousemove", () => {
      this.showControls();
      this.scheduleHideControls();
    });
    this.tracker.add(this.container, "touchstart", () => {
      this.showControls();
      this.scheduleHideControls();
    }, { passive: true });
  }
  bindState() {
    this.state.on("change:playing", (isPlaying) => {
      if (isPlaying) {
        this.playBtn.innerHTML = icons.pause;
        this.playBtn.setAttribute("aria-label", "Pause");
        this.bigPlayBtn.innerHTML = icons.pause;
        this.bigPlayBtn.setAttribute("aria-label", "Pause");
        this.endedOverlay.style.display = "none";
        this.scheduleHideControls();
      } else {
        this.playBtn.innerHTML = icons.play;
        this.playBtn.setAttribute("aria-label", "Play");
        this.bigPlayBtn.innerHTML = icons.play;
        this.bigPlayBtn.setAttribute("aria-label", "Play");
        this.showControls();
      }
    });
    this.state.on("change:loading", (isLoading) => {
      if (isLoading) {
        this.loadingSpinner.classList.add("yogi-ply-spinner-visible");
      } else {
        this.loadingSpinner.classList.remove("yogi-ply-spinner-visible");
      }
    });
    this.state.on("change:fullscreen", (isFs) => {
      if (isFs) {
        this.fullscreenBtn.innerHTML = icons.exitFullscreen;
        this.fullscreenBtn.setAttribute("aria-label", "Exit Fullscreen");
      } else {
        this.fullscreenBtn.innerHTML = icons.fullscreen;
        this.fullscreenBtn.setAttribute("aria-label", "Fullscreen");
      }
    });
    this.state.on("change:currentSubtitle", (trackId) => {
      if (trackId && trackId !== "off") {
        this.subtitlesBtn.classList.add("yogi-ply-btn-active");
      } else {
        this.subtitlesBtn.classList.remove("yogi-ply-btn-active");
      }
    });
    this.state.on("change:loop", (isLoop) => {
      if (isLoop) {
        this.loopBtn.classList.add("yogi-ply-btn-active");
      } else {
        this.loopBtn.classList.remove("yogi-ply-btn-active");
      }
    });
    this.state.on("change:error", (err) => {
      if (err) {
        this.showControls();
        this.centerControls.style.display = "none";
        this.loadingSpinner.classList.remove("yogi-ply-spinner-visible");
        this.errorOverlay.style.display = "flex";
        this.errorOverlay.querySelector(".yogi-ply-error-msg").textContent = err;
        const advice = this.errorOverlay.querySelector(".yogi-ply-error-advice");
        const compat = this.state.get("compatibilityNotice");
        if (compat && compat.recommendation) {
          advice.textContent = compat.recommendation;
          advice.style.display = "block";
        } else {
          advice.style.display = "none";
        }
      } else {
        this.errorOverlay.style.display = "none";
        this.centerControls.style.display = "flex";
      }
    });
    this.state.on("change:ended", (ended) => {
      if (ended) {
        this.showControls();
        this.endedOverlay.style.display = "flex";
        const nextEndedBtn = this.endedOverlay.querySelector(".yogi-ply-btn-next-ended");
        if (this.player.playlist && this.player.playlist.hasNext()) {
          nextEndedBtn.style.display = "inline-flex";
        } else {
          nextEndedBtn.style.display = "none";
        }
      }
    });
    this.state.on("timeupdate", () => {
      const cur = this.state.get("currentTime") || 0;
      const skipIntro = this.state.get("skipIntro");
      const skipOutro = this.state.get("skipOutro");
      if (skipIntro && cur >= skipIntro.start && cur <= skipIntro.end) {
        this.skipIntroBtn.style.display = "inline-flex";
      } else {
        this.skipIntroBtn.style.display = "none";
      }
      if (skipOutro && cur >= skipOutro.start && cur <= skipOutro.end) {
        this.skipOutroBtn.style.display = "inline-flex";
      } else {
        this.skipOutroBtn.style.display = "none";
      }
    });
  }
  showControls() {
    this.container.classList.remove("yogi-ply-controls-hidden");
    this.state.set("controlsVisible", true);
  }
  hideControls() {
    if (this.isMouseOverControls) return;
    if (this.player.settingsMenu && this.player.settingsMenu.isOpen) return;
    if (this.state.get("paused") || this.state.get("ended") || this.state.get("error")) return;
    this.container.classList.add("yogi-ply-controls-hidden");
    this.state.set("controlsVisible", false);
  }
  scheduleHideControls() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    if (this.state.get("playing")) {
      this.hideTimeout = setTimeout(() => {
        this.hideControls();
      }, 3e3);
    }
  }
  destroy() {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.tracker.destroy();
    if (this.progressBar) this.progressBar.destroy();
    if (this.volumeControl) this.volumeControl.destroy();
    if (this.timeDisplay) this.timeDisplay.destroy();
    [this.topBar, this.centerControls, this.dock, this.loadingSpinner, this.skipIntroBtn, this.skipOutroBtn, this.errorOverlay, this.endedOverlay].forEach((el) => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }
}
class SettingsMenu {
  /**
   * @param {HTMLElement} container
   * @param {Player} player
   */
  constructor(container, player) {
    this.container = container;
    this.player = player;
    this.state = player.state;
    this.tracker = new ListenerTracker();
    this.isOpen = false;
    this.currentView = "main";
    this.panel = null;
    this.init();
  }
  init() {
    this.panel = createElement("div", {
      className: "yogi-ply-settings-panel",
      role: "dialog",
      "aria-label": "Player More Features and Settings"
    });
    this.container.appendChild(this.panel);
    this.tracker.add(document, "click", (e) => {
      if (this.isOpen && !this.panel.contains(e.target) && !e.target.closest(".yogi-ply-btn-settings") && !e.target.closest(".yogi-ply-btn-more")) {
        this.close();
      }
    });
    this.tracker.add(document, "keydown", (e) => {
      if (this.isOpen && e.key === "Escape") {
        this.close();
      }
    });
    const stateTriggers = [
      "playbackRate",
      "quality",
      "qualities",
      "currentSubtitle",
      "subtitles",
      "subtitleSize",
      "subtitlePosition",
      "subtitleDelay",
      "audioTracks",
      "currentAudioTrack",
      "audioDelay",
      "theme",
      "watermark",
      "loop",
      "aspectRatio",
      "sleepTimer",
      "sleepTimerRemaining",
      "repeatA",
      "repeatB"
    ];
    stateTriggers.forEach((key) => {
      this.state.on(`change:${key}`, () => {
        if (this.isOpen) this.renderCurrentView();
      });
    });
  }
  isFeatureEnabled(featureKey) {
    const feats = this.player.options.features;
    if (!feats) return true;
    return feats[featureKey] !== false;
  }
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  open() {
    this.isOpen = true;
    this.currentView = "main";
    this.renderCurrentView();
    this.panel.classList.remove("yogi-anim-menu-collapse");
    this.panel.classList.add("yogi-ply-settings-open", "yogi-anim-menu-expand");
    const moreBtns = this.container.querySelectorAll(".yogi-ply-btn-more");
    moreBtns.forEach((btn) => btn.classList.add("yogi-anim-more-tap"));
  }
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.panel.classList.remove("yogi-anim-menu-expand");
    this.panel.classList.add("yogi-anim-menu-collapse");
    const moreBtns = this.container.querySelectorAll(".yogi-ply-btn-more");
    moreBtns.forEach((btn) => {
      btn.classList.remove("yogi-anim-more-tap");
      btn.classList.add("yogi-anim-more-reset");
      setTimeout(() => btn.classList.remove("yogi-anim-more-reset"), 300);
    });
    setTimeout(() => {
      if (!this.isOpen) {
        this.panel.classList.remove("yogi-ply-settings-open", "yogi-anim-menu-collapse");
      }
    }, 240);
  }
  navigateTo(view) {
    this.currentView = view;
    this.renderCurrentView();
  }
  renderCurrentView() {
    if (!this.panel) return;
    this.panel.innerHTML = "";
    switch (this.currentView) {
      case "speed":
        this.renderSpeedMenu();
        break;
      case "quality":
        this.renderQualityMenu();
        break;
      case "subtitles":
        this.renderSubtitleMenu();
        break;
      case "chapters":
        this.renderChaptersMenu();
        break;
      case "audio":
        this.renderAudioMenu();
        break;
      case "aspectRatio":
        this.renderAspectRatioMenu();
        break;
      case "sleepTimer":
        this.renderSleepTimerMenu();
        break;
      case "abRepeat":
        this.renderAbRepeatMenu();
        break;
      case "frameStep":
        this.renderFrameStepMenu();
        break;
      case "subtitleDelay":
        this.renderSubtitleDelayMenu();
        break;
      case "audioDelay":
        this.renderAudioDelayMenu();
        break;
      case "watermark":
        this.renderWatermarkMenu();
        break;
      case "themes":
        this.renderThemesMenu();
        break;
      case "info":
        this.renderInfoMenu();
        break;
      case "main":
      default:
        this.renderMainMenu();
        break;
    }
  }
  createHeader(title, onBack = () => this.navigateTo("main")) {
    const header = createElement("div", {
      className: "yogi-ply-menu-header",
      innerHTML: `
        <button class="yogi-ply-menu-back" aria-label="Back to main menu">
          ${icons.chevronLeft}
        </button>
        <span class="yogi-ply-menu-title">${title}</span>
      `
    });
    header.querySelector(".yogi-ply-menu-back").addEventListener("click", (e) => {
      e.stopPropagation();
      onBack();
    });
    return header;
  }
  createMenuRow(iconSvg, label, valueText, onClick) {
    const row = createElement("button", {
      className: "yogi-ply-menu-row",
      innerHTML: `
        <div class="yogi-ply-menu-row-left">
          <span class="yogi-ply-menu-icon">${iconSvg}</span>
          <span class="yogi-ply-menu-label">${label}</span>
        </div>
        <div class="yogi-ply-menu-row-right">
          <span class="yogi-ply-menu-val">${valueText}</span>
          <span class="yogi-ply-menu-arrow">${icons.chevronRight}</span>
        </div>
      `
    });
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
    return row;
  }
  /* =========================================
     MAIN THREE-DOT MENU LIST
     ========================================= */
  renderMainMenu() {
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    if (this.isFeatureEnabled("playbackSpeed")) {
      const speed = this.state.get("playbackRate") || 1;
      list.appendChild(
        this.createMenuRow(
          icons.speed,
          "Playback Speed",
          speed === 1 ? "Normal" : `${speed}x`,
          () => this.navigateTo("speed")
        )
      );
    }
    if (this.isFeatureEnabled("quality")) {
      const qualities = this.state.get("qualities") || [];
      const currentQ = this.state.get("quality");
      const qObj = qualities.find((q) => q.value === currentQ);
      const qLabel = qObj ? qObj.label : "Auto";
      list.appendChild(
        this.createMenuRow(icons.quality, "Quality", qLabel, () => this.navigateTo("quality"))
      );
    }
    if (this.isFeatureEnabled("subtitles")) {
      const tracks = this.state.get("subtitles") || [];
      const currentSub = this.state.get("currentSubtitle");
      const activeTrack = tracks.find((t) => t.id === currentSub);
      const subLabel = currentSub === "off" || !currentSub ? "Off" : activeTrack ? activeTrack.label : "On";
      list.appendChild(
        this.createMenuRow(icons.subtitles, "Subtitles", subLabel, () => this.navigateTo("subtitles"))
      );
    }
    if (this.isFeatureEnabled("chapters")) {
      const chapters = this.state.get("chapters") || [];
      if (chapters.length > 0) {
        const curChap = this.player.chapters ? this.player.chapters.getCurrentChapter() : null;
        const chapLabel = curChap ? curChap.chapter.title : `${chapters.length} Chapters`;
        list.appendChild(
          this.createMenuRow(icons.playlist, "Chapters", chapLabel, () => this.navigateTo("chapters"))
        );
      }
    }
    if (this.isFeatureEnabled("audioTrack")) {
      const audioTracks = this.state.get("audioTracks") || [];
      if (audioTracks.length > 0) {
        const curAudio = this.state.get("currentAudioTrack");
        const activeAudio = audioTracks.find((a) => a.id === curAudio) || audioTracks[0];
        list.appendChild(
          this.createMenuRow(
            icons.audio,
            "Audio Track",
            activeAudio ? activeAudio.label : "Default",
            () => this.navigateTo("audio")
          )
        );
      }
    }
    if (this.isFeatureEnabled("aspectRatio")) {
      const curRatio = this.state.get("aspectRatio") || "16:9";
      list.appendChild(
        this.createMenuRow(
          icons.aspectRatio,
          "Aspect Ratio",
          curRatio,
          () => this.navigateTo("aspectRatio")
        )
      );
    }
    if (this.isFeatureEnabled("sleepTimer")) {
      const sleepRemaining = this.state.get("sleepTimerRemaining");
      const sleepVal = sleepRemaining || (this.state.get("sleepTimer") ? `${this.state.get("sleepTimer")}m` : "Off");
      list.appendChild(
        this.createMenuRow(icons.timer, "Sleep Timer", sleepVal, () => this.navigateTo("sleepTimer"))
      );
    }
    if (this.isFeatureEnabled("abRepeat")) {
      const repA = this.state.get("repeatA");
      const repB = this.state.get("repeatB");
      const repLabel = repA !== null && repB !== null ? `${formatTime(repA)}-${formatTime(repB)}` : repA !== null ? "A set" : "Off";
      list.appendChild(
        this.createMenuRow(icons.abRepeat, "A-B Repeat", repLabel, () => this.navigateTo("abRepeat"))
      );
    }
    if (this.isFeatureEnabled("frameStep")) {
      list.appendChild(
        this.createMenuRow(icons.stepForward, "Frame Step", "1/30s", () => this.navigateTo("frameStep"))
      );
    }
    if (this.isFeatureEnabled("subtitleDelay")) {
      const subDelay = this.state.get("subtitleDelay") || 0;
      const subDelayStr = subDelay === 0 ? "0s" : `${subDelay > 0 ? "+" : ""}${subDelay}s`;
      list.appendChild(
        this.createMenuRow(
          icons.subtitles,
          "Subtitle Delay",
          subDelayStr,
          () => this.navigateTo("subtitleDelay")
        )
      );
    }
    if (this.isFeatureEnabled("audioDelay")) {
      const audioDelay = this.state.get("audioDelay") || 0;
      const audioDelayStr = audioDelay === 0 ? "0s" : `${audioDelay > 0 ? "+" : ""}${audioDelay}s`;
      list.appendChild(
        this.createMenuRow(
          icons.audio,
          "Audio Delay",
          audioDelayStr,
          () => this.navigateTo("audioDelay")
        )
      );
    }
    if (this.isFeatureEnabled("loop")) {
      const isLoop = Boolean(this.state.get("loop"));
      const loopRow = createElement("button", {
        className: `yogi-ply-menu-option ${isLoop ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <div class="yogi-ply-menu-row-left">
            <span class="yogi-ply-menu-icon">${icons.loop}</span>
            <span class="yogi-ply-menu-label">Repeat Video</span>
          </div>
          <span class="yogi-ply-toggle-switch ${isLoop ? "yogi-ply-switch-on" : ""}"></span>
        `
      });
      loopRow.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.toggleLoop();
      });
      list.appendChild(loopRow);
    }
    if (this.isFeatureEnabled("screenshot")) {
      const shotRow = createElement("button", {
        className: "yogi-ply-menu-row",
        innerHTML: `
          <div class="yogi-ply-menu-row-left">
            <span class="yogi-ply-menu-icon">${icons.screenshot}</span>
            <span class="yogi-ply-menu-label">Capture Screenshot</span>
          </div>
          <div class="yogi-ply-menu-row-right">
            <span class="yogi-ply-menu-val">PNG</span>
          </div>
        `
      });
      shotRow.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.captureScreenshot();
        this.close();
      });
      list.appendChild(shotRow);
    }
    const wmItem = this.createMenuRow(
      icons.watermark,
      "Watermark Style",
      "Created By Shiv Yogi",
      () => this.navigateTo("watermark")
    );
    list.appendChild(wmItem);
    const theme = this.state.get("theme") || "liquid-glass";
    list.appendChild(
      this.createMenuRow(
        icons.palette,
        "Theme",
        theme.replace("-", " "),
        () => this.navigateTo("themes")
      )
    );
    if (this.isFeatureEnabled("diagnostics")) {
      list.appendChild(
        this.createMenuRow(
          icons.info,
          "Playback Stats",
          "Diagnostics",
          () => this.navigateTo("info")
        )
      );
    }
    this.panel.appendChild(list);
  }
  /* =========================================
     SUB-MENUS
     ========================================= */
  renderSpeedMenu() {
    this.panel.appendChild(this.createHeader("Playback Speed"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const current = this.state.get("playbackRate") || 1;
    speeds.forEach((rate) => {
      const isSelected = rate === current;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${rate === 1 ? "1x (Normal)" : `${rate}x`}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.setPlaybackRate(rate);
        this.navigateTo("main");
      });
      list.appendChild(btn);
    });
    this.panel.appendChild(list);
  }
  renderQualityMenu() {
    this.panel.appendChild(this.createHeader("Video Quality"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const qualities = this.state.get("qualities") || [{ label: "Auto (Original)", value: "auto" }];
    const current = this.state.get("quality");
    qualities.forEach((q) => {
      const isSelected = q.value === current;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${q.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.setQuality(q.value);
        this.navigateTo("main");
      });
      list.appendChild(btn);
    });
    this.panel.appendChild(list);
  }
  renderSubtitleMenu() {
    this.panel.appendChild(this.createHeader("Subtitles"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const tracks = this.state.get("subtitles") || [];
    const current = this.state.get("currentSubtitle");
    const isOff = current === "off" || !current;
    const offBtn = createElement("button", {
      className: `yogi-ply-menu-option ${isOff ? "yogi-ply-option-active" : ""}`,
      innerHTML: `
        <span>Off</span>
        ${isOff ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
      `
    });
    offBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.player.setSubtitle("off");
      this.navigateTo("main");
    });
    list.appendChild(offBtn);
    tracks.forEach((track) => {
      const isSelected = track.id === current;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${track.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.setSubtitle(track.id);
        this.navigateTo("main");
      });
      list.appendChild(btn);
    });
    if (tracks.length > 0) {
      const sizeHeader = createElement("div", {
        className: "yogi-ply-menu-sublabel",
        textContent: "Text Size"
      });
      list.appendChild(sizeHeader);
      const curSize = this.state.get("subtitleSize") || "medium";
      ["small", "medium", "large"].forEach((size) => {
        const isSizeActive = curSize === size;
        const sizeBtn = createElement("button", {
          className: `yogi-ply-menu-option ${isSizeActive ? "yogi-ply-option-active" : ""}`,
          innerHTML: `
            <span>${size.charAt(0).toUpperCase() + size.slice(1)}</span>
            ${isSizeActive ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
          `
        });
        sizeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this.player.subtitles) this.player.subtitles.setSize(size);
          this.renderSubtitleMenu();
        });
        list.appendChild(sizeBtn);
      });
    }
    this.panel.appendChild(list);
  }
  renderChaptersMenu() {
    this.panel.appendChild(this.createHeader("Chapters"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const chapters = this.state.get("chapters") || [];
    const curTime = this.player.getCurrentTime();
    chapters.forEach((chap, idx) => {
      const isActive = curTime >= chap.start && curTime <= chap.end;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isActive ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <div style="display:flex; flex-direction:column; align-items:flex-start; text-align:left;">
            <span style="font-weight:600;">${chap.title}</span>
            <span style="font-size:11px; opacity:0.7;">${formatTime(chap.start)} - ${formatTime(chap.end)}</span>
          </div>
          ${isActive ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.seekToChapter(idx);
        this.close();
      });
      list.appendChild(btn);
    });
    this.panel.appendChild(list);
  }
  renderAudioMenu() {
    this.panel.appendChild(this.createHeader("Audio Tracks"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const tracks = this.state.get("audioTracks") || [];
    const current = this.state.get("currentAudioTrack");
    tracks.forEach((track) => {
      const isSelected = track.id === current;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${track.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.player.hlsAdapter) {
          this.player.hlsAdapter.setAudioTrack(track.id);
        } else if (this.player.dashAdapter) {
          this.player.dashAdapter.setAudioTrack(track.id);
        }
        this.navigateTo("main");
      });
      list.appendChild(btn);
    });
    this.panel.appendChild(list);
  }
  renderAspectRatioMenu() {
    this.panel.appendChild(this.createHeader("Video Aspect Ratio"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const ratios = ["16:9", "4:3", "1:1", "21:9", "Original", "Fill (Cover)", "Stretch"];
    const current = this.state.get("aspectRatio") || "16:9";
    ratios.forEach((ratio) => {
      const isSelected = ratio === current;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${ratio}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.setAspectRatio(ratio);
        this.navigateTo("main");
      });
      list.appendChild(btn);
    });
    this.panel.appendChild(list);
  }
  renderSleepTimerMenu() {
    this.panel.appendChild(this.createHeader("Sleep Timer"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const options = [
      { label: "Off", val: "off" },
      { label: "15 Minutes", val: 15 },
      { label: "30 Minutes", val: 30 },
      { label: "45 Minutes", val: 45 },
      { label: "60 Minutes (1 Hour)", val: 60 },
      { label: "End of Current Video", val: "end" }
    ];
    const current = this.state.get("sleepTimer") || "off";
    options.forEach((opt) => {
      const isSelected = opt.val === current;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${opt.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.setSleepTimer(opt.val);
        this.navigateTo("main");
      });
      list.appendChild(btn);
    });
    this.panel.appendChild(list);
  }
  renderAbRepeatMenu() {
    this.panel.appendChild(this.createHeader("A-B Repeat Loop"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const curTime = this.player.getCurrentTime();
    const repA = this.state.get("repeatA");
    const repB = this.state.get("repeatB");
    const setABtn = createElement("button", {
      className: "yogi-ply-menu-option",
      innerHTML: `<span>Set Point A (Current: ${formatTime(curTime)})</span>`
    });
    setABtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.player.setRepeatPointA(curTime);
      this.renderAbRepeatMenu();
    });
    list.appendChild(setABtn);
    const setBBtn = createElement("button", {
      className: "yogi-ply-menu-option",
      innerHTML: `<span>Set Point B (Current: ${formatTime(curTime)})</span>`
    });
    setBBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.player.setRepeatPointB(curTime);
      this.renderAbRepeatMenu();
    });
    list.appendChild(setBBtn);
    const statusText = repA !== null && repB !== null ? `Looping from ${formatTime(repA)} to ${formatTime(repB)}` : repA !== null ? `Point A set to ${formatTime(repA)} (Waiting for Point B)` : "A-B Repeat is inactive";
    const statusEl = createElement("div", {
      className: "yogi-ply-menu-sublabel",
      textContent: statusText
    });
    list.appendChild(statusEl);
    if (repA !== null || repB !== null) {
      const clearBtn = createElement("button", {
        className: "yogi-ply-menu-option",
        innerHTML: '<span style="color:#f87171;">Clear Repeat Loop</span>'
      });
      clearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.clearRepeat();
        this.renderAbRepeatMenu();
      });
      list.appendChild(clearBtn);
    }
    this.panel.appendChild(list);
  }
  renderFrameStepMenu() {
    this.panel.appendChild(this.createHeader("Frame-by-Frame Navigation"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const stepBackBtn = createElement("button", {
      className: "yogi-ply-menu-option",
      innerHTML: `
        <div class="yogi-ply-menu-row-left">
          <span class="yogi-ply-menu-icon">${icons.stepBackward}</span>
          <span>Step Back 1 Frame (-0.033s)</span>
        </div>
      `
    });
    stepBackBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.player.stepFrame(-1);
    });
    list.appendChild(stepBackBtn);
    const stepFwdBtn = createElement("button", {
      className: "yogi-ply-menu-option",
      innerHTML: `
        <div class="yogi-ply-menu-row-left">
          <span class="yogi-ply-menu-icon">${icons.stepForward}</span>
          <span>Step Forward 1 Frame (+0.033s)</span>
        </div>
      `
    });
    stepFwdBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.player.stepFrame(1);
    });
    list.appendChild(stepFwdBtn);
    this.panel.appendChild(list);
  }
  renderSubtitleDelayMenu() {
    this.panel.appendChild(this.createHeader("Subtitle Delay"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const delays = [-2, -1, -0.5, 0, 0.5, 1, 2];
    const current = this.state.get("subtitleDelay") || 0;
    delays.forEach((sec) => {
      const isSelected = sec === current;
      const label = sec === 0 ? "0.0s (Normal)" : `${sec > 0 ? "+" : ""}${sec.toFixed(1)}s`;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.setSubtitleDelay(sec);
        this.navigateTo("main");
      });
      list.appendChild(btn);
    });
    this.panel.appendChild(list);
  }
  renderAudioDelayMenu() {
    this.panel.appendChild(this.createHeader("Audio Delay"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const delays = [-1, -0.5, -0.2, 0, 0.2, 0.5, 1];
    const current = this.state.get("audioDelay") || 0;
    delays.forEach((sec) => {
      const isSelected = sec === current;
      const label = sec === 0 ? "0.0s (Normal)" : `${sec > 0 ? "+" : ""}${sec.toFixed(1)}s`;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.setAudioDelay(sec);
        this.navigateTo("main");
      });
      list.appendChild(btn);
    });
    this.panel.appendChild(list);
  }
  /* =========================================
     WATERMARK SETTINGS (PERMANENT BRANDING)
     Permitted visual settings ONLY:
     - Animation style
     - Movement interval
     - Opacity (0.15 - 0.85)
     NO disable/remove option!
     ========================================= */
  renderWatermarkMenu() {
    this.panel.appendChild(this.createHeader("Watermark Animation"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const wm = this.player.watermark ? this.player.watermark.options : {};
    const badge = createElement("div", {
      className: "yogi-ply-menu-sublabel",
      style: { textAlign: "center", padding: "10px 14px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", marginBottom: "8px" },
      innerHTML: `<strong style="color:var(--yogi-accent);">Created By Shiv Yogi</strong><br><span style="font-size:11px; opacity:0.8;">Permanent Brand Signature</span>`
    });
    list.appendChild(badge);
    const animHeader = createElement("div", {
      className: "yogi-ply-menu-sublabel",
      textContent: "Animation Style"
    });
    list.appendChild(animHeader);
    const animStyles = [
      { label: "Fade Slide (Default)", val: "fade-slide" },
      { label: "Fade", val: "fade" },
      { label: "Slide", val: "slide" },
      { label: "Glow Transition", val: "glow" }
    ];
    animStyles.forEach((style) => {
      const isSelected = wm.animationStyle === style.val;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${style.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.setWatermark({ animationStyle: style.val });
        this.renderWatermarkMenu();
      });
      list.appendChild(btn);
    });
    const opHeader = createElement("div", {
      className: "yogi-ply-menu-sublabel",
      textContent: "Visual Opacity"
    });
    list.appendChild(opHeader);
    const opacities = [
      { label: "Subtle (18%)", val: 0.18 },
      { label: "Default (28%)", val: 0.28 },
      { label: "Medium (50%)", val: 0.5 },
      { label: "High (75%)", val: 0.75 }
    ];
    opacities.forEach((op) => {
      const isSelected = Math.abs((wm.opacity || 0.28) - op.val) < 0.05;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${op.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.setWatermark({ opacity: op.val });
        this.renderWatermarkMenu();
      });
      list.appendChild(btn);
    });
    this.panel.appendChild(list);
  }
  renderThemesMenu() {
    this.panel.appendChild(this.createHeader("Themes"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const themes = [
      { id: "liquid-glass", name: "Liquid Glass" },
      { id: "dark", name: "Dark Studio" },
      { id: "cinematic-oled", name: "Cinematic OLED" },
      { id: "light", name: "Light Frosted" }
    ];
    const currentTheme = this.state.get("theme") || "liquid-glass";
    themes.forEach((t) => {
      const isSelected = t.id === currentTheme;
      const btn = createElement("button", {
        className: `yogi-ply-menu-option ${isSelected ? "yogi-ply-option-active" : ""}`,
        innerHTML: `
          <span>${t.name}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ""}
        `
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.player.setTheme(t.id);
        this.navigateTo("main");
      });
      list.appendChild(btn);
    });
    this.panel.appendChild(list);
  }
  renderInfoMenu() {
    this.panel.appendChild(this.createHeader("Playback Diagnostics"));
    const list = createElement("div", { className: "yogi-ply-menu-list" });
    const diag = this.player.getDiagnostics();
    const rows = [
      { label: "Source", val: diag.source ? diag.source.split("/").pop() : "None" },
      { label: "Resolution", val: diag.resolution },
      { label: "Viewport", val: diag.viewport },
      { label: "Duration", val: formatTime(diag.duration) },
      { label: "Buffered", val: `${(diag.bufferedRatio * 100).toFixed(0)}% (${formatTime(diag.bufferedSeconds)})` },
      { label: "Current State", val: diag.isPaused ? "Paused" : "Playing" },
      { label: "Playback Rate", val: `${diag.playbackRate}x` },
      { label: "Volume", val: diag.isMuted ? "Muted" : `${(diag.volume * 100).toFixed(0)}%` },
      { label: "Engine", val: diag.engine },
      { label: "Brand", val: "Created By Shiv Yogi" }
    ];
    rows.forEach((r) => {
      const item = createElement("div", {
        className: "yogi-ply-menu-row",
        style: { cursor: "default" },
        innerHTML: `
          <span class="yogi-ply-menu-label">${r.label}</span>
          <span class="yogi-ply-menu-val" style="font-family:monospace; font-size:12px;">${r.val}</span>
        `
      });
      list.appendChild(item);
    });
    this.panel.appendChild(list);
  }
  destroy() {
    this.tracker.destroy();
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
    this.panel = null;
  }
}
class PlaylistManager {
  /**
   * @param {HTMLElement} container
   * @param {Player} player
   * @param {Array} items
   * @param {boolean} autoNext
   */
  constructor(container, player, items = [], autoNext = true) {
    this.container = container;
    this.player = player;
    this.state = player.state;
    this.items = Array.isArray(items) ? [...items] : [];
    this.currentIndex = 0;
    this.autoNext = autoNext;
    this.drawer = null;
    this.isOpen = false;
    this.tracker = new ListenerTracker();
    this.init();
  }
  init() {
    this.state.set("playlist", this.items);
    this.state.set("playlistIndex", this.currentIndex);
    this.state.on("ended", () => {
      if (this.autoNext && this.hasNext()) {
        this.next();
      }
    });
    this.renderDrawer();
  }
  renderDrawer() {
    this.drawer = createElement("div", {
      className: "yogi-ply-playlist-drawer",
      "aria-label": "Video Playlist",
      role: "dialog"
    });
    const header = createElement("div", {
      className: "yogi-ply-playlist-header",
      innerHTML: `
        <span class="yogi-ply-playlist-title">${icons.playlist} Playlist (${this.items.length})</span>
        <button class="yogi-ply-btn yogi-ply-btn-close" aria-label="Close Playlist">${icons.close}</button>
      `
    });
    const closeBtn = header.querySelector(".yogi-ply-btn-close");
    this.tracker.add(closeBtn, "click", () => this.close());
    const list = createElement("div", { className: "yogi-ply-playlist-list" });
    this.items.forEach((item, index) => {
      const card = createElement("button", {
        className: `yogi-ply-playlist-item ${index === this.currentIndex ? "yogi-ply-item-active" : ""}`,
        innerHTML: `
          <div class="yogi-ply-playlist-thumb">
            ${item.poster ? `<img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title || "")}" />` : '<div class="yogi-ply-thumb-placeholder"></div>'}
            <span class="yogi-ply-thumb-index">${index + 1}</span>
          </div>
          <div class="yogi-ply-playlist-meta">
            <span class="yogi-ply-item-title">${escapeHtml(item.title || `Video ${index + 1}`)}</span>
            ${item.duration ? `<span class="yogi-ply-item-duration">${escapeHtml(item.duration)}</span>` : ""}
          </div>
        `
      });
      this.tracker.add(card, "click", () => {
        this.playIndex(index);
        this.close();
      });
      list.appendChild(card);
    });
    this.drawer.appendChild(header);
    this.drawer.appendChild(list);
    this.container.appendChild(this.drawer);
  }
  updateActiveCard() {
    if (!this.drawer) return;
    const cards = this.drawer.querySelectorAll(".yogi-ply-playlist-item");
    cards.forEach((card, idx) => {
      if (idx === this.currentIndex) {
        card.classList.add("yogi-ply-item-active");
      } else {
        card.classList.remove("yogi-ply-item-active");
      }
    });
  }
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  open() {
    this.isOpen = true;
    this.drawer.classList.add("yogi-ply-playlist-open");
  }
  close() {
    this.isOpen = false;
    this.drawer.classList.remove("yogi-ply-playlist-open");
  }
  hasNext() {
    return this.currentIndex < this.items.length - 1;
  }
  hasPrev() {
    return this.currentIndex > 0;
  }
  next() {
    if (this.hasNext()) {
      this.playIndex(this.currentIndex + 1);
    }
  }
  prev() {
    if (this.hasPrev()) {
      this.playIndex(this.currentIndex - 1);
    }
  }
  playIndex(index) {
    if (index < 0 || index >= this.items.length) return;
    this.currentIndex = index;
    const item = this.items[index];
    this.state.set("playlistIndex", index);
    this.updateActiveCard();
    this.player.setSource(item.src);
    if (item.poster) {
      this.player.setPoster(item.poster);
    }
    if (item.subtitles && Array.isArray(item.subtitles)) {
      item.subtitles.forEach((s) => this.player.subtitles.addTrack(s));
    }
    if (item.chapters && Array.isArray(item.chapters)) {
      this.player.setChapters(item.chapters);
    }
    this.player.play().catch(() => {
    });
    this.player.emit("playlistitemchange", { index, item });
  }
  destroy() {
    this.tracker.destroy();
    if (this.drawer && this.drawer.parentNode) {
      this.drawer.parentNode.removeChild(this.drawer);
    }
    this.items = [];
  }
}
class TouchFeedback {
  constructor(container) {
    this.container = container;
    this.overlay = null;
    this.hudBadge = null;
    this.hudTimer = null;
    this.init();
  }
  init() {
    this.overlay = createElement("div", {
      className: "yogi-ply-gesture-overlay",
      "aria-hidden": "true"
    });
    this.hudBadge = createElement("div", {
      className: "yogi-ply-hud-badge"
    });
    this.overlay.appendChild(this.hudBadge);
    this.container.appendChild(this.overlay);
  }
  /**
   * Show double tap seek animation (-10s or +10s)
   * @param {'left'|'right'} side
   * @param {number} seconds
   */
  showDoubleTapSeek(side, seconds = 10) {
    const isLeft = side === "left";
    const ripple = createElement("div", {
      className: `yogi-ply-seek-ripple yogi-ply-seek-ripple-${side}`,
      innerHTML: `
        <div class="yogi-ply-ripple-circle"></div>
        <div class="yogi-ply-ripple-content">
          ${isLeft ? icons.backward10 : icons.forward10}
          <span>${isLeft ? "-" : "+"}${Math.abs(seconds)}s</span>
        </div>
      `
    });
    this.overlay.appendChild(ripple);
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 750);
  }
  /**
   * Show HUD badge for volume or brightness
   * @param {'volume'|'brightness'} type
   * @param {number} percentage (0 to 100)
   */
  showHud(type, percentage) {
    if (this.hudTimer) {
      clearTimeout(this.hudTimer);
    }
    const icon = type === "volume" ? icons.volumeHigh : icons.sun;
    const label = type === "volume" ? "Volume" : "Brightness";
    const clampedPct = Math.max(0, Math.min(100, Math.round(percentage)));
    this.hudBadge.innerHTML = `
      <div class="yogi-ply-hud-icon">${icon}</div>
      <div class="yogi-ply-hud-details">
        <div class="yogi-ply-hud-label">${label}</div>
        <div class="yogi-ply-hud-bar">
          <div class="yogi-ply-hud-bar-fill" style="width: ${clampedPct}%"></div>
        </div>
      </div>
      <div class="yogi-ply-hud-val">${clampedPct}%</div>
    `;
    this.hudBadge.classList.add("yogi-ply-hud-visible");
    this.hudTimer = setTimeout(() => {
      this.hudBadge.classList.remove("yogi-ply-hud-visible");
    }, 1200);
  }
  destroy() {
    if (this.hudTimer) clearTimeout(this.hudTimer);
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
class GestureManager {
  /**
   * @param {HTMLElement} container
   * @param {HTMLVideoElement} video
   * @param {Player} player
   */
  constructor(container, video, player) {
    this.container = container;
    this.video = video;
    this.player = player;
    this.state = player.state;
    this.tracker = new ListenerTracker();
    this.feedback = new TouchFeedback(container);
    this.tapTimeout = null;
    this.lastTapTime = 0;
    this.lastTapX = 0;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.isDragging = false;
    this.dragType = null;
    this.brightness = 1;
    this.startVolume = 1;
    this.startBrightness = 1;
    this.init();
  }
  init() {
    this.tracker.add(this.container, "touchstart", (e) => this.handleTouchStart(e), { passive: true });
    this.tracker.add(this.container, "touchmove", (e) => this.handleTouchMove(e), { passive: false });
    this.tracker.add(this.container, "touchend", (e) => this.handleTouchEnd(e));
  }
  handleTouchStart(e) {
    if (e.target.closest(".yogi-ply-controls") || e.target.closest(".yogi-ply-settings-panel") || e.target.closest(".yogi-ply-btn") || e.target.closest(".yogi-ply-playlist-drawer")) {
      return;
    }
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.isDragging = false;
    this.dragType = null;
    this.startVolume = this.video ? this.video.volume : 1;
    this.startBrightness = this.brightness;
  }
  handleTouchMove(e) {
    if (e.touches.length !== 1) return;
    if (e.target.closest(".yogi-ply-controls") || e.target.closest(".yogi-ply-settings-panel") || e.target.closest(".yogi-ply-playlist-drawer")) {
      return;
    }
    const swipeMode = this.player.options.enableSwipeGestures;
    const isFullscreen2 = this.player.isFullscreen();
    if (swipeMode === false || swipeMode === "fullscreen-only" && !isFullscreen2) {
      return;
    }
    const touch = e.touches[0];
    const deltaY = this.touchStartY - touch.clientY;
    const deltaX = Math.abs(touch.clientX - this.touchStartX);
    if (!this.isDragging && Math.abs(deltaY) > 24 && Math.abs(deltaY) > deltaX * 1.5) {
      this.isDragging = true;
      const rect = this.container.getBoundingClientRect();
      const relativeX = (this.touchStartX - rect.left) / rect.width;
      this.dragType = relativeX < 0.5 ? "brightness" : "volume";
    }
    if (this.isDragging) {
      e.preventDefault();
      const rect = this.container.getBoundingClientRect();
      const sensitivity = 1 / (rect.height * 0.7);
      const change = deltaY * sensitivity;
      if (this.dragType === "volume") {
        const newVol = Math.max(0, Math.min(1, this.startVolume + change));
        this.player.setVolume(newVol);
        this.feedback.showHud("volume", newVol * 100);
      } else if (this.dragType === "brightness") {
        const newBright = Math.max(0.3, Math.min(1.7, this.startBrightness + change));
        this.brightness = newBright;
        if (this.video) {
          this.video.style.filter = `brightness(${newBright.toFixed(2)})`;
        }
        const pct = (newBright - 0.3) / 1.4 * 100;
        this.feedback.showHud("brightness", pct);
      }
    }
  }
  handleTouchEnd(e) {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragType = null;
      return;
    }
    if (e.target.closest(".yogi-ply-controls") || e.target.closest(".yogi-ply-settings-panel") || e.target.closest(".yogi-ply-btn") || e.target.closest(".yogi-ply-playlist-drawer")) {
      return;
    }
    const now = Date.now();
    const touch = e.changedTouches ? e.changedTouches[0] : null;
    if (!touch) return;
    const rect = this.container.getBoundingClientRect();
    const tapX = (touch.clientX - rect.left) / rect.width;
    const timeDiff = now - this.lastTapTime;
    if (timeDiff < 320 && Math.abs(tapX - this.lastTapX) < 0.3) {
      if (this.tapTimeout) {
        clearTimeout(this.tapTimeout);
        this.tapTimeout = null;
      }
      if (tapX < 0.38) {
        this.player.seek(this.player.getCurrentTime() - 10);
        this.feedback.showDoubleTapSeek("left", 10);
      } else if (tapX > 0.62) {
        this.player.seek(this.player.getCurrentTime() + 10);
        this.feedback.showDoubleTapSeek("right", 10);
      } else {
        this.player.togglePlay();
      }
      this.lastTapTime = 0;
    } else {
      this.lastTapTime = now;
      this.lastTapX = tapX;
      this.tapTimeout = setTimeout(() => {
        this.player.toggleControls();
        this.tapTimeout = null;
      }, 300);
    }
  }
  destroy() {
    if (this.tapTimeout) clearTimeout(this.tapTimeout);
    this.tracker.destroy();
    if (this.feedback) {
      this.feedback.destroy();
    }
  }
}
class KeyboardManager {
  /**
   * @param {HTMLElement} container
   * @param {Player} player
   */
  constructor(container, player) {
    this.container = container;
    this.player = player;
    this.tracker = new ListenerTracker();
    this.init();
  }
  init() {
    this.tracker.add(window, "keydown", (e) => this.handleKeyDown(e));
  }
  /**
   * Check if active element is an input, textarea, or content-editable
   * @returns {boolean}
   */
  isTyping(target) {
    if (!target) return false;
    const tag = target.tagName ? target.tagName.toLowerCase() : "";
    return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable || target.getAttribute && target.getAttribute("role") === "textbox";
  }
  handleKeyDown(e) {
    if (this.isTyping(e.target)) return;
    const isPlayerActive = this.container.contains(document.activeElement) || this.container.matches(":hover") || this.player.state.get("fullscreen");
    if (!isPlayerActive) return;
    const key = e.key;
    switch (key) {
      case " ":
      case "k":
      case "K":
        e.preventDefault();
        this.player.togglePlay();
        break;
      case "ArrowLeft":
      case "j":
      case "J":
        e.preventDefault();
        this.player.seek(this.player.getCurrentTime() - 10);
        break;
      case "ArrowRight":
      case "l":
      case "L":
        e.preventDefault();
        this.player.seek(this.player.getCurrentTime() + 10);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.player.setVolume(Math.min(1, this.player.getVolume() + 0.05));
        break;
      case "ArrowDown":
        e.preventDefault();
        this.player.setVolume(Math.max(0, this.player.getVolume() - 0.05));
        break;
      case "m":
      case "M":
        e.preventDefault();
        if (this.player.state.get("muted")) {
          this.player.unmute();
        } else {
          this.player.mute();
        }
        break;
      case "f":
      case "F":
        e.preventDefault();
        this.player.toggleFullscreen();
        break;
      case "t":
      case "T":
        e.preventDefault();
        this.player.toggleTheatre();
        break;
      case "p":
      case "P":
        e.preventDefault();
        this.player.togglePip();
        break;
      case "c":
      case "C":
        e.preventDefault();
        this.toggleSubtitles();
        break;
      case "Escape":
        if (this.player.settingsMenu && this.player.settingsMenu.isOpen) {
          e.preventDefault();
          this.player.settingsMenu.close();
        } else if (this.player.state.get("fullscreen")) {
          e.preventDefault();
          this.player.exitFullscreen();
        }
        break;
    }
  }
  toggleSubtitles() {
    const current = this.player.state.get("currentSubtitle");
    const tracks = this.player.state.get("subtitles") || [];
    if (tracks.length === 0) return;
    if (current === "off") {
      this.player.setSubtitle(tracks[0].id);
    } else {
      this.player.setSubtitle("off");
    }
  }
  destroy() {
    this.tracker.destroy();
  }
}
const ANIMATION_VARIANTS = [
  "player-enter",
  "player-exit",
  "play-tap",
  "pause-tap",
  "btn-press",
  "btn-glow",
  "dock-enter",
  "dock-exit",
  "dock-auto-hide",
  "more-tap",
  "menu-expand",
  "menu-collapse",
  "panel-enter",
  "panel-exit",
  "seek-active",
  "seek-preview",
  "volume-slide",
  "spinner",
  "buffering",
  "sub-enter",
  "sub-exit",
  "playlist-enter",
  "playlist-exit",
  "theme-transition",
  "fullscreen-enter",
  "theatre-transition",
  "doubletap-ripple",
  "fwd-feedback",
  "back-feedback",
  "gesture-hud",
  "watermark-move",
  "watermark-drift",
  "tooltip-enter",
  "error-bounce",
  "select-feedback",
  "speed-feedback",
  "chapter-feedback",
  "screenshot-flash",
  "pip-feedback",
  "hud-pulse"
];
const ANIMATION_PRESETS = {
  cinematic: {
    durationMultiplier: 1,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    intensity: "medium"
  },
  smooth: {
    durationMultiplier: 1.3,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    intensity: "soft"
  },
  instant: {
    durationMultiplier: 0.2,
    easing: "linear",
    intensity: "minimal"
  },
  subtle: {
    durationMultiplier: 0.8,
    easing: "ease-out",
    intensity: "low"
  },
  spring: {
    durationMultiplier: 1.1,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    intensity: "high"
  }
};
class AnimationEngine {
  /**
   * @param {HTMLElement} playerContainer
   * @param {Object} options
   */
  constructor(playerContainer, options = {}) {
    this.container = playerContainer;
    this.preset = options.preset || "cinematic";
    this.reducedMotion = false;
    this.checkReducedMotion();
  }
  checkReducedMotion() {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.reducedMotion = mq.matches;
      if (mq.addEventListener) {
        mq.addEventListener("change", (e) => {
          this.reducedMotion = e.matches;
        });
      }
    }
  }
  /**
   * Trigger an animation class on an element and clean up automatically
   * @param {HTMLElement} element
   * @param {string} animationName
   * @param {number} fallbackDurationMs
   * @returns {Promise<void>}
   */
  trigger(element, animationName, fallbackDurationMs = 400) {
    if (!element || this.reducedMotion) return Promise.resolve();
    const className = `yogi-anim-${animationName}`;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    return new Promise((resolve) => {
      let resolved = false;
      const cleanup = () => {
        if (resolved) return;
        resolved = true;
        element.classList.remove(className);
        element.removeEventListener("animationend", cleanup);
        resolve();
      };
      element.addEventListener("animationend", cleanup, { once: true });
      setTimeout(cleanup, fallbackDurationMs + 50);
    });
  }
  /**
   * Flash screenshot capture overlay
   */
  flashScreenshot() {
    if (this.reducedMotion || !this.container) return;
    const flash = document.createElement("div");
    flash.className = "yogi-anim-screenshot-flash";
    this.container.appendChild(flash);
    setTimeout(() => {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 450);
  }
  /**
   * Set animation preset
   * @param {string} presetName
   */
  setPreset(presetName) {
    if (ANIMATION_PRESETS[presetName]) {
      this.preset = presetName;
    }
  }
  /**
   * Get list of all available animation variants
   * @returns {string[]}
   */
  getVariants() {
    return [...ANIMATION_VARIANTS];
  }
}
const HLS_CDN_URL = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
const DASH_CDN_URL = "https://cdn.jsdelivr.net/npm/dashjs@4/dist/dash.all.min.js";
let hlsPromise = null;
let dashPromise = null;
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", (err) => reject(err));
      if (window.Hls || window.dashjs) {
        resolve();
        return;
      }
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load streaming script: ${url}`));
    document.head.appendChild(script);
  });
}
async function loadHls() {
  if (typeof window !== "undefined" && window.Hls) {
    return window.Hls;
  }
  if (!hlsPromise) {
    hlsPromise = loadScript(HLS_CDN_URL).then(() => {
      if (window.Hls) return window.Hls;
      throw new Error("HLS.js loaded but window.Hls is not defined");
    });
  }
  return hlsPromise;
}
async function loadDash() {
  if (typeof window !== "undefined" && window.dashjs) {
    return window.dashjs;
  }
  if (!dashPromise) {
    dashPromise = loadScript(DASH_CDN_URL).then(() => {
      if (window.dashjs) return window.dashjs;
      throw new Error("DASH.js loaded but window.dashjs is not defined");
    });
  }
  return dashPromise;
}
class HlsAdapter {
  constructor(video, state) {
    this.video = video;
    this.state = state;
    this.hls = null;
    this.isNative = false;
  }
  /**
   * Load and attach HLS stream
   * @param {string} sourceUrl
   */
  async load(sourceUrl) {
    this.destroy();
    try {
      const Hls = await loadHls();
      if (Hls && Hls.isSupported()) {
        this.hls = new Hls({
          capLevelToPlayerSize: true,
          autoStartLoad: true
        });
        this.hls.attachMedia(this.video);
        this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          this.hls.loadSource(sourceUrl);
        });
        this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          const levels = this.hls.levels || [];
          const qualityOptions = [{ label: "Auto", value: "auto" }];
          levels.forEach((level, index) => {
            const height = level.height || Math.round((level.bitrate || 0) / 1e3);
            qualityOptions.push({
              label: level.height ? `${level.height}p` : `${height}k`,
              value: index
            });
          });
          this.state.set("qualities", qualityOptions);
          const audioTracks = this.hls.audioTracks || [];
          if (audioTracks.length > 0) {
            const trackList = audioTracks.map((tr, idx) => ({
              id: String(idx),
              label: tr.name || tr.lang || `Track ${idx + 1}`
            }));
            this.state.set("audioTracks", trackList);
          }
        });
        this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          const level = this.hls.levels[data.level];
          if (level && level.height) {
            this.state.emit("qualitychange", `${level.height}p`);
          }
        });
        this.hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn("[Yogi_PLY] HLS Network error, attempting recovery...");
                this.hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("[Yogi_PLY] HLS Media error, attempting recovery...");
                this.hls.recoverMediaError();
                break;
              default:
                console.error("[Yogi_PLY] Fatal HLS error:", data);
                this.state.set("error", "HLS stream playback failed");
                this.destroy();
                break;
            }
          }
        });
        return;
      }
    } catch (err) {
      console.warn("[Yogi_PLY] Hls.js not available, falling back to native HLS check:", err);
    }
    const canNative = this.video.canPlayType("application/vnd.apple.mpegurl");
    if (canNative) {
      this.isNative = true;
      this.video.src = sourceUrl;
      this.state.set("qualities", [{ label: "Auto (Native)", value: "auto" }]);
      return;
    }
    this.state.set("error", "HLS streaming is not supported by your current browser.");
  }
  /**
   * Set quality level
   * @param {string|number} qualityValue 'auto' or index
   */
  setQuality(qualityValue) {
    if (!this.hls) return;
    if (qualityValue === "auto") {
      this.hls.currentLevel = -1;
    } else {
      const idx = Number(qualityValue);
      if (!isNaN(idx) && idx >= 0 && idx < this.hls.levels.length) {
        this.hls.currentLevel = idx;
      }
    }
    this.state.set("quality", qualityValue);
  }
  /**
   * Set audio track
   * @param {string|number} trackIndex
   */
  setAudioTrack(trackIndex) {
    if (!this.hls) return;
    const idx = Number(trackIndex);
    if (!isNaN(idx) && idx >= 0 && idx < this.hls.audioTracks.length) {
      this.hls.audioTrack = idx;
      this.state.set("currentAudioTrack", trackIndex);
    }
  }
  destroy() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this.isNative = false;
  }
}
class DashAdapter {
  constructor(video, state) {
    this.video = video;
    this.state = state;
    this.player = null;
  }
  /**
   * Load and attach MPEG-DASH stream
   * @param {string} sourceUrl
   */
  async load(sourceUrl) {
    this.destroy();
    try {
      const dashjs = await loadDash();
      this.player = dashjs.MediaPlayer().create();
      this.player.initialize(this.video, sourceUrl, false);
      this.player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
        const bitrates = this.player.getBitrateInfoListFor("video") || [];
        const qualityOptions = [{ label: "Auto", value: "auto" }];
        bitrates.forEach((b, idx) => {
          qualityOptions.push({
            label: b.height ? `${b.height}p` : `${Math.round(b.bitrate / 1e3)}k`,
            value: idx
          });
        });
        this.state.set("qualities", qualityOptions);
        const audioTracks = this.player.getTracksFor("audio") || [];
        if (audioTracks.length > 0) {
          const trackList = audioTracks.map((tr, idx) => ({
            id: String(idx),
            label: tr.lang || `Track ${idx + 1}`
          }));
          this.state.set("audioTracks", trackList);
        }
      });
      this.player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
        console.error("[Yogi_PLY] DASH playback error:", e);
        this.state.set("error", "MPEG-DASH stream playback failed");
      });
    } catch (err) {
      console.error("[Yogi_PLY] DASH Adapter initialization failed:", err);
      this.state.set("error", err.message);
    }
  }
  /**
   * Set quality level
   * @param {string|number} qualityValue
   */
  setQuality(qualityValue) {
    if (!this.player) return;
    if (qualityValue === "auto") {
      this.player.updateSettings({
        streaming: { abr: { autoSwitchBitrate: { video: true } } }
      });
    } else {
      const idx = Number(qualityValue);
      this.player.updateSettings({
        streaming: { abr: { autoSwitchBitrate: { video: false } } }
      });
      this.player.setQualityFor("video", idx);
    }
    this.state.set("quality", qualityValue);
  }
  /**
   * Set audio track
   * @param {string|number} trackIndex
   */
  setAudioTrack(trackIndex) {
    if (!this.player) return;
    const tracks = this.player.getTracksFor("audio") || [];
    const idx = Number(trackIndex);
    if (tracks[idx]) {
      this.player.setCurrentTrack(tracks[idx]);
      this.state.set("currentAudioTrack", trackIndex);
    }
  }
  destroy() {
    if (this.player) {
      this.player.reset();
      this.player = null;
    }
  }
}
class ExternalAdapter {
  constructor(container, options = {}, state = null) {
    this.container = container;
    this.options = options;
    this.state = state;
    this.isReady = false;
  }
  load(url) {
    throw new Error("load() must be implemented by adapter");
  }
  play() {
  }
  pause() {
  }
  togglePlay() {
  }
  seek(seconds) {
  }
  setVolume(volume) {
  }
  mute() {
  }
  unmute() {
  }
  getCurrentTime() {
    return 0;
  }
  getDuration() {
    return 0;
  }
  destroy() {
  }
}
let ytApiPromise = null;
function loadYouTubeApi() {
  if (typeof window !== "undefined" && window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        document.head.appendChild(tag);
      }
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === "function") prevCallback();
        resolve(window.YT);
      };
    });
  }
  return ytApiPromise;
}
class YouTubeAdapter extends ExternalAdapter {
  constructor(container, options = {}, state = null) {
    super(container, options, state);
    this.player = null;
    this.iframeContainer = null;
  }
  /**
   * Extract video ID from YouTube URL
   */
  static extractVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }
  static isYouTubeUrl(url) {
    return Boolean(YouTubeAdapter.extractVideoId(url));
  }
  async load(url) {
    const videoId = YouTubeAdapter.extractVideoId(url);
    if (!videoId) {
      throw new Error(`Invalid YouTube URL: ${url}`);
    }
    const YT = await loadYouTubeApi();
    this.iframeContainer = createElement("div", {
      className: "yogi-ply-external-frame"
    });
    this.container.appendChild(this.iframeContainer);
    return new Promise((resolve) => {
      this.player = new YT.Player(this.iframeContainer, {
        videoId,
        playerVars: {
          autoplay: this.options.autoplay ? 1 : 0,
          controls: 1,
          // YouTube controls required for TOS compliance
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            this.isReady = true;
            if (this.state) {
              this.state.set("duration", this.player.getDuration() || 0);
              this.state.emit("ready");
            }
            resolve();
          },
          onStateChange: (event) => {
            if (!this.state) return;
            if (event.data === YT.PlayerState.PLAYING) {
              this.state.set("playing", true);
              this.state.set("paused", false);
              this.state.emit("play");
            } else if (event.data === YT.PlayerState.PAUSED) {
              this.state.set("playing", false);
              this.state.set("paused", true);
              this.state.emit("pause");
            } else if (event.data === YT.PlayerState.ENDED) {
              this.state.set("ended", true);
              this.state.emit("ended");
            }
          }
        }
      });
    });
  }
  play() {
    if (this.player && this.player.playVideo) this.player.playVideo();
  }
  pause() {
    if (this.player && this.player.pauseVideo) this.player.pauseVideo();
  }
  togglePlay() {
    if (!this.player) return;
    const state = this.player.getPlayerState();
    if (state === 1) {
      this.pause();
    } else {
      this.play();
    }
  }
  seek(seconds) {
    if (this.player && this.player.seekTo) {
      this.player.seekTo(seconds, true);
    }
  }
  setVolume(volume) {
    if (this.player && this.player.setVolume) {
      this.player.setVolume(Math.round(volume * 100));
    }
  }
  mute() {
    if (this.player && this.player.mute) this.player.mute();
  }
  unmute() {
    if (this.player && this.player.unMute) this.player.unMute();
  }
  getCurrentTime() {
    return this.player && this.player.getCurrentTime ? this.player.getCurrentTime() : 0;
  }
  getDuration() {
    return this.player && this.player.getDuration ? this.player.getDuration() : 0;
  }
  destroy() {
    if (this.player && this.player.destroy) {
      this.player.destroy();
      this.player = null;
    }
    if (this.iframeContainer && this.iframeContainer.parentNode) {
      this.iframeContainer.parentNode.removeChild(this.iframeContainer);
      this.iframeContainer = null;
    }
  }
}
let vimeoApiPromise = null;
function loadVimeoApi() {
  if (typeof window !== "undefined" && window.Vimeo && window.Vimeo.Player) {
    return Promise.resolve(window.Vimeo);
  }
  if (!vimeoApiPromise) {
    vimeoApiPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="player.vimeo.com/api/player.js"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.Vimeo));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://player.vimeo.com/api/player.js";
      script.async = true;
      script.onload = () => resolve(window.Vimeo);
      script.onerror = () => reject(new Error("Failed to load Vimeo Player API"));
      document.head.appendChild(script);
    });
  }
  return vimeoApiPromise;
}
class VimeoAdapter extends ExternalAdapter {
  constructor(container, options = {}, state = null) {
    super(container, options, state);
    this.player = null;
    this.iframeContainer = null;
  }
  static extractVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/);
    return match ? match[1] : null;
  }
  static isVimeoUrl(url) {
    return Boolean(VimeoAdapter.extractVideoId(url));
  }
  async load(url) {
    const videoId = VimeoAdapter.extractVideoId(url);
    if (!videoId) {
      throw new Error(`Invalid Vimeo URL: ${url}`);
    }
    const Vimeo = await loadVimeoApi();
    this.iframeContainer = createElement("div", {
      className: "yogi-ply-external-frame"
    });
    this.container.appendChild(this.iframeContainer);
    this.player = new Vimeo.Player(this.iframeContainer, {
      id: Number(videoId),
      autoplay: Boolean(this.options.autoplay),
      responsive: true
    });
    await this.player.ready();
    this.isReady = true;
    const duration = await this.player.getDuration();
    if (this.state) {
      this.state.set("duration", duration);
      this.state.emit("ready");
    }
    this.player.on("play", () => {
      if (this.state) {
        this.state.set("playing", true);
        this.state.set("paused", false);
        this.state.emit("play");
      }
    });
    this.player.on("pause", () => {
      if (this.state) {
        this.state.set("playing", false);
        this.state.set("paused", true);
        this.state.emit("pause");
      }
    });
    this.player.on("ended", () => {
      if (this.state) {
        this.state.set("ended", true);
        this.state.emit("ended");
      }
    });
    this.player.on("timeupdate", (data) => {
      if (this.state) {
        this.state.set("currentTime", data.seconds);
        this.state.emit("timeupdate", data.seconds);
      }
    });
  }
  play() {
    if (this.player) this.player.play();
  }
  pause() {
    if (this.player) this.player.pause();
  }
  togglePlay() {
    if (!this.player) return;
    this.player.getPaused().then((isPaused) => {
      if (isPaused) {
        this.play();
      } else {
        this.pause();
      }
    });
  }
  seek(seconds) {
    if (this.player) this.player.setCurrentTime(seconds);
  }
  setVolume(volume) {
    if (this.player) this.player.setVolume(volume);
  }
  mute() {
    if (this.player) this.player.setMuted(true);
  }
  unmute() {
    if (this.player) this.player.setMuted(false);
  }
  destroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    if (this.iframeContainer && this.iframeContainer.parentNode) {
      this.iframeContainer.parentNode.removeChild(this.iframeContainer);
      this.iframeContainer = null;
    }
  }
}
const THEMES = {
  "liquid-glass": {
    name: "Liquid Glass",
    className: "yogi-ply-theme-liquid-glass",
    vars: {
      "--yogi-glass-bg": "rgba(18, 22, 34, 0.65)",
      "--yogi-glass-border": "rgba(255, 255, 255, 0.16)",
      "--yogi-glass-blur": "20px",
      "--yogi-accent": "#8b9cff",
      "--yogi-accent-rgb": "139, 156, 255",
      "--yogi-primary": "#ffffff",
      "--yogi-text": "#ffffff",
      "--yogi-panel-bg": "rgba(14, 17, 27, 0.85)"
    }
  },
  "dark": {
    name: "Cinematic Dark",
    className: "yogi-ply-theme-dark",
    vars: {
      "--yogi-glass-bg": "rgba(12, 14, 20, 0.82)",
      "--yogi-glass-border": "rgba(255, 255, 255, 0.1)",
      "--yogi-glass-blur": "16px",
      "--yogi-accent": "#6366f1",
      "--yogi-accent-rgb": "99, 102, 241",
      "--yogi-primary": "#ffffff",
      "--yogi-text": "#f3f4f6",
      "--yogi-panel-bg": "rgba(10, 11, 16, 0.92)"
    }
  },
  "light": {
    name: "Frosted Light",
    className: "yogi-ply-theme-light",
    vars: {
      "--yogi-glass-bg": "rgba(245, 247, 252, 0.72)",
      "--yogi-glass-border": "rgba(0, 0, 0, 0.12)",
      "--yogi-glass-blur": "20px",
      "--yogi-accent": "#3b82f6",
      "--yogi-accent-rgb": "59, 130, 246",
      "--yogi-primary": "#0f172a",
      "--yogi-text": "#1e293b",
      "--yogi-panel-bg": "rgba(255, 255, 255, 0.92)"
    }
  },
  "cinematic-oled": {
    name: "Pure OLED Black",
    className: "yogi-ply-theme-oled",
    vars: {
      "--yogi-glass-bg": "rgba(0, 0, 0, 0.9)",
      "--yogi-glass-border": "rgba(255, 255, 255, 0.18)",
      "--yogi-glass-blur": "24px",
      "--yogi-accent": "#38bdf8",
      "--yogi-accent-rgb": "56, 189, 248",
      "--yogi-primary": "#ffffff",
      "--yogi-text": "#ffffff",
      "--yogi-panel-bg": "rgba(0, 0, 0, 0.98)"
    }
  }
};
let instanceCounter = 0;
class Player extends EventEmitter {
  /**
   * @param {HTMLElement|string} target Selector or element
   * @param {Object} options Configuration options
   */
  constructor(target, options = {}) {
    super();
    this.id = `yogi-ply-${++instanceCounter}`;
    this.options = {
      source: "",
      sources: [],
      poster: "",
      title: "Yogi_PLY Cinematic Player",
      autoplay: false,
      muted: false,
      loop: false,
      volume: 1,
      theme: "liquid-glass",
      layout: "cinematic",
      controls: true,
      showBackButton: false,
      watermark: {
        opacity: 0.28,
        interval: 12e3,
        movement: true,
        animationStyle: "fade-slide"
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
      enableSwipeGestures: "fullscreen-only",
      ...options
    };
    this.target = typeof target === "string" ? document.querySelector(target) : target;
    if (!this.target) {
      throw new Error(`[Yogi_PLY] Target container element "${target}" was not found in document.`);
    }
    this.state = new State({
      theme: this.options.theme || "liquid-glass",
      layout: this.options.layout || "cinematic",
      chapters: this.options.chapters || [],
      skipIntro: this.options.skipIntro || null,
      skipOutro: this.options.skipOutro || null,
      loop: Boolean(this.options.loop),
      aspectRatio: "16:9",
      sleepTimer: "off",
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
    if (this.options.source) {
      this.setSource(this.options.source);
    } else if (this.options.playlist && this.options.playlist.length > 0) {
      this.playlist.playIndex(0);
    }
    this.emit("ready", { id: this.id });
  }
  buildDOM() {
    if (this.target.tagName && this.target.tagName.toLowerCase() === "video") {
      this.video = this.target;
      this.container = createElement("div", {
        className: "yogi-ply yogi-anim-player-enter",
        id: this.id
      });
      this.video.parentNode.insertBefore(this.container, this.video);
      this.container.appendChild(this.video);
    } else {
      this.container = this.target;
      this.container.classList.add("yogi-ply", "yogi-anim-player-enter");
      this.container.id = this.id;
      let existingVideo = this.container.querySelector("video");
      if (existingVideo) {
        this.video = existingVideo;
      } else {
        this.video = createElement("video", {
          playsinline: true,
          "webkit-playsinline": true
        });
        this.container.appendChild(this.video);
      }
    }
    if (this.options.layout === "compact") {
      this.container.classList.add("yogi-ply-layout-compact");
    }
    this.engine = new Engine(this.video, this.state, this.options);
  }
  initTheme() {
    this.setTheme(this.options.theme || "liquid-glass");
  }
  initAnimations() {
    this.animations = new AnimationEngine(this.container, this.options.animation);
  }
  initWatermark() {
    let wmConfig = {
      enabled: true,
      text: PERMANENT_WATERMARK_TEXT,
      color: "#ffffff",
      opacity: 0.28,
      fontSize: "13px",
      interval: 12e3,
      movement: true,
      animationStyle: "fade-slide"
    };
    if (typeof this.options.watermark === "object" && this.options.watermark !== null) {
      if (typeof this.options.watermark.opacity === "number") wmConfig.opacity = this.options.watermark.opacity;
      if (this.options.watermark.animationStyle) wmConfig.animationStyle = this.options.watermark.animationStyle;
      if (typeof this.options.watermark.movement === "boolean") wmConfig.movement = this.options.watermark.movement;
      if (this.options.watermark.interval) wmConfig.interval = this.options.watermark.interval;
      if (this.options.watermark.color) wmConfig.color = this.options.watermark.color;
      if (this.options.watermark.fontSize) wmConfig.fontSize = this.options.watermark.fontSize;
    }
    wmConfig.enabled = true;
    wmConfig.text = PERMANENT_WATERMARK_TEXT;
    this.state.set("watermark", wmConfig);
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
      "play",
      "pause",
      "timeupdate",
      "seeking",
      "seeked",
      "volumechange",
      "ratechange",
      "ended",
      "error",
      "loadedmetadata",
      "waiting",
      "canplay",
      "chapterchange",
      "sleeptimertrigger"
    ];
    eventsToForward.forEach((evt) => {
      this.state.on(evt, (...args) => this.emit(evt, ...args));
    });
    const fsEvent = getFullscreenChangeEventName();
    this.tracker.add(document, fsEvent, () => {
      const isFs = isFullscreen(this.container);
      this.state.set("fullscreen", isFs);
      this.emit("fullscreenchange", isFs);
    });
    this.tracker.add(this.video, "enterpictureinpicture", () => {
      this.state.set("pip", true);
      this.emit("enterpictureinpicture");
    });
    this.tracker.add(this.video, "leavepictureinpicture", () => {
      this.state.set("pip", false);
      this.emit("leavepictureinpicture");
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
    if (this.state.get("playing")) {
      this.pause();
    } else {
      this.play().catch(() => {
      });
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
    this.state.set("loop", isLoop);
    if (this.video) {
      this.video.loop = isLoop;
    }
  }
  toggleLoop() {
    this.setLoop(!this.state.get("loop"));
  }
  isLoop() {
    return Boolean(this.state.get("loop"));
  }
  async setQuality(quality) {
    if (this.hlsAdapter) {
      this.hlsAdapter.setQuality(quality);
      this.emit("qualitychange", quality);
      return;
    }
    if (this.dashAdapter) {
      this.dashAdapter.setQuality(quality);
      this.emit("qualitychange", quality);
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
          } catch (e) {
          }
          if (wasPlaying) {
            this.play().catch(() => {
            });
          }
        };
        this.video.addEventListener("loadedmetadata", onMetadata, { once: true });
        this.video.src = match.src;
        this.video.load();
        this.state.set("quality", quality);
        this.emit("qualitychange", quality);
      }
    }
  }
  async setSource(source) {
    this.options.source = source;
    this.state.set("error", null);
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
    if (!compat.supported && compat.type !== "external" && compat.type !== "streaming") {
      const errMsg = compat.reason || "Unsupported media format";
      this.state.set("error", errMsg);
      this.state.set("compatibilityNotice", compat);
      this.emit("unsupportedformat", compat);
      this.emit("error", errMsg);
      return;
    }
    if (YouTubeAdapter.isYouTubeUrl(source)) {
      this.externalAdapter = new YouTubeAdapter(this.container, this.options, this.state);
      this.video.style.display = "none";
      await this.externalAdapter.load(source);
      return;
    }
    if (VimeoAdapter.isVimeoUrl(source)) {
      this.externalAdapter = new VimeoAdapter(this.container, this.options, this.state);
      this.video.style.display = "none";
      await this.externalAdapter.load(source);
      return;
    }
    this.video.style.display = "block";
    if (typeof source === "string" && (source.includes(".m3u8") || source.includes("type=hls"))) {
      this.hlsAdapter = new HlsAdapter(this.video, this.state);
      await this.hlsAdapter.load(source);
      return;
    }
    if (typeof source === "string" && (source.includes(".mpd") || source.includes("type=dash"))) {
      this.dashAdapter = new DashAdapter(this.video, this.state);
      await this.dashAdapter.load(source);
      return;
    }
    this.video.src = source;
    this.video.load();
    if (Array.isArray(this.options.sources) && this.options.sources.length > 0) {
      const qList = this.options.sources.map((s) => ({ label: s.label || s.quality, value: s.label || s.quality }));
      this.state.set("qualities", qList);
    } else {
      this.state.set("qualities", [{ label: "Auto (Original)", value: "auto" }]);
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
    this.state.set("title", title);
    const titleEl = this.container.querySelector(".yogi-ply-title");
    if (titleEl) titleEl.textContent = title;
    this.engine.updateMediaSession();
  }
  setChapters(chapters) {
    this.options.chapters = chapters;
    if (this.chapters) {
      return this.chapters.setChapters(chapters);
    }
    this.state.set("chapters", chapters);
    return chapters;
  }
  getChapters() {
    return this.chapters ? this.chapters.getChapters() : this.state.get("chapters") || [];
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
    this.state.set("aspectRatio", ratio);
    if (!this.video) return;
    if (ratio === "Fill (Cover)") {
      this.video.style.objectFit = "cover";
    } else if (ratio === "Stretch") {
      this.video.style.objectFit = "fill";
    } else {
      this.video.style.objectFit = "contain";
    }
    this.emit("aspectratiochange", ratio);
  }
  setSleepTimer(minutesOrType) {
    this.engine.setSleepTimer(minutesOrType);
  }
  getSleepTimer() {
    return this.state.get("sleepTimer");
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
    this.state.set("audioDelay", val);
    this.emit("audiodelaychange", val);
  }
  getDiagnostics() {
    const v = this.video;
    let engineType = "HTML5 Native";
    if (this.hlsAdapter) engineType = "HLS.js Adaptive Bitrate";
    if (this.dashAdapter) engineType = "DASH.js Adaptive Bitrate";
    if (this.externalAdapter) engineType = this.externalAdapter.providerName || "External Frame";
    return {
      source: this.options.source || (v ? v.currentSrc : ""),
      resolution: v && v.videoWidth ? `${v.videoWidth}x${v.videoHeight}` : "Unknown",
      viewport: this.container ? `${this.container.clientWidth}x${this.container.clientHeight}` : "0x0",
      duration: this.getDuration(),
      currentTime: this.getCurrentTime(),
      bufferedRatio: this.state.get("buffered") || 0,
      bufferedSeconds: this.state.get("bufferedSeconds") || 0,
      volume: this.getVolume(),
      isMuted: this.isMuted(),
      isPaused: this.isPaused(),
      playbackRate: this.getPlaybackRate(),
      engine: engineType,
      aspectRatio: this.state.get("aspectRatio") || "16:9",
      sleepTimer: this.state.get("sleepTimer") || "off"
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
    const isTheatre = !this.state.get("theatre");
    this.state.set("theatre", isTheatre);
    if (isTheatre) {
      this.container.classList.add("yogi-ply-theatre");
    } else {
      this.container.classList.remove("yogi-ply-theatre");
    }
    this.emit("theatrechange", isTheatre);
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
      console.warn("[Yogi_PLY] Picture-in-Picture error:", err);
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
    this.state.set("watermark", { ...this.watermark.options });
    this.emit("watermarkchange", this.watermark.options);
  }
  setTheme(themeId) {
    const theme = THEMES[themeId] || THEMES["liquid-glass"];
    Object.values(THEMES).forEach((t) => {
      this.container.classList.remove(t.className);
    });
    this.container.classList.add(theme.className);
    for (const [varName, varVal] of Object.entries(theme.vars)) {
      this.container.style.setProperty(varName, varVal);
    }
    this.state.set("theme", themeId);
    this.emit("themechange", themeId);
  }
  setSubtitle(trackId) {
    if (this.subtitles) {
      this.subtitles.setTrack(trackId);
      this.emit("subtitlechange", trackId);
    }
  }
  toggleControls() {
    if (this.container.classList.contains("yogi-ply-controls-hidden")) {
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
    return this.state.get("quality");
  }
  getQualities() {
    return this.state.get("qualities") || [];
  }
  getSubtitle() {
    return this.state.get("currentSubtitle");
  }
  getSubtitles() {
    return this.state.get("subtitles") || [];
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
    if (!this.video) throw new Error("Video element unavailable");
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
    if (typeof window !== "undefined" && window.YogiPLY && window.YogiPLY.instances) {
      window.YogiPLY.instances.delete(this.id);
    }
    this.container.classList.remove(
      "yogi-ply",
      "yogi-ply-theatre",
      "yogi-ply-controls-hidden",
      "yogi-ply-theme-liquid-glass",
      "yogi-ply-theme-dark",
      "yogi-ply-theme-light",
      "yogi-ply-theme-oled",
      "yogi-anim-player-enter"
    );
  }
}
const version = "1.0.0";
const instances = /* @__PURE__ */ new Map();
function init(target, options = {}) {
  if (typeof target === "string") {
    const elements = document.querySelectorAll(target);
    if (elements.length === 1) {
      const player = new Player(elements[0], options);
      instances.set(player.id, player);
      return player;
    }
    return Array.from(elements).map((el) => {
      const player = new Player(el, options);
      instances.set(player.id, player);
      return player;
    });
  } else if (target instanceof NodeList || Array.isArray(target)) {
    return Array.from(target).map((el) => {
      const player = new Player(el, options);
      instances.set(player.id, player);
      return player;
    });
  } else if (target instanceof HTMLElement) {
    const player = new Player(target, options);
    instances.set(player.id, player);
    return player;
  }
  return null;
}
function autoInit() {
  const elements = document.querySelectorAll(".yogi-ply:not([data-yogi-initialized])");
  elements.forEach((el) => {
    el.setAttribute("data-yogi-initialized", "true");
    const source = el.getAttribute("data-video") || el.getAttribute("data-src") || "";
    const poster = el.getAttribute("data-poster") || "";
    const theme = el.getAttribute("data-theme") || "liquid-glass";
    const autoplay = el.hasAttribute("data-autoplay");
    const loop = el.hasAttribute("data-loop");
    const watermarkAttr = el.getAttribute("data-watermark");
    const watermark = watermarkAttr !== null ? watermarkAttr !== "false" : true;
    const subSrc = el.getAttribute("data-subtitles");
    const subtitles = subSrc ? [{ src: subSrc, label: "Default", srclang: "en", default: true }] : [];
    const player = new Player(el, {
      source,
      poster,
      theme,
      autoplay,
      loop,
      watermark,
      subtitles
    });
    instances.set(player.id, player);
  });
}
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
}
const YogiPLY = {
  Player,
  init,
  autoInit,
  instances,
  version,
  THEMES,
  icons,
  ChapterManager,
  parseSrt,
  srtToVtt,
  inspectMediaCompatibility,
  FORMAT_DEFINITIONS
};
if (typeof window !== "undefined") {
  window.YogiPLY = YogiPLY;
}
export {
  ChapterManager,
  FORMAT_DEFINITIONS,
  Player,
  THEMES,
  autoInit,
  YogiPLY as default,
  icons,
  init,
  inspectMediaCompatibility,
  instances,
  parseSrt,
  srtToVtt,
  version
};
//# sourceMappingURL=yogi-ply.esm.js.map
