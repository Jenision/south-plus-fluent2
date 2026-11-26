// ==UserScript==
// @name         South Plus Fluent 2 (南+ 微软 Fluent 2 现代重构)
// @name:zh-CN   South Plus Fluent 2 (南+ 微软 Fluent 2 现代重构)
// @namespace    https://github.com/Jenision/south-plus-fluent2
// @version      1.0.0
// @description  将南+ (South Plus / North Plus 等镜像站) 重构为新一代消费级 Microsoft Fluent 2 Design System（Windows 11 Bloom Mica + Microsoft Store / Copilot 层次光影、WinUI 3 定向光照描边、Acrylic 磨砂噪点、Fluent Reveal 悬停微光与全页面 Virtual DOM 重建）。
// @author       Antigravity
// @match        *://south-plus.net/*
// @match        *://*.south-plus.net/*
// @match        *://south-plus.org/*
// @match        *://*.south-plus.org/*
// @match        *://north-plus.net/*
// @match        *://*.north-plus.net/*
// @match        *://white-plus.net/*
// @match        *://*.white-plus.net/*
// @match        *://level-plus.net/*
// @match        *://*.level-plus.net/*
// @match        *://spring-plus.net/*
// @match        *://*.spring-plus.net/*
// @match        *://summer-plus.net/*
// @match        *://*.summer-plus.net/*
// @match        *://snow-plus.net/*
// @match        *://*.snow-plus.net/*
// @match        *://soul-plus.net/*
// @match        *://*.soul-plus.net/*
// @match        *://blue-plus.net/*
// @match        *://*.blue-plus.net/*
// @match        *://east-plus.net/*
// @match        *://*.east-plus.net/*
// @match        *://imoutolove.me/*
// @match        *://*.imoutolove.me/*
// @exclude      *://*/simple/*
// @exclude      *://*/rss.php*
// @exclude      *://*/pw_ajax.php*
// @exclude      *://*/ck.php*
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

  const pageWin = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

  /* ============================================================================
   * 1. PREFERENCES, STORAGE & FLUENT 2 DESIGN TOKENS
   * ========================================================================== */
  const PREFS_KEY = 'sp_fl2_prefs_v2';
  const FEEDS_CACHE_KEY = 'sp_fl2_feeds_cache_v2';
  const FEEDS_CACHE_TTL = 120000;

  const DEFAULT_PREFS = {
    theme: 'system',          // 'system' | 'light' | 'dark'
    accent: 'blue',           // 'blue' | 'teal' | 'purple' | 'crimson' | 'green'
    density: 'comfortable',   // 'comfortable' | 'compact'
    readingWidth: 'standard', // 'standard' | 'wide'
    fontSize: 'medium',       // 'small' | 'medium' | 'large'
    wallAspect: 'cover',      // 'cover' | 'contain'
    navCollapsed: false,
    hideAds: true,
    collapseNotice: true,
    collapsePinned: true,
    collapsedCategories: {},
    expandedNavCats: {},
    cachedForumTree: [],
    cachedUserProfile: null
  };

  const ACCENTS = {
    blue: {
      name: 'Fluent 蓝',
      light: '#0F6CBD', lightHover: '#115EA3', lightPressed: '#0C3B5E', lightTint: '#EBF3FC', lightTintHover: '#CFE4FA',
      lightGrad: 'linear-gradient(135deg, #1678D0 0%, #0F6CBD 55%, #0B5394 100%)',
      logo1: '#3CC5FF', logo2: '#0F6CBD', logo3: '#2B3BA6',
      lightCanvas: '#EDF2F8',
      lightBloom1: 'rgba(15, 108, 189, 0.15)', lightBloom2: 'rgba(0, 183, 195, 0.11)', lightBloom3: 'rgba(135, 100, 184, 0.09)',
      lightMesh: 'linear-gradient(120deg, rgba(15, 108, 189, 0.09) 0%, rgba(0, 183, 195, 0.06) 52%, rgba(135, 100, 184, 0.07) 100%)',
      dark: '#479EF5', darkHover: '#62ABF5', darkPressed: '#2886DE', darkTint: 'rgba(71,158,245,0.18)', darkTintHover: 'rgba(71,158,245,0.26)',
      darkGrad: 'linear-gradient(135deg, #62ABF5 0%, #479EF5 55%, #2886DE 100%)',
      darkCanvas: '#13161C',
      darkBloom1: 'rgba(38, 128, 235, 0.22)', darkBloom2: 'rgba(0, 178, 196, 0.14)', darkBloom3: 'rgba(138, 92, 246, 0.13)',
      darkMesh: 'linear-gradient(120deg, rgba(71, 158, 245, 0.15) 0%, rgba(45, 212, 191, 0.08) 52%, rgba(167, 139, 250, 0.10) 100%)'
    },
    teal: {
      name: '青碧',
      light: '#038387', lightHover: '#026D70', lightPressed: '#025558', lightTint: '#E6F7F7', lightTintHover: '#CCEEEE',
      lightGrad: 'linear-gradient(135deg, #069A9E 0%, #038387 55%, #026366 100%)',
      logo1: '#2DD4BF', logo2: '#038387', logo3: '#0F6CBD',
      lightCanvas: '#ECF4F4',
      lightBloom1: 'rgba(3, 131, 135, 0.15)', lightBloom2: 'rgba(15, 108, 189, 0.10)', lightBloom3: 'rgba(16, 185, 129, 0.08)',
      lightMesh: 'linear-gradient(120deg, rgba(3, 131, 135, 0.09) 0%, rgba(15, 108, 189, 0.06) 52%, rgba(16, 185, 129, 0.06) 100%)',
      dark: '#2DD4BF', darkHover: '#5EEAD4', darkPressed: '#14B8A6', darkTint: 'rgba(45,212,191,0.18)', darkTintHover: 'rgba(45,212,191,0.26)',
      darkGrad: 'linear-gradient(135deg, #5EEAD4 0%, #2DD4BF 55%, #14B8A6 100%)',
      darkCanvas: '#111819',
      darkBloom1: 'rgba(20, 184, 166, 0.21)', darkBloom2: 'rgba(56, 189, 248, 0.13)', darkBloom3: 'rgba(52, 211, 153, 0.11)',
      darkMesh: 'linear-gradient(120deg, rgba(45, 212, 191, 0.14) 0%, rgba(56, 189, 248, 0.08) 55%, rgba(52, 211, 153, 0.09) 100%)'
    },
    purple: {
      name: '紫晶',
      light: '#7719AA', lightHover: '#61148C', lightPressed: '#4C0F6E', lightTint: '#F5EBFA', lightTintHover: '#EBD6F5',
      lightGrad: 'linear-gradient(135deg, #8E2BC4 0%, #7719AA 55%, #581082 100%)',
      logo1: '#C084FC', logo2: '#7719AA', logo3: '#4338CA',
      lightCanvas: '#F2EFF7',
      lightBloom1: 'rgba(119, 25, 170, 0.13)', lightBloom2: 'rgba(99, 102, 241, 0.10)', lightBloom3: 'rgba(236, 72, 153, 0.07)',
      lightMesh: 'linear-gradient(120deg, rgba(119, 25, 170, 0.09) 0%, rgba(99, 102, 241, 0.06) 52%, rgba(236, 72, 153, 0.06) 100%)',
      dark: '#C084FC', darkHover: '#D8B4FE', darkPressed: '#A855F7', darkTint: 'rgba(192,132,252,0.18)', darkTintHover: 'rgba(192,132,252,0.26)',
      darkGrad: 'linear-gradient(135deg, #D8B4FE 0%, #C084FC 55%, #9333EA 100%)',
      darkCanvas: '#16131D',
      darkBloom1: 'rgba(168, 85, 247, 0.21)', darkBloom2: 'rgba(99, 102, 241, 0.14)', darkBloom3: 'rgba(244, 114, 182, 0.10)',
      darkMesh: 'linear-gradient(120deg, rgba(192, 132, 252, 0.15) 0%, rgba(129, 140, 248, 0.09) 55%, rgba(244, 114, 182, 0.08) 100%)'
    },
    crimson: {
      name: '绯红',
      light: '#C4314B', lightHover: '#A7253C', lightPressed: '#891C30', lightTint: '#FCEBEF', lightTintHover: '#F8D4DC',
      lightGrad: 'linear-gradient(135deg, #D93B57 0%, #C4314B 55%, #9C2137 100%)',
      logo1: '#FB7185', logo2: '#C4314B', logo3: '#881337',
      lightCanvas: '#F7EFF2',
      lightBloom1: 'rgba(196, 49, 75, 0.13)', lightBloom2: 'rgba(245, 158, 11, 0.09)', lightBloom3: 'rgba(168, 85, 247, 0.07)',
      lightMesh: 'linear-gradient(120deg, rgba(196, 49, 75, 0.09) 0%, rgba(245, 158, 11, 0.06) 55%, rgba(168, 85, 247, 0.05) 100%)',
      dark: '#FB7185', darkHover: '#FDA4AF', darkPressed: '#F43F5E', darkTint: 'rgba(251,113,133,0.18)', darkTintHover: 'rgba(251,113,133,0.26)',
      darkGrad: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 55%, #E11D48 100%)',
      darkCanvas: '#1B1316',
      darkBloom1: 'rgba(244, 63, 94, 0.20)', darkBloom2: 'rgba(251, 146, 60, 0.12)', darkBloom3: 'rgba(192, 132, 252, 0.10)',
      darkMesh: 'linear-gradient(120deg, rgba(251, 113, 133, 0.14) 0%, rgba(251, 146, 60, 0.08) 55%, rgba(192, 132, 252, 0.08) 100%)'
    },
    green: {
      name: '森绿',
      light: '#107C10', lightHover: '#0E6A0E', lightPressed: '#0B530B', lightTint: '#EBF7EB', lightTintHover: '#D5EFD5',
      lightGrad: 'linear-gradient(135deg, #179417 0%, #107C10 55%, #0B5E0B 100%)',
      logo1: '#4ADE80', logo2: '#107C10', logo3: '#038387',
      lightCanvas: '#EEF4EF',
      lightBloom1: 'rgba(16, 124, 16, 0.13)', lightBloom2: 'rgba(3, 131, 135, 0.09)', lightBloom3: 'rgba(234, 179, 8, 0.07)',
      lightMesh: 'linear-gradient(120deg, rgba(16, 124, 16, 0.09) 0%, rgba(3, 131, 135, 0.06) 55%, rgba(234, 179, 8, 0.05) 100%)',
      dark: '#4ADE80', darkHover: '#86EFAC', darkPressed: '#22C55E', darkTint: 'rgba(74,222,128,0.18)', darkTintHover: 'rgba(74,222,128,0.26)',
      darkGrad: 'linear-gradient(135deg, #86EFAC 0%, #4ADE80 55%, #16A34A 100%)',
      darkCanvas: '#121814',
      darkBloom1: 'rgba(34, 197, 94, 0.19)', darkBloom2: 'rgba(20, 184, 166, 0.13)', darkBloom3: 'rgba(250, 204, 21, 0.08)',
      darkMesh: 'linear-gradient(120deg, rgba(74, 222, 128, 0.14) 0%, rgba(45, 212, 191, 0.08) 55%, rgba(250, 204, 21, 0.07) 100%)'
    }
  };

  const CORE_BOARDS = [
    { fid: '9',   name: '茶馆',           href: 'thread.php?fid-9.html',   icon: 'forum' },
    { fid: '48',  name: '询问&求物',      href: 'thread.php?fid-48.html',  icon: 'compass' },
    { fid: '8',   name: 'ACG交流',        href: 'thread.php?fid-8.html',   icon: 'flame' },
    { fid: '13',  name: '免空资源区',     href: 'thread.php?fid-13.html',  icon: 'folder' },
    { fid: '221', name: 'GALGAME汉化区',  href: 'thread.php?fid-221.html', icon: 'star' },
    { fid: '208', name: 'AI交流 (beta)',  href: 'thread.php?fid-208.html', icon: 'sparkle' }
  ];

  const SUBFORUM_FALLBACK = {
    '229': [{ name: '同人志&CG', href: 'thread.php?fid-230.html', fid: '230' }, { name: '同人志&CG (图墙模式)', href: 'thread.php?fid-231.html', fid: '231' }],
    '226': [{ name: '同人志&CG', href: 'thread.php?fid-227.html', fid: '227' }, { name: '同人志&CG (图墙模式)', href: 'thread.php?fid-228.html', fid: '228' }],
    '223': [{ name: '同人志&CG', href: 'thread.php?fid-224.html', fid: '224' }, { name: '同人志&CG (图墙模式)', href: 'thread.php?fid-225.html', fid: '225' }],
    '136': [{ name: '同人志&CG', href: 'thread.php?fid-219.html', fid: '219' }, { name: '同人志&CG (图墙模式)', href: 'thread.php?fid-220.html', fid: '220' }],
    '107': [{ name: '同人志&CG', href: 'thread.php?fid-216.html', fid: '216' }, { name: '同人志&CG (图墙模式)', href: 'thread.php?fid-217.html', fid: '217' }],
    '9':   [{ name: '茶楼', href: 'thread.php?fid-188.html', fid: '188' }],
    '13':  [
      { name: 'CG资源', href: 'thread.php?fid-14.html', fid: '14' },
      { name: '同人音声', href: 'thread.php?fid-128.html', fid: '128' },
      { name: '实用动画', href: 'thread.php?fid-4.html', fid: '4' },
      { name: '实用漫画', href: 'thread.php?fid-5.html', fid: '5' },
      { name: '游戏资源', href: 'thread.php?fid-6.html', fid: '6' },
      { name: 'GALGAME汉化区', href: 'thread.php?fid-221.html', fid: '221' },
      { name: 'GALGAME汉化区 (图墙模式)', href: 'thread.php?fid-222.html', fid: '222' }
    ]
  };

  const Store = {
    _cache: null,
    load() {
      if (this._cache) return this._cache;
      let parsed = null;
      try {
        if (typeof GM_getValue === 'function') {
          const raw = GM_getValue(PREFS_KEY, '');
          if (raw) parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        }
      } catch (_) {}
      if (!parsed) {
        try {
          const raw = localStorage.getItem(PREFS_KEY);
          if (raw) parsed = JSON.parse(raw);
        } catch (_) {}
      }
      this._cache = Object.assign({}, DEFAULT_PREFS, parsed || {});
      return this._cache;
    },
    get(key) {
      return this.load()[key];
    },
    set(key, val) {
      const next = Object.assign({}, this.load(), { [key]: val });
      this._cache = next;
      try {
        const str = JSON.stringify(next);
        if (typeof GM_setValue === 'function') GM_setValue(PREFS_KEY, str);
        localStorage.setItem(PREFS_KEY, str);
      } catch (_) {}
      return val;
    }
  };

  function resolveEffectiveTheme() {
    const mode = Store.get('theme');
    if (mode === 'light' || mode === 'dark') return mode;
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (_) {}
    return 'light';
  }

  function applyThemeTokens() {
    const root = document.documentElement;
    if (!root) return;
    const mode = resolveEffectiveTheme();
    const accKey = ACCENTS[Store.get('accent')] ? Store.get('accent') : 'blue';
    const acc = ACCENTS[accKey];
    const isDark = mode === 'dark';

    root.setAttribute('data-fl2-theme', mode);
    root.setAttribute('data-fl2-accent', accKey);
    root.setAttribute('data-fl2-density', Store.get('density') || 'comfortable');
    root.setAttribute('data-fl2-width', Store.get('readingWidth') || 'standard');
    root.setAttribute('data-fl2-fontsize', Store.get('fontSize') || 'medium');
    root.setAttribute('data-fl2-nav-collapsed', String(Boolean(Store.get('navCollapsed'))));

    root.style.setProperty('--fl2-brand', isDark ? acc.dark : acc.light);
    root.style.setProperty('--fl2-brand-hover', isDark ? acc.darkHover : acc.lightHover);
    root.style.setProperty('--fl2-brand-pressed', isDark ? acc.darkPressed : acc.lightPressed);
    root.style.setProperty('--fl2-brand-subtle', isDark ? acc.darkTint : acc.lightTint);
    root.style.setProperty('--fl2-brand-subtle-hover', isDark ? acc.darkTintHover : acc.lightTintHover);
    root.style.setProperty('--fl2-brand-fg', isDark ? acc.dark : acc.light);
    root.style.setProperty('--fl2-brand-grad', isDark ? acc.darkGrad : acc.lightGrad);
    root.style.setProperty('--fl2-logo-1', acc.logo1);
    root.style.setProperty('--fl2-logo-2', acc.logo2);
    root.style.setProperty('--fl2-logo-3', acc.logo3);
    root.style.setProperty('--fl2-canvas', isDark ? acc.darkCanvas : acc.lightCanvas);
    root.style.setProperty('--fl2-bloom-1', isDark ? acc.darkBloom1 : acc.lightBloom1);
    root.style.setProperty('--fl2-bloom-2', isDark ? acc.darkBloom2 : acc.lightBloom2);
    root.style.setProperty('--fl2-bloom-3', isDark ? acc.darkBloom3 : acc.lightBloom3);
    root.style.setProperty('--fl2-hero-mesh', isDark ? acc.darkMesh : acc.lightMesh);
    root.style.setProperty('--fl2-fg-on-brand', isDark ? '#0B1622' : '#FFFFFF');
  }

  document.documentElement.classList.add('fl2-loading');
  applyThemeTokens();

  try {
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onMq = () => { if (Store.get('theme') === 'system') applyThemeTokens(); };
      if (mq.addEventListener) mq.addEventListener('change', onMq);
      else if (mq.addListener) mq.addListener(onMq);
    }
  } catch (_) {}

  /* ============================================================================
   * 2. INLINE FLUENT 2 SYSTEM ICONS (20px grid, SVG)
   * ========================================================================== */
  const ICONS = {
    nav: '<path d="M2.5 4.75A.75.75 0 0 1 3.25 4h13.5a.75.75 0 0 1 0 1.5H3.25a.75.75 0 0 1-.75-.75Zm0 5A.75.75 0 0 1 3.25 9h13.5a.75.75 0 0 1 0 1.5H3.25a.75.75 0 0 1-.75-.75Zm0 5a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H3.25a.75.75 0 0 1-.75-.75Z"/>',
    home: '<path d="M10.7 2.28a1 1 0 0 0-1.4 0l-6.5 6.3a1 1 0 0 0-.3.72V16.5A1.5 1.5 0 0 0 4 18h3.5a1 1 0 0 0 1-1v-4.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75V17a1 1 0 0 0 1 1H16a1.5 1.5 0 0 0 1.5-1.5V9.3a1 1 0 0 0-.3-.72l-6.5-6.3ZM4 9.5l6-5.82 6 5.82v7H13v-3.75A2.25 2.25 0 0 0 10.75 10.5h-1.5A2.25 2.25 0 0 0 7 12.75V16.5H4v-7Z"/>',
    compass: '<path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-6.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Zm9.53-3.03a.75.75 0 0 0-.82-.16l-4.25 1.75a.75.75 0 0 0-.4.4l-1.75 4.25a.75.75 0 0 0 .98.98l4.25-1.75a.75.75 0 0 0 .4-.4l1.75-4.25a.75.75 0 0 0-.16-.82Zm-3.68 4.44-1.58.65.65-1.58 2.66-1.1-1.1 2.66-.63-.63Z"/>',
    forum: '<path d="M4.5 3A2.5 2.5 0 0 0 2 5.5v7A2.5 2.5 0 0 0 4.5 15h2v2.25a.75.75 0 0 0 1.26.55L10.77 15h4.73A2.5 2.5 0 0 0 18 12.5v-7A2.5 2.5 0 0 0 15.5 3h-11Zm-1 2.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-5.04a.75.75 0 0 0-.51.2L8 15.54V14.25a.75.75 0 0 0-.75-.75H4.5a1 1 0 0 1-1-1v-7Z"/>',
    search: '<path d="M8.5 3a5.5 5.5 0 1 0 3.38 9.84l4.19 4.2a.75.75 0 1 0 1.06-1.07l-4.19-4.19A5.5 5.5 0 0 0 8.5 3ZM4.5 8.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/>',
    mail: '<path d="M4.5 4A2.5 2.5 0 0 0 2 6.5v7A2.5 2.5 0 0 0 4.5 16h11a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 15.5 4h-11ZM3.5 6.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v.4l-6.5 3.61-6.5-3.6V6.5Zm0 2.12 6.14 3.41a.75.75 0 0 0 .72 0l6.14-3.41v4.88a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V8.62Z"/>',
    person: '<path d="M10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM7.5 6a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0ZM5.5 11.5A2.5 2.5 0 0 0 3 14c0 2.4 2.86 4 7 4s7-1.6 7-4a2.5 2.5 0 0 0-2.5-2.5h-9ZM4.5 14a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1c0 1.24-2.05 2.5-5.5 2.5S4.5 15.24 4.5 14Z"/>',
    document: '<path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.41a2 2 0 0 0-.59-1.41l-3.41-3.41A2 2 0 0 0 10.59 2H6Zm-.5 2a.5.5 0 0 1 .5-.5h4v3a1.5 1.5 0 0 0 1.5 1.5h3V16a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4Zm6 0 .1.02 2.88 2.88.02.1H11.5v-3Z"/>',
    bookmark: '<path d="M6 2.5A2.5 2.5 0 0 0 3.5 5v12.25a.75.75 0 0 0 1.22.58L10 13.56l5.28 4.27a.75.75 0 0 0 1.22-.58V5A2.5 2.5 0 0 0 14 2.5H6ZM5 5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v10.67l-4.53-3.66a.75.75 0 0 0-.94 0L5 15.67V5Z"/>',
    bookmarkFilled: '<path d="M6 2.5A2.5 2.5 0 0 0 3.5 5v12.25a.75.75 0 0 0 1.22.58L10 13.56l5.28 4.27a.75.75 0 0 0 1.22-.58V5A2.5 2.5 0 0 0 14 2.5H6Z"/>',
    people: '<path d="M7.5 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm7.5-2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM12 6.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM4 11.5A2 2 0 0 0 2 13.5c0 1.9 1.97 3.5 5.5 3.5s5.5-1.6 5.5-3.5a2 2 0 0 0-2-2H4Zm-.5 2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5c0 .87-1.35 2-4 2s-4-1.13-4-2Zm10.8 2.27c1.63-.3 2.7-1.14 2.7-2.27a1.5 1.5 0 0 0-1.5-1.5h-1.85a3.47 3.47 0 0 1 .57 1.5c0 .83-.3 1.56-.8 2.13.3.08.58.13.88.14Z"/>',
    wallet: '<path d="M4.5 3.5A2.5 2.5 0 0 0 2 6v8a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 18 14V8a2.5 2.5 0 0 0-2.5-2.5H15V5a1.5 1.5 0 0 0-1.5-1.5h-9ZM4.5 5h9v.5h-9A1 1 0 0 1 3.5 6 1 1 0 0 1 4.5 5Zm-1 2.78c.31.14.65.22 1 .22h11a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V7.78Zm10.75 4.22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>',
    settings: '<path d="M8.57 2.24a1.5 1.5 0 0 1 2.86 0l.35 1.07a1 1 0 0 0 1.38.57l1.02-.48a1.5 1.5 0 0 1 2.02 2.02l-.48 1.02a1 1 0 0 0 .57 1.38l1.07.35a1.5 1.5 0 0 1 0 2.86l-1.07.35a1 1 0 0 0-.57 1.38l.48 1.02a1.5 1.5 0 0 1-2.02 2.02l-1.02-.48a1 1 0 0 0-1.38.57l-.35 1.07a1.5 1.5 0 0 1-2.86 0l-.35-1.07a1 1 0 0 0-1.38-.57l-1.02.48a1.5 1.5 0 0 1-2.02-2.02l.48-1.02a1 1 0 0 0-.57-1.38l-1.07-.35a1.5 1.5 0 0 1 0-2.86l1.07-.35a1 1 0 0 0 .57-1.38l-.48-1.02a1.5 1.5 0 0 1 2.02-2.02l1.02.48a1 1 0 0 0 1.38-.57l.35-1.07ZM10 7.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Zm-1.25 2.75a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0Z"/>',
    shield: '<path d="M10.37 2.13a.75.75 0 0 0-.74 0l-5.75 3.1a.75.75 0 0 0-.38.66v4.02c0 3.7 2.47 6.84 6.26 8a.75.75 0 0 0 .48 0c3.79-1.16 6.26-4.3 6.26-8V5.89a.75.75 0 0 0-.38-.66l-5.75-3.1ZM5 6.33l5-2.7 5 2.7v3.58c0 2.95-1.93 5.52-5 6.53-3.07-1.01-5-3.58-5-6.53V6.33Z"/>',
    sun: '<path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2Zm0 13a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15Zm8-5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10Zm10.66-5.66a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0ZM6.46 13.54a.75.75 0 0 1 0 1.06L5.4 15.66a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Zm9.2 2.12a.75.75 0 0 1-1.06 0l-1.06-1.06a.75.75 0 1 1 1.06-1.06l1.06 1.06a.75.75 0 0 1 0 1.06ZM6.46 6.46a.75.75 0 0 1-1.06 0L4.34 5.4A.75.75 0 1 1 5.4 4.34L6.46 5.4a.75.75 0 0 1 0 1.06ZM10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM8 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/>',
    moon: '<path d="M10.17 2.02a.75.75 0 0 1 .49.94A5.75 5.75 0 0 0 17.04 10a.75.75 0 0 1 .94.49 7.5 7.5 0 1 1-7.81-8.47ZM8.73 3.74a6 6 0 1 0 7.53 7.53 7.26 7.26 0 0 1-7.53-7.53Z"/>',
    sparkle: '<path d="M10.7 2.45a.75.75 0 0 0-1.4 0L7.86 6.22a2.5 2.5 0 0 1-1.64 1.64L2.45 9.3a.75.75 0 0 0 0 1.4l3.77 1.44a2.5 2.5 0 0 1 1.64 1.64l1.44 3.77a.75.75 0 0 0 1.4 0l1.44-3.77a2.5 2.5 0 0 1 1.64-1.64l3.77-1.44a.75.75 0 0 0 0-1.4l-3.77-1.44a2.5 2.5 0 0 1-1.64-1.64L10.7 2.45Z"/>',
    chevronRight: '<path d="M7.72 4.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L12.44 10 7.72 5.28a.75.75 0 0 1 0-1.06Z"/>',
    chevronDown: '<path d="M4.22 7.72a.75.75 0 0 1 1.06 0L10 12.44l4.72-4.72a.75.75 0 1 1 1.06 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0L4.22 8.78a.75.75 0 0 1 0-1.06Z"/>',
    chevronLeft: '<path d="M12.28 4.22a.75.75 0 0 1 0 1.06L7.56 10l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z"/>',
    pin: '<path d="M12.22 2.22a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-.65-.65-3.44 3.44.4 2.38a.75.75 0 0 1-1.27.66L9.1 10.95l-4.57 4.58a.75.75 0 1 1-1.06-1.06l4.58-4.57L5.39 7.24a.75.75 0 0 1 .66-1.27l2.38.4 3.44-3.44-.65-.65a.75.75 0 0 1 0-1.06Z"/>',
    flame: '<path d="M10.35 2.08a.75.75 0 0 0-.9.15C7.17 4.4 5.5 7.1 5.5 10.25a4.5 4.5 0 1 0 9 0c0-1.78-.75-3.42-1.85-4.7a.75.75 0 0 0-1.27.26c-.2.58-.53 1.08-.95 1.44.1-1.7.36-3.36-.08-5.17Z"/>',
    lock: '<path d="M10 2a3.5 3.5 0 0 0-3.5 3.5V8H5.5A1.5 1.5 0 0 0 4 9.5v6A2.5 2.5 0 0 0 6.5 18h7a2.5 2.5 0 0 0 2.5-2.5v-6A1.5 1.5 0 0 0 14.5 8H13.5V5.5A3.5 3.5 0 0 0 10 2Zm-2 6V5.5a2 2 0 1 1 4 0V8H8Zm2 4a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 10 12Z"/>',
    star: '<path d="M9.1 2.9a1 1 0 0 1 1.8 0l1.82 3.69 4.07.59a1 1 0 0 1 .55 1.7l-2.94 2.87.7 4.05a1 1 0 0 1-1.46 1.06L10 14.95l-3.64 1.91a1 1 0 0 1-1.45-1.05l.69-4.06L2.66 8.88a1 1 0 0 1 .55-1.7l4.07-.6L9.1 2.9Z"/>',
    image: '<path d="M4.5 3A2.5 2.5 0 0 0 2 5.5v9A2.5 2.5 0 0 0 4.5 17h11a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 15.5 3h-11ZM3.5 5.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v6.44l-3.22-3.22a1.5 1.5 0 0 0-2.12 0L6.44 13.44l-1.22-1.22a1.5 1.5 0 0 0-2.12 0l-.6.6V5.5Zm3.75 3a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/>',
    grid: '<path d="M4.5 3A1.5 1.5 0 0 0 3 4.5v3A1.5 1.5 0 0 0 4.5 9h3A1.5 1.5 0 0 0 9 7.5v-3A1.5 1.5 0 0 0 7.5 3h-3Zm0 8A1.5 1.5 0 0 0 3 12.5v3A1.5 1.5 0 0 0 4.5 17h3A1.5 1.5 0 0 0 9 15.5v-3A1.5 1.5 0 0 0 7.5 11h-3Zm8-8A1.5 1.5 0 0 0 11 4.5v3A1.5 1.5 0 0 0 12.5 9h3A1.5 1.5 0 0 0 17 7.5v-3A1.5 1.5 0 0 0 15.5 3h-3Zm0 8a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5h-3Z"/>',
    list: '<path d="M3 5.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.25Zm0 4.75a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10Zm.75 4a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z"/>',
    add: '<path d="M10 3a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 10 3Z"/>',
    arrowUp: '<path d="M10 3.22a.75.75 0 0 1 .53.22l5 5a.75.75 0 1 1-1.06 1.06l-3.72-3.72v10.47a.75.75 0 0 1-1.5 0V5.78L5.53 9.5a.75.75 0 0 1-1.06-1.06l5-5a.75.75 0 0 1 .53-.22Z"/>',
    dismiss: '<path d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z"/>',
    checkmark: '<path d="M16.78 5.22a.75.75 0 0 1 0 1.06l-8.25 8.25a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06L8 12.94l7.72-7.72a.75.75 0 0 1 1.06 0Z"/>',
    info: '<path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm-.75 2a.75.75 0 0 1 1.5 0v4.75a.75.75 0 0 1-1.5 0V9Z"/>',
    coin: '<path d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM4 10a6 6 0 1 1 12 0 6 6 0 0 1-12 0Zm6-3.75a.75.75 0 0 1 .75.75v.33c.88.14 1.55.66 1.72 1.44a.75.75 0 0 1-1.46.32c-.07-.3-.33-.51-.83-.51-.55 0-.88.24-.88.58 0 .34.28.51 1.07.72 1.1.3 2.13.73 2.13 1.98 0 .93-.66 1.67-1.75 1.88v.51a.75.75 0 0 1-1.5 0v-.47c-.96-.15-1.72-.7-1.95-1.57a.75.75 0 1 1 1.45-.38c.13.47.55.72 1.08.72.62 0 .97-.27.97-.65 0-.37-.29-.55-1.15-.79-1.08-.3-2.05-.72-2.05-1.93 0-.89.64-1.6 1.65-1.82V7a.75.75 0 0 1 .75-.75Z"/>',
    edit: '<path d="M13.38 2.68a2.25 2.25 0 0 1 3.18 3.18l-9.2 9.2a2.5 2.5 0 0 1-1.13.65l-3.04.84a.75.75 0 0 1-.92-.92l.84-3.04a2.5 2.5 0 0 1 .65-1.13l9.2-9.2Zm2.12 1.06a.75.75 0 0 0-1.06 0l-8.98 8.98a1 1 0 0 0-.26.45l-.49 1.77 1.77-.49a1 1 0 0 0 .45-.26l8.98-8.98a.75.75 0 0 0 0-1.06l-.41-.41Z"/>',
    signOut: '<path d="M4.5 3A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H9a.75.75 0 0 0 0-1.5H4.5v-11H9A.75.75 0 0 0 9 3H4.5Zm9.22 3.22a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H8.25a.75.75 0 0 1 0-1.5h7.19l-1.72-1.72a.75.75 0 0 1 0-1.06Z"/>',
    copy: '<path d="M7.5 2A2.5 2.5 0 0 0 5 4.5v9A2.5 2.5 0 0 0 7.5 16h6a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 13.5 2h-6Zm-1 2.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-9ZM3.5 6.5a.75.75 0 0 0-1.5 0v8A3.5 3.5 0 0 0 5.5 18h6a.75.75 0 0 0 0-1.5h-6a2 2 0 0 1-2-2v-8Z"/>',
    zoomIn: '<path d="M8.5 3a5.5 5.5 0 1 0 3.38 9.84l4.19 4.2a.75.75 0 1 0 1.06-1.07l-4.19-4.19A5.5 5.5 0 0 0 8.5 3Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm4-2.25a.75.75 0 0 1 .75.75v1h1a.75.75 0 0 1 0 1.5h-1v1a.75.75 0 0 1-1.5 0v-1h-1a.75.75 0 0 1 0-1.5h1V7a.75.75 0 0 1 .75-.75Z"/>',
    external: '<path d="M6.25 4A2.25 2.25 0 0 0 4 6.25v7.5A2.25 2.25 0 0 0 6.25 16h7.5A2.25 2.25 0 0 0 16 13.75V10.5a.75.75 0 0 0-1.5 0v3.25a.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 0 1 .75-.75H9.5a.75.75 0 0 0 0-1.5H6.25Zm5.25 0a.75.75 0 0 0 0 1.5h2.44l-5.22 5.22a.75.75 0 1 0 1.06 1.06L15 6.56V9a.75.75 0 0 0 1.5 0V4.75a.75.75 0 0 0-.75-.75H11.5Z"/>',
    trophy: '<path d="M6 3a1 1 0 0 0-1 1v1H3.25A1.25 1.25 0 0 0 2 6.25v1.5A3.25 3.25 0 0 0 5.25 11h.2a4.51 4.51 0 0 0 3.8 2.93V16H7a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-2.25v-2.07A4.51 4.51 0 0 0 14.55 11h.2A3.25 3.25 0 0 0 18 7.75v-1.5A1.25 1.25 0 0 0 16.75 5H15V4a1 1 0 0 0-1-1H6Zm-1 3.5v3h-.25a1.75 1.75 0 0 1-1.25-1.75v-1.25H5Zm10 0h1.5v1.25A1.75 1.75 0 0 1 14.75 9.5H15v-3Zm-8.5-2h7V9a3.5 3.5 0 1 1-7 0V4.5Z"/>',
    more: '<path d="M5 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>',
    reply: '<path d="M8.78 4.22a.75.75 0 0 1 0 1.06L5.56 8.5H12A5.5 5.5 0 0 1 17.5 14v1.75a.75.75 0 0 1-1.5 0V14a4 4 0 0 0-4-4H5.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z"/>',
    quote: '<path d="M4.5 5A2.5 2.5 0 0 0 2 7.5v2A2.5 2.5 0 0 0 4.5 12H7v1a2 2 0 0 1-2 2H4.25a.75.75 0 0 0 0 1.5H5A3.5 3.5 0 0 0 8.5 13V7.5A2.5 2.5 0 0 0 6 5H4.5Zm9 0A2.5 2.5 0 0 0 11 7.5v2a2.5 2.5 0 0 0 2.5 2.5H16v1a2 2 0 0 1-2 2h-.75a.75.75 0 0 0 0 1.5H14a3.5 3.5 0 0 0 3.5-3.5V7.5A2.5 2.5 0 0 0 15 5h-1.5Z"/>',
    refresh: '<path d="M16.25 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5h1.78a5.5 5.5 0 1 0 1.24 4.86.75.75 0 1 1 1.46.34A7 7 0 1 1 15.5 6.4V4.75a.75.75 0 0 1 .75-.75Z"/>',
    rss: '<path d="M4 14.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0-5.25a.75.75 0 0 1 .75-.75 6.75 6.75 0 0 1 6.75 6.75.75.75 0 0 1-1.5 0 5.25 5.25 0 0 0-5.25-5.25.75.75 0 0 1-.75-.75Zm0-4.5A.75.75 0 0 1 4.75 4 11.25 11.25 0 0 1 16 15.25a.75.75 0 0 1-1.5 0A9.75 9.75 0 0 0 4.75 5.5a.75.75 0 0 1-.75-.75Z"/>',
    eye: '<path d="M10 4.5c3.92 0 7.04 2.4 8.23 5.2a.75.75 0 0 1 0 .6C17.04 13.1 13.92 15.5 10 15.5S2.96 13.1 1.77 10.3a.75.75 0 0 1 0-.6C2.96 6.9 6.08 4.5 10 4.5Zm0 1.5C6.8 6 4.24 7.9 3.28 10c.96 2.1 3.52 4 6.72 4s5.76-1.9 6.72-4c-.96-2.1-3.52-4-6.72-4Zm0 1.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm0 1.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"/>',
    zip: '<path d="M4.5 3A2.5 2.5 0 0 0 2 5.5v9A2.5 2.5 0 0 0 4.5 17h11a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 15.5 5h-4.88l-1.4-1.4A2 2 0 0 0 7.8 3H4.5Zm6 5.5h1.5V10h-1.5v1.5H12V13h-1.5v1.5H9V13h1.5v-1.5H9V10h1.5V8.5Z"/>',
    checkCircle: '<path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.78 6.28-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06L8.75 11.2l3.97-3.97a.75.75 0 1 1 1.06 1.06Z"/>',
    warning: '<path d="M8.68 3.27a1.5 1.5 0 0 1 2.64 0l6.25 11.5A1.5 1.5 0 0 1 16.25 17H3.75a1.5 1.5 0 0 1-1.32-2.23l6.25-11.5ZM10 7.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 10 7.5Zm0 7.25a.88.88 0 1 0 0-1.75.88.88 0 0 0 0 1.75Z"/>',
    folder: '<path d="M4.5 3A2.5 2.5 0 0 0 2 5.5v9A2.5 2.5 0 0 0 4.5 17h11a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 15.5 5h-5.38L8.7 3.59A2 2 0 0 0 7.3 3H4.5Z"/>',
    history: '<path d="M3.25 4a.75.75 0 0 1 .75.75v1.83A7 7 0 1 1 3 10a.75.75 0 0 1 1.5 0 5.5 5.5 0 1 0 1.25-3.5h1.5a.75.75 0 0 1 0 1.5h-3.5A.75.75 0 0 1 3 7.25V4.75a.75.75 0 0 1 .75-.75ZM10 6.25a.75.75 0 0 1 .75.75v2.69l1.97 1.18a.75.75 0 1 1-.77 1.29l-2.34-1.4A.75.75 0 0 1 9.25 10V7a.75.75 0 0 1 .75-.75Z"/>'
  };

  function icon(name, cls = '') {
    return `<svg class="fl2-ico ${cls}" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">${ICONS[name] || ICONS.grid}</svg>`;
  }

  function toneTile(iconName, tone = 'azure', extraCls = '') {
    return el('span', {
      className: `fl2-tone-tile fl2-tone-${tone} ${extraCls}`.trim(),
      html: icon(iconName, 'fl2-ico-sm')
    });
  }

  function brandLogoSvg() {
    return [
      '<svg class="fl2-brand-svg" viewBox="0 0 32 32" aria-hidden="true">',
      '<defs>',
      '<linearGradient id="fl2-lg-tile" x1="0%" y1="0%" x2="100%" y2="100%">',
      '<stop offset="0%" style="stop-color:var(--fl2-logo-1)"/>',
      '<stop offset="52%" style="stop-color:var(--fl2-logo-2)"/>',
      '<stop offset="100%" style="stop-color:var(--fl2-logo-3)"/>',
      '</linearGradient>',
      '<linearGradient id="fl2-lg-gloss" x1="0%" y1="0%" x2="80%" y2="100%">',
      '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55"/>',
      '<stop offset="48%" stop-color="#FFFFFF" stop-opacity="0.14"/>',
      '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.02"/>',
      '</linearGradient>',
      '<linearGradient id="fl2-lg-soft" x1="0%" y1="0%" x2="100%" y2="100%">',
      '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.24"/>',
      '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.04"/>',
      '</linearGradient>',
      '</defs>',
      '<rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="url(#fl2-lg-tile)"/>',
      '<path d="M1.5 18.5C8.5 15.2 21.5 19.6 30.5 13.5V22.5C30.5 26.9 26.9 30.5 22.5 30.5H9.5C5.1 30.5 1.5 26.9 1.5 22.5Z" fill="url(#fl2-lg-soft)"/>',
      '<rect x="2" y="2" width="28" height="28" rx="7.5" fill="none" stroke="url(#fl2-lg-gloss)" stroke-width="1"/>',
      '<path d="M17.2 10.6C15.8 9.2 13.3 8.9 11.4 9.7C9.4 10.5 8.5 12.1 9.0 13.7C9.5 15.3 11.4 16.0 13.5 16.5C15.7 17.0 17.4 17.8 17.8 19.7C18.2 21.7 16.5 23.3 13.6 23.5C11.3 23.6 9.3 22.7 8.1 21.3" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
      '<path d="M17.2 10.6C15.8 9.2 13.3 8.9 11.4 9.7C9.4 10.5 8.5 12.1 9.0 13.7C9.5 15.3 11.4 16.0 13.5 16.5C15.7 17.0 17.4 17.8 17.8 19.7C18.2 21.7 16.5 23.3 13.6 23.5C11.3 23.6 9.3 22.7 8.1 21.3" fill="none" stroke="#FFFFFF" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>',
      '<g class="fl2-brand-plus">',
      '<rect x="21.35" y="7" width="2.3" height="7" rx="1.15" fill="#FFFFFF"/>',
      '<rect x="19" y="9.35" width="7" height="2.3" rx="1.15" fill="#FFFFFF"/>',
      '</g>',
      '</svg>'
    ].join('');
  }

  /* ============================================================================
   * 3. MICROSOFT FLUENT 2 DESIGN SYSTEM CSS
   * ========================================================================== */
  const CSS_TEXT = `
/* Anti-FOUC guard */
html.fl2-loading body { opacity: 0 !important; }
html.fl2-ready body { opacity: 1 !important; transition: opacity 150ms cubic-bezier(0.33, 0, 0.67, 1); }

:root {
  --fl2-font: "Segoe UI Variable", "Segoe UI", "Microsoft YaHei UI", "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  --fl2-mono: "Cascadia Code", Consolas, "Courier New", monospace;
  --fl2-r-xs: 2px;
  --fl2-r-sm: 4px;
  --fl2-r-md: 6px;
  --fl2-r-lg: 8px;
  --fl2-r-xl: 12px;
  --fl2-r-pill: 9999px;
  --fl2-ease: cubic-bezier(0.33, 0, 0.67, 1);
  --fl2-ease-out: cubic-bezier(0.1, 0.9, 0.2, 1);
  --fl2-ease-spring: cubic-bezier(0.22, 1, 0.36, 1);
  --fl2-content-max: 1240px;
  --fl2-nav-w: 248px;
  --fl2-row-py: 11px;
  --fl2-card-p: 16px;

  /* L0 Bloom Mica Canvas & L1-L4 Elevation (Light) */
  --fl2-canvas: #EDF2F8;
  --fl2-bloom-1: rgba(15, 108, 189, 0.15);
  --fl2-bloom-2: rgba(0, 183, 195, 0.11);
  --fl2-bloom-3: rgba(135, 100, 184, 0.09);
  --fl2-mica-bg:
    radial-gradient(62% 52% at 6% 0%, var(--fl2-bloom-1) 0%, transparent 72%),
    radial-gradient(50% 45% at 94% 6%, var(--fl2-bloom-2) 0%, transparent 70%),
    radial-gradient(55% 48% at 50% 100%, var(--fl2-bloom-3) 0%, transparent 72%),
    var(--fl2-canvas);
  --fl2-hero-mesh: linear-gradient(120deg, rgba(15, 108, 189, 0.09) 0%, rgba(0, 183, 195, 0.06) 52%, rgba(135, 100, 184, 0.07) 100%);
  --fl2-brand-grad: linear-gradient(135deg, #1678D0 0%, #0F6CBD 55%, #0B5394 100%);
  --fl2-logo-1: #3CC5FF;
  --fl2-logo-2: #0F6CBD;
  --fl2-logo-3: #2B3BA6;

  --fl2-nav-bg: rgba(246, 248, 252, 0.72);
  --fl2-surface-1: rgba(255, 255, 255, 0.92);
  --fl2-surface-2: rgba(246, 248, 252, 0.86);
  --fl2-surface-3: rgba(235, 239, 246, 0.90);
  --fl2-subtle-hover: rgba(15, 23, 42, 0.045);
  --fl2-subtle-active: rgba(15, 108, 189, 0.085);
  --fl2-acrylic: rgba(250, 252, 255, 0.78);
  --fl2-acrylic-strong: rgba(255, 255, 255, 0.90);
  --fl2-acrylic-noise: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E");
  --fl2-reveal-glow: rgba(15, 108, 189, 0.09);

  --fl2-fg-1: #1F2328;
  --fl2-fg-2: #42474E;
  --fl2-fg-3: #636972;
  --fl2-fg-4: #8A9099;

  /* WinUI 3 Directional Physical Borders (Light) */
  --fl2-stroke-1: rgba(0, 0, 0, 0.095);
  --fl2-stroke-2: rgba(0, 0, 0, 0.065);
  --fl2-stroke-card: rgba(0, 0, 0, 0.075);
  --fl2-stroke-top: rgba(255, 255, 255, 0.95);
  --fl2-stroke-bottom: rgba(0, 0, 0, 0.14);
  --fl2-stroke-strong: rgba(0, 0, 0, 0.36);

  --fl2-shadow-2: inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 1px 2px rgba(15, 23, 42, 0.05), 0 2px 5px rgba(15, 23, 42, 0.03);
  --fl2-shadow-4: inset 0 1px 0 rgba(255, 255, 255, 0.90), 0 2px 6px rgba(15, 23, 42, 0.07), 0 1px 2px rgba(15, 23, 42, 0.05);
  --fl2-shadow-8: inset 0 1px 0 rgba(255, 255, 255, 0.92), 0 6px 16px rgba(15, 23, 42, 0.10), 0 2px 4px rgba(15, 23, 42, 0.05);
  --fl2-shadow-16: inset 0 1px 0 rgba(255, 255, 255, 0.72), 0 12px 32px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.07);

  --fl2-warn-bg: #FFF4CE;
  --fl2-warn-fg: #6B4E00;
  --fl2-warn-stroke: #E9C76B;
  --fl2-danger-bg: #FDECEE;
  --fl2-danger-fg: #A80E1E;
  --fl2-danger-stroke: #F1B8BE;
  --fl2-success-bg: #ECF8EC;
  --fl2-success-fg: #0E6B0E;
  --fl2-success-stroke: #A7DBA7;
  --fl2-scrim: rgba(15, 23, 42, 0.34);

  color-scheme: light;
}

html[data-fl2-theme="dark"] {
  --fl2-canvas: #13161C;
  --fl2-bloom-1: rgba(38, 128, 235, 0.22);
  --fl2-bloom-2: rgba(0, 178, 196, 0.14);
  --fl2-bloom-3: rgba(138, 92, 246, 0.13);
  --fl2-nav-bg: rgba(24, 27, 34, 0.78);
  --fl2-surface-1: rgba(37, 41, 50, 0.90);
  --fl2-surface-2: rgba(30, 34, 42, 0.88);
  --fl2-surface-3: rgba(48, 53, 64, 0.92);
  --fl2-subtle-hover: rgba(255, 255, 255, 0.065);
  --fl2-subtle-active: rgba(255, 255, 255, 0.10);
  --fl2-acrylic: rgba(28, 31, 38, 0.78);
  --fl2-acrylic-strong: rgba(36, 40, 49, 0.92);
  --fl2-acrylic-noise: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
  --fl2-reveal-glow: rgba(120, 185, 255, 0.13);

  --fl2-fg-1: #F3F5F8;
  --fl2-fg-2: #D1D6DF;
  --fl2-fg-3: #9BA3B0;
  --fl2-fg-4: #727A87;

  /* WinUI 3 Directional Physical Borders (Dark) */
  --fl2-stroke-1: rgba(255, 255, 255, 0.09);
  --fl2-stroke-2: rgba(255, 255, 255, 0.065);
  --fl2-stroke-card: rgba(255, 255, 255, 0.08);
  --fl2-stroke-top: rgba(255, 255, 255, 0.14);
  --fl2-stroke-bottom: rgba(0, 0, 0, 0.45);
  --fl2-stroke-strong: rgba(255, 255, 255, 0.30);

  --fl2-shadow-2: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 2px 4px rgba(0, 0, 0, 0.32);
  --fl2-shadow-4: inset 0 1px 0 rgba(255, 255, 255, 0.09), 0 3px 8px rgba(0, 0, 0, 0.38);
  --fl2-shadow-8: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 8px 20px rgba(0, 0, 0, 0.48);
  --fl2-shadow-16: inset 0 1px 0 rgba(255, 255, 255, 0.13), 0 14px 36px rgba(0, 0, 0, 0.62);

  --fl2-warn-bg: rgba(120, 90, 20, 0.34);
  --fl2-warn-fg: #FCE100;
  --fl2-warn-stroke: rgba(252, 225, 0, 0.24);
  --fl2-danger-bg: rgba(140, 34, 46, 0.34);
  --fl2-danger-fg: #FB8592;
  --fl2-danger-stroke: rgba(251, 133, 146, 0.26);
  --fl2-success-bg: rgba(25, 92, 42, 0.34);
  --fl2-success-fg: #6CCB5F;
  --fl2-success-stroke: rgba(108, 203, 95, 0.24);
  --fl2-scrim: rgba(0, 0, 0, 0.56);

  color-scheme: dark;
}

html[data-fl2-width="wide"] { --fl2-content-max: 1560px; }
html[data-fl2-density="compact"] { --fl2-row-py: 7px; --fl2-card-p: 12px; }
html[data-fl2-nav-collapsed="true"] { --fl2-nav-w: 52px; }

html, body {
  margin: 0 !important;
  padding: 0 !important;
  font-family: var(--fl2-font) !important;
  font-size: 14px !important;
  line-height: 1.55 !important;
  color: var(--fl2-fg-1) !important;
  background: var(--fl2-canvas) !important;
  background-image: var(--fl2-mica-bg) !important;
  background-attachment: fixed !important;
  -webkit-font-smoothing: antialiased;
}
*, *::before, *::after { box-sizing: border-box; }
a { color: var(--fl2-brand-fg); text-decoration: none; }
a:hover { color: var(--fl2-brand-hover); text-decoration: underline; }

/* Hide raw legacy layout completely once Virtual DOM shell is mounted (keep native JS/popups working) */
html.fl2-ready #toptool,
html.fl2-ready #wrapA,
html.fl2-ready #footer,
html.fl2-ready #bottom,
html.fl2-ready center.hidden-md.hidden-lg {
  display: none !important;
}

/* Dark Mode inline color rescue inside re-parented native nodes */
html[data-fl2-theme="dark"] #fl2-shell font[color="#000000"],
html[data-fl2-theme="dark"] #fl2-shell font[color="#000"],
html[data-fl2-theme="dark"] #fl2-shell font[color="black"],
html[data-fl2-theme="dark"] #fl2-shell [style*="color:#000000"],
html[data-fl2-theme="dark"] #fl2-shell [style*="color: #000000"],
html[data-fl2-theme="dark"] #fl2-shell [style*="color:#333"],
html[data-fl2-theme="dark"] #fl2-shell .gray3 {
  color: var(--fl2-fg-1) !important;
}
html[data-fl2-theme="dark"] #fl2-shell .gray,
html[data-fl2-theme="dark"] #fl2-shell .gray2,
html[data-fl2-theme="dark"] #fl2-shell .s8 {
  color: var(--fl2-fg-3) !important;
}
html[data-fl2-theme="dark"] #fl2-shell font[color="#FF0000"],
html[data-fl2-theme="dark"] #fl2-shell font[color="red"],
html[data-fl2-theme="dark"] #fl2-shell [style*="color:red"],
html[data-fl2-theme="dark"] #fl2-shell [style*="color:#FF0000"] {
  color: #F87171 !important;
}
html[data-fl2-theme="dark"] #fl2-shell font[color="#0000FF"],
html[data-fl2-theme="dark"] #fl2-shell [style*="color:#0000FF"] {
  color: var(--fl2-brand-fg) !important;
}

.fl2-ico { width: 18px; height: 18px; flex-shrink: 0; display: block; }
.fl2-ico-sm { width: 14px; height: 14px; }
.fl2-ico-lg { width: 20px; height: 20px; }

/* === Duotone Icon Tiles (Microsoft Store / Copilot Semantic Anchors) === */
.fl2-tone-tile {
  width: 30px;
  height: 30px;
  border-radius: var(--fl2-r-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 1px 3px rgba(15, 23, 42, 0.08);
}
html[data-fl2-theme="dark"] .fl2-tone-tile {
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 5px rgba(0, 0, 0, 0.35);
}
.fl2-tone-azure   { background: linear-gradient(135deg, rgba(15,108,189,0.20), rgba(56,189,248,0.14)); color: #0F6CBD; }
.fl2-tone-teal    { background: linear-gradient(135deg, rgba(3,131,135,0.20), rgba(45,212,191,0.14)); color: #038387; }
.fl2-tone-amber   { background: linear-gradient(135deg, rgba(217,119,6,0.20), rgba(251,191,36,0.16)); color: #B45309; }
.fl2-tone-indigo  { background: linear-gradient(135deg, rgba(79,70,229,0.20), rgba(129,140,248,0.14)); color: #4338CA; }
.fl2-tone-violet  { background: linear-gradient(135deg, rgba(124,58,237,0.20), rgba(192,132,252,0.15)); color: #6D28D9; }
.fl2-tone-emerald { background: linear-gradient(135deg, rgba(16,124,16,0.20), rgba(74,222,128,0.15)); color: #107C10; }
.fl2-tone-crimson { background: linear-gradient(135deg, rgba(196,49,75,0.20), rgba(251,113,133,0.15)); color: #C4314B; }
html[data-fl2-theme="dark"] .fl2-tone-azure   { color: #60A5FA; }
html[data-fl2-theme="dark"] .fl2-tone-teal    { color: #2DD4BF; }
html[data-fl2-theme="dark"] .fl2-tone-amber   { color: #FBBF24; }
html[data-fl2-theme="dark"] .fl2-tone-indigo  { color: #818CF8; }
html[data-fl2-theme="dark"] .fl2-tone-violet  { color: #C084FC; }
html[data-fl2-theme="dark"] .fl2-tone-emerald { color: #4ADE80; }
html[data-fl2-theme="dark"] .fl2-tone-crimson { color: #FB7185; }

/* Fluent Reveal Interactive Surface */
.fl2-reveal {
  position: relative;
  overflow: hidden;
}
.fl2-reveal::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(240px circle at var(--fl2-rx, -200px) var(--fl2-ry, -200px), var(--fl2-reveal-glow), transparent 72%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms var(--fl2-ease-out);
  z-index: 0;
}
.fl2-reveal:hover::before { opacity: 1; }
.fl2-reveal > * { position: relative; z-index: 1; }

/* === Shell: Living Bloom Canvas + Mica TitleBar + Collapsible NavigationView === */
#fl2-bloom-bg {
  position: fixed;
  inset: -10%;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}
#fl2-bloom-bg::before,
#fl2-bloom-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  will-change: transform;
}
#fl2-bloom-bg::before {
  background:
    radial-gradient(58% 48% at 10% 8%, var(--fl2-bloom-1) 0%, transparent 70%),
    radial-gradient(46% 42% at 90% 12%, var(--fl2-bloom-2) 0%, transparent 68%);
  animation: fl2BloomDriftA 24s ease-in-out infinite alternate;
}
#fl2-bloom-bg::after {
  background: radial-gradient(56% 48% at 52% 94%, var(--fl2-bloom-3) 0%, transparent 70%);
  animation: fl2BloomDriftB 30s ease-in-out infinite alternate;
}
@keyframes fl2BloomDriftA {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  100% { transform: translate3d(2.5%, 1.8%, 0) scale(1.06); }
}
@keyframes fl2BloomDriftB {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  100% { transform: translate3d(-2.5%, -1.8%, 0) scale(1.07); }
}

#fl2-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#fl2-titlebar {
  position: sticky;
  top: 0;
  z-index: 1200;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  background-color: var(--fl2-acrylic);
  background-image: var(--fl2-acrylic-noise);
  backdrop-filter: blur(32px) saturate(170%);
  -webkit-backdrop-filter: blur(32px) saturate(170%);
  border-bottom: 1px solid var(--fl2-stroke-card);
  box-shadow: inset 0 1px 0 var(--fl2-stroke-top), 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: box-shadow 180ms var(--fl2-ease-out), border-color 180ms var(--fl2-ease-out), background-color 180ms var(--fl2-ease-out);
}
html.fl2-scrolled #fl2-titlebar {
  box-shadow: inset 0 1px 0 var(--fl2-stroke-top), 0 4px 16px rgba(15, 23, 42, 0.08);
}
html[data-fl2-theme="dark"].fl2-scrolled #fl2-titlebar {
  box-shadow: inset 0 1px 0 var(--fl2-stroke-top), 0 6px 20px rgba(0, 0, 0, 0.42);
}

.fl2-tb-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1 1 0;
}
.fl2-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 3px 8px 3px 4px;
  border-radius: var(--fl2-r-md);
  color: var(--fl2-fg-1) !important;
  white-space: nowrap;
  flex-shrink: 0;
  text-decoration: none !important;
  transition: background 140ms var(--fl2-ease-out);
}
.fl2-brand:hover { background: var(--fl2-subtle-hover); }
.fl2-brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.16);
  transition: transform 220ms var(--fl2-ease-out), box-shadow 220ms var(--fl2-ease-out);
}
.fl2-brand-mark::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 25%, rgba(255, 255, 255, 0.45) 50%, transparent 75%);
  transform: translateX(-130%);
  transition: transform 480ms var(--fl2-ease-out);
  pointer-events: none;
}
.fl2-brand:hover .fl2-brand-mark {
  transform: translateY(-0.5px) scale(1.045);
  box-shadow: 0 4px 12px rgba(15, 108, 189, 0.28);
}
.fl2-brand:hover .fl2-brand-mark::after { transform: translateX(130%); }
.fl2-brand-svg { width: 28px; height: 28px; display: block; }
.fl2-brand-plus {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 340ms var(--fl2-ease-out);
}
.fl2-brand:hover .fl2-brand-plus { transform: rotate(90deg); }
.fl2-brand-wordmark {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  line-height: 1.1;
}
.fl2-brand-zh {
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--fl2-fg-1);
}
.fl2-brand-plus-txt {
  color: var(--fl2-brand-fg);
  font-weight: 800;
}
.fl2-brand-en {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--fl2-fg-3);
  letter-spacing: 0.015em;
}

.fl2-crumbs {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
  padding-left: 8px;
  border-left: 1px solid var(--fl2-stroke-2);
}
.fl2-crumb {
  padding: 3px 7px;
  border-radius: var(--fl2-r-sm);
  color: var(--fl2-fg-2) !important;
  font-size: 12.5px;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none !important;
}
a.fl2-crumb:hover { background: var(--fl2-subtle-hover); color: var(--fl2-fg-1) !important; }
.fl2-crumb.is-current { color: var(--fl2-fg-1) !important; font-weight: 600; max-width: 280px; }
.fl2-crumb-sep { color: var(--fl2-fg-4); display: inline-flex; flex-shrink: 0; }

/* AutoSuggestBox (Center Search) */
.fl2-tb-center {
  position: relative;
  flex: 0 1 380px;
  min-width: 180px;
}
.fl2-autosuggest {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 8px 0 10px;
  border-radius: var(--fl2-r-md);
  border: 1px solid var(--fl2-stroke-1);
  border-bottom: 1px solid var(--fl2-stroke-strong);
  background: var(--fl2-surface-1);
  box-shadow: var(--fl2-shadow-2);
  transition: border-color 140ms var(--fl2-ease-out), box-shadow 140ms var(--fl2-ease-out);
}
.fl2-autosuggest-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--fl2-fg-3);
  flex-shrink: 0;
}
.fl2-autosuggest:focus-within {
  border-bottom: 2px solid var(--fl2-brand);
  box-shadow: var(--fl2-shadow-4);
}
.fl2-autosuggest:focus-within .fl2-autosuggest-ico {
  color: var(--fl2-brand-fg);
}
.fl2-autosuggest input {
  flex: 1;
  min-width: 0;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  height: 100% !important;
  font-family: var(--fl2-font) !important;
  font-size: 13px !important;
  color: var(--fl2-fg-1) !important;
  outline: none !important;
}
.fl2-kbd {
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  border-radius: var(--fl2-r-xs);
  border: 1px solid var(--fl2-stroke-1);
  background: var(--fl2-surface-2);
  color: var(--fl2-fg-3);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}
.fl2-suggest-pop {
  position: absolute;
  top: 38px;
  left: 0;
  right: 0;
  max-height: 360px;
  overflow-y: auto;
  padding: 6px;
  background-color: var(--fl2-acrylic-strong);
  background-image: var(--fl2-acrylic-noise);
  backdrop-filter: blur(32px) saturate(170%);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-16);
  display: none;
  z-index: 1500;
}
.fl2-suggest-pop.is-open { display: block; animation: fl2PopIn 140ms var(--fl2-ease-out); }
@keyframes fl2PopIn {
  from { opacity: 0; transform: translateY(-4px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.fl2-suggest-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--fl2-r-sm);
  color: var(--fl2-fg-1) !important;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none !important;
}
.fl2-suggest-item:hover,
.fl2-suggest-item.is-selected { background: var(--fl2-brand-subtle); }
.fl2-suggest-sub { margin-left: auto; font-size: 11.5px; color: var(--fl2-fg-3); white-space: nowrap; }

.fl2-tb-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  flex: 1 1 0;
  min-width: 0;
  white-space: nowrap;
}

/* Fluent 2 / WinUI 3 Physical Buttons */
.fl2-icon-btn {
  position: relative;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--fl2-r-sm);
  background: transparent;
  color: var(--fl2-fg-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  text-decoration: none !important;
  transition: background 120ms var(--fl2-ease-out), color 120ms var(--fl2-ease-out), border-color 120ms var(--fl2-ease-out), transform 110ms var(--fl2-ease-out);
}
.fl2-icon-btn:hover { background: var(--fl2-subtle-hover); border-color: var(--fl2-stroke-2); color: var(--fl2-fg-1); }
.fl2-icon-btn:active { background: var(--fl2-subtle-active); transform: scale(0.95); }
.fl2-icon-btn.is-morphing .fl2-ico { animation: fl2IconMorph 280ms var(--fl2-ease-out); }
@keyframes fl2IconMorph {
  0% { transform: rotate(-90deg) scale(0.7); opacity: 0.45; }
  100% { transform: rotate(0deg) scale(1); opacity: 1; }
}
.fl2-ico-spin { animation: fl2Spin 700ms linear infinite; }
@keyframes fl2Spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.fl2-dot-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--fl2-brand);
  box-shadow: 0 0 0 2px var(--fl2-surface-1);
}

.fl2-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: var(--fl2-r-sm);
  border: 1px solid var(--fl2-stroke-1);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  background: var(--fl2-surface-1);
  color: var(--fl2-fg-1) !important;
  font-family: var(--fl2-font);
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none !important;
  box-shadow: var(--fl2-shadow-2);
  transition: background 120ms var(--fl2-ease-out), border-color 120ms var(--fl2-ease-out), box-shadow 120ms var(--fl2-ease-out), transform 110ms var(--fl2-ease-out);
}
.fl2-btn:hover { background: var(--fl2-surface-2); border-color: var(--fl2-stroke-strong); box-shadow: var(--fl2-shadow-4); text-decoration: none !important; }
.fl2-btn:active { transform: translateY(0.5px) scale(0.97); box-shadow: none; }
.fl2-btn:disabled { opacity: 0.65; cursor: wait; }
.fl2-btn-sm { height: 28px; padding: 0 10px; font-size: 12.5px; }

.fl2-btn-primary {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border-radius: var(--fl2-r-sm);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-bottom-color: rgba(0, 0, 0, 0.22);
  background: var(--fl2-brand-grad);
  color: var(--fl2-fg-on-brand) !important;
  font-family: var(--fl2-font);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.30), 0 2px 6px rgba(15, 108, 189, 0.24);
  transition: filter 120ms var(--fl2-ease-out), transform 110ms var(--fl2-ease-out), box-shadow 140ms var(--fl2-ease-out);
}
.fl2-btn-primary::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 28%, rgba(255, 255, 255, 0.24) 50%, transparent 72%);
  transform: translateX(-125%);
  transition: transform 420ms var(--fl2-ease-out);
  pointer-events: none;
}
.fl2-btn-primary:hover { filter: brightness(1.06); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.36), 0 4px 10px rgba(15, 108, 189, 0.30); color: var(--fl2-fg-on-brand) !important; text-decoration: none !important; }
.fl2-btn-primary:hover::after { transform: translateX(125%); }
.fl2-btn-primary:active { filter: brightness(0.95); transform: translateY(0.5px) scale(0.97); }
.fl2-btn-primary.fl2-btn-sm { height: 28px; padding: 0 11px; font-size: 12.5px; }

.fl2-btn-subtle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 30px;
  padding: 0 10px;
  border-radius: var(--fl2-r-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--fl2-fg-2) !important;
  font-family: var(--fl2-font);
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none !important;
}
.fl2-btn-subtle:hover { background: var(--fl2-subtle-hover); color: var(--fl2-fg-1) !important; text-decoration: none !important; }

.fl2-persona-trigger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 8px 0 4px;
  border-radius: var(--fl2-r-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--fl2-fg-1);
  font-family: var(--fl2-font);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
}
.fl2-persona-trigger:hover { background: var(--fl2-subtle-hover); }
.fl2-persona-name {
  max-width: 112px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fl2-sp-pill {
  padding: 1px 6px;
  border-radius: var(--fl2-r-sm);
  background: var(--fl2-brand-subtle);
  color: var(--fl2-brand-fg);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.fl2-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--fl2-brand-subtle);
  color: var(--fl2-brand-fg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11.5px;
  font-weight: 600;
  flex-shrink: 0;
  border: 1px solid var(--fl2-stroke-card);
}
.fl2-avatar-lg { width: 46px; height: 46px; font-size: 18px; }

/* === Body & NavigationView === */
#fl2-body {
  flex: 1;
  display: flex;
  min-width: 0;
}

#fl2-nav {
  width: var(--fl2-nav-w);
  flex-shrink: 0;
  position: sticky;
  top: 48px;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  padding: 10px 6px;
  background: var(--fl2-nav-bg);
  border-right: 1px solid var(--fl2-stroke-card);
  box-shadow: inset -1px 0 0 var(--fl2-stroke-2);
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 180ms var(--fl2-ease-out);
  z-index: 900;
}
html[data-fl2-nav-collapsed="true"] #fl2-nav .fl2-nav-label,
html[data-fl2-nav-collapsed="true"] #fl2-nav .fl2-nav-hdr,
html[data-fl2-nav-collapsed="true"] #fl2-nav .fl2-nav-badge,
html[data-fl2-nav-collapsed="true"] #fl2-nav .fl2-tree-group {
  display: none;
}
html[data-fl2-nav-collapsed="true"] #fl2-nav .fl2-nav-item {
  justify-content: center;
  padding: 0;
}

.fl2-nav-sec { margin-bottom: 12px; }
.fl2-nav-hdr {
  padding: 4px 10px 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--fl2-fg-3);
  letter-spacing: 0.02em;
}
.fl2-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 0 10px;
  margin-bottom: 2px;
  border-radius: var(--fl2-r-sm);
  color: var(--fl2-fg-2) !important;
  font-size: 13px;
  font-weight: 400;
  width: 100%;
  border: 1px solid transparent;
  background: transparent;
  font-family: var(--fl2-font);
  text-align: left;
  cursor: pointer;
  text-decoration: none !important;
  transition: background 120ms var(--fl2-ease-out), border-color 120ms var(--fl2-ease-out);
}
.fl2-nav-item:hover { background: var(--fl2-subtle-hover); color: var(--fl2-fg-1) !important; text-decoration: none !important; }
.fl2-nav-item.is-active {
  background: var(--fl2-surface-1);
  border-color: var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  box-shadow: var(--fl2-shadow-2);
  color: var(--fl2-fg-1) !important;
  font-weight: 600;
}
.fl2-nav-item.is-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 99px;
  background: var(--fl2-brand);
  animation: fl2PillIn 180ms var(--fl2-ease-out);
}
@keyframes fl2PillIn {
  from { transform: scaleY(0.35); opacity: 0.4; }
  to { transform: scaleY(1); opacity: 1; }
}
.fl2-nav-item .fl2-ico { color: var(--fl2-fg-3); transition: color 120ms var(--fl2-ease-out); }
.fl2-nav-item:hover .fl2-ico { color: var(--fl2-brand-fg); }
.fl2-nav-item.is-active .fl2-ico { color: var(--fl2-brand-fg); }
.fl2-nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fl2-nav-badge {
  padding: 1px 6px;
  border-radius: var(--fl2-r-pill);
  background: var(--fl2-brand-subtle);
  color: var(--fl2-brand-fg);
  font-size: 11px;
  font-weight: 600;
}

/* WinUI 3 TreeView inside NavigationView */
.fl2-tree-cat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 30px;
  padding: 0 8px;
  border: none;
  border-radius: var(--fl2-r-sm);
  background: transparent;
  color: var(--fl2-fg-2);
  font-family: var(--fl2-font);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}
.fl2-tree-cat-btn:hover { background: var(--fl2-subtle-hover); color: var(--fl2-fg-1); }
.fl2-tree-children {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  padding-left: 14px;
  transition: grid-template-rows 200ms var(--fl2-ease-out), opacity 160ms var(--fl2-ease-out);
}
.fl2-tree-cat.is-open > .fl2-tree-children {
  grid-template-rows: 1fr;
  opacity: 1;
}
.fl2-tree-children-inner { min-height: 0; overflow: hidden; }
.fl2-tree-cat.is-open > .fl2-tree-cat-btn .fl2-tree-chev { transform: rotate(90deg); }
.fl2-tree-chev { transition: transform 150ms var(--fl2-ease-out); color: var(--fl2-fg-3); }
.fl2-tree-leaf {
  display: block;
  padding: 4px 10px;
  margin: 1px 0;
  border-radius: var(--fl2-r-sm);
  color: var(--fl2-fg-2) !important;
  font-size: 12.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none !important;
}
.fl2-tree-leaf:hover { background: var(--fl2-subtle-hover); color: var(--fl2-fg-1) !important; }
.fl2-tree-leaf.is-active { background: var(--fl2-brand-subtle); color: var(--fl2-brand-fg) !important; font-weight: 600; }

#fl2-workspace {
  flex: 1;
  min-width: 0;
  padding: 18px 26px 40px;
}
#fl2-main {
  max-width: var(--fl2-content-max);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
#fl2-footer {
  max-width: var(--fl2-content-max);
  margin: 24px auto 0;
  padding-top: 14px;
  border-top: 1px solid var(--fl2-stroke-2);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  color: var(--fl2-fg-3);
}

#fl2-scrim {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--fl2-scrim);
  z-index: 950;
}
@media (max-width: 1024px) {
  #fl2-nav {
    position: fixed;
    left: 0;
    top: 48px;
    bottom: 0;
    width: 256px !important;
    background: var(--fl2-acrylic-strong);
    backdrop-filter: blur(28px);
    box-shadow: var(--fl2-shadow-16);
    transform: translateX(-105%);
    transition: transform 180ms var(--fl2-ease);
  }
  html[data-fl2-mobile-nav="open"] #fl2-nav { transform: translateX(0); }
  html[data-fl2-mobile-nav="open"] #fl2-scrim { display: block; }
  #fl2-workspace { padding: 14px 12px 28px; }
  .fl2-crumbs { display: none; }
}

/* === Fluent 2 Form Controls (Compound Bottom Border) === */
#fl2-shell input[type="text"],
#fl2-shell input[type="password"],
#fl2-shell input[type="number"],
#fl2-shell input[type="search"],
#fl2-shell select,
#fl2-shell textarea {
  font-family: var(--fl2-font);
  font-size: 13.5px;
  color: var(--fl2-fg-1);
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-1);
  border-bottom: 1px solid var(--fl2-stroke-strong);
  border-radius: var(--fl2-r-sm);
  padding: 5px 10px;
  outline: none;
  transition: border-color 110ms var(--fl2-ease);
}
#fl2-shell input[type="text"]:focus,
#fl2-shell input[type="password"]:focus,
#fl2-shell input[type="number"]:focus,
#fl2-shell select:focus,
#fl2-shell textarea:focus {
  border-bottom: 2px solid var(--fl2-brand);
  padding-bottom: 4px;
}
#fl2-shell input[type="checkbox"],
#fl2-shell input[type="radio"] {
  accent-color: var(--fl2-brand);
}

/* === Shared Fluent Surfaces: Card, Expander, Pivot, MessageBar, Badges, Pagination === */
.fl2-card {
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-2);
  padding: var(--fl2-card-p);
}

.fl2-expander {
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-2);
  overflow: hidden;
}
.fl2-expander-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 16px;
  border: none;
  background: var(--fl2-surface-2);
  color: var(--fl2-fg-1);
  font-family: var(--fl2-font);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: background 120ms var(--fl2-ease-out);
}
.fl2-expander-head:hover { background: var(--fl2-subtle-hover); }
.fl2-expander-chev { transition: transform 200ms var(--fl2-ease-out); color: var(--fl2-fg-3); }
.fl2-expander.is-collapsed .fl2-expander-chev { transform: rotate(-90deg); }
.fl2-expander-body {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  border-top: 1px solid var(--fl2-stroke-2);
  transition: grid-template-rows 240ms var(--fl2-ease-out), opacity 190ms var(--fl2-ease-out), border-color 190ms var(--fl2-ease-out);
}
.fl2-expander.is-collapsed .fl2-expander-body {
  grid-template-rows: 0fr;
  opacity: 0;
  border-top-color: transparent;
}
.fl2-expander-inner {
  min-height: 0;
  overflow: hidden;
  padding: 14px 16px;
}
.fl2-expander-body.fl2-pad-0 .fl2-expander-inner { padding: 0; }

.fl2-pivot {
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  border-bottom: 1px solid var(--fl2-stroke-2);
}
.fl2-pivot-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: none;
  border-radius: var(--fl2-r-sm) var(--fl2-r-sm) 0 0;
  background: transparent;
  color: var(--fl2-fg-2) !important;
  font-family: var(--fl2-font);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none !important;
  transition: background 120ms var(--fl2-ease-out), color 120ms var(--fl2-ease-out);
}
.fl2-pivot-tab:hover { background: var(--fl2-subtle-hover); color: var(--fl2-fg-1) !important; }
.fl2-pivot-tab.is-active { color: var(--fl2-fg-1) !important; font-weight: 600; }
.fl2-pivot-tab.is-active::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--fl2-brand);
  animation: fl2PivotIn 180ms var(--fl2-ease-out);
}
.fl2-pivot.has-ink .fl2-pivot-tab.is-active::after { display: none; }
.fl2-pivot-ink {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 1px;
  border-radius: 3px 3px 0 0;
  background: var(--fl2-brand);
  transform-origin: left center;
  pointer-events: none;
  transition: transform 240ms var(--fl2-ease-out), opacity 160ms var(--fl2-ease-out);
}
@keyframes fl2PivotIn {
  from { transform: scaleX(0.35); opacity: 0.4; }
  to { transform: scaleX(1); opacity: 1; }
}

.fl2-segmented {
  display: inline-flex;
  padding: 2px;
  border-radius: var(--fl2-r-sm);
  background: var(--fl2-surface-3);
  gap: 2px;
}
.fl2-seg-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 10px;
  border: none;
  border-radius: var(--fl2-r-xs);
  background: transparent;
  color: var(--fl2-fg-2) !important;
  font-family: var(--fl2-font);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none !important;
}
.fl2-seg-btn.is-active {
  background: var(--fl2-surface-1);
  color: var(--fl2-fg-1) !important;
  font-weight: 600;
  box-shadow: var(--fl2-shadow-2);
}

.fl2-msgbar {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--fl2-r-md);
  border: 1px solid var(--fl2-stroke-card);
  border-left: 3px solid var(--fl2-brand);
  background: var(--fl2-surface-1);
  box-shadow: var(--fl2-shadow-2);
  font-size: 13px;
}
.fl2-msgbar-warn {
  background: var(--fl2-warn-bg);
  border-color: var(--fl2-warn-stroke);
  border-left-color: var(--fl2-warn-fg);
  color: var(--fl2-warn-fg);
}

.fl2-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 7px;
  border-radius: var(--fl2-r-sm);
  border: 1px solid var(--fl2-stroke-2);
  font-size: 11.5px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;
  background: var(--fl2-surface-3);
  color: var(--fl2-fg-2);
  text-decoration: none !important;
}
.fl2-badge-brand { background: var(--fl2-brand-subtle); color: var(--fl2-brand-fg); border-color: rgba(15, 108, 189, 0.22); }
.fl2-badge-warn { background: var(--fl2-warn-bg); color: var(--fl2-warn-fg); border-color: var(--fl2-warn-stroke); }
.fl2-badge-danger { background: var(--fl2-danger-bg); color: var(--fl2-danger-fg); border-color: var(--fl2-danger-stroke); }
.fl2-badge-success { background: var(--fl2-success-bg); color: var(--fl2-success-fg); border-color: var(--fl2-success-stroke); }

.fl2-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-2);
}
.fl2-page-pills { display: flex; flex-wrap: wrap; gap: 4px; }
.fl2-page-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: var(--fl2-r-sm);
  border: 1px solid var(--fl2-stroke-2);
  background: var(--fl2-surface-1);
  color: var(--fl2-fg-2) !important;
  font-size: 12.5px;
  font-weight: 500;
  text-decoration: none !important;
  transition: background 120ms var(--fl2-ease-out), color 120ms var(--fl2-ease-out), transform 110ms var(--fl2-ease-out);
}
.fl2-page-pill:hover { background: var(--fl2-subtle-hover); color: var(--fl2-fg-1) !important; }
.fl2-page-pill:active { transform: scale(0.95); }
.fl2-page-pill.is-current {
  background: var(--fl2-brand);
  border-color: var(--fl2-brand);
  color: var(--fl2-fg-on-brand) !important;
  font-weight: 600;
}
.fl2-page-go { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--fl2-fg-3); }
.fl2-page-go input { width: 54px; height: 28px; text-align: center; padding: 2px 6px !important; }

/* === Page 1: HOME (主页.html) === */
@keyframes fl2FadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.fl2-home-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  background-color: var(--fl2-surface-1);
  background-image: var(--fl2-hero-mesh);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-4);
  animation: fl2FadeSlideUp 280ms var(--fl2-ease-out) both;
}
.fl2-kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}
@media (max-width: 1080px) { .fl2-kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 560px) { .fl2-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.fl2-kpi-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-2);
  padding: 11px 12px;
  animation: fl2FadeSlideUp 300ms var(--fl2-ease-out) both;
  animation-delay: calc(var(--fl2-i, 0) * 35ms);
  transition: transform 140ms var(--fl2-ease-out), box-shadow 140ms var(--fl2-ease-out), border-color 140ms var(--fl2-ease-out);
}
.fl2-kpi-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--fl2-shadow-4);
  border-color: var(--fl2-brand);
}
.fl2-kpi-lbl { font-size: 11.5px; color: var(--fl2-fg-3); }
.fl2-kpi-val { font-size: 17.5px; font-weight: 700; color: var(--fl2-fg-1); margin-top: 1px; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }

.fl2-feeds-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}
.fl2-feeds-grid.is-single { grid-template-columns: 1fr; }
@media (max-width: 1120px) { .fl2-feeds-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .fl2-feeds-grid { grid-template-columns: 1fr; } }

.fl2-feed-box {
  background: var(--fl2-surface-2);
  border: 1px solid var(--fl2-stroke-2);
  border-radius: var(--fl2-r-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.fl2-feed-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--fl2-fg-1);
}
.fl2-feed-list { display: flex; flex-direction: column; gap: 3px; }
.fl2-feeds-grid.is-single .fl2-feed-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 14px;
}
@media (max-width: 780px) {
  .fl2-feeds-grid.is-single .fl2-feed-list { grid-template-columns: 1fr; }
}
.fl2-feed-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 6px;
  border-radius: var(--fl2-r-sm);
  color: var(--fl2-fg-2) !important;
  font-size: 12.5px;
  text-decoration: none !important;
  min-width: 0;
  transition: background 120ms var(--fl2-ease-out), color 120ms var(--fl2-ease-out), transform 140ms var(--fl2-ease-out);
}
.fl2-feed-row.is-enter {
  animation: fl2FeedIn 220ms var(--fl2-ease-out) both;
  animation-delay: calc(var(--fl2-i, 0) * 14ms);
}
@keyframes fl2FeedIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.fl2-feed-row:hover { background: var(--fl2-subtle-hover); color: var(--fl2-brand-fg) !important; transform: translateX(2px); }
.fl2-feed-skel-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 6px;
  height: 28px;
}
.fl2-skel-num,
.fl2-skel-bar {
  border-radius: var(--fl2-r-xs);
  background: linear-gradient(90deg, var(--fl2-surface-3) 20%, var(--fl2-subtle-hover) 50%, var(--fl2-surface-3) 80%);
  background-size: 220% 100%;
  animation: fl2Shimmer 1.25s var(--fl2-ease) infinite;
}
.fl2-skel-num { width: 18px; height: 18px; flex-shrink: 0; }
.fl2-skel-bar { height: 12px; flex: 1; }
@keyframes fl2Shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
.fl2-feed-num {
  width: 18px;
  height: 18px;
  border-radius: var(--fl2-r-xs);
  background: var(--fl2-surface-3);
  color: var(--fl2-fg-3);
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.fl2-feed-row:nth-child(-n+3) .fl2-feed-num {
  background: var(--fl2-brand-subtle);
  color: var(--fl2-brand-fg);
}
.fl2-feed-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fl2-feed-meta { font-size: 11.5px; color: var(--fl2-fg-3); white-space: nowrap; flex-shrink: 0; }

.fl2-board-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
@media (max-width: 780px) { .fl2-board-grid { grid-template-columns: 1fr; } }

.fl2-board-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--fl2-r-lg);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  background: var(--fl2-surface-1);
  box-shadow: var(--fl2-shadow-2);
  min-width: 0;
  transition: transform 140ms var(--fl2-ease-out), border-color 140ms var(--fl2-ease-out), box-shadow 140ms var(--fl2-ease-out);
}
.fl2-board-card:hover {
  transform: translateY(-1px);
  border-color: var(--fl2-brand);
  box-shadow: var(--fl2-shadow-8);
}
.fl2-board-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.fl2-board-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--fl2-r-md);
  background: var(--fl2-surface-3);
  border: 1px solid var(--fl2-stroke-2);
  box-shadow: inset 0 1px 0 var(--fl2-stroke-top);
  color: var(--fl2-fg-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.fl2-board-icon.has-new {
  background: var(--fl2-brand-subtle);
  border-color: rgba(15, 108, 189, 0.25);
  color: var(--fl2-brand-fg);
}
.fl2-board-title { font-size: 15px; font-weight: 600; color: var(--fl2-fg-1) !important; }
.fl2-board-desc { font-size: 12.5px; color: var(--fl2-fg-3); margin-top: 2px; line-height: 1.45; }
.fl2-sub-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.fl2-sub-chip {
  padding: 2px 8px;
  border-radius: var(--fl2-r-sm);
  border: 1px solid var(--fl2-stroke-2);
  background: var(--fl2-surface-2);
  color: var(--fl2-fg-2) !important;
  font-size: 12px;
  text-decoration: none !important;
  transition: border-color 120ms var(--fl2-ease-out), color 120ms var(--fl2-ease-out), transform 110ms var(--fl2-ease-out);
}
.fl2-sub-chip:hover { border-color: var(--fl2-brand); color: var(--fl2-brand-fg) !important; }
.fl2-sub-chip:active { transform: scale(0.96); }
.fl2-board-foot {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--fl2-stroke-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: var(--fl2-fg-3);
  min-width: 0;
}
.fl2-board-last {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

/* === Page 2 & 3: BOARD HEADER, THREAD LIST & PICTURE WALL === */
.fl2-forum-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  background-color: var(--fl2-surface-1);
  background-image: var(--fl2-hero-mesh);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-4);
  animation: fl2FadeSlideUp 280ms var(--fl2-ease-out) both;
}
.fl2-forum-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--fl2-fg-1); }
.fl2-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-2);
}

.fl2-details-list {
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-2);
  overflow: hidden;
}
.fl2-details-hdr {
  display: grid;
  grid-template-columns: 36px 1fr 140px 110px 160px;
  gap: 10px;
  padding: 9px 14px;
  background: var(--fl2-surface-2);
  border-bottom: 1px solid var(--fl2-stroke-2);
  font-size: 12px;
  font-weight: 600;
  color: var(--fl2-fg-3);
}
.fl2-thread-row {
  display: grid;
  grid-template-columns: 36px 1fr 140px 110px 160px;
  gap: 10px;
  align-items: center;
  padding: var(--fl2-row-py) 14px;
  border-bottom: 1px solid var(--fl2-stroke-2);
  transition: background 100ms var(--fl2-ease);
}
.fl2-thread-row:last-child { border-bottom: none; }
.fl2-thread-row:hover { background: var(--fl2-subtle-hover); }
.fl2-thread-ico {
  width: 30px;
  height: 30px;
  border-radius: var(--fl2-r-sm);
  background: var(--fl2-surface-3);
  color: var(--fl2-fg-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.fl2-thread-ico.is-hot { background: var(--fl2-brand-subtle); color: var(--fl2-brand-fg); }
.fl2-thread-ico.is-new { background: var(--fl2-success-bg); color: var(--fl2-success-fg); }
.fl2-thread-main { min-width: 0; }
.fl2-thread-title-line { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.fl2-thread-link { font-size: 14px; font-weight: 500; color: var(--fl2-fg-1) !important; word-break: break-word; }
.fl2-thread-link:hover { color: var(--fl2-brand-fg) !important; }
.fl2-thread-pages { display: inline-flex; flex-wrap: wrap; gap: 3px; margin-left: 4px; }
.fl2-thread-pages a {
  padding: 0 5px;
  border-radius: 3px;
  background: var(--fl2-surface-3);
  color: var(--fl2-fg-2) !important;
  font-size: 11px;
}
.fl2-thread-col { font-size: 12.5px; color: var(--fl2-fg-2); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fl2-thread-sub { font-size: 11.5px; color: var(--fl2-fg-3); }

@media (max-width: 900px) {
  .fl2-details-hdr { display: none; }
  .fl2-thread-row {
    grid-template-columns: 30px 1fr;
    gap: 6px 10px;
  }
  .fl2-thread-col-author,
  .fl2-thread-col-stats,
  .fl2-thread-col-last { grid-column: 2; }
}

/* Picture Wall Grid */
.fl2-wall-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
  gap: 14px;
}
.fl2-wall-card {
  display: flex;
  flex-direction: column;
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-2);
  overflow: hidden;
  transition: transform 140ms var(--fl2-ease-out), box-shadow 140ms var(--fl2-ease-out), border-color 140ms var(--fl2-ease-out);
}
.fl2-wall-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--fl2-shadow-8);
  border-color: var(--fl2-brand);
}
.fl2-wall-media {
  position: relative;
  aspect-ratio: 16 / 10;
  background: var(--fl2-surface-3);
  overflow: hidden;
}
.fl2-wall-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.fl2-wall-grid.is-contain .fl2-wall-media img { object-fit: contain; }
.fl2-wall-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
}
.fl2-wall-float {
  width: 30px;
  height: 30px;
  border-radius: var(--fl2-r-sm);
  border: 1px solid rgba(255,255,255,0.22);
  background: rgba(24, 24, 28, 0.72);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.fl2-wall-float:hover { background: var(--fl2-brand); }
.fl2-wall-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.fl2-wall-title {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--fl2-fg-1) !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.fl2-wall-foot {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--fl2-stroke-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--fl2-fg-3);
}

/* === Page 4: THREAD VIEW & PAID THREAD === */
.fl2-cmdbar {
  position: sticky;
  top: 56px;
  z-index: 800;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--fl2-acrylic);
  background-image: var(--fl2-acrylic-noise);
  backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-8);
}
.fl2-thread-hero {
  background-color: var(--fl2-surface-1);
  background-image: var(--fl2-hero-mesh);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-4);
  padding: 18px 22px;
}
.fl2-thread-h1 { margin: 6px 0 0; font-size: 20px; font-weight: 600; line-height: 1.38; color: var(--fl2-fg-1); }

.fl2-post-list { display: flex; flex-direction: column; gap: 12px; }
.fl2-post-card {
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-2);
  overflow: hidden;
}
.fl2-post-card.is-op { border-top: 3px solid var(--fl2-brand); }
.fl2-post-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  background: var(--fl2-surface-2);
  border-bottom: 1px solid var(--fl2-stroke-2);
}
.fl2-post-author { display: flex; align-items: center; gap: 10px; min-width: 0; }
.fl2-avatar-btn {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  flex-shrink: 0;
}
.fl2-avatar-btn img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 1px solid var(--fl2-stroke-card);
}
.fl2-post-body {
  padding: 18px 22px;
  font-size: 14.5px;
  line-height: 1.72;
  color: var(--fl2-fg-1);
  overflow-wrap: anywhere;
}
html[data-fl2-fontsize="small"] .fl2-post-body { font-size: 13.5px; }
html[data-fl2-fontsize="large"] .fl2-post-body { font-size: 16px; }
.fl2-post-body img:not([src*="smile"]):not([src*="colorImagination"]) {
  max-width: 100% !important;
  height: auto !important;
  border-radius: var(--fl2-r-md);
  margin: 6px 0;
  cursor: zoom-in;
  box-shadow: var(--fl2-shadow-2);
}
.fl2-post-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--fl2-surface-2);
  border-top: 1px solid var(--fl2-stroke-2);
}

.fl2-buy-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 18px;
  margin: 14px 0;
  border-radius: var(--fl2-r-lg);
  border: 1px solid var(--fl2-brand);
  background: var(--fl2-brand-subtle);
}
.fl2-buy-card.is-unlocked {
  border-color: var(--fl2-success-fg);
  background: var(--fl2-success-bg);
}
.fl2-post-body blockquote.blockquote {
  margin: 12px 0;
  padding: 10px 14px;
  border-radius: var(--fl2-r-md);
  border: 1px solid var(--fl2-warn-stroke);
  border-left: 4px solid var(--fl2-warn-fg);
  background: var(--fl2-warn-bg);
  color: var(--fl2-warn-fg);
  font-size: 13px;
}
.fl2-post-body .blockquote2,
.fl2-post-body .blockquote3 {
  width: auto !important;
  padding: 10px 14px;
  margin: 10px 0;
  border-radius: var(--fl2-r-md);
  border: 1px solid var(--fl2-stroke-2);
  border-left: 3px solid var(--fl2-brand);
  background: var(--fl2-surface-2);
  color: var(--fl2-fg-2);
}
.fl2-marks {
  margin: 0 18px 14px;
  padding: 8px 12px;
  border-radius: var(--fl2-r-md);
  background: var(--fl2-surface-2);
  font-size: 12.5px;
}

.fl2-reply-card form[name="FORM"] textarea[name="atc_content"] {
  width: 100% !important;
  min-height: 150px;
}
.fl2-reply-card td.f_one {
  background: transparent !important;
  border: none !important;
  padding: 6px 8px !important;
  vertical-align: top;
}

/* === Page 5: USER SPACE (u.php) === */
.fl2-u-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  background-color: var(--fl2-surface-1);
  background-image: var(--fl2-hero-mesh);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-bottom-color: var(--fl2-stroke-bottom);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-4);
}
.fl2-u-avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--fl2-brand-subtle);
}
.fl2-u-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(240px, 1fr);
  gap: 14px;
  align-items: start;
}
@media (max-width: 820px) { .fl2-u-grid { grid-template-columns: 1fr; } }

.fl2-generic-host table { width: 100%; border-collapse: collapse; }
.fl2-generic-host .u-table td,
.fl2-generic-host .u-table th,
.fl2-generic-host .set-table1 td,
.fl2-generic-host .set-table2 td {
  padding: 9px 8px !important;
  border-bottom: 1px solid var(--fl2-stroke-2) !important;
  font-size: 13px !important;
  color: var(--fl2-fg-2) !important;
  background: transparent !important;
}
.fl2-generic-host .u-table th a { color: var(--fl2-fg-1) !important; font-weight: 500; }
.fl2-generic-host .u-h5 {
  margin: 0 0 10px !important;
  padding: 0 0 8px !important;
  border-bottom: 1px solid var(--fl2-stroke-2) !important;
  background: none !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  color: var(--fl2-fg-1) !important;
}
.fl2-generic-host .u-h5 span,
.fl2-generic-host .u-h5 .r { background: transparent !important; position: static !important; }
.fl2-generic-host .u-h5 .r { float: right; font-size: 12.5px !important; }
.fl2-generic-host .u-content-66,
.fl2-generic-host .u-content-33,
.fl2-generic-host #u-contentmain,
.fl2-generic-host #u-contentside { width: 100% !important; float: none !important; border: none !important; padding: 0 !important; }

/* === Page 6: SETTINGS / MESSAGE / USERPAY === */
.fl2-set-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 14px;
  align-items: start;
}
@media (max-width: 820px) { .fl2-set-grid { grid-template-columns: 1fr; } }
.fl2-set-nav {
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-2);
  padding: 8px 6px;
}
.fl2-set-host .set-tab-table { border-bottom: 1px solid var(--fl2-stroke-2); margin-bottom: 12px; }
.fl2-set-host .set-tab-table td {
  position: relative;
  border: none !important;
  padding: 8px 14px !important;
  font-size: 13px !important;
  color: var(--fl2-fg-2) !important;
}
.fl2-set-host .set-tab-table td.current { color: var(--fl2-fg-1) !important; font-weight: 600 !important; }
.fl2-set-host .set-tab-table td.current::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--fl2-brand);
}
.fl2-set-host .set-content-left,
.fl2-set-host .set-content-right { width: 100% !important; float: none !important; }
.fl2-set-host #set-content-wrap.fl2-has-split {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 18px;
}
@media (max-width: 880px) { .fl2-set-host #set-content-wrap.fl2-has-split { grid-template-columns: 1fr; } }
.fl2-pay-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 18px;
  margin: 0 !important;
}
.fl2-pay-grid > div { width: 100% !important; float: none !important; padding: 0 !important; }
@media (max-width: 880px) { .fl2-pay-grid { grid-template-columns: 1fr; } }

/* === Page 7: LOGIN & REDIRECT === */
.fl2-auth-card {
  width: 100%;
  max-width: 440px;
  margin: 24px auto;
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-radius: var(--fl2-r-xl);
  box-shadow: var(--fl2-shadow-16);
  padding: 28px;
}
.fl2-auth-card form table { width: 100% !important; border: none !important; }
.fl2-auth-card form tr { display: flex; flex-direction: column; margin-bottom: 12px; }
.fl2-auth-card form th,
.fl2-auth-card form td { width: 100% !important; text-align: left !important; padding: 0 !important; height: auto !important; line-height: 1.5 !important; }
.fl2-auth-card form th { font-size: 12.5px !important; font-weight: 600 !important; color: var(--fl2-fg-2) !important; margin-bottom: 5px; }
.fl2-auth-card form input[type="text"],
.fl2-auth-card form input[type="password"] { width: 100% !important; height: 34px !important; }
.fl2-auth-card form input[name="gdcode"] { width: 140px !important; }
.fl2-auth-card form input[type="submit"] {
  width: 100% !important;
  height: 36px !important;
  background: var(--fl2-brand) !important;
  color: var(--fl2-fg-on-brand) !important;
  border: none !important;
  border-radius: var(--fl2-r-sm) !important;
  font-weight: 600 !important;
  cursor: pointer;
}

.fl2-status-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.fl2-status-card {
  width: 100%;
  max-width: 430px;
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-card);
  border-radius: var(--fl2-r-xl);
  box-shadow: var(--fl2-shadow-16);
  padding: 28px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.fl2-status-progress {
  width: 100%;
  height: 4px;
  border-radius: 99px;
  background: var(--fl2-surface-3);
  overflow: hidden;
}
.fl2-status-bar {
  height: 100%;
  background: var(--fl2-brand);
  transform-origin: left center;
  animation: fl2Bar 1.1s linear forwards;
}
@keyframes fl2Bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* === Acrylic Popovers, Win11 Settings Drawer, Lightbox, Toast === */
.fl2-popover {
  position: fixed;
  z-index: 1600;
  min-width: 240px;
  max-width: min(340px, calc(100vw - 24px));
  background-color: var(--fl2-acrylic-strong);
  background-image: var(--fl2-acrylic-noise);
  backdrop-filter: blur(32px) saturate(170%);
  border: 1px solid var(--fl2-stroke-card);
  border-top-color: var(--fl2-stroke-top);
  border-radius: var(--fl2-r-lg);
  box-shadow: var(--fl2-shadow-16);
  padding: 14px;
  display: none;
}
.fl2-popover.is-open { display: block; animation: fl2PopIn 140ms var(--fl2-ease-out); }

#fl2-settings-drawer {
  position: fixed;
  top: 48px;
  right: 0;
  bottom: 0;
  width: 340px;
  max-width: 92vw;
  z-index: 1550;
  background-color: var(--fl2-acrylic-strong);
  background-image: var(--fl2-acrylic-noise);
  backdrop-filter: blur(32px) saturate(170%);
  border-left: 1px solid var(--fl2-stroke-card);
  box-shadow: var(--fl2-shadow-16);
  padding: 18px;
  overflow-y: auto;
  transform: translateX(105%);
  transition: transform 200ms var(--fl2-ease-out);
}
#fl2-settings-drawer.is-open { transform: translateX(0); }

.fl2-set-card {
  background: var(--fl2-surface-1);
  border: 1px solid var(--fl2-stroke-2);
  border-radius: var(--fl2-r-md);
  padding: 10px 12px;
  margin-bottom: 10px;
}
.fl2-set-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.fl2-swatch-row { display: flex; gap: 10px; margin-top: 8px; }
.fl2-swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.fl2-swatch.is-active { box-shadow: 0 0 0 2px var(--fl2-surface-1), 0 0 0 4px var(--fl2-fg-1); }
.fl2-swatch .fl2-ico { display: none; width: 14px; height: 14px; }
.fl2-swatch.is-active .fl2-ico { display: block; }

.fl2-switch {
  position: relative;
  width: 38px;
  height: 20px;
  border-radius: 99px;
  border: 1px solid var(--fl2-stroke-strong);
  background: var(--fl2-surface-1);
  cursor: pointer;
  flex-shrink: 0;
}
.fl2-switch::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  border-radius: 99px;
  background: var(--fl2-fg-3);
  transition: transform 160ms var(--fl2-ease-out), width 120ms var(--fl2-ease-out);
}
.fl2-switch:active::after { width: 15px; }
.fl2-switch[aria-checked="true"] { background: var(--fl2-brand); border-color: var(--fl2-brand); }
.fl2-switch[aria-checked="true"]::after { transform: translateX(18px); background: var(--fl2-fg-on-brand); }
.fl2-switch[aria-checked="true"]:active::after { transform: translateX(15px); }

/* Native PHPWind AJAX popups (#pw_box / .menu) */
html.fl2-ready .menu,
html.fl2-ready #pw_box {
  background: var(--fl2-acrylic-strong) !important;
  backdrop-filter: blur(24px);
  border: 1px solid var(--fl2-stroke-card) !important;
  border-radius: var(--fl2-r-lg) !important;
  box-shadow: var(--fl2-shadow-16) !important;
  color: var(--fl2-fg-1) !important;
  z-index: 1700 !important;
}

/* Lightbox */
#fl2-lightbox {
  position: fixed;
  inset: 0;
  z-index: 2200;
  background: rgba(12, 12, 14, 0.88);
  backdrop-filter: blur(12px);
  display: none;
  flex-direction: column;
}
#fl2-lightbox.is-open { display: flex; }
.fl2-lb-bar { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px; color: #fff; }
.fl2-lb-stage { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; overflow: auto; padding: 16px 56px; }
.fl2-lb-stage img { max-width: 100%; max-height: 100%; border-radius: var(--fl2-r-md); cursor: zoom-in; }
.fl2-lb-stage img.is-zoomed { max-width: none; max-height: none; cursor: zoom-out; }
.fl2-lb-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.22);
  background: rgba(24,24,28,0.75);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

#fl2-toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2300;
  padding: 9px 14px;
  border-radius: var(--fl2-r-md);
  background: var(--fl2-acrylic-strong);
  backdrop-filter: blur(20px);
  border: 1px solid var(--fl2-stroke-card);
  box-shadow: var(--fl2-shadow-8);
  color: var(--fl2-fg-1);
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
  transition: opacity 150ms var(--fl2-ease), transform 150ms var(--fl2-ease);
}
#fl2-toast.is-open { opacity: 1; transform: translateY(0); }

/* Re-parented native buttons inside form hosts */
.fl2-generic-host .btn,
.fl2-reply-card .btn,
.fl2-set-host .btn {
  height: 30px;
  padding: 0 14px;
  border-radius: var(--fl2-r-sm);
  border: 1px solid transparent;
  background: var(--fl2-brand);
  color: var(--fl2-fg-on-brand) !important;
  font-weight: 600;
  cursor: pointer;
}
.fl2-generic-host .abtn,
.fl2-reply-card .abtn {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: var(--fl2-r-sm);
  border: 1px solid var(--fl2-stroke-1);
  background: var(--fl2-surface-1);
  color: var(--fl2-fg-1) !important;
  font-size: 12.5px;
  text-decoration: none !important;
}

@media (prefers-reduced-motion: reduce) {
  #fl2-bloom-bg::before,
  #fl2-bloom-bg::after,
  .fl2-home-hero,
  .fl2-forum-hero,
  .fl2-kpi-card,
  .fl2-feed-row.is-enter,
  .fl2-skel-num,
  .fl2-skel-bar,
  .fl2-ico-spin,
  .fl2-icon-btn.is-morphing .fl2-ico,
  .fl2-pivot-tab.is-active::after,
  .fl2-nav-item.is-active::before {
    animation: none !important;
  }
  .fl2-expander-body,
  .fl2-tree-children,
  .fl2-pivot-ink,
  .fl2-brand-mark,
  .fl2-brand-mark::after,
  .fl2-brand-plus,
  .fl2-btn-primary::after,
  .fl2-switch::after {
    transition: none !important;
  }
}
`;

  function injectStyles() {
    if (document.getElementById('fl2-styles')) return;
    if (typeof GM_addStyle === 'function') {
      try {
        GM_addStyle(CSS_TEXT);
        return;
      } catch (_) {}
    }
    const style = document.createElement('style');
    style.id = 'fl2-styles';
    style.textContent = CSS_TEXT;
    (document.head || document.documentElement).appendChild(style);
  }
  injectStyles();

  /* ============================================================================
   * 4. DOM UTILITIES, DATA EXTRACTORS & AJAX HELPERS
   * ========================================================================== */
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'className') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'dataset' && typeof v === 'object') Object.assign(node.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v);
    }
    const list = Array.isArray(children) ? children : [children];
    for (const c of list) {
      if (c === null || c === undefined || c === false) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function prefersReducedMotion() {
    try {
      return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (_) {
      return false;
    }
  }

  function animateKpiValue(node, rawVal) {
    const target = Number(rawVal);
    if (!Number.isFinite(target) || target <= 10 || prefersReducedMotion()) {
      node.textContent = Number.isFinite(target) ? target.toLocaleString() : String(rawVal || '');
      return;
    }
    const start = Math.floor(target * 0.9);
    const duration = 420;
    const t0 = performance.now();
    node.textContent = start.toLocaleString();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(start + (target - start) * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  }

  function attachPivotInk(pivot) {
    pivot.classList.add('has-ink');
    const ink = el('span', { className: 'fl2-pivot-ink', 'aria-hidden': 'true' });
    pivot.appendChild(ink);
    const sync = () => {
      const active = qs('.fl2-pivot-tab.is-active', pivot);
      if (!active || !active.offsetWidth) {
        ink.style.opacity = '0';
        return;
      }
      const left = active.offsetLeft + 10;
      const width = Math.max(12, active.offsetWidth - 20);
      ink.style.opacity = '1';
      ink.style.transform = `translateX(${left}px) scaleX(${width})`;
    };
    window.addEventListener('resize', () => requestAnimationFrame(sync), { passive: true });
    return sync;
  }

  function htmlToLines(node) {
    if (!node) return [];
    const txt = (node.innerHTML || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(?:div|p|li|tr)>/gi, '\n').replace(/<[^>]+>/g, '');
    const ta = document.createElement('textarea');
    ta.innerHTML = txt;
    return ta.value.split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  function parseFidFromHref(href) {
    const m = (href || '').match(/fid[-=](\d+)/i);
    return m ? m[1] : '';
  }

  function isAdElement(node) {
    if (!node) return false;
    return /segucrwj|sswg-|equity\.tmall\.com|dwz\.cn|onclick="ga\([^"]*'(ad|newmoe|moe80|sswg|menggongfang)'/i.test(node.innerHTML || '');
  }

  function detectPageType() {
    const file = (location.pathname.split('/').pop() || '').toLowerCase();
    const hasShell = !!(qs('#wrapA') || qs('#main') || qs('#u-wrap') || qs('#set-wrap'));
    if (!hasShell && (qs('meta[http-equiv="refresh"]') || /提示信息/.test(document.body?.textContent || ''))) return 'redirect';
    if (qs('form[name="login"]') || qs('form[name="register"]')) return 'login';
    if (file === 'post.php' || qs('form[name="FORM"] #editor-content')) return 'post';
    if (file === 'read.php' || qs('table.js-post') || qs('#read_tpc')) return 'read';
    if (file === 'thread_new.php' || qs('#wall .stream li.dcsns-li')) return 'thread_wall';
    if (file === 'thread.php' || (qs('#ajaxtable') && !qs('#wall'))) return 'thread_list';
    if (file === 'u.php' || qs('#u-wrap')) return 'user';
    if (file === 'userpay.php' || qs('#set-wrap #pay_begin')) return 'userpay';
    if (file === 'message.php' || qs('#set-wrap #msg_receivebox') || qs('#set-wrap #infolist')) return 'message';
    if (file === 'profile.php' || qs('#set-wrap #pro_modify')) return 'profile';
    if (/H_name[-=]tasks/i.test(location.href) || (qs('#main a[href*="H_name-tasks"]') && /任务/.test(document.title))) return 'tasks';
    const sTbl = qs('#main .t table');
    const sHdr = sTbl ? (qs('tr.tr2', sTbl)?.textContent || '') : '';
    if (file === 'search2.php' || (sTbl && /主题列表/.test(sTbl.textContent) && /状态/.test(sHdr) && /标题/.test(sHdr))) return 'search_results';
    if (file === 'search.php' || qs('form[name="sF"]')) return 'search';
    if (file === '' || file === 'index.php' || qs('tbody[id^="cate_"] tr[id^="fid_"]')) return 'index';
    return 'other';
  }

  function parseSmartTitle(raw) {
    const text = (raw || '').trim();
    const tags = [];
    let clean = text;
    [
      { re: /【新汉化作品】/g, label: '新汉化', tone: 'danger' },
      { re: /\[自购\]/g, label: '自购', tone: 'brand' },
      { re: /\[原创\]/g, label: '原创', tone: 'brand' },
      { re: /\[无码\]/g, label: '无码', tone: 'warn' },
      { re: /\[合集\]/g, label: '合集', tone: 'brand' },
      { re: /\[公告\]/g, label: '公告', tone: 'danger' }
    ].forEach((p) => {
      if (p.re.test(clean)) {
        tags.push({ label: p.label, tone: p.tone });
        clean = clean.replace(p.re, '');
      }
    });
    const sz = clean.match(/\[(\d+(?:\.\d+)?\s*(?:GB|MB|TB|G|M))\]/i);
    if (sz) tags.push({ label: sz[1].toUpperCase(), tone: 'neutral' });
    const drv = clean.match(/\[((?:BD|GF|TR|OD|GD|MEGA|PikPak|115|123|度娘|秒传)[^\]]{0,16})\]/i);
    if (drv) tags.push({ label: drv[1], tone: 'neutral' });
    return { raw: text, clean: clean.replace(/\s{2,}/g, ' ').trim() || text, tags };
  }

  function extractUserContext() {
    const loginEl = qs('#user-login');
    const infoBox = qs('#infobox');
    const ctx = {
      loggedIn: false, username: '游客', userHref: 'login.php', hasUnreadMsg: false,
      avatar: '', uid: '', hp: '', sp: '', po: '', lastLogin: '', levelText: '',
      honorText: '您还没有设置个性签名', shortcuts: [], quitHref: '',
      statsToday: '', statsYesterday: '', statsMax: '', statsThemes: '', statsPosts: '', statsMembers: ''
    };

    if (loginEl) {
      const links = qsa('a', loginEl);
      const uA = links.find((a) => /u\.php/i.test(a.getAttribute('href') || ''));
      if (uA) {
        ctx.loggedIn = true;
        ctx.username = uA.textContent.trim() || '用户';
        ctx.userHref = uA.getAttribute('href') || 'u.php';
      }
      const qA = links.find((a) => /action-quit/i.test(a.getAttribute('href') || ''));
      if (qA) ctx.quitHref = qA.getAttribute('href') || '';
      const msgImg = qs('#td_msg img', loginEl);
      if (msgImg) ctx.hasUnreadMsg = !/no-shortmail/i.test(msgImg.getAttribute('src') || '');
    }

    if (infoBox) {
      const avatarImg = qs('#user_info img', infoBox);
      if (avatarImg) ctx.avatar = avatarImg.getAttribute('src') || '';
      const showFace = qs('#showface', infoBox);
      if (showFace) {
        htmlToLines(showFace).forEach((line) => {
          let m;
          if ((m = line.match(/^UID:\s*(\d+)/i))) ctx.uid = m[1].trim();
          else if ((m = line.match(/^HP:\s*(.+)$/i))) ctx.hp = m[1].trim();
          else if ((m = line.match(/^SP币:\s*(.+)$/i))) ctx.sp = m[1].trim();
          else if ((m = line.match(/^魄:\s*(.+)$/i))) ctx.po = m[1].trim();
          else if ((m = line.match(/^最后登录:\s*(.+)$/i))) ctx.lastLogin = m[1].trim();
        });
      }
      const honorEl = qs('#honor', infoBox);
      if (honorEl) ctx.honorText = honorEl.textContent.trim();
      const lvlSpan = qs('#user_info .gray2 > span.fl', infoBox);
      if (lvlSpan) ctx.levelText = lvlSpan.textContent.replace(/我的主题.*$/, '').trim().replace(/,\s*$/, '');

      qsa('#shortcutforum li a', infoBox).forEach((a) => {
        ctx.shortcuts.push({ name: a.textContent.trim(), href: a.getAttribute('href') || '#', fid: parseFidFromHref(a.getAttribute('href')) });
      });

      // Strictly read forum-wide stats from the right cell of #infobox (never from #user_info)
      const rightTd = qs('td:last-child', infoBox);
      if (rightTd && !qs('#shortcutforum', rightTd) && rightTd.id !== 'user_info') {
        const st = rightTd.textContent.replace(/\s+/g, ' ').trim();
        ctx.statsToday = (st.match(/今日[:：]\s*(\d+)/) || [])[1] || '';
        ctx.statsYesterday = (st.match(/昨日[:：]\s*(\d+)/) || [])[1] || '';
        ctx.statsMax = (st.match(/最高日[:：]\s*(\d+)/) || [])[1] || '';
        ctx.statsThemes = (st.match(/主题[:：]\s*(\d+)/) || [])[1] || '';
        ctx.statsPosts = (st.match(/帖子[:：]\s*(\d+)/) || [])[1] || '';
        ctx.statsMembers = (st.match(/会员[:：]\s*(\d+)/) || [])[1] || '';
      }
    }

    if (ctx.loggedIn) {
      if (infoBox && (ctx.sp || ctx.uid)) {
        Store.set('cachedUserProfile', {
          username: ctx.username, avatar: ctx.avatar, uid: ctx.uid,
          hp: ctx.hp, sp: ctx.sp, po: ctx.po, lastLogin: ctx.lastLogin,
          levelText: ctx.levelText, honorText: ctx.honorText
        });
      } else {
        const cached = Store.get('cachedUserProfile');
        if (cached && cached.username === ctx.username) {
          ctx.avatar = ctx.avatar || cached.avatar || '';
          ctx.uid = ctx.uid || cached.uid || '';
          ctx.hp = ctx.hp || cached.hp || '';
          ctx.sp = ctx.sp || cached.sp || '';
          ctx.po = ctx.po || cached.po || '';
          ctx.lastLogin = ctx.lastLogin || cached.lastLogin || '';
          ctx.levelText = ctx.levelText || cached.levelText || '';
          if (!infoBox && cached.honorText) ctx.honorText = cached.honorText;
        }
      }
    }
    return ctx;
  }

  function extractForumTree() {
    const prev = Store.get('cachedForumTree') || [];
    const subsByFid = {};
    prev.forEach((cat) => (cat.boards || []).forEach((b) => {
      if (b.fid && Array.isArray(b.subs) && b.subs.length) subsByFid[b.fid] = b.subs;
    }));

    const categories = [];
    const indexBoxes = qsa('.contentwrap .t[id^="t_"]');
    if (indexBoxes.length) {
      indexBoxes.forEach((box) => {
        const h2a = qs('th.h h2 a', box);
        if (!h2a) return;
        const boards = qsa('tr[id^="fid_"]', box).map((tr) => {
          const fid = tr.id.replace('fid_', '');
          const link = qs(`#fn_${fid}`, tr) || qs('h3 a', tr);
          if (!link) return null;
          const subs = qsa('th > div h3 a', tr).map((sa) => ({
            name: sa.textContent.trim(),
            href: sa.getAttribute('href') || '#',
            fid: parseFidFromHref(sa.getAttribute('href'))
          })).filter((s) => s.name);
          return { fid, name: link.textContent.trim(), href: link.getAttribute('href') || '#', subs };
        }).filter(Boolean);
        categories.push({ title: h2a.textContent.trim(), href: h2a.getAttribute('href') || '#', boards });
      });
    } else if (qs('#menu_cate')) {
      qsa('ul.ul3', qs('#menu_cate')).forEach((ul) => {
        const h2a = qs('h2 a', ul);
        if (!h2a) return;
        const boards = qsa('li a', ul).map((a) => {
          const href = a.getAttribute('href') || '#';
          const fid = parseFidFromHref(href);
          return { fid, name: a.textContent.trim(), href, subs: subsByFid[fid] || SUBFORUM_FALLBACK[fid] || [] };
        }).filter((b) => b.name);
        categories.push({ title: h2a.textContent.trim(), href: h2a.getAttribute('href') || '#', boards });
      });
    }

    if (categories.length) {
      Store.set('cachedForumTree', categories);
      return categories;
    }
    return prev;
  }

  function extractBreadcrumbs() {
    const first = qs('#main #breadcrumbs') || qs('#breadcrumbs');
    const info = { crumbs: [], rssHref: '', shortcutNode: null, modeLink: null };
    if (!first) return info;
    qsa('.crumbs-item', first).forEach((item) => {
      if (qs('#td_cate', item)) return;
      if (item.tagName === 'A') {
        info.crumbs.push({ text: item.textContent.trim(), href: item.getAttribute('href') || '#', isCurrent: item.classList.contains('current') });
      } else {
        const sa = qs('strong a', item) || qs('a', item);
        if (sa) info.crumbs.push({ text: sa.textContent.trim(), href: sa.getAttribute('href') || '#', isCurrent: true });
        else if (item.textContent.trim()) info.crumbs.push({ text: item.textContent.trim(), href: '#', isCurrent: true });
        const rssA = qs('a[href*="rss.php"]', item);
        if (rssA) info.rssHref = rssA.getAttribute('href') || '';
        const sc = qs('#shortcut', item);
        if (sc) info.shortcutNode = sc;
      }
    });
    const modeA = qs('span.fr a', first);
    if (modeA) info.modeLink = { text: modeA.textContent.trim(), href: modeA.getAttribute('href') || '#' };
    return info;
  }

  function extractPagination(root = document) {
    const box = qs('.t3 .pages', root) || qs('.pages', root);
    const ul = box ? qs('ul', box) : null;
    if (!ul) return null;
    const items = [];
    let summary = '';
    let goTemplate = '';
    qsa('li', ul).forEach((li) => {
      if (li.classList.contains('pagesone')) {
        const m = li.textContent.match(/Pages:\s*(\d+\s*\/\s*\d+)/i);
        if (m) summary = m[1].replace(/\s+/g, '');
        const inp = qs('input', li);
        const locM = inp ? (inp.getAttribute('onkeydown') || '').match(/location\s*=\s*'([^']+)'/) : null;
        if (locM) goTemplate = locM[1];
        return;
      }
      const b = qs('b', li);
      if (b) { items.push({ label: b.textContent.trim(), href: '', current: true }); return; }
      const a = qs('a', li);
      if (a) items.push({ label: a.textContent.trim(), href: a.getAttribute('href') || '#', current: false });
    });
    return items.length ? { items, summary, goTemplate } : null;
  }

  function buildPaginationNode(pag) {
    if (!pag) return null;
    const pills = el('div', { className: 'fl2-page-pills' });
    pag.items.forEach((it) => {
      pills.appendChild(it.current
        ? el('span', { className: 'fl2-page-pill is-current', text: it.label })
        : el('a', { className: 'fl2-page-pill', href: it.href, text: it.label }));
    });
    const right = el('div', { className: 'fl2-page-go' });
    if (pag.summary) right.appendChild(el('span', { text: `第 ${pag.summary} 页` }));
    if (pag.goTemplate) {
      const inp = el('input', { type: 'number', min: '1', placeholder: '页码' });
      const go = () => { if (inp.value.trim()) location.href = pag.goTemplate + encodeURIComponent(inp.value.trim()); };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      right.appendChild(inp);
      right.appendChild(el('button', { type: 'button', className: 'fl2-btn fl2-btn-sm', text: '跳转', onClick: go }));
    }
    return el('div', { className: 'fl2-pagination' }, [pills, right]);
  }

  let toastTimer = null;
  function showToast(msg) {
    let t = qs('#fl2-toast');
    if (!t) { t = el('div', { id: 'fl2-toast' }); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-open'), 2500);
  }

  function getVerifyHash() {
    if (typeof pageWin.verifyhash === 'string' && pageWin.verifyhash) return pageWin.verifyhash;
    const v = qs('input[name="verify"]')?.value;
    if (v) return v;
    for (const sc of Array.from(document.scripts || [])) {
      const m = (sc.textContent || '').match(/\bverifyhash\s*=\s*['"]([a-zA-Z0-9]+)['"]/);
      if (m) return m[1];
    }
    return '';
  }

  function parseAjaxText(raw) {
    const text = String(raw || '');
    const cdata = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/i);
    const ajax = !cdata ? text.match(/<ajax[^>]*>([\s\S]*?)<\/ajax>/i) : null;
    const html = (cdata ? cdata[1] : ajax ? ajax[1] : text).trim();
    const doc = document.createElement('div');
    doc.innerHTML = html;
    return { html, plain: doc.textContent.replace(/\s+/g, ' ').trim(), doc };
  }

  async function favorThread(tid, btnEl) {
    if (!tid) return;
    const verify = getVerifyHash();
    const qsP = new URLSearchParams({ action: 'favor', tid: String(tid), nowtime: String(Date.now()) });
    const bodyP = new URLSearchParams({ action: 'favor', tid: String(tid), type: '0' });
    if (verify) { qsP.set('verify', verify); bodyP.set('verify', verify); }
    try {
      const res = await fetch(`pw_ajax.php?${qsP}`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
        body: bodyP.toString()
      });
      let parsed = parseAjaxText(await res.text());
      const formEl = qs('form', parsed.doc);
      if (formEl || (/name=["']type["']|job=add|step=2/i.test(parsed.html) && !/收藏成功|已经收藏|已收藏/i.test(parsed.plain))) {
        const s2 = new URLSearchParams();
        if (formEl) {
          qsa('input, select', formEl).forEach((inp) => {
            const n = inp.getAttribute('name');
            if (!n || ((inp.type === 'checkbox' || inp.type === 'radio') && !inp.checked)) return;
            s2.set(n, inp.value || '');
          });
        }
        if (!s2.has('action')) s2.set('action', 'favor');
        if (!s2.has('tid')) s2.set('tid', String(tid));
        if (!s2.get('type')) s2.set('type', '0');
        if (!s2.has('job')) s2.set('job', 'add');
        if (!s2.has('step')) s2.set('step', '2');
        if (verify && !s2.has('verify')) s2.set('verify', verify);
        const r2 = await fetch(formEl?.getAttribute('action') || `pw_ajax.php?action=favor&tid=${tid}`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
          body: s2.toString()
        });
        parsed = parseAjaxText(await r2.text());
      }
      if (/收藏成功|成功收藏|添加成功|已加入收藏|已经收藏|已收藏/i.test(parsed.plain)) {
        if (btnEl) {
          const sp = qs('span', btnEl);
          if (sp) sp.textContent = '已收藏';
          else btnEl.innerHTML = icon('bookmarkFilled');
        }
        showToast(/已经|已存在/.test(parsed.plain) ? '该主题已在收藏夹中' : '收藏成功');
      } else {
        showToast(parsed.plain.slice(0, 50) || '已发送收藏请求');
      }
    } catch (_) {
      if (typeof pageWin.sendmsg === 'function') {
        try { pageWin.sendmsg(`pw_ajax.php?action=favor&tid=${encodeURIComponent(tid)}`, '', btnEl?.id || ''); return; } catch (__) {}
      }
      showToast('收藏失败，请检查网络');
    }
  }

  async function toggleForumShortcut(fid, origA, btnEl) {
    if (!fid) { if (origA) origA.click(); return; }
    const verify = getVerifyHash();
    const p = new URLSearchParams({ action: 'shortcut', fid: String(fid), nowtime: String(Date.now()) });
    if (verify) p.set('verify', verify);
    try {
      const res = await fetch(`pw_ajax.php?${p}`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
        body: p.toString()
      });
      const parsed = parseAjaxText(await res.text());
      showToast(parsed.plain.slice(0, 48) || '已更新快捷版块');
    } catch (_) {
      if (origA) origA.click();
      else if (btnEl) showToast('已触发版块收藏');
    }
  }

  /* ============================================================================
   * 5. OVERLAYS: LIGHTBOX & SHARED POPOVER
   * ========================================================================== */
  const Lightbox = {
    images: [], index: 0, root: null, imgEl: null, counter: null, origA: null,
    init() {
      if (this.root) return;
      this.imgEl = el('img', { referrerpolicy: 'no-referrer', alt: 'Preview', onClick: () => this.imgEl.classList.toggle('is-zoomed') });
      this.counter = el('span', { style: 'font-size:13px;font-weight:600;' });
      this.origA = el('a', { className: 'fl2-btn-subtle', style: 'color:#fff !important;', target: '_blank', rel: 'noopener noreferrer', html: `${icon('external')}<span>原图</span>` });
      this.root = el('div', { id: 'fl2-lightbox' }, [
        el('div', { className: 'fl2-lb-bar' }, [
          this.counter,
          el('div', { style: 'display:flex;gap:8px;align-items:center;' }, [
            el('button', { type: 'button', className: 'fl2-btn-subtle', style: 'color:#fff !important;', html: `${icon('zoomIn')}<span>缩放</span>`, onClick: () => this.imgEl.classList.toggle('is-zoomed') }),
            this.origA,
            el('button', { type: 'button', className: 'fl2-icon-btn', style: 'color:#fff;', html: icon('dismiss'), onClick: () => this.close() })
          ])
        ]),
        el('div', { className: 'fl2-lb-stage', onClick: (e) => { if (e.target === e.currentTarget) this.close(); } }, [
          el('button', { type: 'button', className: 'fl2-lb-nav', style: 'left:14px;', html: icon('chevronLeft'), onClick: () => this.step(-1) }),
          this.imgEl,
          el('button', { type: 'button', className: 'fl2-lb-nav', style: 'right:14px;', html: icon('chevronRight'), onClick: () => this.step(1) })
        ])
      ]);
      document.body.appendChild(this.root);
    },
    open(imgs, idx = 0) {
      this.init();
      this.images = imgs || [];
      if (!this.images.length) return;
      this.index = Math.max(0, Math.min(idx, this.images.length - 1));
      this.render();
      this.root.classList.add('is-open');
    },
    step(d) {
      if (!this.images.length) return;
      this.index = (this.index + d + this.images.length) % this.images.length;
      this.imgEl.classList.remove('is-zoomed');
      this.render();
    },
    render() {
      const src = this.images[this.index];
      this.imgEl.src = src;
      this.origA.href = src;
      this.counter.textContent = `${this.index + 1} / ${this.images.length}`;
    },
    close() { if (this.root) this.root.classList.remove('is-open'); }
  };

  function closeAllPopovers() {
    qsa('.fl2-popover.is-open').forEach((p) => p.classList.remove('is-open'));
  }
  function openPopoverNear(pop, anchor) {
    const was = pop.classList.contains('is-open');
    closeAllPopovers();
    if (was) return;
    pop.classList.add('is-open');
    const r = anchor.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    let top = r.bottom + 6;
    let left = r.right - pr.width;
    if (top + pr.height > window.innerHeight - 10) top = Math.max(10, r.top - pr.height - 6);
    if (left < 10) left = Math.min(r.left, window.innerWidth - pr.width - 10);
    pop.style.top = `${Math.round(top)}px`;
    pop.style.left = `${Math.round(left)}px`;
  }

  /* ============================================================================
   * 6. VIRTUAL PAGE BUILDERS (100% Semantic Fluent 2 DOM)
   * ========================================================================== */

  function buildIndexPage(mount, userCtx) {
    // 1. Welcome Bar + Quick Commands
    mount.appendChild(el('section', { className: 'fl2-home-hero' }, [
      el('div', {}, [
        el('h1', { style: 'margin:0;font-size:20px;font-weight:600;', text: userCtx.loggedIn ? `欢迎回来，${userCtx.username}` : '南+ South Plus 讨论区' }),
        el('div', { style: 'font-size:12.5px;color:var(--fl2-fg-3);margin-top:2px;', text: 'Microsoft Fluent 2 现代社区工作台' })
      ]),
      el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;' }, [
        el('a', { className: 'fl2-btn-primary fl2-btn-sm', href: 'search2.php?orderway-postdate-asc-desc-newatc-1.html', target: '_blank', html: `${icon('sparkle', 'fl2-ico-sm')}<span>最新帖子</span>` }),
        el('a', { className: 'fl2-btn fl2-btn-sm', href: 'job.php?action-sign.html', html: `${icon('checkmark', 'fl2-ico-sm')}<span>标记已读</span>` }),
        el('a', { className: 'fl2-btn fl2-btn-sm', href: 'plugin.php?H_name-tasks.html', html: `${icon('trophy', 'fl2-ico-sm')}<span>社区任务</span>` })
      ])
    ]));

    // 2. Site KPI Grid (strictly from #infobox td:last-child, with Store/Copilot duotone icon tiles)
    const kpiItems = [
      ['今日发帖', userCtx.statsToday, 'flame', 'azure'],
      ['昨日发帖', userCtx.statsYesterday, 'history', 'teal'],
      ['最高日', userCtx.statsMax, 'trophy', 'amber'],
      ['总主题', userCtx.statsThemes, 'document', 'indigo'],
      ['总帖子', userCtx.statsPosts, 'forum', 'violet'],
      ['注册会员', userCtx.statsMembers, 'people', 'emerald']
    ].filter(([, v]) => Boolean(v));
    if (kpiItems.length) {
      mount.appendChild(el('section', { className: 'fl2-kpi-grid' }, kpiItems.map(([lbl, val, ic, tone], idx) => {
        const valEl = el('div', { className: 'fl2-kpi-val', text: Number(val).toLocaleString() });
        animateKpiValue(valEl, val);
        return el('div', { className: 'fl2-kpi-card fl2-reveal', style: `--fl2-i:${idx};` }, [
          toneTile(ic, tone),
          el('div', { style: 'min-width:0;' }, [
            el('div', { className: 'fl2-kpi-lbl', text: lbl }),
            valEl
          ])
        ]);
      })));
    }

    // 3. Site Announcements MessageBar (extracted cleanly from #notice0)
    const noticeLinks = qsa('#notice0 ul li');
    if (noticeLinks.length) {
      const list = el('div', { style: 'display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center;' });
      noticeLinks.forEach((li) => {
        const a = qs('a', li);
        const date = qs('span.gray', li);
        if (!a) return;
        list.appendChild(el('div', { style: 'display:inline-flex;align-items:center;gap:6px;' }, [
          el('a', { href: a.getAttribute('href') || '#', text: a.textContent.trim(), style: 'font-weight:500;' }),
          date ? el('span', { text: date.textContent.trim(), style: 'font-size:11.5px;color:var(--fl2-fg-3);' }) : null
        ]));
      });
      mount.appendChild(el('div', { className: 'fl2-msgbar' }, [
        el('span', { html: icon('info'), style: 'color:var(--fl2-brand-fg);margin-top:2px;' }),
        el('strong', { text: '站点公告', style: 'white-space:nowrap;' }),
        list
      ]));
    }

    // 4. 4-Column Feeds Card with Fluent Pivot + Eager Prefetch + Skeleton Stability
    const feedTable = qs('#main > .t table');
    if (feedTable && !feedTable.closest('.contentwrap')) {
      const titles = qsa('tr.tr2 td', feedTable).map((td) => td.textContent.trim());
      const cells = qsa('tr.tr3 td', feedTable);
      if (titles.length && cells.length) {
        const FEED_OVERVIEW_COUNT = 5;
        const FEED_SINGLE_COUNT = 16;
        const SKEL_WIDTHS = ['78%', '64%', '88%', '71%', '83%', '60%', '86%', '74%'];
        const pivot = el('div', { className: 'fl2-pivot' });
        const feedGrid = el('div', { className: 'fl2-feeds-grid' });
        const states = [];
        let curTab = 'all';

        const readCache = () => {
          try {
            const p = JSON.parse(sessionStorage.getItem(FEEDS_CACHE_KEY) || '{}');
            return Date.now() - (p.ts || 0) > FEEDS_CACHE_TTL ? {} : (p.data || {});
          } catch (_) { return {}; }
        };
        const writeCache = () => {
          try {
            const data = {};
            states.forEach((st, idx) => { if (st.loaded && st.expanded.length) data[String(idx)] = { title: st.title, items: st.expanded }; });
            sessionStorage.setItem(FEEDS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
          } catch (_) {}
        };
        const parseTid = (href) => ((href || '').match(/tid[-=](\d+)/i) || [])[1] || '';
        const cleanT = (s) => (s || '').replace(/^[\s●•·]+/, '').trim();
        const fallbackBoard = (src, title) => /fidin=221|GALGAME/i.test(src + title) ? 'thread.php?fid-221.html' : /fidin=48|求物/.test(src + title) ? 'thread.php?fid-48.html' : /order=1|最新回复/.test(src + title) ? 'thread.php?fid-9.html' : 'search2.php?orderway-postdate-asc-desc-newatc-1.html';

        const syncOverviewTitles = (merged) => {
          const titleByKey = new Map();
          merged.forEach((it) => {
            const k = parseTid(it.href) || it.href;
            if (it.title && !/\.\.$/.test(it.title)) titleByKey.set(k, it.title);
          });
          states.forEach((s) => {
            s.initial.forEach((it) => {
              const k = parseTid(it.href) || it.href;
              const full = titleByKey.get(k);
              if (full && full.length >= it.title.length) it.title = full;
            });
          });
          if (curTab === 'all') {
            qsa('a.fl2-feed-row', feedGrid).forEach((row) => {
              const href = row.getAttribute('href') || '';
              const k = parseTid(href) || href;
              const full = titleByKey.get(k);
              const tSpan = qs('.fl2-feed-title', row);
              if (full && tSpan && /\.\.$/.test(tSpan.textContent || '') && full.length > tSpan.textContent.length) {
                tSpan.textContent = full;
                row.title = full;
              }
            });
          }
        };

        const renderFeeds = () => {
          const single = curTab !== 'all';
          feedGrid.classList.toggle('is-single', single);
          feedGrid.innerHTML = '';
          states.forEach((st, idx) => {
            if (single && String(idx) !== String(curTab)) return;
            const rows = el('div', { className: 'fl2-feed-list' });
            const showSkeleton = single && (!st.loaded || (st.loading && !st.expanded.length));
            if (showSkeleton) {
              for (let i = 0; i < FEED_SINGLE_COUNT; i++) {
                rows.appendChild(el('div', { className: 'fl2-feed-skel-row' }, [
                  el('span', { className: 'fl2-skel-num' }),
                  el('span', { className: 'fl2-skel-bar', style: `max-width:${SKEL_WIDTHS[i % SKEL_WIDTHS.length]};` })
                ]));
              }
            } else {
              const list = single
                ? (st.expanded.length ? st.expanded : st.initial).slice(0, FEED_SINGLE_COUNT)
                : st.initial.slice(0, FEED_OVERVIEW_COUNT);
              list.forEach((it, i) => {
                rows.appendChild(el('a', {
                  className: 'fl2-feed-row is-enter',
                  href: it.href,
                  target: '_blank',
                  title: it.title,
                  style: `--fl2-i:${Math.min(i, 12)};`
                }, [
                  el('span', { className: 'fl2-feed-num', text: String(i + 1) }),
                  el('span', { className: 'fl2-feed-title', text: it.title }),
                  single && it.meta ? el('span', { className: 'fl2-feed-meta', text: it.meta }) : null
                ]));
              });
            }
            feedGrid.appendChild(el('div', { className: 'fl2-feed-box fl2-reveal' }, [
              el('div', { className: 'fl2-feed-head' }, [
                el('span', { text: st.title }),
                single
                  ? el('div', { style: 'display:flex;gap:6px;' }, [
                      el('button', {
                        type: 'button',
                        className: 'fl2-btn fl2-btn-sm',
                        disabled: st.loading ? 'disabled' : false,
                        html: `${icon('refresh', `fl2-ico-sm${st.loading ? ' fl2-ico-spin' : ''}`)}<span>刷新</span>`,
                        onClick: () => loadMore(st, true)
                      }),
                      el('a', { className: 'fl2-btn-primary fl2-btn-sm', href: st.boardHref, text: '进入版块' })
                    ])
                  : el('button', { type: 'button', className: 'fl2-btn-subtle', style: 'height:24px;padding:0 6px;font-size:12px;', text: '更多', onClick: () => selectTab(idx) })
              ]),
              rows
            ]));
          });
        };

        const loadMore = (st, force = false) => {
          if (!st.scriptSrc) {
            st.expanded = st.initial.slice(0, FEED_SINGLE_COUNT);
            st.loaded = true;
            st.loading = false;
            return Promise.resolve();
          }
          if (st.promise && !force) return st.promise;
          if (st.loaded && !force) return Promise.resolve();

          st.loading = true;
          if (curTab !== 'all' && states[Number(curTab)] === st) renderFeeds();

          const run = (async () => {
            const byKey = new Map();
            const merged = [];
            const upsert = (it) => {
              const k = parseTid(it.href) || it.href;
              if (!it.title) return;
              const ex = byKey.get(k);
              if (!ex) {
                const e = { title: it.title, href: it.href, meta: it.meta || '' };
                byKey.set(k, e);
                merged.push(e);
              } else {
                if (/\.\.$/.test(ex.title) && it.title.length > ex.title.length && !/\.\.$/.test(it.title)) ex.title = it.title;
                if (!ex.meta && it.meta) ex.meta = it.meta;
              }
            };

            const ac = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timer = ac ? setTimeout(() => ac.abort(), 4000) : null;
            try {
              const url = st.scriptSrc.replace(/num=\d+/i, `num=${FEED_SINGLE_COUNT}`).replace(/length=\d+/i, 'length=96');
              const res = await fetch(url, { credentials: 'include', signal: ac ? ac.signal : undefined });
              if (res.ok) {
                const txt = await res.text();
                const tmp = document.createElement('div');
                [...txt.matchAll(/<a\s+[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi)].forEach((m) => {
                  tmp.innerHTML = m[2];
                  const t = cleanT(tmp.textContent);
                  if (t) upsert({ title: t, href: m[1], meta: '' });
                });
              }
            } catch (_) {
            } finally {
              if (timer) clearTimeout(timer);
            }

            if (merged.length < FEED_SINGLE_COUNT) st.initial.forEach(upsert);
            st.expanded = merged.slice(0, FEED_SINGLE_COUNT);
            st.loaded = true;
            st.loading = false;
            st.promise = null;
            writeCache();
            syncOverviewTitles(st.expanded);
            if (curTab !== 'all' && states[Number(curTab)] === st) renderFeeds();
          })();

          st.promise = run;
          return run;
        };

        let syncPivotInk = () => {};
        const selectTab = (tab) => {
          curTab = tab;
          qsa('.fl2-pivot-tab', pivot).forEach((b) => b.classList.toggle('is-active', b.dataset.tab === String(tab)));
          syncPivotInk();
          renderFeeds();
          if (tab !== 'all' && states[Number(tab)] && !states[Number(tab)].loaded) loadMore(states[Number(tab)]);
        };

        const cached = readCache();
        titles.forEach((title, idx) => {
          const cell = cells[idx];
          const sc = cell ? qs('script[src*="new.php"]', cell) : null;
          const scriptSrc = sc ? sc.getAttribute('src') || '' : '';
          const seen = new Set();
          const initial = [];
          qsa('a[href]', cell).forEach((a) => {
            const href = a.getAttribute('href') || '#';
            const t = cleanT(a.getAttribute('title') || a.textContent);
            const k = parseTid(href) || href;
            if (t && !seen.has(k)) { seen.add(k); initial.push({ title: t, href, meta: '' }); }
          });
          const c = cached[String(idx)];
          const hasC = !!(c && c.title === title && Array.isArray(c.items) && c.items.length >= Math.max(FEED_OVERVIEW_COUNT, initial.length));
          states.push({
            title,
            scriptSrc,
            boardHref: fallbackBoard(scriptSrc, title),
            initial,
            expanded: hasC ? c.items.slice(0, FEED_SINGLE_COUNT) : (!scriptSrc ? initial.slice(0, FEED_SINGLE_COUNT) : []),
            loaded: hasC || !scriptSrc,
            loading: false,
            promise: null
          });
        });

        pivot.appendChild(el('button', { type: 'button', className: 'fl2-pivot-tab is-active', dataset: { tab: 'all' }, text: '四栏总览', onClick: () => selectTab('all') }));
        titles.forEach((t, idx) => pivot.appendChild(el('button', { type: 'button', className: 'fl2-pivot-tab', dataset: { tab: String(idx) }, text: t, onClick: () => selectTab(idx) })));
        syncPivotInk = attachPivotInk(pivot);
        renderFeeds();
        mount.appendChild(el('section', { className: 'fl2-card' }, [pivot, feedGrid]));
        requestAnimationFrame(syncPivotInk);
        setTimeout(() => {
          states.forEach((st) => { if (!st.loaded && st.scriptSrc) loadMore(st); });
        }, 80);
      }
    }

    // 5. Forum Category Expanders + Handcrafted 2-Col Board Cards (no legacy table layout!)
    const collapsedMap = Store.get('collapsedCategories') || {};
    const catTones = ['azure', 'teal', 'violet', 'amber', 'indigo', 'emerald'];
    let catIdx = 0;
    qsa('.contentwrap .t[id^="t_"]').forEach((catBox) => {
      const cid = catBox.id.replace('t_', '');
      const h2a = qs('th.h h2 a', catBox);
      if (!h2a) return;
      const catTone = catTones[catIdx++ % catTones.length];

      const grid = el('div', { className: 'fl2-board-grid' });
      qsa('tr[id^="fid_"]', catBox).forEach((tr) => {
        const fid = tr.id.replace('fid_', '');
        const titleA = qs(`#fn_${fid}`, tr) || qs('h3 a', tr);
        if (!titleA) return;
        const iconSrc = qs('td.icon img', tr)?.getAttribute('src') || '';
        const hasNew = /new\.gif/i.test(iconSrc);
        const isLocked = /lock\.gif/i.test(iconSrc);
        const todayCount = (qs('th span.s3', tr)?.textContent || '').replace(/[()]/g, '').trim() || '0';
        const descEl = qs(`#desc_${fid}`, tr);
        const subLinks = qsa('th > div h3 a', tr);
        const statsText = (qs('td.tal.y-style.f10.e', tr)?.textContent || '').replace(/\s+/g, ' ').trim();
        const lastTh = qsa('th', tr)[1];
        const lastA = lastTh ? qs('a.a2', lastTh) : null;
        const lastMeta = lastTh ? qs('span.gray2', lastTh) : null;

        const subWrap = el('div', { className: 'fl2-sub-wrap' });
        subLinks.forEach((sa, idx) => {
          subWrap.appendChild(el('a', {
            className: 'fl2-sub-chip',
            href: sa.getAttribute('href') || '#',
            text: sa.textContent.trim(),
            style: idx >= 6 ? 'display:none;' : ''
          }));
        });
        if (subLinks.length > 6) {
          const moreBtn = el('button', {
            type: 'button', className: 'fl2-sub-chip', text: `+${subLinks.length - 6} 展开`,
            style: 'background:var(--fl2-brand-subtle);color:var(--fl2-brand-fg);font-weight:600;cursor:pointer;',
            onClick: () => { qsa('.fl2-sub-chip', subWrap).forEach((c) => { c.style.display = ''; }); moreBtn.remove(); }
          });
          subWrap.appendChild(moreBtn);
        }

        const descNode = descEl && descEl.textContent.trim() ? el('div', { className: 'fl2-board-desc', text: descEl.textContent.trim() }) : null;

        grid.appendChild(el('article', { className: 'fl2-board-card fl2-reveal' }, [
          el('div', { className: 'fl2-board-top' }, [
            el('div', { style: 'display:flex;align-items:flex-start;gap:12px;min-width:0;' }, [
              el('div', { className: `fl2-board-icon ${hasNew ? 'has-new' : ''}`, html: icon(isLocked ? 'lock' : hasNew ? 'flame' : 'forum') }),
              el('div', { style: 'min-width:0;' }, [
                el('a', { className: 'fl2-board-title', href: titleA.getAttribute('href') || '#', text: titleA.textContent.trim() }),
                descNode
              ])
            ]),
            todayCount !== '0'
              ? el('span', { className: 'fl2-badge fl2-badge-brand', text: `今日 +${todayCount}` })
              : el('span', { className: 'fl2-badge', text: '0' })
          ]),
          subLinks.length ? subWrap : null,
          el('div', { className: 'fl2-board-foot' }, [
            el('span', { text: statsText ? `主题/帖 ${statsText}` : '', style: 'flex-shrink:0;' }),
            lastA ? el('div', { className: 'fl2-board-last', title: lastA.textContent.trim() }, [
              el('a', { href: lastA.getAttribute('href') || '#', text: lastA.textContent.trim() }),
              lastMeta ? el('span', { text: ` · ${lastMeta.textContent.replace(/\s+/g, ' ').trim()}` }) : null
            ]) : null
          ])
        ]));
      });

      const exp = el('section', { className: `fl2-expander ${collapsedMap[cid] ? 'is-collapsed' : ''}` }, [
        el('button', {
          type: 'button', className: 'fl2-expander-head',
          onClick: () => {
            const next = !exp.classList.contains('is-collapsed');
            exp.classList.toggle('is-collapsed', next);
            const map = Object.assign({}, Store.get('collapsedCategories') || {}, { [cid]: next });
            Store.set('collapsedCategories', map);
          }
        }, [
          el('span', { style: 'display:inline-flex;align-items:center;gap:10px;' }, [
            toneTile('grid', catTone),
            el('span', { text: h2a.textContent.trim() })
          ]),
          el('span', { className: 'fl2-expander-chev', html: icon('chevronDown') })
        ]),
        el('div', { className: 'fl2-expander-body' }, [el('div', { className: 'fl2-expander-inner' }, [grid])])
      ]);
      mount.appendChild(exp);
    });

    // 6. Friend Links Expander
    const cateInfo = qs('#cate_info');
    if (cateInfo) {
      const links = qsa('a', cateInfo).filter((a) => !a.getAttribute('name') && a.textContent.trim()).map((a) =>
        el('a', { className: 'fl2-sub-chip', href: a.getAttribute('href') || '#', target: '_blank', rel: 'noopener noreferrer', text: a.textContent.replace(/[\[\]]/g, '').trim() })
      );
      if (links.length) {
        const exp = el('section', { className: 'fl2-expander is-collapsed' }, [
          el('button', { type: 'button', className: 'fl2-expander-head', onClick: () => exp.classList.toggle('is-collapsed') }, [
            el('span', { text: '友情链接与在线统计' }),
            el('span', { className: 'fl2-expander-chev', html: icon('chevronDown') })
          ]),
          el('div', { className: 'fl2-expander-body' }, [el('div', { className: 'fl2-expander-inner' }, [el('div', { className: 'fl2-sub-wrap' }, links)])])
        ]);
        mount.appendChild(exp);
      }
    }
  }

  function buildForumHeader(mount, crumbsInfo, isWall) {
    const crumb = crumbsInfo.crumbs[crumbsInfo.crumbs.length - 1];
    const title = crumb ? crumb.text : document.title.split('-')[0].trim();
    const fid = parseFidFromHref(location.href);
    const postBtnA = qs('#td_post') ? qs('#td_post').closest('a') : qs('a[href^="post.php?fid-"]');

    const actions = el('div', { style: 'display:flex;flex-wrap:wrap;align-items:center;gap:8px;' });
    if (crumbsInfo.modeLink) {
      const listHref = isWall ? crumbsInfo.modeLink.href : location.href;
      const wallHref = isWall ? location.href : crumbsInfo.modeLink.href;
      actions.appendChild(el('div', { className: 'fl2-segmented' }, [
        el('a', { className: `fl2-seg-btn ${!isWall ? 'is-active' : ''}`, href: listHref, html: `${icon('list', 'fl2-ico-sm')}<span>列表</span>` }),
        el('a', { className: `fl2-seg-btn ${isWall ? 'is-active' : ''}`, href: wallHref, html: `${icon('grid', 'fl2-ico-sm')}<span>图墙</span>` })
      ]));
    }
    if (crumbsInfo.shortcutNode) {
      actions.appendChild(el('button', {
        type: 'button', className: 'fl2-btn fl2-btn-sm',
        html: `${icon('star', 'fl2-ico-sm')}<span>收藏版块</span>`,
        onClick: (e) => toggleForumShortcut(fid, qs('a', crumbsInfo.shortcutNode), e.currentTarget)
      }));
    }
    if (crumbsInfo.rssHref) {
      actions.appendChild(el('a', { className: 'fl2-icon-btn', href: crumbsInfo.rssHref, target: '_blank', title: 'RSS', html: icon('rss') }));
    }
    if (postBtnA) {
      actions.appendChild(el('a', { className: 'fl2-btn-primary fl2-btn-sm', href: postBtnA.getAttribute('href') || '#', html: `${icon('add', 'fl2-ico-sm')}<span>发布新帖</span>` }));
    }

    mount.appendChild(el('section', { className: 'fl2-forum-hero' }, [
      el('div', {}, [
        el('h1', { className: 'fl2-forum-title', text: title }),
        el('div', { style: 'font-size:12px;color:var(--fl2-fg-3);margin-top:2px;', text: isWall ? '图墙画廊视图' : '主题列表视图' })
      ]),
      actions
    ]));

    // Announcement Expander (#tab_1)
    const tab1 = qs('#cate_thread #tab_1') || qs('#tab_1');
    if (tab1 && tab1.innerHTML.trim()) {
      const inner = el('div', { className: 'fl2-expander-inner fl2-post-body' });
      inner.appendChild(tab1);
      const body = el('div', { className: 'fl2-expander-body' }, [inner]);
      const exp = el('section', { className: `fl2-expander ${Store.get('collapseNotice') ? 'is-collapsed' : ''}` }, [
        el('button', { type: 'button', className: 'fl2-expander-head', onClick: () => exp.classList.toggle('is-collapsed') }, [
          el('span', { style: 'display:inline-flex;align-items:center;gap:8px;', html: `${icon('info')}<span>版块公告与发帖规范</span>` }),
          el('span', { className: 'fl2-expander-chev', html: icon('chevronDown') })
        ]),
        body
      ]);
      mount.appendChild(exp);
    }

    // Subforums
    const childTbody = qs('#cate_children');
    if (childTbody) {
      const row = el('div', { className: 'fl2-card', style: 'padding:10px 14px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;' }, [
        el('span', { text: '子版块:', style: 'font-size:12.5px;font-weight:600;color:var(--fl2-fg-3);' })
      ]);
      qsa('tr.tr3', childTbody).forEach((tr) => {
        const a = qs('h2 a', tr);
        if (a) row.appendChild(el('a', { className: 'fl2-sub-chip', href: a.getAttribute('href') || '#', text: a.textContent.trim() }));
      });
      mount.appendChild(row);
    }

    // Filter Pivot + Sort Controls
    const toolbar = el('div', { className: 'fl2-toolbar' });
    const pivot = el('div', { className: 'fl2-pivot', style: 'border-bottom:none;' });
    qsa('.threadlist li').forEach((li) => {
      const a = qs('a', li);
      if (a) {
        pivot.appendChild(el('a', {
          className: `fl2-pivot-tab ${li.classList.contains('current') ? 'is-active' : ''}`,
          href: a.getAttribute('href') || '#',
          text: a.textContent.trim()
        }));
      }
    });
    toolbar.appendChild(pivot);

    const rightTools = el('div', { style: 'display:flex;flex-wrap:wrap;align-items:center;gap:8px;' });
    const filterInp = el('input', { type: 'search', placeholder: '筛选本页标题/作者…', style: 'width:170px;height:28px;' });
    filterInp.addEventListener('input', () => {
      const q = filterInp.value.trim().toLowerCase();
      qsa('[data-filter-text]', mount).forEach((node) => {
        node.style.display = (!q || (node.dataset.filterText || '').includes(q)) ? '' : 'none';
      });
    });
    rightTools.appendChild(filterInp);

    const sortForm = qs('form[action*="thread.php"]');
    if (sortForm) {
      qsa('select', sortForm).forEach((orig) => {
        const sel = el('select', { style: 'height:28px;font-size:12.5px;' });
        qsa('option', orig).forEach((o) => {
          const opt = el('option', { value: o.value, text: o.textContent });
          if (o.selected) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener('change', () => { orig.value = sel.value; sortForm.submit(); });
        rightTools.appendChild(sel);
      });
    }
    const readlogBtn = qs('#readlog');
    if (readlogBtn) {
      rightTools.appendChild(el('button', { type: 'button', className: 'fl2-btn fl2-btn-sm', html: `${icon('history', 'fl2-ico-sm')}<span>记录</span>`, onClick: () => readlogBtn.click() }));
    }
    toolbar.appendChild(rightTools);
    mount.appendChild(toolbar);
  }

  function buildThreadRow(tr) {
    const cells = qsa(':scope > td, :scope > th', tr);
    if (cells.length < 5) return null;
    if (Store.get('hideAds') && isAdElement(tr)) return null;

    const statusSrc = qs('img', cells[0])?.getAttribute('src') || '';
    const isAnc = /anc\.gif/i.test(statusSrc);
    const isPinned = !!qs('img[src*="headtopic_"]', cells[1]);
    const isDigest = !!qs('img[src*="digest_"]', cells[1]);
    const hasImg = !!qs('img[src*="file/img.gif"]', cells[1]);
    const hasZip = !!qs('img[src*="file/zip.gif"]', cells[1]);
    const isNew = /topicnew\.gif/i.test(statusSrc) || !!qs('img[src*="file/new.gif"]', cells[1]);
    const isHot = /topichot\.gif/i.test(statusSrc);
    const isLock = /topiclock|topicclose/i.test(statusSrc);

    const titleA = qs('h3 a', cells[1]) || qs('a', cells[1]);
    if (!titleA) return null;

    const typeA = qs('a.s8', cells[1]);
    const authorA = qs('a', cells[2]);
    const postDate = qs('.f10', cells[2])?.textContent.trim() || '';
    const statText = cells[3].textContent.replace(/\s+/g, ' ').trim();
    const lastA = qs('a', cells[4]);
    const lastBy = qs('.gray2', cells[4])?.textContent.replace(/^by:\s*/i, '').trim() || '';
    const pageLinks = qsa('.tpage a', cells[1]);

    const titleLine = el('div', { className: 'fl2-thread-title-line' });
    if (isPinned) titleLine.appendChild(el('span', { className: 'fl2-badge fl2-badge-brand', text: '置顶' }));
    if (isDigest) titleLine.appendChild(el('span', { className: 'fl2-badge fl2-badge-warn', text: '精华' }));
    if (typeA) titleLine.appendChild(el('a', { className: 'fl2-badge', href: typeA.getAttribute('href') || '#', text: typeA.textContent.replace(/[\[\]]/g, '').trim() }));
    titleLine.appendChild(el('a', { className: 'fl2-thread-link', href: titleA.getAttribute('href') || '#', text: titleA.textContent.trim() }));
    if (hasImg) titleLine.appendChild(el('span', { className: 'fl2-badge', text: '图' }));
    if (hasZip) titleLine.appendChild(el('span', { className: 'fl2-badge', text: '附件' }));
    if (isNew) titleLine.appendChild(el('span', { className: 'fl2-badge fl2-badge-success', text: '新' }));
    if (pageLinks.length) {
      const pWrap = el('span', { className: 'fl2-thread-pages' });
      pageLinks.forEach((pa) => pWrap.appendChild(el('a', { href: pa.getAttribute('href') || '#', text: pa.textContent.trim() })));
      titleLine.appendChild(pWrap);
    }

    const icoName = isAnc ? 'info' : isPinned ? 'pin' : isLock ? 'lock' : isHot ? 'flame' : 'forum';
    const icoCls = isNew ? 'is-new' : (isHot || isPinned) ? 'is-hot' : '';

    return {
      isPinnedOrAnc: isAnc || isPinned,
      node: el('article', {
        className: 'fl2-thread-row',
        dataset: { filterText: `${titleA.textContent} ${authorA ? authorA.textContent : ''}`.toLowerCase() }
      }, [
        el('div', { className: `fl2-thread-ico ${icoCls}`, html: icon(icoName, 'fl2-ico-sm') }),
        el('div', { className: 'fl2-thread-main' }, [titleLine]),
        el('div', { className: 'fl2-thread-col fl2-thread-col-author' }, [
          authorA ? el('a', { href: authorA.getAttribute('href') || '#', text: authorA.textContent.trim(), style: 'color:var(--fl2-fg-1);' }) : null,
          postDate ? el('div', { className: 'fl2-thread-sub', text: postDate }) : null
        ]),
        el('div', { className: 'fl2-thread-col fl2-thread-col-stats' }, [
          el('span', { className: 'fl2-badge', text: statText })
        ]),
        el('div', { className: 'fl2-thread-col fl2-thread-col-last' }, [
          lastA ? el('a', { href: lastA.getAttribute('href') || '#', text: lastA.textContent.trim(), style: 'color:var(--fl2-fg-2);' }) : null,
          lastBy ? el('div', { className: 'fl2-thread-sub', text: lastBy }) : null
        ])
      ])
    };
  }

  function buildThreadListPage(mount, crumbsInfo) {
    buildForumHeader(mount, crumbsInfo, false);
    const topPag = buildPaginationNode(extractPagination());
    if (topPag) mount.appendChild(topPag);

    const pinned = [];
    const normal = [];
    let passedSplit = false;
    qsa('#ajaxtable tr').forEach((tr) => {
      if (tr.classList.contains('tr2')) { if (/普通主题/.test(tr.textContent)) passedSplit = true; return; }
      if (!tr.classList.contains('tr3')) return;
      const built = buildThreadRow(tr);
      if (!built) return;
      if (!passedSplit && built.isPinnedOrAnc) pinned.push(built.node);
      else normal.push(built.node);
    });

    if (pinned.length) {
      const exp = el('section', { className: `fl2-expander ${Store.get('collapsePinned') ? 'is-collapsed' : ''}` }, [
        el('button', { type: 'button', className: 'fl2-expander-head', onClick: () => exp.classList.toggle('is-collapsed') }, [
          el('span', { style: 'display:inline-flex;align-items:center;gap:8px;', html: `${icon('pin')}<span>置顶与版块公告 (${pinned.length})</span>` }),
          el('span', { className: 'fl2-expander-chev', html: icon('chevronDown') })
        ]),
        el('div', { className: 'fl2-expander-body fl2-pad-0' }, [el('div', { className: 'fl2-expander-inner' }, pinned)])
      ]);
      mount.appendChild(exp);
    }

    if (normal.length) {
      mount.appendChild(el('section', { className: 'fl2-details-list' }, [
        el('div', { className: 'fl2-details-hdr' }, [
          el('span', { text: '' }),
          el('span', { text: '主题' }),
          el('span', { text: '作者' }),
          el('span', { text: '回复 / 人气' }),
          el('span', { text: '最后发表' })
        ]),
        ...normal
      ]));
    } else {
      mount.appendChild(el('div', { className: 'fl2-card', text: '当前筛选下暂无主题帖。' }));
    }

    const botPag = buildPaginationNode(extractPagination());
    if (botPag) mount.appendChild(botPag);
  }

  function buildThreadWallPage(mount, crumbsInfo) {
    buildForumHeader(mount, crumbsInfo, true);

    const pinned = [];
    qsa('#ajaxtable tr.tr3').forEach((tr) => {
      const b = buildThreadRow(tr);
      if (b) pinned.push(b.node);
    });
    if (pinned.length) {
      const exp = el('section', { className: `fl2-expander ${Store.get('collapsePinned') ? 'is-collapsed' : ''}` }, [
        el('button', { type: 'button', className: 'fl2-expander-head', onClick: () => exp.classList.toggle('is-collapsed') }, [
          el('span', { style: 'display:inline-flex;align-items:center;gap:8px;', html: `${icon('pin')}<span>置顶与公告 (${pinned.length})</span>` }),
          el('span', { className: 'fl2-expander-chev', html: icon('chevronDown') })
        ]),
        el('div', { className: 'fl2-expander-body fl2-pad-0' }, [el('div', { className: 'fl2-expander-inner' }, pinned)])
      ]);
      mount.appendChild(exp);
    }

    const grid = el('section', { className: `fl2-wall-grid ${Store.get('wallAspect') === 'contain' ? 'is-contain' : ''}` });
    mount.appendChild(el('div', { className: 'fl2-toolbar' }, [
      el('span', { style: 'font-size:13px;font-weight:600;', text: '图墙画廊' }),
      el('div', { className: 'fl2-segmented' }, [
        el('button', {
          type: 'button', className: `fl2-seg-btn ${Store.get('wallAspect') === 'cover' ? 'is-active' : ''}`, text: '裁剪填充',
          onClick: (e) => { Store.set('wallAspect', 'cover'); grid.classList.remove('is-contain'); qsa('.fl2-seg-btn', e.currentTarget.parentElement).forEach((b, i) => b.classList.toggle('is-active', i === 0)); }
        }),
        el('button', {
          type: 'button', className: `fl2-seg-btn ${Store.get('wallAspect') === 'contain' ? 'is-active' : ''}`, text: '完整比例',
          onClick: (e) => { Store.set('wallAspect', 'contain'); grid.classList.add('is-contain'); qsa('.fl2-seg-btn', e.currentTarget.parentElement).forEach((b, i) => b.classList.toggle('is-active', i === 1)); }
        })
      ])
    ]));

    const topPag = buildPaginationNode(extractPagination());
    if (topPag) mount.appendChild(topPag);

    const wallImages = [];
    qsa('#wall .stream li.dcsns-li').forEach((li) => {
      const titleA = qs('.section-title a', li);
      if (!titleA) return;
      const href = titleA.getAttribute('href') || '#';
      const tid = (href.match(/tid[-=](\d+)/i) || [])[1] || '';
      const imgSrc = qs('.section-text img', li)?.getAttribute('src') || '';
      const noImg = !imgSrc || /noimageavailble/i.test(imgSrc);
      if (!noImg) wallImages.push(imgSrc);
      const imgIdx = wallImages.length - 1;
      const parsed = parseSmartTitle(titleA.textContent);
      const statsM = (qs('.section-text', li)?.textContent || '').match(/回复\/人气：\s*([\d]+\s*\/\s*[\d]+)/);
      const authorA = qs('.section-intro a', li);
      const dateTd = qsa('.section-intro td', li)[1];

      const media = el('div', { className: 'fl2-wall-media' }, [
        noImg
          ? el('div', { style: 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--fl2-fg-3);', html: `${icon('image', 'fl2-ico-lg')}<span style="font-size:12px;">暂无封面图</span>` })
          : el('a', { href, target: '_blank' }, [el('img', { src: imgSrc, loading: 'lazy', referrerpolicy: 'no-referrer', alt: parsed.clean })]),
        el('div', { className: 'fl2-wall-overlay' }, [
          !noImg ? el('button', { type: 'button', className: 'fl2-wall-float', title: '放大预览', html: icon('zoomIn', 'fl2-ico-sm'), onClick: (e) => { e.preventDefault(); e.stopPropagation(); Lightbox.open(wallImages, imgIdx); } }) : null,
          tid ? el('button', { type: 'button', className: 'fl2-wall-float', title: '收藏', html: icon('bookmark', 'fl2-ico-sm'), onClick: (e) => { e.preventDefault(); e.stopPropagation(); favorThread(tid, e.currentTarget); } }) : null
        ])
      ]);

      grid.appendChild(el('article', {
        className: 'fl2-wall-card fl2-reveal',
        dataset: { filterText: `${parsed.raw} ${authorA ? authorA.textContent : ''}`.toLowerCase() }
      }, [
        media,
        el('div', { className: 'fl2-wall-body' }, [
          parsed.tags.length ? el('div', { style: 'display:flex;flex-wrap:wrap;gap:4px;' }, parsed.tags.slice(0, 3).map((t) => el('span', { className: `fl2-badge fl2-badge-${t.tone}`, text: t.label }))) : null,
          el('a', { className: 'fl2-wall-title', href, target: '_blank', title: parsed.raw, text: parsed.clean }),
          el('div', { className: 'fl2-wall-foot' }, [
            authorA ? el('a', { href: authorA.getAttribute('href') || '#', target: '_blank', text: authorA.textContent.trim(), style: 'color:var(--fl2-fg-2);font-weight:500;' }) : el('span', { text: '' }),
            el('span', { text: `${statsM ? statsM[1].replace(/\s+/g, '') + ' · ' : ''}${dateTd ? dateTd.textContent.trim() : ''}` })
          ])
        ])
      ]));
    });

    mount.appendChild(grid);
    const botPag = buildPaginationNode(extractPagination());
    if (botPag) mount.appendChild(botPag);
  }

  function buildReadPage(mount) {
    const rawTitle = qs('#subject_tpc')?.textContent.trim() || document.title.split('|')[0].trim();
    const parsedTitle = parseSmartTitle(rawTitle);
    const tid = (location.href.match(/tid[-=](\d+)/i) || [])[1] || qs('input[name="tid"]')?.value || '';

    const prevA = qs('a[href*="goto-previous"]');
    const nextA = qs('a[href*="goto-next"]');
    const opOnlyA = qs('.tiptop a[href*="read.php?tid-"][href*="-uid-"]');
    const replyPageA = qs('a[href*="post.php?action-reply"]');
    const newPostA = qs('#td_post') ? qs('#td_post').closest('a') : qs('a[href^="post.php?fid-"]');

    // Contextual Sticky CommandBar + Floor Jump ComboBox
    const floorSelect = el('select', { style: 'height:28px;font-size:12.5px;max-width:170px;' }, [
      el('option', { value: '', text: '楼层跳转…' })
    ]);
    floorSelect.addEventListener('change', () => {
      if (floorSelect.value) {
        qs(`#${floorSelect.value}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        floorSelect.value = '';
      }
    });

    const fontSeg = el('div', { className: 'fl2-segmented' });
    [['small', '小'], ['medium', '中'], ['large', '大']].forEach(([k, lbl]) => {
      fontSeg.appendChild(el('button', {
        type: 'button', className: `fl2-seg-btn ${Store.get('fontSize') === k ? 'is-active' : ''}`, text: lbl,
        onClick: (e) => {
          Store.set('fontSize', k);
          applyThemeTokens();
          qsa('.fl2-seg-btn', fontSeg).forEach((b) => b.classList.toggle('is-active', b === e.currentTarget));
        }
      }));
    });

    const cmdBar = el('div', { className: 'fl2-cmdbar' }, [
      el('div', { style: 'display:flex;flex-wrap:wrap;align-items:center;gap:6px;' }, [
        floorSelect,
        prevA ? el('a', { className: 'fl2-btn fl2-btn-sm', href: prevA.getAttribute('href'), html: `${icon('chevronLeft', 'fl2-ico-sm')}<span>上一帖</span>` }) : null,
        nextA ? el('a', { className: 'fl2-btn fl2-btn-sm', href: nextA.getAttribute('href'), html: `<span>下一帖</span>${icon('chevronRight', 'fl2-ico-sm')}` }) : null,
        opOnlyA ? el('a', { className: 'fl2-btn fl2-btn-sm', href: opOnlyA.getAttribute('href'), html: `${icon('eye', 'fl2-ico-sm')}<span>只看楼主</span>` }) : null,
        tid ? el('button', { type: 'button', className: 'fl2-btn fl2-btn-sm', html: `${icon('bookmark', 'fl2-ico-sm')}<span>收藏</span>`, onClick: (e) => favorThread(tid, e.currentTarget) }) : null,
        el('button', { type: 'button', className: 'fl2-btn-subtle', html: `${icon('copy', 'fl2-ico-sm')}<span>复制链接</span>`, onClick: () => { navigator.clipboard?.writeText(location.href).catch(() => {}); showToast('已复制本帖链接'); } })
      ]),
      el('div', { style: 'display:flex;align-items:center;gap:6px;' }, [
        fontSeg,
        qs('form[name="FORM"]') ? el('button', {
          type: 'button', className: 'fl2-btn-primary fl2-btn-sm', html: `${icon('reply', 'fl2-ico-sm')}<span>快速回复</span>`,
          onClick: () => { const rc = qs('#fl2-reply-card'); if (rc) { rc.scrollIntoView({ behavior: 'smooth', block: 'center' }); qs('textarea[name="atc_content"]', rc)?.focus(); } }
        }) : null,
        replyPageA ? el('a', { className: 'fl2-btn fl2-btn-sm', href: replyPageA.getAttribute('href'), text: '高级回复' }) : null,
        newPostA ? el('a', { className: 'fl2-btn fl2-btn-sm', href: newPostA.getAttribute('href'), text: '发新帖' }) : null,
        el('button', { type: 'button', className: 'fl2-icon-btn', title: '回到顶部', html: icon('arrowUp'), onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) })
      ])
    ]);
    mount.appendChild(cmdBar);

    mount.appendChild(el('section', { className: 'fl2-thread-hero' }, [
      parsedTitle.tags.length ? el('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;' }, parsedTitle.tags.map((t) => el('span', { className: `fl2-badge fl2-badge-${t.tone}`, text: t.label }))) : null,
      el('h1', { className: 'fl2-thread-h1', text: rawTitle })
    ]));

    const topPag = buildPaginationNode(extractPagination());
    if (topPag) mount.appendChild(topPag);

    // Popovers for Author Persona & Overflow Menu
    const authorPop = el('div', { className: 'fl2-popover', id: 'fl2-author-pop' });
    const morePop = el('div', { className: 'fl2-popover', id: 'fl2-post-more-pop' });
    document.body.appendChild(authorPop);
    document.body.appendChild(morePop);

    const allImgs = [];
    const postList = el('div', { className: 'fl2-post-list' });
    let opName = '';

    qsa('table.js-post').forEach((tbl, idx) => {
      const tpcContent = qs('.tpc_content [id^="read_"]', tbl);
      if (!tpcContent) return;
      const pid = tpcContent.id.replace('read_', '');
      const isOP = pid === 'tpc' || idx === 0;
      const prevA = tbl.parentElement?.previousElementSibling;
      const anchor = (prevA && prevA.tagName === 'A' && prevA.getAttribute('name')) || pid;

      const authorLink = qs('th.r_two div[align="center"] a', tbl);
      const authorName = authorLink ? authorLink.textContent.trim() : '匿名用户';
      if (isOP) opName = authorName;
      const avatarSrc = qs('.user-pic img', tbl)?.getAttribute('src') || 'images/face/none.gif';
      const showFace = qs('[id^="showface_"]', tbl);

      const floorText = qs('.tiptop a.s3', tbl)?.textContent.trim() || (isOP ? 'GF' : `${idx}F`);
      const timeText = qs('.tiptop span.fl.gray', tbl)?.textContent.trim() || '';
      const bianjiText = qs('.tiptop .bianji', tbl)?.textContent.trim() || '';
      const onlyA = qs('.tiptop .fr a[href*="-uid-"]', tbl);
      const peacemakers = qsa('.apeacemaker', tbl);

      const contentBox = qs(`#td_${pid} .tpc_content`, tbl) || tpcContent.parentElement;
      const bodyWrap = el('div', { className: 'fl2-post-body' });
      if (contentBox) {
        qsa('img', contentBox).forEach((img) => {
          const src = img.getAttribute('data-original-src') || img.getAttribute('src') || '';
          if (!src || /images\/post\/smile|images\/colorImagination|images\/down\.gif/i.test(src)) return;
          img.removeAttribute('width'); img.removeAttribute('height'); img.removeAttribute('onload'); img.removeAttribute('onclick');
          const iIdx = allImgs.length;
          allImgs.push(src);
          img.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); Lightbox.open(allImgs, iIdx); });
        });

        // Upgrade Paid Thread Callout (购买贴.html)
        qsa('h6.quote.jumbotron', contentBox).forEach((hq) => {
          const infoTxt = qs('span', hq)?.textContent.trim() || hq.textContent.trim();
          const origBtn = qs('input[type="button"], button', hq);
          const onclickCode = origBtn?.getAttribute('onclick') || '';
          const hasBuy = Boolean(origBtn || /location\.href\s*=/.test(hq.innerHTML));
          if (!hasBuy) {
            hq.replaceWith(el('div', { className: 'fl2-buy-card is-unlocked' }, [
              el('div', { style: 'display:flex;align-items:center;gap:12px;' }, [
                el('span', { html: icon('checkCircle', 'fl2-ico-lg'), style: 'color:var(--fl2-success-fg);' }),
                el('div', {}, [
                  el('div', { text: '资源已解锁 · 已购买', style: 'font-weight:600;' }),
                  el('div', { text: infoTxt, style: 'font-size:12.5px;color:var(--fl2-fg-2);' })
                ])
              ]),
              el('span', { className: 'fl2-badge fl2-badge-success', text: '已购买' })
            ]));
            return;
          }
          hq.replaceWith(el('div', { className: 'fl2-buy-card' }, [
            el('div', { style: 'display:flex;align-items:center;gap:12px;' }, [
              el('span', { html: icon('lock', 'fl2-ico-lg'), style: 'color:var(--fl2-brand-fg);' }),
              el('div', {}, [
                el('div', { text: '付费资源内容', style: 'font-weight:600;' }),
                el('div', { text: infoTxt, style: 'font-size:12.5px;color:var(--fl2-fg-2);' })
              ])
            ]),
            el('button', {
              type: 'button', className: 'fl2-btn-primary',
              html: `${icon('coin', 'fl2-ico-sm')}<span>${escapeHtml(origBtn?.value || '购买本帖')}</span>`,
              onClick: () => {
                if (origBtn && typeof origBtn.onclick === 'function') origBtn.onclick();
                else {
                  const m = onclickCode.match(/location\.href\s*=\s*'([^']+)'/);
                  if (m) location.href = m[1];
                }
              }
            })
          ]));
        });

        bodyWrap.appendChild(contentBox);
      }

      const markEl = qs(`#mark_${pid}`, tbl);
      let markWrap = null;
      if (markEl && markEl.textContent.trim()) {
        markWrap = el('div', { className: 'fl2-marks' });
        markWrap.appendChild(markEl);
      }

      const avatarBtn = el('button', {
        type: 'button', className: 'fl2-avatar-btn', title: '查看作者信息',
        onClick: (e) => {
          e.stopPropagation();
          authorPop.innerHTML = '';
          authorPop.appendChild(el('div', { style: 'font-weight:600;font-size:15px;margin-bottom:8px;', text: authorName }));
          if (showFace) {
            const tags = htmlToLines(showFace).filter((l) => /^(UID|发帖|SP币|HP|注册时间):/i.test(l));
            authorPop.appendChild(el('div', { style: 'display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;' }, tags.map((t) => el('span', { className: 'fl2-badge', text: t }))));
            qsa('.listread li a', showFace).forEach((act) => {
              authorPop.appendChild(el('button', {
                type: 'button', className: 'fl2-nav-item', style: 'height:30px;',
                text: act.parentElement?.getAttribute('title') || act.textContent.trim() || '操作',
                onClick: () => {
                  closeAllPopovers();
                  const h = act.getAttribute('href');
                  if (h && !h.startsWith('javascript:')) window.open(h, '_blank');
                  else act.click();
                }
              }));
            });
          } else if (authorLink) {
            authorPop.appendChild(el('a', { className: 'fl2-nav-item', href: authorLink.getAttribute('href'), target: '_blank', text: '查看个人主页' }));
          }
          openPopoverNear(authorPop, avatarBtn);
        }
      }, [el('img', { src: avatarSrc, referrerpolicy: 'no-referrer', alt: authorName })]);

      const moreBtn = el('button', {
        type: 'button', className: 'fl2-icon-btn', title: '更多', html: icon('more'),
        onClick: (e) => {
          e.stopPropagation();
          morePop.innerHTML = '';
          if (onlyA) morePop.appendChild(el('a', { className: 'fl2-nav-item', href: onlyA.getAttribute('href'), text: onlyA.textContent.trim() }));
          peacemakers.forEach((pm) => { pm.classList.add('fl2-nav-item'); pm.style.display = 'flex'; morePop.appendChild(pm); });
          openPopoverNear(morePop, moreBtn);
        }
      });

      const cardId = `fl2-post-${anchor}`;
      floorSelect.appendChild(el('option', { value: cardId, text: `${floorText} · ${authorName}` }));

      const replyA = qs('.readbot .huifu a', tbl);
      const quoteA = qs('.readbot .yinyong a', tbl);
      const favorA = qs('.readbot .shou a', tbl);

      postList.appendChild(el('article', { id: cardId, className: `fl2-post-card ${isOP ? 'is-op' : ''}` }, [
        el('a', { name: anchor, id: `anchor_${anchor}` }),
        el('header', { className: 'fl2-post-head' }, [
          el('div', { className: 'fl2-post-author' }, [
            avatarBtn,
            el('div', { style: 'min-width:0;' }, [
              el('div', { style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;' }, [
                el('a', { href: authorLink ? authorLink.getAttribute('href') : '#', target: '_blank', text: authorName, style: 'font-weight:600;color:var(--fl2-fg-1);' }),
                (isOP || authorName === opName) ? el('span', { className: 'fl2-badge fl2-badge-brand', text: '楼主' }) : null
              ]),
              el('div', { style: 'font-size:12px;color:var(--fl2-fg-3);', text: [timeText, bianjiText].filter(Boolean).join(' · ') })
            ])
          ]),
          el('div', { style: 'display:flex;align-items:center;gap:4px;' }, [
            el('button', {
              type: 'button', className: 'fl2-badge fl2-badge-brand', style: 'border:none;cursor:pointer;', text: floorText,
              onClick: () => {
                if (typeof pageWin.copyUrl === 'function') { try { pageWin.copyUrl(pid); } catch (_) {} }
                else navigator.clipboard?.writeText(`${location.href.split('#')[0]}#${anchor}`).catch(() => {});
                showToast(`已复制 ${floorText} 链接`);
              }
            }),
            moreBtn
          ])
        ]),
        bodyWrap,
        markWrap,
        el('footer', { className: 'fl2-post-foot' }, [
          el('div', { style: 'display:flex;gap:6px;' }, [
            replyA ? el('button', { type: 'button', className: 'fl2-btn fl2-btn-sm', html: `${icon('reply', 'fl2-ico-sm')}<span>回复</span>`, onClick: () => { replyA.click(); qs('#fl2-reply-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }) : null,
            quoteA ? el('button', { type: 'button', className: 'fl2-btn fl2-btn-sm', html: `${icon('quote', 'fl2-ico-sm')}<span>引用</span>`, onClick: () => quoteA.click() }) : null,
            favorA ? el('button', { type: 'button', className: 'fl2-btn-subtle', html: `${icon('bookmark', 'fl2-ico-sm')}<span>收藏</span>`, onClick: () => { favorA.click(); showToast('已发送收藏请求'); } }) : null
          ]),
          el('button', { type: 'button', className: 'fl2-btn-subtle', html: `${icon('arrowUp', 'fl2-ico-sm')}<span>顶部</span>`, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) })
        ])
      ]));
    });

    mount.appendChild(postList);
    const botPag = buildPaginationNode(extractPagination());
    if (botPag) mount.appendChild(botPag);

    // Quick Reply Form
    const replyForm = qs('form[name="FORM"]');
    if (replyForm) {
      const card = el('section', { id: 'fl2-reply-card', className: 'fl2-card fl2-reply-card' }, [
        el('div', { style: 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;' }, [
          el('strong', { text: '快速回复', style: 'font-size:15px;' }),
          el('span', { text: 'Ctrl + Enter 提交', style: 'font-size:12px;color:var(--fl2-fg-3);' })
        ])
      ]);
      const headTr = qs('tr:first-child', replyForm);
      if (headTr && /快速发帖/.test(headTr.textContent)) headTr.style.display = 'none';
      const attMode = qs('tbody#att_mode')?.closest('table');
      if (attMode) { attMode.style.display = 'none'; card.appendChild(attMode); }
      card.appendChild(replyForm);
      mount.appendChild(card);
    }
  }

  function buildUserPage(mount, userCtx) {
    const profileName = (qs('#u-top h1.u-h1')?.textContent || '').trim() || userCtx.username;
    const avatarSrc = qs('#u-portrait img.pic')?.getAttribute('src') || qs('#u-portrait img')?.getAttribute('src') || userCtx.avatar || 'images/face/none.gif';
    const honorEl = qs('#honor');
    const setHonorEl = qs('#sethonor');
    const honorRow = el('div', { style: 'display:flex;align-items:center;gap:8px;margin-top:4px;font-size:13px;color:var(--fl2-fg-2);' });
    if (honorEl) honorRow.appendChild(honorEl);
    if (setHonorEl) { setHonorEl.className = 'fl2-badge fl2-badge-brand'; honorRow.appendChild(setHonorEl); }

    const actions = el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;' });
    const seen = new Set();
    qsa('#u-sidebar a[href], #u-sidebar a[onclick]').forEach((a) => {
      const txt = a.textContent.replace(/\s+/g, ' ').trim();
      const key = a.getAttribute('href') || a.getAttribute('onclick') || txt;
      if (!txt || seen.has(key)) return;
      seen.add(key);
      const clone = a.cloneNode(true);
      clone.className = 'fl2-btn fl2-btn-sm';
      actions.appendChild(clone);
    });

    const stats = htmlToLines(qs('#u-sidebar')).filter((l) => /^(等级|级别|UID|发帖|SP币|HP)/.test(l)).slice(0, 5);
    mount.appendChild(el('section', { className: 'fl2-u-hero' }, [
      el('div', { style: 'display:flex;align-items:center;gap:14px;min-width:0;' }, [
        el('img', { className: 'fl2-u-avatar', src: avatarSrc, alt: profileName, referrerpolicy: 'no-referrer' }),
        el('div', { style: 'min-width:0;' }, [
          el('h1', { style: 'margin:0;font-size:20px;font-weight:600;', text: profileName }),
          honorRow,
          stats.length ? el('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;' }, stats.map((s) => el('span', { className: 'fl2-badge', text: s }))) : null
        ])
      ]),
      actions
    ]));

    // Fluent Pivot Navigation
    const tabs = qsa('#u-top-nav ul li a');
    if (tabs.length) {
      const bar = el('nav', { className: 'fl2-card fl2-pivot', style: 'padding:4px 12px 0;' });
      tabs.forEach((a) => {
        const li = a.closest('li');
        bar.appendChild(el('a', {
          className: `fl2-pivot-tab ${li && li.classList.contains('current') ? 'is-active' : ''}`,
          href: a.getAttribute('href') || '#',
          text: a.textContent.trim()
        }));
      });
      mount.appendChild(bar);
    }

    const uMain = qs('#u-contentmain');
    const uSide = qs('#u-contentside');
    const p66 = qs('.u-content-66');
    const p33 = qs('.u-content-33');
    const cleanEmptyHint = (node) => {
      qsa('table.u-table', node).forEach((tbl) => {
        if (qsa('tr', tbl).length <= 1 && tbl.parentNode && !qs('.fl2-empty', tbl.parentNode)) {
          tbl.parentNode.appendChild(el('div', { className: 'fl2-empty', style: 'padding:22px;text-align:center;color:var(--fl2-fg-3);font-size:13px;', text: '暂无记录' }));
        }
      });
    };

    if (uMain && uSide) {
      const mH = el('div', { className: 'fl2-card fl2-generic-host' }); mH.appendChild(uMain);
      const sH = el('div', { className: 'fl2-card fl2-generic-host' }); sH.appendChild(uSide);
      cleanEmptyHint(mH);
      mount.appendChild(el('div', { className: 'fl2-u-grid' }, [mH, sH]));
    } else if (p66 && p33) {
      const mH = el('div', { className: 'fl2-card fl2-generic-host' }); mH.appendChild(p66);
      const sH = el('div', { className: 'fl2-card fl2-generic-host' }); sH.appendChild(p33);
      mount.appendChild(el('div', { className: 'fl2-u-grid' }, [mH, sH]));
    } else if (uMain || qs('#u-content')) {
      const h = el('div', { className: 'fl2-card fl2-generic-host' });
      h.appendChild(uMain || qs('#u-content'));
      cleanEmptyHint(h);
      mount.appendChild(h);
    } else {
      buildGenericPage(mount);
    }
  }

  function buildSettingsLayout(mount, { title, desc, iconName, actionBtn = null }) {
    mount.appendChild(el('section', { className: 'fl2-forum-hero' }, [
      el('div', {}, [
        el('div', { style: 'display:flex;align-items:center;gap:8px;' }, [
          el('span', { html: icon(iconName), style: 'color:var(--fl2-brand-fg);' }),
          el('h1', { className: 'fl2-forum-title', text: title })
        ]),
        desc ? el('div', { style: 'font-size:12.5px;color:var(--fl2-fg-3);margin-top:2px;', text: desc }) : null
      ]),
      actionBtn
    ]));

    const side = el('aside', { className: 'fl2-set-nav' });
    qsa('#set-menu li').forEach((li) => {
      const a = qs('a', li);
      if (!a) return;
      const clone = a.cloneNode(true);
      clone.className = `fl2-nav-item ${li.classList.contains('current') ? 'is-active' : ''}`;
      side.appendChild(clone);
    });

    const host = el('section', { className: 'fl2-card fl2-generic-host fl2-set-host' });
    const wrap = qs('#set-content-wrap') || qs('#set-content');
    if (wrap) host.appendChild(wrap);
    else buildGenericPage(host);

    if (qs('#set-menu')) mount.appendChild(el('div', { className: 'fl2-set-grid' }, [side, host]));
    else mount.appendChild(host);
    return host;
  }

  function buildProfilePage(mount) {
    const title = qs('#set-menu li.current a')?.textContent.trim() || '账号与设置中心';
    const host = buildSettingsLayout(mount, {
      title, desc: '管理个人资料、签名头像、论坛偏好、用户权限与积分转换', iconName: 'settings',
      actionBtn: el('a', { className: 'fl2-btn fl2-btn-sm', href: 'u.php', html: `${icon('person', 'fl2-ico-sm')}<span>个人空间</span>` })
    });
    const wrap = qs('#set-content-wrap', host);
    if (wrap && qs('.set-content-left', wrap) && qs('.set-content-right', wrap)) wrap.classList.add('fl2-has-split');
  }

  function buildMessagePage(mount) {
    const writeHref = qs('#set-menu a[href*="write"]')?.getAttribute('href') || 'message.php?action-write.html';
    buildSettingsLayout(mount, {
      title: '短消息中心', desc: '收发站内私信、系统群发与消息黑名单管理', iconName: 'mail',
      actionBtn: el('a', { className: 'fl2-btn-primary fl2-btn-sm', href: writeHref, html: `${icon('edit', 'fl2-ico-sm')}<span>写新消息</span>` })
    });
  }

  function buildUserPayPage(mount) {
    const host = buildSettingsLayout(mount, {
      title: '积分与钱包管理', desc: '查看 SP币 / HP / 魄 / LP 余额、充值转账与订单记录', iconName: 'wallet',
      actionBtn: el('a', { className: 'fl2-btn fl2-btn-sm', href: 'profile.php', html: `${icon('settings', 'fl2-ico-sm')}<span>设置中心</span>` })
    });
    const overview = qs('.set-tab-box > div', host);
    if (overview && qs('div[style*="float:right"]', overview)) overview.classList.add('fl2-pay-grid');
  }

  function buildLoginPage(mount) {
    const form = qs('form[name="login"]') || qs('form[name="register"]');
    const isReg = form?.getAttribute('name') === 'register';
    const card = el('section', { className: 'fl2-auth-card' }, [
      el('div', { style: 'text-align:center;margin-bottom:18px;' }, [
        el('div', { className: 'fl2-brand-mark', style: 'width:38px;height:38px;font-size:15px;margin:0 auto 10px;', text: 'S+' }),
        el('h1', { style: 'margin:0;font-size:20px;font-weight:600;', text: isReg ? '注册 南+ South Plus' : '登录 南+ South Plus' }),
        el('div', { style: 'font-size:12.5px;color:var(--fl2-fg-3);margin-top:4px;', text: 'Microsoft Fluent 2 账号通行证' })
      ])
    ]);
    if (form) {
      const hdr = qs('tr:first-child', form);
      if (hdr && qs('th.h', hdr)) hdr.style.display = 'none';
      const gd = qs('input[name="gdcode"]', form);
      const gdMenu = qs('#menu_gd', form);
      if (gd && gdMenu) {
        const show = () => { gdMenu.style.visibility = 'visible'; gdMenu.style.display = 'inline-block'; };
        gd.addEventListener('focus', show);
        if (gd.nextElementSibling) gd.nextElementSibling.addEventListener('click', show);
      }
      card.appendChild(form);
    } else {
      buildGenericPage(card);
    }
    mount.appendChild(card);
  }

  function buildRedirectPage() {
    if (qs('#fl2-redirect-root')) return;
    const refresh = qs('meta[http-equiv="refresh"]')?.getAttribute('content') || '';
    const mUrl = (refresh.match(/url\s*=\s*([^;\s]+)/i) || [])[1];
    const targetA = qsa('a[href]').find((a) => !/^index\.php$/i.test(a.getAttribute('href') || '') && !/^javascript:/i.test(a.getAttribute('href') || ''));
    const targetHref = mUrl || targetA?.getAttribute('href') || 'index.php';
    const lines = htmlToLines(qs('center div') || qs('center')).filter((l) => l && !/提示信息|如果您的浏览器/.test(l));

    Array.from(document.body.children).forEach((c) => { if (c.tagName !== 'SCRIPT') c.style.display = 'none'; });
    document.body.appendChild(el('main', { id: 'fl2-redirect-root', className: 'fl2-status-screen' }, [
      el('div', { className: 'fl2-status-card' }, [
        el('div', { style: 'width:46px;height:46px;border-radius:50%;background:var(--fl2-brand-subtle);color:var(--fl2-brand-fg);display:flex;align-items:center;justify-content:center;', html: icon('checkCircle', 'fl2-ico-lg') }),
        el('h1', { style: 'margin:0;font-size:20px;font-weight:600;', text: lines[0] || '操作已完成' }),
        el('p', { style: 'margin:0;font-size:13px;color:var(--fl2-fg-3);', text: lines.slice(1).join(' · ') || '正在自动跳转到目标页面…' }),
        el('div', { className: 'fl2-status-progress' }, [el('div', { className: 'fl2-status-bar' })]),
        el('div', { style: 'display:flex;gap:8px;' }, [
          el('a', { className: 'fl2-btn-primary', href: targetHref, text: '立即前往' }),
          el('a', { className: 'fl2-btn', href: 'index.php', text: '返回首页' })
        ])
      ])
    ]));
    document.documentElement.classList.remove('fl2-loading');
    document.documentElement.classList.add('fl2-ready');
  }

  function buildGenericPage(mount) {
    const mainEl = qs('#main');
    if (!mainEl) return;
    const card = el('section', { className: 'fl2-card fl2-generic-host' });
    Array.from(mainEl.children).forEach((child) => {
      if (child.id === 'breadcrumbs' || child.classList.contains('bdbA') || child.tagName === 'SCRIPT' || child.tagName === 'STYLE') return;
      if (Store.get('hideAds') && isAdElement(child)) return;
      card.appendChild(child);
    });
    mount.appendChild(card);
  }

  /* ============================================================================
   * 7. SHELL MOUNT (TitleBar + AutoSuggestBox + NavigationView TreeView + Win11 Settings)
   * ========================================================================== */
  function mountShell() {
    if (qs('#fl2-shell')) return;
    const pageType = detectPageType();
    if (pageType === 'redirect') { buildRedirectPage(); return; }

    const userCtx = extractUserContext();
    const forumTree = extractForumTree();
    const crumbsInfo = extractBreadcrumbs();
    const curFid = parseFidFromHref(location.href);
    const curHref = location.pathname + location.search;

    const shell = el('div', { id: 'fl2-shell' });
    const mainMount = el('main', { id: 'fl2-main' });

    // --- 1. Win11 Settings Drawer ---
    const settingsDrawer = el('aside', { id: 'fl2-settings-drawer', 'aria-label': 'Fluent 2 外观设置' });
    const renderSettingsDrawer = () => {
      settingsDrawer.innerHTML = '';
      settingsDrawer.appendChild(el('div', { style: 'display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;' }, [
        el('strong', { text: 'Fluent 2 外观与偏好', style: 'font-size:16px;' }),
        el('button', { type: 'button', className: 'fl2-icon-btn', html: icon('dismiss'), onClick: () => settingsDrawer.classList.remove('is-open') })
      ]));

      // Theme Mode
      const themeSeg = el('div', { className: 'fl2-segmented', style: 'margin-top:8px;width:100%;' });
      [['system', '跟随系统'], ['light', '浅色'], ['dark', '深色']].forEach(([k, lbl]) => {
        themeSeg.appendChild(el('button', {
          type: 'button', className: `fl2-seg-btn ${Store.get('theme') === k ? 'is-active' : ''}`, style: 'flex:1;justify-content:center;', text: lbl,
          onClick: () => { Store.set('theme', k); applyThemeTokens(); renderSettingsDrawer(); }
        }));
      });
      settingsDrawer.appendChild(el('div', { className: 'fl2-set-card' }, [el('div', { text: '主题模式', style: 'font-size:13px;font-weight:600;' }), themeSeg]));

      // Accents
      const swRow = el('div', { className: 'fl2-swatch-row' });
      Object.entries(ACCENTS).forEach(([k, a]) => {
        swRow.appendChild(el('button', {
          type: 'button', className: `fl2-swatch ${Store.get('accent') === k ? 'is-active' : ''}`,
          style: `background:${a.light};`, title: a.name, html: icon('checkmark'),
          onClick: () => { Store.set('accent', k); applyThemeTokens(); renderSettingsDrawer(); }
        }));
      });
      settingsDrawer.appendChild(el('div', { className: 'fl2-set-card' }, [el('div', { text: '强调色', style: 'font-size:13px;font-weight:600;' }), swRow]));

      // Density & Width
      const densSeg = el('div', { className: 'fl2-segmented' });
      [['comfortable', '舒适'], ['compact', '紧凑']].forEach(([k, lbl]) => {
        densSeg.appendChild(el('button', {
          type: 'button', className: `fl2-seg-btn ${Store.get('density') === k ? 'is-active' : ''}`, text: lbl,
          onClick: () => { Store.set('density', k); applyThemeTokens(); renderSettingsDrawer(); }
        }));
      });
      const widthSeg = el('div', { className: 'fl2-segmented' });
      [['standard', '标准'], ['wide', '宽屏']].forEach(([k, lbl]) => {
        widthSeg.appendChild(el('button', {
          type: 'button', className: `fl2-seg-btn ${Store.get('readingWidth') === k ? 'is-active' : ''}`, text: lbl,
          onClick: () => { Store.set('readingWidth', k); applyThemeTokens(); renderSettingsDrawer(); }
        }));
      });
      settingsDrawer.appendChild(el('div', { className: 'fl2-set-card' }, [
        el('div', { className: 'fl2-set-row', style: 'margin-bottom:8px;' }, [el('span', { text: '信息密度', style: 'font-size:13px;' }), densSeg]),
        el('div', { className: 'fl2-set-row' }, [el('span', { text: '画布宽度', style: 'font-size:13px;' }), widthSeg])
      ]));

      // Switches
      const swCard = el('div', { className: 'fl2-set-card' });
      [
        ['hideAds', '隐藏站内推广横幅'],
        ['collapseNotice', '默认折叠版块公告'],
        ['collapsePinned', '默认折叠置顶主题']
      ].forEach(([k, lbl], idx) => {
        const sw = el('button', {
          type: 'button', className: 'fl2-switch', role: 'switch', 'aria-checked': String(Boolean(Store.get(k))),
          onClick: () => { Store.set(k, !Store.get(k)); sw.setAttribute('aria-checked', String(Boolean(Store.get(k)))); showToast('设置已保存，刷新后完全生效'); }
        });
        swCard.appendChild(el('div', { className: 'fl2-set-row', style: idx ? 'margin-top:10px;' : '' }, [el('span', { text: lbl, style: 'font-size:13px;' }), sw]));
      });
      settingsDrawer.appendChild(swCard);
    };
    renderSettingsDrawer();

    // --- 2. Live Persona Popover ---
    const personaPop = el('div', { className: 'fl2-popover', id: 'fl2-persona-pop', style: 'width:300px;' });
    if (userCtx.loggedIn) {
      personaPop.appendChild(el('div', { style: 'display:flex;align-items:center;gap:12px;padding-bottom:10px;border-bottom:1px solid var(--fl2-stroke-2);' }, [
        userCtx.avatar ? el('img', { className: 'fl2-avatar fl2-avatar-lg', src: userCtx.avatar, alt: '' }) : el('span', { className: 'fl2-avatar fl2-avatar-lg', text: userCtx.username.slice(0, 1).toUpperCase() }),
        el('div', { style: 'min-width:0;flex:1;' }, [
          el('div', { text: userCtx.username, style: 'font-weight:600;font-size:15px;' }),
          el('div', { text: `${userCtx.levelText || 'Lv.1'}${userCtx.uid ? ` · UID ${userCtx.uid}` : ''}`, style: 'font-size:12px;color:var(--fl2-fg-3);' })
        ])
      ]));
      personaPop.appendChild(el('div', { style: 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0;' }, [
        ['SP币', userCtx.sp || '-'], ['HP', userCtx.hp || '-'], ['魄', userCtx.po || '-']
      ].map(([l, v]) => el('div', { style: 'background:var(--fl2-surface-2);border:1px solid var(--fl2-stroke-2);border-radius:6px;padding:6px;text-align:center;' }, [
        el('div', { text: v, style: 'font-size:13px;font-weight:600;' }),
        el('div', { text: l, style: 'font-size:11px;color:var(--fl2-fg-3);' })
      ]))));
      personaPop.appendChild(el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:6px;background:var(--fl2-surface-2);font-size:12px;margin-bottom:8px;' }, [
        el('span', { text: userCtx.honorText, style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' }),
        el('button', {
          type: 'button', className: 'fl2-btn-subtle', style: 'height:24px;padding:0 6px;', html: `${icon('edit', 'fl2-ico-sm')}<span>编辑</span>`,
          onClick: () => { closeAllPopovers(); const sh = qs('#sethonor'); if (sh) sh.click(); else location.href = 'profile.php?action-modify.html'; }
        })
      ]));
      [
        ['个人首页', 'u.php', 'person'],
        ['我的收藏', 'u.php?action-favor.html', 'bookmark'],
        ['积分管理', 'userpay.php', 'wallet'],
        ['账号设置', 'profile.php', 'settings'],
        ['退出登录', userCtx.quitHref || 'login.php', 'signOut']
      ].forEach(([lbl, href, ic]) => {
        personaPop.appendChild(el('a', { className: 'fl2-nav-item', style: 'height:32px;', href, html: `${icon(ic)}<span class="fl2-nav-label">${lbl}</span>` }));
      });
    }

    // --- 3. Mica TitleBar + AutoSuggestBox ---
    const crumbNav = el('nav', { className: 'fl2-crumbs', 'aria-label': '面包屑' });
    if (pageType === 'index') {
      crumbNav.appendChild(el('span', { className: 'fl2-crumb is-current', text: '讨论区首页' }));
    } else {
      crumbsInfo.crumbs.forEach((c, i) => {
        if (i > 0) crumbNav.appendChild(el('span', { className: 'fl2-crumb-sep', html: icon('chevronRight', 'fl2-ico-sm') }));
        crumbNav.appendChild(c.isCurrent
          ? el('span', { className: 'fl2-crumb is-current', text: c.text, title: c.text })
          : el('a', { className: 'fl2-crumb', href: c.href, text: c.text, title: c.text }));
      });
    }

    const suggestInput = el('input', { type: 'search', placeholder: '搜索帖子或直达版块…', autocomplete: 'off' });
    const suggestPop = el('div', { className: 'fl2-suggest-pop' });
    let sugItems = [];
    let sugIdx = 0;

    const allBoardsFlat = [];
    forumTree.forEach((cat) => (cat.boards || []).forEach((b) => {
      allBoardsFlat.push({ label: b.name, sub: cat.title, href: b.href });
      (b.subs || []).forEach((s) => allBoardsFlat.push({ label: `${b.name} / ${s.name}`, sub: cat.title, href: s.href }));
    }));
    const boardCandidates = allBoardsFlat.length ? allBoardsFlat : CORE_BOARDS.map((b) => ({ label: b.name, sub: '快捷版块', href: b.href }));

    const renderSuggestions = () => {
      const q = suggestInput.value.trim().toLowerCase();
      sugItems = q
        ? boardCandidates.filter((b) => b.label.toLowerCase().includes(q) || b.sub.toLowerCase().includes(q)).slice(0, 8)
        : boardCandidates.slice(0, 8);
      if (q) sugItems.push({ label: `全站搜索「${suggestInput.value.trim()}」`, sub: 'search.php', href: `search.php?keyword=${encodeURIComponent(suggestInput.value.trim())}` });
      if (sugIdx >= sugItems.length) sugIdx = 0;
      suggestPop.innerHTML = '';
      sugItems.forEach((it, idx) => {
        suggestPop.appendChild(el('a', {
          className: `fl2-suggest-item ${idx === sugIdx ? 'is-selected' : ''}`, href: it.href,
          html: `${icon('compass', 'fl2-ico-sm')}<span>${escapeHtml(it.label)}</span><span class="fl2-suggest-sub">${escapeHtml(it.sub)}</span>`
        }));
      });
    };

    suggestInput.addEventListener('focus', () => { renderSuggestions(); suggestPop.classList.add('is-open'); });
    suggestInput.addEventListener('input', () => { sugIdx = 0; renderSuggestions(); suggestPop.classList.add('is-open'); });
    suggestInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && sugItems.length) { e.preventDefault(); sugIdx = (sugIdx + 1) % sugItems.length; renderSuggestions(); }
      else if (e.key === 'ArrowUp' && sugItems.length) { e.preventDefault(); sugIdx = (sugIdx - 1 + sugItems.length) % sugItems.length; renderSuggestions(); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (sugItems[sugIdx]) location.href = sugItems[sugIdx].href;
        else if (suggestInput.value.trim()) location.href = `search.php?keyword=${encodeURIComponent(suggestInput.value.trim())}`;
      } else if (e.key === 'Escape') {
        suggestPop.classList.remove('is-open');
        suggestInput.blur();
      }
    });

    const toggleNav = () => {
      if (window.innerWidth <= 1024) {
        const isOpen = document.documentElement.getAttribute('data-fl2-mobile-nav') === 'open';
        document.documentElement.setAttribute('data-fl2-mobile-nav', isOpen ? 'closed' : 'open');
      } else {
        Store.set('navCollapsed', !Store.get('navCollapsed'));
        applyThemeTokens();
      }
    };

    const themeBtn = el('button', {
      type: 'button', className: 'fl2-icon-btn', title: '切换浅色/深色',
      html: icon(resolveEffectiveTheme() === 'dark' ? 'sun' : 'moon'),
      onClick: () => {
        const next = resolveEffectiveTheme() === 'dark' ? 'light' : 'dark';
        Store.set('theme', next);
        applyThemeTokens();
        renderSettingsDrawer();
        themeBtn.innerHTML = icon(next === 'dark' ? 'sun' : 'moon');
        themeBtn.classList.remove('is-morphing');
        void themeBtn.offsetWidth;
        themeBtn.classList.add('is-morphing');
      }
    });

    const peaceEl = qs('#peacemakerconfig');
    const titlebar = el('header', { id: 'fl2-titlebar' }, [
      el('div', { className: 'fl2-tb-left' }, [
        el('button', { type: 'button', className: 'fl2-icon-btn', title: '导航栏 ([)', html: icon('nav'), onClick: toggleNav }),
        el('a', {
          className: 'fl2-brand',
          href: 'index.php',
          html: `<span class="fl2-brand-mark">${brandLogoSvg()}</span><span class="fl2-brand-wordmark"><span class="fl2-brand-zh">南<span class="fl2-brand-plus-txt">+</span></span><span class="fl2-brand-en">South Plus</span></span>`
        }),
        crumbNav
      ]),
      el('div', { className: 'fl2-tb-center' }, [
        el('div', { className: 'fl2-autosuggest' }, [
          el('span', { className: 'fl2-autosuggest-ico', html: icon('search', 'fl2-ico-sm') }),
          suggestInput,
          el('kbd', { className: 'fl2-kbd', text: 'Ctrl K' })
        ]),
        suggestPop
      ]),
      el('div', { className: 'fl2-tb-right' }, [
        themeBtn,
        userCtx.loggedIn ? el('a', { className: 'fl2-icon-btn', href: 'message.php', title: userCtx.hasUnreadMsg ? '有新短消息' : '短消息', html: `${icon('mail')}${userCtx.hasUnreadMsg ? '<span class="fl2-dot-badge"></span>' : ''}` }) : null,
        peaceEl ? el('button', { type: 'button', className: 'fl2-icon-btn', title: '屏蔽配置', html: icon('shield'), onClick: () => peaceEl.click() }) : null,
        el('button', { type: 'button', className: 'fl2-icon-btn', title: 'Fluent 2 外观设置', html: icon('settings'), onClick: () => settingsDrawer.classList.toggle('is-open') }),
        userCtx.loggedIn
          ? el('button', {
              type: 'button', className: 'fl2-persona-trigger',
              onClick: (e) => { e.stopPropagation(); openPopoverNear(personaPop, e.currentTarget); }
            }, [
              userCtx.avatar ? el('img', { className: 'fl2-avatar', src: userCtx.avatar, alt: '' }) : el('span', { className: 'fl2-avatar', text: userCtx.username.slice(0, 1).toUpperCase() }),
              el('span', { className: 'fl2-persona-name', text: userCtx.username }),
              userCtx.sp ? el('span', { className: 'fl2-sp-pill', text: userCtx.sp }) : null
            ])
          : el('div', { style: 'display:flex;gap:6px;' }, [
              el('a', { className: 'fl2-btn-primary fl2-btn-sm', href: 'login.php', text: '登录' }),
              el('a', { className: 'fl2-btn fl2-btn-sm', href: 'register.php', text: '注册' })
            ])
      ])
    ]);

    // --- 4. Left NavigationView + Inline TreeView ---
    const sidenav = el('aside', { id: 'fl2-nav', 'aria-label': 'NavigationView' });
    const addNavGroup = (title, items) => {
      const sec = el('div', { className: 'fl2-nav-sec' }, [el('div', { className: 'fl2-nav-hdr', text: title })]);
      items.forEach((it) => {
        sec.appendChild(el('a', {
          className: `fl2-nav-item ${it.active ? 'is-active' : ''}`, href: it.href, title: it.label,
          html: `${icon(it.icon)}<span class="fl2-nav-label">${escapeHtml(it.label)}</span>${it.badge ? `<span class="fl2-nav-badge">${escapeHtml(it.badge)}</span>` : ''}`
        }));
      });
      sidenav.appendChild(sec);
    };

    addNavGroup('浏览', [
      { label: '讨论区首页', href: 'index.php', icon: 'home', active: pageType === 'index' },
      { label: '最新帖子', href: 'search2.php?orderway-postdate-asc-desc-newatc-1.html', icon: 'sparkle', active: pageType === 'search_results' },
      { label: '全站搜索', href: 'search.php', icon: 'search', active: pageType === 'search' },
      { label: '社区任务', href: 'plugin.php?H_name-tasks.html', icon: 'trophy', active: pageType === 'tasks' },
      { label: '排行统计', href: 'sort.php', icon: 'compass', active: /sort\.php/.test(curHref) }
    ]);

    const quickBoards = userCtx.shortcuts.length ? userCtx.shortcuts : CORE_BOARDS;
    addNavGroup(userCtx.shortcuts.length ? '我的快捷版块' : '常用版块', quickBoards.map((b) => ({
      label: b.name, href: b.href, icon: b.icon || 'forum', active: Boolean(curFid && b.fid === curFid)
    })));

    if (forumTree.length) {
      const treeSec = el('div', { className: 'fl2-nav-sec fl2-tree-group' }, [el('div', { className: 'fl2-nav-hdr', text: '版块目录 (TreeView)' })]);
      const expCats = Store.get('expandedNavCats') || {};
      forumTree.forEach((cat) => {
        const hasCurrent = (cat.boards || []).some((b) => curFid && (b.fid === curFid || (b.subs || []).some((s) => s.fid === curFid)));
        const catEl = el('div', { className: `fl2-tree-cat ${(expCats[cat.title] || hasCurrent) ? 'is-open' : ''}` }, [
          el('button', {
            type: 'button', className: 'fl2-tree-cat-btn',
            html: `${icon('chevronRight', 'fl2-ico-sm fl2-tree-chev')}<span>${escapeHtml(cat.title)}</span>`,
            onClick: () => {
              const open = catEl.classList.toggle('is-open');
              Store.set('expandedNavCats', Object.assign({}, Store.get('expandedNavCats') || {}, { [cat.title]: open }));
            }
          }),
          el('div', { className: 'fl2-tree-children' }, [
            el('div', { className: 'fl2-tree-children-inner' }, (cat.boards || []).map((b) =>
              el('a', { className: `fl2-tree-leaf ${curFid === b.fid ? 'is-active' : ''}`, href: b.href, text: b.name, title: b.name })
            ))
          ])
        ]);
        treeSec.appendChild(catEl);
      });
      sidenav.appendChild(treeSec);
    }

    if (userCtx.loggedIn) {
      addNavGroup('个人中心', [
        { label: '个人首页', href: 'u.php', icon: 'person', active: pageType === 'user' && !/action-/.test(curHref) },
        { label: '我的主题', href: 'u.php?action-topic.html', icon: 'document', active: /action-topic/.test(curHref) },
        { label: '我的回复', href: 'u.php?action-post.html', icon: 'forum', active: /action-post/.test(curHref) },
        { label: '我的收藏', href: 'u.php?action-favor.html', icon: 'bookmark', active: /action-favor/.test(curHref) },
        { label: '我的好友', href: 'u.php?action-friend.html', icon: 'people', active: /action-friend/.test(curHref) },
        { label: '短消息', href: 'message.php', icon: 'mail', badge: userCtx.hasUnreadMsg ? '新' : '', active: pageType === 'message' },
        { label: '积分管理', href: 'userpay.php', icon: 'wallet', active: pageType === 'userpay' },
        { label: '账号设置', href: 'profile.php', icon: 'settings', active: pageType === 'profile' }
      ]);
    }

    // --- 5. Route to Virtual Builder ---
    if (pageType === 'index') buildIndexPage(mainMount, userCtx);
    else if (pageType === 'thread_list') buildThreadListPage(mainMount, crumbsInfo);
    else if (pageType === 'thread_wall') buildThreadWallPage(mainMount, crumbsInfo);
    else if (pageType === 'read') buildReadPage(mainMount);
    else if (pageType === 'user') buildUserPage(mainMount, userCtx);
    else if (pageType === 'profile') buildProfilePage(mainMount);
    else if (pageType === 'message') buildMessagePage(mainMount);
    else if (pageType === 'userpay') buildUserPayPage(mainMount);
    else if (pageType === 'login') buildLoginPage(mainMount);
    else buildGenericPage(mainMount);

    const footer = el('footer', { id: 'fl2-footer' }, [
      el('span', { text: 'South Plus · Microsoft Fluent 2 Design System 重构界面 (保留原生脚本与请求交互)' }),
      el('div', { style: 'display:flex;gap:14px;' }, [
        el('a', { href: 'simple/', target: '_blank', text: '无图移动版' }),
        el('a', { href: 'faq.php', text: '帮助' }),
        el('a', { href: 'job.php?action-erasecookie-verify-95940903.html', text: '清除 Cookies' })
      ])
    ]);

    const workspace = el('div', { id: 'fl2-workspace' }, [mainMount, footer]);
    const scrim = el('div', { id: 'fl2-scrim', onClick: () => document.documentElement.setAttribute('data-fl2-mobile-nav', 'closed') });

    shell.appendChild(el('div', { id: 'fl2-bloom-bg', 'aria-hidden': 'true' }));
    shell.appendChild(titlebar);
    shell.appendChild(el('div', { id: 'fl2-body' }, [sidenav, workspace]));
    shell.appendChild(scrim);
    shell.appendChild(settingsDrawer);
    if (userCtx.loggedIn) document.body.appendChild(personaPop);
    document.body.appendChild(shell);

    document.documentElement.classList.remove('fl2-loading');
    document.documentElement.classList.add('fl2-ready');

    const syncScrollElevation = () => {
      document.documentElement.classList.toggle('fl2-scrolled', window.scrollY > 8);
    };
    syncScrollElevation();
    window.addEventListener('scroll', syncScrollElevation, { passive: true });

    // Global events & Fluent Reveal pointer lighting
    let revealTarget = null;
    shell.addEventListener('pointermove', (e) => {
      const target = e.target.closest('.fl2-reveal');
      if (!target) { revealTarget = null; return; }
      revealTarget = target;
      const r = target.getBoundingClientRect();
      target.style.setProperty('--fl2-rx', `${Math.round(e.clientX - r.left)}px`);
      target.style.setProperty('--fl2-ry', `${Math.round(e.clientY - r.top)}px`);
    }, { passive: true });
    shell.addEventListener('pointerleave', () => {
      if (revealTarget) {
        revealTarget.style.removeProperty('--fl2-rx');
        revealTarget.style.removeProperty('--fl2-ry');
        revealTarget = null;
      }
    }, { passive: true });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.fl2-popover') && !e.target.closest('.fl2-persona-trigger') && !e.target.closest('.fl2-avatar-btn') && !e.target.closest('.fl2-icon-btn')) closeAllPopovers();
      if (!e.target.closest('.fl2-tb-center')) suggestPop.classList.remove('is-open');
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); suggestInput.focus(); suggestInput.select(); return; }
      if (e.key === 'Escape') {
        closeAllPopovers();
        suggestPop.classList.remove('is-open');
        settingsDrawer.classList.remove('is-open');
        Lightbox.close();
        document.documentElement.setAttribute('data-fl2-mobile-nav', 'closed');
        return;
      }
      const tag = document.activeElement?.tagName || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
      if (e.key === '/') { e.preventDefault(); suggestInput.focus(); }
      else if (e.key === '[') toggleNav();
    });

    if (typeof GM_registerMenuCommand === 'function') {
      try {
        GM_registerMenuCommand('打开 Fluent 2 外观设置', () => settingsDrawer.classList.toggle('is-open'));
        GM_registerMenuCommand('聚焦顶部搜索 / 版块直达 (Ctrl+K)', () => suggestInput.focus());
      } catch (_) {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountShell, { once: true });
  else mountShell();
})();
