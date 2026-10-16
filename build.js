// Bouwt de website: neemt de pagina's uit src/, vult de projecten en klanten
// in vanuit content/*.json en schrijft het resultaat naar dist/.
// Gebruik: node build.js   (geen extra pakketten nodig)

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const lees = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const leesJson = (p, sleutel) => {
  try {
    const data = JSON.parse(lees(p));
    return Array.isArray(data) ? data : (data[sleutel] || []);
  } catch (e) {
    console.error(`Kon ${p} niet lezen: ${e.message}`);
    process.exit(1);
  }
};

const projecten = leesJson('content/projecten.json', 'projecten').filter((p) => p && p.naam);
const klanten = leesJson('content/klanten.json', 'klanten').filter((k) => k && k.logo);
const overMij = fs.existsSync(path.join(ROOT, 'content/over-mij.json'))
  ? leesJson('content/over-mij.json', 'fotos').map((f) => (typeof f === 'string' ? { foto: f } : f)).filter((f) => f && f.foto)
  : [];

// ---------- hulpfuncties ----------
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Sommige tekens in namen krijgen een aparte span (vroeger nodig voor Pontiac). Alles is nu Outfit, dus dit is enkel nog veiligheid.
const sierNaam = (s) => Array.from(String(s ?? '')).map((ch) =>
  /[A-Za-z0-35-9 .,?]/.test(ch) ? esc(ch) : `<span class="fb">${esc(ch)}</span>`).join('');

