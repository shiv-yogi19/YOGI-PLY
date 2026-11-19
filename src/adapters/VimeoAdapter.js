/**
 * Yogi_PLY - Vimeo API Adapter
 * Created By Shiv Yogi
 */

import { ExternalAdapter } from './ExternalAdapter.js';
import { createElement } from '../utils/dom.js';

let vimeoApiPromise = null;

function loadVimeoApi() {
  if (typeof window !== 'undefined' && window.Vimeo && window.Vimeo.Player) {
    return Promise.resolve(window.Vimeo);
  }

  if (!vimeoApiPromise) {
    vimeoApiPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="player.vimeo.com/api/player.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.Vimeo));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      script.onload = () => resolve(window.Vimeo);
      script.onerror = () => reject(new Error('Failed to load Vimeo Player API'));
      document.head.appendChild(script);
    });
  }

  return vimeoApiPromise;
}

export class VimeoAdapter extends ExternalAdapter {
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

    this.iframeContainer = createElement('div', {
      className: 'yogi-ply-external-frame'
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
      this.state.set('duration', duration);
      this.state.emit('ready');
    }

    this.player.on('play', () => {
      if (this.state) {
        this.state.set('playing', true);
        this.state.set('paused', false);
        this.state.emit('play');
      }
    });

    this.player.on('pause', () => {
      if (this.state) {
        this.state.set('playing', false);
        this.state.set('paused', true);
        this.state.emit('pause');
      }
    });

    this.player.on('ended', () => {
      if (this.state) {
        this.state.set('ended', true);
        this.state.emit('ended');
      }
    });

    this.player.on('timeupdate', (data) => {
      if (this.state) {
        this.state.set('currentTime', data.seconds);
        this.state.emit('timeupdate', data.seconds);
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
