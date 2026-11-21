/* ═══════════════════════════════════════════════════════════════════
   gergonyako.hu — az új oldal közös szkriptje (DEMÓ, 2026-10-16)

   Mindent a lap jelölése vezérel (osztály, data-*), egyik lapnak sincs
   saját másolata ebből. A DEMO kapcsolót a csomagoló állítja hamisra
   (.claude/csomag-uj.js): élesben az űrlapok a kuldes.php-ra mennek,
   _json=1-gyel, és a mérésnek eseményt küldenek (meres.js továbbítja).
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var DEMO = false;
  var html = document.documentElement;
  var csend = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!csend) html.classList.add('mozog');
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ── kampánykövetés: a hirdetés paramétereit eltesszük a munkamenetre,
        hogy a harmadik lapon kitöltött űrlap is vigye (menu.js-ből) ── */
  var UTM = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];
  (function(){
    var p = new URLSearchParams(location.search);
    if (!UTM.some(function(k){ return p.get(k); })) return;
    try { UTM.forEach(function(k){ var v = p.get(k); if (v) sessionStorage.setItem(k, v.slice(0,120)); else sessionStorage.removeItem(k); }); } catch(e){}
  })();

  /* ── menü ── */
  var fiok = $('.fiok');
  function menu(nyit){
    if (!fiok) return;
    fiok.classList.toggle('nyitva', nyit);
    $$('.nyito').forEach(function(g){ g.setAttribute('aria-expanded', String(nyit)); });

  }
  $$('.nyito').forEach(function(g){ g.addEventListener('click', function(e){ e.stopPropagation(); menu(!(fiok && fiok.classList.contains('nyitva'))); }); });
  /* kis legördülő: mellékattintásra csukódik */
  document.addEventListener('click', function(e){ if (fiok && fiok.classList.contains('nyitva') && !fiok.contains(e.target)) menu(false); });
  $$('.zaro-gomb').forEach(function(g){ g.addEventListener('click', function(){ menu(false); }); });
  if (fiok) $$('a', fiok).forEach(function(a){ a.addEventListener('click', function(){ menu(false); }); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') menu(false); });

  /* ── rögzített magú véletlen: minden betöltésnél ugyanaz a kép ── */
  function magos(m){ return function(){ m = (m * 16807) % 2147483647; return (m - 1) / 2147483646; }; }
  var NS = 'http://www.w3.org/2000/svg';

  /* ── az összehasonlító halmaz pontjai ── */
  $$('.halmaz').forEach(function(svg){
    var g = $('.pontok', svg); if (!g) return;
    var vel = magos(7), oszlop = {}, N = 30;
    for (var i = 0; i < N; i++) {
      var u = (vel() + vel()) / 2, k = Math.round((14 + u * 292) / 9);
      oszlop[k] = (oszlop[k] || 0) + 1;
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', k * 9); c.setAttribute('cy', 93 - (oszlop[k] - 1) * 10); c.setAttribute('r', 3.6);
      c.setAttribute('class', 'pont'); c.style.transitionDelay = (0.25 + i * 0.03) + 's';
      g.appendChild(c);
    }
    var s = document.createElementNS(NS, 'circle');
    s.setAttribute('cx', 162); s.setAttribute('cy', 93 - (oszlop[18] || 0) * 10); s.setAttribute('r', 4.6);
    s.setAttribute('class', 'pont sajat'); s.style.transitionDelay = '1.2s';
    g.appendChild(s);
  });

  /* ── piktogram: házak és vevők ── */
  var HAZ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-6 8 6v9H4z"/><path d="M10 20v-5h4v5"/></svg>';
  var VEVO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/></svg>';
  $$('.piktogram').forEach(function(p){
    var h = $('[data-haz]', p), v = $('[data-vevo]', p);
    for (var i = 0; i < +h.dataset.haz; i++) h.insertAdjacentHTML('beforeend', HAZ);
    for (var j = 0; j < +v.dataset.vevo; j++) v.insertAdjacentHTML('beforeend', VEVO);
    $$('svg', h).forEach(function(s, n){ s.style.transitionDelay = (n * 0.07) + 's'; });
    $$('svg', v).forEach(function(s, n){ s.style.transitionDelay = (0.75 + n * 0.12) + 's'; });
  });


  /* ── egyszeri belépés: ami a képbe ér, .lat-ot kap, és kész ── */
  var FIGYELT = '.fejezet > h2, .fejezet > p, .fejezet > ul, .cikk-bevezeto > p, .zaro-sav p, .jel, .ajtok, .fo-adatok, .energia, .igeret, .dok, .fejlec, .lepesek li, .be, .piktogram, .szuro, .idosor, .ossz, .belepo';
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        var el = e.target; el.classList.add('lat'); io.unobserve(el);
        if (el.classList.contains('ossz')) kileng(el);
        if (el.classList.contains('szuro')) setTimeout(function(){ el.classList.add('szurt'); }, csend ? 0 : 1800);
      });
    }, {threshold: 0.25, rootMargin: '0px 0px -6% 0px'});
    $$(FIGYELT).forEach(function(el){ io.observe(el); });
  } else {
    $$(FIGYELT).forEach(function(el){ el.classList.add('lat'); });
  }

  /* ── előtte–utána: a fogó egyszer megmutatja, hogy húzható ── */
  $$('.ossz').forEach(function(o){
    var r = $('input', o);
    r.addEventListener('input', function(){ o.dataset.fogta = '1'; o.style.setProperty('--x', r.value + '%'); });
  });
  function kileng(o){
    if (!html.classList.contains('mozog')) return;
    var r = $('input', o), t0 = null, T = 1700;
    function lep(t){
      if (o.dataset.fogta) return;
      if (t0 === null) t0 = t;
      var f = Math.min(1, (t - t0) / T), p = 50 + Math.sin(f * Math.PI * 2) * 13 * (1 - f);
      o.style.setProperty('--x', p.toFixed(2) + '%'); r.value = p;
      if (f < 1) requestAnimationFrame(lep);
    }
    setTimeout(function(){ requestAnimationFrame(lep); }, 350);
  }

  /* ── görgetésre: a fonal töltődik, a fejléc tömörül, a ragadós sáv jön-megy ── */
  var fo = $('main'), fonal = $('.fonal'), fej = $('.fej'), hero = $('.hero, .belepo');
  var fejlecek = $$('main .fejlec, main .fejezet, main .zaro-sav'), lepesek = $$('.lepesek'), ragados = $('.ragados');
  var atlatszo = fej && fej.classList.contains('atlatszo');
  var mindig = ragados && ragados.hasAttribute('data-mindig');
  /* a ragadós sáv eltűnik, ha űrlap, a lap vége vagy a hírlevél/lábléc van a
     képen — így a láblécnek nem kell helyet hagynia neki */
  var takar = $$('.urlap, [data-ragados-el], .hirlevel, .lab');
  function gorget(){
    var vh = window.innerHeight, szint = vh * 0.6;
    if (fonal && fo) {
      var r = fo.getBoundingClientRect();
      fonal.style.setProperty('--fonal', Math.max(0, Math.min(r.height, szint - r.top)) + 'px');
    }
    fejlecek.forEach(function(f){ if (f.getBoundingClientRect().top < szint) f.classList.add('elert'); });
    lepesek.forEach(function(l){
      var lr = l.getBoundingClientRect();
      l.style.setProperty('--gerinc', Math.max(0, Math.min(lr.height, szint - lr.top - 20)) + 'px');
    });
    /* a fejléc csak a lap legtetején átlátszó: amint görget, tömör lesz, hogy a
       menü ne a kártya szövegére rajzolódjon */
    if (atlatszo && hero) fej.classList.toggle('atlatszo', window.scrollY < 24);
    /* data-mindig (adatlap): nincs nyitókép, ami után jönne, a sáv végig
       áll, és a lapon nincs másik gomb, ami megduplázná */
    if (ragados && (hero || mindig)) {
      var kint = mindig || hero.getBoundingClientRect().bottom < 0;
      var ut = takar.some(function(t){ var b = t.getBoundingClientRect(); return b.top < vh && b.bottom > 0; });
      ragados.classList.toggle('lat', kint && !ut);
    }
  }
  window.addEventListener('scroll', gorget, {passive: true});
  window.addEventListener('resize', gorget);
  gorget();

  /* ── főoldal: Eladnék / Vennék — a fő gomb és az ígéret ehhez igazodik ── */
  $$('[data-szal]').forEach(function(r){
    r.addEventListener('change', function(){
      var d = r.dataset, gomb = $('#fo-gomb');
      if (!gomb) return;
      $('.fo-gomb-szoveg', gomb).textContent = d.gomb;
      gomb.href = d.href;
      var c = $('#hero-cim'), b = $('#hero-bev');
      if (c && d.cim) c.innerHTML = d.cim;
      if (b && d.bev) b.textContent = d.bev;
      $$('[data-igeret]').forEach(function(li){ li.hidden = li.dataset.igeret !== r.value; });
    });
  });

  /* ═══ Űrlapok ═══ */
  function ft(v){ v = +v; return v >= 250 ? '250 M Ft felett' : v + ' M Ft'; }
  $$('.csuszka').forEach(function(c){
    var r = $('input[type=range]', c), o = $('output', c);
    function ir(){ o.textContent = ft(r.value); }
    r.addEventListener('input', function(){ r.dataset.mozdult = '1'; ir(); }); ir();
  });

  /* városrész: saját szűrős lista (a datalist iPhone-on néma volt) */
  var VAROSRESZEK = ['Alsópázsit','Belváros','Borbánya','Bujtos','Butyka','Császárszállás','Érkert','Felsőpázsit','Felsősima','Hímes','Huszártelep','Jósaváros','Kertváros','Kőlapos','Korányi-kertváros','Malomkert','Nagyszállás','Nyírjes','Nyírszőlős','Ókistelekiszőlő','Oros','Örökösföld','Rozsrétszőlő','Sóstógyógyfürdő','Sóstóhegy','Újkistelekiszőlő'];
  function alap(s){ return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  $$('input[data-varosresz]').forEach(function(inp){
    var hova = document.createElement('div'); hova.className = 'javaslatok';
    inp.parentNode.appendChild(hova);
    inp.addEventListener('input', function(){
      var v = alap(inp.value.split(',').pop().trim());
      hova.innerHTML = '';
      if (v.length < 2) return;
      VAROSRESZEK.filter(function(n){ return alap(n).indexOf(v) === 0 || alap(n).indexOf(' ' + v) > -1; }).slice(0, 5).forEach(function(n){
        var b = document.createElement('button'); b.type = 'button'; b.textContent = n;
        b.addEventListener('click', function(){
          var reszek = inp.value.split(','); reszek[reszek.length - 1] = (reszek.length > 1 ? ' ' : '') + n;
          inp.value = reszek.join(','); hova.innerHTML = ''; inp.dispatchEvent(new Event('change', {bubbles:true}));
        });
        hova.appendChild(b);
      });
    });
  });

  /* feltételes sorok: egy választás kinyit egy kiegészítő mezőt vagy mondatot */
  $$('[data-ha]').forEach(function(el){
    var p = el.dataset.ha.split('='), nev = p[0], ert = p[1].split('|');
    var form = el.closest('form');
    function ell(){
      var be = $$('[name="' + nev + '"]', form).some(function(i){ return i.checked && ert.indexOf(i.value) > -1; });
      el.hidden = !be;
    }
    form.addEventListener('change', ell); ell();
  });

  function kitoltve(blokk){
    var be = $$('input, textarea, select', blokk);
    return be.some(function(i){
      if (i.type === 'radio' || i.type === 'checkbox') return i.checked;
      if (i.type === 'range') return false;   // a csúszkának mindig van értéke, az nem válasz
      return i.value.trim() !== '';
    });
  }

  /* mérés: a lapok `event` kulccsal pusholnak, a meres.js adja tovább a
     GA4-nek (és a *_lead eseményt a Meta pixelnek). A nevek a régi lapokéi,
     hogy a kampányok és a riportok ne szakadjanak el. */
  window.dataLayer = window.dataLayer || [];
  function meres(e){ try { window.dataLayer.push(e); } catch(x){} }
  function urlapAdat(form, nev){ var m = $('[name="' + nev + '"]:checked', form) || $('[name="' + nev + '"]', form); return m ? m.value : ''; }

  $$('form.urlap-form').forEach(function(form){
    var doboz = form.closest('.urlap');
    var tipusa = urlapAdat(form, '_urlap');
    var kezdve = false;
    form.addEventListener('input', function(){
      if (kezdve) return; kezdve = true;
      if (tipusa === 'hirdetes') meres({event: 'hirdetes_kezdes', honnan: urlapAdat(form, 'honnan')});
      else if (tipusa && tipusa !== 'arazas-kieg') meres({event: tipusa + '_kezdes'});
    });
    var ts = $('[name=ts]', form); if (ts) ts.value = Date.now();
    UTM.forEach(function(k){ var m = $('[name=' + k + ']', form); if (m) try { m.value = sessionStorage.getItem(k) || ''; } catch(e){} });
    var hon = $('[name=honnan]', form); if (hon && !hon.value) hon.value = location.pathname.split('/').pop() || 'index';

    var kotelezo = $$('[data-kotelezo]', form), halad = $('.halad', doboz), hszov = $('.halad-szoveg', doboz);
    function haladas(){
      var kesz = kotelezo.filter(kitoltve).length;
      if (halad) halad.style.width = (kesz / kotelezo.length * 100) + '%';
      if (hszov) hszov.textContent = kesz + ' / ' + kotelezo.length;
      kotelezo.forEach(function(b){ if (kitoltve(b)) b.classList.remove('hianyzik'); });
    }
    form.addEventListener('change', haladas); form.addEventListener('input', haladas); haladas();

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var hibas = kotelezo.filter(function(b){ return !kitoltve(b); });
      var egyik = form.dataset.egyik ? form.dataset.egyik.split(',') : null;
      var hibauz = $('.hibauz', form), uz = '';
      if (egyik && !egyik.some(function(n){ var m = $('[name=' + n + ']', form); return m && m.value.trim(); })) {
        egyik.forEach(function(n){ var m = $('[name=' + n + ']', form); if (m) { m.closest('.mezo').classList.add('hianyzik'); hibas.push(m.closest('.mezo')); } });
        uz = 'Egy telefonszám vagy egy e-mail-cím kell, hogy válaszolni tudjak.';
      }
      var em = $('[name=email]', form);
      if (em && em.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) { em.closest('.mezo').classList.add('hianyzik'); hibas.push(em.closest('.mezo')); uz = 'Az e-mail-cím nem tűnik helyesnek.'; }
      var hj = $('[name=hozzajarul]', form);
      if (hj && !hj.checked) { uz = uz || 'A hozzájárulás nélkül nem tudom kezelni az adatait.'; hibas.push(hj.closest('.egyet')); }
      /* ha kérdés is hiányzik, az általános üzenet a pontosabb: a piros jelölés mutatja, mi */
      if (kotelezo.some(function(b){ return !kitoltve(b); })) uz = '';
      hibas.forEach(function(b){ b.classList.add('hianyzik'); });
      if (hibas.length) {
        if (hibauz) hibauz.textContent = uz || 'Egy-két válasz még hiányzik — pirossal jelöltem.';
        hibas[0].scrollIntoView({behavior: csend ? 'auto' : 'smooth', block: 'center'});
        return;
      }
      if (hibauz) hibauz.textContent = '';
      var tovabb = form.dataset.tovabb;
      function kesz(){
        /* a lead-esemény: a köszönőlapra lépés előtt, hogy a mérés még ezen a lapon fusson */
        var e = {event: tipusa + '_lead'};
        if (tipusa === 'hirdetes') e.honnan = urlapAdat(form, 'honnan');
        else if (tipusa === 'kapcsolat') e.tema = urlapAdat(form, 'tema');
        else if (tipusa === 'beruhazo') { e.mod = urlapAdat(form, 'mod'); e.csomag = urlapAdat(form, 'csomag'); }
        else if (tipusa === 'arazas-kieg') e = {event: 'arazas_kiegeszites'};
        else e.tipus = urlapAdat(form, 'tipus');
        meres(e);
        /* az árelemzés köszönőlapjának kiegészítője ebből tudja, kié */
        if (tipusa === 'arazas') try { sessionStorage.setItem('ng-elozo', JSON.stringify({nev: urlapAdat(form, 'nev'), tel: urlapAdat(form, 'tel'), email: urlapAdat(form, 'email')})); } catch(x){}
        if (tovabb) { setTimeout(function(){ location.href = tovabb; }, 300); return; }
        doboz.classList.add('elkuldve');
        doboz.scrollIntoView({behavior: csend ? 'auto' : 'smooth', block: 'start'});
      }
      if (DEMO) { kesz(); return; }
      /* a több-választós csoportok (név[]) a küldőnek egy szövegként mennek,
         ahogy a régi lapok rejtett mezője vitte: „keszpenz, kezeles" */
      var nyers = new FormData(form), fd = new FormData(), tobb = {};
      nyers.forEach(function(v, k){
        if (k.slice(-2) === '[]') { (tobb[k.slice(0, -2)] = tobb[k.slice(0, -2)] || []).push(v); }
        else fd.append(k, v);
      });
      Object.keys(tobb).forEach(function(k){ fd.set(k, tobb[k].join(', ')); });
      /* a nem kötelező csúszka (irányár) csak akkor megy, ha hozzányúlt: az
         alapértéke nem válasz */
      $$('input[type=range][data-ha-mozdult]', form).forEach(function(r){ if (!r.dataset.mozdult) fd.delete(r.name); });
      if (tipusa === 'arazas-kieg') try { var el = JSON.parse(sessionStorage.getItem('ng-elozo') || '{}'); ['nev','tel','email'].forEach(function(k){ if (el[k]) fd.set(k, el[k]); }); } catch(x){}
      fd.append('_json', '1');
      var gomb = $('.kuld', form); if (gomb) gomb.disabled = true;
      fetch(form.action, {method: 'POST', body: fd}).then(function(r){ return r.json(); }).then(function(j){
        if (j && j.ok) kesz(); else { if (hibauz) hibauz.textContent = (j && (j.hiba || j.uzenet)) || 'Nem ment el. Kérem, hívjon: +36 30 605 3313.'; if (gomb) gomb.disabled = false; }
      }).catch(function(){ if (hibauz) hibauz.textContent = 'Nem ment el. Kérem, hívjon: +36 30 605 3313.'; if (gomb) gomb.disabled = false; });
    });
  });

  /* beruházói csomaggombok: kiválasztják a csomagot az űrlapban */
  $$('[data-csomag]').forEach(function(g){
    g.addEventListener('click', function(){
      var m = $('[name=mod][value=csomag]');
      if (m) { m.checked = true; m.dispatchEvent(new Event('change', {bubbles:true})); }
      var r = $('[name=csomag][value="' + g.dataset.csomag + '"]');
      if (r) { r.checked = true; r.dispatchEvent(new Event('change', {bubbles:true})); }
    });
  });

  /* hírlevél: helyben küld (a feliratkozas.php JSON-nal válaszol), hogy az
     olvasó ne essen ki a lapról. JS nélkül a php saját lapja felel. */
  $$('.hirlevel form').forEach(function(f){
    var old = $('[name=oldal]', f); if (old) old.value = location.href.split('#')[0];
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var cim = $('[name=cim]', f), hj = $('[name=hozzajarul]', f), val = $('.hl-valasz', f);
      function ir(t, jo){ if (val) { val.textContent = t; val.className = 'hl-valasz ' + (jo ? 'jo' : 'rossz'); } }
      if (!cim.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cim.value.trim())) { ir('Az e-mail-cím nem tűnik helyesnek.'); return; }
      if (hj && !hj.checked) { ir('A hozzájárulás nélkül nem tudok levelet küldeni.'); return; }
      if (DEMO) { ir('Köszönöm. A megerősítő levelet élesben most küldené ki a rendszer.', true); return; }
      var g = $('button', f); if (g) g.disabled = true;
      var fd = new FormData(f); fd.append('_json', '1');
      fetch(f.action, {method: 'POST', body: fd}).then(function(r){ return r.json(); }).then(function(v){
        ir(v.uzenet, v.siker); if (v.siker) { cim.value = ''; meres({event: 'hirlevel_feliratkozas'}); } if (g) g.disabled = false;
      }).catch(function(){ ir('Most nem sikerült. Próbálja meg kicsit később.'); if (g) g.disabled = false; });
    });
  });

  /* a főoldal kínálat-sínje és friss írásai élesben a modulokból jönnek, hogy
     egy új vagy eladott hirdetés, egy új írás azonnal látsszon (a lap maga
     statikus, nem épül újra minden változáskor) */
  $$('[data-frissit]').forEach(function(el){
    if (DEMO) return;
    fetch(el.dataset.frissit, {credentials: 'same-origin'}).then(function(r){ return r.ok ? r.text() : ''; }).then(function(t){
      if (!t.trim()) return;
      el.innerHTML = t;
      $$('.be', el).forEach(function(x){ x.classList.add('lat'); });
      var v = $('[data-db]', el), sz = $('[data-kinalat-db]');
      if (v && sz) sz.textContent = 'Mind a ' + v.dataset.db;
      document.dispatchEvent(new CustomEvent('ng:frissult', {detail: el}));
    }).catch(function(){});
  });
})();

