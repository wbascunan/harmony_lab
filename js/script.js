/* ============================================================
   HARMONY LAB — script.js
   Vanilla JavaScript: menú, scroll, FAQ, formulario, modal
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   UTILIDADES
   ────────────────────────────────────────────────────────── */

/**
 * Selector corto (equivalente a querySelector)
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Selector múltiple (equivalente a querySelectorAll)
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {NodeList}
 */
const $$ = (selector, ctx = document) => ctx.querySelectorAll(selector);


/* ──────────────────────────────────────────────────────────
   1. NAVBAR — fija al desplazarse + activo por sección
   ────────────────────────────────────────────────────────── */
const initNavbar = () => {
  const navbar  = $('#navbar');
  const navLinks = $$('.nav-link');

  if (!navbar) return;

  // Añade clase "scrolled" al pasar cierta altura
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    highlightNavLink();
  };

  /**
   * Resalta el link del menú correspondiente a la sección visible
   */
  const highlightNavLink = () => {
    const sections = $$('section[id]');
    let currentId = '';

    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= 120) currentId = section.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentId}`);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial
};


/* ──────────────────────────────────────────────────────────
   2. MENÚ MÓVIL — hamburguesa
   ────────────────────────────────────────────────────────── */
const initMobileMenu = () => {
  const toggle  = $('#nav-toggle');
  const menu    = $('#nav-menu');
  const navLinks = $$('.nav-link');

  if (!toggle || !menu) return;

  // Abrir/cerrar menú
  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !menu.classList.contains('is-open');
    toggle.classList.toggle('is-open', isOpen);
    menu.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => toggleMenu());

  // Cerrar al hacer clic en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Cerrar al hacer clic fuera del menú
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      toggleMenu(false);
      toggle.focus();
    }
  });
};


/* ──────────────────────────────────────────────────────────
   3. SCROLL SUAVE — links con href="#..."
   ────────────────────────────────────────────────────────── */
const initSmoothScroll = () => {
  // CSS scroll-behavior:smooth ya maneja la mayoría de casos.
  // Esta función resuelve casos especiales y offsets personalizados.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    // Usa scrollIntoView con bloque start para respetar scroll-margin-top
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Actualiza URL sin salto
    history.pushState(null, '', `#${targetId}`);
  });
};


/* ──────────────────────────────────────────────────────────
   4. ANIMACIONES AL HACER SCROLL — Intersection Observer
   ────────────────────────────────────────────────────────── */
const initScrollAnimations = () => {
  const elements = $$('.scroll-reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  window.__hlRevealObserver = observer;
  elements.forEach(el => observer.observe(el));
};


/* ──────────────────────────────────────────────────────────
   5. CATÁLOGO DE PRESETS — renderizado, filtros y modal
   ────────────────────────────────────────────────────────── */

const getConfig = () => window.HARMONY_LAB_CONFIG || { products: [], categories: [], contact: {}, badgeLabels: {} };

/** Cache en runtime: productos del catálogo (Firestore o fallback) */
let catalogProducts = null;
let catalogSource = 'config';

const getCatalogProducts = () => catalogProducts || getConfig().products || [];

const setCatalogProducts = (products, source = 'config') => {
  catalogProducts = products;
  catalogSource = source;
  if (window.HARMONY_LAB_CONFIG) {
    window.HARMONY_LAB_CONFIG.products = products;
  }
};

const applyTemplate = (template, vars = {}) => {
  let text = String(template || '');
  Object.entries(vars).forEach(([key, value]) => {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value ?? ''));
  });
  return text;
};

