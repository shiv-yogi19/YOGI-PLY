"""
Yogi_PLY - Zero-Extra-PIP Pure Python HTTP Server
Created By Shiv Yogi
Tagline: One Player. Every Website.

Zero external dependencies! Uses Python standard library only.
Supports:
- HTTP 206 Partial Content (Range Requests)
- Seekable video playback in browser
- Anti-directory traversal path resolution
- Works out-of-the-box in Pydroid 3 without running 'pip install'
"""

import os
import re
import sys
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 8080
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
VIDEO_DIR = os.path.join(BASE_DIR, 'videos')
os.makedirs(VIDEO_DIR, exist_ok=True)

# Register video MIME types
mimetypes.add_type('video/mp4', '.mp4')
mimetypes.add_type('video/webm', '.webm')
mimetypes.add_type('video/ogg', '.ogv')

HTML_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yogi_PLY — Zero-PIP Python Server</title>
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
  </style>
</head>
<body>

  <div class="wrapper">
    <div class="header">
      <h1>Yogi_PLY Pure Python Server (Zero PIP)</h1>
      <p>Created By Shiv Yogi — One Player. Every Website.</p>
    </div>

    <!-- Yogi_PLY Video Container -->
    <div id="player-container"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/yogi-ply@1.0.0/dist/yogi-ply.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      new YogiPLY.Player('#player-container', {
        source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        theme: 'liquid-glass',
        layout: 'cinematic',
        title: 'Zero-PIP Python Stream'
      });
    });
  </script>
</body>
</html>"""

class RangeRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Serve home page
        if self.path == '/' or self.path == '/index.html':
            encoded = HTML_PAGE.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
            return

        # Serve video stream with HTTP 206 Range support
        if self.path.startswith('/stream/'):
            filename = self.path[len('/stream/'):].split('?')[0]
            safe_path = os.path.normpath(os.path.join(VIDEO_DIR, filename))
            
            # Anti-traversal check
            if not safe_path.startswith(VIDEO_DIR) or not os.path.isfile(safe_path):
                self.send_error(404, "File not found")
                return

            file_size = os.path.getsize(safe_path)
            mime_type, _ = mimetypes.guess_type(safe_path)
            mime_type = mime_type or 'video/mp4'

            range_header = self.headers.get('Range')
            if not range_header:
                # Full 200 response
                self.send_response(200)
                self.send_header('Content-Type', mime_type)
                self.send_header('Content-Length', str(file_size))
                self.send_header('Accept-Ranges', 'bytes')
                self.end_headers()
                with open(safe_path, 'rb') as f:
                    self.copy_file(f, self.wfile)
                return

            # Range request handling (HTTP 206)
            match = re.search(r'bytes=(\d+)-(\d*)', range_header)
            if not match:
                self.send_error(400, "Bad Range Header")
                return

            byte1 = int(match.group(1))
            byte2 = int(match.group(2)) if match.group(2) else min(byte1 + 1048576, file_size - 1)

            if byte1 >= file_size or byte2 >= file_size:
                self.send_error(416, "Requested Range Not Satisfiable")
                return

            length = byte2 - byte1 + 1

            self.send_response(206)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Range', f'bytes {byte1}-{byte2}/{file_size}')
            self.send_header('Content-Length', str(length))
            self.send_header('Accept-Ranges', 'bytes')
            self.end_headers()

            with open(safe_path, 'rb') as f:
                f.seek(byte1)
                self.wfile.write(f.read(length))
            return

        self.send_error(404, "Not Found")

    def copy_file(self, source, dest):
        buffer_size = 64 * 1024
        while True:
            chunk = source.read(buffer_size)
            if not chunk:
                break
            dest.write(chunk)

def run():
    server_address = ('0.0.0.0', PORT)
    httpd = HTTPServer(server_address, RangeRequestHandler)
    print("==========================================================")
    print(f"🚀 Yogi_PLY Zero-PIP Server running on http://0.0.0.0:{PORT}")
    print("Created By Shiv Yogi — One Player. Every Website.")
    print("Zero extra dependencies required. Pure Python Standard Library!")
    print("==========================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == '__main__':
    run()
