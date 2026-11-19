/**
 * Yogi_PLY - Media Format and Codec Compatibility Diagnostic Engine
 * Created By Shiv Yogi
 */

export const FORMAT_DEFINITIONS = {
  // Web Standard Containers
  mp4: {
    container: 'MP4 (MPEG-4 Part 14)',
    mimes: [
      'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', // H.264 + AAC
      'video/mp4; codecs="av01.0.05M.08, mp4a.40.2"', // AV1 + AAC
      'video/mp4; codecs="hev1.1.6.L93.B0, mp4a.40.2"' // H.265 / HEVC
    ],
    webStandard: true,
    description: 'Widely supported across all modern mobile and desktop browsers.'
  },
  webm: {
    container: 'WebM',
    mimes: [
      'video/webm; codecs="vp9, opus"',
      'video/webm; codecs="vp8, vorbis"',
      'video/webm; codecs="av1, opus"'
    ],
    webStandard: true,
    description: 'Open web media format supported by Chrome, Firefox, Edge, and modern Safari.'
  },
  ogg: {
    container: 'Ogg Video (OGV/OGG)',
    mimes: ['video/ogg; codecs="theora, vorbis"'],
    webStandard: true,
    description: 'Open source format supported in Firefox, Chrome, and desktop platforms.'
  },
  ogv: {
    container: 'Ogg Video',
    mimes: ['video/ogg; codecs="theora, vorbis"'],
    webStandard: true,
    description: 'Open source format supported in Firefox, Chrome, and desktop platforms.'
  },
  mov: {
    container: 'Apple QuickTime Movie',
    mimes: ['video/quicktime', 'video/mp4'],
    webStandard: true,
    description: 'Supported natively on Apple Safari and iOS devices; may require H.264/AAC for Chromium.'
  },
  m4v: {
    container: 'Apple iTunes Video',
    mimes: ['video/x-m4v', 'video/mp4'],
    webStandard: true,
    description: 'MPEG-4 derivative, supported in Safari and modern browsers.'
  },
  m3u8: {
    container: 'HLS (HTTP Live Streaming)',
    mimes: ['application/vnd.apple.mpegurl', 'application/x-mpegURL'],
    streaming: true,
    description: 'Supported natively in Safari and via Hls.js in all MSE-compliant browsers.'
  },
  mpd: {
    container: 'MPEG-DASH',
    mimes: ['application/dash+xml'],
    streaming: true,
    description: 'Supported via Dash.js in all MSE-compliant browsers.'
  },

  // Legacy & Professional Broadcast Containers (Non-Web Standard)
  mkv: {
    container: 'Matroska Video (MKV)',
    mimes: ['video/x-matroska', 'video/webm'],
    webStandard: false,
    description: 'Flexible container. Plays if containing VP8/VP9/H.264 in Chromium; unsupported in Safari/Firefox without remuxing.'
  },
  avi: {
    container: 'Audio Video Interleave (AVI)',
    mimes: ['video/x-msvideo', 'video/avi'],
    webStandard: false,
    description: 'Legacy Microsoft container. Not supported natively by HTML5 web browsers.'
  },
  wmv: {
    container: 'Windows Media Video (WMV)',
    mimes: ['video/x-ms-wmv'],
    webStandard: false,
    description: 'Proprietary Microsoft codec. Not supported natively by HTML5 web browsers.'
  },
  flv: {
    container: 'Flash Video (FLV)',
    mimes: ['video/x-flv'],
    webStandard: false,
    description: 'Deprecated Adobe Flash format. Requires transcoding to MP4 for web playback.'
  },
  asf: {
    container: 'Advanced Systems Format (ASF)',
    mimes: ['video/x-ms-asf'],
    webStandard: false,
    description: 'Legacy Microsoft format. Not supported natively by web browsers.'
  },
  mxf: {
    container: 'Material Exchange Format (MXF)',
    mimes: ['application/mxf'],
    webStandard: false,
    description: 'Professional broadcast format. Not playable in HTML5 video elements.'
  },
  vob: {
    container: 'DVD Video Object (VOB / MPEG-2)',
    mimes: ['video/x-ms-vob', 'video/mpeg'],
    webStandard: false,
    description: 'DVD container with MPEG-2 codec. Not supported by HTML5 web standards.'
  },
  ts: {
    container: 'MPEG Transport Stream (.ts)',
    mimes: ['video/mp2t'],
    webStandard: false,
    description: 'Raw transport stream. Plays through HLS (.m3u8) playlists or Safari native HLS.'
  },
  mts: {
    container: 'AVCHD Transport Stream (.mts)',
    mimes: ['video/mp2t', 'video/mts'],
    webStandard: false,
    description: 'Camcorder format. Not supported natively by HTML5 video elements.'
  },
  m2ts: {
    container: 'Blu-ray BDAV Video (.m2ts)',
    mimes: ['video/mp2t'],
    webStandard: false,
    description: 'Blu-ray stream format. Not supported natively by web browsers.'
  },
  mpeg: {
    container: 'MPEG-1 / MPEG-2 Video',
    mimes: ['video/mpeg'],
    webStandard: false,
    description: 'Legacy MPEG codec. Broad browser support requires MP4 (H.264).'
  },
  mpg: {
    container: 'MPEG-1 / MPEG-2 Video',
    mimes: ['video/mpeg'],
    webStandard: false,
    description: 'Legacy MPEG codec. Broad browser support requires MP4 (H.264).'
  },
  '3gp': {
    container: '3GPP Mobile Video',
    mimes: ['video/3gpp', 'video/3gp'],
    webStandard: false,
    description: 'Legacy 3G mobile format. Partially supported on mobile Android; unsupported on desktop browsers.'
  },
  '3g2': {
    container: '3GPP2 Mobile Video',
    mimes: ['video/3gpp2'],
    webStandard: false,
    description: 'Legacy 3G mobile format. Requires conversion to MP4 for web compatibility.'
  }
};

