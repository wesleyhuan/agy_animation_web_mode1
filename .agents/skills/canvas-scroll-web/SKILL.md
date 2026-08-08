---
name: canvas-scroll-web
description: >-
  Build high-performance scroll-driven web experiences featuring 60 FPS Apple-style
  HTML5 Canvas video/image sequence scrubbing, GSAP ScrollTrigger, Lenis smooth scroll,
  and glassmorphic UI components. Use this skill when asked to create a website with a
  background video or image sequence that moves smoothly with user scrolling.
---

# Canvas Scroll Web Experience Skill

This skill provides a complete step-by-step blueprint for building smooth, Apple-style scroll-driven web applications where background video/image sequences scrub seamlessly as the user scrolls.

---

## Tech Stack & Dependencies

- **Build Tool**: Vite (`npx -y create-vite@latest ./ --template vanilla`)
- **Libraries**:
  - `gsap` + `gsap/ScrollTrigger` (Scroll position tracking)
  - `lenis` (Inertia wheel smooth scroll)
  - `opencv-python` (Frame extraction from MP4 video)

---

## Workflow & Step-by-Step Blueprint

### Step 1: Extract Video Frames to JPEGs
Do not rely on raw HTML5 `<video>.currentTime` seeking for scroll scrubbing (browsers throttle video seeking). Instead, extract 120 compressed JPEG frames from the video.

Use the provided helper script:
```bash
pip install opencv-python
python ./scripts/extract_frames.py <path/to/video.mp4> public/frames
```
*Outputs `public/frames/frame_0001.jpg` through `frame_0120.jpg`.*

---

### Step 2: HTML Layout & Fixed Canvas Setup
Place a fixed, full-bleed `<canvas>` element behind the page content, along with a preloader and section container.

```html
<!-- Fixed Canvas Background -->
<div id="canvas-container">
  <canvas id="bg-canvas"></canvas>
  <div class="magical-vignette"></div>
</div>

<!-- Preloader Screen -->
<div id="preloader" class="preloader">
  <div class="spinner"></div>
  <div id="preloader-bar" class="progress-bar-fill"></div>
  <div id="preloader-percent">0%</div>
</div>

<!-- Scrollable Content Overlays -->
<main id="main-content">
  <!-- Content Sections -->
</main>
```

---

### Step 3: CSS Glassmorphism & High-Transparency Overlay System
Ensure section content uses translucent backgrounds so the underlying canvas animation remains clearly visible.

```css
#canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

#bg-canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.glass-card {
  background: rgba(10, 14, 24, 0.55); /* Low opacity for background visibility */
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
}

#main-content {
  position: relative;
  z-index: 10;
}
```

---

### Step 4: JavaScript Engine (Canvas Scrubbing & Lerp Loop)

```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// 1. Smooth Scroll Physics (Lenis)
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

lenis.on('scroll', () => {
  updateTargetFrame();
  ScrollTrigger.update();
});

gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// 2. High-DPI Canvas & Frame Preloader
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const TOTAL_FRAMES = 120;
const frames = [];
const frameState = { currentFrame: 0, targetFrame: 0 };

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  render();
}
window.addEventListener('resize', resizeCanvas);

function drawCoverFit(img) {
  if (!ctx || !img) return;
  const vW = img.naturalWidth || 1920;
  const vH = img.naturalHeight || 1080;
  const cW = canvas.width;
  const cH = canvas.height;
  const imgAspect = vW / vH;
  const canvasAspect = cW / cH;

  let drawW, drawH, x, y;
  if (canvasAspect > imgAspect) {
    drawW = cW; drawH = cW / imgAspect;
    x = 0; y = (cH - drawH) / 2;
  } else {
    drawH = cH; drawW = cH * imgAspect;
    x = (cW - drawW) / 2; y = 0;
  }
  ctx.clearRect(0, 0, cW, cH);
  ctx.drawImage(img, x, y, drawW, drawH);
}

function updateTargetFrame() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
  frameState.targetFrame = progress * (TOTAL_FRAMES - 1);
}

function render() {
  // Lerp interpolation for sub-frame 60 FPS smoothness
  frameState.currentFrame += (frameState.targetFrame - frameState.currentFrame) * 0.18;
  const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(frameState.currentFrame)));
  const img = frames[frameIdx];
  if (img && img.complete) drawCoverFit(img);
}

function animLoop() {
  render();
  requestAnimationFrame(animLoop);
}

// Preload 120 JPEG frames into memory
for (let i = 0; i < TOTAL_FRAMES; i++) {
  const img = new Image();
  const paddedIndex = String(i + 1).padStart(4, '0');
  img.src = `./frames/frame_${paddedIndex}.jpg`;
  if (i === 0) img.onload = () => { resizeCanvas(); drawCoverFit(img); };
  frames.push(img);
}

updateTargetFrame();
animLoop();
```

---

## Key Verification Checklist

1. **No Scroll Lock**: Ensure `html` and `body` do not have `height: 100%` or `overflow: hidden`.
2. **Background Visibility**: Verify `glass-card` opacity is below `0.7` so the background canvas is crisp and legible.
3. **Build Target**: When deploying, always set public directory to `dist` (Vite output folder).
