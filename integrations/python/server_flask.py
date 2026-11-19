"""
Yogi_PLY - Python Flask Video Streaming Server
Created By Shiv Yogi
Tagline: One Player. Every Website.

Features:
- Full HTTP 206 Partial Content / Range Requests (RFC 7233)
- Correct video MIME types (mp4, webm, ogv, m3u8, mpd)
- Anti-directory traversal security protection
- Localhost (127.0.0.1) & LAN (0.0.0.0:8080) support
- Android Pydroid 3 & Termux ready
"""

import os
import re
import mimetypes
from flask import Flask, request, Response, send_from_directory, render_template_string, jsonify

app = Flask(__name__)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
VIDEO_DIR = os.path.join(BASE_DIR, 'videos')
os.makedirs(VIDEO_DIR, exist_ok=True)

# Register video MIME types
mimetypes.add_type('video/mp4', '.mp4')
mimetypes.add_type('video/webm', '.webm')
mimetypes.add_type('video/ogg', '.ogv')
mimetypes.add_type('application/x-mpegURL', '.m3u8')
mimetypes.add_type('application/dash+xml', '.mpd')

INDEX_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yogi_PLY — Python Video Server</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yogi-ply@1.0.0/dist/yogi-ply.min.css">
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #090b10;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .wrapper {
      max-width: 960px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0 0 6px 0;
      color: #fff;
    }
    .header p {
      margin: 0;
      color: #8b9cff;
      font-size: 14px;
    }
    .file-list {
      margin-top: 24px;
      padding: 16px;
      background: rgba(18, 22, 34, 0.7);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  </style>
</head>
<body>

  <div class="wrapper">
    <div class="header">
      <h1>Yogi_PLY Python Streaming Server</h1>
      <p>Created By Shiv Yogi — One Player. Every Website.</p>
    </div>

    <!-- Yogi_PLY Video Container -->
    <div id="player-container"></div>

    <div class="file-list">
      <h3>Available Videos in <code>videos/</code> folder:</h3>
      <ul id="video-links">
        <li>Drop .mp4 or .webm files into the <code>videos/</code> folder to stream.</li>
      </ul>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/yogi-ply@1.0.0/dist/yogi-ply.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      // Fetch video list
      try {
        const res = await fetch('/api/videos');
        const videos = await res.json();
        const listEl = document.getElementById('video-links');
        if (videos.length > 0) {
          listEl.innerHTML = videos.map(v => `<li><a href="#" onclick="loadVideo('/stream/${v}')" style="color:#8b9cff;">${v}</a></li>`).join('');
          initPlayer('/stream/' + videos[0]);
        } else {
          // Default online sample video
          initPlayer('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
        }
      } catch (e) {
        initPlayer('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      }
    });

    let playerInstance = null;
    function initPlayer(src) {
      if (playerInstance) playerInstance.destroy();
      playerInstance = new YogiPLY.Player('#player-container', {
        source: src,
        theme: 'liquid-glass',
        layout: 'cinematic',
        title: 'Python Hosted Video'
      });
    }

    function loadVideo(src) {
      if (playerInstance) {
        playerInstance.setSource(src);
      }
    }
  </script>
</body>
</html>"""

@app.route('/')
def home():
    return render_template_string(INDEX_HTML)

@app.route('/api/videos')
def list_videos():
    if not os.path.exists(VIDEO_DIR):
        return jsonify([])
    valid_exts = {'.mp4', '.webm', '.ogv', '.m4v', '.mov'}
    files = [f for f in os.listdir(VIDEO_DIR) if os.path.splitext(f)[1].lower() in valid_exts]
    return jsonify(files)

@app.route('/stream/<path:filename>')
def stream_video(filename):
    # Security: prevent directory traversal
    safe_path = os.path.normpath(os.path.join(VIDEO_DIR, filename))
    if not safe_path.startswith(VIDEO_DIR) or not os.path.isfile(safe_path):
        return Response("File not found or access forbidden", status=404)

    file_size = os.path.getsize(safe_path)
    mime_type, _ = mimetypes.guess_type(safe_path)
    mime_type = mime_type or 'video/mp4'

    range_header = request.headers.get('Range', None)
    if not range_header:
        # Standard HTTP 200 response
        return send_from_directory(VIDEO_DIR, filename, mimetype=mime_type)

    # HTTP 206 Range Request
    byte1, byte2 = 0, None
    match = re.search(r'bytes=(\d+)-(\d*)', range_header)
    if match:
        groups = match.groups()
        byte1 = int(groups[0])
        if groups[1]:
            byte2 = int(groups[1])

    if byte2 is None:
        # Stream in 1MB chunks or remaining size
        chunk_size = 1024 * 1024  # 1 MB
        byte2 = min(byte1 + chunk_size - 1, file_size - 1)

    if byte1 >= file_size or byte2 >= file_size:
        return Response("Requested range not satisfiable", status=416)

    length = byte2 - byte1 + 1

    with open(safe_path, 'rb') as f:
        f.seek(byte1)
        data = f.read(length)

    response = Response(data, 206, mimetype=mime_type, direct_passthrough=True)
    response.headers.add('Content-Range', f'bytes {byte1}-{byte2}/{file_size}')
    response.headers.add('Accept-Ranges', 'bytes')
    response.headers.add('Content-Length', str(length))
    response.headers.add('Cache-Control', 'no-cache')
    return response

if __name__ == '__main__':
    print("==========================================================")
    print("🚀 Yogi_PLY Python Streaming Server")
    print("Creator: Created By Shiv Yogi")
    print("Tagline: One Player. Every Website.")
    print("URL: http://127.0.0.1:8080 (Localhost)")
    print("LAN: http://0.0.0.0:8080 (Accessible on phone/LAN)")
    print("==========================================================")
    app.run(host='0.0.0.0', port=8080, threaded=True)
