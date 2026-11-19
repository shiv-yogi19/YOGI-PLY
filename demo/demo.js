/**
 * Yogi_PLY - Interactive Live Showcase Script
 * Created By Shiv Yogi
 */

import { Player, init, icons } from '../dist/yogi-ply.esm.js';

// Test media sources from reliable open-source media
const SOURCES = {
  bbb: {
    name: 'Big Buck Bunny (MP4)',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
    sources: [
      { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', label: '1080p' },
      { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', label: '720p' },
      { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', label: '480p' }
    ]
  },
  sintel: {
    name: 'Sintel Open Movie (MP4)',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1200&q=80',
    sources: [
      { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', label: '1080p' }
    ]
  },
  webm: {
    name: 'WebM Video (VP9/Opus)',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1200&q=80'
  },
  unsupported: {
    name: 'Unsupported Format (AVI Diagnostic)',
    src: 'https://example.com/legacy_video.avi',
    poster: ''
  },
  hls: {
    name: 'Tears of Steel (HLS .m3u8)',
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80'
  },
  dash: {
    name: 'Akamai Test Stream (DASH .mpd)',
    src: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80'
  },
  youtube: {
    name: 'YouTube Embed Adapter',
    src: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    poster: ''
  },
  vimeo: {
    name: 'Vimeo Embed Adapter',
    src: 'https://vimeo.com/76979871',
    poster: ''
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const logTerminal = document.querySelector('#event-log');

  function logEvent(name, detail = '') {
    if (!logTerminal) return;
    const now = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'demo-log-entry';
    const detailStr = detail && typeof detail === 'object' ? JSON.stringify(detail) : String(detail);
    entry.innerHTML = `<span class="demo-log-time">[${now}]</span> <span class="demo-log-name">${name}</span> ${detailStr ? `— ${detailStr}` : ''}`;
    logTerminal.prepend(entry);

    // Keep max 50 entries
    if (logTerminal.children.length > 50) {
      logTerminal.removeChild(logTerminal.lastChild);
    }
  }

  // 1. Initialize Primary Hero Player
  const heroPlayer = new Player('#hero-player', {
    source: SOURCES.bbb.src,
    poster: SOURCES.bbb.poster,
    sources: SOURCES.bbb.sources,
    theme: 'liquid-glass',
    watermark: {
      enabled: true,
      text: 'Created By Shiv Yogi',
      opacity: 0.28,
      interval: 10000,
      movement: true,
      animationStyle: 'fade-slide'
    },
    subtitles: [
      { id: 'en', label: 'English', src: './sample-en.vtt', srclang: 'en', default: true },
      { id: 'es', label: 'Español', src: './sample-es.vtt', srclang: 'es' },
      { id: 'hi', label: 'Hindi (SRT)', src: './sample-hi.srt', srclang: 'hi' }
    ],
    chapters: [
      { start: 0, end: 20, title: 'Introduction' },
      { start: 20, end: 60, title: 'Forest Life' },
      { start: 60, end: 120, title: 'The Encounter' },
      { start: 120, end: 180, title: 'Resolution' }
    ],
    skipIntro: { start: 0, end: 15 },
    skipOutro: { start: 580, end: 596 },
    playlist: [
      {
        title: 'Big Buck Bunny (Animation)',
        src: SOURCES.bbb.src,
        poster: SOURCES.bbb.poster,
        duration: '09:56'
      },
      {
        title: 'Sintel (Fantasy Drama)',
        src: SOURCES.sintel.src,
        poster: SOURCES.sintel.poster,
        duration: '00:52'
      },
      {
        title: 'Tears of Steel (Sci-Fi HLS)',
        src: SOURCES.hls.src,
        poster: SOURCES.hls.poster,
        duration: '12:14'
      }
    ]
  });

  // Attach event logging
  [
    'ready', 'play', 'pause', 'seeking', 'seeked',
    'volumechange', 'qualitychange', 'ratechange',
    'fullscreenchange', 'theatrechange', 'ended', 'error',
    'watermarkchange', 'themechange'
  ].forEach((evt) => {
    heroPlayer.on(evt, (data) => logEvent(evt, data));
  });

  // 2. Source Pills Switcher
  const pills = document.querySelectorAll('.demo-pill');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('demo-pill-active'));
      pill.classList.add('demo-pill-active');

      const key = pill.dataset.source;
      const srcObj = SOURCES[key];
      if (srcObj) {
        logEvent('Switching Source', srcObj.name);
        heroPlayer.setPoster(srcObj.poster || '');
        if (srcObj.sources) {
          heroPlayer.options.sources = srcObj.sources;
        }
        heroPlayer.setSource(srcObj.src).then(() => {
          heroPlayer.play().catch(() => {});
        });
      }
    });
  });

  // 3. Watermark Interactive Visual Controls
  const wmAnim = document.querySelector('#wm-anim');
  const wmOpacity = document.querySelector('#wm-opacity');
  const wmOpacityVal = document.querySelector('#wm-opacity-val');
  const wmInterval = document.querySelector('#wm-interval');

  if (wmAnim) {
    wmAnim.addEventListener('change', (e) => {
      heroPlayer.setWatermark({ animationStyle: e.target.value });
      logEvent('watermark:animationStyle', e.target.value);
    });
  }

  if (wmOpacity) {
    wmOpacity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (wmOpacityVal) wmOpacityVal.textContent = `${Math.round(val * 100)}%`;
      heroPlayer.setWatermark({ opacity: val });
    });
  }

  if (wmInterval) {
    wmInterval.addEventListener('change', (e) => {
      const intervalMs = parseInt(e.target.value, 10);
      heroPlayer.setWatermark({ interval: intervalMs });
      logEvent('watermark:interval', `${intervalMs}ms`);
    });
  }

  // 4. Theme Selector
  const themeBtns = document.querySelectorAll('[data-theme-btn]');
  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      themeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.dataset.themeBtn;
      heroPlayer.setTheme(theme);
    });
  });

  // 5. Playback Speed Selector
  const speedBtns = document.querySelectorAll('[data-speed-btn]');
  speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      speedBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const speed = parseFloat(btn.dataset.speedBtn);
      heroPlayer.setPlaybackRate(speed);
    });
  });

  // 6. Action API Buttons
  document.querySelector('#btn-api-play')?.addEventListener('click', () => heroPlayer.play());
  document.querySelector('#btn-api-pause')?.addEventListener('click', () => heroPlayer.pause());
  document.querySelector('#btn-api-toggle')?.addEventListener('click', () => heroPlayer.toggle());
  document.querySelector('#btn-api-restart')?.addEventListener('click', () => heroPlayer.restart());
  document.querySelector('#btn-api-mute')?.addEventListener('click', () => {
    if (heroPlayer.isMuted()) heroPlayer.unmute();
    else heroPlayer.mute();
  });
  document.querySelector('#btn-api-loop')?.addEventListener('click', () => {
    heroPlayer.toggleLoop();
    logEvent('Loop Toggled', heroPlayer.isLoop());
  });
  document.querySelector('#btn-api-fullscreen')?.addEventListener('click', () => heroPlayer.toggleFullscreen());
  document.querySelector('#btn-api-theatre')?.addEventListener('click', () => heroPlayer.toggleTheatre());
  document.querySelector('#btn-api-pip')?.addEventListener('click', () => heroPlayer.togglePip());
  document.querySelector('#btn-api-snap')?.addEventListener('click', () => {
    heroPlayer.captureScreenshot()
      .then((res) => logEvent('Screenshot Captured', res.filename))
      .catch((err) => logEvent('Screenshot Error', err.message));
  });

  // 7. Multi-Instance Isolated Secondary Player
  const secondPlayer = new Player('#secondary-player', {
    source: SOURCES.sintel.src,
    poster: SOURCES.sintel.poster,
    theme: 'dark',
    watermark: {
      enabled: true,
      text: 'Instance #2 • Shiv Yogi',
      opacity: 0.35,
      interval: 8000
    }
  });

  // 8. Copy Code Buttons
  document.querySelectorAll('.demo-copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.parentElement.querySelector('code');
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.innerText).then(() => {
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = original), 2000);
        });
      }
    });
  });
});
