# Yogi_PLY Architecture & Technical Specification

**Product:** Yogi_PLY  
**Tagline:** One Player. Every Website.  
**Creator:** Created By Shiv Yogi  
**License:** MIT  

---

## 1. Architectural Overview

Yogi_PLY is engineered as a decoupled, modular, framework-agnostic multimedia framework centered around observable reactive state and event-driven communication. The framework is split into two integrated products:
1. **Yogi_PLY Player**: The lightweight, high-performance runtime player with a signature Apple-inspired Liquid Glass interface, 40+ animations, mobile-reference landscape-in-portrait controls, and zero framework dependencies.
2. **Yogi_PLY Studio**: A standalone pre-embedding configuration dashboard providing live visual feedback, preset management, validation, and multi-target code generation (JSON, ESM, HTML, CSS, React, Vue, Python Flask/Pydroid 3).

```
+---------------------------------------------------------------------------------------------------------+
|                                              Yogi_PLY Player (Core)                                     |
|    - Options Parsing & Defaults                  - Public API Gateway (play, pause, seek, etc.)         |
|    - Aspect Ratio (16:9, 4:3, 21:9, fill)        - Sleep Timer & A-B Repeat Loop Controller             |
|    - Frame Stepping & Diagnostic Logging         - Global Registry (YogiPLY.instances)                  |
+---------------------------------------------------------------------------------------------------------+
       |                         |                              |                               |
       v                         v                              v                               v
+---------------+        +---------------+             +----------------+              +----------------+
|  Observable   |  <---> | EventEmitter  |             |ListenerTracker |              |  DOM Manager   |
|  State Tree   |        |  (Pub/Sub)    |             | (Memory Safety)|              | & Sanitization |
+---------------+        +---------------+             +----------------+              +----------------+
       |                         |                              |                               |
       +-------------------------+------------------------------+-------------------------------+
       |                                       |                                                |
       v                                       v                                                v
+-----------------------------+ +-----------------------------+  +--------------------------------------+
|     Visual Controls Dock    | |      Animation Engine       |  |       Engine & Streaming Layer       |
| - Top Utility Bar           | | - 40+ Liquid Glass Variants |  | - HTML5 <video> Media Controller     |
|   (Title, Meta, Sub, More)  | | - Spring & Liquid Curves    |  | - RFC 7233 Range Handling           |
| - Mobile Center Controls    | | - Auto-Hide Timers (3000ms) |  | - Media Session API (Lockscreen)     |
|   (Rewind, Play/Pause, Fwd) | | - Prefers-Reduced-Motion    |  | - HlsAdapter & DashAdapter (On-Demand|
| - Bottom Control Dock       | +-----------------------------+  | - YouTube & Vimeo Iframe Adapters    |
|   (Seekbar, Vol, PiP, Full) |                |                 +--------------------------------------+
+-----------------------------+                |                                        |
               |                               |                                        |
               v                               v                                        v
+-----------------------------+ +-----------------------------+  +--------------------------------------+
|    Settings & Overflow Menu | |  Signature Watermark Engine |  |      Yogi_PLY Studio Dashboard       |
| - 18 Feature Submenus:      | | - Immutable Branding:       |  | - Live Interactive Player Preview    |
|   Speed, Quality, Subtitles,| |   "Created By Shiv Yogi"    |  | - Preset Engine (Cinematic, OLED, etc|
|   Audio Track, Aspect Ratio,| | - Subtitle Collision Guard  |  | - Realtime Validation & Schema Guard |
|   Sleep Timer, A-B Repeat,  | | - Periodic Float Relocation |  | - Code Generators: JSON, JS, HTML,  |
|   Frame Step, Audio Delay,  | | - Opacity [0.15 - 0.85]     |  |   React, Vue, Python Flask/Pydroid 3 |
|   Watermark visual config   | +-----------------------------+  +--------------------------------------+
+-----------------------------+
```

---

## 2. Core Modules Breakdown

### 2.1 State Management (`State.js`)
All player internal state is stored in an observable `State` tree. State changes emit targeted `change:<key>` events, decoupling visual components from media engine internals:
- Subscribed components update immediately on state mutation without polling loops.
- Complete isolation between multiple independent player instances on the same page.
- Tracked properties include: `paused`, `currentTime`, `duration`, `volume`, `muted`, `playbackRate`, `aspectRatio`, `sleepTimer`, `repeatPointA`, `repeatPointB`, `buffered`, `isFullscreen`, `isTheatre`, `quality`, `subtitlesEnabled`, `currentSubtitle`, `subtitleDelay`, `audioDelay`.

### 2.2 Event System (`EventEmitter.js`)
Lightweight pub/sub bus implementation providing `on()`, `off()`, `once()`, and `emit()`. All consumer-facing player events flow through the emitter, ensuring strict memory isolation.

### 2.3 Memory Management (`ListenerTracker.js`)
To eliminate memory leaks in Single Page Applications (SPAs), DOM and window event listeners are registered through a central `ListenerTracker`. When `player.destroy()` is executed, all registered listeners across `window`, `document`, and child elements are cleanly detached in a single call.

### 2.4 Media Engine & Diagnostics (`Engine.js` & `MediaCompatibility.js`)
- Handles native HTML5 `<video>` events (`loadstart`, `canplay`, `waiting`, `timeupdate`, `volumechange`, `ended`).
- Media Session API integration for mobile notification controls and metadata.
- Integrated Sleep Timer countdown controller with automatic playback pause upon expiry.
- A-B Repeat loop engine enforcing frame-accurate looping between user-defined timestamps.
- Frame stepping engine allowing precise frame-by-frame forward and backward inspection (1/30s default).
- `inspectMediaCompatibility` checks container extensions and browser codecs via `canPlayType()`. Detects unsupported legacy formats (AVI, MKV, WMV) and produces actionable conversion advice.