/* ═══ 2. kör: kínálat-szűrő, galéria, link másolása ═══ */
(function(){
  'use strict';
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* kínálat: típus és városrész szerint szűr, a találatszámot kiírja */
  var racs = document.querySelector('[data-kinalat]');
  if (racs) {
    var kartyak = $$('.tetel', racs), szam = document.querySelector('.talalat b'), nincs = document.querySelector('.nincs-talalat');
    /* a „Nem találta?" sáv mindig a 6. látható kártya mögött áll; ha
       nincs hét találat, elbújik (a lap alján úgyis ott van) */
    var kozbe = racs.querySelector('.kozbe-sav');
    function helyez(){
      if (!kozbe) return;
      var lathato = kartyak.filter(function(k){ return !k.hidden; });
      kozbe.hidden = lathato.length < 7;
      if (!kozbe.hidden) lathato[5].after(kozbe);
    }
    /* rendezés: alapból a kézi sorrend (az admin listájáé) marad */
    kartyak.forEach(function(k, i){ k.dataset.i = i; });
    function rendez(){
      var r = (document.querySelector('[name=rendezes]:checked') || {}).value || '';
      var sor = kartyak.slice().sort(function(a, b){
        var d = 0;
        if (r === 'uj') d = (b.dataset.uj || '').localeCompare(a.dataset.uj || '');
        else if (r === 'novo') d = (+a.dataset.ar || 0) - (+b.dataset.ar || 0);
        else if (r === 'csokk') d = (+b.dataset.ar || 0) - (+a.dataset.ar || 0);
        return d || (a.dataset.i - b.dataset.i);
      });
      sor.forEach(function(k){ racs.appendChild(k); });
      kartyak = sor; helyez();
    }
    $$('[name=rendezes]').forEach(function(i){ i.addEventListener('change', rendez); });
    function szur(){
      var t = (document.querySelector('[name=tipus-szuro]:checked') || {}).value || '';
      var h = (document.querySelector('[name=hely-szuro]:checked') || {}).value || '';
      var db = 0;
      kartyak.forEach(function(k){
        var ok = (!t || k.dataset.tipus === t) && (!h || k.dataset.varosresz === h);
        k.hidden = !ok; if (ok) { db++; k.classList.add('lat'); }
      });
      if (szam) szam.textContent = db;
      if (nincs) nincs.hidden = db > 0;
      helyez();
    }
    $$('[name=tipus-szuro], [name=hely-szuro]').forEach(function(i){ i.addEventListener('change', szur); });
  }

  /* kártya: a kép fölött húzva lapoz (az élő lista.js-ből). A főoldal
     sínjét élesben utólag tölti be a lap — akkor az új kártyákra is kell. */
  function lapozo(gyoker){ $$('.tetel-kep[data-lapok]', gyoker).forEach(function(k){
    if (k.dataset.kesz) return; k.dataset.kesz = '1';
    var lapok = k.dataset.lapok.split('|'); if (lapok.length < 2) return;
    var kep = k.querySelector('img'), csikok = k.querySelectorAll('.tetel-osztas i'), hol = 0, betoltve = false;
    function betolt(){ if (betoltve) return; betoltve = true; lapok.forEach(function(c){ var e = new Image(); e.src = c; }); }
    function mutat(i){ if (i === hol) return; hol = i; kep.src = lapok[i]; [].forEach.call(csikok, function(c, j){ c.classList.toggle('be', j === i); }); }
    function arany(x){ var r = k.getBoundingClientRect(); mutat(Math.floor(Math.min(0.999, Math.max(0, (x - r.left) / r.width)) * lapok.length)); }
    k.addEventListener('pointerenter', betolt);
    k.addEventListener('pointermove', function(e){ if (e.pointerType !== 'touch') arany(e.clientX); });
    k.addEventListener('pointerleave', function(){ mutat(0); });
    var x0 = null, y0 = null, vizszintes = false;
    k.addEventListener('touchstart', function(e){ betolt(); x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; vizszintes = false; k.classList.add('lapoz'); var o = k.querySelector('.tetel-osztas'); if (o) o.classList.add('lat'); }, {passive: true});
    k.addEventListener('touchmove', function(e){
      if (x0 === null) return;
      var dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
      if (!vizszintes && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) vizszintes = true;
      if (vizszintes) arany(e.touches[0].clientX);
    }, {passive: true});
    k.addEventListener('touchend', function(e){ if (vizszintes) e.preventDefault(); x0 = null; });
    /* a sínben a vízszintes húzás a sínt görgeti, nem lapoz */
    if (k.closest('.sin')) { k.style.touchAction = 'auto'; }
  }); }
  lapozo(document);
  document.addEventListener('ng:frissult', function(e){ lapozo(e.detail); });

  /* képnagyító: koppintásra helyben, nagyban, lapozóval (az élő galeria.js
     viselkedése). A képek listáját a lap adja (#fotok), így a képsor, a
     „Mind a N fotó" gomb és a fotórács ugyanazt a sort lapozza. */
  (function(){
    var forras = document.getElementById('fotok'); if (!forras) return;
    var kepek = JSON.parse(forras.textContent); if (!kepek.length) return;
    var doboz, kep, szam, kicsik, hol = 0, vissza = null;
    var kicsi = function(u){ return u.replace(/\.webp$/, '-sm.webp'); };
    var cim = (document.querySelector('h1') || {}).textContent || 'Fotók';
    function keszit(){
      doboz = document.createElement('div'); doboz.className = 'nagyito';
      doboz.setAttribute('role', 'dialog'); doboz.setAttribute('aria-modal', 'true'); doboz.setAttribute('aria-label', 'Fotók');
      doboz.innerHTML = '<div class="nagyito-panel">' +
        '<div class="nagyito-fej"><span class="nagyito-cim"></span><span class="nagyito-szam"></span><button type="button" class="nagyito-zar" aria-label="Bezárás">&times;</button></div>' +
        '<div class="nagyito-lap"><img alt=""><button type="button" class="nagyito-nyil balra" aria-label="Előző">&#8249;</button><button type="button" class="nagyito-nyil jobbra" aria-label="Következő">&#8250;</button></div>' +
        '<div class="nagyito-kicsik" role="tablist" aria-label="Kis képek"></div></div>';
      document.body.appendChild(doboz);
      doboz.querySelector('.nagyito-cim').textContent = cim;
      kep = doboz.querySelector('.nagyito-lap img'); szam = doboz.querySelector('.nagyito-szam'); kicsik = doboz.querySelector('.nagyito-kicsik');
      kicsik.innerHTML = kepek.map(function(u, i){ return '<button type="button" role="tab" aria-label="' + (i + 1) + '. fotó"><img src="' + kicsi(u) + '" alt="" loading="lazy"></button>'; }).join('');
      $$('button', kicsik).forEach(function(b, i){ b.addEventListener('click', function(){ mutat(i); }); });
      kep.addEventListener('load', function(){ kep.classList.remove('tolt'); });
      doboz.querySelector('.nagyito-zar').addEventListener('click', zar);
      doboz.querySelector('.balra').addEventListener('click', function(){ mutat(hol - 1); });
      doboz.querySelector('.jobbra').addEventListener('click', function(){ mutat(hol + 1); });
      /* a panel mellé, az elhalványított oldalra kattintva bezárul */
      doboz.addEventListener('click', function(e){ if (e.target === doboz) zar(); });
      var lap = doboz.querySelector('.nagyito-lap'), x0 = null;
      kep.addEventListener('click', function(e){ if (kepek.length < 2) return; var r = kep.getBoundingClientRect(); mutat(hol + (e.clientX < r.left + r.width / 3 ? -1 : 1)); });
      lap.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, {passive: true});
      lap.addEventListener('touchend', function(e){ if (x0 === null) return; var d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 45) mutat(hol + (d < 0 ? 1 : -1)); x0 = null; });
      if (kepek.length < 2) { doboz.querySelectorAll('.nagyito-nyil').forEach(function(b){ b.hidden = true; }); kicsik.hidden = true; }
    }
    function mutat(i){
      hol = (i + kepek.length) % kepek.length;
      if (kep.getAttribute('src') !== kepek[hol]) { kep.classList.add('tolt'); kep.src = kepek[hol]; }
      szam.textContent = (hol + 1) + ' / ' + kepek.length;
      $$('button', kicsik).forEach(function(b, j){ b.setAttribute('aria-current', String(j === hol)); });
      var akt = kicsik.children[hol];
      if (akt) kicsik.scrollTo({left: akt.offsetLeft - (kicsik.clientWidth - akt.offsetWidth) / 2});
      [hol + 1, hol - 1].forEach(function(j){ var e = new Image(); e.src = kepek[(j + kepek.length) % kepek.length]; });
    }
    function bill(e){ if (e.key === 'Escape') zar(); else if (e.key === 'ArrowRight') mutat(hol + 1); else if (e.key === 'ArrowLeft') mutat(hol - 1); }
    function nyit(i, honnan){ if (!doboz) keszit(); vissza = honnan; doboz.classList.add('lat'); mutat(i); document.body.classList.add('nagyito-nyitva'); document.addEventListener('keydown', bill); doboz.querySelector('.nagyito-zar').focus({preventScroll: true}); }
    function zar(){ doboz.classList.remove('lat'); document.body.classList.remove('nagyito-nyitva'); document.removeEventListener('keydown', bill); if (vissza) vissza.focus({preventScroll: true}); }
    $$('[data-nagyit]').forEach(function(a){
      a.addEventListener('click', function(e){ e.preventDefault(); nyit(+a.dataset.nagyit, a); });
    });
    document.addEventListener('contextmenu', function(e){ if (e.target.tagName === 'IMG' && e.target.closest('.kepsor, .fotok, .nagyito, .tetel-kep')) e.preventDefault(); });

    /* a telefonos képsor számlálója */
    var sor = document.querySelector('.kepsor'), sz = document.querySelector('.kepsor-szam');
    if (sor && sz) sor.addEventListener('scroll', function(){ sz.textContent = (Math.round(sor.scrollLeft / sor.clientWidth) + 1) + ' / ' + kepek.length; }, {passive: true});
  })();

  /* a teljes leírás: kinyitja a csukott részt; ha rövid, nincs is gomb */
  $$('.leiras-gomb').forEach(function(g){
    var t = document.getElementById(g.getAttribute('aria-controls'));
    if (t.scrollHeight <= t.clientHeight + 24) { t.classList.remove('csukva'); t.dataset.hossz = 'rovid'; return; }
    g.addEventListener('click', function(){
      var nyitva = !t.classList.toggle('csukva');
      g.setAttribute('aria-expanded', String(nyitva)); g.textContent = nyitva ? 'Kevesebb' : 'A teljes leírás';
    });
  });

  /* képek: jobb klikk és húzás ki — nem védelem, csak ne két mozdulat legyen */
  document.addEventListener('dragstart', function(e){ if (e.target.tagName === 'IMG' && e.target.closest('.kepsor, .fotok, .tetel-kep')) e.preventDefault(); });

  /* link másolása */
  $$('[data-masol]').forEach(function(b){
    b.addEventListener('click', function(){
      var kesz = function(){ var r = b.textContent; b.textContent = 'Kimásolva'; setTimeout(function(){ b.textContent = r; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.masol).then(kesz, kesz); else kesz();
    });
  });
})();

/* ═══ Cikk: olvasási csík és a tartalom követése ═══ */
(function(){
  'use strict';
  var cikk = document.getElementById('cikk'), csik = document.querySelector('.olvasas-csik');
  if (!cikk) return;
  function olvas(){
    var r = cikk.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.35 - r.top) / (r.height - vh * 0.5)));
    if (csik) csik.style.setProperty('--olvasva', p.toFixed(4));
  }
  window.addEventListener('scroll', olvas, {passive: true}); window.addEventListener('resize', olvas); olvas();
  var linkek = Array.prototype.slice.call(document.querySelectorAll('.tartalom a'));
  var cimek = linkek.map(function(a){ return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  if (!cimek.length) return;
  function hol(){
    var akt = 0;
    cimek.forEach(function(h, i){ if (h.getBoundingClientRect().top < window.innerHeight * 0.3) akt = i; });
    linkek.forEach(function(a, i){ a.setAttribute('aria-current', String(i === akt)); });
  }
  window.addEventListener('scroll', hol, {passive: true}); hol();
  /* mobilon a tartalomból választva csukódjon össze */
  document.querySelectorAll('.tartalom-mobil a').forEach(function(a){ a.addEventListener('click', function(){ a.closest('details').open = false; }); });
})();
