/**
 * Yogi_PLY - Base External Platform Adapter Interface
 * Created By Shiv Yogi
 */

export class ExternalAdapter {
  constructor(container, options = {}, state = null) {
    this.container = container;
    this.options = options;
    this.state = state;
    this.isReady = false;
  }

  load(url) {
    throw new Error('load() must be implemented by adapter');
  }

  play() {}
  pause() {}
  togglePlay() {}
  seek(seconds) {}
  setVolume(volume) {}
  mute() {}
  unmute() {}
  getCurrentTime() { return 0; }
  getDuration() { return 0; }
  destroy() {}
}
