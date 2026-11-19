# Yogi_PLY Integration Guide

**Library:** Yogi_PLY  
**Creator:** Created By Shiv Yogi  
**Tagline:** One Player. Every Website.  
**License:** MIT  

---

## 1. Zero-Config CDN Embed (Plain Websites & CMS)

Add the pre-built stylesheet and library from jsDelivr:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yogi_PLY Video Player</title>
  
  <!-- Yogi_PLY Liquid Glass CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/shiv-yogi19/Yogi_PLY@v1.0.0/dist/yogi-ply.min.css">
</head>
<body>

  <!-- Automatic Initialization -->
  <div class="yogi-ply"
       data-video="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
       data-poster="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80"
       data-title="Big Buck Bunny"
       data-theme="liquid-glass">
  </div>

  <!-- Yogi_PLY JS Bundle -->
  <script src="https://cdn.jsdelivr.net/gh/shiv-yogi19/Yogi_PLY@v1.0.0/dist/yogi-ply.min.js"></script>
</body>
</html>
```

---

## 2. React / Next.js Integration

Use the ready-made React component from `integrations/react/YogiPlayer.jsx` or integrate directly with a `ref`:

```tsx
import React, { useEffect, useRef } from 'react';
import YogiPLY from 'yogi-ply';
import 'yogi-ply/dist/yogi-ply.min.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  theme?: 'liquid-glass' | 'dark' | 'light' | 'cinematic-oled';
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title = 'Featured Video',
  theme = 'liquid-glass',
  onPlay,
  onPause,
  onEnded
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    playerRef.current = new YogiPLY.Player(containerRef.current, {
      source: src,
      poster: poster,
      title: title,
      theme: theme,
      watermark: {
        opacity: 0.35,
        interval: 12000,
        movement: true,
        animationStyle: 'fade-slide'
      }
    });

    if (onPlay) playerRef.current.on('play', onPlay);
    if (onPause) playerRef.current.on('pause', onPause);
    if (onEnded) playerRef.current.on('ended', onEnded);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [src, poster, title, theme]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    />
  );
};
```

---

## 3. Vue 3 / Nuxt Integration

Use the component from `integrations/vue/YogiPlayer.vue`:

```vue
<template>
  <div ref="playerContainer" class="yogi-player-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import YogiPLY from 'yogi-ply';
import 'yogi-ply/dist/yogi-ply.min.css';

const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, default: '' },
  title: { type: String, default: '' },
  theme: { type: String, default: 'liquid-glass' }
});

const emit = defineEmits(['play', 'pause', 'ended', 'timeupdate']);

const playerContainer = ref(null);
let player = null;

onMounted(() => {
  if (playerContainer.value) {
    player = new YogiPLY.Player(playerContainer.value, {
      source: props.src,
      poster: props.poster,
      title: props.title,
      theme: props.theme,
      watermark: {
        opacity: 0.35,
        animationStyle: 'fade-slide'
      }
    });

    player.on('play', () => emit('play'));
    player.on('pause', () => emit('pause'));
    player.on('ended', () => emit('ended'));
    player.on('timeupdate', (t) => emit('timeupdate', t));
  }
});

