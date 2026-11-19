/**
 * Yogi_PLY Studio - Configuration Presets
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

export const STUDIO_PRESETS = {
  'cinematic-glass': {
    name: 'Cinematic Liquid Glass (Default)',
    description: 'Apple-inspired translucent frosted glass dock with dynamic highlights, ambient blur, and full controls.',
    config: {
      theme: 'liquid-glass',
      layout: 'cinematic',
      aspectRatio: '16:9',
      title: 'Cinematic Video Experience',
      autoplay: false,
      muted: false,
      loop: false,
      volume: 1,
      animation: {
        preset: 'cinematic',
        intensity: 'medium'
      },
      watermark: {
        opacity: 0.28,
        interval: 12000,
        movement: true,
        animationStyle: 'fade-slide'
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
        screenshot: true,
        loop: true,
        diagnostics: true
      },
      performance: {
        mode: 'high-quality',
        lazyLoadStreaming: true,
        cacheResume: true
      }
    }
  },

  'oled-dark': {
    name: 'Cinematic OLED Pure Black',
    description: 'Deep #000000 background with high-contrast sharp glass edges optimized for modern OLED screens.',
    config: {
      theme: 'cinematic-oled',
      layout: 'cinematic',
      aspectRatio: '16:9',
      title: 'OLED Master Showcase',
      autoplay: false,
      muted: false,
      loop: false,
      volume: 1,
      animation: {
        preset: 'smooth',
        intensity: 'soft'
      },
      watermark: {
        opacity: 0.35,
        interval: 10000,
        movement: true,
        animationStyle: 'glow'
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
        screenshot: true,
        loop: true,
        diagnostics: true
      },
      performance: {
        mode: 'balanced',
        lazyLoadStreaming: true,
        cacheResume: true
      }
    }
  },

  'mobile-first': {
    name: 'Mobile Touch-First',
    description: 'Large touch-friendly buttons, centered 10s seek buttons, vertical gesture HUDs, and streamlined controls.',
    config: {
      theme: 'liquid-glass',
      layout: 'mobile',
      aspectRatio: '16:9',
      title: 'Mobile Stream',
      autoplay: false,
      muted: false,
      loop: false,
      volume: 1,
      enableSwipeGestures: true,
      animation: {
        preset: 'spring',
        intensity: 'high'
      },
      watermark: {
        opacity: 0.25,
        interval: 15000,
        movement: true,
        animationStyle: 'fade-slide'
      },
      controls: {
        playPause: true,
        seek10: true,
        progressBar: true,
        volume: false,
        time: true,
        fullscreen: true,
        theatre: false,
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
        abRepeat: false,
        frameStep: false,
        screenshot: false,
        loop: true,
        diagnostics: true
      },
      performance: {
        mode: 'balanced',
        lazyLoadStreaming: true,
        cacheResume: true
      }
    }
  },

  'ultra-minimal': {
    name: 'Ultra Minimalist',
    description: 'Clean distraction-free interface with compact seekbar and essential playback controls only.',
    config: {
      theme: 'dark',
      layout: 'compact',
      aspectRatio: '16:9',
      title: 'Minimal Player',
      autoplay: false,
      muted: false,
      loop: false,
      volume: 1,
      animation: {
        preset: 'subtle',
        intensity: 'low'
      },
      watermark: {
        opacity: 0.2,
        interval: 16000,
        movement: true,
        animationStyle: 'fade'
      },
      controls: {
        playPause: true,
        seek10: false,
        progressBar: true,
        volume: true,
        time: true,
        fullscreen: true,
        theatre: false,
        pip: false,
        moreMenu: true
      },
      features: {
        playbackSpeed: true,
        quality: true,
        subtitles: false,
        chapters: false,
        audioTrack: false,
        aspectRatio: false,
        sleepTimer: false,
        abRepeat: false,
        frameStep: false,
        screenshot: false,
        loop: false,
        diagnostics: false
      },
      performance: {
        mode: 'low-resource',
        lazyLoadStreaming: true,
        cacheResume: false
      }
    }
  },

  'streaming-pro': {
    name: 'Streaming & Live Broadcast Pro',
    description: 'Engineered for HLS & MPEG-DASH adaptive bitrate delivery with audio switcher and stats diagnostics.',
    config: {
      theme: 'liquid-glass',
      layout: 'cinematic',
      aspectRatio: '16:9',
      title: 'Live Adaptive Stream',
      autoplay: true,
      muted: true,
      loop: false,
      volume: 1,
      animation: {
        preset: 'cinematic',
        intensity: 'medium'
      },
      watermark: {
        opacity: 0.3,
        interval: 12000,
        movement: true,
        animationStyle: 'fade-slide'
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
        screenshot: true,
        loop: true,
        diagnostics: true
      },
      performance: {
        mode: 'high-quality',
        lazyLoadStreaming: false,
        cacheResume: true
      }
    }
  }
};
