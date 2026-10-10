const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const img = (id, w = 900, q = 72) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

// ---------- resolve photo ids (data-img) into real urls ----------
$$('[data-img]').forEach(el => {
  const url = img(el.dataset.img, el.dataset.w || 1600);
  if (el.tagName === 'IMG') el.src = url; else el.style.backgroundImage = `url('${url}')`;
});
$$('[data-bg]').forEach(el => {
  const url = img(el.dataset.bg, 1920, 70);
  if (el.classList.contains('cta-sec')) el.style.setProperty('--bgimg', `url('${url}')`);
  else el.style.backgroundImage = `linear-gradient(rgba(11,8,7,.8),rgba(11,8,7,.88)),url('${url}')`;
});

// ---------- loader (counts to 100) ----------
(function () {
  const n = $('#loadNum'), t0 = performance.now(), dur = 1500;
  (function tick(t) {
    const p = clamp((t - t0) / dur);
    n.textContent = Math.round(p * 100);
    if (p < 1) requestAnimationFrame(tick);
    else setTimeout(() => $('#loader').classList.add('done'), 250);
  })(t0);
})();

// ---------- hero title: split into letters ----------
$$('.hl').forEach((el, li) => {
  el.innerHTML = [...el.dataset.t].map((c, i) =>
    `<span class="ch" style="animation-delay:${1.9 + li * .18 + i * .045}s">${c}</span>`).join('');
});

// ---------- hero slideshow ----------
const sbg = $$('.sbg'), hdots = $$('#heroDots button');
let hs = 0, hTimer;
function heroGo(i) {
  hs = i;
  sbg.forEach((s, k) => s.classList.toggle('active', k === i));
  hdots.forEach((d, k) => { d.classList.remove('active'); if (k === i) { void d.offsetWidth; d.classList.add('active'); } });
}
function heroAuto() { clearInterval(hTimer); hTimer = setInterval(() => heroGo((hs + 1) % sbg.length), 5000); }
hdots.forEach((d, i) => d.onclick = () => { heroGo(i); heroAuto(); });
heroAuto();

// ---------- typed rotating word ----------
const words = ['SMOKE', 'FLAME', 'CRUST', 'SEAR', 'PASSION'];
let wi = 0, ci = words[0].length, del = true;
const rot = $('#rot');
(function type() {
  rot.textContent = words[wi].slice(0, ci);
  if (del) { ci--; if (ci < 0) { del = false; wi = (wi + 1) % words.length; ci = 0; } }
  else { ci++; if (ci > words[wi].length) { del = true; ci = words[wi].length; return setTimeout(type, 1400); } }
  setTimeout(type, del ? 45 : 90);
})();