/**
 * Extract file extension from URL
 * @param {string} url
 * @returns {string}
 */
export function extractExtension(url) {
  if (!url || typeof url !== 'string') return '';
  const cleanUrl = url.split('?')[0].split('#')[0];
  const parts = cleanUrl.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * Test whether the browser environment can play a given format
 * @param {string} url
 * @param {HTMLVideoElement} videoElement
 * @returns {Object}
 */
export function inspectMediaCompatibility(url, videoElement) {
  if (!url || typeof url !== 'string') {
    return {
      supported: false,
      extension: '',
      canPlay: '',
      reason: 'No media source URL provided.',
      recommendation: 'Provide a valid video URL.'
    };
  }

  // External video providers
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return {
      supported: true,
      type: 'external',
      provider: 'youtube',
      canPlay: 'probably',
      description: 'Handled via official YouTube IFrame Adapter.'
    };
  }

  if (url.includes('vimeo.com')) {
    return {
      supported: true,
      type: 'external',
      provider: 'vimeo',
      canPlay: 'probably',
      description: 'Handled via official Vimeo Player Adapter.'
    };
  }

  const ext = extractExtension(url);
  const def = FORMAT_DEFINITIONS[ext];

  // Streaming checks
  if (ext === 'm3u8') {
    const nativeSupport = videoElement && videoElement.canPlayType('application/vnd.apple.mpegurl');
    const hlsJsSupport = typeof window !== 'undefined' && ('MediaSource' in window || 'WebKitMediaSource' in window);
    const canPlayHls = Boolean(nativeSupport || hlsJsSupport);
    return {
      supported: canPlayHls,
      extension: 'm3u8',
      type: 'streaming',
      canPlay: canPlayHls ? 'probably' : '',
      description: 'HLS adaptive stream.',
      reason: canPlayHls ? null : 'Browser lacks MediaSource Extensions and native HLS support.'
    };
  }

  if (ext === 'mpd') {
    const dashSupport = typeof window !== 'undefined' && ('MediaSource' in window || 'WebKitMediaSource' in window);
    return {
      supported: dashSupport,
      extension: 'mpd',
      type: 'streaming',
      canPlay: dashSupport ? 'probably' : '',
      description: 'MPEG-DASH adaptive stream.',
      reason: dashSupport ? null : 'Browser lacks MediaSource Extensions support.'
    };
  }

  if (!def) {
    // Unknown extension, let native browser try
    return {
      supported: true,
      extension: ext || 'unknown',
      canPlay: 'maybe',
      description: 'Unidentified container. Attempting standard HTML5 playback.'
    };
  }

  // Non-web standard formats (AVI, WMV, FLV, etc.)
  if (!def.webStandard && !def.streaming) {
    // Test if browser unexpectedly supports it
    let browserCan = '';
    if (videoElement && def.mimes) {
      for (const mime of def.mimes) {
        const can = videoElement.canPlayType(mime);
        if (can === 'probably' || can === 'maybe') {
          browserCan = can;
          break;
        }
      }
    }

    if (!browserCan) {
      return {
        supported: false,
        extension: ext,
        canPlay: '',
        container: def.container,
        reason: `${def.container} is not supported natively by HTML5 web browsers.`,
        recommendation: 'Convert this video to MP4 (H.264/AAC) or WebM (VP9/Opus) for cross-browser playback.'
      };
    }
  }

  // Check MIME types against video element
  let canPlay = '';
  if (videoElement && def.mimes) {
    for (const mime of def.mimes) {
      const res = videoElement.canPlayType(mime);
      if (res === 'probably') {
        canPlay = 'probably';
        break;
      } else if (res === 'maybe' && !canPlay) {
        canPlay = 'maybe';
      }
    }
  }

  return {
    supported: Boolean(canPlay || def.webStandard),
    extension: ext,
    container: def.container,
    canPlay: canPlay || (def.webStandard ? 'maybe' : ''),
    description: def.description,
    reason: canPlay ? null : `${def.container} codecs may not be supported by this browser.`
  };
}
