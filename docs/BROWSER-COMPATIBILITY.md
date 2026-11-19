# Yogi_PLY Browser & Media Compatibility Guide

**Product:** Yogi_PLY  
**Tagline:** One Player. Every Website.  
**Creator:** Created By Shiv Yogi  
**License:** MIT  

---

## 1. Browser & Platform Support Matrix

Yogi_PLY has been engineered, audited, and verified across all major desktop and mobile operating environments:

| Platform | Browser / Environment | Engine | Minimum Version | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop** | Google Chrome | Blink / V8 | 88+ | ✅ Fully Supported |
| **Desktop** | Mozilla Firefox | Gecko / SpiderMonkey | 85+ | ✅ Fully Supported |
| **Desktop** | Apple Safari | WebKit / JavaScriptCore | 14+ | ✅ Fully Supported |
| **Desktop** | Microsoft Edge | Blink / V8 | 88+ | ✅ Fully Supported |
| **Desktop** | Opera | Blink / V8 | 74+ | ✅ Fully Supported |
| **Desktop** | Brave | Blink / V8 | 1.20+ | ✅ Fully Supported |
| **Mobile** | Apple iOS Safari | WebKit | iOS 14+ | ✅ Fully Supported |
| **Mobile** | Google Chrome for Android | Blink | Android 8.0+ | ✅ Fully Supported |
| **Mobile** | Samsung Internet | Blink | 15.0+ | ✅ Fully Supported |
| **Mobile** | Firefox for Android | Gecko | 85+ | ✅ Fully Supported |
| **Embedded** | Android WebView | System WebView | 88+ | ✅ Fully Supported |
| **Embedded** | Pydroid 3 Web Component | Android WebView | All Versions | ✅ Fully Supported |
| **Embedded** | Termux Localhost / LAN | Chromium / Firefox | All Versions | ✅ Fully Supported |

---

## 2. Container & Codec Capabilities Matrix

| Container / Extension | Video Codec | Audio Codec | Web Standard Status | Compatibility & Engine Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **MP4 (`.mp4`, `.m4v`)** | H.264 (AVC) | AAC / MP3 | Standard Baseline | Universal 100% hardware-accelerated playback across all devices. |
| **MP4 (`.mp4`)** | AV1 / HEVC (H.265) | AAC / Opus | Modern Standard | Supported on hardware-capable devices and modern Chromium/Safari. |
| **WebM (`.webm`)** | VP8 / VP9 / AV1 | Opus / Vorbis | Open Web Standard | Universal in Chrome, Firefox, Edge, and Safari 14+. |
| **Ogg (`.ogv`, `.ogg`)** | Theora | Vorbis | Open Standard | Supported natively in Chrome, Firefox, and desktop Chromium. |
| **QuickTime (`.mov`)** | H.264 / ProRes | AAC / PCM | Apple Ecosystem | Natively supported on Apple Safari / iOS; plays H.264 in Chrome. |
| **HLS (`.m3u8`)** | H.264 / HEVC | AAC | Adaptive Stream | Native playback on iOS/Safari; MSE adaptive streaming via `Hls.js` on-demand. |
| **MPEG-DASH (`.mpd`)**| H.264 / VP9 | AAC / Opus | Adaptive Stream | MediaSource Extensions adaptive playback via `dash.js` on-demand. |
| **3GP (`.3gp`, `.3g2`)** | H.263 / MPEG-4 | AMR / AAC | Legacy Mobile | Supported on select Android devices; fallback diagnostic on desktop. |

---

## 3. Incompatible Legacy Containers (AVI, MKV, WMV, FLV)

Standard web browsers do **not** support decoding legacy desktop container formats natively in HTML5 `<video>` elements:

- **AVI (`.avi`)**: Microsoft legacy container. Unsupported by browser standards.
- **MKV (`.mkv`)**: Matroska container. Partially playable in Chromium if encoded with WebM-compatible codecs (VP9/Opus), but fails on Safari and iOS.
- **WMV (`.wmv`)**: Windows Media Video. Proprietary container unsupported by web standards.
- **FLV (`.flv`)**: Flash Video. Deprecated and permanently removed from modern web platforms.

### Yogi_PLY Diagnostic Handling
Instead of failing with a silent black screen or broken player interface, Yogi_PLY's `MediaCompatibility` diagnostic engine intercepts these URLs, informs the user with a styled liquid glass error card, and provides clear, actionable conversion recommendations (e.g. transcode to MP4 using FFmpeg).

---

## 4. Platform Differences & Browser Quirks

### 4.1 Autoplay Policies
All modern browsers enforce strict autoplay policies to prevent intrusive experiences:
- **Muted Autoplay**: Autoplay succeeds when audio is muted (`muted: true`).
- **Unmuted Autoplay**: Requires prior user interaction on the domain. Yogi_PLY safely catches unhandled promise rejections on `play()` and falls back gracefully to a paused state with an animated play overlay.

### 4.2 Mobile Screen Brightness Gesture (Security Sandboxing)
Web applications running in browser sandboxes are strictly prohibited from altering device physical backlight hardware. Yogi_PLY implements brightness gestures using a high-performance realtime CSS video filter:
```css
video {
  filter: brightness(1.25);
}
```
This delivers smooth visual dimming and brightening (30% to 170%) without violating device security sandboxing or requiring native device permissions.

### 4.3 iOS Fullscreen Behavior
On Apple iPhone handsets, Apple WebKit restricts the standard HTML5 `element.requestFullscreen()` API. Yogi_PLY automatically detects iPhone handsets and falls back gracefully to `video.webkitEnterFullscreen()` while preserving playback state. On iPad, Android, and desktop browsers, standard element fullscreen expands the entire Liquid Glass container and controls dock.

### 4.4 RFC 7233 HTTP Byte-Range Streaming
Mobile browsers (Android Chrome, Safari iOS, Pydroid 3) require servers to respond to `Range: bytes=start-end` requests with HTTP `206 Partial Content`. Without this header, mobile devices cannot seek through media files and may refuse to start playback. Yogi_PLY provides both Flask and zero-dependency Python standard library servers (`server_flask.py` and `server_stdlib.py`) implementing RFC 7233 byte ranges.

### 4.5 Backdrop Filter & Glass Fallback
Browsers without `backdrop-filter` support automatically receive high-opacity fallback background colors via `@supports not (backdrop-filter: blur(20px))`, ensuring high legibility and contrast on all screens.