const applySiteSettings = (settings) => {
  if (!settings || !window.HARMONY_LAB_CONFIG) return;
  const cfg = window.HARMONY_LAB_CONFIG;
  cfg.contact = {
    ...cfg.contact,
    whatsapp: settings.whatsappNumber || cfg.contact.whatsapp,
    whatsappDisplay: settings.whatsappDisplay || cfg.contact.whatsappDisplay,
    brandName: settings.brandName || cfg.contact.brandName,
  };
  cfg.whatsappTemplates = {
    buy: settings.whatsappBuyTemplate,
    consult: settings.whatsappConsultTemplate,
    class: settings.whatsappClassTemplate,
  };
  cfg.classesInfo = {
    ...cfg.classesInfo,
    subtitle: settings.classesSubtitle || cfg.classesInfo?.subtitle,
    presencialCities: Array.isArray(settings.presencialCities) && settings.presencialCities.length
      ? settings.presencialCities
      : cfg.classesInfo?.presencialCities,
    onlineLabel: settings.onlineLabel || cfg.classesInfo?.onlineLabel,
  };
};

/**
 * Mensaje de contacto para WhatsApp
 */
const buildContactMessage = (name, contact, message) => {
  const { brandName } = getConfig().contact;
  let text = `Hola ${brandName}, soy ${name}.\n\n${message}`;
  if (contact) text += `\n\n📩 Contacto: ${contact}`;
  return text;
};

/**
 * Genera URL de WhatsApp con mensaje precargado
 * @param {string} message
 * @returns {string}
 */
