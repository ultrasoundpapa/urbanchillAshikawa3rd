/* ============================================================
   PERSONAL BRAND SITE — Script
   ------------------------------------------------------------
   依存ライブラリなし。以下 5 つだけを担当します。
     1. reveal      スクロールで要素をフェードイン
     2. progress    最上部 1px の読み進み表示
     3. nav         スクロール時の背景付与 / 現在地ハイライト
     4. drawer      スマホメニューの開閉
     5. utilities   年号の自動更新 / 略歴のコピー / 下部 CTA の表示制御
   すべて「無くても内容が読める」前提で書いています。
   ============================================================ */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ── 1. reveal ─────────────────────────────────────────── */
  const revealTargets = $$('.reveal');

  // data-delay="1" → 90ms 遅れて出る（CSS 側の --d を使う）
  revealTargets.forEach((el) => {
    const d = el.dataset.delay;
    if (d) el.style.setProperty('--d', d);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    revealTargets.forEach((el) => io.observe(el));
  }

  /* ── 2. progress / 3. nav / 5. dock（スクロール依存をまとめる）── */
  const bar    = $('#progressBar');
  const nav    = $('#nav');
  const dock   = $('#dock');
  const links  = $$('.nav__links a');
  const sections = links
    .map((a) => $(a.getAttribute('href')))
    .filter(Boolean);

  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    if (bar) bar.style.width = `${max > 0 ? Math.min(y / max, 1) * 100 : 0}%`;
    if (nav) nav.classList.toggle('is-stuck', y > 40);

    // 下部 CTA はヒーローを抜けてから出す（最初の一画面は静けさを優先）
    if (dock) dock.classList.toggle('is-shown', y > window.innerHeight * 0.85);

    // 現在地：画面上部 1/3 を基準に、最後に通過したセクションを採用
    let current = '';
    sections.forEach((sec) => {
      if (sec.getBoundingClientRect().top <= window.innerHeight / 3) current = sec.id;
    });
    links.forEach((a) => {
      a.classList.toggle('is-active', a.getAttribute('href') === `#${current}`);
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });

  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ── 4. drawer ─────────────────────────────────────────── */
  const toggle = $('#navToggle');
  const drawer = $('#drawer');

  const setDrawer = (open) => {
    if (!toggle || !drawer) return;
    drawer.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      setDrawer(drawer.hidden);
    });
    // リンクを踏んだら閉じる
    $$('a', drawer).forEach((a) => a.addEventListener('click', () => setDrawer(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.hidden) {
        setDrawer(false);
        toggle.focus();
      }
    });
  }

  /* ── 5. utilities ──────────────────────────────────────── */

  // フッターの年号
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // 略歴のコピー（登壇・取材の担当者がそのまま使えるように）
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const src = $(btn.dataset.copy);
      if (!src) return;
      const text = src.textContent.trim().replace(/\s+/g, '');
      const label = btn.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'コピーしました';
      } catch {
        btn.textContent = 'コピーできませんでした';
      }
      setTimeout(() => { btn.textContent = label; }, 2000);
    });
  });
})();
