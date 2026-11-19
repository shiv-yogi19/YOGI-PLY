/**
 * Yogi_PLY - Three-Dot Overflow & Liquid Glass Settings Menu
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

import { createElement, ListenerTracker } from '../utils/dom.js';
import { icons } from '../icons/svgIcons.js';
import { formatTime } from '../utils/time.js';

export class SettingsMenu {
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
    this.currentView = 'main';
    this.panel = null;

    this.init();
  }

  init() {
    this.panel = createElement('div', {
      className: 'yogi-ply-settings-panel',
      role: 'dialog',
      'aria-label': 'Player More Features and Settings'
    });

    this.container.appendChild(this.panel);

    // Close on click outside
    this.tracker.add(document, 'click', (e) => {
      if (
        this.isOpen &&
        !this.panel.contains(e.target) &&
        !e.target.closest('.yogi-ply-btn-settings') &&
        !e.target.closest('.yogi-ply-btn-more')
      ) {
        this.close();
      }
    });

    // Close on Escape
    this.tracker.add(document, 'keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.close();
      }
    });

    // Re-render when pertinent states change
    const stateTriggers = [
      'playbackRate', 'quality', 'qualities', 'currentSubtitle', 'subtitles',
      'subtitleSize', 'subtitlePosition', 'subtitleDelay', 'audioTracks',
      'currentAudioTrack', 'audioDelay', 'theme', 'watermark', 'loop',
      'aspectRatio', 'sleepTimer', 'sleepTimerRemaining', 'repeatA', 'repeatB'
    ];

    stateTriggers.forEach((key) => {
      this.state.on(`change:${key}`, () => {
        if (this.isOpen) this.renderCurrentView();
      });
    });
  }

  isFeatureEnabled(featureKey) {
    const feats = this.player.options.features;
    if (!feats) return true; // Default all enabled if not restricted
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
    this.currentView = 'main';
    this.renderCurrentView();
    this.panel.classList.remove('yogi-anim-menu-collapse');
    this.panel.classList.add('yogi-ply-settings-open', 'yogi-anim-menu-expand');

    // Trigger button animation
    const moreBtns = this.container.querySelectorAll('.yogi-ply-btn-more');
    moreBtns.forEach((btn) => btn.classList.add('yogi-anim-more-tap'));
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.panel.classList.remove('yogi-anim-menu-expand');
    this.panel.classList.add('yogi-anim-menu-collapse');

    const moreBtns = this.container.querySelectorAll('.yogi-ply-btn-more');
    moreBtns.forEach((btn) => {
      btn.classList.remove('yogi-anim-more-tap');
      btn.classList.add('yogi-anim-more-reset');
      setTimeout(() => btn.classList.remove('yogi-anim-more-reset'), 300);
    });

    setTimeout(() => {
      if (!this.isOpen) {
        this.panel.classList.remove('yogi-ply-settings-open', 'yogi-anim-menu-collapse');
      }
    }, 240);
  }

  navigateTo(view) {
    this.currentView = view;
    this.renderCurrentView();
  }

  renderCurrentView() {
    if (!this.panel) return;
    this.panel.innerHTML = '';

    switch (this.currentView) {
      case 'speed':
        this.renderSpeedMenu();
        break;
      case 'quality':
        this.renderQualityMenu();
        break;
      case 'subtitles':
        this.renderSubtitleMenu();
        break;
      case 'chapters':
        this.renderChaptersMenu();
        break;
      case 'audio':
        this.renderAudioMenu();
        break;
      case 'aspectRatio':
        this.renderAspectRatioMenu();
        break;
      case 'sleepTimer':
        this.renderSleepTimerMenu();
        break;
      case 'abRepeat':
        this.renderAbRepeatMenu();
        break;
      case 'frameStep':
        this.renderFrameStepMenu();
        break;
      case 'subtitleDelay':
        this.renderSubtitleDelayMenu();
        break;
      case 'audioDelay':
        this.renderAudioDelayMenu();
        break;
      case 'watermark':
        this.renderWatermarkMenu();
        break;
      case 'themes':
        this.renderThemesMenu();
        break;
      case 'info':
        this.renderInfoMenu();
        break;
      case 'main':
      default:
        this.renderMainMenu();
        break;
    }
  }

  createHeader(title, onBack = () => this.navigateTo('main')) {
    const header = createElement('div', {
      className: 'yogi-ply-menu-header',
      innerHTML: `
        <button class="yogi-ply-menu-back" aria-label="Back to main menu">
          ${icons.chevronLeft}
        </button>
        <span class="yogi-ply-menu-title">${title}</span>
      `
    });

    header.querySelector('.yogi-ply-menu-back').addEventListener('click', (e) => {
      e.stopPropagation();
      onBack();
    });

    return header;
  }

  createMenuRow(iconSvg, label, valueText, onClick) {
    const row = createElement('button', {
      className: 'yogi-ply-menu-row',
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

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });

    return row;
  }

  /* =========================================
     MAIN THREE-DOT MENU LIST
     ========================================= */
  renderMainMenu() {
    const list = createElement('div', { className: 'yogi-ply-menu-list' });

    // 1. Playback Speed
    if (this.isFeatureEnabled('playbackSpeed')) {
      const speed = this.state.get('playbackRate') || 1;
      list.appendChild(
        this.createMenuRow(icons.speed, 'Playback Speed', speed === 1 ? 'Normal' : `${speed}x`, () =>
          this.navigateTo('speed')
        )
      );
    }

    // 2. Video Quality
    if (this.isFeatureEnabled('quality')) {
      const qualities = this.state.get('qualities') || [];
      const currentQ = this.state.get('quality');
      const qObj = qualities.find((q) => q.value === currentQ);
      const qLabel = qObj ? qObj.label : 'Auto';
      list.appendChild(
        this.createMenuRow(icons.quality, 'Quality', qLabel, () => this.navigateTo('quality'))
      );
    }

    // 3. Subtitles
    if (this.isFeatureEnabled('subtitles')) {
      const tracks = this.state.get('subtitles') || [];
      const currentSub = this.state.get('currentSubtitle');
      const activeTrack = tracks.find((t) => t.id === currentSub);
      const subLabel = currentSub === 'off' || !currentSub ? 'Off' : activeTrack ? activeTrack.label : 'On';
      list.appendChild(
        this.createMenuRow(icons.subtitles, 'Subtitles', subLabel, () => this.navigateTo('subtitles'))
      );
    }

    // 4. Chapters
    if (this.isFeatureEnabled('chapters')) {
      const chapters = this.state.get('chapters') || [];
      if (chapters.length > 0) {
        const curChap = this.player.chapters ? this.player.chapters.getCurrentChapter() : null;
        const chapLabel = curChap ? curChap.chapter.title : `${chapters.length} Chapters`;
        list.appendChild(
          this.createMenuRow(icons.playlist, 'Chapters', chapLabel, () => this.navigateTo('chapters'))
        );
      }
    }

    // 5. Audio Track
    if (this.isFeatureEnabled('audioTrack')) {
      const audioTracks = this.state.get('audioTracks') || [];
      if (audioTracks.length > 0) {
        const curAudio = this.state.get('currentAudioTrack');
        const activeAudio = audioTracks.find((a) => a.id === curAudio) || audioTracks[0];
        list.appendChild(
          this.createMenuRow(icons.audio, 'Audio Track', activeAudio ? activeAudio.label : 'Default', () =>
            this.navigateTo('audio')
          )
        );
      }
    }

    // 6. Aspect Ratio
    if (this.isFeatureEnabled('aspectRatio')) {
      const curRatio = this.state.get('aspectRatio') || '16:9';
      list.appendChild(
        this.createMenuRow(icons.aspectRatio, 'Aspect Ratio', curRatio, () =>
          this.navigateTo('aspectRatio')
        )
      );
    }

    // 7. Sleep Timer
    if (this.isFeatureEnabled('sleepTimer')) {
      const sleepRemaining = this.state.get('sleepTimerRemaining');
      const sleepVal = sleepRemaining || (this.state.get('sleepTimer') ? `${this.state.get('sleepTimer')}m` : 'Off');
      list.appendChild(
        this.createMenuRow(icons.timer, 'Sleep Timer', sleepVal, () => this.navigateTo('sleepTimer'))
      );
    }

    // 8. A-B Repeat
    if (this.isFeatureEnabled('abRepeat')) {
      const repA = this.state.get('repeatA');
      const repB = this.state.get('repeatB');
      const repLabel = repA !== null && repB !== null ? `${formatTime(repA)}-${formatTime(repB)}` : repA !== null ? 'A set' : 'Off';
      list.appendChild(
        this.createMenuRow(icons.abRepeat, 'A-B Repeat', repLabel, () => this.navigateTo('abRepeat'))
      );
    }

    // 9. Frame-by-Frame Navigation
    if (this.isFeatureEnabled('frameStep')) {
      list.appendChild(
        this.createMenuRow(icons.stepForward, 'Frame Step', '1/30s', () => this.navigateTo('frameStep'))
      );
    }

    // 10. Subtitle Delay
    if (this.isFeatureEnabled('subtitleDelay')) {
      const subDelay = this.state.get('subtitleDelay') || 0;
      const subDelayStr = subDelay === 0 ? '0s' : `${subDelay > 0 ? '+' : ''}${subDelay}s`;
      list.appendChild(
        this.createMenuRow(icons.subtitles, 'Subtitle Delay', subDelayStr, () =>
          this.navigateTo('subtitleDelay')
        )
      );
    }

    // 11. Audio Delay
    if (this.isFeatureEnabled('audioDelay')) {
      const audioDelay = this.state.get('audioDelay') || 0;
      const audioDelayStr = audioDelay === 0 ? '0s' : `${audioDelay > 0 ? '+' : ''}${audioDelay}s`;
      list.appendChild(
        this.createMenuRow(icons.audio, 'Audio Delay', audioDelayStr, () =>
          this.navigateTo('audioDelay')
        )
      );
    }

    // 12. Repeat Video (Loop)
    if (this.isFeatureEnabled('loop')) {
      const isLoop = Boolean(this.state.get('loop'));
      const loopRow = createElement('button', {
        className: `yogi-ply-menu-option ${isLoop ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <div class="yogi-ply-menu-row-left">
            <span class="yogi-ply-menu-icon">${icons.loop}</span>
            <span class="yogi-ply-menu-label">Repeat Video</span>
          </div>
          <span class="yogi-ply-toggle-switch ${isLoop ? 'yogi-ply-switch-on' : ''}"></span>
        `
      });
      loopRow.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.toggleLoop();
      });
      list.appendChild(loopRow);
    }

    // 13. Screenshot
    if (this.isFeatureEnabled('screenshot')) {
      const shotRow = createElement('button', {
        className: 'yogi-ply-menu-row',
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
      shotRow.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.captureScreenshot();
        this.close();
      });
      list.appendChild(shotRow);
    }

    // 14. Watermark Visual Settings (NO DISABLE/REMOVE OPTION)
    const wmItem = this.createMenuRow(
      icons.watermark,
      'Watermark Style',
      'Created By Shiv Yogi',
      () => this.navigateTo('watermark')
    );
    list.appendChild(wmItem);

    // 15. Theme
    const theme = this.state.get('theme') || 'liquid-glass';
    list.appendChild(
      this.createMenuRow(icons.palette, 'Theme', theme.replace('-', ' '), () =>
        this.navigateTo('themes')
      )
    );

    // 16. Playback Info / Diagnostics
    if (this.isFeatureEnabled('diagnostics')) {
      list.appendChild(
        this.createMenuRow(icons.info, 'Playback Stats', 'Diagnostics', () =>
          this.navigateTo('info')
        )
      );
    }

    this.panel.appendChild(list);
  }

  /* =========================================
     SUB-MENUS
     ========================================= */

  renderSpeedMenu() {
    this.panel.appendChild(this.createHeader('Playback Speed'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const current = this.state.get('playbackRate') || 1;

    speeds.forEach((rate) => {
      const isSelected = rate === current;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${rate === 1 ? '1x (Normal)' : `${rate}x`}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.setPlaybackRate(rate);
        this.navigateTo('main');
      });

      list.appendChild(btn);
    });

    this.panel.appendChild(list);
  }

  renderQualityMenu() {
    this.panel.appendChild(this.createHeader('Video Quality'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const qualities = this.state.get('qualities') || [{ label: 'Auto (Original)', value: 'auto' }];
    const current = this.state.get('quality');

    qualities.forEach((q) => {
      const isSelected = q.value === current;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${q.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.setQuality(q.value);
        this.navigateTo('main');
      });

      list.appendChild(btn);
    });

    this.panel.appendChild(list);
  }

  renderSubtitleMenu() {
    this.panel.appendChild(this.createHeader('Subtitles'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const tracks = this.state.get('subtitles') || [];
    const current = this.state.get('currentSubtitle');

    const isOff = current === 'off' || !current;
    const offBtn = createElement('button', {
      className: `yogi-ply-menu-option ${isOff ? 'yogi-ply-option-active' : ''}`,
      innerHTML: `
        <span>Off</span>
        ${isOff ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
      `
    });
    offBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.player.setSubtitle('off');
      this.navigateTo('main');
    });
    list.appendChild(offBtn);

    tracks.forEach((track) => {
      const isSelected = track.id === current;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${track.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.setSubtitle(track.id);
        this.navigateTo('main');
      });

      list.appendChild(btn);
    });

    if (tracks.length > 0) {
      const sizeHeader = createElement('div', {
        className: 'yogi-ply-menu-sublabel',
        textContent: 'Text Size'
      });
      list.appendChild(sizeHeader);

      const curSize = this.state.get('subtitleSize') || 'medium';
      ['small', 'medium', 'large'].forEach((size) => {
        const isSizeActive = curSize === size;
        const sizeBtn = createElement('button', {
          className: `yogi-ply-menu-option ${isSizeActive ? 'yogi-ply-option-active' : ''}`,
          innerHTML: `
            <span>${size.charAt(0).toUpperCase() + size.slice(1)}</span>
            ${isSizeActive ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
          `
        });
        sizeBtn.addEventListener('click', (e) => {
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
    this.panel.appendChild(this.createHeader('Chapters'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const chapters = this.state.get('chapters') || [];
    const curTime = this.player.getCurrentTime();

    chapters.forEach((chap, idx) => {
      const isActive = curTime >= chap.start && curTime <= chap.end;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isActive ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <div style="display:flex; flex-direction:column; align-items:flex-start; text-align:left;">
            <span style="font-weight:600;">${chap.title}</span>
            <span style="font-size:11px; opacity:0.7;">${formatTime(chap.start)} - ${formatTime(chap.end)}</span>
          </div>
          ${isActive ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.seekToChapter(idx);
        this.close();
      });

      list.appendChild(btn);
    });

    this.panel.appendChild(list);
  }

  renderAudioMenu() {
    this.panel.appendChild(this.createHeader('Audio Tracks'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const tracks = this.state.get('audioTracks') || [];
    const current = this.state.get('currentAudioTrack');

    tracks.forEach((track) => {
      const isSelected = track.id === current;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${track.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.player.hlsAdapter) {
          this.player.hlsAdapter.setAudioTrack(track.id);
        } else if (this.player.dashAdapter) {
          this.player.dashAdapter.setAudioTrack(track.id);
        }
        this.navigateTo('main');
      });

      list.appendChild(btn);
    });

    this.panel.appendChild(list);
  }

  renderAspectRatioMenu() {
    this.panel.appendChild(this.createHeader('Video Aspect Ratio'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const ratios = ['16:9', '4:3', '1:1', '21:9', 'Original', 'Fill (Cover)', 'Stretch'];
    const current = this.state.get('aspectRatio') || '16:9';

    ratios.forEach((ratio) => {
      const isSelected = ratio === current;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${ratio}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.setAspectRatio(ratio);
        this.navigateTo('main');
      });

      list.appendChild(btn);
    });

    this.panel.appendChild(list);
  }

  renderSleepTimerMenu() {
    this.panel.appendChild(this.createHeader('Sleep Timer'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const options = [
      { label: 'Off', val: 'off' },
      { label: '15 Minutes', val: 15 },
      { label: '30 Minutes', val: 30 },
      { label: '45 Minutes', val: 45 },
      { label: '60 Minutes (1 Hour)', val: 60 },
      { label: 'End of Current Video', val: 'end' }
    ];
    const current = this.state.get('sleepTimer') || 'off';

    options.forEach((opt) => {
      const isSelected = opt.val === current;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${opt.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.setSleepTimer(opt.val);
        this.navigateTo('main');
      });

      list.appendChild(btn);
    });

    this.panel.appendChild(list);
  }

  renderAbRepeatMenu() {
    this.panel.appendChild(this.createHeader('A-B Repeat Loop'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const curTime = this.player.getCurrentTime();
    const repA = this.state.get('repeatA');
    const repB = this.state.get('repeatB');

    // Button to set Point A
    const setABtn = createElement('button', {
      className: 'yogi-ply-menu-option',
      innerHTML: `<span>Set Point A (Current: ${formatTime(curTime)})</span>`
    });
    setABtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.player.setRepeatPointA(curTime);
      this.renderAbRepeatMenu();
    });
    list.appendChild(setABtn);

    // Button to set Point B
    const setBBtn = createElement('button', {
      className: 'yogi-ply-menu-option',
      innerHTML: `<span>Set Point B (Current: ${formatTime(curTime)})</span>`
    });
    setBBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.player.setRepeatPointB(curTime);
      this.renderAbRepeatMenu();
    });
    list.appendChild(setBBtn);

    // Status display
    const statusText = repA !== null && repB !== null
      ? `Looping from ${formatTime(repA)} to ${formatTime(repB)}`
      : repA !== null
      ? `Point A set to ${formatTime(repA)} (Waiting for Point B)`
      : 'A-B Repeat is inactive';

    const statusEl = createElement('div', {
      className: 'yogi-ply-menu-sublabel',
      textContent: statusText
    });
    list.appendChild(statusEl);

    if (repA !== null || repB !== null) {
      const clearBtn = createElement('button', {
        className: 'yogi-ply-menu-option',
        innerHTML: '<span style="color:#f87171;">Clear Repeat Loop</span>'
      });
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.clearRepeat();
        this.renderAbRepeatMenu();
      });
      list.appendChild(clearBtn);
    }

    this.panel.appendChild(list);
  }

  renderFrameStepMenu() {
    this.panel.appendChild(this.createHeader('Frame-by-Frame Navigation'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });

    const stepBackBtn = createElement('button', {
      className: 'yogi-ply-menu-option',
      innerHTML: `
        <div class="yogi-ply-menu-row-left">
          <span class="yogi-ply-menu-icon">${icons.stepBackward}</span>
          <span>Step Back 1 Frame (-0.033s)</span>
        </div>
      `
    });
    stepBackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.player.stepFrame(-1);
    });
    list.appendChild(stepBackBtn);

    const stepFwdBtn = createElement('button', {
      className: 'yogi-ply-menu-option',
      innerHTML: `
        <div class="yogi-ply-menu-row-left">
          <span class="yogi-ply-menu-icon">${icons.stepForward}</span>
          <span>Step Forward 1 Frame (+0.033s)</span>
        </div>
      `
    });
    stepFwdBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.player.stepFrame(1);
    });
    list.appendChild(stepFwdBtn);

    this.panel.appendChild(list);
  }

  renderSubtitleDelayMenu() {
    this.panel.appendChild(this.createHeader('Subtitle Delay'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const delays = [-2.0, -1.0, -0.5, 0, 0.5, 1.0, 2.0];
    const current = this.state.get('subtitleDelay') || 0;

    delays.forEach((sec) => {
      const isSelected = sec === current;
      const label = sec === 0 ? '0.0s (Normal)' : `${sec > 0 ? '+' : ''}${sec.toFixed(1)}s`;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.setSubtitleDelay(sec);
        this.navigateTo('main');
      });

      list.appendChild(btn);
    });

    this.panel.appendChild(list);
  }

  renderAudioDelayMenu() {
    this.panel.appendChild(this.createHeader('Audio Delay'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const delays = [-1.0, -0.5, -0.2, 0, 0.2, 0.5, 1.0];
    const current = this.state.get('audioDelay') || 0;

    delays.forEach((sec) => {
      const isSelected = sec === current;
      const label = sec === 0 ? '0.0s (Normal)' : `${sec > 0 ? '+' : ''}${sec.toFixed(1)}s`;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.setAudioDelay(sec);
        this.navigateTo('main');
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
    this.panel.appendChild(this.createHeader('Watermark Animation'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const wm = this.player.watermark ? this.player.watermark.options : {};

    // Mandatory Branding Badge
    const badge = createElement('div', {
      className: 'yogi-ply-menu-sublabel',
      style: { textAlign: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '8px' },
      innerHTML: `<strong style="color:var(--yogi-accent);">Created By Shiv Yogi</strong><br><span style="font-size:11px; opacity:0.8;">Permanent Brand Signature</span>`
    });
    list.appendChild(badge);

    // Animation Style selection
    const animHeader = createElement('div', {
      className: 'yogi-ply-menu-sublabel',
      textContent: 'Animation Style'
    });
    list.appendChild(animHeader);

    const animStyles = [
      { label: 'Fade Slide (Default)', val: 'fade-slide' },
      { label: 'Fade', val: 'fade' },
      { label: 'Slide', val: 'slide' },
      { label: 'Glow Transition', val: 'glow' }
    ];

    animStyles.forEach((style) => {
      const isSelected = wm.animationStyle === style.val;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${style.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.setWatermark({ animationStyle: style.val });
        this.renderWatermarkMenu();
      });

      list.appendChild(btn);
    });

    // Opacity
    const opHeader = createElement('div', {
      className: 'yogi-ply-menu-sublabel',
      textContent: 'Visual Opacity'
    });
    list.appendChild(opHeader);

    const opacities = [
      { label: 'Subtle (18%)', val: 0.18 },
      { label: 'Default (28%)', val: 0.28 },
      { label: 'Medium (50%)', val: 0.5 },
      { label: 'High (75%)', val: 0.75 }
    ];

    opacities.forEach((op) => {
      const isSelected = Math.abs((wm.opacity || 0.28) - op.val) < 0.05;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${op.label}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.setWatermark({ opacity: op.val });
        this.renderWatermarkMenu();
      });

      list.appendChild(btn);
    });

    this.panel.appendChild(list);
  }

  renderThemesMenu() {
    this.panel.appendChild(this.createHeader('Themes'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const themes = [
      { id: 'liquid-glass', name: 'Liquid Glass' },
      { id: 'dark', name: 'Dark Studio' },
      { id: 'cinematic-oled', name: 'Cinematic OLED' },
      { id: 'light', name: 'Light Frosted' }
    ];
    const currentTheme = this.state.get('theme') || 'liquid-glass';

    themes.forEach((t) => {
      const isSelected = t.id === currentTheme;
      const btn = createElement('button', {
        className: `yogi-ply-menu-option ${isSelected ? 'yogi-ply-option-active' : ''}`,
        innerHTML: `
          <span>${t.name}</span>
          ${isSelected ? `<span class="yogi-ply-check">${icons.check}</span>` : ''}
        `
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.player.setTheme(t.id);
        this.navigateTo('main');
      });

      list.appendChild(btn);
    });

    this.panel.appendChild(list);
  }

  renderInfoMenu() {
    this.panel.appendChild(this.createHeader('Playback Diagnostics'));
    const list = createElement('div', { className: 'yogi-ply-menu-list' });
    const diag = this.player.getDiagnostics();

    const rows = [
      { label: 'Source', val: diag.source ? diag.source.split('/').pop() : 'None' },
      { label: 'Resolution', val: diag.resolution },
      { label: 'Viewport', val: diag.viewport },
      { label: 'Duration', val: formatTime(diag.duration) },
      { label: 'Buffered', val: `${(diag.bufferedRatio * 100).toFixed(0)}% (${formatTime(diag.bufferedSeconds)})` },
      { label: 'Current State', val: diag.isPaused ? 'Paused' : 'Playing' },
      { label: 'Playback Rate', val: `${diag.playbackRate}x` },
      { label: 'Volume', val: diag.isMuted ? 'Muted' : `${(diag.volume * 100).toFixed(0)}%` },
      { label: 'Engine', val: diag.engine },
      { label: 'Brand', val: 'Created By Shiv Yogi' }
    ];

    rows.forEach((r) => {
      const item = createElement('div', {
        className: 'yogi-ply-menu-row',
        style: { cursor: 'default' },
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
