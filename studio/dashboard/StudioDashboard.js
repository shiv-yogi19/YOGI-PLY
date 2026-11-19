/**
 * Yogi_PLY Studio - Complete Standalone Dashboard Controller
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

import { DEFAULT_CONFIG, validateConfiguration, PERMANENT_BRANDING } from '../configuration/schema.js';
import { STUDIO_PRESETS } from '../presets/index.js';
import {
  generateConfigJson,
  generateJsCode,
  generateHtmlCode,
  generateCssCode,
  generateReactCode,
  generateVueCode,
  generatePythonCode
} from '../generator/codeGenerators.js';

export class StudioDashboard {
  /**
   * @param {HTMLElement} rootContainer
   * @param {Object} initialConfig
   */
  constructor(rootContainer, initialConfig = {}) {
    this.root = rootContainer;
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    if (initialConfig) {
      const validated = validateConfiguration(initialConfig);
      Object.assign(this.config, validated.sanitizedConfig);
    }

    this.playerInstance = null;
    this.activeCodeTab = 'json'; // 'json' | 'js' | 'html' | 'css' | 'react' | 'vue' | 'python'

    this.init();
  }

  init() {
    this.renderLayout();
    this.bindEvents();
    this.initLivePlayer();
    this.updateCodeOutput();
  }

  renderLayout() {
    this.root.innerHTML = `
      <div class="studio-header">
        <a href="#" class="studio-brand">
          <div class="studio-logo-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="6 4 20 12 6 20 6 4" fill="#fff" fill-opacity="0.3"/>
            </svg>
          </div>
          <div>
            <div class="studio-logo-text">Yogi_PLY Studio</div>
            <div class="studio-tagline">Universal Liquid Glass Configuration Hub</div>
          </div>
        </a>

        <div class="studio-header-actions">
          <span class="studio-badge">Created By Shiv Yogi</span>
          <button class="studio-btn" id="studio-import-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Import JSON
          </button>
          <button class="studio-btn studio-btn-primary" id="studio-export-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Download Config
          </button>
        </div>
      </div>

      <div class="studio-workspace">
        <!-- Left: Configuration Panels -->
        <div class="studio-config-panel">
          
          <!-- Presets Selector -->
          <div class="studio-card">
            <div class="studio-card-header">
              <span class="studio-card-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Presets & Quick Templates
              </span>
            </div>
            <div class="studio-group">
              <select class="studio-select" id="studio-preset-select" style="width: 100%;">
                <option value="cinematic-glass">🎬 Cinematic Liquid Glass (Default)</option>
                <option value="oled-dark">🖤 Cinematic OLED Pure Black</option>
                <option value="mobile-first">📱 Mobile Touch-First</option>
                <option value="ultra-minimal">⚡ Ultra Minimalist</option>
                <option value="streaming-pro">📡 Streaming & Live Broadcast Pro</option>
              </select>
            </div>
          </div>

          <!-- Section A: Appearance -->
          <div class="studio-card">
            <div class="studio-card-header">
              <span class="studio-card-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                A. Appearance & Theme
              </span>
            </div>
            <div class="studio-group">
              <div class="studio-row">
                <div>
                  <div class="studio-label">Theme Preset</div>
                  <div class="studio-desc">Liquid glass frosted backdrop styling</div>
                </div>
                <select class="studio-select" id="cfg-theme">
                  <option value="liquid-glass" selected>Liquid Glass (Default)</option>
                  <option value="cinematic-oled">Cinematic OLED</option>
                  <option value="dark">Dark Studio</option>
                  <option value="light">Light Frosted</option>
                </select>
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Player Layout</div>
                  <div class="studio-desc">Viewport and control dock scale</div>
                </div>
                <select class="studio-select" id="cfg-layout">
                  <option value="cinematic" selected>Cinematic</option>
                  <option value="standard">Standard</option>
                  <option value="compact">Compact</option>
                  <option value="mobile">Mobile Optimized</option>
                </select>
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Video Title</div>
                  <div class="studio-desc">Appears on top utility bar</div>
                </div>
                <input type="text" class="studio-input" id="cfg-title" value="${this.config.title}" style="width:160px;">
              </div>
            </div>
          </div>

          <!-- Section B: Layout & Video Source -->
          <div class="studio-card">
            <div class="studio-card-header">
              <span class="studio-card-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
                B. Layout & Aspect Ratio
              </span>
            </div>
            <div class="studio-group">
              <div class="studio-row">
                <div>
                  <div class="studio-label">Aspect Ratio</div>
                  <div class="studio-desc">Video viewport proportions</div>
                </div>
                <select class="studio-select" id="cfg-aspectRatio">
                  <option value="16:9" selected>16:9 (Standard Widescreen)</option>
                  <option value="4:3">4:3 (Classic Television)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="21:9">21:9 (Ultrawide Cinema)</option>
                  <option value="Fill (Cover)">Fill (Cover)</option>
                </select>
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Video Source URL</div>
                  <div class="studio-desc">MP4, WebM, HLS (.m3u8), or DASH (.mpd)</div>
                </div>
                <input type="text" class="studio-input" id="cfg-source" value="${this.config.source}" style="width:180px;">
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Poster Image URL</div>
                  <div class="studio-desc">Placeholder thumbnail before playback</div>
                </div>
                <input type="text" class="studio-input" id="cfg-poster" value="${this.config.poster}" style="width:180px;">
              </div>
            </div>
          </div>

          <!-- Section C: Playback Controls Dock -->
          <div class="studio-card">
            <div class="studio-card-header">
              <span class="studio-card-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                C. Controls Configuration
              </span>
            </div>
            <div class="studio-group">
              <div class="studio-checkbox-grid">
                <label class="studio-check-pill">
                  <input type="checkbox" id="ctl-playPause" checked> Play / Pause
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="ctl-seek10" checked> Rewind / Forward 10s
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="ctl-progressBar" checked> Progress Seekbar
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="ctl-volume" checked> Volume & Mute
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="ctl-fullscreen" checked> Fullscreen
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="ctl-theatre" checked> Theatre Mode
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="ctl-pip" checked> Picture-in-Picture
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="ctl-moreMenu" checked> Three-Dot Menu
                </label>
              </div>
            </div>
          </div>

          <!-- Section D: Three-dot More Features Menu Configuration -->
          <div class="studio-card">
            <div class="studio-card-header">
              <span class="studio-card-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                D. More Features Menu Items
              </span>
            </div>
            <div class="studio-group">
              <div class="studio-checkbox-grid">
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-playbackSpeed" checked> Playback Speed
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-quality" checked> Video Quality
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-subtitles" checked> Subtitles
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-chapters" checked> Chapters Drawer
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-audioTrack" checked> Audio Track
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-aspectRatio" checked> Aspect Ratio
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-sleepTimer" checked> Sleep Timer
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-abRepeat" checked> A-B Repeat Loop
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-frameStep" checked> Frame Stepping
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-screenshot" checked> Screenshot Tool
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-loop" checked> Video Repeat Loop
                </label>
                <label class="studio-check-pill">
                  <input type="checkbox" id="feat-diagnostics" checked> Playback Diagnostics
                </label>
              </div>
            </div>
          </div>

          <!-- Section E: Permanent Watermark & Animation -->
          <div class="studio-card">
            <div class="studio-card-header">
              <span class="studio-card-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                E. Watermark Animation & Transition
              </span>
            </div>
            <div class="studio-group">
              <div style="padding: 10px 14px; background: rgba(99, 102, 241, 0.12); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.25);">
                <strong style="color:var(--studio-accent);">Signature Branding: Created By Shiv Yogi</strong>
                <p style="font-size:11px; margin-top:4px; opacity:0.8; line-height:1.4;">
                  The watermark is permanently enabled with immutable text. You may customize its animation style, transition speed, and opacity below.
                </p>
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Watermark Animation Style</div>
                  <div class="studio-desc">Movement transition effect</div>
                </div>
                <select class="studio-select" id="wm-animStyle">
                  <option value="fade-slide" selected>Fade & Slide (Default)</option>
                  <option value="fade">Smooth Fade</option>
                  <option value="slide">Pure Slide</option>
                  <option value="glow">Glow Transition</option>
                </select>
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Watermark Opacity: <span id="wm-opacity-text">28%</span></div>
                  <div class="studio-desc">Safe opacity range (15% - 85%)</div>
                </div>
                <input type="range" id="wm-opacity-slider" min="0.15" max="0.85" step="0.05" value="0.28" style="accent-color:var(--studio-accent);">
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Movement Interval</div>
                  <div class="studio-desc">Time between corner repositions</div>
                </div>
                <select class="studio-select" id="wm-interval-select">
                  <option value="6000">6 Seconds (Fast)</option>
                  <option value="12000" selected>12 Seconds (Default)</option>
                  <option value="20000">20 Seconds (Gentle)</option>
                </select>
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Overall Animation Preset</div>
                  <div class="studio-desc">Controls and UI spring physics</div>
                </div>
                <select class="studio-select" id="cfg-animPreset">
                  <option value="cinematic" selected>Cinematic (Default)</option>
                  <option value="smooth">Smooth</option>
                  <option value="instant">Instant (Fastest)</option>
                  <option value="spring">Spring Elastic</option>
                  <option value="subtle">Subtle</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section F: Playback Preferences -->
          <div class="studio-card">
            <div class="studio-card-header">
              <span class="studio-card-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                F. Playback Preferences
              </span>
            </div>
            <div class="studio-group">
              <div class="studio-row">
                <div>
                  <div class="studio-label">Autoplay Video</div>
                  <div class="studio-desc">Attempts inline playback on page load</div>
                </div>
                <label class="studio-toggle">
                  <input type="checkbox" id="cfg-autoplay">
                  <span class="studio-slider"></span>
                </label>
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Start Muted</div>
                  <div class="studio-desc">Required by browsers for audio autoplay</div>
                </div>
                <label class="studio-toggle">
                  <input type="checkbox" id="cfg-muted">
                  <span class="studio-slider"></span>
                </label>
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Auto-Resume Position</div>
                  <div class="studio-desc">Restores playback timestamp from localStorage</div>
                </div>
                <label class="studio-toggle">
                  <input type="checkbox" id="cfg-autoResume" checked>
                  <span class="studio-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Section G: Performance & Streaming -->
          <div class="studio-card">
            <div class="studio-card-header">
              <span class="studio-card-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                G. Performance & Mobile Optimizations
              </span>
            </div>
            <div class="studio-group">
              <div class="studio-row">
                <div>
                  <div class="studio-label">Performance Mode</div>
                  <div class="studio-desc">Balances blur shaders with GPU resources</div>
                </div>
                <select class="studio-select" id="cfg-perfMode">
                  <option value="high-quality" selected>High Quality (Full Liquid Glass)</option>
                  <option value="balanced">Balanced</option>
                  <option value="low-resource">Low Resource (Battery Saver)</option>
                </select>
              </div>

              <div class="studio-row">
                <div>
                  <div class="studio-label">Lazy-load HLS / DASH Engines</div>
                  <div class="studio-desc">Only downloads HLS.js or dash.js when needed</div>
                </div>
                <label class="studio-toggle">
                  <input type="checkbox" id="cfg-lazyStreaming" checked>
                  <span class="studio-slider"></span>
                </label>
              </div>
            </div>
          </div>

        </div>

        <!-- Right: Real-time Player Preview & Code Generator -->
        <div class="studio-preview-panel">
          
          <!-- Live Player Stage -->
          <div class="studio-preview-box">
            <div class="studio-preview-header">
              <span class="studio-preview-tag">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e;"></span>
                Live Player Preview
              </span>
              <button class="studio-btn" id="studio-reload-preview-btn">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                Reload Preview
              </button>
            </div>
            
            <div id="studio-player-container" style="min-height: 380px;"></div>
          </div>

          <!-- Generated Embed Code Card -->
          <div class="studio-code-card">
            <div class="studio-tabs">
              <button class="studio-tab-btn active" data-tab="json">JSON Config</button>
              <button class="studio-tab-btn" data-tab="js">JavaScript (ESM)</button>
              <button class="studio-tab-btn" data-tab="html">HTML Embed</button>
              <button class="studio-tab-btn" data-tab="css">CSS Overrides</button>
              <button class="studio-tab-btn" data-tab="react">React</button>
              <button class="studio-tab-btn" data-tab="vue">Vue 3</button>
              <button class="studio-tab-btn" data-tab="python">Python Flask / Pydroid 3</button>
            </div>

            <div class="studio-code-box">
              <pre><code id="studio-code-content">// Generating code...</code></pre>
            </div>

            <div class="studio-code-actions">
              <button class="studio-btn" id="studio-copy-btn">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy Code
              </button>
              <button class="studio-btn studio-btn-primary" id="studio-download-json-btn">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download JSON
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  bindEvents() {
    // Presets
    const presetSelect = this.root.querySelector('#studio-preset-select');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const selectedPreset = STUDIO_PRESETS[e.target.value];
        if (selectedPreset) {
          this.applyPreset(selectedPreset.config);
        }
      });
    }

    // Appearance
    this.bindInput('cfg-theme', (val) => {
      this.config.theme = val;
      if (this.playerInstance) this.playerInstance.setTheme(val);
    });

    this.bindInput('cfg-layout', (val) => {
      this.config.layout = val;
      this.reinitPlayer();
    });

    this.bindInput('cfg-title', (val) => {
      this.config.title = val;
      if (this.playerInstance) this.playerInstance.setTitle(val);
    });

    this.bindInput('cfg-aspectRatio', (val) => {
      this.config.aspectRatio = val;
      if (this.playerInstance) this.playerInstance.setAspectRatio(val);
    });

    this.bindInput('cfg-source', (val) => {
      this.config.source = val;
      if (this.playerInstance) this.playerInstance.setSource(val);
    });

    this.bindInput('cfg-poster', (val) => {
      this.config.poster = val;
      if (this.playerInstance) this.playerInstance.setPoster(val);
    });

    // Controls Checkboxes
    const controlKeys = ['playPause', 'seek10', 'progressBar', 'volume', 'fullscreen', 'theatre', 'pip', 'moreMenu'];
    controlKeys.forEach((key) => {
      const el = this.root.querySelector(`#ctl-${key}`);
      if (el) {
        el.addEventListener('change', () => {
          this.config.controls[key] = el.checked;
          this.updateCodeOutput();
        });
      }
    });

    // Features Checkboxes
    const featureKeys = ['playbackSpeed', 'quality', 'subtitles', 'chapters', 'audioTrack', 'aspectRatio', 'sleepTimer', 'abRepeat', 'frameStep', 'screenshot', 'loop', 'diagnostics'];
    featureKeys.forEach((key) => {
      const el = this.root.querySelector(`#feat-${key}`);
      if (el) {
        el.addEventListener('change', () => {
          this.config.features[key] = el.checked;
          this.updateCodeOutput();
        });
      }
    });

    // Watermark Visual Settings
    const wmAnim = this.root.querySelector('#wm-animStyle');
    if (wmAnim) {
      wmAnim.addEventListener('change', (e) => {
        this.config.watermark.animationStyle = e.target.value;
        if (this.playerInstance) this.playerInstance.setWatermark({ animationStyle: e.target.value });
        this.updateCodeOutput();
      });
    }

    const wmOpacity = this.root.querySelector('#wm-opacity-slider');
    const wmOpacityText = this.root.querySelector('#wm-opacity-text');
    if (wmOpacity) {
      wmOpacity.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (wmOpacityText) wmOpacityText.textContent = `${Math.round(val * 100)}%`;
        this.config.watermark.opacity = val;
        if (this.playerInstance) this.playerInstance.setWatermark({ opacity: val });
        this.updateCodeOutput();
      });
    }

    const wmInterval = this.root.querySelector('#wm-interval-select');
    if (wmInterval) {
      wmInterval.addEventListener('change', (e) => {
        const val = Number(e.target.value);
        this.config.watermark.interval = val;
        if (this.playerInstance) this.playerInstance.setWatermark({ interval: val });
        this.updateCodeOutput();
      });
    }

    // Tabs
    const tabs = this.root.querySelectorAll('.studio-tab-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeCodeTab = tab.getAttribute('data-tab');
        this.updateCodeOutput();
      });
    });

    // Copy Button
    const copyBtn = this.root.querySelector('#studio-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const codeText = this.root.querySelector('#studio-code-content').textContent;
        navigator.clipboard.writeText(codeText).then(() => {
          this.showToast('Copied to clipboard!');
        }).catch(() => {
          this.showToast('Failed to copy');
        });
      });
    }

    // Download JSON
    const dlBtn = this.root.querySelector('#studio-download-json-btn');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        this.downloadJson();
      });
    }

    const expBtn = this.root.querySelector('#studio-export-btn');
    if (expBtn) {
      expBtn.addEventListener('click', () => {
        this.downloadJson();
      });
    }

    // Reload Preview Button
    const reloadBtn = this.root.querySelector('#studio-reload-preview-btn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        this.reinitPlayer();
        this.showToast('Preview reloaded!');
      });
    }
  }

  bindInput(id, onChange) {
    const el = this.root.querySelector(`#${id}`);
    if (el) {
      el.addEventListener('change', (e) => {
        onChange(e.target.value);
        this.updateCodeOutput();
      });
    }
  }

  applyPreset(presetConfig) {
    const validated = validateConfiguration(presetConfig);
    this.config = validated.sanitizedConfig;

    // Sync form inputs
    const themeEl = this.root.querySelector('#cfg-theme');
    if (themeEl) themeEl.value = this.config.theme;

    const layoutEl = this.root.querySelector('#cfg-layout');
    if (layoutEl) layoutEl.value = this.config.layout;

    const titleEl = this.root.querySelector('#cfg-title');
    if (titleEl) titleEl.value = this.config.title;

    const aspectEl = this.root.querySelector('#cfg-aspectRatio');
    if (aspectEl) aspectEl.value = this.config.aspectRatio;

    this.reinitPlayer();
    this.updateCodeOutput();
    this.showToast('Preset loaded successfully!');
  }

  initLivePlayer() {
    const previewContainer = this.root.querySelector('#studio-player-container');
    if (!previewContainer) return;

    if (this.playerInstance) {
      this.playerInstance.destroy();
      this.playerInstance = null;
    }

    previewContainer.innerHTML = '';
    const playerTarget = document.createElement('div');
    playerTarget.id = 'studio-player-target';
    previewContainer.appendChild(playerTarget);

    if (typeof window !== 'undefined' && window.YogiPLY && window.YogiPLY.Player) {
      this.playerInstance = new window.YogiPLY.Player(playerTarget, {
        ...this.config,
        autoplay: false // Never autoplay in studio
      });
    }
  }

  reinitPlayer() {
    this.initLivePlayer();
  }

  updateCodeOutput() {
    const codeEl = this.root.querySelector('#studio-code-content');
    if (!codeEl) return;

    let output = '';
    switch (this.activeCodeTab) {
      case 'json':
        output = generateConfigJson(this.config);
        break;
      case 'js':
        output = generateJsCode(this.config);
        break;
      case 'html':
        output = generateHtmlCode(this.config);
        break;
      case 'css':
        output = generateCssCode(this.config);
        break;
      case 'react':
        output = generateReactCode(this.config);
        break;
      case 'vue':
        output = generateVueCode(this.config);
        break;
      case 'python':
        output = generatePythonCode(this.config);
        break;
      default:
        output = generateConfigJson(this.config);
        break;
    }

    codeEl.textContent = output;
  }

  downloadJson() {
    const blob = new Blob([generateConfigJson(this.config)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yogi-ply-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('yogi-ply-config.json downloaded!');
  }

  showToast(message) {
    const existing = document.querySelector('.studio-toast');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    const toast = document.createElement('div');
    toast.className = 'studio-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 2800);
  }
}
