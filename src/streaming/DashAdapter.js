/**
 * Yogi_PLY - MPEG-DASH Streaming Adapter
 * Created By Shiv Yogi
 */

import { loadDash } from './StreamingLoader.js';

export class DashAdapter {
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
        const bitrates = this.player.getBitrateInfoListFor('video') || [];
        const qualityOptions = [{ label: 'Auto', value: 'auto' }];

        bitrates.forEach((b, idx) => {
          qualityOptions.push({
            label: b.height ? `${b.height}p` : `${Math.round(b.bitrate / 1000)}k`,
            value: idx
          });
        });

        this.state.set('qualities', qualityOptions);

        const audioTracks = this.player.getTracksFor('audio') || [];
        if (audioTracks.length > 0) {
          const trackList = audioTracks.map((tr, idx) => ({
            id: String(idx),
            label: tr.lang || `Track ${idx + 1}`
          }));
          this.state.set('audioTracks', trackList);
        }
      });

      this.player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
        console.error('[Yogi_PLY] DASH playback error:', e);
        this.state.set('error', 'MPEG-DASH stream playback failed');
      });
    } catch (err) {
      console.error('[Yogi_PLY] DASH Adapter initialization failed:', err);
      this.state.set('error', err.message);
    }
  }

  /**
   * Set quality level
   * @param {string|number} qualityValue
   */
  setQuality(qualityValue) {
    if (!this.player) return;
    if (qualityValue === 'auto') {
      this.player.updateSettings({
        streaming: { abr: { autoSwitchBitrate: { video: true } } }
      });
    } else {
      const idx = Number(qualityValue);
      this.player.updateSettings({
        streaming: { abr: { autoSwitchBitrate: { video: false } } }
      });
      this.player.setQualityFor('video', idx);
    }
    this.state.set('quality', qualityValue);
  }

  /**
   * Set audio track
   * @param {string|number} trackIndex
   */
  setAudioTrack(trackIndex) {
    if (!this.player) return;
    const tracks = this.player.getTracksFor('audio') || [];
    const idx = Number(trackIndex);
    if (tracks[idx]) {
      this.player.setCurrentTrack(tracks[idx]);
      this.state.set('currentAudioTrack', trackIndex);
    }
  }

  destroy() {
    if (this.player) {
      this.player.reset();
      this.player = null;
    }
  }
}
