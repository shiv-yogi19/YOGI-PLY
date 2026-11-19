/**
 * Yogi_PLY - Accessibility and Keyboard Navigation Manager
 * Created By Shiv Yogi
 */

import { ListenerTracker } from '../utils/dom.js';

export class KeyboardManager {
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
    this.tracker.add(window, 'keydown', (e) => this.handleKeyDown(e));
  }

  /**
   * Check if active element is an input, textarea, or content-editable
   * @returns {boolean}
   */
  isTyping(target) {
    if (!target) return false;
    const tag = target.tagName ? target.tagName.toLowerCase() : '';
    return (
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      target.isContentEditable ||
      (target.getAttribute && target.getAttribute('role') === 'textbox')
    );
  }

  handleKeyDown(e) {
    if (this.isTyping(e.target)) return;

    // Only respond to key events if player is focused, hovered, or in fullscreen
    const isPlayerActive =
      this.container.contains(document.activeElement) ||
      this.container.matches(':hover') ||
      this.player.state.get('fullscreen');

    if (!isPlayerActive) return;

    const key = e.key;

    switch (key) {
      case ' ':
      case 'k':
      case 'K':
        e.preventDefault();
        this.player.togglePlay();
        break;

      case 'ArrowLeft':
      case 'j':
      case 'J':
        e.preventDefault();
        this.player.seek(this.player.getCurrentTime() - 10);
        break;

      case 'ArrowRight':
      case 'l':
      case 'L':
        e.preventDefault();
        this.player.seek(this.player.getCurrentTime() + 10);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.player.setVolume(Math.min(1, this.player.getVolume() + 0.05));
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.player.setVolume(Math.max(0, this.player.getVolume() - 0.05));
        break;

      case 'm':
      case 'M':
        e.preventDefault();
        if (this.player.state.get('muted')) {
          this.player.unmute();
        } else {
          this.player.mute();
        }
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        this.player.toggleFullscreen();
        break;

      case 't':
      case 'T':
        e.preventDefault();
        this.player.toggleTheatre();
        break;

      case 'p':
      case 'P':
        e.preventDefault();
        this.player.togglePip();
        break;

      case 'c':
      case 'C':
        e.preventDefault();
        this.toggleSubtitles();
        break;

      case 'Escape':
        if (this.player.settingsMenu && this.player.settingsMenu.isOpen) {
          e.preventDefault();
          this.player.settingsMenu.close();
        } else if (this.player.state.get('fullscreen')) {
          e.preventDefault();
          this.player.exitFullscreen();
        }
        break;

      default:
        break;
    }
  }

  toggleSubtitles() {
    const current = this.player.state.get('currentSubtitle');
    const tracks = this.player.state.get('subtitles') || [];
    if (tracks.length === 0) return;

    if (current === 'off') {
      this.player.setSubtitle(tracks[0].id);
    } else {
      this.player.setSubtitle('off');
    }
  }

  destroy() {
    this.tracker.destroy();
  }
}
