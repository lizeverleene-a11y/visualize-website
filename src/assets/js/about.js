/* FUN FACTS: cijfers tellen op, woorden zoeken letter per letter hun juiste letters,
   en het oneindig-teken raast door de cijfers voor het verschijnt.
   Start pas als je naar de fun facts scrolt. Zonder JavaScript of met
   "beweging beperken" zie je gewoon de eindwaarden. */
(function () {
  var grid = document.querySelector('.facts-grid');
  if (!grid || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var kaarten = Array.prototype.slice.call(grid.querySelectorAll('.fact-number'));
  var easeOut = function (t) { return 1 - (1 - t) * (1 - t); };
  var DUUR = 2600; // alle kaartjes starten en eindigen samen

  // Beginstand klaarzetten (alleen als JavaScript draait)
  kaarten.forEach(function (el) {
    if (el.hasAttribute('data-tel')) {
      el.querySelector('.tel').textContent = '0';
    } else if (el.hasAttribute('data-oneindig')) {
      el.querySelector('.tel').textContent = '0';
    } else if (el.hasAttribute('data-letters')) {
      el.dataset.eind = el.innerHTML;
      el.dataset.tekst = el.textContent;
      el.textContent = '\u00a0';
    }
  });

  function telOp(el, doel, duur, klaar) {
    var tel = el.querySelector('.tel'), start = null;
    function stap(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / duur);
      tel.textContent = Math.round(easeOut(t) * doel);
      if (t < 1) requestAnimationFrame(stap);
      else if (klaar) klaar();
    }
    requestAnimationFrame(stap);
  }

  function speel(el) {
    if (el.hasAttribute('data-tel')) {
      var doel = parseInt(el.getAttribute('data-tel'), 10);
      telOp(el, doel, DUUR);
    } else if (el.hasAttribute('data-oneindig')) {
      var tel = el.querySelector('.tel'), start = null;
      (function stap(ts) {
        if (!start) start = ts;
        var t = Math.min(1, (ts - start) / DUUR);
        tel.textContent = Math.round(Math.pow(t, 2) * 99999);
        if (t < 1) requestAnimationFrame(stap);
        else tel.textContent = '∞';
      })(performance.now());
    } else if (el.hasAttribute('data-letters')) {
      // Letters zoeken: elke letter flitst door willekeurige letters tot hij
      // op de juiste valt, van links naar rechts, net zoals de cijfers optellen.
      var tekst = Array.from(el.dataset.tekst), lengte = tekst.length;
      var GROOT = 'ABCDEFGHIJKLMNOPRSTUVWZ', KLEIN = 'abcdefghijklmnoprstuvwz';
      var duur = DUUR, begin = null, laatst = 0;
      var esc = function (c) { return c === '<' ? '&lt;' : c === '&' ? '&amp;' : c; };
      (function stap(ts) {
        if (!begin) begin = ts;
        var t = ts - begin;
        if (t - laatst >= 75 || t >= duur) {
          laatst = t;
          var html = '';
          tekst.forEach(function (c, i) {
            var vast = t >= 500 + ((i + 1) / lengte) * (duur - 500);
            if (c === ' ') html += ' ';
            else if (c === "'") html += '<span class="fb">\'</span>';
            else if (vast) html += esc(c);
            else {
              var bron = c === c.toUpperCase() ? GROOT : KLEIN;
              html += bron[Math.floor(Math.random() * bron.length)];
            }
          });
          el.innerHTML = html;
        }
        if (t < duur) requestAnimationFrame(stap);
        else el.innerHTML = el.dataset.eind;
      })(performance.now());
    }
  }

  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    kaarten.forEach(speel);
  }, { threshold: 0.35 });
  io.observe(grid);
})();
