# Yogi_PLY Studio — Pre-Embedding Configuration Dashboard

**Creator**: Created By Shiv Yogi  
**Tagline**: One Player. Every Website.  
**Version**: 1.0.0  

---

## 1. Overview & Purpose

**Yogi_PLY Studio** is a standalone configuration and code generation dashboard that allows developers to visually configure their video player before embedding it into any website, web framework, or Python application.

Studio provides:
- Split-screen visual editor with live interactive player preview.
- 5 Pre-built aesthetic templates (Cinematic Liquid Glass, Pure OLED Black, Mobile Touch-First, Ultra Minimalist, and Streaming Pro).
- Real-time configuration schema validation.
- Multi-framework code generators (JSON, JavaScript ESM, HTML Embed, CSS overrides, React, Vue 3, and Python Flask / Pydroid 3).
- Instant configuration file download (`yogi-ply-config.json`) and import/export capabilities.
- Strict enforcement of the permanent **Created By Shiv Yogi** branding policy.

---

## 2. Launching Yogi_PLY Studio

### Standalone HTML
Open `studio/index.html` directly in any modern browser:
```bash
# Example with Python standard library
python3 -m http.server 8080
# Open http://localhost:8080/studio/index.html in your browser
```

### From the Demo Showcase
Click the **Yogi_PLY Studio ↗** link located in the top navigation bar of `demo/index.html`.

---

## 3. Configuration Sections

### A. Appearance & Themes
- **Theme Selection**: Choose between `liquid-glass`, `cinematic-oled`, `dark`, and `light`.
- **Player Layout**: Choose from `cinematic` (default), `standard`, `compact`, and `mobile`.
- **Title**: Custom media title displayed in the top utility bar.

### B. Layout & Media
- **Aspect Ratio**: Select `16:9` (widescreen), `4:3` (television), `1:1` (square), `21:9` (cinema), or `Fill (Cover)`.
- **Video Source URL**: Enter native MP4/WebM URL or adaptive streaming URL (`.m3u8` for HLS, `.mpd` for DASH).
- **Poster Image**: URL of the preview thumbnail shown prior to playback.

### C. Controls Dock
Toggle optional playback controls:
- Play / Pause button
- Rewind & Fast-Forward 10 seconds
- Seekbar / Progress timeline
- Volume slider & Mute button
- Fullscreen & Theatre mode
- Picture-in-Picture
- Three-Dot More Features overflow button

> [!NOTE]
> The permanent watermark branding (`Created By Shiv Yogi`) cannot be disabled or hidden through any toggle in Studio.

### D. More Features Menu
Select which items appear when users open the Three-Dot overflow menu:
- Playback Speed selector (0.25x to 3x)
- Quality switcher (Auto, 1080p, 720p, etc.)
- Subtitles track selector
- Chapters drawer
- Audio track selector
- Aspect Ratio menu
- Sleep Timer (15m, 30m, 45m, 60m, end of video)
- A-B Repeat loop tool
- Frame-by-frame navigation (1/30s stepping)
- Screenshot capture
- Video repeat loop
- Playback diagnostics & statistics

### E. Animation & Watermark Configuration
- **Watermark Animation Style**: `fade-slide` (default), `fade`, `slide`, or `glow`.
- **Watermark Opacity**: Permitted safe range from 15% (subtle) to 85% (vivid).
- **Movement Interval**: Set time between corner shifts (6s, 12s, 18s, 25s).
- **Animation Presets**: Choose global UI physics from `cinematic`, `smooth`, `instant`, `spring`, or `subtle`.

### F. Playback Preferences
- **Autoplay**: Attempt inline playback on page mount.
- **Start Muted**: Required by browsers to allow autoplay with audio.
- **Auto-Resume**: Remembers timestamp in `localStorage` across page reloads.

### G. Performance & Mobile Optimizations
- **Performance Mode**: `high-quality` (full liquid glass shaders), `balanced`, or `low-resource` (disables blur for low-end mobile/battery saving).
- **Lazy Load Streaming**: Downloads Hls.js or Dash.js only when a compatible manifest is requested.

---

## 4. Code Generation Engine

Clicking on the code tabs in the bottom right panel automatically produces ready-to-use integration code:

| Tab | Output Format | Usage |
| :--- | :--- | :--- |
| **JSON** | Formatted JSON | Can be saved to disk and loaded via API. |
| **JavaScript** | ES Module import | Standard modern web app initialization. |
| **HTML** | Standalone HTML document | Full page ready to paste into static sites. |
| **CSS** | CSS variable overrides | Customize frosted glass colors and blurs. |
| **React** | `YogiPlayer.jsx` | React functional component with lifecycle hooks. |
| **Vue 3** | `YogiPlayer.vue` | Vue 3 `<script setup>` single-file component. |
| **Python** | `server.py` | Python Flask / Pydroid 3 backend with byte ranges. |

---

## 5. Reusable Presets

Studio includes 5 one-click presets:
1. **🎬 Cinematic Liquid Glass**: Default Apple-inspired glass dock with full controls.
2. **🖤 Cinematic OLED Pure Black**: Deep `#000000` background with glowing blue accents.
3. **📱 Mobile Touch-First**: Large touch-friendly targets, centered seek buttons, gesture HUDs.
4. **⚡ Ultra Minimalist**: Compact seekbar with distraction-free playback.
5. **📡 Streaming Pro**: Configured for HLS/DASH adaptive bitrate live broadcasts.
