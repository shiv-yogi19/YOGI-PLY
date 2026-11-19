/**
 * Yogi_PLY - HLS Streaming Adapter
 * Created By Shiv Yogi
 */

import { loadHls } from './StreamingLoader.js';

export class HlsAdapter {
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
      // 1. Try loading Hls.js first if MSE is supported (enables manual quality switching & audio track selection)
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
          const qualityOptions = [{ label: 'Auto', value: 'auto' }];

          levels.forEach((level, index) => {
            const height = level.height || Math.round((level.bitrate || 0) / 1000);
            qualityOptions.push({
              label: level.height ? `${level.height}p` : `${height}k`,
              value: index
            });
          });

          this.state.set('qualities', qualityOptions);

          const audioTracks = this.hls.audioTracks || [];
          if (audioTracks.length > 0) {
            const trackList = audioTracks.map((tr, idx) => ({
              id: String(idx),
              label: tr.name || tr.lang || `Track ${idx + 1}`
            }));
            this.state.set('audioTracks', trackList);
          }
        });

        this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          const level = this.hls.levels[data.level];
          if (level && level.height) {
            this.state.emit('qualitychange', `${level.height}p`);
          }
        });

        this.hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('[Yogi_PLY] HLS Network error, attempting recovery...');
                this.hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('[Yogi_PLY] HLS Media error, attempting recovery...');
                this.hls.recoverMediaError();
                break;
              default:
                console.error('[Yogi_PLY] Fatal HLS error:', data);
                this.state.set('error', 'HLS stream playback failed');
                this.destroy();
                break;
            }
          }
        });
        return;
      }
    } catch (err) {
      // If Hls.js fails to load or is not supported (e.g. iOS Safari without MSE)
      console.warn('[Yogi_PLY] Hls.js not available, falling back to native HLS check:', err);
    }

    // 2. Fallback to native HLS (e.g. iOS Safari)
    const canNative = this.video.canPlayType('application/vnd.apple.mpegurl');
    if (canNative) {
      this.isNative = true;
      this.video.src = sourceUrl;
      this.state.set('qualities', [{ label: 'Auto (Native)', value: 'auto' }]);
      return;
    }

    this.state.set('error', 'HLS streaming is not supported by your current browser.');
  }

  /**
   * Set quality level
   * @param {string|number} qualityValue 'auto' or index
   */
  setQuality(qualityValue) {
    if (!this.hls) return;
    if (qualityValue === 'auto') {
      this.hls.currentLevel = -1;
    } else {
      const idx = Number(qualityValue);
      if (!isNaN(idx) && idx >= 0 && idx < this.hls.levels.length) {
        this.hls.currentLevel = idx;
      }
    }
    this.state.set('quality', qualityValue);
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
      this.state.set('currentAudioTrack', trackIndex);
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
