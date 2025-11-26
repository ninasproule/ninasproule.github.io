// Fade-in grid images per-row using IntersectionObserver; images animate left-to-right in a snake pattern
document.addEventListener('DOMContentLoaded', function () {
  // Initialize Lucide icons (replaces <i data-lucide> placeholders with SVGs)
  if (window.lucide && typeof lucide.createIcons === 'function') {
    try { lucide.createIcons(); } catch (e) { console.warn('Lucide createIcons failed', e); }
  }
  const rows = document.querySelectorAll('.image-grid');
  if (!('IntersectionObserver' in window)) {
    // If unsupported, show images immediately
    rows.forEach(row => row.querySelectorAll('img').forEach(img => img.classList.add('in-view')));
    return;
  }

  const revealDelay = 120; // ms between images within the row
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const rowIdx = parseInt(entry.target.dataset.rowIdx || 0, 10);
        const imgs = Array.from(entry.target.querySelectorAll('img'));
        // Determine order: even rows left-to-right, odd rows right-to-left (snake)
        const order = (rowIdx % 2 === 0) ? imgs.map((_, i) => i) : imgs.map((_, i) => imgs.length - 1 - i);
        order.forEach((imgIdx, idx) => {
          const img = imgs[imgIdx];
          setTimeout(() => img.classList.add('in-view'), idx * revealDelay);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  // attach row index for snake path direction
  rows.forEach((row, idx) => {
    row.dataset.rowIdx = idx;
    io.observe(row);
  });
});

// Scrollspy: update .nav-link.active based on section visibility
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  if (!navLinks.length) return;
  const header = document.querySelector('.site-header');
  const headerHeight = header ? header.offsetHeight : 0;
  // Only observe top-level section elements (avoid nested anchors within a section)
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)
    .filter(el => el.tagName && el.tagName.toLowerCase() === 'section');
  const options = { rootMargin: `-${headerHeight + 8}px 0px -40% 0px`, threshold: [0.15, 0.4, 0.75] };
  const spy = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting);
    if (visible.length === 0) return;
    // choose the most visible section
    const best = visible.reduce((a, b) => (a.intersectionRatio > b.intersectionRatio ? a : b));
    const id = `#${best.target.id}`;
    navLinks.forEach(l => {
      const isActive = l.getAttribute('href') === id;
      l.classList.toggle('active', isActive);
      if (isActive) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  }, options);
  sections.forEach(s => spy.observe(s));

  // immediate highlight for clicked links
  navLinks.forEach(link => link.addEventListener('click', () => {
    navLinks.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
    link.classList.add('active');
    link.setAttribute('aria-current', 'true');
  }));

  // Timeline reveal & connector line animation
  const timelineList = document.querySelector('.timeline-list');
  const timelineSection = document.querySelector('#timeline');
  if (timelineList && timelineSection && 'IntersectionObserver' in window) {
    const timelineItems = Array.from(timelineList.querySelectorAll('.timeline-item'));
    const tlObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          timelineList.classList.add('in-view');
          // stagger reveal of items
          timelineItems.forEach((el, idx) => setTimeout(() => el.classList.add('in-view'), idx * 150));
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: `-${headerHeight + 8}px 0px -30% 0px`, threshold: 0.12 });
    tlObserver.observe(timelineSection);
  }
});

/* Optionally export functions or any needed API in future */
