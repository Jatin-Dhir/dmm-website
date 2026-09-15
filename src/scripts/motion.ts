// Motion system. Lenis smooths the native scroll and drives GSAP's ticker; ScrollTrigger
// handles the pieces tied to scroll position (skewed section overlaps, the pinned hero's
// drift, stacked cards, parallax, reveals). The loader, the page wipe and the menu share one
// diagonal: the section wedges' -7° edge. Everything renders in its final state without
// JavaScript or under prefers-reduced-motion.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);
// exposed for the build's own capture tooling (time-scaling reveals, syncing scroll)
Object.assign(window as unknown as Record<string, unknown>, { gsap, ScrollTrigger });
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const html = document.documentElement;
const $ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) => scope.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) => Array.from(scope.querySelectorAll<T>(sel));
const EASE_IO = 'cubic-bezier(0.44, 0, 0.56, 1)';
const EASE_OUT = 'cubic-bezier(0.25, 1, 0.5, 1)';
const SPRING = 'expo.out';
// Full-screen cover shapes whose moving edge is tilted like the section wedges (right side higher).
const SHAPE = {
  full: 'polygon(0% 0%, 100% -12%, 100% 100%, 0% 112%)',
  above: 'polygon(0% 0%, 100% -12%, 100% -12%, 0% 0%)',
  below: 'polygon(0% 112%, 100% 100%, 100% 100%, 0% 112%)',
};
let lenis: Lenis | null = null;

/* ---------- smooth scrolling (one engine: Lenis, on GSAP's ticker) ---------- */
function smooth() {
  if (reduce) return;
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  (window as Window & { __lenis?: Lenis }).__lenis = lenis;
}

/* ---------- text into masked lines of words (keeps an unsplit copy for assistive tech) ---------- */
// wraps each word outside of tags so lines can rise word by word inside their line mask
const wrapWords = (content: string) =>
  content.replace(/(^|>)([^<]+)(?=<|$)/g, (_m, pre: string, text: string) =>
    pre + text.split(/(\s+)/).map((t) => (!t || /^\s+$/.test(t) ? t : `<span class="w">${t}</span>`)).join(''));

function splitLines(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split) return $$('.ln .w', el);
  const html = el.innerHTML;
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.innerHTML = html.replace(/<br\s*\/?>/gi, ' ');
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  const dimFrom = Number(el.dataset.dimFrom ?? NaN);
  const addLine = (content: string, i: number) => {
    const ln = document.createElement('span');
    ln.className = 'ln' + (i >= dimFrom ? ' dimline' : '');
    const inner = document.createElement('span');
    inner.innerHTML = wrapWords(content);
    ln.append(inner);
    visual.append(ln);
  };
  // Explicit breaks (short headings) keep their markup; long copy is measured word by word.
  const chunks = html.split(/<br\s*\/?>/i);
  if (chunks.length > 1 || /<[a-z]/i.test(html)) {
    chunks.forEach((c, i) => addLine(c.trim(), i));
  } else {
    const words = (el.textContent ?? '').replace(/\s+/g, ' ').trim().split(' ');
    el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    const rows: string[][] = [];
    let top = -1;
    for (const s of $$('.w', el)) {
      const t = s.offsetTop;
      if (t !== top) { rows.push([]); top = t; }
      rows[rows.length - 1].push(s.innerHTML);
    }
    rows.forEach((row, i) => addLine(row.join(' '), i));
  }
  el.replaceChildren(sr, visual);
  el.dataset.split = '1';
  return $$('.ln .w', el);
}

// words rise out of their line masks; long passages share one stagger budget so they never drag
const riseWords = (words: HTMLElement[], position: number | string = 0, tl?: gsap.core.Timeline) => {
  // y: 0 discards the px offset GSAP would otherwise read from the CSS pre-hide transform
  const vars = { y: 0, yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: { amount: Math.min(0.9, words.length * 0.045) } };
  return tl ? tl.fromTo(words, { y: 0, yPercent: 110 }, vars, position) : gsap.fromTo(words, { y: 0, yPercent: 110 }, vars);
};

