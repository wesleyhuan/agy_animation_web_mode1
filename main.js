import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// 1. Lenis Smooth Scroll Engine
// ==========================================================================
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.5,
});

lenis.on('scroll', () => {
  updateTargetFrame();
  ScrollTrigger.update();
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ==========================================================================
// 2. High-DPI Canvas & Frame Scrubbing Setup
// ==========================================================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const preloaderPercent = document.getElementById('preloader-percent');

const TOTAL_FRAMES = 120;
const frames = [];
const frameState = {
  currentFrame: 0,
  targetFrame: 0,
};

let isLoaded = false;

function getFrameUrl(index) {
  const paddedIndex = String(index + 1).padStart(4, '0');
  return `./frames/frame_${paddedIndex}.jpg`;
}

function resizeCanvas() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  render();
}

window.addEventListener('resize', resizeCanvas);

function drawCoverFit(img) {
  if (!ctx || !img) return;

  const vWidth = img.naturalWidth || img.width || 1920;
  const vHeight = img.naturalHeight || img.height || 1080;
  const cWidth = canvas.width;
  const cHeight = canvas.height;

  const imgAspect = vWidth / vHeight;
  const canvasAspect = cWidth / cHeight;

  let drawW, drawH, x, y;

  if (canvasAspect > imgAspect) {
    drawW = cWidth;
    drawH = cWidth / imgAspect;
    x = 0;
    y = (cHeight - drawH) / 2;
  } else {
    drawH = cHeight;
    drawW = cHeight * imgAspect;
    x = (cWidth - drawW) / 2;
    y = 0;
  }

  ctx.clearRect(0, 0, cWidth, cHeight);
  ctx.drawImage(img, x, y, drawW, drawH);
}

function updateTargetFrame() {
  const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  const maxScroll = Math.max(1, (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight);
  const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
  frameState.targetFrame = progress * (TOTAL_FRAMES - 1);

  // Update top scroll progress bar
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    progressBar.style.width = `${progress * 100}%`;
  }
}

window.addEventListener('scroll', updateTargetFrame, { passive: true });

function render() {
  // Smooth linear interpolation for sub-frame 60 FPS animation
  frameState.currentFrame += (frameState.targetFrame - frameState.currentFrame) * 0.18;

  const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(frameState.currentFrame)));
  const img = frames[frameIdx];

  if (img && img.complete) {
    drawCoverFit(img);
  }
}

function animLoop() {
  render();
  requestAnimationFrame(animLoop);
}

function updatePreloader(percent) {
  const p = Math.min(100, Math.max(0, Math.round(percent)));
  if (preloaderBar) preloaderBar.style.width = `${p}%`;
  if (preloaderPercent) preloaderPercent.textContent = `${p}%`;
}

function preloadFrames() {
  let loadedCount = 0;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);

    img.onload = () => {
      loadedCount++;
      updatePreloader((loadedCount / TOTAL_FRAMES) * 100);

      if (i === 0) {
        resizeCanvas();
        drawCoverFit(img);
      }
      if (loadedCount === TOTAL_FRAMES) {
        onReady();
      }
    };

    img.onerror = () => {
      loadedCount++;
      if (loadedCount === TOTAL_FRAMES) {
        onReady();
      }
    };

    frames.push(img);
  }

  setTimeout(() => {
    if (!isLoaded) onReady();
  }, 2000);
}

function onReady() {
  if (isLoaded) return;
  isLoaded = true;
  if (preloader) preloader.classList.add('hidden');
  resizeCanvas();
  updateTargetFrame();
  initGSAPAnimations();
  animLoop();
}

// ==========================================================================
// 3. GSAP Entrance & Section Triggers
// ==========================================================================
function initGSAPAnimations() {
  // Active Section Navigation update
  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach((sec) => {
    const id = sec.getAttribute('id');
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => updateActiveNav(id),
      onEnterBack: () => updateActiveNav(id)
    });
  });

  // Book Cards Entrance
  gsap.from('.book-card', {
    scrollTrigger: {
      trigger: '.books-grid',
      start: 'top 80%',
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });

  // House Cards Entrance
  gsap.from('.house-card', {
    scrollTrigger: {
      trigger: '.house-selector-grid',
      start: 'top 80%',
    },
    scale: 0.9,
    opacity: 0,
    duration: 0.7,
    stagger: 0.15,
    ease: 'back.out(1.5)'
  });

  // Counter Metric Animation
  ScrollTrigger.create({
    trigger: '#artifacts',
    start: 'top 75%',
    onEnter: animateMetrics
  });
}

