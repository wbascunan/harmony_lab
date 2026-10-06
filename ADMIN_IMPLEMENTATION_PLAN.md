# HarmonyLab — Plan de implementación del panel admin

## Arquitectura actual

| Aspecto | Realidad |
|---|---|
| Stack | Sitio **estático** HTML + CSS + Vanilla JS (sin framework) |
| Routing | Anclas `#` en una sola página; sin SPA router |
| Presets | Array hardcodeado en `js/config.js` → `HARMONY_LAB_CONFIG.products` |
| Render catálogo | `js/script.js` (`renderCatalog`, `renderProductCard`, modal) |
| WhatsApp | Número global en `config.contact.whatsapp` → `wa.me/{n}?text=...` |
| Imágenes | Locales en `assets/images/` (rutas relativas) |
| Precio | `null` = Consultar · `0`/`free` = Gratis · número = USD |
| Clases | Siguen en `config.js` (fuera de alcance admin presets) |
| Deploy | GitHub Pages (`main` → `https://wbascunan.github.io/harmony_lab/`) |
| Firebase | **No configurado** |
| package.json | **No existe** |

## Arquitectura propuesta

```
[Público index.html]
  → Firebase Web SDK (CDN)
  → Firestore: presets where published==true orderBy sortOrder
  → Fallback: config.js si Firebase no está listo / falla
  → WhatsApp sin cambios de flujo

[admin/index.html]
  → Firebase Auth (email/password, sin registro)
  → Custom claim admin:true
  → CRUD presets + upload Storage (solo imágenes)
  → Audit logs (admin-only create)

[scripts/]  (Node + Admin SDK — NUNCA en frontend)
  → set-admin.js
  → migrate-presets-to-firestore.js

[firebase]
  → firestore.rules / storage.rules
  → tests con Emulator Suite
```

**Ruta admin:** `admin/` (compatible con GitHub Pages; `/admin` redirige vía `admin/index.html`).

## Archivos afectados

### Nuevos
- `admin/index.html`, `admin/admin.css`, `admin/admin.js`
- `js/firebase-app.js` — init SDK + helpers públicos
- `js/catalog-firestore.js` — carga catálogo desde Firestore
- `firebase.json`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`
- `scripts/set-admin.js`, `scripts/migrate-presets-to-firestore.js`
- `tests/firestore.rules.test.js`, `tests/storage.rules.test.js`
- `package.json`, `.env.example`, `.gitignore`
- `ADMIN_SETUP.md`, este plan

### Modificados
- `index.html` — scripts Firebase + estados loading/error catálogo
- `js/script.js` — catálogo async desde Firestore (fallback config)
- `js/config.js` — flag `useFirestoreCatalog` + products quedan como fallback/seed
- `css/style.css` — estados loading/empty/error discretos

## Modelo Firestore

### `presets/{presetId}`
Campos alineados con productos actuales:

| Campo | Tipo | Notas |
|---|---|---|
| name | string | |
| slug | string | único lógico (= id actual) |
| shortDescription | string | ex `shortDesc` |
| description | string | |
| price | number \| null | null=consultar, 0=gratis |
| currency | string | `"USD"` |
| category | string | podgo, zoom, gratis… |
| platform | string | |
| compatibleDevices | string[] | ex `compatibility` |
| includes | string[] | |
| presets | string[]? | packs Zoom/Headrush |
| snapshots | string[]? | Helix |
| badges | string[] | |
| features | {icon,label}[] | |
| thumb | string | |
| imageUrl | string | relativa o Storage URL |
| gallery | string[] | opcional |
| whatsappNumber | string? | override; vacío = global |
| whatsappMessage | string? | plantilla editable |
| downloadUrl | string? | ítems gratis Tone3000 |
| free | boolean | |
| featured | boolean | |
| published | boolean | |
| sortOrder | number | |
| createdAt / updatedAt | timestamp | |

### `siteSettings/global`
`whatsappNumber`, `whatsappDisplay`, `brandName` (opcional; fallback config).

### `adminAuditLogs/{id}`
`action`, `presetId`, `adminUid`, `adminEmail`, `timestamp` — solo create por admin; sin update/delete.

## Autenticación

1. Firebase Auth Email/Password
2. Sin registro público en la app
3. Custom claim `admin: true` vía `scripts/set-admin.js` (Admin SDK)
4. UI usa claim solo para UX; Rules validan siempre `request.auth.token.admin == true`

## Seguridad

- Rules Firestore/Storage estrictas
- App Check (reCAPTCHA v3) preparado; activación manual en Console
- Sin service account en frontend
- Sin HTML arbitrario: `textContent` / escape
- Validación de URLs (`https:` / rutas relativas / `wa.me`)
- `.gitignore` para secretos

## Migración

`scripts/migrate-presets-to-firestore.js`:
1. Lee `js/config.js` products
2. DRY-RUN por defecto
3. Upsert por `id`/`slug` (sin duplicar)
4. Conserva precios, imágenes, orden, badges, includes, etc.
5. `published: true` para todos los actuales

## WhatsApp

Flujo intacto. Número global en config (+ override opcional por preset). Botón sigue abriendo WhatsApp; sin pago automático ni descarga de archivo de preset (salvo `downloadUrl` de ítems gratis Tone3000 ya existentes).
