/* ── meres.js ──
   GA4, Meta pixel és Microsoft Clarity, hozzájáruláshoz kötve.

   A GA4 a régi WordPress-oldalról jön, hogy ne szakadjon el a mérés
   története a cserekor. A Meta pixel 2026-10-11-től a Nyakó Gergő Ingatlan
   hirdetési fiók saját pixele: a régi (837843084471361) egy másik
   portfólióé volt, a fiók nem látta rajta a leadet. A régi előzménye
   ezzel elmaradt — Gergő döntése.
     GA4         G-KKCHP3BG2X
     Meta pixel  1291345940961945
     Clarity     a projekt azonosítója a CLARITY változóban (lent); amíg üres,
                 a Clarity nem tölt be. A projektet a clarity.microsoft.com-on
                 Gergő hozza létre (Google-fiókkal), az azonosító a Settings →
                 Overview oldalon van.

   A Clarity látogatás-visszajátszást és hőtérképet ad. A beállítás, amit
   a projektben is meg kell tenni: Settings → Masking → Strict, és Cookie
   consent: kötelező. A kód itt csak annyit tesz, hogy hozzájárulás után
   tölti be, az űrlapokat és a köszönőlapokat külön maszkolja, és a
   lead-eseményt továbbadja neki.

   Három szabály, amitől ez jogszerű marad:

   1. Semmi nem töltődik be, amíg a látogató nem mondott igent. A döntést
      a sutik.js kezeli; ez a fájl csak kérdez tőle.
   2. A mérés és a hirdetés külön engedély. Ma a sáv egyben kéri („Elfogadom"),
      de ha később szétválik, itt már nem kell hozzányúlni.
   3. Előnézetben és localhoston nem fut. Különben a saját munkánk kerülne
      bele az ügyfél adataiba.

   Ami a dataLayerbe kerül, azt továbbadja. A lapok `event` kulccsal
   pusholnak — ez a GTM szabványa, de a gtag.js NEM dolgozza fel magától
   (azt csak a GTM teszi). Ezért itt kézzel továbbítjuk, és a hozzájárulás
   előtt pusholt eseményeket is visszajátsszuk. */