// ---------- embers (pauses offscreen) ----------
(function () {
  const cv = $('#embers'), cx = cv.getContext('2d'), hero = $('#home');
  let W, H, run = true; const ps = [];
  const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  resize(); addEventListener('resize', resize);
  const mk = rand => ({ x: Math.random() * W, y: rand ? Math.random() * H : H + 10, r: Math.random() * 2 + .8, v: Math.random() * 1 + .4,
    dx: (Math.random() - .5) * .5, c: Math.random() < .7 ? '255,120,40' : '255,190,80', a: Math.random() * .6 + .3 });
  for (let i = 0; i < 40; i++) ps.push(mk(true));
  new IntersectionObserver(e => { run = e[0].isIntersecting; if (run) frame(); }).observe(hero);
  function frame() {
    if (!run) return;
    cx.clearRect(0, 0, W, H);
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      p.y -= p.v; p.x += p.dx + Math.sin(p.y / 30) * .3; p.a -= .0015;
      cx.fillStyle = `rgba(${p.c},${Math.max(p.a, 0)})`;
      cx.fillRect(p.x, p.y, p.r * 2, p.r * 2);
      if (p.y < -10 || p.a <= 0) ps[i] = mk(false);
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

// ---------- scroll (one rAF-throttled handler) ----------
const nav = $('#nav'), totop = $('#totop'), prog = $('#progress'), marq = $('.marq');
let lastY = scrollY, skew = 0, ticking = false, maxScroll = 1;
const calc = () => { maxScroll = document.documentElement.scrollHeight - innerHeight; };
addEventListener('load', calc); addEventListener('resize', calc);
let navS = false, topS = false;
function onScroll() {
  const y = scrollY;
  prog.style.transform = `scaleX(${y / maxScroll})`;
  const n = y > 40, t = y > 700;
  if (n !== navS) { navS = n; nav.classList.toggle('scrolled', n); }
  if (t !== topS) { topS = t; totop.classList.toggle('show', t); }
  skew += (clamp((y - lastY) * .12, -4, 4) - skew) * .5; lastY = y;
  marq.style.transform = Math.abs(skew) > .05 ? `skewY(${skew.toFixed(2)}deg)` : '';
  statement(); hscroll();
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
setInterval(() => { if (Math.abs(skew) > .05) { skew *= .6; marq.style.transform = Math.abs(skew) > .05 ? `skewY(${skew.toFixed(2)}deg)` : ''; } }, 80);
totop.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

// mobile menu
const burger = $('#burger'), menuNav = $('#menuNav');
burger.onclick = () => { burger.classList.toggle('open'); menuNav.classList.toggle('open'); };
$$('#menuNav a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menuNav.classList.remove('open'); }));

// ---------- pinned statement ----------
const wEl = $('#words'), hot = /^(evenings|flame|ingredient|care|plate)/i;
wEl.innerHTML = wEl.textContent.split(' ').map(w => `<span class="w${hot.test(w) ? ' hot' : ''}">${w}</span>`).join(' ');
const wSpans = $$('.w', wEl), sec = $('#statement');
let lastN = -1;
function statement() {
  const r = sec.getBoundingClientRect();
  if (r.bottom < -100 || r.top > innerHeight + 100) return;
  const n = Math.round(clamp(-r.top / (r.height - innerHeight)) * 1.15 * wSpans.length);
  if (n === lastN) return; lastN = n;
  wSpans.forEach((s, i) => s.classList.toggle('on', i < n));
}

// ---------- accordion ----------
const panels = $$('.panel');
panels.forEach(p => {
  const open = () => { panels.forEach(x => x.classList.remove('active')); p.classList.add('active'); };
  p.addEventListener('click', open);
  if (fine) p.addEventListener('mouseenter', open);
});
$$('.go').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

// ---------- horizontal scroll gallery ----------
const hs0 = $('#gallery'), htrack = $('#htrack'), hstick = $('.hstick'), htitle = $('.htitle');
let trackW = 0;
function hsize() {
  trackW = htrack.scrollWidth - innerWidth;
  hs0.style.height = (trackW + innerHeight) + 'px';
  calc();
}
addEventListener('resize', hsize); addEventListener('load', hsize); hsize();
let lastP = -1;
function hscroll() {
  const h = hs0.offsetHeight - innerHeight, p = clamp((scrollY - hs0.offsetTop) / h);
  if (p === lastP) return; lastP = p;
  htrack.style.transform = `translate3d(${-p * trackW}px,0,0)`;
  hstick.style.setProperty('--p', p);
  htitle.style.opacity = 1 - clamp(p * 5);
}

// ---------- reveal / counters / magnetic ----------
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
$$('.reveal').forEach(el => io.observe(el));

const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 2000;
  const tick = t => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick); cio.unobserve(el);
}), { threshold: .6 });
$$('[data-count]').forEach(el => cio.observe(el));

$$('.magnetic').forEach(b => {
  b.addEventListener('mousemove', e => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
  });
  b.addEventListener('mouseleave', () => b.style.transform = '');
});

addEventListener('click', e => {
  const r = document.createElement('span'); r.className = 'ripple';
  r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
  document.body.appendChild(r); setTimeout(() => r.remove(), 700);
});