watch(() => props.src, (newSrc) => {
  if (player && newSrc) {
    player.setSource(newSrc);
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
  border-radius: 16px;
  overflow: hidden;
}
</style>
```

---

## 4. Angular Integration

Create a reusable Angular component (`yogi-player.component.ts`):

```typescript
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import YogiPLY from 'yogi-ply';

@Component({
  selector: 'app-yogi-player',
  template: `<div #playerHost class="yogi-host"></div>`,
  styles: [`
    .yogi-host {
      width: 100%;
      max-width: 960px;
      margin: 0 auto;
      border-radius: 16px;
      overflow: hidden;
    }
  `]
})
export class YogiPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('playerHost', { static: true }) playerHost!: ElementRef<HTMLDivElement>;

  @Input() src!: string;
  @Input() poster?: string;
  @Input() title: string = 'Cinematic Video';
  @Input() theme: string = 'liquid-glass';

  private player: any;

  ngOnInit(): void {
    this.player = new YogiPLY.Player(this.playerHost.nativeElement, {
      source: this.src,
      poster: this.poster,
      title: this.title,
      theme: this.theme,
      watermark: {
        opacity: 0.35,
        animationStyle: 'fade-slide'
      }
    });
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }
}
```

---

## 5. WordPress Integration

Use the provided shortcode plugin located in `integrations/wordpress/yogi-ply-wordpress.php`:

1. Copy `yogi-ply-wordpress.php` into `wp-content/plugins/yogi-ply/`.
2. Activate the plugin in **WordPress Admin → Plugins**.
3. Insert the shortcode into any post, page, or Block:

```text
[yogi_player src="https://example.com/video.mp4" poster="https://example.com/poster.jpg" title="Tutorial Video" theme="liquid-glass"]
```

The shortcode automatically enqueues `yogi-ply.min.css` and `yogi-ply.min.js`, generating isolated player markup with full responsive styling.

---

## 6. Google Blogger Integration

Insert the gadget widget from `integrations/blogger/blogger-widget.html`:

1. In Blogger Admin, navigate to **Layout → Add a Gadget → HTML/JavaScript**.
2. Paste the embed snippet:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/shiv-yogi19/Yogi_PLY@v1.0.0/dist/yogi-ply.min.css">
<div class="yogi-ply"
     data-video="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
     data-poster="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80"
     data-title="My Video Post"
     data-theme="liquid-glass">
</div>
<script src="https://cdn.jsdelivr.net/gh/shiv-yogi19/Yogi_PLY@v1.0.0/dist/yogi-ply.min.js"></script>
```

---

## 7. Python Flask Integration

Serve video content with RFC 7233 HTTP 206 Partial Content byte-range support using `integrations/python/server_flask.py`:

```python
from flask import Flask, Response, request, render_template_string
import os, mimetypes

app = Flask(__name__)
VIDEO_DIR = os.path.abspath("./media")

@app.route("/stream/<path:filename>")
def stream_video(filename):
    path = os.path.join(VIDEO_DIR, filename)
    if not os.path.exists(path):
        return ("Not Found", 404)
        
    size = os.path.getsize(path)
    range_header = request.headers.get("Range")
    
    if not range_header:
        with open(path, "rb") as f:
            return Response(f.read(), mimetype="video/mp4")
            
    # Parse Range: bytes=start-end
    bytes_range = range_header.replace("bytes=", "").split("-")
    start = int(bytes_range[0])
    end = int(bytes_range[1]) if bytes_range[1] else size - 1
    chunk_size = (end - start) + 1
    
    with open(path, "rb") as f:
        f.seek(start)
        data = f.read(chunk_size)
        
    response = Response(data, 206, mimetype="video/mp4")
    response.headers["Content-Range"] = f"bytes {start}-{end}/{size}"
    response.headers["Accept-Ranges"] = "bytes"
    response.headers["Content-Length"] = str(chunk_size)
    return response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

---

## 8. Pydroid 3 & Zero-PIP Python Integration

Run an ultra-lightweight HTTP streaming server on Android via Pydroid 3 or Termux using only the standard library (`integrations/python/server_stdlib.py`):

```bash
# In Pydroid 3 terminal or Termux
cd integrations/python
python3 server_stdlib.py --port 8080 --dir /sdcard/Movies
```

The stdlib server implements full RFC 7233 byte-range handling without requiring `pip install flask`, enabling instant mobile LAN video streaming.

---

## 9. Multi-Player Independence Setup

Run multiple players on a single page with complete isolation:

```html
<div class="video-grid">
  <div id="player-main"></div>
  <div id="player-sidebar"></div>
</div>

<script>
  // Main Player (Liquid Glass Theme)
  const mainPlayer = new YogiPLY.Player('#player-main', {
    source: 'https://example.com/movie.mp4',
    title: 'Main Feature',
    theme: 'liquid-glass'
  });

  // Sidebar Player (Dark Theme)
  const sidebarPlayer = new YogiPLY.Player('#player-sidebar', {
    source: 'https://example.com/trailer.mp4',
    title: 'Trailer',
    theme: 'dark',
    muted: true
  });

  // Pausing main does not affect sidebar:
  mainPlayer.on('pause', () => console.log('Main paused'));
</script>
```

---

## 10. Permanent Watermark Policy

In accordance with Section 2 of the framework specification:
- The watermark text is permanently fixed to: **`Created By Shiv Yogi`**.
- It is always enabled and cannot be disabled, hidden, or replaced via public APIs, configuration options, HTML data attributes, or the Studio dashboard.
- Permitted visual options include: `animationStyle` (`'fade-slide'`, `'fade'`, `'slide'`, `'float'`, `'pulse'`), `opacity` (`0.15` to `0.85`), `interval` (transition timer in ms), and `movement` (dynamic position repositioning).
