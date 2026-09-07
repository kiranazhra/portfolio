(async () => {
  // Panggil createIcons dengan aman — kalau CDN lucide gagal dimuat, halaman tetap jalan tanpa ikon
  function renderIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  let __p_animate, __p_inView, __p_scroll;
  try {
    ({ animate: __p_animate, inView: __p_inView, scroll: __p_scroll } = await import("https://cdn.jsdelivr.net/npm/motion@11/+esm"));
  } catch (err) {
    console.warn('Motion gagal dimuat, animasi dinonaktifkan:', err);
  }

  renderIcons();
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- Cursor-reactive spotlight (tidak bergantung pada Motion) ----------
  const __p_cursorGlow = document.getElementById('cursor-glow');
  if (__p_cursorGlow) {
    window.addEventListener('pointermove', (e) => {
      const xPct = (e.clientX / window.innerWidth) * 100;
      const yPct = (e.clientY / window.innerHeight) * 100;
      __p_cursorGlow.style.setProperty('--x', xPct + '%');
      __p_cursorGlow.style.setProperty('--y', yPct + '%');
    }, { passive: true });
  }

  if (__p_animate) {
    // ---------- Scroll progress bar (Motion) ----------
    __p_scroll(__p_animate('#scroll-progress', { scaleX: [0, 1] }));

    // ---------- Hero entrance sequence (Motion timeline) ----------
    __p_animate([
      ['#site-nav',     { opacity: [0, 1], y: [-16, 0] }, { duration: 0.6, easing: 'ease-out' }],
      ['#hero-badge',   { opacity: [0, 1], y: [16, 0] },  { duration: 0.5, easing: 'ease-out', at: '-0.25' }],
      ['#hero-heading', { opacity: [0, 1], y: [24, 0] },  { duration: 0.65, easing: 'ease-out', at: '-0.3' }],
      ['#hero-typed',   { opacity: [0, 1], y: [16, 0] },  { duration: 0.5, easing: 'ease-out', at: '-0.35' }],
      ['#hero-desc',    { opacity: [0, 1], y: [16, 0] },  { duration: 0.5, easing: 'ease-out', at: '-0.3' }],
      ['#hero-cta',     { opacity: [0, 1], y: [16, 0] },  { duration: 0.5, easing: 'ease-out', at: '-0.3' }],
      ['#hero-avatar',  { opacity: [0, 1], scale: [0.85, 1] }, { duration: 0.7, easing: [0.22, 1, 0.36, 1], at: '-0.5' }],
    ]);

    // ---------- Scroll-triggered reveal for sections, cards & list items ----------
    __p_inView('.reveal, .reveal-card, .reveal-item', (info) => {
      __p_animate(info.target, { opacity: [0, 1], y: [28, 0] }, { duration: 0.6, easing: [0.22, 1, 0.36, 1] });
    }, { margin: '0px 0px -10% 0px' });

    // ---------- 3D tilt on project & profile cards ----------
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        __p_animate(card, { rotateX: py * -8 + 'deg', rotateY: px * 8 + 'deg', scale: 1.015 }, { duration: 0.3, easing: 'ease-out' });
      });
      card.addEventListener('pointerleave', () => {
        __p_animate(card, { rotateX: '0deg', rotateY: '0deg', scale: 1 }, { duration: 0.5, easing: 'ease-out' });
      });
    });

    // ---------- Magnetic hover on buttons ----------
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      btn.addEventListener('pointerenter', () => __p_animate(btn, { scale: 1.05 }, { duration: 0.25, easing: 'ease-out' }));
      btn.addEventListener('pointerleave', () => __p_animate(btn, { scale: 1 }, { duration: 0.35, easing: 'ease-out' }));
    });
  } else {
    // Fallback: Motion gagal dimuat — tampilkan semua elemen tanpa animasi
    document.querySelectorAll('.reveal, .reveal-card, .reveal-item, #site-nav, #hero-badge, #hero-heading, #hero-typed, #hero-desc, #hero-cta, #hero-avatar')
      .forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen = false;
  menuToggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      mobileMenu.style.maxHeight = '300px';
      mobileMenu.style.opacity = '1';
      menuToggle.innerHTML = '<i data-lucide="x" class="w-5 h-5"></i>';
    } else {
      mobileMenu.style.maxHeight = '0';
      mobileMenu.style.opacity = '0';
      menuToggle.innerHTML = '<i data-lucide="menu" class="w-5 h-5"></i>';
    }
    renderIcons();
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.style.maxHeight = '0';
      mobileMenu.style.opacity = '0';
      menuToggle.innerHTML = '<i data-lucide="menu" class="w-5 h-5"></i>';
      renderIcons();
    });
  });

  // Portfolio sub-navbar: Project / Certificate / Tech Stack
  const portfolioTabButtons = document.querySelectorAll('.portfolio-tab-btn');
  const portfolioPanels = {
    project: document.getElementById('portfolio-panel-project'),
    certificate: document.getElementById('portfolio-panel-certificate'),
    techstack: document.getElementById('portfolio-panel-techstack'),
  };
  portfolioTabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-portfolio-tab');
      portfolioTabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      Object.entries(portfolioPanels).forEach(([key, panel]) => {
        if (!panel) return;
        if (key === target) {
          panel.classList.remove('hidden');
          panel.querySelectorAll('.reveal, .reveal-card, .reveal-item').forEach((el) => {
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
        } else {
          panel.classList.add('hidden');
        }
      });
      renderIcons();
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  });

  // Typewriter effect — teks bergantian
  const roles = ['Junior Developer', 'Mobile App Developer', 'Mahasiswa Sistem Informasi'];
  const typedEl = document.getElementById('typed-text');
  let roleIndex = 0, charIndex = 0, deleting = false;

  function typeLoop() {
    const current = roles[roleIndex];
    if (!deleting) {
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, 1600);
        return;
      }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }
    setTimeout(typeLoop, deleting ? 40 : 90);
  }
  typeLoop();

  // Contact form -> mailto (halaman statis, belum ada backend)
  document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = this.name.value;
    const email = this.email.value;
    const message = this.message.value;
    const subject = encodeURIComponent('Pesan dari Portfolio — ' + name);
    const body = encodeURIComponent(message + '\n\nDari: ' + name + ' (' + email + ')');
    window.location.href = `mailto:kiranaazahra3101@gmail.com?subject=${subject}&body=${body}`;
  });
})();