/* ---------- wordmark fit ---------- */
function fitText() {
  const els = $$('[data-fit]');
  if (!els.length) return;
  const run = () =>
    els.forEach((el) => {
      const inner = $('.wm-inner', el) ?? el;
      el.style.fontSize = '100px';
      const w = inner.getBoundingClientRect().width;
      const target = el.clientWidth;
      if (w > 0 && target > 0) el.style.fontSize = `${Math.floor(((100 * target) / w) * 100) / 100}px`;
    });
  run();
  document.fonts?.ready.then(() => { run(); ScrollTrigger.refresh(); });
  // re-fit when the box itself changes (flex reflow, viewport resize)
  let raf = 0;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); };
  addEventListener('resize', schedule);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(schedule);
    els.forEach((el) => ro.observe(el.parentElement ?? el));
  }
}

/* ---------- hero entrance (timings from the reference); the loader presses play ---------- */
// skipMark: the loader glides its own wordmark into place and shows the hero's at the end
function heroIntro(skipMark = false): gsap.core.Timeline | null {
  if (reduce) return null;
  const hero = $('[data-hero]');
  const header = $('[data-header]');
  const tl = gsap.timeline({ paused: true });
  if (!hero) {
    // inner pages: media settles, header drops in, hero text lines rise, meta fades
    const phero = $('.phero');
    if (phero) {
      const media = $('.phero-media, .phero-card', phero);
      if (media) tl.fromTo(media, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1, ease: EASE_IO }, 0);
      const parts = $$('[data-lines]', phero).flatMap((el) => splitLines(el));
      if (parts.length) riseWords(parts, 0.3, tl);
      const meta = $$('[data-fade]', phero).filter((el) => !el.matches('.phero-card'));
      if (meta.length) tl.fromTo(meta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE_OUT, stagger: 0.1 }, 0.6);
    }
    if (header) tl.fromTo(header, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: SPRING, clearProps: 'transform' }, 0.3);
    return tl;
  }
  const media = $('.hero-media', hero)!;
  const hook = $$('[data-lines]', hero).flatMap((el) => splitLines(el));
  const cta = $('.hero-top .line-link', hero);
  const list = $$('.hero-list li', hero);
  const marks = $$('[data-mark]', hero);
  const ruler = $('.hero-bottom .hero-place', hero);
  const mark = $('[data-fit]', hero);
  tl.fromTo(media, { opacity: 0, scale: 1.2 }, { opacity: 1, scale: 1, duration: 1, ease: EASE_IO }, 0);
  if (!skipMark) tl.fromTo(mark, { y: 170, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: SPRING }, 0.1);
  tl.fromTo(header, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: SPRING, clearProps: 'transform' }, 0.3);
  if (hook.length) riseWords(hook, 0.4, tl);
  tl.fromTo(ruler, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: EASE_OUT }, 0.5)
    .fromTo(cta, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: EASE_OUT }, 0.6)
    .fromTo(marks, { y: (i) => (i % 2 ? 100 : -100), opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: SPRING }, 0.8)
    .fromTo(list, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: EASE_OUT, stagger: 0.1 }, 0.9);
  return tl;
}

/* ---------- loading screen: real asset progress, the disciplines, then the wipe ---------- */
const assetsReady = (maxMs: number) => {
  const img = $<HTMLImageElement>('.hero-media img, .phero-media img, .phero-card img');
  const decoded = img ? (img.complete && img.naturalWidth ? Promise.resolve() : img.decode().catch(() => undefined)) : Promise.resolve();
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>((r) => addEventListener('load', () => r(), { once: true }));
  const fonts = document.fonts?.ready ?? Promise.resolve();
  return Promise.race([Promise.all([decoded, loaded, fonts]), new Promise<void>((r) => setTimeout(r, maxMs))]);
};