const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const foto = (p) => {
  if (!p) return '';
  if (/^https?:\/\//.test(p)) return p;
  // Pages CMS bewaart normaal "/assets/uploads/...", maar vang ook "src/assets/..." op
  return '/' + String(p).replace(/^\/+/, '').replace(/^src\//, '');
};

const fotosVan = (p) => (Array.isArray(p.fotos) ? p.fotos : [p.fotos]).filter(Boolean).map(foto);
const korteNaam = (p) => (p.korte_naam && p.korte_naam.trim()) || p.naam;
const focus = (p) => (p.focus && p.focus.trim()) || 'center';

const categorieen = (p) => ['huisstijl', 'website', 'visitekaartjes', 'print'].filter((c) => p[c]).join(' ');

// ---------- blokken ----------
function homeLijst() {
  const lijst = projecten.filter((p) => p.op_home && fotosVan(p).length);
  if (!lijst.length) return '';
  const rijen = lijst.map((p, i) => {
    const f = fotosVan(p)[0];
    return `      <li><a class="hover-row" href="/work/#${slug(p.naam)}" data-img="${esc(f)}" data-pos="${esc(focus(p))}">
        <span class="hover-nr">${String(i + 1).padStart(2, '0')}</span>
        <span class="hover-name">${sierNaam(korteNaam(p))}</span>
        <span class="hover-tag">${esc(p.soort)}</span>
      </a></li>`;
  }).join('\n');
  const kaarten = lijst.map((p) => {
    const f = fotosVan(p)[0];
    return `    <a href="/work/#${slug(p.naam)}" class="mini-card">
      <img src="${esc(f)}" alt="${esc(korteNaam(p))}" style="object-position:${esc(focus(p))};" loading="lazy">
      <div class="mini-card-info">
        <span class="mini-card-tag">${esc(p.soort)}</span>
        <span class="mini-card-name">${sierNaam(korteNaam(p))}</span>
      </div>
    </a>`;
  }).join('\n');
  return `  <ol class="hover-list" id="hover-list">
${rijen}
  </ol>
  <div class="hover-float" id="hover-float" aria-hidden="true"><div class="hover-frame" id="hover-frame"></div></div>
  <div class="mini-portfolio-grid">
${kaarten}
  </div>`;
}

function workGrid() {
  return projecten.map((p, i) => {
    const fotos = fotosVan(p);
    const kaart = `card-${(i % 7) + 1}`;
    const info = `      <div class="project-info">
        <span class="project-tag">${esc(p.soort)}</span>
        <span class="project-name">${sierNaam(p.naam)}</span>
      </div>`;
    if (fotos.length <= 1) {
      return `    <div class="project-card ${kaart}" id="${slug(p.naam)}" data-cat="${categorieen(p)}">
      ${fotos[0] ? `<img src="${esc(fotos[0])}" alt="${esc(p.naam)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" loading="lazy">` : ''}
      <div class="card-vignette"></div>
${info}
    </div>`;
    }
    const slides = fotos.map((f, j) =>
      `        <img class="carousel-slide${j === 0 ? ' active' : ''}" src="${esc(f)}" alt="${esc(p.naam)} ${j + 1}" style="object-fit:cover;"${j === 0 ? '' : ' loading="lazy"'}>`).join('\n');
    return `    <div class="project-card ${kaart}" id="${slug(p.naam)}" data-cat="${categorieen(p)}">
      <div class="card-carousel">
${slides}
        <div class="card-vignette"></div>
        <button class="carousel-btn carousel-prev" aria-label="Vorige foto" onclick="event.stopPropagation();carouselPrev(this)">&#8249;</button>
        <button class="carousel-btn carousel-next" aria-label="Volgende foto" onclick="event.stopPropagation();carouselNext(this)">&#8250;</button>
        <div class="carousel-progress">
          <div class="carousel-progress-fill" style="width:${(100 / fotos.length).toFixed(1)}%"></div>
        </div>
      </div>
${info}
    </div>`;
  }).join('\n\n');
}

function klantenLogos() {
  return klanten.map((k) => `    <img src="${esc(foto(k.logo))}" alt="${esc(k.naam)}" loading="lazy">`).join('\n');
}

// About: portretfoto's die afwisselen in de boog en de cirkel.
// Zonder foto's tonen de vormen weer het logo en de ster, zoals vroeger.
function overMijVorm(rol) {
  if (overMij.length < 2) {
    return rol === 'boog'
      ? `        <span class="lv-star lv-star-1">&#x2726;</span>
        <span class="lv-star lv-star-2">&#x2726;</span>
        <span class="lv-star lv-star-3">&#x2726;</span>
        <img src="/assets/images/logo.png" alt="VISUALIZE by LV" style="width:85%;position:relative;z-index:1;">`
      : `        <span class="circle-star">&#x2726;</span>
        <span class="circle-label">Bredene</span>`;
  }
  if (rol === 'cirkel') {
    return `        <img class="pf-logo" src="/assets/images/logo-cirkel.png" alt="VISUALIZE by LV">`;
  }
  const start = 0;
  const fotos = overMij.map((f, i) => {
    const pos = esc((f.focus && f.focus.trim()) || 'center 38%');
    const eerste = i === start;
    return `          <img src="${esc(foto(f.foto))}" alt="${eerste ? (rol === 'boog' ? 'Lize, de ontwerper achter VISUALIZE by LV' : 'Lize') : ''}" style="object-position:${pos};--fx:${pos.split(' ')[0]};--fy:${pos.split(' ')[1] || '38%'}"${eerste ? ' class="cur"' : ''} decoding="async">`;
  }).join('\n');
  return `        <div class="pf-stack" data-rol="${rol}">
${fotos}
        </div>`;
}

// ---------- gedeelde stukken ----------
const PAGINAS = ['work', 'about', 'shop', 'contact'];
const LABEL = { work: 'Work', about: 'About', shop: 'Shop', contact: 'Contact' };

function header(actief) {
  const link = (k, extra = '') => `<a href="/${k}/"${k === actief ? ' class="active" aria-current="page"' : ''}${extra}>${LABEL[k]}</a>`;
  return `<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>
<nav>
  <a href="/" class="nav-logo"><img src="/assets/images/logo.png" alt="VISUALIZE by LV" width="400" height="77"></a>
  <ul class="nav-links">
${PAGINAS.map((k) => `    <li>${link(k)}</li>`).join('\n')}
  </ul>
  <button class="hamburger" id="hamburger" aria-label="Menu openen" aria-expanded="false" aria-controls="nav-mobile">
    <span></span><span></span><span></span>
  </button>
</nav>
<div class="nav-mobile" id="nav-mobile" aria-hidden="true">
  <div class="nm-bg"></div>
  <span class="nm-star s1">&#x2726;</span><span class="nm-star s2">&#x2726;</span><span class="nm-star s3">&#x2726;</span>
  <div class="nm-links">
${PAGINAS.map((k, i) => `    <a href="/${k}/" class="nm-link${k === actief ? ' active' : ''}"${k === actief ? ' aria-current="page"' : ''}><span class="nm-nr">0${i + 1}</span><span class="nm-word">${LABEL[k]}</span><span class="nm-sub" aria-hidden="true">&#x2192;</span></a>`).join('\n')}
  </div>
  <div class="nm-foot">
    <div class="nm-foot-text">
      <a href="/contact/" class="nm-cta">Laten we samenwerken &#x2192;</a>
      <span class="nm-meta">Studio &middot; Bredene &middot; Est. 2025</span>
    </div>
    <svg class="nm-badge" viewBox="0 0 120 120" aria-hidden="true">
      <defs><path id="nm-cirkel" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0"/></defs>
      <text><textPath href="#nm-cirkel" textLength="290">DESIGN MET JOEN GOESTE &#x2726; DESIGN MET JOEN GOESTE &#x2726;</textPath></text>
      <text class="nm-badge-star" x="60" y="68" text-anchor="middle">&#x2726;</text>
    </svg>
  </div>
</div>`;
}

const EMAIL = 'info@visualize.be';
const INSTAGRAM = 'https://www.instagram.com/visualize.be/';

const footer = `<footer>
  <a href="/" class="footer-logo"><img src="/assets/images/logo-footer.png" alt="Visualize" style="height:28px;width:auto;display:block;"></a>
  <ul class="footer-links">
${PAGINAS.map((k) => `    <li><a href="/${k}/">${LABEL[k]}</a></li>`).join('\n')}
  </ul>
  <span class="footer-copy">&copy; ${new Date().getFullYear()} &mdash; Alle rechten voorbehouden</span>
  <div class="footer-sub">
    <div class="footer-contact">
      <a href="mailto:${EMAIL}" class="footer-mail">${EMAIL}</a>
      <span class="footer-dot" aria-hidden="true">&#x2726;</span>
      <a href="${INSTAGRAM}" class="footer-insta" target="_blank" rel="noopener">Instagram <span aria-hidden="true">&#x2197;</span><span class="sr-only"> (opent in een nieuw venster)</span></a>
    </div>
    <div class="footer-legal"><span>BE 1021.006.459</span><span class="footer-dot" aria-hidden="true">&#x2726;</span><a href="/privacy/" class="footer-privacy">Privacyverklaring</a></div>
  </div>
</footer>`;

const head = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/favicon.png">
<link rel="preload" href="/assets/fonts/outfit-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/outfit-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/fonts.css">
<meta property="og:site_name" content="VISUALIZE by LV">
<meta property="og:image" content="https://visualize.be/assets/images/og.jpg">
<script>document.documentElement.classList.remove('no-js')</script>`;

const marquee = `<div class="marquee-strip">
    <div class="marquee-inner" aria-hidden="true">
${'      <span>DESIGN MET JOEN GOESTE</span><span class="dot">&#x2726;</span>\n'.repeat(12)}    </div>
  </div>`;

// ---------- bouwen ----------
function kopieer(van, naar) {
  fs.mkdirSync(naar, { recursive: true });
  for (const item of fs.readdirSync(van, { withFileTypes: true })) {
    const a = path.join(van, item.name), b = path.join(naar, item.name);
    if (item.isDirectory()) kopieer(a, b);
    else if (item.name.endsWith('.html')) {
      const rel = path.relative(SRC, a).split(path.sep);
      const pagina = rel.length > 1 ? rel[0] : 'home';
      let html = fs.readFileSync(a, 'utf8')
        .replace('{{head}}', () => head)
        .replace('{{header}}', () => header(pagina))
        .replace('{{footer}}', () => footer)
        .replace(/\{\{marquee\}\}/g, () => marquee)
        .replace('{{projecten_home}}', () => homeLijst())
        .replace('{{projecten_work}}', () => workGrid())
        .replace('{{klanten}}', () => klantenLogos())
        .replace('{{over_mij_boog}}', () => overMijVorm('boog'))
        .replace('{{over_mij_cirkel}}', () => overMijVorm('cirkel'));
      const over = html.match(/\{\{[a-z_]+\}\}/);
      if (over) console.warn(`Let op: ${over[0]} niet ingevuld in ${rel.join('/')}`);
      fs.writeFileSync(b, html);
    } else fs.copyFileSync(a, b);
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
kopieer(SRC, DIST);
console.log(`Klaar: ${projecten.length} projecten en ${klanten.length} klanten in dist/`);