// ---------- menu ----------
const MENU = {
  Starters: [
    ['Harvest Fire Bowl', 'Charred chicken, grains, avocado, citrus dressing', 16, '1546069901-ba9599a7e63c', 'Fresh'],
    ['Tuna Maki Selection', 'Hand-rolled sushi, pickled ginger, wasabi', 19, '1579871494447-9811cf80d66c', 'Chef\'s pick'],
    ['Grazing Table', 'Seasonal small plates for the table to share', 28, '1504674900247-0877df9cc836', 'Shareable']
  ],
  Mains: [
    ['Smoked Short Rib', '18-hour hickory, burnt honey glaze, charred greens', 46, '1544025162-d76694265947', 'Signature'],
    ['Steak Frites', 'Flame-grilled striploin, herb fries, peppercorn jus', 42, '1600891964092-4316c288032e', 'Fan favourite'],
    ['Dry-Aged Flat Iron', 'Sliced over oak, chimichurri, sea salt', 38, '1558030006-450675393462', ''],
    ['Cedar Salmon', 'Plank-roasted, wilted greens, lemon beurre blanc', 34, '1519708227418-c8fd9a32b7a2', ''],
    ['Fire-Roast Pork Chop', 'Grilled pineapple salsa, charred greens', 32, '1432139555190-58524dae6a55', ''],
    ['Tagliatelle', 'Fresh pasta, brown butter, parmesan, lemon', 24, '1481931098730-318b6f776db0', 'Vegetarian']
  ],
  Fired: [
    ['Volcano Pizza', '72-hour dough, nduja, hot honey, fior di latte', 22, '1565299624946-b28f40a0ae38', 'Hot'],
    ['Inferno Burger', 'Double smash, aged cheddar, smoked bacon, fries', 21, '1551782450-a2132b4ba21d', ''],
    ['Smoky Ramen', 'Slow broth, chashu, soft egg, charred scallion', 20, '1569718212165-3a8278d5f624', '']
  ],
  Sweet: [
    ['Strawberry Panna Cotta', 'Vanilla cream, macerated berries, mint', 12, '1488477181946-6428a0291777', 'Dessert'],
    ['Smoked Old Fashioned', 'Bourbon, maple, orange, hickory smoke', 16, '1514362545857-3bc16c4c7d1b', 'Cocktail'],
    ['Garden Mojito', 'White rum, fresh mint, lime, soda', 13, '1551538827-9c037cb4f32a', 'Cocktail']
  ]
};
let tab = 'Starters';
const dishes = $('#dishes');
function renderMenu() {
  dishes.innerHTML = MENU[tab].map((m, i) =>
    `<div class="dish" style="animation-delay:${i * .09}s"><div class="ph"><img loading="lazy" decoding="async" src="${img(m[3], 400, 70)}" alt="${m[0]}"></div>
      <div class="tx"><span class="tg">${m[4]}</span><h4>${m[0]}</h4><p>${m[1]}</p>
      <div class="rw"><span class="pr">$${m[2]}</span><button class="add" data-i="${i}" aria-label="Add ${m[0]}">+</button></div></div></div>`).join('');
}
function setTab(t) {
  tab = t;
  $$('#tabs button').forEach(x => x.classList.toggle('active', x.dataset.tab === t));
  renderMenu();
}
$$('#tabs button').forEach(b => b.onclick = () => setTab(b.dataset.tab));
renderMenu();

