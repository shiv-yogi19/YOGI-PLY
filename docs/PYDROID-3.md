# Yogi_PLY — Android Pydroid 3 & Python Integration Guide

**Creator**: Created By Shiv Yogi  
**Tagline**: One Player. Every Website.  
**Version**: 1.0.0  

---

## 1. Overview & Architecture

Yogi_PLY includes complete native Python streaming server integration designed specifically to run seamlessly on **Android devices via Pydroid 3** and **Termux**, as well as on Linux, macOS, and Windows.

```
┌────────────────────────────────────────┐
│   Android Device / Browser Client     │
│   (HTML5, CSS, Liquid Glass Yogi_PLY)  │
└───────────────────▲────────────────────┘
                    │ HTTP Range Requests (206)
┌───────────────────▼────────────────────┐
│   Python Backend (Pydroid 3 / Termux)  │
│   Flask Server or Zero-PIP Stdlib      │
└───────────────────▲────────────────────┘
                    │ Local File I/O
┌───────────────────▼────────────────────┐
│   Storage Directory (/sdcard/Movies)   │
└────────────────────────────────────────┘
```

Two backend implementations are provided:
1. **`server_flask.py`**: Production Flask server with full HTTP 206 Range Request support, MIME detection, and directory traversal protection.
2. **`server_stdlib.py`**: **Zero-Extra-PIP option**. Built entirely using Python standard library (`http.server`). Requires zero `pip` installations!

---

## 2. Pydroid 3 Setup Guide (Step-by-Step)

### Option A: Zero-Extra-PIP (Easiest & Fastest)
No PIP packages needed!

1. Open **Pydroid 3** on your Android device.
2. Open the file `integrations/python/server_stdlib.py`.
3. Tap the **Play (Run)** button.
4. The console will display:
   ```text
   ==========================================================
   🚀 Yogi_PLY Zero-PIP Server running on http://0.0.0.0:8080
   Created By Shiv Yogi — One Player. Every Website.
   Zero extra dependencies required. Pure Python Standard Library!
   ==========================================================
   ```
5. Open Chrome on your phone and navigate to:
   - **Localhost**: `http://127.0.0.1:8080`
   - **From another phone/laptop on same WiFi**: `http://<YOUR_PHONE_IP>:8080`

---

### Option B: Flask Server with Media API

1. In Pydroid 3, open the left side menu and tap **Pip**.
2. Search for and install: `flask`.
3. Open `integrations/python/server_flask.py` in Pydroid 3.
4. Tap the **Play (Run)** button.
5. Access `http://127.0.0.1:8080` in your web browser.

---

## 3. HTTP 206 Partial Content (Range Requests)

### Why Range Requests are Mandatory for Video
Standard web servers return HTTP 200 with the entire video payload. If a video is 500 MB:
- Seeking forward requires waiting for the whole file to download.
- Mobile browsers cannot buffer efficiently and may crash due to memory exhaustion.
- Media controls become sluggish or unresponsive.

Yogi_PLY implements **RFC 7233 Byte Range Requests**:
```http
GET /stream/movie.mp4 HTTP/1.1
Host: 127.0.0.1:8080
Range: bytes=1048576-2097151

HTTP/1.1 206 Partial Content
Content-Type: video/mp4
Content-Range: bytes 1048576-2097151/52428800
Content-Length: 1048576
Accept-Ranges: bytes
```
This enables instantaneous seeking to any chapter or timestamp on mobile devices.

---

## 4. Android Storage Permissions & Path Configuration

### Reading Videos from Phone Storage (`/sdcard`)
To stream video files stored on your Android internal storage:

#### In Pydroid 3:
1. Go to **Android Settings → Apps → Pydroid 3 → Permissions → Storage (All Files Access)** and allow access.
2. In `server_flask.py`, set:
   ```python
   VIDEO_DIR = '/sdcard/Movies' # Or your desired folder
   ```

#### In Termux:
Run storage setup first:
```bash
termux-setup-storage
```
Then copy or link your videos:
```bash
ln -s ~/storage/movies ./videos
python3 integrations/python/server_stdlib.py
```

---

## 5. Security & Anti-Directory Traversal

Yogi_PLY server scripts strictly prevent path traversal attacks (such as `GET /stream/../../../../etc/passwd`):
```python
safe_path = os.path.normpath(os.path.join(VIDEO_DIR, filename))
if not safe_path.startswith(VIDEO_DIR) or not os.path.isfile(safe_path):
    return Response("Access forbidden", status=404)
```
Only files physically located within the designated `videos/` folder are served.

---

## 6. LAN (Local Area Network) Access

Both servers bind to `0.0.0.0:8080` instead of `127.0.0.1:8080`.
This allows any device on your local WiFi network (smart TV, PC, tablet, another phone) to stream smoothly from your Android phone without needing an internet connection!
