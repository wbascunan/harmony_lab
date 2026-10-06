/**
 * Tests de Security Rules — Firestore
 * Requiere emuladores: npm run test:rules
 */

'use strict';

const { readFileSync } = require('fs');
const { resolve } = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');

const PROJECT_ID = 'harmony-lab-rules-test';
const RULES = readFileSync(resolve(__dirname, '..', 'firestore.rules'), 'utf8');

let testEnv;

const validPreset = (over = {}) => ({
  name: 'Test Preset',
  slug: 'test-preset',
  shortDescription: 'Corta',
  description: 'Descripcion larga suficiente',
  price: 10,
  currency: 'USD',
  category: 'podgo',
  platform: 'Pod Go',
  compatibleDevices: ['Pod Go'],
  includes: ['Item'],
  presets: null,
  snapshots: null,
  badges: ['worship'],
  features: [{ icon: 'fa-star', label: 'Worship' }],
  thumb: 'ambient',
  imageUrl: 'assets/images/logo.png',
  gallery: [],
  whatsappNumber: null,
  whatsappMessage: null,
  downloadUrl: null,
  free: false,
  featured: false,
  published: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...over,
});

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: RULES, host: '127.0.0.1', port: 8080 },
  });
});

test.after(async () => {
  await testEnv?.cleanup();
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
});

test('1. no auth NO puede crear preset', async () => {
  const ctx = testEnv.unauthenticatedContext();
  await assertFails(ctx.firestore().collection('presets').doc('x').set(validPreset({ slug: 'x' })));
});

test('2. no auth NO puede modificar preset', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection('presets').doc('p1').set(validPreset({ slug: 'p1' }));
  });
  const ctx = testEnv.unauthenticatedContext();
  await assertFails(ctx.firestore().collection('presets').doc('p1').update({ name: 'Hack' }));
});

test('3. no auth NO puede borrar preset', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection('presets').doc('p1').set(validPreset({ slug: 'p1' }));
  });
  const ctx = testEnv.unauthenticatedContext();
  await assertFails(ctx.firestore().collection('presets').doc('p1').delete());
});

test('4. usuario normal NO puede crear', async () => {
  const ctx = testEnv.authenticatedContext('user1', { email: 'u@t.com' });
  await assertFails(ctx.firestore().collection('presets').doc('n').set(validPreset({ slug: 'n' })));
});

test('5. usuario normal NO puede editar', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection('presets').doc('p1').set(validPreset({ slug: 'p1' }));
  });
  const ctx = testEnv.authenticatedContext('user1');
  await assertFails(ctx.firestore().collection('presets').doc('p1').update({ name: 'Nope' }));
});

test('6. usuario normal NO puede borrar', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection('presets').doc('p1').set(validPreset({ slug: 'p1' }));
  });
  const ctx = testEnv.authenticatedContext('user1');
  await assertFails(ctx.firestore().collection('presets').doc('p1').delete());
});

test('7. admin SÍ puede crear', async () => {
  const ctx = testEnv.authenticatedContext('admin1', { admin: true, email: 'a@t.com' });
  await assertSucceeds(ctx.firestore().collection('presets').doc('a1').set(validPreset({ slug: 'a1' })));
});

test('8. admin SÍ puede editar', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection('presets').doc('p1').set(validPreset({ slug: 'p1' }));
  });
  const ctx = testEnv.authenticatedContext('admin1', { admin: true });
  await assertSucceeds(
    ctx.firestore().collection('presets').doc('p1').update({
      name: 'Editado',
      updatedAt: new Date(),
    })
  );
});

test('9. admin SÍ puede borrar', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection('presets').doc('p1').set(validPreset({ slug: 'p1' }));
  });
  const ctx = testEnv.authenticatedContext('admin1', { admin: true });
  await assertSucceeds(ctx.firestore().collection('presets').doc('p1').delete());
});

test('10. público puede leer publicado', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection('presets').doc('pub').set(validPreset({ slug: 'pub', published: true }));
  });
  const ctx = testEnv.unauthenticatedContext();
  await assertSucceeds(ctx.firestore().collection('presets').doc('pub').get());
});

test('11. público NO puede leer borrador', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection('presets').doc('draft').set(validPreset({ slug: 'draft', published: false }));
  });
  const ctx = testEnv.unauthenticatedContext();
  await assertFails(ctx.firestore().collection('presets').doc('draft').get());
});

test('12. usuario NO puede auto-asignarse admin via Firestore', async () => {
  const ctx = testEnv.authenticatedContext('user1');
  await assertFails(ctx.firestore().collection('admins').doc('user1').set({ admin: true }));
});

test('13. escritura con campos no permitidos falla', async () => {
  const ctx = testEnv.authenticatedContext('admin1', { admin: true });
  const bad = { ...validPreset({ slug: 'bad' }), evilField: 'x' };
  await assertFails(ctx.firestore().collection('presets').doc('bad').set(bad));
});