const buildWhatsAppUrl = (message, phoneOverride = null) => {
  const { whatsapp } = getConfig().contact;
  const phone = String(phoneOverride || whatsapp || '').replace(/\D/g, '');
  if (!phone) return '#';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

/**
 * Mensaje de compra para WhatsApp
 */
const buildBuyMessage = (product) => {
  if (product.whatsappMessage && String(product.whatsappMessage).trim()) {
    return applyTemplate(product.whatsappMessage, {
      presetName: product.name,
      name: product.name,
      platform: product.platform || '',
      brandName: getConfig().contact.brandName || 'Harmony Lab',
    });
  }
  const tpl = getConfig().whatsappTemplates?.buy
    || 'Hola {{brandName}}, me interesa el preset {{presetName}} para {{platform}}.';
  return applyTemplate(tpl, {
    brandName: getConfig().contact.brandName || 'Harmony Lab',
    presetName: product.name,
    platform: product.platform || '',
  });
};

/**
 * Mensaje de consulta para WhatsApp
 */
const buildConsultMessage = (product) => {
  const tpl = getConfig().whatsappTemplates?.consult
    || 'Hola {{brandName}}, tengo una consulta sobre el preset {{presetName}} para {{platform}}.';
  return applyTemplate(tpl, {
    brandName: getConfig().contact.brandName || 'Harmony Lab',
    presetName: product.name,
    platform: product.platform || '',
  });
};

/**
 * Icono principal según tipo de thumb
 */
const THUMB_ICONS = {
  ambient:    'fa-cloud',
  modulation: 'fa-circle-notch',
  drive:      'fa-fire',
  worship:    'fa-star',
  pack:       'fa-box-open',
  helix:      'fa-sliders',
};

/**
 * Renderiza etiquetas destacadas
 */
const renderBadges = (badges) => {
  const { badgeLabels } = getConfig();
  return badges.map(key => {
    const badge = badgeLabels[key];
    if (!badge) return '';
    return `<span class="product-tag ${badge.class}">${badge.label}</span>`;
  }).join('');
};

/**
 * Formatea precio (null = consultar, 0 / free = gratis)
 */
const formatPrice = (price, product = null) => {
  if (product?.free || price === 0) {
    return '<span class="preset-price preset-price--free">Gratis</span>';
  }
  if (price === null || price === undefined) {
    return '<span class="preset-price preset-price--consult">Consultar</span>';
  }
  return `<span class="preset-price" aria-label="Precio: ${price} dólares">$${price.toFixed(2)}</span>`;
};

/**
 * Miniatura de producto: imagen real o placeholder con icono
 */
const renderProductImage = (product, { modal = false } = {}) => {
  if (product.image) {
    const cls = modal
      ? 'modal-product__thumb preset-thumb preset-thumb--photo'
      : 'preset-thumb preset-thumb--photo';
    return `
      <div class="${cls}" aria-hidden="true">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
    `;
  }

  const thumbIcon = THUMB_ICONS[product.thumb] || 'fa-music';
  const cls = modal
    ? `modal-product__thumb preset-thumb preset-thumb--${product.thumb}`
    : `preset-thumb preset-thumb--${product.thumb}`;

  return `
    <div class="${cls}" aria-hidden="true">
      <i class="fas ${thumbIcon}"></i>
    </div>
  `;
};

/**
 * HTML de una tarjeta de producto
 */
const renderProductCard = (product, index) => {
  const delayClass = index % 4 > 0 ? ` scroll-reveal--delay-${index % 4}` : '';
  const badgeClass = product.category.startsWith('helix') ? 'preset-badge--helix'
    : product.category === 'headrush' ? 'preset-badge--headrush'
    : product.category === 'zoom' ? 'preset-badge--zoom'
    : product.category === 'gratis' ? 'preset-badge--free'
    : '';

  const footerAction = product.free && product.downloadUrl
    ? `<a href="${product.downloadUrl}" class="btn btn--download btn--sm" target="_blank" rel="noopener noreferrer">
         <i class="fas fa-download"></i> Descargar gratis
       </a>`
    : `<button class="btn btn--outline btn--sm" type="button" data-action="detail" data-product-id="${product.id}">
         Ver detalles
       </button>`;

  return `
    <article
      class="preset-card scroll-reveal${delayClass}"
      data-category="${product.category}"
      data-product-id="${product.id}"
      aria-label="Preset ${product.name}"
    >
      <button class="preset-card__trigger" type="button" aria-label="Ver detalles de ${product.name}">
        <div class="preset-card__image">
          ${renderProductImage(product)}
          <span class="preset-badge ${badgeClass}">${product.platform}</span>
          ${product.badges.length ? `<div class="preset-card__tags">${renderBadges(product.badges.slice(0, 2))}</div>` : ''}
        </div>
        <div class="preset-card__body">
          <h3 class="preset-card__title">${product.name}</h3>
          <p class="preset-card__desc">${product.shortDesc}</p>
          <ul class="preset-card__compat" aria-label="Compatibilidad">
            ${product.compatibility.slice(0, 2).map(c => `<li>${c}</li>`).join('')}
            ${product.compatibility.length > 2 ? `<li>+${product.compatibility.length - 2} más</li>` : ''}
          </ul>
        </div>
      </button>
      <div class="preset-card__footer">
        ${formatPrice(product.price, product)}
        <div class="preset-card__actions">
          ${footerAction}
          ${product.free ? `
            <button class="btn btn--outline btn--sm" type="button" data-action="detail" data-product-id="${product.id}">
              Ver detalles
            </button>
          ` : ''}
        </div>
      </div>
    </article>
  `;
};

/**
 * Renderiza filtros y grid de productos
 */
const renderCatalog = () => {
  const { categories } = getConfig();
  const products = getCatalogProducts();
  const filtersEl = $('#preset-filters');
  const gridEl    = $('#presets-grid');

  if (!filtersEl || !gridEl) return;

  const cats = deriveCategories(products, categories);

  filtersEl.innerHTML = cats.map((cat, i) => `
    <button
      class="filter-btn${i === 0 ? ' filter-btn--active' : ''}"
      data-filter="${cat.id}"
      type="button"
    >${cat.label}</button>
  `).join('');

  if (!products.length) {
    gridEl.innerHTML = `
      <div class="catalog-state catalog-state--empty" role="status">
        <i class="fas fa-sliders" aria-hidden="true"></i>
        <p>Pronto publicaremos nuevos presets.</p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = products.map((p, i) => renderProductCard(p, i)).join('');
};

const deriveCategories = (products, baseCategories) => {
  const base = Array.isArray(baseCategories) && baseCategories.length
    ? baseCategories
    : [{ id: 'all', label: 'Todos' }];
  const present = new Set(products.map((p) => p.category).filter(Boolean));
  return base.filter((c) => c.id === 'all' || present.has(c.id));
};

const setCatalogStatus = (state, message = '') => {
  const el = $('#catalog-status');
  if (!el) return;
  el.hidden = state === 'ready';
  el.dataset.state = state;
  el.textContent = message;
};

/**
 * Busca producto por ID
 */
const getProductById = (id) => getCatalogProducts().find(p => p.id === id);

/**
 * Renderiza contenido del modal de producto
 */
const renderProductModal = (product) => {
  const includesList = product.includes.map(item =>
    `<li><i class="fas fa-check" aria-hidden="true"></i>${item}</li>`
  ).join('');

  const compatList = product.compatibility.map(c =>
    `<li>${c}</li>`
  ).join('');

  const featuresGrid = product.features.map(f => `
    <div class="modal-feature">
      <span class="modal-feature__icon" aria-hidden="true"><i class="fas ${f.icon}"></i></span>
      <span class="modal-feature__label">${f.label}</span>
    </div>
  `).join('');

  let presetsBlock = '';
  if (product.presets?.length) {
    presetsBlock = `
      <div class="modal-section">
        <h4 class="modal-section__title"><i class="fas fa-list"></i> Presets incluidos</h4>
        <ul class="modal-preset-list">${product.presets.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
    `;
  }
  if (product.snapshots?.length) {
    presetsBlock = `
      <div class="modal-section">
        <h4 class="modal-section__title"><i class="fas fa-camera"></i> Snapshots</h4>
        <ul class="modal-preset-list">${product.snapshots.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>
    `;
  }

  const priceHtml = product.free || product.price === 0
    ? `<p class="modal-product-price modal-product-price--free">Gratis</p>`
    : product.price != null
      ? `<p class="modal-product-price">$${product.price.toFixed(2)} USD</p>`
      : '';

  const waPhone = product.whatsappNumber || null;
  const modalActions = product.free && product.downloadUrl
    ? `
      <a
        href="${product.downloadUrl}"
        class="btn btn--download btn--full"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="fas fa-download"></i> Descargar gratis en Tone3000
      </a>
      <a
        href="${buildWhatsAppUrl(buildConsultMessage(product), waPhone)}"
        class="btn btn--outline btn--full"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="fas fa-comment-dots"></i> Consultar
      </a>
    `
    : `
      <a
        href="${buildWhatsAppUrl(buildBuyMessage(product), waPhone)}"
        class="btn btn--whatsapp btn--full"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="fab fa-whatsapp"></i> Pedir por WhatsApp
      </a>
      <a
        href="${buildWhatsAppUrl(buildConsultMessage(product), waPhone)}"
        class="btn btn--outline btn--full"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="fas fa-comment-dots"></i> Consultar
      </a>
    `;

  return `
    <div class="modal-product__hero${product.image ? ' modal-product__hero--with-photo' : ''}">
      ${renderProductImage(product, { modal: true })}
      <div class="modal-product__header">
        <span class="preset-badge">${product.platform}</span>
        <div class="modal-product__tags">${renderBadges(product.badges)}</div>
        <h3 class="modal-product__title" id="product-modal-title">${product.name}</h3>
        ${priceHtml}
      </div>
    </div>

    <p class="modal-product__desc">${product.description}</p>

    <div class="modal-features" aria-label="Características">${featuresGrid}</div>

    <div class="modal-section">
      <h4 class="modal-section__title"><i class="fas fa-box-open"></i> Qué incluye</h4>
      <ul class="modal-includes">${includesList}</ul>
    </div>

    ${presetsBlock}

    <div class="modal-section">
      <h4 class="modal-section__title"><i class="fas fa-plug"></i> Compatibilidad</h4>
      <ul class="modal-compat">${compatList}</ul>
    </div>

    <div class="modal-actions modal-actions--product">
      ${modalActions}
    </div>
  `;
};

/**
 * Abre modal de producto
 */
const openProductModal = (productId) => {
  const product = getProductById(productId);
  const overlay = $('#product-modal');
  const content = $('#product-modal-content');
  if (!product || !overlay || !content) return;

  content.innerHTML = renderProductModal(product);
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => overlay.classList.add('is-open'));

  setTimeout(() => {
    const closeBtn = $('#product-modal-close');
    if (closeBtn) closeBtn.focus();
  }, 100);
};

/**
 * Cierra modal de producto
 */
const closeProductModal = () => {
  const overlay = $('#product-modal');
  if (!overlay) return;

  overlay.classList.remove('is-open');
  document.body.style.overflow = '';

  setTimeout(() => { overlay.hidden = true; }, 280);
};

/**
 * Observa elementos scroll-reveal recién añadidos
 */
const observeNewRevealElements = (container) => {
  const elements = $$('.scroll-reveal', container || document);
  if (!elements.length || !window.__hlRevealObserver) return;

  elements.forEach(el => {
    if (!el.classList.contains('is-visible')) {
      window.__hlRevealObserver.observe(el);
    }
  });
};

/**
 * Inicializa catálogo, filtros, modal y acciones
 */
const initCatalog = async () => {
  const grid      = $('#presets-grid');
  const filtersEl = $('#preset-filters');
  const overlay   = $('#product-modal');
  const closeBtn  = $('#product-modal-close');

  if (!grid) return;

  setCatalogStatus('loading', 'Cargando catálogo…');
  grid.innerHTML = `
    <div class="catalog-state catalog-state--loading" role="status">
      <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
      <p>Cargando presets…</p>
    </div>
  `;

  const fallback = () => {
    setCatalogProducts(getConfig().products || [], 'config');
    setCatalogStatus('ready', '');
    renderCatalog();
    observeNewRevealElements(grid);
  };

  try {
    const HF = window.HarmonyFirebase;
    if (HF && HF.isConfigured()) {
      await HF.init();
      const remote = await HF.fetchPublishedPresets();
      if (Array.isArray(remote) && remote.length) {
        setCatalogProducts(remote, 'firestore');
        setCatalogStatus('ready', '');
        renderCatalog();
        observeNewRevealElements(grid);
      } else {
        // Firestore vacío → fallback seed local
        fallback();
      }
    } else {
      fallback();
    }
  } catch (err) {
    console.warn('[HarmonyLab] Catálogo Firestore falló, usando config local.', err?.message || err);
    setCatalogStatus('error', 'Mostrando catálogo de respaldo.');
    fallback();
  }

  /* — Filtros — */
  filtersEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    const filter = btn.dataset.filter;
    $$('.filter-btn', filtersEl).forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');

    $$('.preset-card', grid).forEach(card => {
      const matches = filter === 'all' || card.dataset.category === filter;

      if (matches) {
        card.style.display = '';
        requestAnimationFrame(() => {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
          });
        });
      } else {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => { card.style.display = 'none'; }, 400);
      }
    });
  });

  /* — Clic en tarjeta / botones — */
  grid.addEventListener('click', (e) => {
    const detailBtn = e.target.closest('[data-action="detail"]');
    if (detailBtn) {
      e.stopPropagation();
      openProductModal(detailBtn.dataset.productId);
      return;
    }

    const trigger = e.target.closest('.preset-card__trigger');
    if (trigger) {
      const card = trigger.closest('.preset-card');
      if (card) openProductModal(card.dataset.productId);
    }
  });

  /* — Modal cerrar — */
  closeBtn?.addEventListener('click', closeProductModal);

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeProductModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && !overlay.hidden) closeProductModal();
  });
};


/* ──────────────────────────────────────────────────────────
   5c. CLASES — renderizado y WhatsApp
   ────────────────────────────────────────────────────────── */

const buildClassMessage = (className) => {
  const tpl = getConfig().whatsappTemplates?.class
    || 'Hola {{brandName}}, me interesa tomar clases de {{className}}.';
  return applyTemplate(tpl, {
    brandName: getConfig().contact.brandName || 'Harmony Lab',
    className,
  });
};

const renderClassCard = (classItem, index) => {
  const delayClass = index % 4 > 0 ? ` scroll-reveal--delay-${index % 4}` : '';
  const { presencialCities } = getConfig().classesInfo || {};
  const waUrl = buildWhatsAppUrl(buildClassMessage(classItem.name));
  const hasImage = Boolean(classItem.image);

  const cityTags = (presencialCities || []).map(city => `
    <span class="class-tag class-tag--city"><i class="fas fa-map-marker-alt"></i> ${city}</span>
  `).join('');

  const imageBlock = hasImage ? `
    <div class="class-card__image">
      <img src="${classItem.image}" alt="Clases de ${classItem.name}" loading="lazy" />
    </div>
  ` : `
    <div class="class-card__icon" aria-hidden="true">
      <span class="class-emoji">${classItem.emoji}</span>
      <div class="class-icon-ring"></div>
    </div>
  `;

  return `
    <article class="class-card${hasImage ? ' class-card--has-image' : ''} scroll-reveal${delayClass}" aria-label="Clases de ${classItem.name}">
      ${imageBlock}
      <div class="class-card__body">
        <h3 class="class-card__title">${classItem.name}</h3>
        <p class="class-card__desc">${classItem.description}</p>
        <div class="class-meta">
          <span class="class-tag class-tag--online"><i class="fas fa-globe"></i> Online</span>
          ${cityTags}
        </div>
        <a href="${waUrl}" class="btn btn--class btn--class-wa" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-whatsapp"></i> Solicitar por WhatsApp
        </a>
      </div>
    </article>
  `;
};

const initClasses = () => {
  const { classesInfo, classes } = getConfig();
  const subtitleEl  = $('#classes-subtitle');
  const locationsEl = $('#classes-locations');
  const gridEl      = $('#classes-grid');

  if (subtitleEl && classesInfo?.subtitle) {
    subtitleEl.textContent = classesInfo.subtitle;
  }

  if (locationsEl && classesInfo) {
    const cities = (classesInfo.presencialCities || []).join(' · ');
    locationsEl.innerHTML = `
      <div class="classes-location-card classes-location-card--presential">
        <span class="classes-location-card__icon" aria-hidden="true"><i class="fas fa-map-marker-alt"></i></span>
        <div>
          <strong>Presencial</strong>
          <span>${cities}</span>
        </div>
      </div>
      <div class="classes-location-card classes-location-card--online">
        <span class="classes-location-card__icon" aria-hidden="true"><i class="fas fa-globe"></i></span>
        <div>
          <strong>Online</strong>
          <span>${classesInfo.onlineLabel || ''}</span>
        </div>
      </div>
    `;
  }

  if (gridEl && classes?.length) {
    gridEl.innerHTML = classes.map((c, i) => renderClassCard(c, i)).join('');
    observeNewRevealElements(gridEl);
  }
};

const escapeText = (str) => {
  if (window.HarmonyFirebase?.escapeHtml) return window.HarmonyFirebase.escapeHtml(str);
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const renderTestimonialCard = (t, index) => {
  const delay = index % 3 > 0 ? ` scroll-reveal--delay-${index % 3}` : '';
  const stars = Math.min(5, Math.max(1, Number(t.stars) || 5));
  const starsHtml = Array.from({ length: stars }, () => '<i class="fas fa-star"></i>').join('');
  const text = escapeText(t.text || '');
  const quoted = text.startsWith('"') ? text : `"${text}"`;
  return `
    <blockquote class="testimonial-card scroll-reveal${delay}">
      <div class="testimonial-stars" aria-label="${stars} estrellas">${starsHtml}</div>
      <p class="testimonial-text">${quoted}</p>
      <footer class="testimonial-author">
        <div class="author-avatar" aria-hidden="true">
          <span>${escapeText(t.authorInitials || 'HL')}</span>
        </div>
        <div>
          <cite class="author-name">${escapeText(t.authorName || '')}</cite>
          <span class="author-role">${escapeText(t.authorRole || '')}</span>
        </div>
      </footer>
    </blockquote>
  `;
};

const initTestimonials = () => {
  const grid = $('#testimonials-grid');
  if (!grid) return;
  const list = getConfig().testimonials || [];
  if (!list.length) {
    grid.innerHTML = '';
    return;
  }
  grid.innerHTML = list.map((t, i) => renderTestimonialCard(t, i)).join('');
  observeNewRevealElements(grid);
};

/**
 * Carga settings / categorías / clases / testimonios desde Firestore (con fallback).
 */
const initRemoteContent = async () => {
  const HF = window.HarmonyFirebase;
  if (!HF || !HF.isConfigured()) {
    initSiteContact();
    initClasses();
    initTestimonials();
    return;
  }

  try {
    await HF.init();
    const [settings, categories, classes, testimonials] = await Promise.all([
      HF.fetchSiteSettings().catch(() => null),
      HF.fetchCategories({ publishedOnly: true }).catch(() => null),
      HF.fetchClasses({ publishedOnly: true }).catch(() => null),
      HF.fetchTestimonials({ publishedOnly: true }).catch(() => null),
    ]);

    if (settings) applySiteSettings(settings);

    if (window.HARMONY_LAB_CONFIG) {
      if (Array.isArray(categories) && categories.length) {
        window.HARMONY_LAB_CONFIG.categories = categories.map((c) => ({ id: c.id, label: c.label }));
      }
      if (Array.isArray(classes) && classes.length) {
        window.HARMONY_LAB_CONFIG.classes = classes;
      }
      if (Array.isArray(testimonials) && testimonials.length) {
        window.HARMONY_LAB_CONFIG.testimonials = testimonials;
      }
    }
  } catch (err) {
    console.warn('[HarmonyLab] Contenido remoto falló, usando config local.', err?.message || err);
  }

  initSiteContact();
  initClasses();
  initTestimonials();
};

/**
 * Sincroniza logo y textos de marca desde config.js
 */
const initBrand = () => {
  const { brand } = getConfig();
  if (!brand) return;

  $$('[data-logo]').forEach(img => {
    img.src = brand.logo;
    img.alt = brand.logoAlt;
  });

  const tagline = $('#footer-tagline');
  if (tagline && brand.tagline) tagline.textContent = brand.tagline;
};

/**
 * Sincroniza enlaces y texto de WhatsApp desde config.js
 */
const initSiteContact = () => {
  const { whatsapp, whatsappDisplay, instagram, instagramHandle } = getConfig().contact;
  const waUrl = `https://wa.me/${whatsapp}`;

  $$('[data-wa-link]').forEach(el => { el.href = waUrl; });
  $$('[data-wa-display]').forEach(el => { el.textContent = whatsappDisplay; });

  if (instagram) {
    $$('[data-ig-link]').forEach(el => { el.href = instagram; });
  }
  if (instagramHandle) {
    $$('[data-ig-handle]').forEach(el => { el.textContent = instagramHandle; });
  }
};


/* ──────────────────────────────────────────────────────────
   6. FAQ — ACORDEÓN
   ────────────────────────────────────────────────────────── */
const initFaq = () => {
  const faqItems = $$('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = $('.faq-question', item);
    const answer   = $('.faq-answer',   item);

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Opción: cerrar todos antes de abrir (comportamiento acordeón estricto)
      // Descomenta las siguientes líneas si prefieres solo una abierta a la vez:
      // faqItems.forEach(otherItem => {
      //   const otherQ = $('.faq-question', otherItem);
      //   const otherA = $('.faq-answer',   otherItem);
      //   if (otherQ && otherA && otherQ !== question) {
      //     otherQ.setAttribute('aria-expanded', 'false');
      //     otherA.hidden = true;
      //   }
      // });

      // Toggle actual
      question.setAttribute('aria-expanded', !isOpen);
      answer.hidden = isOpen;

      // Forzar re-render para que la transición CSS funcione
      if (!isOpen) {
        // Mostrar primero (quita hidden), luego aplica max-height via CSS
        answer.hidden = false;
      }
    });
  });
};


/* ──────────────────────────────────────────────────────────
   7. FORMULARIO DE CONTACTO → WhatsApp
   ────────────────────────────────────────────────────────── */
const initContactForm = () => {
  const form       = $('#contact-form');
  if (!form) return;

  const nameInput    = $('#contact-name');
  const contactInput = $('#contact-email');
  const msgInput     = $('#contact-message');
  const successMsg   = $('#form-success');

  const errorEls = {
    name:    $('#error-name'),
    email:   $('#error-email'),
    message: $('#error-message'),
  };

  const setError = (field, msg) => {
    const input = form.querySelector(`#contact-${field}`);
    const errEl = errorEls[field];
    if (input) input.classList.add('is-invalid');
    if (errEl) errEl.textContent = msg;
  };

  const clearError = (field) => {
    const input = form.querySelector(`#contact-${field}`);
    const errEl = errorEls[field];
    if (input) input.classList.remove('is-invalid');
    if (errEl) errEl.textContent = '';
  };

  [nameInput, contactInput, msgInput].forEach(input => {
    if (!input) return;
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      const field = input.id.replace('contact-', '');
      clearError(field);
    });
  });

  const validateField = (input) => {
    const field = input.id.replace('contact-', '');
    const value = input.value.trim();
    clearError(field);

    if (field === 'email') return true;

    if (!value) {
      setError(field, 'Este campo es obligatorio.');
      return false;
    }
    if (field === 'name' && value.length < 2) {
      setError('name', 'El nombre debe tener al menos 2 caracteres.');
      return false;
    }
    if (field === 'message' && value.length < 10) {
      setError('message', 'El mensaje debe tener al menos 10 caracteres.');
      return false;
    }
    return true;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const validName = validateField(nameInput);
    const validMsg  = validateField(msgInput);

    if (!validName || !validMsg) return;

    const name    = nameInput.value.trim();
    const contact = contactInput.value.trim();
    const message = msgInput.value.trim();
    const waUrl   = buildWhatsAppUrl(buildContactMessage(name, contact, message));

    window.open(waUrl, '_blank', 'noopener,noreferrer');

    form.reset();
    successMsg.hidden = false;
    setTimeout(() => { successMsg.hidden = true; }, 5000);
  });
};