// flipTo: the hero wordmark the loader's own wordmark glides into (home page, full load only)
function loader(intro: gsap.core.Timeline | null, flipTo: HTMLElement | null) {
  const el = $('[data-loader]');
  const open = () => { html.classList.add('is-loaded'); lenis?.start(); };
  if (!el || reduce) { open(); intro?.play(); return; }
  lenis?.stop();
  const cover = $('.loader-cover', el)!;
  const violet = $('.loader-violet', el)!;
  // the cover leaves upward along the diagonal; the violet blade follows a beat behind
  const reveal = () => {
    gsap.timeline({ onComplete: open })
      .add(() => intro?.play(), 0.3)
      .fromTo(cover, { clipPath: SHAPE.full }, { clipPath: SHAPE.above, duration: 1, ease: 'power3.inOut' }, 0)
      .fromTo(violet, { clipPath: SHAPE.full }, { clipPath: SHAPE.above, duration: 1, ease: 'power3.inOut' }, 0.11);
  };
  if (html.classList.contains('wipe-in')) {
    assetsReady(500).then(reveal);
    return;
  }

  const count = $('[data-loader-count]', el)!;
  const wordWrap = $('[data-loader-word]', el)!;
  const word = wordWrap.firstElementChild as HTMLElement;
  const idx = $('[data-loader-idx]', el)!;
  const mark = $('[data-loader-mark]', el)!;
  const fill = $('[data-loader-fill]', el)!;
  const white = $('[data-loader-white]', el)!;
  const words: string[] = JSON.parse(wordWrap.dataset.words ?? '[]');
  // on the home page the hero photo pours into the letters
  const photo = $('[data-hero]')?.dataset.fluidSrc;
  if (photo) { fill.style.setProperty('--loader-photo', `url("${photo}")`); fill.classList.add('has-photo'); }
  const state = { v: 0 };
  let shown = 0, pending = 0, flipping = false;
  const flip = () => {
    if (flipping || pending === shown) return;
    flipping = true;
    const next = pending;
    gsap.timeline({ onComplete: () => { flipping = false; flip(); } })
      .to(word, { yPercent: -110, duration: 0.22, ease: 'power3.in' })
      .add(() => { shown = next; word.textContent = words[next]; idx.textContent = `${String(next + 1).padStart(2, '0')}/`; })
      .fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: 0.4, ease: 'power3.out' });
  };
  const render = () => {
    const n = Math.round(state.v);
    count.textContent = String(n);
    fill.style.clipPath = `inset(0 ${(100 - state.v).toFixed(2)}% 0 0)`;
    pending = Math.min(words.length - 1, Math.floor(n / (100 / words.length)));
    flip();
  };
  const finish = () => {
    const tl = gsap.timeline();
    tl.to($$('.loader-ui > *', el), { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0);
    if (flipTo) {
      // FLIP: carry the loader's wordmark to exactly where the hero's sits, then swap them
      const from = $('.wm-inner', fill)!.getBoundingClientRect();
      const to = $('.wm-inner', flipTo)!.getBoundingClientRect();
      const m = mark.getBoundingClientRect();
      const s = to.width / from.width;
      const tx = to.left - m.left - (from.left - m.left) * s;
      const ty = to.top - m.top - (from.top - m.top) * s;
      tl.to(mark, { x: tx, y: ty, scale: s, transformOrigin: '0 0', duration: 1.05, ease: 'power3.inOut' }, 0.15)
        .to(fill, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 0.5)
        .to(white, { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 0.5)
        .add(() => { gsap.set(flipTo, { opacity: 1 }); mark.style.display = 'none'; }, 1.2);
    } else {
      tl.to(mark, { opacity: 0, duration: 0.4, ease: 'power2.out' }, 0);
    }
    tl.add(reveal, 0.15);
  };
  // one continuous motion: 0 → 90 over the minimum time, then straight on to 100 once the
  // assets are in; if they are slow, the fill keeps creeping instead of freezing
  let ready = false, rampDone = false, creep: gsap.core.Tween | null = null;
  const complete = () => {
    creep?.kill();
    gsap.to(state, { v: 100, duration: 0.5, ease: 'power2.inOut', onUpdate: render, onComplete: finish });
  };
  gsap.to(state, {
    v: 90, duration: 1.9, ease: 'power1.inOut', onUpdate: render,
    onComplete: () => {
      rampDone = true;
      if (ready) complete();
      else creep = gsap.to(state, { v: 97, duration: 2.2, ease: 'none', onUpdate: render });
    },
  });
  assetsReady(3400).then(() => { ready = true; if (rampDone) complete(); });
}

/* ---------- page wipe: the cover closes over the page, the next page opens it ---------- */
function transitions() {
  const el = $('[data-loader]');
  if (!el || reduce) return;
  const cover = $('.loader-cover', el)!;
  const violet = $('.loader-violet', el)!;
  let leaving = false;
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    let url: URL;
    try { url = new URL(a.href, location.href); } catch { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return; // in-page anchor: Lenis scrolls there
    e.preventDefault();
    if (leaving) return;
    leaving = true;
    try { sessionStorage.setItem('dmm:wipe', '1'); } catch { /* private mode: the next page simply loads */ }
    html.classList.add('wipe-in');
    html.classList.remove('is-loaded');
    lenis?.stop();
    gsap.timeline({ onComplete: () => { location.href = url.href; } })
      .fromTo(violet, { clipPath: SHAPE.below }, { clipPath: SHAPE.full, duration: 0.6, ease: 'power3.inOut' }, 0)
      .fromTo(cover, { clipPath: SHAPE.below }, { clipPath: SHAPE.full, duration: 0.6, ease: 'power3.inOut' }, 0.09);
  });
  // back/forward cache restores the page mid-wipe: open it again
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    html.classList.add('is-loaded');
    lenis?.start();
  });
}

