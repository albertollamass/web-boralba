# Migración Supabase → Firebase (Boralba Lighting)

## 1. Qué pasa con `db.sql`

`db.sql` es un **pg_dump completo de Supabase** (esquemas `auth`, `storage`, `realtime`,
`graphql`, `vault`…): el 99 % es infraestructura interna de Supabase y **no se puede
importar tal cual en Firebase**. Firebase no es Postgres: no hay tablas, ni SQL, ni RLS.

Lo único relevante de tu base real está en `supabase/schema.sql` (4 tablas + logs),
y tu modelo **ya es documental** (columna `data jsonb`), así que la adaptación es 1:1:

| Supabase (Postgres + RLS) | Firebase (Firestore + Rules) |
|---|---|
| `products(id, data jsonb)` | `products/{id}` = campos en plano (`{...data, id}`) |
| `categories(id, data jsonb)` | `categories/{slug}` = campos en plano (`{...data, slug}`) |
| `site_settings(id, data)` | `site_settings/general` = campos en plano |
| `profiles(id uuid → auth.users, role)` | `admins/{uid}` = `{ role: 'admin' }` + usuario en Firebase Authentication |
| `logs(...)` | `logs/{autoId}` (se regeneran solos; no migrar el histórico) |
| RLS (lectura pública + escritura admin) | `firestore.rules` (ya creado en la raíz) |
| `supabase.auth` email+password | Firebase Authentication email+password |
| Imágenes base64 dentro de `data` | ⚠️ Mover a **Firebase Storage**, en Firestore solo la URL (límite 1 MiB/doc) |

Opciones que tienes en Firebase:

- **Firestore (recomendado, ya implementado)**: encaja con tu uso actual
  (lectura pública del catálogo, escritura desde el panel admin, offline gratis).
- **Realtime Database**: más barato para datos diminutos, pero peores consultas;
  no lo recomiendo para tu catálogo.
- **Storage**: úsalo para las fotos de producto (hoy van en base64 dentro de `data`
  y rozan el límite de 1 MiB por documento de Firestore).

## 2. Código: qué se ha cambiado

- `src/infrastructure/firebase/client.js` (antes `src/lib/firebase.js`; el shim
  `src/lib/supabase.js` ya se eliminó).
- `AuthContext` → Firebase Auth (`onAuthStateChanged` + email/password). El rol se
  resuelve por custom claim `admin:true` o por doc `admins/{uid}`.
- `ProductsContext` / `CategoriesContext` / `SiteSettingsContext` → repositorios
  Firestore (`getDocs`/`setDoc`/`deleteDoc`) inyectados desde `main.jsx`.
  Se mantiene la misma API (`syncStatus`, `cloudEnabled`, `addProduct`, …).
- `logger` → colección `logs` con `addDoc` (vía fachada `application/logging`).
- `App.jsx` y `AdminLogin.jsx` → `backendEnabled` (prop desde `main.jsx`).
- `package.json`: `@supabase/supabase-js` → `firebase`.
- Nuevos: `firestore.rules`, `firebase.json`, `firestore.indexes.json`,
  `scripts/export-supabase-to-seed.mjs`, `scripts/import-seed-to-firestore.mjs`.
- Ver `docs/ARCHITECTURE.md` para la estructura por capas actual.

## 3. Pasos en Firebase Console (1 a 1, proyecto ya creado, plan gratuito)

> **Storage no hace falta**: los PDFs e imágenes ya van como ficheros estáticos
> en `public/assets/` (paso 7). Sáltate todo lo de Storage.

1. **Authentication > Sign-in method**: habilita **Email/Password** (solo ese).
2. **Authentication > Users > Add user**: crea tu usuario admin (email + contraseña
   fuerte). Apunta su **UID** (clic en el usuario para verlo).
3. **Firestore Database > Create database** (si aún no existe): **Start in
   production mode**, ubicación `eur3` (Europa). Luego pestaña **Rules**: borra el
   contenido, pega el archivo `firestore.rules` de este repo y **Publish**.
4. **Project settings (⚙️) > Service accounts > Generate new private key**:
   descarga el JSON, renómbralo a `serviceAccount.json` y ponlo en la raíz del
   proyecto. No lo subas a git (ya está en `.gitignore`).
