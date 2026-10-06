# HarmonyLab — Guía de configuración del panel Admin (Firebase)

Esta guía asume el sitio estático actual (HTML/CSS/JS) en la carpeta `files/`.

Lee también: `ADMIN_IMPLEMENTATION_PLAN.md`

---

## 1. Crear / configurar proyecto Firebase

1. Entra a [Firebase Console](https://console.firebase.google.com/)
2. **Agregar proyecto** → nombre p.ej. `harmony-lab`
3. Desactiva Analytics si no lo necesitas (opcional)
4. Anota el **Project ID** 
harmonylab-725c2

---

## 2. Authentication

1. Build → **Authentication** → Get started
2. Sign-in method → **Email/Password** → Enable → Save
3. **NO** actives registro público desde la web de HarmonyLab (el panel no tiene “Crear cuenta”)

---

## 3. Crear el usuario administrador (cuenta)

1. Authentication → **Users** → Add user
2. Correo + contraseña seguros del dueño de HarmonyLab
3. Copia el **User UID**

---

## 4. Firestore

1. Build → **Firestore Database** → Create database
2. Empieza en **production mode**
3. Elige región cercana (p.ej. `southamerica-east1` o `us-central1`)
4. Luego desplegaremos las rules del repo (paso 11)

---

## 5. Storage

1. Build → **Storage** → Get started
2. Usa las mismas reglas del repo (paso 11)
3. Carpeta permitida: `preset-images/{presetId}/...`

---

## 6. Registrar app Web

1. Project settings → Your apps → **Web** (`</>`)
2. Nickname: `harmonylab-web`
3. Copia el objeto `firebaseConfig`

npm install firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6cZ9Jm0_lSERWjpCk-b28C3Ob_PUww-s",
  authDomain: "harmonylab-725c2.firebaseapp.com",
  projectId: "harmonylab-725c2",
  storageBucket: "harmonylab-725c2.firebasestorage.app",
  messagingSenderId: "197746902461",
  appId: "1:197746902461:web:112fee293e98f2a7aafed4",
  measurementId: "G-86GPQ8HRTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


---

## 7. Configurar el frontend

Edita `js/firebase-config.js`:

```js
window.HARMONY_FIREBASE_CONFIG = {
  useFirebase: true,
  useAppCheck: false, // true cuando actives App Check
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
  measurementId: '...',
  appCheckSiteKey: 'YOUR_RECAPTCHA_V3_SITE_KEY',
};
```

Edita `.firebaserc` y pon tu `projectId` real.

Copia `.env.example` → `.env` (solo para scripts locales).

---

## 8. Service Account (solo scripts / PC local)

1. Project settings → **Service accounts**
2. Generate new private key
3. Guarda el JSON **fuera del repo** (ej. `C:/secrets/harmony-lab-sa.json`)
4. **NUNCA** lo subas a GitHub

PowerShell:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secrets\harmony-lab-sa.json"
$env:FIREBASE_PROJECT_ID="tu-project-id"
```

---

## 9. Instalar dependencias de scripts

Desde la carpeta `files/`:

```bash
npm install
```

---

## 10. Asignar custom claim `admin: true`

### Comando exacto

```bash
npm run set-admin -- --email TU_CORREO@ejemplo.com
```

O por UID:

```bash
node scripts/set-admin.js --uid EL_UID_DEL_USUARIO
```

### Quitar admin

```bash
node scripts/set-admin.js --email TU_CORREO@ejemplo.com --revoke
```

### Refrescar token

1. Cierra sesión en `/admin/`
2. Vuelve a entrar  
   (o el panel ya llama `getIdToken(true)` al cargar)

---

## 11. Desplegar Security Rules

```bash
npx firebase login
npx firebase use tu-project-id
npx firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## 12. Migrar presets actuales

Dry run (no escribe):

```bash
npm run migrate-presets
```

Aplicar:

```bash
npm run migrate-presets:apply
```

Verifica en Console → Firestore → colección `presets` (cantidad ≈ productos actuales).

---

## 13. Probar el panel

1. Abre `https://TU_DOMINIO/admin/` o en local `admin/index.html` (idealmente con un server estático)
2. Login con el correo admin
3. Si ves “Acceso no autorizado”: claim no aplicado o token sin refrescar
4. Crea / edita / publica / oculta / elimina (con confirmación)

---

## 14. App Check (recomendado)

1. Console → App Check → Register web app → **reCAPTCHA v3**
2. Pon el site key en `appCheckSiteKey`
3. `useAppCheck: true`
4. Enforce gradualmente en Firestore/Storage cuando confirmes que el sitio funciona

App Check **no** reemplaza Auth ni Rules.

---

## 15. Desplegar el sitio

```bash
git add -A
git commit -m "Admin panel Firebase + catálogo Firestore"
git push origin main
```

GitHub Pages actualizará automáticamente.

URL admin: `https://wbascunan.github.io/harmony_lab/admin/`  
(o tu dominio custom `/admin/`)

---

## 16. Tests de reglas (local)

```bash
npm test
```

Esto levanta emuladores y ejecuta `tests/*.test.js`.

---

## Checklist rápido

- [ ] `useFirebase: true` con credenciales reales
- [ ] Rules desplegadas
- [ ] Usuario creado en Auth
- [ ] `npm run set-admin -- --email ...`
- [ ] Migración aplicada
- [ ] Sitio público muestra presets (Firestore o fallback)
- [ ] `/admin/` login + CRUD OK
- [ ] Usuario sin claim no entra
- [ ] WhatsApp sigue igual
- [ ] Ningún `service-account*.json` en el repo

---

## Seguridad — recordatorios

| Incorrecto | Correcto |
|---|---|
| Confiar en URL secreta `/admin` | Custom claims + Rules |
| `allow read, write: if true` | Rules de este repo |
| Admin SDK en el navegador | Solo `scripts/` con service account local |
| `localStorage.isAdmin=true` | `request.auth.token.admin` |
| Subir JSON de service account | `.gitignore` + ruta local |
