function getPrefix(depth) {
  if (depth <= 1) return './';
  return '../'.repeat(depth - 1);
}

function includeNav(depth, active) {
  var p = getPrefix(depth);
  var nav = 
    '<nav class="nav" id="nav">' +
      '<div class="nav-inner">' +
        '<div class="nav-col nav-col-left">' +
          '<a href="' + p + 'index.html" class="nav-logo">ACE SIGUA</a>' +
          '<button class="nav-toggle" id="navToggle" aria-label="Toggle menu">' +
            '<span class="menu-text">Menu</span>' +
            '<span class="close-text">Close</span>' +
          '</button>' +
        '</div>' +
        '<div class="nav-col nav-col-center">' +
          '<a href="' + p + 'index.html" class="nav-link' + (active === 'home' ? ' nav-link-active' : '') + '">HOME</a>' +
          '<a href="' + p + 'works/index.html" class="nav-link' + (active === 'works' ? ' nav-link-active' : '') + '">WORKS</a>' +
          '<a href="' + p + 'index.html#about" class="nav-link' + (active === 'about' ? ' nav-link-active' : '') + '">ABOUT</a>' +
          '<a href="' + p + 'contact/index.html" class="nav-link' + (active === 'contact' ? ' nav-link-active' : '') + '">CONTACT</a>' +
        '</div>' +
        '<div class="nav-col nav-col-right">' +
          '<span class="nav-clock" id="navClock">HKT 00:00:00 AM</span>' +
        '</div>' +
      '</div>' +
    '</nav>' +
    '<div class="mobile-nav-overlay" id="mobileNav">' +
      '<a href="' + p + 'index.html" class="mobile-nav-link">HOME</a>' +
      '<a href="' + p + 'works/index.html" class="mobile-nav-link">WORKS</a>' +
      '<a href="' + p + 'index.html#about" class="mobile-nav-link">ABOUT</a>' +
      '<a href="' + p + 'contact/index.html" class="mobile-nav-link">CONTACT</a>' +
    '</div>';
  var el = document.getElementById('nav-container');
  if (el) el.innerHTML = nav;
}

