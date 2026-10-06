#!/usr/bin/env node
/**
 * HarmonyLab — migración ONE-TIME de presets (config.js → Firestore)
 *
 * Por defecto: DRY RUN (no escribe).
 *
 *   node scripts/migrate-presets-to-firestore.js
 *   node scripts/migrate-presets-to-firestore.js --apply
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

function loadProductsFromConfig() {
  const configPath = path.join(__dirname, '..', 'js', 'config.js');
  const code = fs.readFileSync(configPath, 'utf8');
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(code + '\n;this.__cfg = window.HARMONY_LAB_CONFIG;', sandbox);
  const cfg = sandbox.__cfg;
  if (!cfg || !Array.isArray(cfg.products)) {
    throw new Error('No se pudo leer HARMONY_LAB_CONFIG.products');
  }
  return { products: cfg.products, contact: cfg.contact || {} };
}

function mapProduct(p, index) {
  const id = p.id;
  return {
    id,
    data: {
      name: p.name,
      slug: id,
      shortDescription: p.shortDesc || '',
      description: p.description || '',
      price: p.price === undefined ? null : p.price,
      currency: 'USD',
      category: p.category || 'podgo',
      platform: p.platform || '',
      compatibleDevices: p.compatibility || [],
      includes: p.includes || [],
      presets: p.presets || null,
      snapshots: p.snapshots || null,
      badges: p.badges || [],
      features: p.features || [],
      thumb: p.thumb || 'pack',
      imageUrl: p.image || '',
      gallery: [],
      whatsappNumber: null,
      whatsappMessage: null,
      downloadUrl: p.downloadUrl || null,
      free: Boolean(p.free) || p.price === 0,
      featured: false,
      published: true,
      sortOrder: index,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  };
}

async function main() {
  const { products, contact } = loadProductsFromConfig();
  const mapped = products.map(mapProduct);

  console.log(`Presets a migrar: ${mapped.length}`);
  console.log(`Modo: ${APPLY ? 'APPLY (escribirá en Firestore)' : 'DRY RUN (sin escribir)'}`);
  console.log('---');
  mapped.forEach(({ id, data }) => {
    console.log(`- ${id} | ${data.name} | price=${data.price} | cat=${data.category} | published=${data.published}`);
  });
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
  let created = 0;
  let updated = 0;

  for (const { id, data } of mapped) {
    const ref = db.collection('presets').doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      const { createdAt, ...rest } = data;
      await ref.set({
        ...rest,
        createdAt: snap.data().createdAt || createdAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      updated++;
      console.log(`updated: ${id}`);
    } else {
      await ref.set(data);
      created++;
      console.log(`created: ${id}`);
    }
  }

  // Settings globales opcionales
  if (contact.whatsapp) {
    await db.collection('siteSettings').doc('global').set({
      whatsappNumber: String(contact.whatsapp),
      whatsappDisplay: contact.whatsappDisplay || '',
      brandName: contact.brandName || 'Harmony Lab',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log('siteSettings/global actualizado');
  }

  const total = (await db.collection('presets').get()).size;
  console.log('---');
  console.log(`Listo. created=${created} updated=${updated} totalEnFirestore=${total}`);
}

main().catch((err) => {
  console.error('ERROR:', err.message || err);
  process.exit(1);
});
