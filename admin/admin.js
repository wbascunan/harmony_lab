/* ============================================================
   HARMONY LAB — admin.js
   Panel administrativo (Auth + Custom Claims + Firestore CRUD)
   ============================================================ */

'use strict';

(() => {
  const HF = window.HarmonyFirebase;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  const state = {
    user: null,
    isAdmin: false,
    presets: [],
    editingId: null,
    deleteId: null,
  };

  const screens = {
    loading: $('#screen-loading'),
    login: $('#screen-login'),
    denied: $('#screen-denied'),
    dashboard: $('#screen-dashboard'),
  };

  const showScreen = (name) => {
    Object.entries(screens).forEach(([k, el]) => {
      if (el) el.hidden = k !== name;
    });
  };

  const showView = (view) => {
    $$('.admin-view').forEach((el) => { el.hidden = true; });
    const target = $(`#view-${view}`);
    if (target) target.hidden = false;
    $$('.admin-nav__btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.view === view || (view === 'form' && btn.dataset.new));
    });
  };

  const setError = (id, msg) => {
    const el = $(id);
    if (!el) return;
    if (!msg) { el.hidden = true; el.textContent = ''; return; }
    el.hidden = false;
    el.textContent = msg;
  };

  const slugify = (text) => String(text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  const formatPriceLabel = (p) => {
    if (p.free || p.price === 0) return 'Gratis';
    if (p.price == null) return 'Consultar';
    return `$${Number(p.price).toFixed(2)}`;
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return '—'; }
  };

  const linesToArray = (text) => String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 30);

  const arrayToLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');

  const writeAudit = async (action, presetId) => {
    const db = HF.getDb();
    const user = HF.getAuth()?.currentUser;
    if (!db || !user) return;
    try {
      await db.collection('adminAuditLogs').add({
        action,
        presetId: String(presetId || ''),
        adminUid: user.uid,
        adminEmail: user.email || '',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.warn('[Admin] audit log fail:', e.message);
    }
  };

  const loadPresets = async () => {
    state.presets = await HF.fetchAllPresets();
    updateStats();
    renderTable();
  };

  const updateStats = () => {
    const pub = state.presets.filter((p) => p.published).length;
    const draft = state.presets.length - pub;
    $('#stat-published').textContent = String(pub);
    $('#stat-draft').textContent = String(draft);
    $('#stat-total').textContent = String(state.presets.length);
  };

  const filteredPresets = () => {
    const q = ($('#list-search')?.value || '').trim().toLowerCase();
    const st = $('#list-filter-status')?.value || 'all';
    return state.presets.filter((p) => {
      if (st === 'published' && !p.published) return false;
      if (st === 'draft' && p.published) return false;
      if (q && !String(p.name).toLowerCase().includes(q)) return false;
      return true;
    });
  };

  const renderTable = () => {
    const tbody = $('#presets-tbody');
    if (!tbody) return;
    const rows = filteredPresets();
    tbody.textContent = '';

    if (!rows.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 8;
      td.textContent = 'No hay presets.';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    rows.forEach((p) => {
      const tr = document.createElement('tr');

      const tdImg = document.createElement('td');
      if (p.image) {
        const img = document.createElement('img');
        img.className = 'admin-thumb';
        img.alt = '';
        img.src = p.image.startsWith('http') || p.image.startsWith('/') ? p.image : `../${p.image}`;
        tdImg.appendChild(img);
      }
      tr.appendChild(tdImg);

      const addText = (text) => {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      };

      addText(p.name);
      addText(formatPriceLabel(p));
      addText(p.platform);
      addText(p.category);

      const tdStatus = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `admin-badge ${p.published ? 'admin-badge--pub' : 'admin-badge--draft'}`;
      badge.textContent = p.published ? 'Publicado' : 'Borrador';
      tdStatus.appendChild(badge);
      tr.appendChild(tdStatus);

      addText(formatDate(p.updatedAt));

      const tdAct = document.createElement('td');
      const wrap = document.createElement('div');
      wrap.className = 'admin-row-actions';

      const mkBtn = (label, cls, onClick) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `admin-btn admin-btn--sm ${cls}`;
        b.textContent = label;
        b.addEventListener('click', onClick);
        wrap.appendChild(b);
      };

      mkBtn('Editar', 'admin-btn--outline', () => openForm(p.id));
      mkBtn('Duplicar', 'admin-btn--outline', () => duplicatePreset(p.id));
      mkBtn(p.published ? 'Ocultar' : 'Publicar', 'admin-btn--outline', () => togglePublish(p.id));
      mkBtn('Eliminar', 'admin-btn--danger', () => askDelete(p.id, p.name));

      tdAct.appendChild(wrap);
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });
  };

  const resetForm = () => {
    state.editingId = null;
    $('#preset-form').reset();
    $('#f-id').value = '';
    $('#f-slug').disabled = false;
    $('#f-price-wrap').hidden = true;
    $('#f-image-preview').hidden = true;
    $('#f-image-preview').removeAttribute('src');
    $('#form-title').textContent = 'Nuevo preset';
    setError('#form-error', '');
    $('#form-success').hidden = true;
  };

  const openForm = (id = null) => {
    resetForm();
    showView('form');
    if (!id) return;

    const p = state.presets.find((x) => x.id === id);
    if (!p) return;
    state.editingId = id;
    $('#form-title').textContent = `Editar: ${p.name}`;
    $('#f-id').value = id;
    $('#f-name').value = p.name || '';
    $('#f-slug').value = p.slug || id;
    $('#f-slug').disabled = true;
    $('#f-platform').value = p.platform || '';
    $('#f-category').value = p.category || 'podgo';
    $('#f-short').value = p.shortDesc || '';
    $('#f-desc').value = p.description || '';
    $('#f-includes').value = arrayToLines(p.includes);
    $('#f-compat').value = arrayToLines(p.compatibility);
    $('#f-badges').value = (p.badges || []).join(', ');
    $('#f-thumb').value = p.thumb || 'pack';
    $('#f-sort').value = String(p.sortOrder ?? 0);
    $('#f-imageUrl').value = p.image || '';
    $('#f-downloadUrl').value = p.downloadUrl || '';
    $('#f-wa-number').value = p.whatsappNumber || '';
    $('#f-wa-msg').value = p.whatsappMessage || '';
    $('#f-published').checked = Boolean(p.published);
    $('#f-featured').checked = Boolean(p.featured);
    $('#f-free').checked = Boolean(p.free);

    if (p.free || p.price === 0) {
      $('#f-price-mode').value = 'free';
    } else if (p.price == null) {
      $('#f-price-mode').value = 'consult';
    } else {
      $('#f-price-mode').value = 'fixed';
      $('#f-price-wrap').hidden = false;
      $('#f-price').value = String(p.price);
    }

    if (p.image) {
      const preview = $('#f-image-preview');
      preview.src = p.image.startsWith('http') || p.image.startsWith('/') ? p.image : `../${p.image}`;
      preview.hidden = false;
    }
  };

  const collectFormData = () => {
    const mode = $('#f-price-mode').value;
    let price = null;
    let free = $('#f-free').checked;
    if (mode === 'free') { price = 0; free = true; }
    else if (mode === 'fixed') {
      price = Number($('#f-price').value);
      if (Number.isNaN(price) || price < 0) throw new Error('Precio inválido.');
    }

    const slug = ($('#f-slug').value || '').trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error('Slug inválido. Usa minúsculas, números y guiones.');
    }

    const imageUrl = ($('#f-imageUrl').value || '').trim();
    const downloadUrl = ($('#f-downloadUrl').value || '').trim() || null;
    const safe = HF.safeUrl;
    if (imageUrl && !safe(imageUrl)) throw new Error('URL de imagen no permitida.');
    if (downloadUrl && !safe(downloadUrl)) throw new Error('URL de descarga no permitida.');

    const badges = ($('#f-badges').value || '')
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean)
      .slice(0, 12);

    const features = [];
    if (free || price === 0) features.push({ icon: 'fa-gift', label: 'Gratis' });
    if (badges.includes('worship')) features.push({ icon: 'fa-star', label: 'Worship' });
    if (badges.includes('ambient')) features.push({ icon: 'fa-cloud', label: 'Ambient' });
    if (!features.length) features.push({ icon: 'fa-sliders', label: 'Preset' });

    const now = firebase.firestore.FieldValue.serverTimestamp();
    const data = {
      name: ($('#f-name').value || '').trim(),
      slug,
      shortDescription: ($('#f-short').value || '').trim(),
      description: ($('#f-desc').value || '').trim(),
      price,
      currency: 'USD',
      category: $('#f-category').value,
      platform: ($('#f-platform').value || '').trim(),
      compatibleDevices: linesToArray($('#f-compat').value),
      includes: linesToArray($('#f-includes').value),
      presets: null,
      snapshots: null,
      badges,
      features: features.slice(0, 12),
      thumb: $('#f-thumb').value || 'pack',
      imageUrl: imageUrl || '',
      gallery: [],
      whatsappNumber: ($('#f-wa-number').value || '').trim() || null,
      whatsappMessage: ($('#f-wa-msg').value || '').trim() || null,
      downloadUrl,
      free,
      featured: $('#f-featured').checked,
      published: $('#f-published').checked,
      sortOrder: Number($('#f-sort').value) || 0,
      updatedAt: now,
    };

    if (!data.name || !data.shortDescription || !data.description || !data.platform) {
      throw new Error('Completa los campos obligatorios.');
    }

    return data;
  };

  const savePreset = async (e) => {
    e.preventDefault();
    setError('#form-error', '');
    $('#form-success').hidden = true;

    try {
      const data = collectFormData();
      const db = HF.getDb();
      const id = state.editingId || data.slug;

      if (state.editingId) {
        const ref = db.collection('presets').doc(id);
        const prev = await ref.get();
        if (!prev.exists) throw new Error('Preset no encontrado.');
        data.createdAt = prev.data().createdAt;
        await ref.update(data);
        const pubChanged = Boolean(prev.data().published) !== Boolean(data.published);
        await writeAudit(
          pubChanged
            ? (data.published ? 'preset_published' : 'preset_unpublished')
            : 'preset_updated',
          id
        );
      } else {
        const ref = db.collection('presets').doc(id);
        const exists = await ref.get();
        if (exists.exists) throw new Error('Ya existe un preset con ese slug.');
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await ref.set(data);
        await writeAudit('preset_created', id);
        if (data.published) await writeAudit('preset_published', id);
      }

      $('#form-success').hidden = false;
      $('#form-success').textContent = 'Guardado correctamente.';
      await loadPresets();
      setTimeout(() => { showView('list'); }, 600);
    } catch (err) {
      setError('#form-error', err.message || 'Error al guardar.');
    }
  };

  const togglePublish = async (id) => {
    const p = state.presets.find((x) => x.id === id);
    if (!p) return;
    const db = HF.getDb();
    const next = !p.published;
    await db.collection('presets').doc(id).update({
      published: next,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await writeAudit(next ? 'preset_published' : 'preset_unpublished', id);
    await loadPresets();
  };

  const duplicatePreset = async (id) => {
    const p = state.presets.find((x) => x.id === id);
    if (!p) return;
    const db = HF.getDb();
    const raw = p._raw || {};
    const newSlug = `${p.slug || id}-copia-${Date.now().toString(36)}`.slice(0, 80);
    const data = {
      ...raw,
      name: `${p.name} (copia)`,
      slug: newSlug,
      published: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    // Ensure required fields from mapped product if raw incomplete
    data.shortDescription = data.shortDescription || p.shortDesc;
    data.description = data.description || p.description;
    data.compatibleDevices = data.compatibleDevices || p.compatibility || [];
    data.includes = data.includes || p.includes || [];
    data.badges = data.badges || p.badges || [];
    data.features = data.features || p.features || [];
    data.imageUrl = data.imageUrl || p.image || '';
    data.currency = data.currency || 'USD';
    data.platform = data.platform || p.platform;
    data.category = data.category || p.category;
    data.free = Boolean(data.free ?? p.free);
    data.featured = Boolean(data.featured);
    data.price = data.price === undefined ? p.price : data.price;
    data.thumb = data.thumb || p.thumb || 'pack';
    data.gallery = data.gallery || [];
    data.sortOrder = Number(data.sortOrder || 0);
    data.whatsappNumber = data.whatsappNumber ?? null;
    data.whatsappMessage = data.whatsappMessage ?? null;
    data.downloadUrl = data.downloadUrl ?? p.downloadUrl ?? null;
    data.presets = data.presets ?? null;
    data.snapshots = data.snapshots ?? null;

    await db.collection('presets').doc(newSlug).set(data);
    await writeAudit('preset_created', newSlug);
    await loadPresets();
  };

  const askDelete = (id, name) => {
    state.deleteId = id;
    $('#confirm-text').textContent = `Se eliminará permanentemente «${name}».`;
    $('#confirm-modal').hidden = false;
  };

  const confirmDelete = async () => {
    const id = state.deleteId;
    $('#confirm-modal').hidden = true;
    if (!id) return;
    const db = HF.getDb();
    await db.collection('presets').doc(id).delete();
    await writeAudit('preset_deleted', id);
    state.deleteId = null;
    await loadPresets();
  };

  const uploadImage = async () => {
    const file = $('#f-imageFile').files?.[0];
    if (!file) { setError('#form-error', 'Selecciona una imagen.'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('#form-error', 'Solo JPG, PNG o WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('#form-error', 'Máximo 5 MB.');
      return;
    }

    const presetId = state.editingId || ($('#f-slug').value || slugify($('#f-name').value) || 'temp');
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `cover-${Date.now()}.${ext}`;
    const path = `preset-images/${presetId}/${fileName}`;

    try {
      setError('#form-error', '');
      const ref = HF.getStorage().ref().child(path);
      await ref.put(file, { contentType: file.type });
      const url = await ref.getDownloadURL();
      $('#f-imageUrl').value = url;
      const preview = $('#f-image-preview');
      preview.src = url;
      preview.hidden = false;
      $('#form-success').hidden = false;
      $('#form-success').textContent = 'Imagen subida.';
    } catch (err) {
      setError('#form-error', err.message || 'Error al subir imagen.');
    }
  };

  const onAuth = async (user) => {
    try {
      state.user = user;
      if (!user) {
        state.isAdmin = false;
        showScreen('login');
        return;
      }

      $('#admin-user-email').textContent = user.email || user.uid;
      // Forzar refresh por si acabaron de asignar claim
      const admin = await HF.isAdminUser(true);
      state.isAdmin = admin;

      if (!admin) {
        showScreen('denied');
        return;
      }

      showScreen('dashboard');
      showView('home');
      try {
        await loadPresets();
      } catch (err) {
        console.error(err);
        alert('No se pudieron cargar los presets. ¿Desplegaste las Security Rules?');
      }
    } catch (err) {
      console.error('[Admin] onAuth error:', err);
      showScreen('login');
      setError('#login-error', err.message || 'Error al verificar la sesión. Recarga la página.');
    }
  };

  const wireUi = (auth) => {
    $('#login-password-toggle')?.addEventListener('click', () => {
      const input = $('#login-password');
      const btn = $('#login-password-toggle');
      const icon = btn?.querySelector('i');
      if (!input || !btn || !icon) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', show ? 'true' : 'false');
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
      btn.title = show ? 'Ocultar contraseña' : 'Mostrar contraseña';
      icon.classList.toggle('fa-eye', !show);
      icon.classList.toggle('fa-eye-slash', show);
    });

    $('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      setError('#login-error', '');
      const email = $('#login-email').value.trim();
      const password = $('#login-password').value;
      try {
        await auth.signInWithEmailAndPassword(email, password);
      } catch (err) {
        console.error('[Admin] login error:', err);
        setError('#login-error', 'No se pudo iniciar sesión. Verifica correo y contraseña.');
      }
    });

    $('#admin-logout')?.addEventListener('click', () => auth.signOut());
    $('#denied-logout')?.addEventListener('click', () => auth.signOut());

    $$('[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view === 'form' && btn.dataset.new) openForm(null);
        else if (view === 'form') showView('form');
        else showView(view);
      });
    });

    $('#f-name')?.addEventListener('input', () => {
      if (state.editingId) return;
      $('#f-slug').value = slugify($('#f-name').value);
    });

    $('#f-price-mode')?.addEventListener('change', () => {
      $('#f-price-wrap').hidden = $('#f-price-mode').value !== 'fixed';
    });

    $('#preset-form')?.addEventListener('submit', savePreset);
    $('#btn-upload-image')?.addEventListener('click', uploadImage);
    $('#list-search')?.addEventListener('input', renderTable);
    $('#list-filter-status')?.addEventListener('change', renderTable);
    $('#confirm-yes')?.addEventListener('click', confirmDelete);
    $('#confirm-no')?.addEventListener('click', () => { $('#confirm-modal').hidden = true; state.deleteId = null; });
  };

  const init = async () => {
    // Si Auth tarda demasiado, no dejar la UI colgada
    const loadingWatchdog = setTimeout(() => {
      if (!screens.loading?.hidden) {
        showScreen('login');
        setError('#login-error', 'Firebase tarda en responder. Revisa la consola (F12) o recarga.');
      }
    }, 10000);

    try {
      if (!HF || !HF.isConfigured()) {
        clearTimeout(loadingWatchdog);
        showScreen('login');
        setError('#login-error', 'Firebase no está configurado. Edita js/firebase-config.js (useFirebase: true y credenciales).');
        return;
      }

      const initialized = await HF.init();
      const auth = HF.getAuth();

      if (!initialized || !auth) {
        clearTimeout(loadingWatchdog);
        showScreen('login');
        setError(
          '#login-error',
          `No se pudo iniciar Firebase: ${HF.getInitError() || 'SDK no disponible. ¿Bloqueó el navegador gstatic.com?'}`
        );
        return;
      }

      wireUi(auth);
      auth.onAuthStateChanged((user) => {
        clearTimeout(loadingWatchdog);
        onAuth(user);
      });
    } catch (err) {
      clearTimeout(loadingWatchdog);
      console.error('[Admin] init error:', err);
      showScreen('login');
      setError('#login-error', err.message || 'Error al iniciar el panel admin.');
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
