const nav = document.getElementById('navbar');
const backToTop = document.querySelector('.back-to-top');
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;
const navLinks = document.querySelectorAll('.nav-links a');

// Theme
if (themeToggle) {
  html.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// Active nav link based on current page
const page = location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(l => {
  const href = l.getAttribute('href');
  l.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
});

// Scroll
window.addEventListener('scroll', () => {
  const y = window.pageYOffset;
  nav.classList.toggle('scrolled', y > 50);
  backToTop && backToTop.classList.toggle('visible', y > 500);
}, { passive: true });

backToTop && backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Smooth scroll for anchor links only
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const t = document.querySelector(href);
    if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' }); }
    document.querySelector('.mobile-menu')?.classList.remove('open');
    document.querySelector('.mobile-menu-btn')?.classList.remove('open');
  });
});

// Mobile menu
document.querySelector('.mobile-menu-btn')?.addEventListener('click', function () {
  const isOpen = this.classList.toggle('open');
  document.querySelector('.mobile-menu')?.classList.toggle('open');
  this.setAttribute('aria-expanded', isOpen);
});

// Counter animation
const cObs = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  document.querySelectorAll('.hero-stat-num').forEach(el => {
    const text = el.textContent;
    const m = text.match(/(\d+)/);
    if (!m) return;
    const target = +m[1];
    const prefix = text.substring(0, text.indexOf(m[1]));
    const suffix = text.substring(text.indexOf(m[1]) + m[1].length);
    let cur = 0;
    const step = () => {
      cur += Math.ceil((target - cur) / 12);
      if (cur >= target) { el.textContent = prefix + target + suffix; return; }
      el.textContent = prefix + cur + suffix;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  cObs.disconnect();
}, { threshold: 0.5 });
const hs = document.querySelector('.hero-stats');
if (hs) cObs.observe(hs);

// Lightbox
function createLightbox() {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image lightbox');
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <button class="lightbox-prev" aria-label="Previous">&#8249;</button>
    <button class="lightbox-next" aria-label="Next">&#8250;</button>
    <div class="lightbox-content">
      <img src="" alt="">
    </div>
  `;
  document.body.appendChild(lightbox);
  return lightbox;
}

const lightbox = createLightbox();
const lightboxImg = lightbox.querySelector('img');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const lightboxPrev = lightbox.querySelector('.lightbox-prev');
const lightboxNext = lightbox.querySelector('.lightbox-next');
let currentImages = [];
let currentIndex = 0;

function openLightbox(img) {
  currentImages = Array.from(document.querySelectorAll('img[src]')).filter(i => {
    const src = i.getAttribute('src');
    if (!src || src.includes('data:')) return false;
    if (i.offsetParent === null) return false;
    if (i.naturalWidth < 100 || i.naturalHeight < 100) return false;
    return true;
  });
  currentIndex = currentImages.indexOf(img);
  if (currentIndex === -1) currentIndex = 0;
  showImage(currentIndex);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function showImage(index) {
  if (currentImages[index]) {
    lightboxImg.src = currentImages[index].src;
    lightboxImg.alt = currentImages[index].alt || '';
    currentIndex = index;
  }
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function trapFocus(e) {
  if (!lightbox.classList.contains('active')) return;
  if (e.key !== 'Tab') return;
  const focusable = lightbox.querySelectorAll('button');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

lightboxPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  showImage((currentIndex - 1 + currentImages.length) % currentImages.length);
});

lightboxNext.addEventListener('click', (e) => {
  e.stopPropagation();
  showImage((currentIndex + 1) % currentImages.length);
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  trapFocus(e);
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showImage((currentIndex - 1 + currentImages.length) % currentImages.length);
  if (e.key === 'ArrowRight') showImage((currentIndex + 1) % currentImages.length);
});

document.querySelectorAll('img').forEach(img => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openLightbox(img);
  });
});