/* ---------- cursor: a dot that keeps up, a ring that lags, labels over cards ---------- */
function cursor() {
  const root = $('[data-cursor-root]');
  if (!root || reduce || !fine) return;
  html.classList.add('has-cursor');
  const dot = $('.cursor-dot', root)!;
  const ring = $('.cursor-ring', root)!;
  const text = $('[data-cursor-text]', root)!;
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' });
  let seen = false;
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!seen) { seen = true; gsap.set([dot, ring], { x: e.clientX, y: e.clientY }); root.classList.remove('is-hidden'); }
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
  }, { passive: true });
  document.addEventListener('mouseleave', () => root.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => { if (seen) root.classList.remove('is-hidden'); });
  document.addEventListener('pointerover', (e) => {
    const t = e.target as Element;
    const labelled = t.closest<HTMLElement>('[data-cursor]');
    const link = t.closest('a, button, summary, label, [role="button"]');
    const field = t.closest('input, textarea, select');
    if (labelled) text.textContent = labelled.dataset.cursor ?? '';
    root.classList.toggle('is-label', !!labelled);
    root.classList.toggle('is-link', !labelled && !!link);
    root.classList.toggle('is-field', !!field);
  });
}

/* ---------- magnetic pull on the small pill buttons ---------- */
function magnetic() {
  if (reduce || !fine) return;
  $$('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic || 0.22);
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * strength);
      yTo((e.clientY - r.top - r.height / 2) * strength);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------- pinned hero drifts up at a tenth of the scroll ---------- */
function heroDrift() {
  const hero = $('[data-hero]');
  if (!hero || reduce) return;
  gsap.to($('.hero-move', hero), {
    y: () => -hero.offsetHeight * 0.1,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
  });
}

/* ---------- the skewed overlap block at the top of each section ---------- */
function wedges() {
  if (reduce) return;
  $$('[data-wedge]').forEach((w) => {
    const section = w.parentElement!;
    gsap.fromTo(w, { y: 0, skewY: 0 }, {
      y: -220, skewY: -7, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true },
    });
  });
}

/* ---------- stacked cards shrink as later cards cover them ---------- */
function stack() {
  if (reduce) return;
  const cards = $$('[data-stack-card]');
  cards.forEach((card, i) => {
    const later = cards.slice(i + 1);
    if (!later.length) return;
    const progress = later.map(() => 0);
    const apply = () => {
      const sum = progress.reduce((a, b) => a + b, 0);
      gsap.set(card, { scale: 1 - 0.1 * sum, y: -100 * Math.min(1, sum) });
    };
    later.forEach((next, j) => {
      ScrollTrigger.create({
        trigger: next,
        start: 'top bottom',
        end: () => `top ${parseFloat(getComputedStyle(next).top) || 50}px`,
        scrub: true,
        onUpdate: (self) => { progress[j] = self.progress; apply(); },
      });
    });
  });
}

