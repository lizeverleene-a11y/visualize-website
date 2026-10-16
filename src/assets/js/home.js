/* WOORD DAT VAN LETTERTYPE WISSELT IN DE HERO */
(function () {
  var word = document.getElementById('rotating-word');
  if (!word || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var fonts = [
    { family: "'Outfit',sans-serif", label: 'SHAPE', stroke: '1.5px', weight: '800' },
    { family: "'Bungee',cursive", label: 'SHAPE' },
    { family: "'NanumPen',cursive", label: 'SHAPE', size: '125%', shift: '0.17em' }
  ];
  var current = 0, deleteSpeed = 60, typeSpeed = 80, pauseTime = 2600;
  function deleteText(cb) { var t = word.textContent; if (!t.length) { cb(); return; } word.textContent = t.slice(0, -1); setTimeout(function () { deleteText(cb); }, deleteSpeed); }
  function typeText(target, cb) { var full = target.label, cur = word.textContent; if (cur.length === full.length) { cb(); return; } word.textContent = full.slice(0, cur.length + 1); setTimeout(function () { typeText(target, cb); }, typeSpeed); }
  function cycle() {
    deleteText(function () {
      current = (current + 1) % fonts.length;
      var next = fonts[current];
      word.style.fontFamily = next.family;
      word.style.fontWeight = next.weight || '400';
      word.style.fontSize = next.size || '100%';
      word.style.lineHeight = '1';
      word.style.transform = next.shift ? 'translateY(' + next.shift + ')' : '';
      if (next.stroke) { word.style.webkitTextStroke = next.stroke + ' #bfdcba'; word.style.color = 'transparent'; }
      else { word.style.webkitTextStroke = 'none'; word.style.color = '#bfdcba'; }
      typeText(next, function () { setTimeout(cycle, pauseTime); });
    });
  }
  // Pas beginnen als alle drie de lettertypes echt geladen zijn, zodat er nooit
  // even een ander lettertype tussen glipt.
  var klaar = (document.fonts && document.fonts.load)
    ? Promise.all([
        document.fonts.load("800 1em 'Outfit'", 'SHAPE'),
        document.fonts.load("1em 'Bungee'", 'SHAPE'),
        document.fonts.load("1em 'NanumPen'", 'SHAPE')
      ])
    : Promise.resolve();
  klaar.then(function () { setTimeout(cycle, pauseTime); }, function () { /* lettertype niet geladen: woord blijft gewoon staan */ });
})();

/* ZWEVENDE FOTO DIE MEE BEWEEGT MET DE MUIS
   Gebruikt bij "Mijn diensten" en bij "Mijn werk". Alleen met een echte muis. */
function zwevendeFoto(lijstId, zweefId, kaderId, rijSelector) {
  var list = document.getElementById(lijstId), float = document.getElementById(zweefId), frame = document.getElementById(kaderId);
  if (!list || !float || !frame) return;
  var rows = Array.prototype.slice.call(list.querySelectorAll(rijSelector || '.hover-row'));
  var stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var muis = window.matchMedia('(hover:hover) and (pointer:fine)');
  if (!muis.matches || !rows.length) return;   // op gsm en tablet: geen zwevende foto

  var imgs = rows.map(function (row) {
    var im = new Image();
    im.alt = ''; im.decoding = 'async';
    im.style.objectPosition = row.dataset.pos || 'center';
    frame.appendChild(im);
    return im;
  });
  var geladen = false;
  function laad() { if (geladen) return; geladen = true; rows.forEach(function (row, i) { imgs[i].src = row.dataset.img; }); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { laad(); io.disconnect(); } }, { rootMargin: '300px' });
    io.observe(list);
  } else laad();

  var mx = 0, my = 0, fx = 0, fy = 0, vx = 0, actief = false, gestart = false;
  window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; if (!gestart) { fx = mx; fy = my; gestart = true; } });

  (function loop() {
    if (actief || float.classList.contains('show')) {
      var k = stil ? 1 : 0.13;
      var nx = fx + (mx - fx) * k;
      vx = nx - fx; fx = nx; fy += (my - fy) * k;
      var rot = stil ? 0 : Math.max(-10, Math.min(10, vx * 0.5));
      var dx = parseFloat(float.dataset.dx || 0) * float.offsetWidth, dy = parseFloat(float.dataset.dy || 0) * float.offsetHeight;
      float.style.transform = 'translate3d(' + (fx - float.offsetWidth / 2 + dx) + 'px,' + (fy - float.offsetHeight / 2 + dy) + 'px,0) rotate(' + rot + 'deg)';
    } else { fx = mx; fy = my; }
    requestAnimationFrame(loop);
  })();

  function toon(i) {
    laad();
    imgs.forEach(function (im, j) { im.classList.toggle('cur', j === i); });
    rows.forEach(function (r, j) { r.classList.toggle('on', j === i); });
    list.classList.add('active'); float.classList.add('show'); actief = true;
  }
  function verberg() {
    rows.forEach(function (r) { r.classList.remove('on'); });
    list.classList.remove('active'); float.classList.remove('show'); actief = false;
  }
  rows.forEach(function (row, i) {
    row.addEventListener('mouseenter', function () { toon(i); });
    row.addEventListener('focus', function () {
      var b = row.getBoundingClientRect();
      mx = b.left + b.width * 0.55; my = b.top + b.height / 2;
      if (!gestart) { fx = mx; fy = my; gestart = true; }
      toon(i);
    });
    row.addEventListener('blur', verberg);
  });
  list.addEventListener('mouseleave', verberg);
  window.addEventListener('scroll', function () { if (actief && !list.matches(':hover')) verberg(); }, { passive: true });
}
zwevendeFoto('service-list', 'service-float', 'service-frame', '.service-link');
zwevendeFoto('hover-list', 'hover-float', 'hover-frame');