function includeNextProjects(currentSlug, depth) {
  var allWorks = [
    { slug: 'daewoo', path: 'daewoo/index.html', title: 'DAEWOO', category: 'Digital Marketing, Art Direction, Gen AI', image: 'works-daewoo.png' },
    { slug: 'travelogues', path: 'travelogues/index.html', title: 'TRAVELOGUES', category: 'Videography, Art Direction, Audio Mastering', image: 'works-travelogues.png', op: '50.5% 79.2%' },
    { slug: 'adventurerace', path: 'adventurerace/index.html', title: 'ADVENTURE RACE', category: 'Photography, Graphic Design', image: 'works-adventurerace.jpg', op: '50.8% 29.7%' },
    { slug: 'guinness', path: 'guinness/index.html', title: 'GUINNESS', category: 'Photography, Gen AI', image: 'works-guinness.png' },
    { slug: 'nike', path: 'nike/index.html', title: 'NIKE', category: 'Graphic Design, Photography', image: 'works-nike.png' },
    { slug: 'podcasts', path: 'podcasts/index.html', title: 'PODCASTS', category: 'Videography, Audio Mastering, Art Direction', image: 'works-podcasts.png', op: '50.3% 33%' },
    { slug: 'podmic', path: 'podmic/index.html', title: 'PODMIC MOBILE', category: 'Gen AI, Graphic Design', image: 'works-podmic.png' },
    { slug: 'logiquest', path: 'logiquest/index.html', title: 'LOGIQUEST', category: 'Branding, Graphic Design', image: 'works-logiquest.png' },
    { slug: 'basketball', path: 'basketball/index.html', title: 'BASKETBALL MEDIA DAY', category: 'Photography, Art Direction', image: 'works-basketball.png' },
    { slug: 'luzviminda', path: 'luzviminda/index.html', title: 'LUZVIMINDA', category: 'Graphic Design, Art Direction', image: 'works-luzviminda.png' },
    { slug: 'mv', path: 'mv/index.html', title: 'MUSIC VIDEO', category: 'Videography, Art Direction', image: 'works-mv.png', op: '43.6% 30.9%' },
    { slug: 'hk-film-awards', path: 'hk-film-awards/index.html', title: 'HK FILM AWARDS', category: 'Graphic Design', image: 'works-hkfilmawards.png' },
    { slug: 'kalepgolf', path: 'kalepgolf/index.html', title: 'KALEP GOLF', category: 'Art Direction, Gen AI, Videography', image: 'works-kalepgolf.png' },
    { slug: 'avanza', path: 'avanza/index.html', title: 'AVANZA', category: 'Digital Marketing, Art Direction, Gen AI', image: 'works-avanza.png' }
  ];

  var others = [];
  for (var i = 0; i < allWorks.length; i++) {
    if (allWorks[i].slug !== currentSlug) {
      others.push(allWorks[i]);
    }
  }

  var storageKey = 'nextWorksShown';
  var shownStr = sessionStorage.getItem(storageKey);
  var shown = shownStr ? shownStr.split(',') : [];

  var available = [];
  for (var j = 0; j < others.length; j++) {
    if (shown.indexOf(others[j].slug) === -1) {
      available.push(others[j]);
    }
  }

  if (available.length < 3) {
    shown = [];
    available = [];
    for (var k = 0; k < others.length; k++) {
      available.push(others[k]);
    }
  }

  var chosen = [];
  for (var m = 0; m < 3 && available.length > 0; m++) {
    var randIdx = Math.floor(Math.random() * available.length);
    chosen.push(available[randIdx]);
    available.splice(randIdx, 1);
  }

  var newShown = [];
  for (var n = 0; n < chosen.length; n++) {
    newShown.push(chosen[n].slug);
  }
  for (var o = 0; o < shown.length; o++) {
    newShown.push(shown[o]);
  }
  sessionStorage.setItem(storageKey, newShown.join(','));

  var p = getPrefix(depth);
  var imgBase = p + 'assets/images/Selected Works/';

  var html = '<section class="next-projects"><div class="next-projects-inner"><div class="next-header"><h2 class="next-heading">NEXT PROJECTS</h2><a href="' + p + 'works/index.html" class="see-all-works">SEE ALL WORKS</a></div><div class="next-cards">';

  for (var q = 0; q < chosen.length; q++) {
    var w = chosen[q];
    html += '<a href="' + p + 'works/' + w.path + '" class="next-card"><div class="next-card-image-wrapper">';
    if (w.image) {
      var webpSrc = imgBase + w.image.replace(/\.\w+$/, '.webp');
      html += '<picture><source srcset="' + webpSrc + '" type="image/webp"><img src="' + imgBase + w.image + '" alt="' + w.title + '" class="next-card-image" loading="lazy"' + (w.op ? ' style="object-position:' + w.op + '"' : '') + '></picture>';
    } else {
      html += '<div class="works-all-card-placeholder">' + w.title.replace(/ /g, '<br>') + '</div>';
    }
    html += '</div><div class="next-card-details"><h3 class="next-card-title">' + w.title + '</h3><p class="next-card-category">' + w.category + '</p></div></a>';
  }

  html += '</div></div></section>';
  var el = document.getElementById('next-projects-container');
  if (el) el.innerHTML = html;
}

function includeFooter(depth) {
  var p = getPrefix(depth);
  var footer =
    '<footer class="footer">' +
      '<div class="footer-inner">' +
        '<div class="footer-cta">' +
          '<a href="' + p + 'contact/index.html" class="footer-cta-link">GET IN TOUCH</a>' +
        '</div>' +
        '<div class="footer-info">' +
          '<p class="footer-email">iamacesigua@gmail.com</p>' +
          '<p class="footer-phone">+852 5791 0730</p>' +
        '</div>' +
      '</div>' +
    '</footer>';
  var el = document.getElementById('footer-container');
  if (el) el.innerHTML = footer;
}

function initNav() {
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('.mobile-nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  function updateClock() {
    var now = new Date();
    var timeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Hong_Kong', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    var clockEl = document.getElementById('navClock');
    if (clockEl) clockEl.textContent = 'HKT ' + timeStr;
  }
  updateClock();
  setInterval(updateClock, 1000);

  var nav = document.getElementById('nav');
  if (nav && document.getElementById('hero')) {
    window.addEventListener('scroll', function() {
      nav.classList.toggle('scrolled', window.scrollY > 100);
    }, { passive: true });
  } else if (nav) {
    nav.style.background = '#0f0f0f';
  }

  var aboutSection = document.getElementById('about');
  if (aboutSection) {
    document.querySelectorAll('.nav-link[href$="#about"], .mobile-nav-link[href$="#about"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }
}
