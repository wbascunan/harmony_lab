/**
 * Tests de Security Rules — Storage
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
const RULES = readFileSync(resolve(__dirname, '..', 'storage.rules'), 'utf8');

let testEnv;

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    storage: { rules: RULES, host: '127.0.0.1', port: 9199 },
  });
});

test.after(async () => {
  await testEnv?.cleanup();
});

test.beforeEach(async () => {
  await testEnv.clearStorage();
});

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

test('14. upload Storage sin admin falla', async () => {
  const ctx = testEnv.authenticatedContext('user1');
  const ref = ctx.storage().ref('preset-images/p1/cover.png');
  await assertFails(ref.put(tinyPng, { contentType: 'image/png' }));
});

test('15. upload Storage admin imagen válida OK', async () => {
  const ctx = testEnv.authenticatedContext('admin1', { admin: true });
  const ref = ctx.storage().ref('preset-images/p1/cover.png');
  await assertSucceeds(ref.put(tinyPng, { contentType: 'image/png' }));
});

test('16. upload Storage admin archivo no imagen falla', async () => {
  const ctx = testEnv.authenticatedContext('admin1', { admin: true });
  const ref = ctx.storage().ref('preset-images/p1/file.txt');
  await assertFails(ref.put(Buffer.from('hello'), { contentType: 'text/plain' }));
});

test('17. archivo sobre tamaño máximo falla', async () => {
  const ctx = testEnv.authenticatedContext('admin1', { admin: true });
  const big = Buffer.alloc(5 * 1024 * 1024 + 10, 1);
  const ref = ctx.storage().ref('preset-images/p1/big.jpg');
  await assertFails(ref.put(big, { contentType: 'image/jpeg' }));
});
