/**
 * Yogi_PLY - Mobile Gesture Manager
 * Created By Shiv Yogi
 */

import { ListenerTracker } from '../utils/dom.js';
import { TouchFeedback } from './TouchFeedback.js';

export class GestureManager {
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
    this.dragType = null; // 'volume' | 'brightness'
    this.brightness = 1; // 0.3 to 1.7
    this.startVolume = 1;
    this.startBrightness = 1;

    this.init();
  }

  init() {
    this.tracker.add(this.container, 'touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.tracker.add(this.container, 'touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.tracker.add(this.container, 'touchend', (e) => this.handleTouchEnd(e));
  }

  handleTouchStart(e) {
    if (
      e.target.closest('.yogi-ply-controls') ||
      e.target.closest('.yogi-ply-settings-panel') ||
      e.target.closest('.yogi-ply-btn') ||
      e.target.closest('.yogi-ply-playlist-drawer')
    ) {
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
    if (
      e.target.closest('.yogi-ply-controls') ||
      e.target.closest('.yogi-ply-settings-panel') ||
      e.target.closest('.yogi-ply-playlist-drawer')
    ) {
      return;
    }

    // Prevent accidental page scroll interception when inline:
    // If swipe gestures are restricted to fullscreen and player is not fullscreen, do not intercept scroll
    const swipeMode = this.player.options.enableSwipeGestures;
    const isFullscreen = this.player.isFullscreen();
    if (swipeMode === false || (swipeMode === 'fullscreen-only' && !isFullscreen)) {
      return;
    }

    const touch = e.touches[0];
    const deltaY = this.touchStartY - touch.clientY;
    const deltaX = Math.abs(touch.clientX - this.touchStartX);

    // Require distinct threshold of 24px vertical before triggering swipe gesture
    if (!this.isDragging && Math.abs(deltaY) > 24 && Math.abs(deltaY) > deltaX * 1.5) {
      this.isDragging = true;
      const rect = this.container.getBoundingClientRect();
      const relativeX = (this.touchStartX - rect.left) / rect.width;

      // Left half = Brightness, Right half = Volume
      this.dragType = relativeX < 0.5 ? 'brightness' : 'volume';
    }

    if (this.isDragging) {
      e.preventDefault(); // Prevent page scrolling during active player gesture

      const rect = this.container.getBoundingClientRect();
      const sensitivity = 1 / (rect.height * 0.7);
      const change = deltaY * sensitivity;

      if (this.dragType === 'volume') {
        const newVol = Math.max(0, Math.min(1, this.startVolume + change));
        this.player.setVolume(newVol);
        this.feedback.showHud('volume', newVol * 100);
      } else if (this.dragType === 'brightness') {
        const newBright = Math.max(0.3, Math.min(1.7, this.startBrightness + change));
        this.brightness = newBright;
        if (this.video) {
          this.video.style.filter = `brightness(${newBright.toFixed(2)})`;
        }
        const pct = ((newBright - 0.3) / 1.4) * 100;
        this.feedback.showHud('brightness', pct);
      }
    }
  }

  handleTouchEnd(e) {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragType = null;
      return;
    }

    if (
      e.target.closest('.yogi-ply-controls') ||
      e.target.closest('.yogi-ply-settings-panel') ||
      e.target.closest('.yogi-ply-btn') ||
      e.target.closest('.yogi-ply-playlist-drawer')
    ) {
      return;
    }

    const now = Date.now();
    const touch = e.changedTouches ? e.changedTouches[0] : null;
    if (!touch) return;

    const rect = this.container.getBoundingClientRect();
    const tapX = (touch.clientX - rect.left) / rect.width;
    const timeDiff = now - this.lastTapTime;

    // Double tap detected (< 320ms and in similar horizontal region)
    if (timeDiff < 320 && Math.abs(tapX - this.lastTapX) < 0.3) {
      if (this.tapTimeout) {
        clearTimeout(this.tapTimeout);
        this.tapTimeout = null;
      }

      if (tapX < 0.38) {
        // Double tap left: Seek backward 10s
        this.player.seek(this.player.getCurrentTime() - 10);
        this.feedback.showDoubleTapSeek('left', 10);
      } else if (tapX > 0.62) {
        // Double tap right: Seek forward 10s
        this.player.seek(this.player.getCurrentTime() + 10);
        this.feedback.showDoubleTapSeek('right', 10);
      } else {
        // Center double tap: toggle play/pause
        this.player.togglePlay();
      }

      this.lastTapTime = 0;
    } else {
      // Single tap: toggle controls after small delay to verify not double tap
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
