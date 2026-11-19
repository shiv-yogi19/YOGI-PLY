# Yogi_PLY — Animation & Transition Engine Reference (40 Distinct Variants)

**Creator**: Created By Shiv Yogi  
**Tagline**: One Player. Every Website.  
**Version**: 1.0.0  

---

## 1. Overview

Yogi_PLY features a dedicated high-performance animation and transition architecture specifically engineered for Apple-inspired liquid glass aesthetics.

Key architectural principles:
- **100% GPU Hardware Accelerated**: Only `transform` and `opacity` are animated to prevent layout thrashing and reflows.
- **Spring & Fluid Easing**: Custom cubic-bezier physics (`cubic-bezier(0.16, 1, 0.3, 1)` and `cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Reduced Motion Aware**: Fully respects `@media (prefers-reduced-motion: reduce)` by bypassing keyframes and setting instant transitions.
- **Configurable Presets**: Selectable physics via Yogi_PLY Studio (`cinematic`, `smooth`, `instant`, `spring`, `subtle`).

---

## 2. All 40 Distinct Animation Variants

| # | Animation Variant | CSS Keyframe / Class | Description |
|---|---|---|---|
| 1 | **Player Entrance** | `yogi-player-enter` / `.yogi-anim-player-enter` | Smooth scale-up and fade with 8px backdrop blur clearance. |
| 2 | **Player Exit** | `yogi-player-exit` / `.yogi-anim-player-exit` | Graceful scale-down and blur dissipation. |
| 3 | **Play Button Tap** | `yogi-play-tap` / `.yogi-anim-play-tap` | Elastic spring compression and bounce feedback. |
| 4 | **Pause Button Tap** | `yogi-pause-tap` / `.yogi-anim-pause-tap` | Subtle tactile compression on pause trigger. |
| 5 | **Button Press** | `yogi-btn-press` / `.yogi-anim-press` | Universal micro-interaction press feedback. |
| 6 | **Button Glow** | `yogi-btn-glow` / `.yogi-anim-glow` | Radiant ambient glow radiating from button border. |
| 7 | **Dock Entrance** | `yogi-dock-enter` / `.yogi-anim-dock-enter` | Smooth slide-up from bottom with liquid deceleration. |
| 8 | **Dock Exit** | `yogi-dock-exit` / `.yogi-anim-dock-exit` | Slide-down auto-hide transition. |
| 9 | **Dock Auto-Hide** | `.yogi-ply-controls-hidden` | Coordinated fading of dock, top bar, and center controls. |
| 10 | **Three-Dot Interaction** | `yogi-more-tap` / `.yogi-anim-more-tap` | 90-degree rotational morph on three-dot button tap. |
| 11 | **Menu Expand** | `yogi-menu-expand` / `.yogi-anim-menu-expand` | Liquid glass panel expansion with blur unmasking. |
| 12 | **Menu Collapse** | `yogi-menu-collapse` / `.yogi-anim-menu-collapse` | Fluid contraction and fade into dock. |
| 13 | **Settings Panel Enter** | `yogi-panel-enter` / `.yogi-anim-panel-enter` | Frosted drawer sliding into view. |
| 14 | **Settings Panel Exit** | `yogi-panel-exit` / `.yogi-anim-panel-exit` | Drawer exit with fade-out. |
| 15 | **Seekbar Interaction** | `yogi-seek-pulse` / `.yogi-anim-seek-active` | Thumb scrubber expansion with ambient glow. |
| 16 | **Seekbar Hover Preview** | `yogi-seek-preview-enter` / `.yogi-anim-seek-preview` | Tooltip bounce and timestamp popover. |
| 17 | **Volume Slider Slide** | `yogi-volume-slide` / `.yogi-anim-volume-slide` | Horizontal glass track expansion on hover. |
| 18 | **Loading Spinner** | `yogi-spinner-rot` / `.yogi-anim-spinner` | Continuous 360-degree rotation of SVG ring. |
| 19 | **Buffering Pulse** | `yogi-buffering-pulse` / `.yogi-anim-buffering` | Gentle breathing pulse during network stalls. |
| 20 | **Subtitle Entrance** | `yogi-sub-enter` / `.yogi-anim-sub-enter` | Text cue pop-in with soft upward drift. |
| 21 | **Subtitle Exit** | `yogi-sub-exit` / `.yogi-anim-sub-exit` | Fast opacity fade-out on cue completion. |
| 22 | **Playlist Drawer Enter**| `yogi-playlist-enter` / `.yogi-anim-playlist-enter` | Lateral slide-in from right edge. |
| 23 | **Playlist Drawer Exit** | `yogi-playlist-exit` / `.yogi-anim-playlist-exit` | Lateral slide-out to right edge. |
| 24 | **Theme Transition** | `.yogi-anim-theme-transition` | Smooth 0.4s interpolation of CSS custom properties. |
| 25 | **Fullscreen Transition** | `.yogi-anim-fullscreen-enter` | Border-radius flattening and viewport filling. |
| 26 | **Theatre Transition** | `.yogi-anim-theatre-transition` | Cinematic widening of player stage. |
| 27 | **Double-Tap Ripple** | `yogi-doubletap-ripple` / `.yogi-anim-doubletap-ripple` | Circular ripple wave on double-tap seek areas. |
| 28 | **Forward Seek Feedback**| `yogi-seek-feedback` / `.yogi-anim-fwd-feedback` | +10s chevron badge pulse and fade. |
| 29 | **Backward Seek Feedback**| `yogi-seek-feedback` / `.yogi-anim-back-feedback` | -10s chevron badge pulse and fade. |
| 30 | **Gesture HUD Pop** | `yogi-hud-pop` / `.yogi-anim-gesture-hud` | Centered volume / brightness HUD popup. |
| 31 | **Watermark Shift** | `yogi-watermark-move` / `.yogi-anim-watermark` | Coordinate relocation with collision avoidance. |
| 32 | **Watermark Drift** | `yogi-watermark-drift` / `.yogi-anim-watermark-drift` | Subtle ambient floating movement. |
| 33 | **Tooltip Entrance** | `yogi-tooltip-enter` / `.yogi-anim-tooltip-enter` | Scale-up tooltip display above buttons. |
| 34 | **Error Bounce** | `yogi-error-bounce` / `.yogi-anim-error-bounce` | Elastic card entrance for diagnostic screens. |
| 35 | **Quality Selection** | `yogi-select-feedback` / `.yogi-anim-select-feedback` | Accent flash on quality level selection. |
| 36 | **Speed Selection** | `yogi-select-feedback` / `.yogi-anim-speed-feedback` | Tactile row highlight on playback speed change. |
| 37 | **Screenshot Flash** | `yogi-screenshot-flash` / `.yogi-anim-screenshot-flash` | Camera shutter screen flash on screenshot capture. |
| 38 | **Chapter Selection** | `yogi-select-feedback` / `.yogi-anim-chapter-feedback` | Row flash when navigating to chapter. |
| 39 | **PiP Feedback** | `yogi-pip-feedback` / `.yogi-anim-pip-feedback` | Frame contraction indicator on PiP enter. |
| 40 | **HUD Pulse** | `yogi-hud-pulse` / `.yogi-anim-hud-pulse` | Percentage value pulse in gesture indicators. |

---

## 3. Programmatic Animation Engine API

You can trigger any animation variant on any element using `player.animations`:

```javascript
// Trigger a named animation with automatic class cleanup
player.animations.trigger(element, 'play-tap', 350);

// Flash the camera screenshot shutter overlay
player.animations.flashScreenshot();

// Switch animation preset dynamically
player.animations.setPreset('spring');
```

---

## 4. Animation Presets

| Preset | Duration Factor | Easing Curve | Character |
| :--- | :---: | :--- | :--- |
| `cinematic` | 1.0x | `cubic-bezier(0.16, 1, 0.3, 1)` | Balanced, luxurious, Apple-inspired |
| `smooth` | 1.3x | `cubic-bezier(0.25, 1, 0.5, 1)` | Gentle, soft, relaxed transitions |
| `instant` | 0.2x | `linear` | Ultra-fast, minimal latency |
| `spring` | 1.1x | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful, tactile, elastic overshoot |
| `subtle` | 0.8x | `ease-out` | Low intensity, unobtrusive |