function updateActiveNav(sectionId) {
  document.querySelectorAll('.nav-link').forEach((link) => {
    if (link.getAttribute('data-section') === sectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function animateMetrics() {
  const metricValues = document.querySelectorAll('.metric-value');
  metricValues.forEach((el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const unit = el.querySelector('.metric-unit')?.outerHTML || '';
    
    gsap.to({ val: 0 }, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: function () {
        el.innerHTML = `${Math.floor(this.targets()[0].val)}${unit}`;
      }
    });
  });
}

// ==========================================================================
// 4. Interactive House Vault Theme Selector (Part 3)
// ==========================================================================
const houseCards = document.querySelectorAll('.house-card');
houseCards.forEach((card) => {
  card.addEventListener('click', () => {
    houseCards.forEach((c) => c.classList.remove('active'));
    card.classList.add('active');

    const houseName = card.getAttribute('data-house') || 'gryffindor';
    document.body.className = `house-${houseName}`;
    
    showToast(`⚡ Hogwarts House Theme Switched to ${houseName.toUpperCase()}!`);
  });
});

// ==========================================================================
// 5. Shopping Satchel / Cart Drawer Engine (Part 2 & Part 5)
// ==========================================================================
const cart = [];
const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartOverlay = document.querySelector('.cart-drawer-overlay');
const cartBadge = document.getElementById('cart-badge');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotalPrice = document.getElementById('cart-total-price');

function toggleCart(open) {
  if (open) {
    cartDrawer.classList.add('active');
  } else {
    cartDrawer.classList.remove('active');
  }
}

if (cartBtn) cartBtn.addEventListener('click', () => toggleCart(true));
if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => toggleCart(false));
if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));

// Add To Cart Handler
document.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = btn.closest('.book-card');
    if (!card) return;

    const book = {
      id: card.getAttribute('data-id'),
      title: card.getAttribute('data-title'),
      author: card.getAttribute('data-author'),
      price: parseInt(card.getAttribute('data-price'), 10) || 0,
      sickles: parseInt(card.getAttribute('data-sickles'), 10) || 0,
      img: card.getAttribute('data-img'),
    };

    cart.push(book);
    updateCartUI();
    showToast(`📜 "${book.title}" added to your Hogwarts satchel!`);
  });
});

function updateCartUI() {
  if (cartBadge) cartBadge.textContent = cart.length;

  if (cart.length === 0) {
    cartItemsList.innerHTML = `<div class="empty-cart-msg">Your spellbook satchel is empty.<br>Select a tome from the catalog below!</div>`;
    cartTotalPrice.textContent = `0 Galleons 0 Sickles`;
    return;
  }

  let totalGalleons = 0;
  let totalSickles = 0;

  cartItemsList.innerHTML = cart.map((item, idx) => {
    totalGalleons += item.price;
    totalSickles += item.sickles;

    return `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${item.price} Galleons ${item.sickles ? item.sickles + ' Sickles' : ''}</div>
        </div>
        <button class="cart-item-remove" data-idx="${idx}">🗑️</button>
      </div>
    `;
  }).join('');

  // Handle sickles to galleons conversion (17 Sickles = 1 Galleon)
  if (totalSickles >= 17) {
    totalGalleons += Math.floor(totalSickles / 17);
    totalSickles = totalSickles % 17;
  }

  cartTotalPrice.textContent = `${totalGalleons} Galleons ${totalSickles > 0 ? totalSickles + ' Sickles' : ''}`;

  // Attach remove handlers
  document.querySelectorAll('.cart-item-remove').forEach((rmBtn) => {
    rmBtn.addEventListener('click', () => {
      const idx = parseInt(rmBtn.getAttribute('data-idx'), 10);
      cart.splice(idx, 1);
      updateCartUI();
    });
  });
}

// Checkout handler
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('⚠️ Your satchel is empty! Add spellbooks before dispatching owl post.');
      return;
    }
    showToast('🦉 Express Owl Post Dispatched! Your spellbooks are flying from Diagon Alley!');
    cart.length = 0;
    updateCartUI();
    setTimeout(() => toggleCart(false), 1200);
  });
}

// ==========================================================================
// 6. Quick Spellbook Preview Modal
// ==========================================================================
const spellModal = document.getElementById('spell-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');

function openModal(bookId) {
  const card = document.querySelector(`.book-card[data-id="${bookId}"]`);
  if (!card) return;

  document.getElementById('modal-book-img').src = card.getAttribute('data-img');
  document.getElementById('modal-book-title').textContent = card.getAttribute('data-title');
  document.getElementById('modal-book-author').textContent = `By ${card.getAttribute('data-author')}`;
  document.getElementById('modal-book-price').textContent = `${card.getAttribute('data-price')} Galleons ${card.getAttribute('data-sickles') ? card.getAttribute('data-sickles') + ' Sickles' : ''}`;
  document.getElementById('modal-incantation').textContent = card.getAttribute('data-incantation');
  document.getElementById('modal-book-tag').textContent = card.getAttribute('data-tag');

  spellModal.classList.add('active');
}

function closeModal() {
  spellModal.classList.remove('active');
}

document.querySelectorAll('.preview-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const bookId = btn.getAttribute('data-id');
    openModal(bookId);
  });
});

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

// ==========================================================================
// 7. Owl Post Form & Toast System
// ==========================================================================
const subscribeForm = document.getElementById('subscribe-form');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = subscribeForm.querySelector('input[type="email"]');
    if (input && input.value) {
      showToast('🦉 Owl Post Subscribed! Daily Prophet book drops arriving soon.');
      input.value = '';
    }
  });
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Start frame preloader
preloadFrames();
