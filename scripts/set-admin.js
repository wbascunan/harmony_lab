#!/usr/bin/env node
/**
 * HarmonyLab — asignar / quitar custom claim admin:true
 *
 * Uso:
 *   node scripts/set-admin.js --email admin@ejemplo.com
 *   node scripts/set-admin.js --uid ABC123
 *   node scripts/set-admin.js --email admin@ejemplo.com --revoke
 *
 * Requiere:
 *   GOOGLE_APPLICATION_CREDENTIALS=ruta/al/service-account.json
 *   (o Application Default Credentials)
 *
 * NUNCA ejecutar desde el navegador. NUNCA subir el JSON al repo.
 */

'use strict';

const admin = require('firebase-admin');

function parseArgs(argv) {
  const out = { email: null, uid: null, revoke: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--email') out.email = argv[++i];
    else if (a === '--uid') out.uid = argv[++i];
    else if (a === '--revoke') out.revoke = true;
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || (!args.email && !args.uid)) {
    console.log(`
HarmonyLab — set-admin

  node scripts/set-admin.js --email usuario@dominio.com
  node scripts/set-admin.js --uid <UID>
  node scripts/set-admin.js --email usuario@dominio.com --revoke

Env:
  GOOGLE_APPLICATION_CREDENTIALS  Ruta al service account JSON
  FIREBASE_PROJECT_ID             (opcional)
`);
    process.exit(args.help ? 0 : 1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || undefined,
    });
  }

  const auth = admin.auth();
  let user;
  if (args.uid) {
    user = await auth.getUser(args.uid);
  } else {
    user = await auth.getUserByEmail(args.email);
  }

  const claims = args.revoke ? { admin: false } : { admin: true };
  await auth.setCustomUserClaims(user.uid, claims);

  // Mostrar claims resultantes
  const refreshed = await auth.getUser(user.uid);
  console.log('OK');
  console.log('  uid:   ', refreshed.uid);
  console.log('  email: ', refreshed.email);
  console.log('  claims:', refreshed.customClaims);
  console.log('');
  console.log('El usuario debe cerrar sesión y volver a entrar, o refrescar token con getIdToken(true).');
}

main().catch((err) => {
  console.error('ERROR:', err.message || err);
  process.exit(1);
});
