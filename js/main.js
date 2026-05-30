/* INSON DUBOIS WOOD — Studio
   Quiet motion only: smooth scroll, soft reveals, gentle parallax.
   No custom cursor, no magnetic, no marquee, no theatrics.
   Plain JS, CDN libs.
*/
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader (brief, bulletproof dismiss) ---------- */
  (function () {
    var l = document.querySelector('.loader');
    var fired = false;
    function dismiss() {
      if (fired) return; fired = true;
      document.body.classList.add('ready');
      if (l) { l.classList.add('done'); l.style.opacity = '0'; l.style.pointerEvents = 'none'; setTimeout(function () { l.style.display = 'none'; }, 1000); }
    }
    if (document.readyState === 'complete') setTimeout(dismiss, 1100);
    else window.addEventListener('load', function () { setTimeout(dismiss, 1100); });
    setTimeout(dismiss, 3500);
  })();

  /* ---------- Lenis — smooth, not heavy ---------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.5
    });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var t = document.querySelector(id);
        if (t) { e.preventDefault(); lenis.scrollTo(t, { duration: 1.4 }); }
      });
    });
  }

  /* ---------- Header shrink ---------- */
  var header = document.querySelector('.header');
  function onScroll() { var y = window.scrollY || (lenis && lenis.scroll) || 0; if (header) header.classList.toggle('shrink', y > 80); }
  addEventListener('scroll', onScroll, { passive: true });
  if (lenis) lenis.on('scroll', onScroll);
  onScroll();

  /* ---------- Split hero headline into lines ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var parts = el.innerHTML.split('<br>');
    el.innerHTML = parts.map(function (p) { return '<span class="line"><span>' + p.trim() + '</span></span>'; }).join('');
  });

  /* ---------- Reveals (scroll-position based, robust) ---------- */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal,.reveal-frame,.hero,[data-reveal]'));
  function checkReveal() {
    var vh = window.innerHeight;
    for (var i = revealEls.length - 1; i >= 0; i--) {
      var r = revealEls[i].getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > -10) { revealEls[i].classList.add('in'); revealEls.splice(i, 1); }
    }
  }
  checkReveal();
  addEventListener('scroll', checkReveal, { passive: true });
  addEventListener('resize', checkReveal);
  if (lenis) lenis.on('scroll', checkReveal);
  window.addEventListener('load', function () { checkReveal(); setTimeout(checkReveal, 300); });
  setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('in'); }); }, 5000);

  /* ---------- Gentle parallax (very subtle) ---------- */
  if (window.gsap && window.ScrollTrigger && !reduce) {
    document.querySelectorAll('.hero-media .zoom').forEach(function (z) {
      window.gsap.to(z, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: z.closest('.hero-media'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    document.querySelectorAll('.tile .frame img').forEach(function (img) {
      window.gsap.fromTo(img, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: img.closest('.tile'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
    Array.prototype.forEach.call(document.images, function (im) { if (!im.complete) im.addEventListener('load', function () { window.ScrollTrigger.refresh(); }, { once: true }); });
  }

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
