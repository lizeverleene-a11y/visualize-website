/* OVER MIJ: de portretfoto's in de boog wisselen snel na elkaar, zonder effect.
   Pauzeert als de foto's niet in beeld zijn. */
(function () {
  var boog = document.querySelector('.pf-stack[data-rol="boog"]');
  if (!boog) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var fotos = boog.querySelectorAll('img'), n = fotos.length;
  if (n < 2) return;
  var nu = 0, zichtbaar = true, INTERVAL = 700, geladen = false;

  function laadAlles() {
    if (geladen) return; geladen = true;
    fotos.forEach(function (im) { if (im.loading === 'lazy') im.loading = 'eager'; });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      zichtbaar = e[0].isIntersecting;
      if (zichtbaar) laadAlles();
    }, { rootMargin: '200px' }).observe(boog);
  } else laadAlles();

  setInterval(function () {
    if (!zichtbaar || document.hidden) return;
    var volgende = (nu + 1) % n;
    if (!fotos[volgende].complete || !fotos[volgende].naturalWidth) return;   // nog niet geladen: even wachten
    fotos[volgende].classList.add('cur');
    fotos[nu].classList.remove('cur');
    nu = volgende;
  }, INTERVAL);
})();
