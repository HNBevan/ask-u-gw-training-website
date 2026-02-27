/* ============================================================
   Ask U Training — main.js
   - Hero image slideshow
   - Sticky header scroll effect
   - Burger menu (mobile)
   - Accordion dropdowns (mobile)
   - Active nav link highlighting
   - Smooth close on mobile link click
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const isMobile = () => window.innerWidth <= 768;

  /* ============================================================
     HERO SLIDESHOW
     ============================================================ */
  const slides     = qsa('.slide');
  const indicators = qsa('.indicator');
  let   current    = 0;
  let   slideTimer = null;

  /* Per-slide heading and subtext — must match slide order in HTML */
  const slideTexts = [
    {
      heading: 'Accredited Training Providers',
      sub:     'Ask U Training in association with GW Training, delivering nationally recognised qualifications supporting you at every stage of your career.'
    },
    {
      heading: 'Health & Social Care Training',
      sub:     'From entry level certificates to advanced diplomas, our comprehensive health and social care courses are designed to empower care professionals with the skills and knowledge needed to excel in their roles.'
    },
    {
      heading: 'Develop Future Leaders & Managers',
      sub:     'From frontline practitioners to registered managers, we support every stage of your care career with specialist leadership training.'
    },
    {
      heading: 'Early Years & Childcare Training',
      sub:     'Our childcare courses are designed to equip early years professionals with the skills and knowledge needed to provide high-quality care and education for children.'
    },
  ];

  const heroH1 = qs('.hero-content h1');
  const heroP  = qs('.hero-content .hero-text');

  function goToSlide(index) {
    slides[current].classList.remove('active');
    indicators[current].classList.remove('active');
    indicators[current].setAttribute('aria-selected', 'false');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    indicators[current].classList.add('active');
    indicators[current].setAttribute('aria-selected', 'true');

    /* Cross-fade the hero heading and subtext */
    if (heroH1 && heroP && slideTexts[current]) {
      heroH1.style.opacity = '0';
      heroP.style.opacity  = '0';
      setTimeout(() => {
        heroH1.textContent = slideTexts[current].heading;
        heroP.textContent  = slideTexts[current].sub;
        heroH1.style.opacity = '1';
        heroP.style.opacity  = '1';
      }, 380);
    }
  }

  function nextSlide() {
    goToSlide(current + 1);
  }

  function startSlideshow() {
    slideTimer = setInterval(nextSlide, 5000);
  }

  function resetSlideshow() {
    clearInterval(slideTimer);
    startSlideshow();
  }

  if (slides.length > 1) {
    // Manual indicators
    indicators.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        goToSlide(i);
        resetSlideshow();
      });
    });

    startSlideshow();

    // Pause on hero hover / focus
    const hero = qs('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => clearInterval(slideTimer));
      hero.addEventListener('mouseleave', startSlideshow);
    }
  }


  /* ============================================================
     HEADER — scroll shadow
     ============================================================ */
  const header = qs('#header');

  function onScroll() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ============================================================
     BURGER MENU + MOBILE NAV
     ============================================================ */
  const burger     = qs('#burger');
  const navMenu    = qs('#navMenu');
  const navOverlay = qs('#navOverlay');

  function openNav() {
    navMenu.classList.add('open');
    navOverlay.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navMenu.classList.remove('open');
    navOverlay.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // Reset per-category accordion states
    qsa('.mega-col').forEach(c => c.classList.remove('open'));
  }

  if (burger) {
    burger.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      isOpen ? closeNav() : openNav();
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }

  // Close nav when a regular (non-toggle) link is clicked on mobile
  qsa('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile()) closeNav();
    });
  });


  /* ============================================================
     ACCORDION DROPDOWNS (mobile only)
     ============================================================ */
  const dropdownItems = qsa('.has-dropdown, .has-submenu');

  dropdownItems.forEach(item => {
    const toggle = qs('.dropdown-toggle, .nav-toggle-btn, .submenu-toggle', item);
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      // Category submenus (.has-submenu) toggle on click on both desktop and mobile.
      // Top-level dropdowns (.has-dropdown) only toggle via JS on mobile; desktop uses CSS hover.
      if (!isMobile() && !item.classList.contains('has-submenu')) return;

      e.preventDefault();
      e.stopPropagation();

      const isOpen = item.classList.contains('open');

      // Close siblings only (to allow nested open states)
      const siblings = [...item.parentElement.children].filter(c => c !== item && (c.classList.contains('has-dropdown') || c.classList.contains('has-submenu')));
      
      siblings.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const t = qs('.dropdown-toggle, .nav-toggle-btn, .submenu-toggle', other);
          if (t) t.setAttribute('aria-expanded', 'false'); 
        }
      });

      // Toggle this one
      item.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Close nav when a real destination link inside a dropdown is clicked (mobile).
  // Skip .submenu-toggle links — those just expand a nested list and must NOT close the nav.
  qsa('.dropdown li a').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile() && !link.classList.contains('submenu-toggle') && !link.classList.contains('mega-col-header')) {
        dropdownItems.forEach(item => item.classList.remove('open'));
        closeNav();
      }
    });
  });

  /* ============================================================
     MEGA MENU — mobile per-category accordion
     Each .mega-col-header toggles its sibling .mega-course-list.
     On desktop the headers are plain links; JS only fires on mobile.
     ============================================================ */
  // mega-col-header links navigate to their page on both desktop and mobile.
  // The .mega-col-expand span inside each header toggles the accordion on mobile.
  qsa('.mega-col-expand').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();       // don't navigate
      e.stopPropagation();      // don't trigger the parent <a>
      if (!isMobile()) return;  // on desktop, hover handles expansion via CSS
      const col = btn.closest('.mega-col');
      const isOpen = col.classList.contains('open');
      qsa('.mega-col').forEach(c => c.classList.remove('open'));
      if (!isOpen) col.classList.add('open');
    });
  });

  // Close dropdown on desktop when focus leaves (accessibility)
  dropdownItems.forEach(item => {
    item.addEventListener('mouseleave', () => {
      if (!isMobile()) {
        item.classList.remove('open');
      }
    });
  });


  /* ============================================================
     CLOSE NAV ON RESIZE (if opened on mobile, then resized)
     ============================================================ */
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      closeNav();
      dropdownItems.forEach(item => item.classList.remove('open'));
    }
  });

  /* ============================================================
     PAGE ACCORDIONS (Qualifications Page)
     ============================================================ */
  const pageAccordions = qsa('.accordion-header');
  
  pageAccordions.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isOpen = item.classList.contains('open');

      // Close others in the same container
      const container = item.closest('.accordion-container');
      if (container) {
        qsa('.accordion-item', container).forEach(other => {
          if (other !== item) other.classList.remove('open');
        });
      }

      item.classList.toggle('open', !isOpen);
    });
  });

  /* ============================================================
     ACTIVE NAV LINK — highlight based on scroll position
     ============================================================ */
  const sections  = qsa('section[id], article[id]');
  const navLinks  = qsa('.nav-link[href^="#"]');

  function setActiveLink() {
    const scrollY = window.scrollY + 120;

    let activeId = null;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) {
        activeId = sec.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === activeId);
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();


  /* ============================================================
     SMOOTH SCROLL — polyfill for older Safari
     ============================================================ */
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const hrefVal = this.getAttribute('href');
      if (!hrefVal || hrefVal === '#') return;   // skip submenu toggles / bare # links
      const target = qs(hrefVal);
      if (!target) return;

      e.preventDefault();
      const navH = header ? header.offsetHeight : 0;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ============================================================
     SCROLL REVEAL — subtle fade-in on scroll
     ============================================================ */
  const revealEls = qsa(
    '.feature-card, .qual-card, .benefit, .contact-card, .contact-other, .accred-item'
  );

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      // Stagger only elements entering the viewport in the same batch
      const visible = entries.filter(e => e.isIntersecting);
      visible.sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
      visible.forEach((entry, i) => {
        entry.target.style.transitionDelay = `${i * 0.15}s`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => {
      const dir = isMobile() && el.dataset.revealMobile
                  ? el.dataset.revealMobile
                  : el.dataset.reveal;
      el.style.opacity = '0';
      el.style.transform = dir === 'left'  ? 'translateX(-50px)' :
                           dir === 'right' ? 'translateX(50px)'  :
                           dir === 'top'   ? 'translateY(-50px)' :
                                             'translateY(16px)';
      el.style.transition = 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
      revealObserver.observe(el);
    });
  }

  // Inline visible class application
  const style = document.createElement('style');
  style.textContent = '.visible { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);


  /* ============================================================
     HERO COURSE SEARCH
     ============================================================ */
  const courses = [
    // Leadership / Management / Business
    { name: 'Leadership & Management',                        category: 'Leadership, Management & Business', url: 'contact.html' },
    { name: 'Business Training',                              category: 'Leadership, Management & Business', url: 'contact.html' },
    // Health & Safety
    { name: 'Health & Safety',                                category: 'Health & Safety',             url: 'contact.html' },
    // Health & Social Care
    { name: 'Level 2 – Adult Social Care Certificate',        category: 'Health & Social Care',        url: 'health-social-care.html' },
    { name: 'Level 3 – Diploma in Adult Care',                category: 'Health & Social Care',        url: 'health-social-care.html' },
    { name: 'Level 4 – Diploma in Adult Care',                category: 'Health & Social Care',        url: 'health-social-care.html' },
    { name: 'Level 5 – Leadership & Management in Adult Care',category: 'Health & Social Care',        url: 'health-social-care.html' },
    // Champions in Care
    { name: 'Champions in Care',                              category: 'Champions in Care Training',  url: 'contact.html' },
    // Child Care Training
    { name: 'Level 3 – Diploma for Residential Childcare',   category: 'Child Care Training',         url: 'childrens-residential.html' },
    { name: 'Level 4 – Diploma for Residential Childcare',   category: 'Child Care Training',         url: 'childrens-residential.html' },
    // Childcare & Education
    { name: 'Level 3 – Early Years Educator',                category: 'Childcare & Education',       url: 'early-years.html' },
    { name: 'Level 5 – Early Years Lead Practitioner',       category: 'Childcare & Education',       url: 'early-years.html' },
    // First Aid
    { name: 'Emergency First Aid at Work',                    category: 'First Aid',                   url: 'contact.html' },
    { name: 'Paediatric First Aid',                           category: 'First Aid',                   url: 'contact.html' },
    { name: 'First Aid at Work',                              category: 'First Aid',                   url: 'contact.html' },
    // Diploma Training
    { name: 'Diploma Training',                               category: 'Diploma Training',            url: 'contact.html' },
  ];

  const searchInput   = qs('#heroSearch');
  const searchResults = qs('#heroSearchResults');

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = '';

      if (!query) { searchResults.hidden = true; return; }

      const matches = courses.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );

      if (matches.length === 0) {
        const li = document.createElement('li');
        li.className = 'search-no-results';
        li.textContent = 'No courses found for "' + searchInput.value + '"';
        searchResults.appendChild(li);
      } else {
        matches.forEach(c => {
          const li = document.createElement('li');
          li.innerHTML = `<a href="${c.url}"><span class="result-name">${c.name}</span><span class="result-cat">${c.category}</span></a>`;
          searchResults.appendChild(li);
        });
      }

      searchResults.hidden = false;
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.closest('.hero-search').contains(e.target)) {
        searchResults.hidden = true;
      }
    });

    // Close on Escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { searchResults.hidden = true; searchInput.blur(); }
    });
  }

})();
