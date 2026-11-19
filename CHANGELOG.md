# Changelog

All notable changes to the **Yogi_PLY** multimedia player framework will be documented in this file.
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-19

### Master Production Release — Yogi_PLY
*Tagline: One Player. Every Website.*  
*Creator: Created By Shiv Yogi*

#### Added
- **Yogi_PLY Studio (`studio/`)**: Complete pre-embedding configuration dashboard featuring interactive live player preview, 5 built-in presets (Cinematic Liquid Glass, OLED Pure Black, Mobile Touch-First, Ultra Minimalist, Streaming Pro), JSON import/export, and code generators for JSON, JavaScript ESM, HTML Auto-init, CSS overrides, React (`YogiPlayer.jsx`), Vue 3 (`YogiPlayer.vue`), and Python.
- **Animation & Transition Engine (`AnimationEngine.js` & `animations.css`)**: 40 distinct hardware-accelerated liquid glass animation variants with spring/liquid cubic-bezier curves, presets (`cinematic`, `smooth`, `instant`, `spring`, `subtle`), flash screenshot feedback, and full `@media (prefers-reduced-motion: reduce)` compliance.
- **Reference Mobile Layout (`Controls.js`)**:
  - Centered cinematic landscape video in portrait mobile viewport.
  - Floating Top Utility Bar (`.yogi-ply-top-bar`) with back button, media title, metadata badge, subtitle toggle, and Three-Dot overflow button.
  - Dominant 72px central Play/Pause button flanked by 10-second rewind (`-10s`) and forward (`+10s`) buttons with glass reflections.
  - Floating Bottom Control Dock with seekbar, time displays, volume, screenshot, PiP, theatre mode, overflow trigger, and fullscreen.
  - 3000ms inactivity auto-hide with instant touch/hover reactivity.
- **18-Feature Three-Dot Overflow Menu (`SettingsMenu.js`)**: Expandable glass panel with 18 submenus: Speed, Quality, Subtitles, Chapters, Audio Track, Aspect Ratio, Sleep Timer, A-B Repeat, Frame Stepping, Subtitle Delay, Audio Delay, Loop, Screenshot, Picture-in-Picture, Watermark visual config, Themes, Diagnostics, and Share.
- **Permanent Creator Watermark Policy (`Watermark.js`)**: Immutable `Created By Shiv Yogi` branding text and `enabled: true` enforcement across all public APIs, constructor options, HTML data attributes, and Studio settings. Realtime subtitle and dock collision avoidance with safe quadrant relocation.
- **Aspect Ratio Controller**: Support for `16:9`, `4:3`, `21:9`, and `fill` ratios.
- **Sleep Timer System**: Configurable countdown (15m, 30m, 45m, 60m, custom) with automatic playback pause upon completion.
- **A-B Repeat Loop Controller**: Frame-accurate looping between user-defined Point A and Point B timestamps.
- **Frame Stepping Engine**: Forward and backward single-frame stepping (`1/30s`) for precise video inspection.
- **Subtitle Delay Synchronization (`SubtitleManager.js`)**: ±5.0s timing offset adjustment in 100ms increments.
- **Media Session API (`Engine.js`)**: Native OS lockscreen and notification media playback controls and metadata.
- **Python Streaming Ecosystem (`integrations/python/`)**:
  - `server_flask.py`: Production Flask video server with RFC 7233 HTTP 206 Partial Content byte ranges and directory traversal defense.
  - `server_stdlib.py`: Zero-PIP pure Python 3 standard library streaming server for Pydroid 3, Termux, and offline LAN environments.
- **On-Demand Adaptive Streaming**: Dynamic CDN loading of `Hls.js` and `dash.js` with native iOS Safari HLS fallback.
- **Reports & Audits**:
  - `OPTIMIZATION_REPORT.md`: 104 verified optimization checks across 12 architectural categories.
  - `COMPATIBILITY_REPORT.md`: 102 verified compatibility checks across browsers, mobile devices, codecs, and gestures.
  - `QA_REPORT.md`: Full quality assurance audit with 55 passing tests and production build verification.
- **Test Suite**: 55 unit and integration tests passing at 100% in Node.js test runner.
