/* Gedeeld script voor alle pagina's: cursor, menu, scroll-reveal en golven in de CTA.
   Elk onderdeel staat los, zodat een fout in het ene de rest niet kan blokkeren. */

/* NIEUWE PAGINA ALTIJD BOVENAAN OPENEN (behalve bij een link naar een plek op de pagina) */
(function () {
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  if (location.hash) return;
  var top = function () { window.scrollTo(0, 0); };
  top();
  window.addEventListener('load', function () { setTimeout(top, 0); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) top(); });
})();

/* EIGEN CURSOR — alleen met een echte muis. Pas als hij draait, verdwijnt de gewone pijl. */
(function () {
  try {
    var dot = document.getElementById('cursor'), ring = document.getElementById('cursorRing');
    if (!dot || !ring || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var mx = -100, my = -100, rx = -100, ry = -100, gezien = false;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!gezien) { gezien = true; rx = mx; ry = my; document.documentElement.classList.add('cursor-on'); }
    });
    document.addEventListener('mouseleave', function () { document.documentElement.classList.remove('cursor-on'); gezien = false; });
    (function loop() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
  } catch (e) { document.documentElement.classList.remove('cursor-on'); }
})();

/* HAMBURGERMENU — op elke pagina hetzelfde */
(function () {
  var btn = document.getElementById('hamburger'), menu = document.getElementById('nav-mobile');
  if (!btn || !menu) return;
  function zet(open) {
    btn.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    document.body.style.overflow = open ? 'hidden' : '';
    document.documentElement.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  btn.addEventListener('click', function () { zet(!menu.classList.contains('open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { zet(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { zet(false); btn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 768 && menu.classList.contains('open')) zet(false); });
})();

/* SCROLL-REVEAL */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('visible'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  els.forEach(function (el) { io.observe(el); });
})();

/* GOLVEN IN DE "LATEN WE SAMENWERKEN"-BAND */
(function () {
  var canvas = document.getElementById('cta-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d'), W = 0, H = 0, t = Math.PI, zichtbaar = true;
  var stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; if (stil) draw(); }
  var waves = [
    { color: 'rgba(65,4,4,0.70)', amp: 60, freq: 0.003, speed: 0.22, phase: 0.5, yFrac: 0.4 },
    { color: 'rgba(85,8,8,0.50)', amp: 80, freq: 0.0038, speed: 0.38, phase: 1.8, yFrac: 0.6 },
    { color: 'rgba(45,2,2,0.60)', amp: 55, freq: 0.002, speed: 0.16, phase: 2.9, yFrac: 0.78 }
  ];
  function draw() {
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    waves.forEach(function (w) {
      ctx.beginPath(); ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 3) {
        var y = H * w.yFrac + Math.sin(x * w.freq + t * w.speed + w.phase) * w.amp + Math.sin(x * w.freq * 1.7 + t * w.speed * 0.65 + w.phase) * w.amp * 0.45;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.fillStyle = w.color; ctx.fill();
    });
  }
  function loop() { if (zichtbaar) { draw(); t += 0.016; } requestAnimationFrame(loop); }
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { zichtbaar = e[0].isIntersecting; }).observe(canvas);
  if (stil) draw(); else loop();
})();