/* ---------- parallax background in the CTA block ---------- */
function parallax() {
  if (reduce) return;
  $$('[data-parallax]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* ---------- reveals ---------- */
function lines() {
  $$('[data-lines]').forEach((el) => {
    if (el.closest('.phero, [data-hero]')) return; // handled by the page intro
    const words = splitLines(el);
    if (reduce) return;
    gsap.fromTo(words, { y: 0, yPercent: 110 }, {
      y: 0, yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: { amount: Math.min(0.9, words.length * 0.045) },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
  let raf = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => ScrollTrigger.refresh());
  });
}

function fades() {
  if (reduce) return;
  $$('[data-fade]').forEach((el) => {
    if (el.closest('[data-hero], .phero')) return;
    gsap.fromTo(el, { opacity: 0, y: 16 }, {
      opacity: 1, y: 0, duration: 0.8, ease: EASE_OUT,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });
}

// photos open from the top edge while the image settles from a slight zoom
function reveals() {
  const els = $$('[data-reveal]');
  if (reduce) { els.forEach((el) => { el.style.clipPath = 'none'; }); return; }
  els.forEach((el) => {
    const img = $('img', el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
    // the inline value stays: clearing it would hand control back to the CSS pre-hide
    tl.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out' }, 0);
    if (img) tl.fromTo(img, { scale: 1.15 }, { scale: 1, duration: 1.4, ease: 'power4.out', clearProps: 'transform' }, 0);
  });
}

// the big numbers count up once they are on screen
function counters() {
  if (reduce) return;
  $$('.stat-n').forEach((el) => {
    const text = el.textContent ?? '';
    if (!/\d/.test(text)) return;
    el.innerHTML = text.replace(/\d+/g, (m) => `<span data-n="${m}" style="min-width:${m.length}ch">0</span>`);
    const parts = $$('[data-n]', el);
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => parts.forEach((p, i) => {
        const end = Number(p.dataset.n);
        const o = { v: 0 };
        gsap.to(o, { v: end, duration: 1.6, delay: i * 0.08, ease: 'power3.out', onUpdate: () => { p.textContent = String(Math.round(o.v)); } });
      }),
    });
  });
}

// the footer wordmark rises letter by letter
function footerMark() {
  const wm = $('.site-footer .wordmark');
  if (!wm) return;
  $$('.wm-line', wm).forEach((l) => {
    l.innerHTML = (l.textContent ?? '').split('').map((c) => `<span class="ch">${c}</span>`).join('');
  });
  if (reduce) return;
  gsap.fromTo($$('.ch', wm), { yPercent: 55, opacity: 0 }, {
    yPercent: 0, opacity: 1, duration: 1.1, ease: SPRING, stagger: 0.022,
    scrollTrigger: { trigger: wm, start: 'top 92%', once: true },
  });
}

/* ---------- marquees pause when offscreen ---------- */
function marquees() {
  const els = $$('[data-marquee], .ticker');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-paused', !e.isIntersecting)), { rootMargin: '100px 0px' });
  els.forEach((m) => io.observe(m));
}

/* ---------- testimonial slider ---------- */
function sliders() {
  $$('[data-slider]').forEach((slider) => {
    const slides = $$('[data-slide]', slider);
    if (slides.length < 2) return;
    let index = 0;
    slides.forEach((s, j) => { s.classList.toggle('is-active', j === 0); s.setAttribute('aria-hidden', String(j !== 0)); });
    const go = (n: number) => {
      const prev = slides[index];
      index = (n + slides.length) % slides.length;
      const cur = slides[index];
      prev.classList.remove('is-active'); prev.setAttribute('aria-hidden', 'true');
      cur.classList.add('is-active'); cur.setAttribute('aria-hidden', 'false');
      if (!reduce) gsap.fromTo($$('[data-slide-part]', cur), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: EASE_OUT });
    };
    $('[data-prev]', slider)?.addEventListener('click', () => go(index - 1));
    $('[data-next]', slider)?.addEventListener('click', () => go(index + 1));
    slider.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') go(index - 1); if (e.key === 'ArrowRight') go(index + 1); });
  });
}

/* ---------- mobile menu (opens along the same diagonal) ---------- */
function menu() {
  const openBtn = $<HTMLButtonElement>('[data-menu-open]');
  const panel = $('[data-menu]');
  const closeBtn = $<HTMLButtonElement>('[data-menu-close]');
  if (!openBtn || !panel || !closeBtn) return;
  const open = () => {
    panel.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    if (!reduce) {
      gsap.fromTo(panel, { clipPath: SHAPE.below }, { clipPath: SHAPE.full, duration: 0.8, ease: 'power4.inOut' });
      gsap.fromTo($$('.menu-links li, .menu-contact > *', panel), { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, delay: 0.25, ease: SPRING });
    }
    closeBtn.focus();
  };
  const close = () => {
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    lenis?.start();
    const done = () => { panel.hidden = true; gsap.set(panel, { clearProps: 'clipPath' }); };
    if (reduce) done();
    else gsap.to(panel, { clipPath: SHAPE.below, duration: 0.5, ease: 'power3.inOut', onComplete: done });
    openBtn.focus();
  };
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key !== 'Tab') return;
    const items = $$<HTMLElement>('a, button', panel);
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

/* ---------- contact form composes a WhatsApp message or an email ---------- */
function contactForm() {
  const form = $<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  const status = $('[data-form-status]', form);
  const fields = ['name', 'reply'];
  const validate = () => {
    let firstBad: HTMLInputElement | null = null;
    fields.forEach((name) => {
      const input = form.elements.namedItem(name) as HTMLInputElement | null;
      const wrap = input?.closest<HTMLElement>('.field');
      const error = wrap ? $('.error', wrap) : null;
      if (!input || !wrap || !error) return;
      const empty = !input.value.trim();
      wrap.toggleAttribute('data-invalid', empty);
      input.setAttribute('aria-invalid', String(empty));
      error.textContent = empty ? (input.dataset.error ?? 'This field is required.') : '';
      if (empty && !firstBad) firstBad = input;
    });
    if (firstBad) (firstBad as HTMLInputElement).focus();
    return !firstBad;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) { if (status) status.textContent = 'Add your name and a way to reach you, then send again.'; return; }
    const d = new FormData(form);
    const needs = d.getAll('needs').join(', ');
    const business = String(d.get('business') ?? '').trim();
    const message = String(d.get('message') ?? '').trim();
    const text = [
      `Hi DMM, I'm ${String(d.get('name')).trim()}${business ? ` from ${business}` : ''}.`,
      needs ? `I'm interested in: ${needs}.` : '',
      message,
      `You can reach me at ${String(d.get('reply')).trim()}.`,
    ].filter(Boolean).join('\n\n');
    const via = (e.submitter as HTMLButtonElement | null)?.value;
    if (via === 'email') {
      location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent('Project inquiry from the website')}&body=${encodeURIComponent(text)}`;
      if (status) status.textContent = 'Your email app should open with the message ready to send.';
    } else {
      window.open(`https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      if (status) status.textContent = 'WhatsApp opened in a new tab with your message ready to send.';
    }
  });
  fields.forEach((name) => {
    const input = form.elements.namedItem(name) as HTMLInputElement | null;
    input?.addEventListener('input', () => {
      const wrap = input.closest<HTMLElement>('.field');
      if (wrap?.hasAttribute('data-invalid') && input.value.trim()) {
        wrap.removeAttribute('data-invalid');
        input.setAttribute('aria-invalid', 'false');
        const error = $('.error', wrap);
        if (error) error.textContent = '';
      }
    });
  });
}

