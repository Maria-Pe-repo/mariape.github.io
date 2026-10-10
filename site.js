(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrim = document.querySelector('.scrim');

  /* ---- mega menus ---- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-mega]'));
  var closeTimer = null;
  function panelFor(btn){ return document.getElementById(btn.getAttribute('aria-controls')); }
  function closeAll(except){
    triggers.forEach(function(b){
      if (b === except) return;
      b.setAttribute('aria-expanded','false');
      var p = panelFor(b); if (p) p.classList.remove('open');
    });
    if (!except && scrim) scrim.classList.remove('on');
  }
  function open(btn){
    clearTimeout(closeTimer);
    closeAll(btn);
    if (btn.getAttribute('aria-expanded') !== 'true') btn._openedAt = Date.now();
    btn.setAttribute('aria-expanded','true');
    var p = panelFor(btn); if (p) p.classList.add('open');
    if (scrim) scrim.classList.add('on');
  }
  triggers.forEach(function(btn){
    var p = panelFor(btn);
    btn.addEventListener('click', function(){
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen && Date.now() - (btn._openedAt || 0) > 450) closeAll(); else open(btn);
    });
    var hoverable = window.matchMedia('(hover: hover)').matches;
    if (hoverable){
      btn.addEventListener('mouseenter', function(){ open(btn); });
      [btn, p].forEach(function(el){
        if (!el) return;
        el.addEventListener('mouseleave', function(){ closeTimer = setTimeout(function(){ closeAll(); }, 180); });
        el.addEventListener('mouseenter', function(){ clearTimeout(closeTimer); });
      });
    }
    btn.addEventListener('keydown', function(e){
      if (e.key === 'ArrowDown'){ e.preventDefault(); open(btn); var f = p && p.querySelector('a'); if (f) f.focus(); }
    });
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){
      var openBtn = triggers.filter(function(b){ return b.getAttribute('aria-expanded') === 'true'; })[0];
      closeAll(); if (openBtn) openBtn.focus();
      closeDrawer();
    }
  });
  document.addEventListener('click', function(e){
    if (!e.target.closest('.mega') && !e.target.closest('[data-mega]')) closeAll();
  });
  if (scrim) scrim.addEventListener('click', function(){ closeAll(); });

  /* ---- header hides when scrolling down, comes back when scrolling up ---- */
  (function(){
    var root = document.documentElement, lastY = window.scrollY, ticking = false;
    var update = function(){
      ticking = false;
      var y = window.scrollY, d = y - lastY;
      var drawerOpen = document.querySelector('.drawer.open');
      var megaOpen = document.querySelector('.mega.open');
      if (y < 120 || drawerOpen){ root.classList.remove('head-hidden'); }
      else if (d > 6){
        if (megaOpen) closeAll();
        root.classList.add('head-hidden');
      } else if (d < -6){ root.classList.remove('head-hidden'); }
      if (Math.abs(d) > 6) lastY = y;
    };
    window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }, { passive: true });
    // keyboard users tabbing into the header always see it
    var top = document.querySelector('.top');
    if (top) top.addEventListener('focusin', function(){ root.classList.remove('head-hidden'); });
  })();

  /* ---- home jump bar: highlights the block you're in ---- */
  (function(){
    var bar = document.querySelector('.jump'); if (!bar) return;
    var links = Array.prototype.slice.call(bar.querySelectorAll('a'));
    var secs = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
    var set = function(i){
      links.forEach(function(a, k){ a.setAttribute('aria-current', String(k === i)); });
      var a = links[i]; if (!a) return;
      var inn = bar.querySelector('.jump-in'), ar = a.getBoundingClientRect(), ir = inn.getBoundingClientRect();
      if (ar.left < ir.left || ar.right > ir.right) inn.scrollTo({ left: a.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
    };
    var cur = -1, pick = function(){
      var mid = window.innerHeight * 0.35, best = -1;
      secs.forEach(function(s, k){ if (s && s.getBoundingClientRect().top <= mid) best = k; });
      if (best !== cur){ cur = best; set(best); }
    };
    var q = false;
    window.addEventListener('scroll', function(){ if (!q){ q = true; requestAnimationFrame(function(){ q = false; pick(); }); } }, { passive: true });
    pick();
    // land each block right under the bar: going down the header hides, going up it comes back
    links.forEach(function(a, k){ a.addEventListener('click', function(e){
      var s = secs[k]; if (!s) return; e.preventDefault();
      var y = s.getBoundingClientRect().top + window.scrollY;
      var headH = document.querySelector('.top').offsetHeight;
      var off = bar.offsetHeight + (y > window.scrollY ? 0 : headH);
      window.scrollTo({ top: Math.max(0, y - off + 1), behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', a.getAttribute('href'));
    }); });
  })();

  /* ---- mobile drawer ---- */
  var menuBtn = document.querySelector('.menu-btn');
  var drawer = document.querySelector('.drawer');
  function closeDrawer(){
    if (!drawer) return;
    drawer.classList.remove('open');
    if (menuBtn){ menuBtn.setAttribute('aria-expanded','false'); menuBtn.innerHTML = menuBtn.dataset.open; }
    document.body.style.overflow = '';
  }
  if (menuBtn && drawer){
    menuBtn.dataset.open = menuBtn.innerHTML;
    menuBtn.addEventListener('click', function(){
      var isOpen = drawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.innerHTML = isOpen ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg>' : menuBtn.dataset.open;
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    drawer.querySelectorAll('.acc').forEach(function(b){
      b.addEventListener('click', function(){
        var sub = document.getElementById(b.getAttribute('aria-controls'));
        var o = sub.classList.toggle('open');
        b.setAttribute('aria-expanded', String(o));
        b.querySelector('.pm').textContent = o ? '−' : '+';
      });
    });
  }

  /* ---- country: prices, tax note ---- */
  var TAX = { ph:'Prices exclude any applicable tax', au:'Prices exclude GST', us:'Prices exclude any sales tax' };
  function setCountry(c){
    document.querySelectorAll('[data-ph]').forEach(function(el){ el.textContent = el.dataset[c]; });
    document.querySelectorAll('[data-country]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.country === c)); });
    document.querySelectorAll('.taxnote').forEach(function(el){ el.textContent = TAX[c]; });
    var sel = document.getElementById('f-country'); if (sel && !sel.dataset.touched) sel.value = {ph:'Philippines',au:'Australia',us:'United States'}[c];
    try { localStorage.setItem('mp-country', c); } catch(e){}
  }
  document.querySelectorAll('[data-country]').forEach(function(b){
    b.addEventListener('click', function(){ setCountry(b.dataset.country); });
  });
  var start = 'ph';
  try {
    var saved = localStorage.getItem('mp-country');
    if (saved === 'ph' || saved === 'au' || saved === 'us') start = saved;
    else {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (/^Australia\//.test(tz)) start = 'au'; else if (/^America\/|^US\//.test(tz)) start = 'us';
    }
  } catch(e){}
  setCountry(start);

  /* ---- work filters ---- */
  var fbtns = document.querySelectorAll('.filters button');
  fbtns.forEach(function(b){
    b.addEventListener('click', function(){
      fbtns.forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
      var f = b.dataset.filter;
      document.querySelectorAll('.cases .case').forEach(function(c){
        c.classList.toggle('hide', f !== 'all' && (c.dataset.kind || '').indexOf(f) < 0);
      });
    });
  });

  /* ---- hero orbs ---- */
  var cv = document.getElementById('orbs');
  if (cv){
    var cx = cv.getContext('2d');
    var size = function(){ cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    window.addEventListener('resize', size); size();
    var orbs = [{x:.78,y:.4,vx:.00015,vy:.0001,r:.6,c:'rgba(209,87,63,'},{x:.92,y:.85,vx:-.00013,vy:.00017,r:.5,c:'rgba(170,48,30,'},{x:.55,y:.95,vx:.00009,vy:-.00013,r:.45,c:'rgba(226,133,83,'},{x:.3,y:.2,vx:-.0001,vy:.00012,r:.35,c:'rgba(110,28,40,'}];
    var t = 0;
    var draw = function(){
      var W = cv.width, H = cv.height; cx.clearRect(0,0,W,H); t++;
      orbs.forEach(function(o,i){
        var px=(o.x+Math.sin(t*o.vx*1000+i*1.3)*.15)*W, py=(o.y+Math.cos(t*o.vy*1000+i*.9)*.12)*H, R=o.r*Math.min(W,H)*(1+Math.sin(t*.007+i*1.6)*.05);
        var g=cx.createRadialGradient(px,py,0,px,py,R); g.addColorStop(0,o.c+'0.34)'); g.addColorStop(.45,o.c+'0.10)'); g.addColorStop(1,'rgba(9,8,12,0)');
        cx.fillStyle=g; cx.beginPath(); cx.arc(px,py,R,0,Math.PI*2); cx.fill();
      });
      if (!reduce) requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---- Lumora-style cursor glow on the hero ---- */
  var hero = document.querySelector('.hero-split'), glow = hero && hero.querySelector('.glow');
  if (hero && glow && !reduce && window.matchMedia('(hover: hover)').matches){
    var tx = 0, ty = 0, gx = 0, gy = 0, running = false;
    var loop = function(){ gx += (tx - gx) * 0.08; gy += (ty - gy) * 0.08;
      glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)';
      if (Math.abs(tx-gx) > .5 || Math.abs(ty-gy) > .5) requestAnimationFrame(loop); else running = false; };
    hero.addEventListener('pointermove', function(e){
      var r = hero.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!hero.classList.contains('lit')){ gx = tx; gy = ty; hero.classList.add('lit'); }
      if (!running){ running = true; requestAnimationFrame(loop); } });
    hero.addEventListener('pointerleave', function(){ hero.classList.remove('lit'); });
  }

  /* ---- hero journey: cursor parallax + typed searches ---- */
  var jr = document.querySelector('.journey');
  if (jr && hero && !reduce){
    if (window.matchMedia('(hover: hover)').matches){
      hero.addEventListener('pointermove', function(e){
        var r = hero.getBoundingClientRect();
        jr.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
        jr.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
      });
      hero.addEventListener('pointerleave', function(){ jr.style.setProperty('--mx', 0); jr.style.setProperty('--my', 0); });
    }
    var typed = jr.querySelector('.j-type'), svc = jr.querySelector('.j-svc');
    var Q = [['plumber near me','plumber'],['dentist in Makati','dentist'],['florist in Brisbane','florist'],['electrician in Austin','electrician']];
    var qi = 0;
    var typeOut = function(text, done){ var n = 0; typed.textContent = '';
      var step = function(){ typed.textContent = text.slice(0, ++n); if (n < text.length) setTimeout(step, 55 + Math.random()*45); else done(); }; step(); };
    var erase = function(done){ var t = typed.textContent;
      var step = function(){ t = t.slice(0, -1); typed.textContent = t; if (t.length) setTimeout(step, 28); else done(); }; step(); };
    var cycle = function(){ setTimeout(function(){ erase(function(){ qi = (qi + 1) % Q.length;
      typeOut(Q[qi][0], function(){ if (svc) svc.textContent = Q[qi][1]; cycle(); }); }); }, 3200); };
    if (typed){ typeOut(Q[0][0], cycle); }
  }

  /* ---- closing laptop: scrolls the before page, wipes to the after page ---- */
  var lt = document.querySelector('[data-ba]');
  if (lt){
    var view = lt.querySelector('.lt-view'), pages = { before: lt.querySelector('.lt-before'), after: lt.querySelector('.lt-after') };
    var url = lt.querySelector('.lt-url'), stateEl = lt.querySelector('.ba-state');
    var btns = lt.querySelectorAll('[data-show]'), cur = 'before', anim = null, timer = null, visible = false;
    var LABEL = { before:'Before: the live site', after:'After: my redesign' };
    var show = function(s){
      cur = s; lt.classList.toggle('is-after', s === 'after');
      btns.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.show === s)); });
      if (url) url.textContent = s === 'after' ? 'wilsonpd.com · redesign' : 'wilsonpd.com';
      if (stateEl) stateEl.textContent = LABEL[s];
    };
    var run = function(){
      clearTimeout(timer); if (anim) anim.cancel();
      if (reduce || !visible) return;
      var img = pages[cur], dist = img.offsetHeight - view.offsetHeight;
      if (dist <= 0){ timer = setTimeout(run, 500); return; }
      anim = img.animate([{transform:'translateY(0)'},{transform:'translateY(' + (-dist) + 'px)'}],
        { duration: 9000, delay: cur === 'after' ? 900 : 400, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' });
      anim.onfinish = function(){ timer = setTimeout(function(){
        var next = cur === 'before' ? 'after' : 'before';
        pages[next].getAnimations().forEach(function(a){ a.cancel(); });
        show(next); setTimeout(function(){ pages[next === 'after' ? 'before' : 'after'].getAnimations().forEach(function(a){ a.cancel(); }); }, 950);
        run(); }, 1100); };
    };
    btns.forEach(function(b){ b.addEventListener('click', function(){
      if (anim) anim.cancel(); Object.keys(pages).forEach(function(k){ pages[k].getAnimations().forEach(function(a){ a.cancel(); }); });
      show(b.dataset.show); run(); }); });
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){
        visible = e.isIntersecting;
        if (visible && !(anim && anim.playState === 'running')) run(); else if (!visible){ if (anim) anim.pause(); clearTimeout(timer); }
      }); }, { threshold: .35 }).observe(lt);
    }
    show('before');
  }

  /* ---- motion system: staggered arrivals + Floema-style word reveals, below the fold only ---- */
  if (!reduce && 'IntersectionObserver' in window){
    var fold = window.innerHeight * 0.92, prepared = [];
    var below = function(el){ return el.getBoundingClientRect().top > fold; };
    var skip = '.hero, .mega, .drawer, .deck, .journey, .laptop';

    // cards and other blocks rise in, staggered within their row
    var BLOCK = '.rv, .grid > *, .plans > .plan, .cases > *, .timeline > div, .faq details, .facts > div, .ticks > *, .checks label';
    var cands = Array.prototype.slice.call(document.querySelectorAll('main ' + BLOCK.split(', ').join(', main ')))
      .filter(function(el){ return !el.closest(skip) && !el.matches('.deck-card, .sec-head') && !el.querySelector('.steps') && !el.closest('.steps') && !el.closest('.road'); });
    cands = cands.filter(function(el){ return !cands.some(function(o){ return o !== el && el.contains(o); }); });
    var groups = new Map();
    cands.forEach(function(el){ if (!below(el)) return;
      var p = el.parentElement, n = groups.get(p) || 0; groups.set(p, n + 1);
      el.style.setProperty('--md', (Math.min(n, 5) * 0.09).toFixed(2) + 's');
      el.classList.add('mo'); prepared.push(el); });

    // words fade up one after another, line by line
    var splitWords = function(el){ var out = [];
      (function walk(node){ Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3){
          if (!n.textContent.trim()) return;
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(p){ if (!p) return;
            if (/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(p)); return; }
            var o = document.createElement('span'), i = document.createElement('span');
            o.className = 'sw'; i.className = 'sw-i'; i.textContent = p; o.appendChild(i); frag.appendChild(o); out.push(i); });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !/^(BR|SVG|IMG|INPUT|BUTTON)$/i.test(n.tagName)) walk(n);
      }); })(el);
      return out; };
    var stagger = function(words, start, step){ words.forEach(function(w, k){ w.style.setProperty('--wd', (start + k * step).toFixed(3) + 's'); }); };
    var wordBlock = function(el, start, step){ if (el.dataset.wr) return; el.dataset.wr = 1;
      stagger(splitWords(el), start, step); el.classList.add('wr'); prepared.push(el); };
    // only the step blocks ("How I work" / "How it works") get the word-by-word reveal, with their own heading
    var stepSecs = [];
    document.querySelectorAll('main .steps').forEach(function(box){ var sec = box.closest('section'); if (sec) stepSecs.push(sec);
      var h = sec && sec.querySelector('.sec-head h2'), l = sec && sec.querySelector('.sec-head .lead');
      if (h && below(h)) wordBlock(h, 0, 0.08);
      if (l && below(l)) wordBlock(l, 0.35, 0.025); });
    // every other heading keeps its original rise out of a mask
    document.querySelectorAll('main h2').forEach(function(el){
      if (below(el) && !el.closest(skip) && !el.dataset.wr){ el.classList.add('mo-h'); prepared.push(el); } });
    // "How I work": Floema-style pinned sequence. The block holds still; 01 shows first,
    // then each bit of scrolling brings in the next step while the line fills across. Reverses on the way up.
    var pinSec = document.querySelector('main .pin-steps');
    if (pinSec){
      var pTrack = pinSec.querySelector('.pin-track'), pStage = pinSec.querySelector('.pin-stage');
      var pSteps = pinSec.querySelector('.steps'), pCols = Array.prototype.slice.call(pSteps.children);
      pSteps.dataset.wr = 1; pSteps.classList.add('pin-on');
      pCols.forEach(function(col){ stagger(splitWords(col), 0.05, 0.028); col.classList.add('wr'); });
      var pinMode = function(){ return window.matchMedia('(min-width: 901px)').matches &&
        pStage.offsetHeight <= window.innerHeight - 40 - (document.querySelector('.jump') ? 54 : 0); };
      var setTrack = function(){
        pinSec.classList.toggle('is-pinned', pinMode());
        pTrack.style.height = pinSec.classList.contains('is-pinned') ? (pStage.offsetHeight + window.innerHeight * 1.6) + 'px' : '';
      };
      var head = function(){ return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head')) || 72; };
      var pinTick = function(){
        if (pinSec.classList.contains('is-pinned')){
          var r = pTrack.getBoundingClientRect(), dist = pTrack.offsetHeight - pStage.offsetHeight, st = parseFloat(getComputedStyle(pStage).top) || head();
          var p = Math.min(1, Math.max(0, (st - r.top) / dist));
          var started = r.top <= st + window.innerHeight * 0.15;
          var shown = started ? Math.min(pCols.length, 1 + Math.floor(p * pCols.length * 0.999 + 0.0001)) : 0;
          pCols.forEach(function(col, k){ col.classList.toggle('in', k < shown); col.classList.toggle('now', k === shown - 1); });
          pSteps.style.setProperty('--fill', started ? Math.max(shown / pCols.length * 0.25 + p * 0.75, shown / pCols.length * 0.9).toFixed(3) : 0);
        } else {
          pCols.forEach(function(col){ var r = col.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.82) col.classList.add('in'); });
          pSteps.style.setProperty('--fill', 1);
        }
      };
      var pinQueued = false;
      var onPin = function(){ if (pinQueued) return; pinQueued = true; requestAnimationFrame(function(){ pinQueued = false; pinTick(); }); };
      setTrack(); pinTick();
      window.addEventListener('scroll', onPin, { passive: true });
      window.addEventListener('resize', function(){ setTrack(); pinTick(); });
      document.documentElement.classList.add('mo-ready');
    }
    // About, "The road so far": entries come in one by one as you scroll, the line fills down, reverses on the way up
    var road = document.querySelector('main .road');
    if (road){
      var rItems = Array.prototype.slice.call(road.querySelectorAll(':scope > div'));
      rItems.forEach(function(it){ stagger(splitWords(it), 0.05, 0.03); it.classList.add('wr'); });
      road.classList.add('road-on');
      var roadTick = function(){
        var line = window.innerHeight * 0.68, r = road.getBoundingClientRect();
        var last = -1;
        rItems.forEach(function(it, k){ var on = it.getBoundingClientRect().top < line; it.classList.toggle('in', on); if (on) last = k; });
        rItems.forEach(function(it, k){ it.classList.toggle('now', k === last); });
        road.style.setProperty('--fill', Math.min(1, Math.max(0, (line - r.top) / r.height)).toFixed(3));
      };
      var rq = false;
      window.addEventListener('scroll', function(){ if (!rq){ rq = true; requestAnimationFrame(function(){ rq = false; roadTick(); }); } }, { passive: true });
      window.addEventListener('resize', roadTick);
      roadTick();
      document.documentElement.classList.add('mo-ready');
    }
    document.querySelectorAll('main .steps').forEach(function(box){
      if (!below(box) || box.closest(skip) || box.closest('.pin-steps')) return; box.dataset.wr = 1;
      Array.prototype.slice.call(box.children).forEach(function(col, k){ stagger(splitWords(col), 0.45 + k * 0.18, 0.03); });
      box.classList.add('wr'); prepared.push(box); });
    document.querySelectorAll('main .label').forEach(function(el){ if (below(el) && !el.closest(skip)){ el.classList.add('mo-l'); prepared.push(el); } });

    if (prepared.length){
      document.documentElement.classList.add('mo-ready');
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('in');
          e.target.querySelectorAll(':scope > .mo-h').forEach(function(h){ h.classList.add('in'); }); io.unobserve(e.target); } }); },
        { rootMargin: '0px 0px -8% 0px', threshold: 0 });
      // the step blocks wait until they're well on screen, so the reveal is actually seen
      var io2 = new IntersectionObserver(function(es){ es.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('in'); io2.unobserve(e.target); } }); },
        { rootMargin: '0px 0px -28% 0px', threshold: 0 });
      prepared.forEach(function(el){
        if (el.classList.contains('wr')) io2.observe(el);
        else io.observe(el.classList.contains('mo-h') ? el.parentElement : el); });
      window.addEventListener('hashchange', function(){ setTimeout(function(){
        prepared.forEach(function(el){ if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); }); }, 300); });
    }
  }

  /* ---- card spotlight follows the cursor ---- */
  if (window.matchMedia('(hover: hover)').matches){
    document.addEventListener('pointermove', function(e){
      var c = e.target.closest && e.target.closest('.card'); if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--sx', (e.clientX - r.left) + 'px'); c.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---- copy email ---- */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){
      try { navigator.clipboard.writeText(b.dataset.copy); } catch(e){}
      var old = b.textContent; b.textContent = 'Copied'; setTimeout(function(){ b.textContent = old; }, 1800);
    });
  });

  /* ---- mock-up request: builds an email ---- */
  var form = document.getElementById('mockup-form');
  if (form){
    try { var w = new URLSearchParams(location.search).get('website'); if (w && form.website) form.website.value = w; } catch(e){}
    var sel = document.getElementById('f-country');
    if (sel) sel.addEventListener('change', function(){ sel.dataset.touched = '1'; });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var d = new FormData(form);
      var body = 'Hi Maria,\n\nI would like a free homepage mock-up.\n\n'
        + 'Name: ' + (d.get('name')||'') + '\n'
        + 'Business: ' + (d.get('business')||'') + '\n'
        + 'Website: ' + (d.get('website')||'') + '\n'
        + 'Country: ' + (d.get('country')||'') + '\n'
        + 'Interested in: ' + (d.getAll('service').join(', ')||'Not sure yet') + '\n\n'
        + (d.get('message')||'');
      window.location.href = 'mailto:hello@mariape.co?subject=' + encodeURIComponent('Free homepage mock-up: ' + (d.get('business')||'')) + '&body=' + encodeURIComponent(body);
      var ok = document.getElementById('form-ok'); if (ok) ok.hidden = false;
    });
  }

  /* ---- hero device screens pan slowly; counters roll up when seen ---- */
  if (!reduce && 'IntersectionObserver' in window){
    var panIO = new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('go', e.isIntersecting); }); }, { threshold: 0.2 });
    document.querySelectorAll('.dv-pan').forEach(function(el){ panIO.observe(el); });
    var fmt = function(v, dec){ return v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
    var cIO = new IntersectionObserver(function(es){ es.forEach(function(e){
      if (!e.isIntersecting) return; cIO.unobserve(e.target);
      var el = e.target, to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, t0 = null;
      var tick = function(t){ if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1800), ease = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(to * ease, dec); if (k < 1) requestAnimationFrame(tick); };
      el.textContent = fmt(0, dec); requestAnimationFrame(tick);
    }); }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function(el){ cIO.observe(el); });
  }

  /* ---- statement: highlight one line at a time as it scrolls through ---- */
  var stmt = document.querySelector('.statement .fill');
  if (stmt && !reduce){
    var original = stmt.textContent.trim(), lines = [];
    var build = function(){
      stmt.classList.remove('by-line'); stmt.textContent = '';
      var words = original.split(/\s+/).map(function(w){ var sp = document.createElement('span'); sp.textContent = w + ' '; stmt.appendChild(sp); return sp; });
      var groups = [], top = null;
      words.forEach(function(sp){ if (sp.offsetTop !== top){ groups.push([]); top = sp.offsetTop; } groups[groups.length - 1].push(sp.textContent); });
      stmt.textContent = ''; lines = groups.map(function(g){ var l = document.createElement('span'); l.className = 'hl'; l.textContent = g.join('').trim(); stmt.appendChild(l); return l; });
      stmt.classList.add('by-line'); paint();
    };
    var paint = function(){
      var r = stmt.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.4)));
      var n = lines.length;
      lines.forEach(function(l, i){ l.style.setProperty('--k', Math.min(1, Math.max(0, p * (n + 0.6) - i)).toFixed(3)); });
    };
    var ticking = false;
    window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(function(){ paint(); ticking = false; }); } }, { passive: true });
    var rw; window.addEventListener('resize', function(){ clearTimeout(rw); rw = setTimeout(build, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
  }
})();

/* blog filters: real buttons, shown only when JavaScript runs */
(function(){
  var bar = document.querySelector('[data-filters]'); if (!bar) return;
  var items = document.querySelectorAll('.blog-list [data-cat]'), status = document.querySelector('.filter-status');
  bar.hidden = false;
  bar.addEventListener('click', function(e){
    var b = e.target.closest('button[data-f]'); if (!b) return;
    bar.querySelectorAll('button[data-f]').forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    var f = b.getAttribute('data-f'), n = 0;
    items.forEach(function(el){ var show = f === 'all' || (' ' + el.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1;
      el.hidden = !show; if (show){ n++; el.classList.add('in'); } });
    if (status) status.textContent = 'Showing ' + n + (n === 1 ? ' article' : ' articles');
  });
})();