5. **Project settings > General > Your apps > Add app > Web (`</>`)**: alias
   `web-boralba`, copia los valores y pégalos en tu `.env` (ver `.env.example`:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
   `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
   `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`).
6. En la terminal, desde la raíz del proyecto:
   ```bash
   npm install
   npm i -D firebase-admin
   node scripts/import-seed-to-firestore.mjs serviceAccount.json
   ```
   (`firestore.seed.json` ya está generado desde tu `db.sql` con las 66 URLs a
   `public/assets/`: 60 productos, 24 categorías, 0 documentos > 1 MiB.)
7. **Ficheros desde /admin (solo Cloudinary, 5 min, gratis y sin tarjeta)**:
   Firebase Storage exige plan Blaze, y Firestore no admite PDFs (> 1 MiB/doc),
   así que los PDF nuevos se suben a Cloudinary y el producto (con su URL) sigue
   en Firestore. Las imágenes se comprimen a webp en el navegador y van inline
   en el documento.
   1. Crea cuenta en <https://cloudinary.com/> (gratis).
   2. **Settings > Upload > Upload presets > Add upload preset**: Signing Mode =
      **Unsigned**, nombre `boralba-docs` (guarda).
   3. En **Dashboard** copia tu **Cloud name** y pon en `.env`:
      `VITE_CLOUDINARY_CLOUD_NAME=<cloud>` y `VITE_CLOUDINARY_UPLOAD_PRESET=boralba-docs`.
   Sin esto, el panel solo admite PDFs < 700 KB (y te avisa si te pasas).
7. **Firestore Database > Data**: crea la colección `admins`, documento con ID =
   el **UID del paso 2** y campo `role = "admin"`. (Opcional recomendado: asignar
   el custom claim `admin:true` con Admin SDK para no depender de esa lectura.)
8. `npm run dev` → abre `/admin/login`, entra con tu email/contraseña y verifica:
   catálogo, PDFs (ficha técnica) e imágenes de producto, crear/editar/borrar un
   producto de prueba (incluido subir un PDF). Luego `npm run build`.

Notas:
- Los 2 UUID de `profiles` del dump no sirven como UID de Firebase (el paso 7 los
  sustituye); los `logs` no se migran (se regeneran solos); `site_settings` venía
  vacío, la app usa sus valores por defecto hasta que guardes algo.
- `public/assets/` pesa ~41 MB y se commitea (GitHub Pages lo admite sin problema).
  Son los 66 ficheros históricos; todo lo nuevo que subas desde /admin va a
  Cloudinary (PDFs) o inline en Firestore (imágenes comprimidas).
- Si en el futuro pasas a Blaze y activas Storage, usa
  `scripts/upload-storage-assets.mjs` + `storage.rules`; el código ya acepta tanto
  URLs http(s) como rutas `assets/...`.

## 4. Migrar los datos (desde `db.sql`, sin perder nada)

Tu dump contiene **60 productos, 24 categorías y 2 perfiles admin** (ya verificados:
todos únicos, 0 filas perdidas). Ojo: 15 productos superan el límite de 1 MiB por
documento de Firestore porque llevan el PDF (`datasheet`) e imágenes en base64.
El pipeline ya lo resuelve: extrae esos binarios (57 PDFs + 9 imágenes) a
`storage-export/` y deja en Firestore solo la URL.

```bash
# 1) Dump -> seed + assets (ya ejecutado: firestore.seed.json, storage-export/, storage-manifest.json)
node scripts/import-db-sql-to-seed.mjs

# 2) Seed -> Firestore (requiere serviceAccount.json, paso 5 de abajo)
npm i -D firebase-admin
node scripts/import-seed-to-firestore.mjs serviceAccount.json

# 3) Assets -> Storage + parchea las URLs en los documentos
node scripts/upload-storage-assets.mjs serviceAccount.json TU-PROYECTO.appspot.com
```

Alternativa: `scripts/export-supabase-to-seed.mjs` hace lo mismo pero contra el
Supabase en vivo (no extrae binarios; úsalo solo si el dump está desactualizado).

## 5. Limpieza

## 6. Alerta de cuota (lecturas/día)

La app suma cada lectura real a `usage/YYYY-MM-DD` (1 lectura + 1 escritura extra
por sesión como máximo; la caché hace que la mayoría de visitas cuesten 0).
- El panel admin muestra `N / 50.000 lecturas hoy` junto al total de productos
  (en rojo a partir del 80%).
- Al llegar a 40.000 se envía **un email al día** vía Web3Forms (requiere
  `VITE_WEB3FORMS_ACCESS_KEY`; sin clave, el aviso sigue visible en el panel).
- Las reglas de `firestore.rules` ya incluyen la colección `usage`: **vuelve a
  publicarlas** (Firestore > Rules > Publish) o el contador fallará en silencio.

- `npm install` (instala `firebase`), `npm run dev`, `npm run build`.
- Cuando todo funcione: borra `src/lib/supabase.js`, `supabase/`, `db.sql` y las
  `VITE_SUPABASE_*` de `.env`.