/* ---------- Ludhiana clock ---------- */
function clocks() {
  const els = $$('[data-clock]');
  if (!els.length) return;
  const f = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
  const tick = () => {
    const now = new Date();
    els.forEach((el) => { el.textContent = f.format(now); el.setAttribute('datetime', now.toISOString()); });
  };
  tick();
  setInterval(tick, 15000);
}

/* ---------- pointer-driven fluid on the hero photo ---------- */
function fluid() {
  const hero = $('[data-hero]');
  const media = $('[data-hero-media]');
  const src = hero?.dataset.fluidSrc;
  if (!hero || !media || !src) return;
  if (!fine || reduce) return;
  // loaded on demand so the main bundle stays small on devices that never use it
  const start = () => import('./fluid').then(({ mountFluid }) => mountFluid(media, src, { cursorSize: 1.4, cursorPower: 0.7, distortion: 0.6, resolution: 5, tint: [0.16, 0.08, 0.3], dispersion: 0.18, shine: 0.3 }));
  if ('requestIdleCallback' in window) (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(start);
  else setTimeout(start, 600);
}

smooth();
footerMark(); // before fitText: splitting changes the measured width
fitText();
const heroMark = $('[data-hero] .wordmark');
const willFlip = !reduce && !!heroMark && !!$('[data-loader-mark]') && !html.classList.contains('wipe-in');
const intro = heroIntro(willFlip);
heroDrift();
wedges();
stack();
parallax();
lines();
fades();
reveals();
counters();
marquees();
sliders();
menu();
contactForm();
clocks();
cursor();
magnetic();
transitions();
html.classList.add('motion-ready');
loader(intro, willFlip ? heroMark : null);
addEventListener('load', () => { ScrollTrigger.refresh(); fluid(); });
