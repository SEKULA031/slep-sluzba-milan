const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Otvori meni');
  nav.classList.remove('open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
const track = document.querySelector('.gallery-track');
const slides = [...track.querySelectorAll('figure')];
const count = document.querySelector('.count');
let current = 0;
let target = null;
let settleTimer;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
function nearest() {
  const center = track.getBoundingClientRect().left + track.clientWidth / 2;
  return slides.reduce((best, slide, i) => {
    const distance = s => Math.abs(s.getBoundingClientRect().left + s.clientWidth / 2 - center);
    return distance(slide) < distance(slides[best]) ? i : best;
  }, 0);
}
function update() {
  current = nearest();
  count.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
}
function centerSlide(index, behavior) {
  const item = slides[index].getBoundingClientRect();
  const bounds = track.getBoundingClientRect();
  track.scrollTo({left: track.scrollLeft + item.left - bounds.left - (track.clientWidth - item.width) / 2, behavior});
}
function go(delta) {
  target = ((target ?? nearest()) + delta + slides.length) % slides.length;
  centerSlide(target, motion.matches ? 'instant' : 'smooth');
}
document.querySelector('.prev').addEventListener('click', () => go(-1));
document.querySelector('.next').addEventListener('click', () => go(1));
track.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault(); go(e.key === 'ArrowRight' ? 1 : -1);
  }
});
track.addEventListener('pointerdown', () => { target = null; });
track.addEventListener('wheel', () => { target = null; }, {passive:true});
track.addEventListener('scroll', () => {
  update();
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => { target = null; update(); }, 150);
}, {passive:true});
let previousWidth = track.clientWidth;
new ResizeObserver(() => {
  if (track.clientWidth !== previousWidth) {
    previousWidth = track.clientWidth;
    target = null;
    centerSlide(current, 'instant');
    update();
  }
}).observe(track);
update();
