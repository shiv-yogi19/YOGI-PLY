/**
 * Yogi_PLY - Liquid Glass Controls Architecture
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

import { createElement, ListenerTracker } from '../utils/dom.js';
import { icons } from '../icons/svgIcons.js';
import { ProgressBar } from './ProgressBar.js';
import { VolumeControl } from './VolumeControl.js';
import { TimeDisplay } from './TimeDisplay.js';

export class Controls {
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
    this.topBar = createElement('div', {
      className: 'yogi-ply-top-bar',
      role: 'toolbar',
      'aria-label': 'Top utilities and media information'
    });

    // Top Left: Back & Title & Badge
    const topLeft = createElement('div', { className: 'yogi-ply-top-left' });

    if (this.player.options.showBackButton) {
      const backBtn = createElement('button', {
        className: 'yogi-ply-btn yogi-ply-btn-back',
        'aria-label': 'Back',
        innerHTML: icons.back
      });
      this.tracker.add(backBtn, 'click', () => {
        this.player.emit('back');
      });
      topLeft.appendChild(backBtn);
    }

    const titleEl = createElement('div', {
      className: 'yogi-ply-title',
      textContent: this.player.options.title || 'Yogi_PLY'
    });
    topLeft.appendChild(titleEl);

    const badgeEl = createElement('span', {
      className: 'yogi-ply-meta-badge',
      textContent: 'Cinematic'
    });
    topLeft.appendChild(badgeEl);
    this.topBar.appendChild(topLeft);

    // Top Right: Quick Actions & Three-Dot Overflow
    const topRight = createElement('div', { className: 'yogi-ply-top-right' });

    // Subtitles toggle on top bar for rapid mobile access
    const topSubBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-top-subtitles',
      'aria-label': 'Toggle Subtitles',
      innerHTML: icons.subtitles
    });
    this.tracker.add(topSubBtn, 'click', () => {
      const cur = this.state.get('currentSubtitle');
      const tracks = this.state.get('subtitles') || [];
      if (tracks.length === 0) return;
      if (cur === 'off' || !cur) {
        this.player.setSubtitle(tracks[0].id);
      } else {
        this.player.setSubtitle('off');
      }
    });
    topRight.appendChild(topSubBtn);

    // Three-dot More Features Button
    this.topMoreBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-more yogi-ply-top-more',
      'aria-label': 'More Features',
      innerHTML: icons.more
    });
    this.tracker.add(this.topMoreBtn, 'click', () => {
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
    this.centerControls = createElement('div', {
      className: 'yogi-ply-center-controls',
      role: 'group',
      'aria-label': 'Playback controls'
    });

    // 10s Rewind
    this.centerRewindBtn = createElement('button', {
      className: 'yogi-ply-center-btn yogi-ply-center-rewind',
      'aria-label': 'Rewind 10 seconds',
      innerHTML: icons.backward10
    });
    this.tracker.add(this.centerRewindBtn, 'click', () => {
      this.player.seek(this.player.getCurrentTime() - 10);
      if (this.player.animations) {
        this.player.animations.trigger(this.centerRewindBtn, 'back-feedback');
      }
    });
    this.centerControls.appendChild(this.centerRewindBtn);

    // Big Play / Pause Button
    this.bigPlayBtn = createElement('button', {
      className: 'yogi-ply-center-btn yogi-ply-big-play',
      'aria-label': 'Play Video',
      innerHTML: icons.play
    });
    this.tracker.add(this.bigPlayBtn, 'click', () => this.player.togglePlay());
    this.centerControls.appendChild(this.bigPlayBtn);

    // 10s Forward
    this.centerForwardBtn = createElement('button', {
      className: 'yogi-ply-center-btn yogi-ply-center-forward',
      'aria-label': 'Forward 10 seconds',
      innerHTML: icons.forward10
    });
    this.tracker.add(this.centerForwardBtn, 'click', () => {
      this.player.seek(this.player.getCurrentTime() + 10);
      if (this.player.animations) {
        this.player.animations.trigger(this.centerForwardBtn, 'fwd-feedback');
      }
    });
    this.centerControls.appendChild(this.centerForwardBtn);

    this.container.appendChild(this.centerControls);
  }

  /* =========================================
     CENTER OVERLAYS (SPINNER, SKIPS, SCREENS)
     ========================================= */
  renderCenterOverlays() {
    // Buffering / Loading Spinner
    this.loadingSpinner = createElement('div', {
      className: 'yogi-ply-spinner',
      'aria-label': 'Loading Video',
      role: 'status',
      innerHTML: icons.loading
    });
    this.container.appendChild(this.loadingSpinner);

    // Skip Intro Button
    this.skipIntroBtn = createElement('button', {
      className: 'yogi-ply-skip-badge yogi-ply-skip-intro',
      innerHTML: `<span>Skip Intro</span> ${icons.chevronRight}`,
      style: { display: 'none' }
    });
    this.tracker.add(this.skipIntroBtn, 'click', () => {
      const skip = this.state.get('skipIntro');
      if (skip && skip.end) this.player.seek(skip.end);
    });
    this.container.appendChild(this.skipIntroBtn);

    // Skip Outro Button
    this.skipOutroBtn = createElement('button', {
      className: 'yogi-ply-skip-badge yogi-ply-skip-outro',
      innerHTML: `<span>Skip Outro</span> ${icons.chevronRight}`,
      style: { display: 'none' }
    });
    this.tracker.add(this.skipOutroBtn, 'click', () => {
      const skip = this.state.get('skipOutro');
      if (skip && skip.end) this.player.seek(skip.end);
    });
    this.container.appendChild(this.skipOutroBtn);

    // Error & Compatibility Overlay
    this.errorOverlay = createElement('div', {
      className: 'yogi-ply-error-screen',
      style: { display: 'none' },
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

    const retryBtn = this.errorOverlay.querySelector('.yogi-ply-btn-retry');
    this.tracker.add(retryBtn, 'click', () => {
      this.errorOverlay.style.display = 'none';
      this.state.set('error', null);
      if (this.player.options.source) {
        this.player.setSource(this.player.options.source);
      }
    });

    this.container.appendChild(this.errorOverlay);

    // Video Ended Screen
    this.endedOverlay = createElement('div', {
      className: 'yogi-ply-ended-screen',
      style: { display: 'none' },
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

    const replayBtn = this.endedOverlay.querySelector('.yogi-ply-btn-replay');
    this.tracker.add(replayBtn, 'click', () => {
      this.endedOverlay.style.display = 'none';
      this.player.seek(0);
      this.player.play().catch(() => {});
    });

    const nextBtn = this.endedOverlay.querySelector('.yogi-ply-btn-next-ended');
    this.tracker.add(nextBtn, 'click', () => {
      this.endedOverlay.style.display = 'none';
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
    this.dock = createElement('div', {
      className: 'yogi-ply-controls',
      role: 'toolbar',
      'aria-label': 'Video player controls dock'
    });

    // Row 1: Large Progress Bar
    this.progressBar = new ProgressBar(this.dock, this.player);

    // Row 2: Control buttons dock
    const barRow = createElement('div', { className: 'yogi-ply-controls-row' });

    // Left group
    const leftGroup = createElement('div', { className: 'yogi-ply-controls-left' });

    this.playBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-play',
      'aria-label': 'Play',
      innerHTML: icons.play
    });
    this.tracker.add(this.playBtn, 'click', () => this.player.togglePlay());
    leftGroup.appendChild(this.playBtn);

    // Prev button (if playlist has items)
    this.prevBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-prev',
      'aria-label': 'Previous Video',
      innerHTML: icons.prev,
      style: { display: 'none' }
    });
    this.tracker.add(this.prevBtn, 'click', () => {
      if (this.player.playlist) this.player.playlist.prev();
    });
    leftGroup.appendChild(this.prevBtn);

    // Next button (if playlist has items)
    this.nextBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-next',
      'aria-label': 'Next Video',
      innerHTML: icons.next,
      style: { display: 'none' }
    });
    this.tracker.add(this.nextBtn, 'click', () => {
      if (this.player.playlist) this.player.playlist.next();
    });
    leftGroup.appendChild(this.nextBtn);

    // Backward 10s
    const back10Btn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-back10',
      'aria-label': 'Rewind 10 Seconds',
      innerHTML: icons.backward10
    });
    this.tracker.add(back10Btn, 'click', () => this.player.seek(this.player.getCurrentTime() - 10));
    leftGroup.appendChild(back10Btn);

    // Forward 10s
    const fwd10Btn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-fwd10',
      'aria-label': 'Forward 10 Seconds',
      innerHTML: icons.forward10
    });
    this.tracker.add(fwd10Btn, 'click', () => this.player.seek(this.player.getCurrentTime() + 10));
    leftGroup.appendChild(fwd10Btn);

    // Volume group
    this.volumeControl = new VolumeControl(leftGroup, this.player);

    // Time display
    this.timeDisplay = new TimeDisplay(leftGroup, this.player);

    // Right group
    const rightGroup = createElement('div', { className: 'yogi-ply-controls-right' });

    // Loop button
    this.loopBtn = createElement('button', {
      className: `yogi-ply-btn yogi-ply-btn-loop ${this.state.get('loop') ? 'yogi-ply-btn-active' : ''}`,
      'aria-label': 'Toggle Loop',
      innerHTML: icons.loop
    });
    this.tracker.add(this.loopBtn, 'click', () => this.player.toggleLoop());
    rightGroup.appendChild(this.loopBtn);

    // Playlist button
    this.playlistBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-playlist',
      'aria-label': 'Toggle Playlist',
      innerHTML: icons.playlist,
      style: { display: 'none' }
    });
    this.tracker.add(this.playlistBtn, 'click', () => {
      if (this.player.playlist) this.player.playlist.toggle();
    });
    rightGroup.appendChild(this.playlistBtn);

    // Subtitles toggle button
    this.subtitlesBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-subtitles',
      'aria-label': 'Toggle Subtitles',
      innerHTML: icons.subtitles
    });
    this.tracker.add(this.subtitlesBtn, 'click', () => {
      const cur = this.state.get('currentSubtitle');
      const tracks = this.state.get('subtitles') || [];
      if (tracks.length === 0) return;
      if (cur === 'off' || !cur) {
        this.player.setSubtitle(tracks[0].id);
      } else {
        this.player.setSubtitle('off');
      }
    });
    rightGroup.appendChild(this.subtitlesBtn);

    // Screenshot button
    const screenshotBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-screenshot',
      'aria-label': 'Capture Screenshot',
      innerHTML: icons.screenshot
    });
    this.tracker.add(screenshotBtn, 'click', () => this.player.captureScreenshot());
    rightGroup.appendChild(screenshotBtn);

    // Picture-in-Picture
    if (typeof document !== 'undefined' && 'pictureInPictureEnabled' in document) {
      const pipBtn = createElement('button', {
        className: 'yogi-ply-btn yogi-ply-btn-pip',
        'aria-label': 'Picture in Picture',
        innerHTML: icons.pip
      });
      this.tracker.add(pipBtn, 'click', () => this.player.togglePip());
      rightGroup.appendChild(pipBtn);
    }

    // Theatre Mode
    const theatreBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-theatre',
      'aria-label': 'Theatre Mode',
      innerHTML: icons.theatre
    });
    this.tracker.add(theatreBtn, 'click', () => this.player.toggleTheatre());
    rightGroup.appendChild(theatreBtn);

    // Three-dot More Features Button (Dock)
    this.dockMoreBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-more yogi-ply-btn-settings',
      'aria-label': 'More Features and Settings',
      innerHTML: icons.more
    });
    this.tracker.add(this.dockMoreBtn, 'click', () => {
      if (this.player.settingsMenu) this.player.settingsMenu.toggle();
    });
    rightGroup.appendChild(this.dockMoreBtn);

    // Fullscreen
    this.fullscreenBtn = createElement('button', {
      className: 'yogi-ply-btn yogi-ply-btn-fullscreen',
      'aria-label': 'Fullscreen',
      innerHTML: icons.fullscreen
    });
    this.tracker.add(this.fullscreenBtn, 'click', () => this.player.toggleFullscreen());
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
    this.tracker.add(this.dock, 'mouseenter', () => {
      this.isMouseOverControls = true;
      this.showControls();
    });
    this.tracker.add(this.dock, 'mouseleave', () => {
      this.isMouseOverControls = false;
      this.scheduleHideControls();
    });

    this.tracker.add(this.container, 'mousemove', () => {
      this.showControls();
      this.scheduleHideControls();
    });

    this.tracker.add(this.container, 'touchstart', () => {
      this.showControls();
      this.scheduleHideControls();
    }, { passive: true });
  }

  bindState() {
    this.state.on('change:playing', (isPlaying) => {
      if (isPlaying) {
        this.playBtn.innerHTML = icons.pause;
        this.playBtn.setAttribute('aria-label', 'Pause');
        this.bigPlayBtn.innerHTML = icons.pause;
        this.bigPlayBtn.setAttribute('aria-label', 'Pause');
        this.endedOverlay.style.display = 'none';
        this.scheduleHideControls();
      } else {
        this.playBtn.innerHTML = icons.play;
        this.playBtn.setAttribute('aria-label', 'Play');
        this.bigPlayBtn.innerHTML = icons.play;
        this.bigPlayBtn.setAttribute('aria-label', 'Play');
        this.showControls();
      }
    });

    this.state.on('change:loading', (isLoading) => {
      if (isLoading) {
        this.loadingSpinner.classList.add('yogi-ply-spinner-visible');
      } else {
        this.loadingSpinner.classList.remove('yogi-ply-spinner-visible');
      }
    });

    this.state.on('change:fullscreen', (isFs) => {
      if (isFs) {
        this.fullscreenBtn.innerHTML = icons.exitFullscreen;
        this.fullscreenBtn.setAttribute('aria-label', 'Exit Fullscreen');
      } else {
        this.fullscreenBtn.innerHTML = icons.fullscreen;
        this.fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
      }
    });

    this.state.on('change:currentSubtitle', (trackId) => {
      if (trackId && trackId !== 'off') {
        this.subtitlesBtn.classList.add('yogi-ply-btn-active');
      } else {
        this.subtitlesBtn.classList.remove('yogi-ply-btn-active');
      }
    });

    this.state.on('change:loop', (isLoop) => {
      if (isLoop) {
        this.loopBtn.classList.add('yogi-ply-btn-active');
      } else {
        this.loopBtn.classList.remove('yogi-ply-btn-active');
      }
    });

    this.state.on('change:error', (err) => {
      if (err) {
        this.showControls();
        this.centerControls.style.display = 'none';
        this.loadingSpinner.classList.remove('yogi-ply-spinner-visible');
        this.errorOverlay.style.display = 'flex';
        this.errorOverlay.querySelector('.yogi-ply-error-msg').textContent = err;

        const advice = this.errorOverlay.querySelector('.yogi-ply-error-advice');
        const compat = this.state.get('compatibilityNotice');
        if (compat && compat.recommendation) {
          advice.textContent = compat.recommendation;
          advice.style.display = 'block';
        } else {
          advice.style.display = 'none';
        }
      } else {
        this.errorOverlay.style.display = 'none';
        this.centerControls.style.display = 'flex';
      }
    });

    this.state.on('change:ended', (ended) => {
      if (ended) {
        this.showControls();
        this.endedOverlay.style.display = 'flex';
        const nextEndedBtn = this.endedOverlay.querySelector('.yogi-ply-btn-next-ended');
        if (this.player.playlist && this.player.playlist.hasNext()) {
          nextEndedBtn.style.display = 'inline-flex';
        } else {
          nextEndedBtn.style.display = 'none';
        }
      }
    });

    this.state.on('timeupdate', () => {
      const cur = this.state.get('currentTime') || 0;
      const skipIntro = this.state.get('skipIntro');
      const skipOutro = this.state.get('skipOutro');

      if (skipIntro && cur >= skipIntro.start && cur <= skipIntro.end) {
        this.skipIntroBtn.style.display = 'inline-flex';
      } else {
        this.skipIntroBtn.style.display = 'none';
      }

      if (skipOutro && cur >= skipOutro.start && cur <= skipOutro.end) {
        this.skipOutroBtn.style.display = 'inline-flex';
      } else {
        this.skipOutroBtn.style.display = 'none';
      }
    });
  }

  showControls() {
    this.container.classList.remove('yogi-ply-controls-hidden');
    this.state.set('controlsVisible', true);
  }

  hideControls() {
    if (this.isMouseOverControls) return;
    if (this.player.settingsMenu && this.player.settingsMenu.isOpen) return;
    if (this.state.get('paused') || this.state.get('ended') || this.state.get('error')) return;

    this.container.classList.add('yogi-ply-controls-hidden');
    this.state.set('controlsVisible', false);
  }

  scheduleHideControls() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (this.state.get('playing')) {
      this.hideTimeout = setTimeout(() => {
        this.hideControls();
      }, 3000);
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
