/* Inson Dubois Wood — Studio
   Plain JS. Lenis smooth scroll + GSAP parallax + IntersectionObserver reveals.
   No build step; libs loaded via CDN in index.html.
*/
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader ---------- */
  window.addEventListener('load', function () {
    var loader = document.querySelector('.loader');
    if (loader) setTimeout(function () { loader.classList.add('done'); }, 1500);
  });

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({
      duration: 1.25,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5
    });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Custom cursor ---------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    var cur = document.createElement('div');
    cur.className = 'cursor';
    document.body.appendChild(cur);
    var cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function follow() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(follow);
    })();
    var hov = 'a, button, .tile';
    document.querySelectorAll(hov).forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('is-hover'); });
    });
  }

  /* ---------- Header shrink ---------- */
  var header = document.querySelector('.header');
  function onScroll() {
    var y = window.scrollY || (lenis && lenis.scroll) || 0;
    if (header) header.classList.toggle('shrink', y > 60);
  }
  addEventListener('scroll', onScroll, { passive: true });
  if (lenis) lenis.on('scroll', onScroll);
  onScroll();

  /* ---------- Headline split into lines ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var lines = el.innerHTML.split('<br>');
    el.innerHTML = lines.map(function (l) {
      return '<span class="line"><span>' + l.trim() + '</span></span>';
    }).join('');
  });

  /* ---------- IntersectionObserver reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.tile, .rise, .line, [data-reveal]').forEach(function (el) { io.observe(el); });

  /* ---------- Hero parallax ---------- */
  if (window.gsap && window.ScrollTrigger && !reduce) {
    var hi = document.querySelector('.hero-img img');
    if (hi) window.gsap.to(hi, { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    document.querySelectorAll('.tile .frame img').forEach(function (img) {
      window.gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.closest('.tile'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Marquee (velocity-reactive) ---------- */
  var mt = document.querySelector('.marquee-track');
  if (mt && !reduce) {
    // duplicate content for seamless loop
    mt.innerHTML += mt.innerHTML;
    var mx = 0, base = 0.4, speed = base, half = mt.scrollWidth / 2;
    (function loop() {
      mx -= speed; if (Math.abs(mx) >= half) mx += half;
      mt.style.transform = 'translateX(' + mx + 'px)';
      speed += (base - speed) * 0.05;
      requestAnimationFrame(loop);
    })();
    if (lenis) lenis.on('scroll', function (e) { speed = base + Math.min(6, Math.abs(e.velocity || 0) * 0.4); });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
