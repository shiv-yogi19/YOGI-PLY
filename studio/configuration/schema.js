/**
 * Yogi_PLY Studio - Configuration Schema & Validation Engine
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

export const PERMANENT_BRANDING = {
  creator: 'Created By Shiv Yogi',
  text: 'Created By Shiv Yogi',
  product: 'Yogi_PLY',
  tagline: 'One Player. Every Website.'
};

export const VALID_THEMES = ['liquid-glass', 'dark', 'light', 'cinematic-oled'];
export const VALID_LAYOUTS = ['cinematic', 'standard', 'compact', 'mobile', 'desktop'];
export const VALID_ASPECT_RATIOS = ['16:9', '4:3', '1:1', '21:9', 'Original', 'Fill (Cover)', 'Stretch'];
export const VALID_ANIMATION_PRESETS = ['cinematic', 'smooth', 'instant', 'subtle', 'spring'];
export const VALID_WATERMARK_ANIMATIONS = ['fade-slide', 'fade', 'slide', 'glow'];
export const VALID_PERFORMANCE_MODES = ['high-quality', 'balanced', 'low-resource'];

export const DEFAULT_CONFIG = {
  source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  poster: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
  title: 'Yogi_PLY Cinematic Player',
  theme: 'liquid-glass',
  layout: 'cinematic',
  aspectRatio: '16:9',
  autoplay: false,
  muted: false,
  loop: false,
  volume: 1,
  showBackButton: false,
  enableSwipeGestures: 'fullscreen-only',
  watermark: {
    enabled: true,
    text: PERMANENT_BRANDING.text,
    opacity: 0.28,
    interval: 12000,
    movement: true,
    animationStyle: 'fade-slide'
  },
  animation: {
    preset: 'cinematic',
    intensity: 'medium'
  },
  controls: {
    playPause: true,
    seek10: true,
    progressBar: true,
    volume: true,
    time: true,
    fullscreen: true,
    theatre: true,
    pip: true,
    moreMenu: true
  },
  features: {
    playbackSpeed: true,
    quality: true,
    subtitles: true,
    chapters: true,
    audioTrack: true,
    aspectRatio: true,
    sleepTimer: true,
    abRepeat: true,
    frameStep: true,
    subtitleDelay: true,
    audioDelay: true,
    loop: true,
    screenshot: true,
    pip: true,
    theatre: true,
    diagnostics: true
  },
  subtitles: [
    { label: 'English', srclang: 'en', default: true }
  ],
  performance: {
    mode: 'high-quality',
    lazyLoadStreaming: true,
    cacheResume: true
  }
};

/**
 * Validate and sanitize configuration
 * @param {Object} rawConfig
 * @returns {{ valid: boolean, errors: string[], sanitizedConfig: Object }}
 */
export function validateConfiguration(rawConfig = {}) {
  const errors = [];
  const sanitized = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

  if (typeof rawConfig !== 'object' || rawConfig === null) {
    errors.push('Configuration must be a valid non-null object.');
    return { valid: false, errors, sanitizedConfig: sanitized };
  }

  // Theme
  if (rawConfig.theme) {
    if (VALID_THEMES.includes(rawConfig.theme)) {
      sanitized.theme = rawConfig.theme;
    } else {
      errors.push(`Invalid theme "${rawConfig.theme}". Valid options: ${VALID_THEMES.join(', ')}.`);
    }
  }

  // Layout
  if (rawConfig.layout) {
    if (VALID_LAYOUTS.includes(rawConfig.layout)) {
      sanitized.layout = rawConfig.layout;
    } else {
      errors.push(`Invalid layout "${rawConfig.layout}". Valid options: ${VALID_LAYOUTS.join(', ')}.`);
    }
  }

  // Aspect ratio
  if (rawConfig.aspectRatio) {
    if (VALID_ASPECT_RATIOS.includes(rawConfig.aspectRatio)) {
      sanitized.aspectRatio = rawConfig.aspectRatio;
    }
  }

  // Source & Poster
  if (typeof rawConfig.source === 'string') {
    sanitized.source = rawConfig.source.trim();
  }
  if (typeof rawConfig.poster === 'string') {
    sanitized.poster = rawConfig.poster.trim();
  }
  if (typeof rawConfig.title === 'string') {
    sanitized.title = rawConfig.title.trim();
  }

  // Booleans & Numbers
  if (typeof rawConfig.autoplay === 'boolean') sanitized.autoplay = rawConfig.autoplay;
  if (typeof rawConfig.muted === 'boolean') sanitized.muted = rawConfig.muted;
  if (typeof rawConfig.loop === 'boolean') sanitized.loop = rawConfig.loop;
  if (typeof rawConfig.volume === 'number') sanitized.volume = Math.max(0, Math.min(1, rawConfig.volume));
  if (typeof rawConfig.showBackButton === 'boolean') sanitized.showBackButton = rawConfig.showBackButton;

  // PERMANENT WATERMARK ENFORCEMENT
  // Even if rawConfig passed watermark: false or custom text, it is strictly ignored!
  sanitized.watermark.enabled = true;
  sanitized.watermark.text = PERMANENT_BRANDING.text;

  if (rawConfig.watermark && typeof rawConfig.watermark === 'object') {
    if (typeof rawConfig.watermark.opacity === 'number') {
      sanitized.watermark.opacity = Math.max(0.15, Math.min(0.85, rawConfig.watermark.opacity));
    }
    if (rawConfig.watermark.interval) {
      sanitized.watermark.interval = Math.max(3000, Number(rawConfig.watermark.interval));
    }
    if (typeof rawConfig.watermark.movement === 'boolean') {
      sanitized.watermark.movement = rawConfig.watermark.movement;
    }
    if (VALID_WATERMARK_ANIMATIONS.includes(rawConfig.watermark.animationStyle)) {
      sanitized.watermark.animationStyle = rawConfig.watermark.animationStyle;
    }
  }

  // Animation settings
  if (rawConfig.animation && typeof rawConfig.animation === 'object') {
    if (VALID_ANIMATION_PRESETS.includes(rawConfig.animation.preset)) {
      sanitized.animation.preset = rawConfig.animation.preset;
    }
  }

  // Controls settings
  if (rawConfig.controls && typeof rawConfig.controls === 'object') {
    Object.keys(sanitized.controls).forEach((key) => {
      if (typeof rawConfig.controls[key] === 'boolean') {
        sanitized.controls[key] = rawConfig.controls[key];
      }
    });
  }

  // Features settings
  if (rawConfig.features && typeof rawConfig.features === 'object') {
    Object.keys(sanitized.features).forEach((key) => {
      if (typeof rawConfig.features[key] === 'boolean') {
        sanitized.features[key] = rawConfig.features[key];
      }
    });
  }

  // Performance settings
  if (rawConfig.performance && typeof rawConfig.performance === 'object') {
    if (VALID_PERFORMANCE_MODES.includes(rawConfig.performance.mode)) {
      sanitized.performance.mode = rawConfig.performance.mode;
    }
    if (typeof rawConfig.performance.lazyLoadStreaming === 'boolean') {
      sanitized.performance.lazyLoadStreaming = rawConfig.performance.lazyLoadStreaming;
    }
    if (typeof rawConfig.performance.cacheResume === 'boolean') {
      sanitized.performance.cacheResume = rawConfig.performance.cacheResume;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedConfig: sanitized
  };
}