/* ──────────────────────────────────────────────────────────
   8. BOTÓN VOLVER ARRIBA
   ────────────────────────────────────────────────────────── */
const initBackToTop = () => {
  const btn = $('#back-to-top');
  if (!btn) return;

  // Mostrar/ocultar según scroll
  const onScroll = () => {
    if (window.scrollY > 500) {
      btn.hidden = false;
      btn.removeAttribute('hidden');
    } else {
      btn.hidden = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};


/* ──────────────────────────────────────────────────────────
   10. AÑO ACTUAL EN FOOTER
   ────────────────────────────────────────────────────────── */
const initFooterYear = () => {
  const yearEl = $('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
};


/* ──────────────────────────────────────────────────────────
   11. EFECTO PARALLAX SUAVE EN HERO (opcional)
   ────────────────────────────────────────────────────────── */
const initHeroParallax = () => {
  const heroGlows = $$('.hero-glow');
  if (!heroGlows.length) return;

  // Usa requestAnimationFrame para no bloquear el hilo principal
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        heroGlows.forEach((glow, i) => {
          const speed = i === 0 ? 0.15 : 0.08;
          glow.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
};


/* ──────────────────────────────────────────────────────────
   12. CONTADOR ANIMADO EN STATS DEL HERO
   ────────────────────────────────────────────────────────── */
const initStatCounters = () => {
  const stats = $$('.stat__number');
  if (!stats.length) return;

  // Función de interpolación (ease-out)
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const rawText   = el.textContent.trim();          // ej. "200+"
    const suffix    = rawText.replace(/[0-9]/g, '');  // ej. "+"
    const target    = parseInt(rawText, 10);          // ej. 200
    const duration  = 1200; // ms
    const startTime = performance.now();

    const update = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  // Observer: animar solo cuando sea visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(stat => observer.observe(stat));
};


/* ──────────────────────────────────────────────────────────
   INICIALIZACIÓN
   Ejecutar todo cuando el DOM esté listo
   ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initBrand();
  initRemoteContent();
  initCatalog();
  initFaq();
  initContactForm();
  initBackToTop();
  initFooterYear();
  initHeroParallax();
  initStatCounters();

  // Log de inicio (solo desarrollo)
  console.log('%c🎸 Harmony Lab — Iniciado correctamente', 'color:#FF8300;font-weight:bold;');
});