---

## 3. Visual & Control Architecture

### 3.1 Mobile Reference Design Layout
Faithfully reproduces the reference mobile experience:
- **Floating Top Bar (`.yogi-ply-top-bar`)**: Contains optional Back navigation button, media title, video metadata badge (e.g. `HD · 60 FPS`), instant subtitle toggle, and Three-Dot overflow button.
- **Reference Center Controls (`.yogi-ply-center-controls`)**: Features a dominant 72px central Play/Pause button flanked by 10-second rewind (`-10s`) and forward (`+10s`) buttons with glass reflections.
- **Bottom Control Dock (`.yogi-ply-controls`)**: Sleek glass dock housing the interactive progress bar, time counters, volume slider, screenshot button, PiP toggle, theatre toggle, overflow button, and fullscreen trigger.
- **Inactivity Auto-Hide**: 3000ms inactivity timer automatically fades out controls during playback, resuming on touch or cursor motion.

### 3.2 Animation & Transition Engine (`AnimationEngine.js` & `animations.css`)
Dedicated CSS animation architecture with 40 distinct variants:
- **Player & Dock**: Entrance fade-up, exit fade-down, dock slide-up, auto-hide transitions.
- **Buttons**: Tactile press scaling (`scale(0.92)`), play/pause pulse, glass reflections.
- **Seekbar & Progress**: Glow pulse, thumb expansion on hover, hover time preview tooltip.
- **Three-Dot Menu**: 90-degree button rotation, glass panel spring expansion and smooth collapse.
- **Gestures & Feedback**: Double-tap chevron waves, brightness/volume HUD overlays, screenshot shutter flash.
- **Watermark Transitions**: Fade-slide, smooth float, pulse relocation avoiding active subtitles.
- **Reduced Motion Support**: Full `@media (prefers-reduced-motion: reduce)` compliance across all 40 variants.

---

## 4. Settings & Three-Dot Overflow Architecture (`SettingsMenu.js`)

The player provides an expandable 18-feature glass menu system:
1. **Playback Speed**: 0.25x to 3.0x with active indicator.
2. **Video Quality**: Multi-bitrate switching and adaptive auto mode.
3. **Subtitles / CC**: Track selection with active checkmark.
4. **Chapters Navigation**: Timeline segments with start times and descriptions.
5. **Audio Track**: Multi-language audio channel selector.
6. **Aspect Ratio**: 16:9 cinematic default, 4:3 classic, 21:9 ultrawide, and fit/fill.
7. **Sleep Timer**: 15m, 30m, 45m, 60m countdown or custom with auto-pause.
8. **A-B Repeat**: Point A / Point B marker setting with seamless loop enforcement.
9. **Frame Stepping**: Step forward and step backward one frame (1/30s).
10. **Subtitle Delay**: Synchronize subtitles from -5s to +5s in 100ms increments.
11. **Audio Delay**: Synchronize audio offset for Bluetooth latency compensation.
12. **Loop Toggle**: Continuous video replay switch.
13. **Take Screenshot**: Instant full-resolution PNG/JPEG frame capture with shutter animation.
14. **Picture-in-Picture**: Native OS floating window toggle.
15. **Watermark Animation**: Configurable visual style (`fade-slide`, `fade`, `slide`, `pulse`), opacity slider (`0.15` to `0.85`), and movement intervals. *Note: Watermark cannot be disabled or text modified.*
16. **Themes**: Switch between `liquid-glass`, `dark`, `light`, and `cinematic-oled`.
17. **Playback Info**: Realtime diagnostics (Engine, Resolution, Bitrate, Dropped Frames).
18. **Download / Share**: Quick media sharing hooks.

---

## 5. Permanent Watermark Policy Enforcement (`Watermark.js`)

In accordance with Section 2 of the framework specification:
- Watermark text is permanently immutable: `Created By Shiv Yogi`.
- Always enabled (`enabled: true`), non-removable, and non-editable via any public API method, constructor option, HTML data attribute, or Studio setting.
- Visual animation options (`animationStyle`, `opacity`, `interval`, `movement`) are strictly constrained within safe branding limits.
- Collision avoidance engine continuously monitors active subtitle cues and control docks, relocating the watermark to alternate quadrant coordinates to maintain reading legibility.

---

## 6. Python Streaming & Byte-Range Architecture

Mobile devices (especially Android Chrome, Termux, and Pydroid 3 WebViews) require HTTP 206 Partial Content byte ranges (RFC 7233) to allow seeking and buffered playback without full-file downloads:
- **Flask Server (`integrations/python/server_flask.py`)**: Production-ready Flask server handling `Range: bytes=start-end`, generating `206 Partial Content` with `Content-Range`, `Accept-Ranges`, and proper video MIME types. Includes path traversal protection.
- **Zero-PIP Standard Library Server (`integrations/python/server_stdlib.py`)**: Pure Python standard library HTTP server implementing RFC 7233 without any pip dependencies. Ideal for Pydroid 3 on mobile devices and offline LAN environments.

---

## 7. Security & Sanitization

- **HTML Injection Prevention**: Subtitle strings, chapter titles, media metadata, and playlist names pass through `escapeHtml()` to neutralize XSS vectors.
- **Protocol Validation**: Media URLs are validated against dangerous protocols (`javascript:`, `data:`).
- **Directory Traversal Defense**: Python streaming servers normalize paths and verify that requested files reside strictly within permitted media directories.
