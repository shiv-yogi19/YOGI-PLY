/**
 * Yogi_PLY Studio - Code Generation Engine
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

export function generateConfigJson(config) {
  return JSON.stringify(config, null, 2);
}

export function generateJsCode(config) {
  const cfgStr = JSON.stringify(config, null, 2);
  return `// Yogi_PLY Player Initialization
// Created By Shiv Yogi - One Player. Every Website.

import YogiPLY from 'yogi-ply';
import 'yogi-ply/dist/yogi-ply.min.css';

const player = new YogiPLY.Player('#player-container', ${cfgStr});

// Event Listeners
player.on('play', () => console.log('Video playback started'));
player.on('pause', () => console.log('Video paused'));
player.on('ended', () => console.log('Video reached the end'));
`;
}

export function generateHtmlCode(config) {
  const cdnCss = 'https://cdn.jsdelivr.net/npm/yogi-ply@1.0.0/dist/yogi-ply.min.css';
  const cdnJs = 'https://cdn.jsdelivr.net/npm/yogi-ply@1.0.0/dist/yogi-ply.min.js';

  return `<!-- Yogi_PLY Universal HTML Embed -->
<!-- Created By Shiv Yogi | Tagline: One Player. Every Website. -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title || 'Yogi_PLY Player'}</title>
  
  <!-- Yogi_PLY Liquid Glass Stylesheet -->
  <link rel="stylesheet" href="${cdnCss}">
  <style>
    body {
      margin: 0;
      background: #000000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .player-wrapper {
      width: 100%;
      max-width: 960px;
      padding: 16px;
      box-sizing: border-box;
    }
  </style>
</head>
<body>

  <div class="player-wrapper">
    <!-- Player Container -->
    <div id="player-container"></div>
  </div>

  <!-- Yogi_PLY Production Library -->
  <script src="${cdnJs}"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const player = new YogiPLY.Player('#player-container', ${JSON.stringify(config, null, 4)});
    });
  </script>
</body>
</html>`;
}

export function generateCssCode(config) {
  const accent = config.theme === 'cinematic-oled' ? '#38bdf8' : '#8b9cff';
  return `/* Yogi_PLY Custom Liquid Glass Overrides */
/* Creator: Created By Shiv Yogi */

.yogi-ply {
  --yogi-accent: ${accent};
  --yogi-border-radius: 16px;
  --yogi-glass-blur: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
}

/* Custom Glass Reflective Highlights */
.yogi-ply-controls {
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45);
}
`;
}

export function generateReactCode(config) {
  const cfgStr = JSON.stringify(config, null, 4);
  return `// YogiPlayer.jsx - React Component
// Created By Shiv Yogi - One Player. Every Website.

import React, { useEffect, useRef } from 'react';
import YogiPLY from 'yogi-ply';
import 'yogi-ply/dist/yogi-ply.min.css';

export default function YogiPlayer() {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize player instance
    playerRef.current = new YogiPLY.Player(containerRef.current, ${cfgStr});

    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="yogi-player-wrapper" style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      <div ref={containerRef} />
    </div>
  );
}
`;
}

export function generateVueCode(config) {
  const cfgStr = JSON.stringify(config, null, 4);
  return `<!-- YogiPlayer.vue - Vue 3 Component -->
<!-- Created By Shiv Yogi - One Player. Every Website. -->

<template>
  <div class="yogi-player-wrapper">
    <div ref="playerContainer" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import YogiPLY from 'yogi-ply';
import 'yogi-ply/dist/yogi-ply.min.css';

const playerContainer = ref(null);
let player = null;

onMounted(() => {
  if (playerContainer.value) {
    player = new YogiPLY.Player(playerContainer.value, ${cfgStr});
  }
});

onBeforeUnmount(() => {
  if (player) {
    player.destroy();
    player = null;
  }
});
</script>

<style scoped>
.yogi-player-wrapper {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}
</style>
`;
}

export function generatePythonCode(config) {
  return `# server.py - Python Flask & Pydroid 3 Video Streaming Server
# Created By Shiv Yogi - One Player. Every Website.
# Features: HTTP 206 Partial Content (Range Requests), Zero Directory Traversal, LAN Support

import os
import re
import mimetypes
from flask import Flask, request, Response, send_from_directory, render_template_string

app = Flask(__name__)
VIDEO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'videos'))
os.makedirs(VIDEO_DIR, exist_ok=True)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Yogi_PLY - Python Video Stream</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yogi-ply@1.0.0/dist/yogi-ply.min.css">
  <style>
    body { background: #000; color: #fff; margin: 0; padding: 20px; font-family: sans-serif; }
    .container { max-width: 960px; margin: 0 auto; }
    .brand { text-align: center; margin-bottom: 20px; color: #8b9cff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <h2>Yogi_PLY Python Streaming Server</h2>
      <p>Created By Shiv Yogi — One Player. Every Website.</p>
    </div>
    <div id="player"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/yogi-ply@1.0.0/dist/yogi-ply.min.js"></script>
  <script>
    const player = new YogiPLY.Player('#player', ${JSON.stringify(config, null, 4)});
  </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/stream/<path:filename>')
def stream_video(filename):
    # Secure path traversal check
    safe_path = os.path.normpath(os.path.join(VIDEO_DIR, filename))
    if not safe_path.startswith(VIDEO_DIR) or not os.path.isfile(safe_path):
        return Response("File not found or access denied", status=404)

    file_size = os.path.getsize(safe_path)
    mime_type, _ = mimetypes.guess_type(safe_path)
    mime_type = mime_type or 'video/mp4'

    range_header = request.headers.get('Range', None)
    if not range_header:
        # Full file response
        return send_from_directory(VIDEO_DIR, filename, mimetype=mime_type)

    # HTTP 206 Partial Content (Byte Range Request)
    byte1, byte2 = 0, None
    m = re.search(r'bytes=(\\d+)-(\\d*)', range_header)
    if m:
        g = m.groups()
        byte1 = int(g[0])
        if g[1]:
            byte2 = int(g[1])

    if byte2 is None:
        byte2 = file_size - 1

    length = byte2 - byte1 + 1

    with open(safe_path, 'rb') as f:
        f.seek(byte1)
        data = f.read(length)

    rv = Response(data, 206, mimetype=mime_type, direct_passthrough=True)
    rv.headers.add('Content-Range', f'bytes {byte1}-{byte2}/{file_size}')
    rv.headers.add('Accept-Ranges', 'bytes')
    rv.headers.add('Content-Length', str(length))
    return rv

if __name__ == '__main__':
    # Bind to 0.0.0.0 to enable access from phone LAN / WiFi
    print("🚀 Yogi_PLY Python Streaming Server running on http://0.0.0.0:8080")
    print("Created By Shiv Yogi — One Player. Every Website.")
    app.run(host='0.0.0.0', port=8080, threaded=True)
`;
}
