# ⚡ Flourish & Blotts | Hogwarts Scroll-Driven Web Experience

An immersive, high-performance web experience featuring **Apple-style canvas scroll-driven video scrubbing** paired with a **5-part Harry Potter Online Bookshop**.

## 🎬 Demo Video

[![Flourish & Blotts Interactive Demo](https://img.youtube.com/vi/mBKhg7TZwF0/maxresdefault.jpg)](https://www.youtube.com/watch?v=mBKhg7TZwF0)

🍿 **[Watch Full Video Walkthrough on YouTube](https://www.youtube.com/watch?v=mBKhg7TZwF0)**

---

## 🌟 Key Features

1. **Continuous Frame Scrubbing Engine**
   - Hardware-accelerated full-bleed HTML5 Canvas (`#bg-canvas`).
   - Frame-by-frame 60 FPS linear interpolation (`lerp`) synchronized with scroll position using **GSAP ScrollTrigger** and **Lenis Smooth Scroll**.

2. **5-Part Hogwarts Bookshop Experience**
   - **Part 1: Diagon Alley Hero Overview**: High-impact wizarding typography (`Cinzel` & `Cinzel Decorative`), scroll hint, and quick satchel cart trigger.
   - **Part 2: Hogwarts Curriculum Catalog**: Ornate spellbooks (*The Standard Book of Spells*, *Advanced Potion-Making*, *The Dark Forces*, *Fantastic Beasts*) with genuine book covers, Galleon prices, and quick spell inspector modal.
   - **Part 3: Interactive House Vault**: Pick your Hogwarts house (**Gryffindor** 🦁, **Slytherin** 🐍, **Ravenclaw** 🦅, **Hufflepuff** 🦡) to dynamically transform the website's ambient lighting and aura theme.
   - **Part 4: Vault Metrics & Treasures**: Ministry-certified stats (*1,000+ Tomes*, *99% O.W.L. Pass Rate*, *24hr Owl Post*).
   - **Part 5: Express Owl Dispatch & Vault Satchel**: Slide-over glass shopping cart drawer with live item counter, Galleons/Sickles currency calculator, and Owl Post subscription.

3. **Security & Performance Clean**
   - No hardcoded secrets, API keys, or PII.
   - Zero-dependency runtime lightweight frontend.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/wesleyhuan/agy_animation_web_mode1.git
cd agy_animation_web_mode1

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

---

## 🛠️ Built With

- **Core**: HTML5, Vanilla CSS3, JavaScript (ES Modules)
- **Animation & Physics**: [GSAP](https://greensock.com/gsap/) (ScrollTrigger), [Lenis](https://lenis.darkroom.engineering/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Media Engine**: Python OpenCV frame extraction (`extract_frames.py`)

---

## 📜 License

MIT License &copy; 2026 Flourish & Blotts Interactive.
