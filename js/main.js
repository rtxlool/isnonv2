/* INSON DUBOIS WOOD — Studio
   Cinematic motion layer. Lenis inertia scroll + GSAP parallax +
   IntersectionObserver reveals + magnetic links + adaptive cursor.
   Philosophy: motion you feel, not notice. Plain JS, CDN libs.
*/
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- Loader ---------- */
  window.addEventListener('load', function () {
    var l = document.querySelector('.loader');
    if (l) setTimeout(function () { l.classList.add('done'); document.body.classList.add('ready'); }, 1900);
  });

  /* ---------- Lenis — heavy, deliberate inertia ---------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({
      duration: 1.5,                       // heavier than default — slows the user emotionally
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true, wheelMultiplier: 0.92, touchMultiplier: 1.4, lerp: 0.085
    });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    // anchor links glide via Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 2.0 }); }
      });
    });
  }

  /* ---------- Refined cursor (adapts over dark sections) ---------- */
  var cur;
  if (fine && !reduce) {
    cur = document.createElement('div'); cur.className = 'cursor'; document.body.appendChild(cur);
    var cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function f() {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      // detect dark surface under cursor for contrast swap
      requestAnimationFrame(f);
    })();
    document.querySelectorAll('a, button, .tile, [data-mag]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('hover'); });
    });
  }

  /* ---------- Magnetic links/buttons ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-mag]').forEach(function (el) {
      var rect;
      el.addEventListener('mouseenter', function () { rect = el.getBoundingClientRect(); });
      el.addEventListener('mousemove', function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        var mx = e.clientX - (rect.left + rect.width / 2);
        var my = e.clientY - (rect.top + rect.height / 2);
        el.style.transform = 'translate(' + mx * 0.28 + 'px,' + my * 0.34 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Header shrink + dark-section cursor swap ---------- */
  var header = document.querySelector('.header');
  var darkZones = [];
  function measureDark() { darkZones = [].map.call(document.querySelectorAll('[data-dark]'), function (el) { var r = el.getBoundingClientRect(); return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY }; }); }
  function onScroll() {
    var y = window.scrollY || (lenis && lenis.scroll) || 0;
    if (header) header.classList.toggle('shrink', y > 80);
    if (cur) { var mid = y + innerHeight / 2; var dark = darkZones.some(function (z) { return mid > z.top && mid < z.bottom; }); cur.classList.toggle('dark', dark); }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', measureDark);
  if (lenis) lenis.on('scroll', onScroll);
  setTimeout(measureDark, 100); onScroll();

  /* ---------- Split headlines into lines ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var parts = el.innerHTML.split('<br>');
    el.innerHTML = parts.map(function (p) { return '<span class="line"><span>' + p.trim() + '</span></span>'; }).join('');
  });
  // wrap hero eyebrow text for masked rise
  document.querySelectorAll('[data-mask] ').forEach(function (el) { el.innerHTML = '<span>' + el.innerHTML + '</span>'; });

  /* ---------- Reveal observer (generous margin so things "arrive") ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.16, rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.reveal,.reveal-frame,.tile,.hero,[data-reveal]').forEach(function (el) { io.observe(el); });

  /* ---------- GSAP parallax ---------- */
  if (window.gsap && window.ScrollTrigger && !reduce) {
    // hero feature drifts up subtly
    document.querySelectorAll('.hero-media .zoom').forEach(function (z) {
      window.gsap.to(z, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: z.closest('.hero-media'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // gallery tiles — gentle inner drift
    document.querySelectorAll('.tile .frame img').forEach(function (img) {
      window.gsap.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.closest('.tile'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // full-bleed break — deep parallax
    document.querySelectorAll('.break .bimg').forEach(function (b) {
      window.gsap.fromTo(b, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: b.closest('.break'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // re-measure after images load (image-heavy page)
    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); measureDark(); });
    Array.prototype.forEach.call(document.images, function (im) { if (!im.complete) im.addEventListener('load', function () { window.ScrollTrigger.refresh(); }, { once: true }); });
  }

  /* ---------- Marquee (velocity-reactive, gentle) ---------- */
  var mt = document.querySelector('.marq-t');
  if (mt && !reduce) {
    mt.innerHTML += mt.innerHTML;
    var mx = 0, base = 0.35, sp = base, half = mt.scrollWidth / 2;
    (function loop() { mx -= sp; if (Math.abs(mx) >= half) mx += half; mt.style.transform = 'translateX(' + mx + 'px)'; sp += (base - sp) * 0.04; requestAnimationFrame(loop); })();
    if (lenis) lenis.on('scroll', function (e) { sp = base + Math.min(5, Math.abs(e.velocity || 0) * 0.32); });
  }

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
