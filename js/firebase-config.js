/* ============================================================
   HARMONY LAB — firebase-config.js
   Credenciales PÚBLICAS del SDK Web (seguras solo con Rules).
   NUNCA pongas service account / private_key aquí.
   ============================================================ */

'use strict';

window.HARMONY_FIREBASE_CONFIG = {
  // true = catálogo/admin usan Firebase; false = fallback a config.js
  useFirebase: true,
  useAppCheck: false,

  apiKey: 'AIzaSyA6cZ9Jm0_lSERWjpCk-b28C3Ob_PUww-s',
  authDomain: 'harmonylab-725c2.firebaseapp.com',
  projectId: 'harmonylab-725c2',
  storageBucket: 'harmonylab-725c2.firebasestorage.app',
  messagingSenderId: '197746902461',
  appId: '1:197746902461:web:112fee293e98f2a7aafed4',
  measurementId: 'G-86GPQ8HRTR',

  // reCAPTCHA v3 — activar en Console cuando quieras App Check
  appCheckSiteKey: 'YOUR_RECAPTCHA_V3_SITE_KEY',
};