// ---------- cart ----------
let cart = {};
const money = n => n.toLocaleString();
function toast(t) { const o = $('#toast'); o.textContent = t; o.classList.add('show'); clearTimeout(o.t); o.t = setTimeout(() => o.classList.remove('show'), 2600); }
function renderCart() {
  const v = Object.values(cart), count = v.reduce((a, x) => a + x.q, 0);
  $('#cnt').textContent = count; $('#tot').textContent = money(v.reduce((a, x) => a + x.p * x.q, 0));
  $('#list').innerHTML = v.length ? v.map(x => `<li data-k="${x.n}"><img src="${img(x.i, 200, 60)}" alt=""><div class="n">${x.n}<br><small style="color:var(--accent2)">$${x.p}</small></div><div class="q"><button data-a="-">−</button><span>${x.q}</span><button data-a="+">+</button></div></li>`).join('') : '<div class="empty">Your order is empty.<br>Add something delicious.</div>';
}
dishes.onclick = e => {
  const b = e.target.closest('.add'); if (!b) return;
  const m = MENU[tab][b.dataset.i], k = m[0];
  cart[k] = cart[k] ? { ...cart[k], q: cart[k].q + 1 } : { n: k, p: m[2], i: m[3], q: 1 };
  renderCart(); toast(`${k} added to your order`);
  const cb = $('#cartBtn'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump');
  if (!reduce) {
    const a = b.closest('.dish').querySelector('img').getBoundingClientRect(), t = cb.getBoundingClientRect(), f = document.createElement('img');
    f.className = 'fly'; f.src = img(m[3], 120, 60); f.style.left = a.left + 'px'; f.style.top = a.top + 'px'; document.body.append(f);
    f.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: `translate(${t.left - a.left}px,${t.top - a.top}px) scale(.3)`, opacity: .2 }], { duration: 800, easing: 'cubic-bezier(.5,0,.2,1)' }).onfinish = () => f.remove();
  }
};
$('#list').onclick = e => {
  const b = e.target.closest('button[data-a]'); if (!b) return;
  const li = b.closest('li'), k = li.dataset.k, d = b.dataset.a === '+' ? 1 : -1;
  if (cart[k].q + d < 1) { li.classList.add('out'); setTimeout(() => { delete cart[k]; renderCart(); }, 450); }
  else { cart[k].q += d; renderCart(); }
};
const openCart = o => { $('#cart').classList.toggle('open', o); $('#shade').classList.toggle('on', o); };
$('#cartBtn').onclick = () => openCart(true);
$('#cx').onclick = $('#shade').onclick = () => openCart(false);
$('#chk').onclick = () => {
  if (!Object.keys(cart).length) return toast('Your order is empty');
  cart = {}; renderCart(); openCart(false); toast('Thank you — your order has been placed');
};
renderCart();

// ---------- pricing toggle (lunch / dinner) ----------
const sw = $('#billing');
sw.onclick = () => {
  sw.classList.toggle('on');
  const dinner = sw.classList.contains('on');
  $$('.amt b').forEach(b => {
    const from = +b.textContent, to = +b.dataset[dinner ? 'y' : 'm'], t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / 500, 1); b.textContent = Math.round(from + (to - from) * p); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
};

// ---------- testimonials ----------
const slides = $$('.slide'), dots = $$('#dots button');
let cur = 0, timer;
function show(i) {
  cur = i;
  slides.forEach((s, k) => s.classList.toggle('active', k === i));
  dots.forEach((d, k) => d.classList.toggle('active', k === i));
}
function auto() { clearInterval(timer); timer = setInterval(() => show((cur + 1) % slides.length), 5000); }
dots.forEach((d, i) => d.onclick = () => { show(i); auto(); });
auto();

// ---------- table finder ----------
const g = $('#g');
function finder() {
  const n = +g.value, occ = $('#occ').value.toLowerCase();
  $('#gOut').textContent = n;
  $('#needle').style.left = clamp((n - 1) / 11, .01, .98) * 100 + '%';
  const rec = n <= 2 ? "the Chef's Tasting at the chef's counter" : n <= 6 ? 'the Grand Feast at our fire table' : 'our Private Dining Room with a custom menu';
  $('#finderText').textContent = `For ${n} guest${n > 1 ? 's' : ''} on a ${occ}, we suggest ${rec}.`;
}
g.addEventListener('input', finder); $('#occ').addEventListener('change', finder); finder();

// ---------- reservation form ----------
$('#date').min = new Date().toISOString().split('T')[0];
$('#form').addEventListener('submit', e => { e.preventDefault(); $('#ok').classList.add('show'); e.target.reset(); });

onScroll();
