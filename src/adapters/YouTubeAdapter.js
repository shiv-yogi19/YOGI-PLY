/**
 * Yogi_PLY - YouTube Iframe API Adapter
 * Created By Shiv Yogi
 * 
 * Note: External platform iframe security restrictions prevent custom watermark
 * positioning directly on top of cross-origin iframes without user-interaction block,
 * custom subtitle injection, and frame screenshot extraction.
 */

import { ExternalAdapter } from './ExternalAdapter.js';
import { createElement } from '../utils/dom.js';

let ytApiPromise = null;

function loadYouTubeApi() {
  if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        resolve(window.YT);
      };
    });
  }

  return ytApiPromise;
}

export class YouTubeAdapter extends ExternalAdapter {
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

    this.iframeContainer = createElement('div', {
      className: 'yogi-ply-external-frame'
    });
    this.container.appendChild(this.iframeContainer);

    return new Promise((resolve) => {
      this.player = new YT.Player(this.iframeContainer, {
        videoId,
        playerVars: {
          autoplay: this.options.autoplay ? 1 : 0,
          controls: 1, // YouTube controls required for TOS compliance
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            this.isReady = true;
            if (this.state) {
              this.state.set('duration', this.player.getDuration() || 0);
              this.state.emit('ready');
            }
            resolve();
          },
          onStateChange: (event) => {
            if (!this.state) return;
            if (event.data === YT.PlayerState.PLAYING) {
              this.state.set('playing', true);
              this.state.set('paused', false);
              this.state.emit('play');
            } else if (event.data === YT.PlayerState.PAUSED) {
              this.state.set('playing', false);
              this.state.set('paused', true);
              this.state.emit('pause');
            } else if (event.data === YT.PlayerState.ENDED) {
              this.state.set('ended', true);
              this.state.emit('ended');
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