(function () {
  'use strict';

  var GA4   = 'G-KKCHP3BG2X';
  var PIXEL = '1291345940961945';
  var CLARITY = 'yzqlmd2qwt';   // Clarity projektazonosító (gergonyako.hu); üresen nem tölt be

  var eles = /(^|\.)gergonyako\.hu$/i.test(location.hostname);
  if (!eles) return;

  window.dataLayer = window.dataLayer || [];

  var gaKesz = false, pixelKesz = false, clarityKesz = false;

  function gtag() { window.dataLayer.push(arguments); }

  /* Consent Mode v2 (Gergő, 2026-10-20): alapból minden „denied”, és csak a
     sütisáv „Elfogadom”-ja után lesz „granted”. A gtag.js továbbra is csak
     igen után töltődik be (1. szabály); ez a jelzés azért kell, hogy a Google
     Ads megkapja az ad_user_data és ad_personalization állapotát. */
  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function hozzajarulas(e) {
    var hird = e.hirdetes ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: hird,
      analytics_storage: e.meres ? 'granted' : 'denied',
      ad_user_data: hird,
      ad_personalization: hird
    });
  }

  function betoltGA() {
    if (gaKesz) return;
    gaKesz = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4;
    document.head.appendChild(s);
    gtag('js', new Date());
    /* A hozzájárulás állapotát a hozzajarulas() már beírta a dataLayerbe,
       a config előtt. */
    gtag('config', GA4, { anonymize_ip: true });
  }

  function betoltPixel() {
    if (pixelKesz) return;
    pixelKesz = true;
    /* A Meta saját betöltője, rövidítve. A `fbq` sor a hivatalos
       kódrészlet, azon nem változtatunk. */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL);
    window.fbq('track', 'PageView');
  }


  /* A Clarity hivatalos betöltője. A `consentv2` hívás a betöltő után, de
     még az első esemény előtt megy, hogy a Clarity tudja, mire kapott engedélyt.
     Az űrlapokat és a köszönőlapot maszkoljuk: a Clarity az inputok tartalmát
     amúgy is kitakarja, de a feliratok, a névvel köszönő szöveg és a
     kiegészítő űrlap előtöltött adatai nem biztos. */
  function maszk() {
    var lista = document.querySelectorAll('form');
    for (var i = 0; i < lista.length; i++) lista[i].setAttribute('data-clarity-mask', 'true');
    if (/koszonom/.test(location.pathname)) {
      var m = document.querySelector('main');
      if (m) m.setAttribute('data-clarity-mask', 'true');
    }
  }

  function betoltClarity(e) {
    if (clarityKesz || !CLARITY) return;
    clarityKesz = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY);
    window.clarity('consentv2', {
      ad_Storage: e.hirdetes ? 'granted' : 'denied',
      analytics_Storage: e.meres ? 'granted' : 'denied'
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', maszk);
    else maszk();
  }

  /* ── az események továbbadása ──────────────────────────────── */

  /* Amit a lapok pusholnak: { event:'arazas_lead', … }. A lead-eseményeket
     a Metának is átadjuk, a többit csak a GA4-nek — hirdetési oldalon a
     „elkezdte kitölteni" zaj, a „elküldte" az érték. */
  function tovabb(t) {
    if (!t || typeof t !== 'object' || !t.event) return;
    var nev = t.event;
    /* A gtag.js a saját életjeleit is a dataLayerbe teszi (`gtm.dom`,
       `gtm.load`, `gtm.js`). Ezeket nem küldjük vissza neki, mert a GA4-ben
       kitalált eseménynévként jelennének meg. */
    if (nev.indexOf('gtm.') === 0) return;
    var adat = {};
    for (var k in t) if (k !== 'event' && Object.prototype.hasOwnProperty.call(t, k)) adat[k] = t[k];

    if (gaKesz) gtag('event', nev, adat);

    /* A Clarity csak az eseményt kapja (a nevét), az adatot nem: abban
       tipus, mod és csomag van, ügyféladat nincs, de nincs is rá szükség. */
    if (clarityKesz && /_lead$|_kiegeszites$/.test(nev)) window.clarity('event', nev);

    if (pixelKesz && /_lead$/.test(nev)) {
      /* Kétszer küldjük: a Meta a saját `Lead` eseményére tud optimalizálni,
         a saját nevünkre nem. A `trackCustom` azért marad, hogy a Meta
         felületén is látszódjon, melyik útról jött a lead. */
      window.fbq('track', 'Lead', { content_name: nev });
      window.fbq('trackCustom', nev, adat);
    }
  }

  /* A hozzájárulás előtt pusholt eseményeket megtartjuk, és igen után
     visszajátsszuk — különben az az érdeklődő veszne el, aki a sávon
     kattintott „Elfogadom"-ot, miután már elkezdte az űrlapot. */
  var korabbi = window.dataLayer.slice();

  var eredetiPush = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function () {
    var v = eredetiPush.apply(null, arguments);
    for (var i = 0; i < arguments.length; i++) tovabb(arguments[i]);
    return v;
  };

  function indul(e) {
    hozzajarulas(e);
    if (e.meres)    betoltGA();
    if (e.hirdetes) betoltPixel();
    if (e.meres)    betoltClarity(e);
    if (!gaKesz && !pixelKesz && !clarityKesz) return;
    korabbi.forEach(tovabb);
    korabbi = [];
  }

  /* Ha már korábban döntött, a sutik.js nem kérdez újra — akkor is szólnunk
     kell magunknak. A `suti:dontes` eseményt mindkét esetben elsüti. */
  document.addEventListener('suti:dontes', function (e) { indul(e.detail); });
  if (window.sutiEngedely) indul(window.sutiEngedely());
})();
