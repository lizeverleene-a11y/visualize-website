/* FILTER */
(function () {
  var knoppen = document.querySelectorAll('.filter-btn');
  knoppen.forEach(function (btn) {
    btn.addEventListener('click', function () {
      knoppen.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
      var filter = btn.textContent.trim().toLowerCase();
      document.querySelectorAll('.project-card').forEach(function (card) {
        var cat = (card.dataset.cat || '').toLowerCase().split(' ');
        card.style.display = (filter === 'alles' || cat.indexOf(filter) > -1) ? '' : 'none';
      });
    });
  });
})();

/* CAROUSEL — globale functies, want de knoppen roepen ze rechtstreeks aan */
function carouselShow(carousel, n) {
  var slides = carousel.querySelectorAll('.carousel-slide'), cur = 0;
  slides.forEach(function (s, i) { if (s.classList.contains('active')) cur = i; });
  slides[cur].classList.remove('active');
  var next = (n + slides.length) % slides.length;
  slides[next].classList.add('active');
  var fill = carousel.querySelector('.carousel-progress-fill');
  if (fill) fill.style.width = ((next + 1) / slides.length * 100) + '%';
}
function carouselStap(btn, stap) {
  var carousel = btn.closest('.card-carousel'), slides = carousel.querySelectorAll('.carousel-slide'), cur = 0;
  slides.forEach(function (s, i) { if (s.classList.contains('active')) cur = i; });
  carouselShow(carousel, cur + stap);
}
function carouselPrev(btn) { carouselStap(btn, -1); }
function carouselNext(btn) { carouselStap(btn, 1); }

/* SWIPEN OP GSM */
document.querySelectorAll('.card-carousel').forEach(function (c) {
  var x0 = null;
  c.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  c.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) carouselShow(c, (function () { var s = c.querySelectorAll('.carousel-slide'), cur = 0; s.forEach(function (el, i) { if (el.classList.contains('active')) cur = i; }); return cur; })() + (dx < 0 ? 1 : -1));
  }, { passive: true });
});

/* LINK VANAF DE DIENSTEN (/work/#huisstijl): meteen de juiste filter kiezen */
(function () {
  var h = decodeURIComponent(location.hash.slice(1)).toLowerCase();
  if (!h) return;
  document.querySelectorAll('.filter-btn').forEach(function (b) {
    if (b.textContent.trim().toLowerCase() === h) b.click();
  });
})();

/* LINK VANAF DE HOMEPAGE (/work/#viventra): project even laten oplichten */
(function () {
  var id = decodeURIComponent(location.hash.slice(1));
  var el = id && document.getElementById(id);
  if (!el) return;
  setTimeout(function () {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('is-target');
    setTimeout(function () { el.classList.remove('is-target'); }, 2200);
  }, 150);
})();
