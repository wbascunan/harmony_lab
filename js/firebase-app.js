/* ============================================================
   HARMONY LAB — firebase-app.js
   Inicialización Firebase Web (CDN modular via compat para
   compatibilidad con sitio estático sin bundler).
   ============================================================ */

'use strict';

window.HarmonyFirebase = (() => {
  let app = null;
  let auth = null;
  let db = null;
  let storage = null;
  let ready = false;
  let initError = null;

  const cfg = () => window.HARMONY_FIREBASE_CONFIG || {};

  const isConfigured = () => {
    const c = cfg();
    return Boolean(
      c.useFirebase
      && c.apiKey
      && c.apiKey !== 'YOUR_API_KEY'
      && c.projectId
      && c.projectId !== 'YOUR_PROJECT_ID'
    );
  };

  const init = async () => {
    if (ready) return { app, auth, db, storage };
    if (!isConfigured()) {
      initError = 'Firebase no configurado (useFirebase=false o placeholders).';
      return null;
    }

    try {
      if (typeof firebase === 'undefined') {
        throw new Error('SDK Firebase no cargado');
      }

      const c = cfg();
      app = firebase.apps.length
        ? firebase.app()
        : firebase.initializeApp({
            apiKey: c.apiKey,
            authDomain: c.authDomain,
            projectId: c.projectId,
            storageBucket: c.storageBucket,
            messagingSenderId: c.messagingSenderId,
            appId: c.appId,
            measurementId: c.measurementId,
          });

      auth = firebase.auth();
      db = firebase.firestore();
      storage = firebase.storage();

      if (c.useAppCheck && c.appCheckSiteKey && c.appCheckSiteKey !== 'YOUR_RECAPTCHA_V3_SITE_KEY') {
        try {
          firebase.appCheck().activate(c.appCheckSiteKey, true);
        } catch (e) {
          console.warn('[HarmonyLab] App Check no activado:', e.message);
        }
      }

      ready = true;
      return { app, auth, db, storage };
    } catch (err) {
      initError = err.message || String(err);
      console.error('[HarmonyLab] Firebase init error:', initError);
      return null;
    }
  };

  const getInitError = () => initError;
  const getAuth = () => auth;
  const getDb = () => db;
  const getStorage = () => storage;
  const isReady = () => ready;

  /**
   * Escapa texto para insertar en HTML como text (no HTML).
   */
  const escapeHtml = (str) => {
    const s = String(str ?? '');
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /**
   * Valida URL segura para href (https, relativa assets/, o vacía).
   */
  const safeUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const u = url.trim();
    if (!u) return '';
    if (/^javascript:/i.test(u) || /^data:/i.test(u)) return '';
    if (/^https:\/\//i.test(u)) return u;
    if (/^assets\//i.test(u) || /^\//.test(u)) return u;
    return '';
  };

  /**
   * Refresca ID token (necesario tras asignar custom claim).
   */
  const refreshIdToken = async () => {
    const user = auth?.currentUser;
    if (!user) return null;
    return user.getIdToken(true);
  };

  /**
   * Obtiene claims del usuario actual.
   */
  const getClaims = async (forceRefresh = false) => {
    const user = auth?.currentUser;
    if (!user) return null;
    const token = await user.getIdTokenResult(forceRefresh);
    return token.claims || {};
  };

  const isAdminUser = async (forceRefresh = false) => {
    const claims = await getClaims(forceRefresh);
    return Boolean(claims && claims.admin === true);
  };

  /**
   * Mapea documento Firestore → forma usada por el frontend actual.
   */
  const mapPresetFromFirestore = (id, data) => ({
    id,
    category: data.category || 'all',
    platform: data.platform || '',
    name: data.name || '',
    shortDesc: data.shortDescription || '',
    description: data.description || '',
    includes: Array.isArray(data.includes) ? data.includes : [],
    presets: Array.isArray(data.presets) ? data.presets : undefined,
    snapshots: Array.isArray(data.snapshots) ? data.snapshots : undefined,
    compatibility: Array.isArray(data.compatibleDevices) ? data.compatibleDevices : [],
    badges: Array.isArray(data.badges) ? data.badges : [],
    features: Array.isArray(data.features) ? data.features : [],
    thumb: data.thumb || 'pack',
    image: data.imageUrl || '',
    price: data.price === undefined ? null : data.price,
    free: Boolean(data.free),
    downloadUrl: data.downloadUrl || null,
    whatsappNumber: data.whatsappNumber || null,
    whatsappMessage: data.whatsappMessage || null,
    featured: Boolean(data.featured),
    published: Boolean(data.published),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    slug: data.slug || id,
    currency: data.currency || 'USD',
  });

  /**
   * Carga presets publicados (catálogo público).
   */
  const fetchPublishedPresets = async () => {
    await init();
    if (!db) throw new Error(initError || 'Firestore no disponible');

    const snap = await db
      .collection('presets')
      .where('published', '==', true)
      .orderBy('sortOrder', 'asc')
      .get();

    return snap.docs.map((doc) => mapPresetFromFirestore(doc.id, doc.data()));
  };

  /**
   * Carga todos los presets (admin).
   */
  const fetchAllPresets = async () => {
    await init();
    if (!db) throw new Error(initError || 'Firestore no disponible');
    const snap = await db.collection('presets').orderBy('sortOrder', 'asc').get();
    return snap.docs.map((doc) => ({
      ...mapPresetFromFirestore(doc.id, doc.data()),
      _raw: doc.data(),
      updatedAt: doc.data().updatedAt || null,
      createdAt: doc.data().createdAt || null,
    }));
  };

  const DEFAULT_SITE_SETTINGS = {
    whatsappNumber: '593998116150',
    whatsappDisplay: '+593 99 811 6150',
    brandName: 'Harmony Lab',
    whatsappBuyTemplate: 'Hola {{brandName}}, me interesa el preset {{presetName}} para {{platform}}.',
    whatsappConsultTemplate: 'Hola {{brandName}}, tengo una consulta sobre el preset {{presetName}} para {{platform}}.',
    whatsappClassTemplate: 'Hola {{brandName}}, me interesa tomar clases de {{className}}.',
    classesSubtitle: 'Presencial en Cuenca y Guayaquil. Online al resto del mundo. Todos los niveles.',
    presencialCities: ['Cuenca', 'Guayaquil'],
    onlineLabel: 'Online al resto del mundo',
  };

  const fetchSiteSettings = async () => {
    await init();
    if (!db) throw new Error(initError || 'Firestore no disponible');
    const snap = await db.collection('siteSettings').doc('global').get();
    if (!snap.exists) return { ...DEFAULT_SITE_SETTINGS };
    return { ...DEFAULT_SITE_SETTINGS, ...snap.data() };
  };

  const fetchCategories = async ({ publishedOnly = true } = {}) => {
    await init();
    if (!db) throw new Error(initError || 'Firestore no disponible');
    let q = db.collection('categories').orderBy('sortOrder', 'asc');
    if (publishedOnly) q = q.where('published', '==', true);
    const snap = await q.get();
    return snap.docs.map((doc) => ({
      id: doc.id,
      label: doc.data().label || doc.id,
      sortOrder: doc.data().sortOrder || 0,
      published: Boolean(doc.data().published),
      createdAt: doc.data().createdAt || null,
      updatedAt: doc.data().updatedAt || null,
    }));
  };

  const fetchClasses = async ({ publishedOnly = true } = {}) => {
    await init();
    if (!db) throw new Error(initError || 'Firestore no disponible');
    let q = db.collection('classes').orderBy('sortOrder', 'asc');
    if (publishedOnly) q = q.where('published', '==', true);
    const snap = await q.get();
    return snap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || '',
      emoji: doc.data().emoji || '',
      image: doc.data().image || '',
      description: doc.data().description || '',
      sortOrder: doc.data().sortOrder || 0,
      published: Boolean(doc.data().published),
      createdAt: doc.data().createdAt || null,
      updatedAt: doc.data().updatedAt || null,
    }));
  };

  const fetchTestimonials = async ({ publishedOnly = true } = {}) => {
    await init();
    if (!db) throw new Error(initError || 'Firestore no disponible');
    let q = db.collection('testimonials').orderBy('sortOrder', 'asc');
    if (publishedOnly) q = q.where('published', '==', true);
    const snap = await q.get();
    return snap.docs.map((doc) => ({
      id: doc.id,
      text: doc.data().text || '',
      authorName: doc.data().authorName || '',
      authorRole: doc.data().authorRole || '',
      authorInitials: doc.data().authorInitials || '',
      stars: Number(doc.data().stars) || 5,
      sortOrder: doc.data().sortOrder || 0,
      published: Boolean(doc.data().published),
      createdAt: doc.data().createdAt || null,
      updatedAt: doc.data().updatedAt || null,
    }));
  };

  return {
    init,
    isConfigured,
    isReady,
    getInitError,
    getAuth,
    getDb,
    getStorage,
    escapeHtml,
    safeUrl,
    refreshIdToken,
    getClaims,
    isAdminUser,
    mapPresetFromFirestore,
    fetchPublishedPresets,
    fetchAllPresets,
    fetchSiteSettings,
    fetchCategories,
    fetchClasses,
    fetchTestimonials,
    DEFAULT_SITE_SETTINGS,
  };
})();
