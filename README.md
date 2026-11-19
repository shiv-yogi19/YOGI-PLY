# Yogi_PLY 🎬

**Universal Cinematic Liquid Glass Video Player Framework**  
*One Player. Every Website.*

**Creator:** Created By Shiv Yogi  
**Repository:** [https://github.com/shiv-yogi19/Yogi_PLY](https://github.com/shiv-yogi19/Yogi_PLY)  
**Live Demo:** [https://shiv-yogi19.github.io/Yogi_PLY/](https://shiv-yogi19.github.io/Yogi_PLY/)  
**License:** MIT  

---

## 🌟 Executive Overview

**Yogi_PLY** is a professional, production-ready, framework-agnostic universal multimedia player framework engineered for modern web applications, content management systems, mobile browsers, and Python-hosted environments. 

The framework provides two integrated products:
1. **Yogi_PLY Studio**: A standalone pre-embedding configuration dashboard (`studio/`) where developers configure themes, controls, layouts, animations, and behaviors before embedding into their applications. Features interactive live preview, 5 built-in presets, JSON import/export, and multi-target code generators.
2. **Yogi_PLY Player**: A high-performance, lightweight cinematic video player (`src/`) featuring a signature Apple-inspired Liquid Glass interface, 40+ liquid animations, mobile-first center controls, an 18-feature Three-Dot overflow menu, adaptive streaming (HLS/DASH), and an immutable creator watermark.

---

## 🔒 Permanent Creator Branding Policy

In accordance with Section 2 of the framework specification:
- **Immutable Branding Text**: The watermark text is permanently fixed to **`Created By Shiv Yogi`**.
- **Permanent Enforcement**: Always enabled (`enabled: true`), non-removable, and non-editable.
- **API & UI Protection**: There are no removal buttons, no disable toggles, and no text replacement options in the public API, the Studio dashboard, or HTML data attributes.
- **Configurable Visual Settings**: Developers may configure visual animation properties:
  - `animationStyle`: `'fade-slide'` | `'fade'` | `'slide'` | `'float'` | `'pulse'`
  - `opacity`: Constrained between `0.15` and `0.85` (default `0.35`)
  - `interval`: Transition interval in milliseconds (default `12000`)
  - `movement`: Dynamic smooth repositioning across safe viewport coordinates
- **Collision Avoidance**: Automatically detects active subtitle cues and control docks, shifting coordinates to avoid obstructing playback or subtitles.

---

## 📱 Mobile Reference Design Philosophy

Built faithfully around modern mobile video player aesthetics:
- **Cinematic Landscape in Portrait**: Beautiful landscape video presentation centered naturally inside a portrait mobile viewport with deep black background.
- **Floating Top Utility Bar**: Back button, video title, metadata badge (e.g., `HD · 60 FPS`), instant subtitle toggle, and Three-Dot overflow button.
- **Reference Center Controls**: Dominant 72px central Play/Pause button flanked by 10-second rewind (`-10s`) and forward (`+10s`) buttons with glass reflections.
- **Bottom Control Dock**: Sleek frosted glass dock with an interactive seekbar, timestamp indicators, volume slider, screenshot button, PiP toggle, theatre mode, overflow trigger, and fullscreen.
- **Inactivity Auto-Hide**: 3000ms inactivity timer that smoothly fades out controls during playback, instantly reappearing on touch or cursor motion.
- **Custom SVG Vector Library**: 24×24 viewBox, consistent 2px stroke, rounded caps and joins. Zero emojis and zero icon-font dependencies.

---

## ⚡ Animation & Transition Engine (40 Variants)

Yogi_PLY features a dedicated animation engine (`AnimationEngine.js` & `animations.css`) with 40 distinct liquid glass animations:

| Category | Animation Variants |
| :--- | :--- |
| **Player & Dock** | `entrance`, `exit`, `dock-enter`, `dock-exit`, `auto-hide`, `fullscreen-enter`, `theatre-enter` |
| **Tactile Buttons** | `button-press` (`scale(0.92)`), `button-glow`, `play-tap`, `pause-tap`, `center-pulse` |
| **Progress & Seek**| `seekbar-glow`, `seekbar-pulse`, `thumb-expand`, `hover-preview-pop` |
| **Three-Dot Menu** | `three-dot-rotate` (90° smooth twist), `menu-expand` (liquid spring), `menu-collapse` |
| **Panels & Drawers**| `settings-panel-enter`, `settings-panel-exit`, `playlist-drawer-enter`, `playlist-drawer-exit` |
| **Gestures & HUD**  | `double-tap-ripple-left`, `double-tap-ripple-right`, `gesture-hud-pop`, `hud-fade-out` |
| **Media States**   | `spinner-rotate`, `buffering-pulse`, `subtitle-enter`, `subtitle-exit`, `error-shake` |
| **Feedback & Tools**| `screenshot-flash` (camera shutter flash), `theme-crossfade`, `quality-feedback`, `speed-feedback` |
| **Watermark**      | `watermark-fade-slide`, `watermark-float`, `watermark-pulse` |

*Fully compliant with `@media (prefers-reduced-motion: reduce)`.*

---

## 🎛️ 18-Feature Three-Dot Overflow Menu

The player features an expandable liquid glass overflow menu providing access to 18 features:
1. **Playback Speed**: 0.25x, 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x, 2.5x, 3.0x.
2. **Video Quality**: Multi-bitrate switching and adaptive auto mode.
3. **Subtitles / CC**: Track selection (WebVTT & SRT) with active checkmark.
4. **Chapters Navigation**: Timeline segments with start times and descriptions.
5. **Audio Track**: Multi-language audio channel selector.
6. **Aspect Ratio**: 16:9 cinematic default, 4:3 classic, 21:9 ultrawide, and fit/fill.
7. **Sleep Timer**: 15m, 30m, 45m, 60m countdown or custom with auto-pause.
8. **A-B Repeat**: Point A / Point B marker setting with seamless loop enforcement.
9. **Frame Stepping**: Step forward and step backward one frame (1/30s).
10. **Subtitle Delay**: Synchronize subtitles from -5s to +5s in 100ms increments.
11. **Audio Delay**: Synchronize audio offset for Bluetooth latency compensation.
12. **Loop Toggle**: Continuous video replay switch.
13. **Take Screenshot**: Instant full-resolution PNG/JPEG frame capture with shutter flash.
14. **Picture-in-Picture**: Native OS floating window toggle.
15. **Watermark Animation**: Configurable visual style (`fade-slide`, `fade`, `slide`, `pulse`), opacity slider (`0.15` to `0.85`), and movement intervals. *(Note: Watermark cannot be disabled or text modified).*
16. **Themes**: Switch between `liquid-glass`, `dark`, `light`, and `cinematic-oled`.
17. **Playback Info**: Realtime diagnostics (Engine, Resolution, Bitrate, Dropped Frames).
18. **Download / Share**: Quick media sharing hooks.

---

## 🎨 Yogi_PLY Studio — Pre-Embedding Configuration Dashboard

Located in `studio/` and accessible at `studio/index.html`:
- **Live Preview Window**: Realtime interactive player displaying live updates as configuration parameters are modified.
- **5 Built-in Presets**:
  1. *Cinematic Liquid Glass* (Default aesthetic with rich blur, deep shadows, spring animations).
  2. *OLED Pure Black* (Ultra-dark theme optimized for OLED screens and dark rooms).
  3. *Mobile Touch-First* (Enlarged center controls, prominent touch targets, 10s skips).
  4. *Ultra Minimalist* (Clean dock, auto-hiding controls, subtle watermark).
  5. *Streaming Pro* (Adaptive streaming, chapter navigation, diagnostics, multi-audio).
- **Multi-Target Code Generators**:
  - Configuration JSON
  - JavaScript ESM Initialization
  - Zero-JS HTML Auto-init Embed
  - CSS Custom Property Overrides
  - React Component (`YogiPlayer.jsx`)
  - Vue 3 Component (`YogiPlayer.vue`)
  - Python Flask & Pydroid 3 Server
- **One-Click Actions**: Copy code to clipboard, download `yogi-ply-config.json`, and import existing configs.

---

## 🐍 Python Flask & Pydroid 3 RFC 7233 Streaming

Mobile browsers and WebViews strictly require HTTP 206 Partial Content byte ranges for video seeking. Yogi_PLY provides two server solutions in `integrations/python/`:

1. **Flask Server (`server_flask.py`)**:
   ```bash
   pip install flask
   python server_flask.py --port 5000 --dir ./media
   ```
2. **Zero-PIP Standard Library Server (`server_stdlib.py`)**:
   Pure Python 3 standard library with zero third-party dependencies. Ideal for Pydroid 3 on Android, Termux, and LAN testing:
   ```bash
   python3 server_stdlib.py --port 8080 --dir /sdcard/Movies
   ```

---

## 🚀 Quick Start

### 1. Zero-JS HTML Auto-Initialization

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/shiv-yogi19/Yogi_PLY@v1.0.0/dist/yogi-ply.min.css">

<div class="yogi-ply"
     data-video="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
     data-poster="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80"
     data-title="Big Buck Bunny"
     data-theme="liquid-glass">
</div>

<script src="https://cdn.jsdelivr.net/gh/shiv-yogi19/Yogi_PLY@v1.0.0/dist/yogi-ply.min.js"></script>
```

### 2. Programmatic JavaScript API

```javascript
import YogiPLY from 'yogi-ply';
import 'yogi-ply/dist/yogi-ply.min.css';

const player = new YogiPLY.Player('#player-container', {
  source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  poster: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
  title: 'Big Buck Bunny',
  theme: 'liquid-glass',
  aspectRatio: '16:9',
  watermark: {
    opacity: 0.35,
    animationStyle: 'fade-slide',
    interval: 12000,
    movement: true
  }
});

player.on('play', () => console.log('Playing!'));
```

---

## 🛠️ Public JavaScript API

### Playback & Seeking
```javascript
player.play();                       // Returns Promise<void>
player.pause();                      // Pauses video
player.togglePlay();                 // Toggles play/pause
player.restart();                    // Seeks to 0 and starts playback
player.seek(seconds);                // Seeks to absolute timestamp
player.stepFrame(1);                 // Steps forward 1 frame (1/30s)
player.stepFrame(-1);                // Steps backward 1 frame
player.setVolume(value);             // Sets volume (0.0 to 1.0)
player.mute();                       // Mutes audio
player.unmute();                     // Restores volume
player.setPlaybackRate(rate);        // Sets speed (0.25 to 3.0)
player.setLoop(boolean);             // Enables or disables looping
```

### Viewport & Features
```javascript
player.setAspectRatio('16:9');       // '16:9' | '4:3' | '21:9' | 'fill'
player.setSleepTimer(30);            // Auto-pause countdown in minutes (0 to cancel)
player.getSleepTimer();              // Returns { active, remainingSeconds }
player.setRepeatPointA(10.5);        // Set A-B repeat start point
player.setRepeatPointB(25.0);        // Set A-B repeat end point
player.clearRepeat();                // Clear A-B repeat points
player.setSubtitleDelay(0.5);        // Adjust subtitle timing in seconds
player.setAudioDelay(0.1);           // Adjust audio sync delay
player.setTitle('New Movie Title');  // Update video title
player.getDiagnostics();             // Returns performance & playback metrics
player.captureScreenshot('snap.png');// Captures current frame as PNG/JPEG
player.requestFullscreen();          // Enters fullscreen
player.exitFullscreen();             // Exits fullscreen
player.toggleTheatre();              // Toggles 80vh theatre mode
player.togglePip();                  // Toggles Picture-in-Picture
player.destroy();                    // Tears down instance and removes listeners
```

---

## 🧪 Testing & Verification

Automated test suite covering 55 unit and integration tests:

```bash
pnpm test
```

```text
✔ Player Lifecycle (Instantiation, Defaults, Methods)
✔ Immutable Permanent Watermark Policy Enforcement
✔ Controls Top Bar & Reference Center Controls
✔ Animation Engine (40 variants, presets, reduced motion)
✔ Aspect Ratio, Sleep Timer, A-B Repeat, Frame Stepping
✔ Subtitle Delay Synchronization & SRT Parser
✔ Studio Schema Validation, Presets, Code Generators
✔ Python RFC 7233 Range Handling & Traversal Defense

55 / 55 tests passed (100%)
```

---

## 📦 Build Artifacts

Production assets generated in `dist/`:
- `dist/yogi-ply.js`: UMD bundle (199.7 KB)
- `dist/yogi-ply.min.js`: Minified production bundle (123.4 KB)
- `dist/yogi-ply.esm.js`: ES Module bundle (188.8 KB)
- `dist/yogi-ply.css`: Unminified stylesheet (43.8 KB)
- `dist/yogi-ply.min.css`: Minified stylesheet (30.5 KB)
- `dist/yogi-ply.d.ts`: Complete TypeScript declarations

---

## 📄 License & Attribution

- **Project:** Yogi_PLY
- **Tagline:** One Player. Every Website.
- **Creator:** Created By Shiv Yogi
- **License:** MIT License (Free for commercial and open-source use)
