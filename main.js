/* =========================================================================
   PENN WRITINGS — main.js
   Shared interactivity: navigation, modals, accordion, scroll reveal,
   price calculator, file upload, blog filter
   ========================================================================= */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. PRELOADER
  ------------------------------------------------------------------ */
  window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
      setTimeout(() => preloader.classList.add('loaded'), 400);
    }
  });

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initHeader();
    initMobileMenu();
    initScrollReveal();
    initBackToTop();
    initAccordion();
    initServiceModals();
    initPriceCalculator();
    initUploadForm();
    initBlogFilter();
    initCounters();
    initActiveNav();
  }

  /* ------------------------------------------------------------------
     2. HEADER scroll state
  ------------------------------------------------------------------ */
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 30) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
     3. MOBILE MENU
  ------------------------------------------------------------------ */
  function initMobileMenu() {
    const burger = document.querySelector('.hamburger');
    const menu = document.querySelector('.nav-menu');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.classList.toggle('active');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        burger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ------------------------------------------------------------------
     4. ACTIVE NAV STATE
  ------------------------------------------------------------------ */
  function initActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* ------------------------------------------------------------------
     5. SCROLL REVEAL (IntersectionObserver)
  ------------------------------------------------------------------ */
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => obs.observe(el));
  }

  /* ------------------------------------------------------------------
     6. BACK TO TOP
  ------------------------------------------------------------------ */
  function initBackToTop() {
    const btn = document.querySelector('.float-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     7. ACCORDION (FAQ)
  ------------------------------------------------------------------ */
  function initAccordion() {
    document.querySelectorAll('.accordion-item').forEach(item => {
      const head = item.querySelector('.accordion-header');
      const body = item.querySelector('.accordion-body');
      if (!head || !body) return;

      head.setAttribute('aria-expanded', 'false');
      head.addEventListener('click', () => {
        const open = item.classList.toggle('open');
        head.setAttribute('aria-expanded', open);
        body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
      });
    });
  }

  /* ------------------------------------------------------------------
     8. SERVICE MODALS
  ------------------------------------------------------------------ */
  function initServiceModals() {
    const triggers = document.querySelectorAll('[data-modal-target]');
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return;
    const closeBtn = overlay.querySelector('.modal-close');
    const titleEl = overlay.querySelector('[data-modal-title]');
    const iconEl = overlay.querySelector('[data-modal-icon]');
    const bodyEl = overlay.querySelector('[data-modal-body]');

    triggers.forEach(t => {
      t.addEventListener('click', e => {
        e.preventDefault();
        const card = t.closest('.service-card') || t;
        const title = card.dataset.title || t.dataset.modalTitle || '';
        const icon = card.dataset.icon || '✦';
        const body = card.dataset.body || t.dataset.modalBody || '';
        if (titleEl) titleEl.textContent = title;
        if (iconEl) iconEl.textContent = icon;
        if (bodyEl) bodyEl.innerHTML = body;
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const close = () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    };
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
  }

  /* ------------------------------------------------------------------
     9. PRICE CALCULATOR
  ------------------------------------------------------------------ */
  function initPriceCalculator() {
    const form = document.querySelector('.calc-form');
    if (!form) return;
    const out = document.querySelector('[data-calc-result]');
    const range = document.querySelector('[data-calc-range]');

    // Base rate per 100 words (USD) — adjusted by service & level & deadline
    const SERVICE = {
      essay: 1.0,
      dissertation: 1.4,
      proposal: 1.2,
      business: 1.15,
      casestudy: 1.1,
      editing: 0.5,
      referencing: 0.4,
      presentation: 1.05
    };
    const LEVEL = {
      undergrad: 1.0,
      masters: 1.25,
      phd: 1.55
    };
    const DEADLINE = {
      '24': 1.6,
      '48': 1.35,
      '72': 1.2,
      '7': 1.0,
      '14': 0.9
    };
    const BASE_RATE = 4.5; // per 100 words baseline

    const calc = () => {
      const wc = parseInt(form.querySelector('[name=word_count]').value, 10) || 0;
      const svc = form.querySelector('[name=service]').value;
      const lvl = form.querySelector('[name=level]').value;
      const dl = form.querySelector('[name=deadline]').value;

      if (!wc || !svc || !lvl || !dl) {
        if (out) out.textContent = '$ —';
        if (range) range.textContent = 'Fill all fields to get an estimate';
        return;
      }

      const blocks = wc / 100;
      const price = blocks * BASE_RATE * (SERVICE[svc] || 1) * (LEVEL[lvl] || 1) * (DEADLINE[dl] || 1);
      const rounded = Math.max(15, Math.round(price));
      const low = Math.round(rounded * 0.92);
      const high = Math.round(rounded * 1.12);

      if (out) out.textContent = '$' + rounded;
      if (range) range.textContent = 'Estimated range: $' + low + ' – $' + high;
    };

    form.querySelectorAll('input, select').forEach(i => {
      i.addEventListener('input', calc);
      i.addEventListener('change', calc);
    });
    calc();
  }

  /* ------------------------------------------------------------------
     10. UPLOAD FORM (with drag-drop)
  ------------------------------------------------------------------ */
  function initUploadForm() {
    const form = document.querySelector('#brief-form');
    if (!form) return;
    const dz = form.querySelector('.dropzone');
    const fileInput = form.querySelector('input[type=file]');
    const fileList = form.querySelector('.file-list');
    const success = form.parentElement.querySelector('.form-success');

    let files = [];

    const renderFiles = () => {
      if (!fileList) return;
      fileList.innerHTML = '';
      files.forEach((f, i) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
          <span>📄 ${escapeHtml(f.name)} <small style="color:var(--ink-500);margin-left:.4rem">${formatBytes(f.size)}</small></span>
          <span class="remove-file" data-i="${i}" aria-label="Remove file">✕</span>
        `;
        fileList.appendChild(item);
      });
      fileList.querySelectorAll('.remove-file').forEach(el => {
        el.addEventListener('click', e => {
          const idx = parseInt(e.target.dataset.i, 10);
          files.splice(idx, 1);
          renderFiles();
        });
      });
    };

    if (dz && fileInput) {
      dz.addEventListener('click', () => fileInput.click());

      ['dragenter', 'dragover'].forEach(ev => {
        dz.addEventListener(ev, e => {
          e.preventDefault();
          dz.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(ev => {
        dz.addEventListener(ev, e => {
          e.preventDefault();
          dz.classList.remove('dragover');
        });
      });
      dz.addEventListener('drop', e => {
        const dropped = Array.from(e.dataTransfer.files);
        files = files.concat(dropped);
        renderFiles();
      });
      fileInput.addEventListener('change', e => {
        const picked = Array.from(e.target.files);
        files = files.concat(picked);
        renderFiles();
      });
    }

    // Validation
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      const required = form.querySelectorAll('[data-required]');
      required.forEach(field => {
        const group = field.closest('.form-group');
        if (!field.value.trim()) {
          group.classList.add('has-error');
          valid = false;
        } else {
          group.classList.remove('has-error');
        }
      });
      // Email pattern
      const email = form.querySelector('[name=email]');
      if (email && email.value && !/^\S+@\S+\.\S+$/.test(email.value)) {
        email.closest('.form-group').classList.add('has-error');
        valid = false;
      }

      if (!valid) {
        const firstErr = form.querySelector('.has-error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      /* ============================================================
         BACKEND INTEGRATION POINT
         ============================================================
         To wire this up to a backend, replace the simulation below
         with real submission logic. Examples:

         A) Formspree: change <form action="https://formspree.io/f/xxxxxxx"
            method="POST" enctype="multipart/form-data"> in the HTML
            and submit normally (remove the e.preventDefault()).

         B) Netlify Forms: add `netlify` and `data-netlify="true"` plus
            a hidden field `<input type="hidden" name="form-name"
            value="brief">` to the form.

         C) Custom PHP / Node endpoint:
            const fd = new FormData(form);
            files.forEach(f => fd.append('attachments[]', f));
            fetch('/api/submit-brief', { method: 'POST', body: fd })
              .then(r => r.json()).then(showSuccess).catch(showError);
         ============================================================ */

      // Simulate success
      form.style.display = 'none';
      if (success) {
        success.classList.add('show');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Reset file array (the input would be reset on form reset too)
      files = [];
    });

    // Clear errors as user types
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => {
        const g = field.closest('.form-group');
        if (g) g.classList.remove('has-error');
      });
    });
  }

  function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ------------------------------------------------------------------
     11. BLOG FILTER + SEARCH
  ------------------------------------------------------------------ */
  function initBlogFilter() {
    const grid = document.querySelector('[data-blog-grid]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.blog-card'));
    const tags = document.querySelectorAll('[data-blog-filter]');
    const search = document.querySelector('[data-blog-search]');

    const apply = () => {
      const activeTag = document.querySelector('[data-blog-filter].active');
      const cat = activeTag ? activeTag.dataset.blogFilter : 'all';
      const term = (search ? search.value : '').toLowerCase().trim();

      let visible = 0;
      cards.forEach(c => {
        const matchesCat = cat === 'all' || (c.dataset.cat || '').toLowerCase() === cat.toLowerCase();
        const matchesTerm = !term || (c.textContent || '').toLowerCase().includes(term);
        const show = matchesCat && matchesTerm;
        c.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      const empty = grid.parentElement.querySelector('.blog-empty');
      if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
    };

    tags.forEach(tag => {
      tag.addEventListener('click', () => {
        tags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        apply();
      });
    });
    if (search) {
      search.addEventListener('input', apply);
      const form = search.closest('form');
      if (form) form.addEventListener('submit', e => { e.preventDefault(); apply(); });
    }
  }

  /* ------------------------------------------------------------------
     12. ANIMATED COUNTERS
  ------------------------------------------------------------------ */
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseFloat(el.dataset.counter);
      const duration = 1600;
      const start = performance.now();
      const suffix = el.dataset.suffix || '';
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const val = target * (1 - Math.pow(1 - p, 3));
        el.textContent = (target % 1 === 0 ? Math.floor(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            animate(en.target);
            obs.unobserve(en.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(c => obs.observe(c));
    } else {
      counters.forEach(animate);
    }
  }
})();
