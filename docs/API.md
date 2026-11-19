# Yogi_PLY Public API Reference

**Product:** Yogi_PLY — Universal Cinematic Liquid Glass Video Player Framework  
**Creator:** Created By Shiv Yogi  
**Tagline:** One Player. Every Website.  
**License:** MIT  

---

## Table of Contents
1. [Instantiation & Global Helpers](#instantiation--global-helpers)
2. [Playback Control Methods](#playback-control-methods)
3. [Audio & Volume Control](#audio--volume-control)
4. [Timeline, Seeking & Chapters](#timeline-seeking--chapters)
5. [Advanced Playback Methods](#advanced-playback-methods)
6. [Viewport & Layout Methods](#viewport--layout-methods)
7. [Subtitles Management](#subtitles-management)
8. [Permanent Creator Branding Policy](#permanent-creator-branding-policy)
9. [Animation Engine](#animation-engine)
10. [Theme Customization](#theme-customization)
11. [Diagnostics & State Accessors](#diagnostics--state-accessors)
12. [Event Subscription System](#event-subscription-system)
13. [Teardown & Memory Cleanup](#teardown--memory-cleanup)

---

## Instantiation & Global Helpers

### `new YogiPLY.Player(target, options)`
Initializes a new isolated Yogi_PLY video player instance.

- **`target`** (`string | HTMLElement`): CSS selector (e.g. `'#my-player'`) or DOM element reference.
- **`options`** (`PlayerOptions`): Configuration options.

```javascript
const player = new YogiPLY.Player('#video-container', {
  source: 'https://example.com/video.mp4',
  poster: 'https://example.com/cover.jpg',
  title: 'Cinematic Movie',
  theme: 'liquid-glass',
  layout: 'cinematic',
  aspectRatio: '16:9',
  autoplay: false,
  muted: false,
  loop: false,
  volume: 1.0,
  watermark: {
    opacity: 0.28,
    interval: 12000,
    movement: true,
    animationStyle: 'fade-slide'
  },
  features: {
    playbackSpeed: true,
    quality: true,
    subtitles: true,
    chapters: true,
    aspectRatio: true,
    sleepTimer: true,
    abRepeat: true,
    frameStep: true,
    diagnostics: true
  }
});
```

### `YogiPLY.init(target, options)`
Helper to initialize one or multiple player instances matching selector or NodeList.
```javascript
const player = YogiPLY.init('#single-player', options);
const players = YogiPLY.init('.multi-player', options);
```

### `YogiPLY.autoInit()`
Scans DOM for uninitialized elements with class `.yogi-ply` and initializes them reading HTML `data-*` attributes. Runs automatically on `DOMContentLoaded`.

---

## Playback Control Methods

### `player.play(): Promise<void>`
Begins media playback. Handles browser autoplay policies with muted fallback when configured.

### `player.pause(): void`
Pauses the active video playback.

### `player.togglePlay(): void` / `player.toggle(): void`
Toggles between playing and paused states.

### `player.restart(): Promise<void>`
Rewinds back to timestamp `0` and plays.

### `player.seek(seconds: number): void`
Seeks to the given timestamp in seconds.

### `player.setPlaybackRate(rate: number): void`
Sets playback speed multiplier (`0.25` to `3.0`).

### `player.setLoop(loop: boolean): void`
Enables or disables continuous single-video repeat.

### `player.toggleLoop(): void`
Toggles the loop repeat state.

### `player.setSource(url: string): Promise<void>`
Switches video source dynamically. Supports MP4, WebM, HLS (`.m3u8`), DASH (`.mpd`), YouTube, and Vimeo.

### `player.setPoster(url: string): void`
Updates cover poster image.

### `player.setTitle(title: string): void`
Updates video title displayed in top utility bar and Media Session API.

---

## Audio & Volume Control

### `player.setVolume(volume: number): void`
Sets volume clamped between `0.0` (silent) and `1.0` (maximum).

### `player.mute(): void`
Mutes audio while preserving previous volume level.

### `player.unmute(): void`
Unmutes audio.

### `player.setAudioDelay(seconds: number): void`
Sets audio delay offset for synchronization.

---

## Timeline, Seeking & Chapters

### `player.setChapters(chapters: Chapter[]): Chapter[]`
Sets chapter marks. Each chapter requires `{ start: number, end: number, title: string }`.

### `player.getChapters(): Chapter[]`
Returns list of configured chapters.

### `player.getCurrentChapter(): { chapter: Chapter, index: number } | null`
Returns active chapter based on current playback timestamp.

### `player.nextChapter(): Chapter | null`
Jumps to next chapter start time.

### `player.prevChapter(): Chapter | null`
Jumps to previous chapter start time.

### `player.seekToChapter(index: number): Chapter | null`
Jumps directly to chapter by index.

---

## Advanced Playback Methods

### `player.setAspectRatio(ratio: string): void`
Switches video aspect ratio mode (`16:9`, `4:3`, `1:1`, `21:9`, `Fill (Cover)`, `Stretch`).

### `player.setSleepTimer(minutesOrType: number | 'off' | 'end'): void`
Schedules an automatic sleep timer. After the specified minutes (or at the end of the video), playback pauses.

### `player.getSleepTimer(): number | 'off' | 'end'`
Returns active sleep timer configuration.

### `player.setRepeatPointA(time?: number): void`
Sets Point A for the A-B repeat loop (defaults to current time).

### `player.setRepeatPointB(time?: number): void`
Sets Point B for the A-B repeat loop. Playback will loop continuously between Point A and Point B.

### `player.clearRepeat(): void`
Clears active A-B repeat loop.

### `player.stepFrame(direction: number = 1): void`
Steps exactly 1 frame forward (`+1`) or backward (`-1`) at 1/30 second increments.

---

## Viewport & Layout Methods

### `player.requestFullscreen(): Promise<void>` / `player.enterFullscreen()`
Requests browser fullscreen mode.

### `player.exitFullscreen(): Promise<void>`
Exits fullscreen mode.

### `player.toggleFullscreen(): void`
Toggles fullscreen mode.

### `player.toggleTheatre(): void`
Toggles wide theatre mode.

### `player.togglePip(): Promise<void>`
Toggles native browser Picture-in-Picture.

### `player.captureScreenshot(filename?: string): Promise<{ dataUrl: string, blob: Blob, filename: string }>`
Captures current video frame as high-resolution PNG image with flash animation feedback.

---

## Subtitles Management

### `player.setSubtitle(trackId: string): void`
Switches subtitle track by ID, or `'off'` to disable subtitles.

### `player.setSubtitleDelay(seconds: number): void`
Synchronizes subtitle cue timing (+/- seconds).

### `player.getSubtitles(): SubtitleTrack[]`
Returns array of available subtitle tracks.

---

## Permanent Creator Branding Policy

### Mandatory Watermark Signature: `Created By Shiv Yogi`
- The watermark text is permanently fixed to: **`Created By Shiv Yogi`**.
- It is always enabled and cannot be disabled, hidden, or removed.
- Attempts to pass `watermark: false` or alter `text` through constructor or `setWatermark` are strictly rejected.
- Only visual animation settings may be customized:

```javascript
player.setWatermark({
  animationStyle: 'fade-slide', // 'fade-slide' | 'fade' | 'slide' | 'glow'
  opacity: 0.28,                // Range: 0.15 to 0.85
  interval: 12000,              // Time between shifts in ms
  movement: true                // Enable periodic corner repositioning
});
```

---

## Animation Engine

### `player.animations.trigger(element, variantName, durationMs)`
Triggers one of the 40 built-in hardware-accelerated animations.

### `player.animations.setPreset(presetName)`
Sets global animation physics (`cinematic`, `smooth`, `instant`, `spring`, `subtle`).

---

## Diagnostics & State Accessors

### `player.getDiagnostics(): Object`
Returns real-time playback diagnostics:
```javascript
const stats = player.getDiagnostics();
console.log(stats.resolution);    // e.g. "1920x1080"
console.log(stats.bufferedRatio); // e.g. 0.85
console.log(stats.engine);        // e.g. "HLS.js Adaptive Bitrate"
```

### Getters
- `player.getCurrentTime(): number`
- `player.getDuration(): number`
- `player.getVolume(): number`
- `player.getPlaybackRate(): number`
- `player.isPaused(): boolean`
- `player.isMuted(): boolean`
- `player.isLoop(): boolean`
- `player.isFullscreen(): boolean`

---

## Event Subscription System

```javascript
// Register event listener
player.on('play', () => console.log('Playing'));

// One-time listener
player.once('canplay', () => console.log('Ready to play'));

// Unregister listener
player.off('play', handler);
```

### Supported Events
`ready`, `play`, `pause`, `timeupdate`, `seeking`, `seeked`, `volumechange`, `qualitychange`, `ratechange`, `fullscreenchange`, `theatrechange`, `subtitlechange`, `audiodelaychange`, `aspectratiochange`, `sleeptimertrigger`, `chapterchange`, `waiting`, `canplay`, `ended`, `error`, `watermarkchange`.

---

## Teardown & Memory Cleanup

### `player.destroy(): void`
Performs complete, leak-proof resource cleanup:
- Unregisters 100% of DOM, window, and document event listeners.
- Clears all timers (watermark, sleep timer, auto-hide).
- Destroys streaming adapters and WebWorkers.
- De-registers instance ID from `YogiPLY.instances`.
