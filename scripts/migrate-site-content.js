#!/usr/bin/env node
/**
 * HarmonyLab — seed de contenido del sitio (settings, categorías, clases, testimonios)
 *
 *   node scripts/migrate-site-content.js
 *   node scripts/migrate-site-content.js --apply
 *
 * Env:
 *   GOOGLE_APPLICATION_CREDENTIALS=ruta/service-account.json
 *   FIREBASE_PROJECT_ID=tu-proyecto
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const admin = require('firebase-admin');

const APPLY = process.argv.includes('--apply');

const DEFAULT_TEMPLATES = {
  whatsappBuyTemplate: 'Hola {{brandName}}, me interesa el preset {{presetName}} para {{platform}}.',
  whatsappConsultTemplate: 'Hola {{brandName}}, tengo una consulta sobre el preset {{presetName}} para {{platform}}.',
  whatsappClassTemplate: 'Hola {{brandName}}, me interesa tomar clases de {{className}}.',
};

const FALLBACK_TESTIMONIALS = [
  {
    id: 'carlos-r',
    text: 'El Modern Metal Pack para Pod Go cambió completamente mi sonido en vivo. Subí al escenario y el sonido era brutal y definido. Mis compañeros de banda no podían creer que viniera de una pedalera.',
    authorName: 'Carlos R.',
    authorRole: 'Guitarrista — Banda de Metalcore',
    authorInitials: 'CR',
    stars: 5,
  },
  {
    id: 'mariana-p',
    text: 'Llevo 3 meses con clases de guitarra online con Harmony Lab y el avance ha sido enorme. Las clases son claras, los materiales excelentes y siempre hay respuesta rápida a mis dudas. 100% recomendado.',
    authorName: 'Mariana P.',
    authorRole: 'Alumna de Guitarra',
    authorInitials: 'MP',
    stars: 5,
  },
  {
    id: 'andres-l',
    text: 'Compré el HX Stomp Studio Pack para una sesión de grabación y el ingeniero de sonido quedó impresionado. Muy fácil de instalar y el soporte de Harmony Lab fue impecable cuando tuve dudas técnicas.',
    authorName: 'Andrés L.',
    authorRole: 'Músico de sesión',
    authorInitials: 'AL',
    stars: 5,
  },
];

function loadConfig() {
  const configPath = path.join(__dirname, '..', 'js', 'config.js');
  const code = fs.readFileSync(configPath, 'utf8');
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(code + '\n;this.__cfg = window.HARMONY_LAB_CONFIG;', sandbox);
  const cfg = sandbox.__cfg;
  if (!cfg) throw new Error('No se pudo leer HARMONY_LAB_CONFIG');
  return cfg;
}

async function main() {
  const cfg = loadConfig();
  const contact = cfg.contact || {};
  const classesInfo = cfg.classesInfo || {};
  const categories = Array.isArray(cfg.categories) ? cfg.categories : [];
  const classes = Array.isArray(cfg.classes) ? cfg.classes : [];
  const testimonials = (Array.isArray(cfg.testimonials) && cfg.testimonials.length)
    ? cfg.testimonials
    : FALLBACK_TESTIMONIALS;

  const settings = {
    whatsappNumber: String(contact.whatsapp || '593998116150'),
    whatsappDisplay: contact.whatsappDisplay || '+593 99 811 6150',
    brandName: contact.brandName || 'Harmony Lab',
    ...DEFAULT_TEMPLATES,
    classesSubtitle: classesInfo.subtitle || 'Presencial en Cuenca y Guayaquil. Online al resto del mundo. Todos los niveles.',
    presencialCities: classesInfo.presencialCities || ['Cuenca', 'Guayaquil'],
    onlineLabel: classesInfo.onlineLabel || 'Online al resto del mundo',
  };

  console.log('Contenido a migrar:');
  console.log(`- siteSettings/global`);
  console.log(`- categories: ${categories.length}`);
  console.log(`- classes: ${classes.length}`);
  console.log(`- testimonials: ${testimonials.length}`);
  console.log(`Modo: ${APPLY ? 'APPLY' : 'DRY RUN'}`);
  console.log('---');

  if (!APPLY) {
    console.log('Dry run OK. Ejecuta con --apply para subir.');
    return;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || undefined,
    });
  }

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.collection('siteSettings').doc('global').set({
    ...settings,
    updatedAt: now,
  }, { merge: true });
  console.log('OK siteSettings/global');

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    const id = c.id;
    const ref = db.collection('categories').doc(id);
    const snap = await ref.get();
    const data = {
      id,
      label: c.label || id,
      sortOrder: typeof c.sortOrder === 'number' ? c.sortOrder : i,
      published: true,
      updatedAt: now,
    };
    if (snap.exists) {
      await ref.set({ ...data, createdAt: snap.data().createdAt || now }, { merge: true });
    } else {
      await ref.set({ ...data, createdAt: now });
    }
    console.log(`OK category: ${id}`);
  }

  for (let i = 0; i < classes.length; i++) {
    const c = classes[i];
    const id = c.id;
    const ref = db.collection('classes').doc(id);
    const snap = await ref.get();
    const data = {
      name: c.name,
      emoji: c.emoji || '',
      image: c.image || '',
      description: c.description || '',
      sortOrder: typeof c.sortOrder === 'number' ? c.sortOrder : i,
      published: true,
      updatedAt: now,
    };
    if (snap.exists) {
      await ref.set({ ...data, createdAt: snap.data().createdAt || now }, { merge: true });
    } else {
      await ref.set({ ...data, createdAt: now });
    }
    console.log(`OK class: ${id}`);
  }

  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    const id = t.id || `testimonial-${i + 1}`;
    const ref = db.collection('testimonials').doc(id);
    const snap = await ref.get();
    const data = {
      text: t.text || t.quote || '',
      authorName: t.authorName || t.name || '',
      authorRole: t.authorRole || t.role || '',
      authorInitials: t.authorInitials || t.initials || 'HL',
      stars: Number(t.stars) || 5,
      sortOrder: typeof t.sortOrder === 'number' ? t.sortOrder : i,
      published: t.published !== false,
      updatedAt: now,
    };
    if (snap.exists) {
      await ref.set({ ...data, createdAt: snap.data().createdAt || now }, { merge: true });
    } else {
      await ref.set({ ...data, createdAt: now });
    }
    console.log(`OK testimonial: ${id}`);
  }

  console.log('---');
  console.log('Listo.');
}

main().catch((err) => {
  console.error('ERROR:', err.message || err);
  process.exit(1);
});
