/* ── sutik.js ──
   Valódi hozzájárulás-kezelés. Az oldal mérő- és hirdetési kódot tölt
   be (GA4, Meta pixel), de csak hozzájárulás után. Ezért a sáv nem
   tájékoztat, hanem kérdez, és a válasz eldönti, hogy a
   mérőkód egyáltalán elindulhat-e.

   A mérőkódot NE közvetlenül tedd a lapra. Így kösd be:

     document.addEventListener('suti:dontes', function (e) {
       if (e.detail.meres) { ...ide jön a GTM / Meta pixel betöltése... }
     });
     if (window.sutiEngedely().meres) { ...ugyanaz, ha már korábban igent mondott... }

   A döntés a böngésző helyi tárolójában marad, és a süti-tájékoztató
   lapon bármikor visszavonható. */
(function () {
  'use strict';

  var KULCS = 'ng-suti';
  var GYOKER = /\/(kinalat|gondolatok)\//.test(location.pathname) ? '../' : '';

  function olvas() {
    try { return localStorage.getItem(KULCS); } catch (e) { return null; }
  }
  function ir(ertek) {
    try { localStorage.setItem(KULCS, ertek); } catch (e) { /* privát mód */ }
  }

  function engedely() {
    var d = olvas();
    return {
      dontes: d,
      szukseges: true,           // ez nem választható: enélkül nem működik a lap
      meres: d === 'mind',
      hirdetes: d === 'mind'
    };
  }
  window.sutiEngedely = engedely;

  /* A tájékoztató lapon a „Beállítás módosítása" gomb ezt hívja. */
  window.sutiUjrakerdez = function () {
    try { localStorage.removeItem(KULCS); } catch (e) {}
    location.reload();
  };

  function szol() {
    document.dispatchEvent(new CustomEvent('suti:dontes', { detail: engedely() }));
  }

  if (olvas()) { szol(); return; }

  var stilus = document.createElement('style');
  stilus.textContent =
    /* Az oldalon nincs fekete felület, ezért a sáv sem az: a márka aranyán ül,
       így a meleg fehér lapon is rögtön látszik. */
    '.suti-sav{position:fixed;z-index:80;left:var(--szel,22px);bottom:16px;' +
    'width:min(400px,calc(100vw - var(--szel,22px)*2));' +
    'background:var(--arany-sotet,#8A6A3C);border-radius:var(--r,16px);' +
    'box-shadow:0 18px 44px -18px rgba(138,106,60,.5);' +
    'padding:17px 19px;font-size:13.5px;line-height:1.6;color:#fff;' +
    'opacity:0;transform:translateY(10px);transition:opacity .35s ease,transform .35s ease}' +
    '.suti-sav.lat{opacity:1;transform:none}' +
    '.suti-sav p{margin:0}' +
    '.suti-sav b{color:#fff;font-weight:600}' +
    '.suti-sav .sor{margin-top:13px;display:flex;flex-wrap:wrap;align-items:center;gap:9px}' +
    '.suti-sav a{color:#fff;text-decoration:underline;margin-left:auto;font-size:12.5px}' +
    '.suti-sav button{border:1px solid rgba(255,255,255,.62);border-radius:999px;' +
    'background:transparent;color:#fff;padding:9px 18px;font:inherit;font-size:13.5px;' +
    'font-weight:600;cursor:pointer;transition:background .25s,color .25s,border-color .25s}' +
    '.suti-sav button:hover{background:#fff;color:var(--arany-sotet,#8A6A3C);border-color:#fff}' +
    '.suti-sav button.fo{background:#fff;color:var(--arany-sotet,#8A6A3C);border-color:#fff}' +
    '.suti-sav button.fo:hover{background:transparent;color:#fff;border-color:rgba(255,255,255,.62)}' +
    /* Weben nem kártya a sarokban, hanem sáv a lap alján, középre zárt tartalommal. */
    '@media (min-width:700px){' +
    '.suti-sav{left:0;right:0;bottom:0;width:auto;border-radius:0;padding:14px var(--szel,44px);' +
    'box-shadow:0 -10px 30px -18px rgba(138,106,60,.55)}' +
    '.suti-sav .belso{max-width:var(--max,1200px);margin-inline:auto;' +
    'display:flex;align-items:center;gap:22px}' +
    '.suti-sav .belso > p{flex:1;margin:0}' +
    '.suti-sav .sor{margin-top:0;flex:none}' +
    '.suti-sav a{margin-left:0}}' +
    '@media (prefers-reduced-motion:reduce){.suti-sav{transition:none}}';
  document.head.appendChild(stilus);

  /* div, nem aside: az aside-on a dialog szerep nem megengedett (axe,
     2026-10-22). A szöveg tiszta fehér: a 86%-os fehér az aranyon csak
     4,2:1 volt, a fehér 5:1. */
  var sav = document.createElement('div');
  sav.className = 'suti-sav';
  sav.setAttribute('role', 'dialog');
  sav.setAttribute('aria-label', 'Sütik');
  sav.innerHTML =
    '<div class="belso">' +
      '<p><b>Sütik.</b> A működéshez szükségesek mindig futnak. Mérésre és hirdetésre ' +
      'csak akkor használok sütit, ha Ön ezt engedi — és bármikor visszavonhatja.</p>' +
      '<div class="sor">' +
        '<button type="button" class="fo" data-valasz="mind">Elfogadom</button>' +
        '<button type="button" data-valasz="szukseges">Csak a szükségesek</button>' +
        '<a href="' + GYOKER + 'sutik.html">Részletek</a>' +
      '</div>' +
    '</div>';
  document.body.appendChild(sav);

  requestAnimationFrame(function () { sav.classList.add('lat'); });

  sav.addEventListener('click', function (e) {
    var g = e.target.closest('button[data-valasz]');
    if (!g) return;
    ir(g.dataset.valasz);
    sav.classList.remove('lat');
    setTimeout(function () { sav.remove(); }, 350);
    szol();
  });
})();
