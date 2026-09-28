(function () {
  'use strict';

  var doc = document.documentElement;
  var header = document.querySelector('.site-header');
  var callbar = document.querySelector('[data-callbar]');

  window.addEventListener('load', function () { doc.classList.add('is-loaded'); });
  setTimeout(function () { doc.classList.add('is-loaded'); }, 1200);

  /* header state + mobile call bar */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (callbar) {
      var devis = document.getElementById('devis');
      var nearForm = devis && devis.getBoundingClientRect().top < window.innerHeight * .6 && devis.getBoundingClientRect().bottom > 0;
      callbar.classList.toggle('is-visible', y > window.innerHeight * .8 && !nearForm);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = doc.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        doc.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* reveal on scroll */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && document.visibilityState !== 'hidden') {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* savoir-faire accordion + image stack */
  var list = document.querySelector('[data-trades]');
  if (list) {
    var trades = list.querySelectorAll('.trade');
    var stack = document.querySelectorAll('[data-trade-stack] img');
    var cap = document.querySelector('[data-trade-cap]');
    var count = document.querySelector('[data-trade-count]');
    var caps = ['Plafond acoustique', 'Salon terracotta', 'Papier peint feuillage', 'Façade et volets', 'Nuancier NCS'];
    function activate(i, fromHover) {
      trades.forEach(function (t, k) {
        var on = k === i;
        if (!fromHover || on) {
          t.classList.toggle('is-active', on);
          t.querySelector('button').setAttribute('aria-expanded', on ? 'true' : 'false');
        }
      });
      stack.forEach(function (img, k) { img.classList.toggle('is-active', k === i); });
      if (cap) cap.textContent = caps[i];
      if (count) count.textContent = '0' + (i + 1) + ' / 05';
    }
    trades.forEach(function (t, i) {
      t.querySelector('button').addEventListener('click', function () {
        if (t.classList.contains('is-active') && window.matchMedia('(max-width: 960px)').matches) {
          t.classList.remove('is-active');
          this.setAttribute('aria-expanded', 'false');
          return;
        }
        activate(i);
      });
      t.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: hover) and (min-width: 961px)').matches) activate(i, true);
      });
    });
  }

  /* avant / après */
  document.querySelectorAll('[data-compare]').forEach(function (c) {
    var r = c.querySelector('input[type=range]');
    function set() { c.style.setProperty('--pos', r.value + '%'); }
    r.addEventListener('input', set);
    set();
  });

  /* quote form: composes an e-mail or a WhatsApp message */
  var form = document.getElementById('quote-form');
  if (form) {
    var err = form.querySelector('.form-error');
    var via = 'email';
    form.querySelectorAll('button[type=submit]').forEach(function (b) {
      b.addEventListener('click', function () { via = b.getAttribute('data-via'); });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var fd = new FormData(form);
      var travaux = fd.getAll('travaux');
      var nom = (fd.get('nom') || '').trim();
      var tel = (fd.get('tel') || '').trim();
      var email = (fd.get('email') || '').trim();
      if (!travaux.length) { err.textContent = 'Choisissez au moins un type de travaux.'; return; }
      if (!nom) { err.textContent = 'Indiquez votre nom.'; form.nom.focus(); return; }
      if (!tel && !email) { err.textContent = 'Laissez-nous un téléphone ou un e-mail pour vous répondre.'; form.tel.focus(); return; }
      err.textContent = '';

      var lines = [
        'Bonjour,',
        '',
        'Je souhaite un devis pour les travaux suivants :',
        '',
        '• Travaux : ' + travaux.join(', ')
      ];
      if (fd.get('bien')) lines.push('• Bien : ' + fd.get('bien'));
      if (fd.get('produits')) lines.push('• Produits : ' + fd.get('produits'));
      if (fd.get('delai')) lines.push('• Délai : ' + fd.get('delai'));
      if ((fd.get('lieu') || '').trim()) lines.push('• Localité : ' + fd.get('lieu').trim());
      var msg = (fd.get('message') || '').trim();
      if (msg) { lines.push('', msg); }
      lines.push('', nom);
      if (tel) lines.push(tel);
      if (email) lines.push(email);
      var body = lines.join('\n');

      if (via === 'whatsapp') {
        window.open('https://wa.me/41793428771?text=' + encodeURIComponent(body), '_blank', 'noopener');
      } else {
        var subject = 'Demande de devis : ' + travaux.join(', ');
        window.location.href = 'mailto:info@beatipeinture.ch?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      }
    });
  }

  /* réalisations: filters + lightbox */
  var gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('figure'));
    var buttons = document.querySelectorAll('[data-filter]');
    buttons.forEach(function (b) {
      var f = b.getAttribute('data-filter');
      var n = f === 'all' ? items.length : items.filter(function (it) { return it.dataset.cat.split(' ').indexOf(f) > -1; }).length;
      var sup = document.createElement('sup'); sup.textContent = n; b.appendChild(sup);
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        items.forEach(function (it) { it.hidden = !(f === 'all' || it.dataset.cat.split(' ').indexOf(f) > -1); });
      });
    });

    var lb = document.querySelector('[data-lightbox]');
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var current = 0;
    function visible() { return items.filter(function (it) { return !it.hidden; }); }
    function show(it) {
      var img = it.querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = it.querySelector('figcaption').firstChild.textContent;
      current = visible().indexOf(it);
    }
    function open(it) { show(it); lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); }
    function close() { lb.classList.remove('is-open'); document.body.style.overflow = ''; }
    function step(d) { var v = visible(); show(v[(current + d + v.length) % v.length]); }
    items.forEach(function (it) { it.querySelector('button').addEventListener('click', function () { open(it); }); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
