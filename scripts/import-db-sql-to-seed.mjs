// Genera firestore.seed.json directamente desde `db.sql` (pg_dump de Supabase),
// sin necesidad de conexión a Supabase. Extrae solo las tablas public.* con
// datos de la app y las convierte al formato plano de Firestore.
//
// Uso:
//   node scripts/import-db-sql-to-seed.mjs [db.sql] [firestore.seed.json]
//
// Mapeo:
//   public.products(id, data, created_at)      -> products/{id}       = { ...data, id }
//   public.categories(id, data, created_at)    -> categories/{id}     = { ...data, slug }
//   public.site_settings                       -> site_settings/{id}  = { ...data } (vacía en tu dump: se omite)
//   public.profiles(id, role, created_at)      -> admins/{uuid}       = { role } (ver NOTA)
//   public.logs                                -> se omite (histórico de errores)
//
// NOTA admins: los UID de Supabase Auth no sirven en Firebase Auth. Tras importar,
// crea el usuario en Authentication con el mismo email y copia { role:'admin' }
// al doc admins/{nuevoUid} (o asigna el custom claim admin:true).
import { createReadStream, writeFileSync, mkdirSync } from 'node:fs'
import { createInterface } from 'node:readline'

const DUMP = process.argv[2] || 'db.sql'
const OUT = process.argv[3] || 'firestore.seed.json'
const ASSETS_DIR = 'storage-export'
const MANIFEST = 'storage-manifest.json'
// Firestore: máximo 1 MiB por documento. Todo data-URL (imagen/pdf en base64)
// mayor de 100 KB se extrae a fichero para subirlo a Storage; si algún
// documento sigue grande, se extraen el resto de data-URLs sin importar el tamaño.
const FIRST_PASS_BYTES = 100_000
const DOC_BUDGET_BYTES = 950_000

// Desescapa el formato text de COPY de Postgres (\), \n, \t, \r, \\ ...).
function pgUnescape(s) {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const n = s[i + 1]
      if (n === 'N' && out === '' && i + 2 >= s.length) return null // campo \N = NULL
      if (n === 'n') out += '\n'
      else if (n === 't') out += '\t'
      else if (n === 'r') out += '\r'
      else if (n === 'b') out += '\b'
      else if (n === 'f') out += '\f'
      else if (n === 'v') out += '\v'
      else out += n // \\, \. y demás: el carácter literal
      i++
    } else {
      out += s[i]
    }
  }
  return out
}

const seed = { products: {}, categories: {}, site_settings: {}, admins: {} }
const warnings = []
let current = null
let counts = { products: 0, categories: 0, profiles: 0, skipped: 0 }

function splitCopyLine(line, cols) {
  // Las columnas van separadas por TAB; el JSON no contiene tabs literales.
  const parts = line.split('\t')
  if (parts.length < cols) return null
  if (parts.length > cols) {
    // Por seguridad: la 1ª es id, la última created_at, el resto es data.
    return [parts[0], parts.slice(1, -1).join('\t'), parts[parts.length - 1]]
  }
  return parts
}

const rl = createInterface({ input: createReadStream(DUMP, 'utf8'), crlfDelay: Infinity })

for await (const line of rl) {
  let m = line.match(/^COPY public\.(\w+) \(([^)]*)\) FROM stdin;$/)
  if (m) {
    current = m[1]
    continue
  }
  if (current && line === '\\.') {
    current = null
    continue
  }
  if (!current) continue

  try {
    if (current === 'products') {
      const parts = splitCopyLine(line, 3)
      if (!parts) { counts.skipped++; continue }
      const data = JSON.parse(pgUnescape(parts[1]))
      const doc = { ...data, id: parts[0] }
      seed.products[parts[0]] = doc
      counts.products++
      const size = JSON.stringify(doc).length
      if (size > 800_000) warnings.push(`products/${parts[0]}: ~${(size / 1024).toFixed(0)} KB (límite Firestore 1 MiB; mueve imágenes a Storage)`)
    } else if (current === 'categories') {
      const parts = splitCopyLine(line, 3)
      if (!parts) { counts.skipped++; continue }
      const data = JSON.parse(pgUnescape(parts[1]))
      seed.categories[parts[0]] = { ...data, slug: parts[0] }
      counts.categories++
    } else if (current === 'site_settings') {
      const parts = splitCopyLine(line, 3)
      if (!parts) { counts.skipped++; continue }
      seed.site_settings[parts[0]] = JSON.parse(pgUnescape(parts[1]))
    } else if (current === 'profiles') {
      const parts = splitCopyLine(line, 3)
      if (!parts) { counts.skipped++; continue }
      seed.admins[parts[0]] = { role: parts[1], migratedFromSupabaseUuid: parts[0] }
      counts.profiles++
    }
    // logs y resto de tablas: se ignoran a propósito.
  } catch (e) {
    counts.skipped++
    console.warn(`Aviso: fila ignorada en ${current}: ${e.message}`)
  }
}

writeFileSync(OUT, JSON.stringify(seed, null, 2));
console.log(
  `OK -> ${OUT} (${counts.products} productos, ${counts.categories} categorías, ` +
  `${Object.keys(seed.site_settings).length} site_settings, ${counts.profiles} admins, ` +
  `${counts.skipped} filas ignoradas)`,
);

// --- Paso 2: convertir data-URLs en ficheros (Firestore no admite el base64 pesado)
const manifest = [];
const cleanSeg = (s) => String(s).replace(/[^a-z0-9_-]+/gi, "_").slice(0, 60);
function extractDataUrl(doc, path, value, minBytes) {
  const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(value);
  if (!m) return false;
  const mime = m[1] || "application/octet-stream";
  const isB64 = Boolean(m[2]);
  const buf = isB64 ? Buffer.from(m[3], "base64") : Buffer.from(decodeURIComponent(m[3]));
  if (buf.length < minBytes) return false;
  const ext = mime.includes("pdf") ? "pdf" : mime.includes("webp") ? "webp" : mime.includes("png") ? "png" : mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : mime.includes("svg") ? "svg" : "bin";
  const rel = `${cleanSeg(path[0])}/${cleanSeg(path[1])}/${cleanSeg(path.slice(2).join("_") || "file")}.${ext}`;
  mkdirSync(`${ASSETS_DIR}/${cleanSeg(path[0])}/${cleanSeg(path[1])}`, { recursive: true });
  writeFileSync(`${ASSETS_DIR}/${rel}`, buf);
  manifest.push({ collection: path[0], id: path[1], field: path.slice(2).join("."), file: rel, mime, bytes: buf.length });
  return true;
}
function walk(doc, path, minBytes, set) {
  if (typeof doc === "string" && doc.startsWith("data:")) {
    if (extractDataUrl(doc, path, doc, minBytes)) set("");
  } else if (Array.isArray(doc)) {
    doc.forEach((v, i) => walk(v, [...path, String(i)], minBytes, (nv) => { doc[i] = nv; }));
  } else if (doc && typeof doc === "object") {
    for (const k of Object.keys(doc)) walk(doc[k], [...path, k], minBytes, (nv) => { doc[k] = nv; });
  }
}
const setPlaceholder = (entry) => `__STORAGE_UPLOAD__:${entry.file}`;
// Pasada 1: extrae data-URLs > 100 KB en products y categories.
for (const [col, coll] of [["products", seed.products], ["categories", seed.categories]]) {
  for (const [id, doc] of Object.entries(coll)) {
    const before = manifest.length;
    walk(doc, [col, id], FIRST_PASS_BYTES, () => {});
    for (let i = before; i < manifest.length; i++) {
      const e = manifest[i];
      const parts = e.field.replace(/\[(\d+)\]/g, ".$1").split(".");
      let o = seed[col][id];
      for (let j = 0; j < parts.length - 1; j++) o = o[parts[j]];
      o[parts[parts.length - 1]] = setPlaceholder(e);
    }
  }
}
// Pasada 2: si algún doc sigue > 950 KB, extrae el resto de data-URLs sin mínimo.
for (const [col, coll] of [["products", seed.products], ["categories", seed.categories]]) {
  for (const [id, doc] of Object.entries(coll)) {
    if (JSON.stringify(doc).length <= DOC_BUDGET_BYTES) continue;
    const before = manifest.length;
    walk(doc, [col, id], 0, () => {});
    for (let i = before; i < manifest.length; i++) {
      const e = manifest[i];
      const parts = e.field.replace(/\[(\d+)\]/g, ".$1").split(".");
      let o = seed[col][id];
      for (let j = 0; j < parts.length - 1; j++) o = o[parts[j]];
      o[parts[parts.length - 1]] = setPlaceholder(e);
    }
    const size = JSON.stringify(seed[col][id]).length;
    console.log(`${col}/${id}: tras extraer queda en ${(size / 1024).toFixed(0)} KB`);
  }
}
// Verificación final de tamaños.
let oversized = [];
for (const [col, coll] of [["products", seed.products], ["categories", seed.categories]]) {
  for (const [id, doc] of Object.entries(coll)) {
    const size = JSON.stringify(doc).length;
    if (size > 1048576) oversized.push(`${col}/${id} (${(size / 1024).toFixed(0)} KB)`);
  }
}
writeFileSync(OUT, JSON.stringify(seed, null, 2));
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`OK -> ${OUT} reescrito + ${manifest.length} ficheros en ${ASSETS_DIR}/ + ${MANIFEST}`);
if (oversized.length) {
  console.warn("AVISO: siguen excediendo 1 MiB (revisar a mano):", oversized.join(", "));
} else {
  console.log("OK: todos los documentos caben en el límite de 1 MiB de Firestore.");
}
for (const w of warnings) console.warn('AVISO:', w)
if (warnings.length) {
  console.warn('\nHay documentos cerca del límite de 1 MiB (imágenes base64).')
  console.warn('Súbelas a Firebase Storage y deja en Firestore solo la URL (campo image/icons).')
}
if (counts.profiles > 0) {
  console.warn('\nRecuerda: los UUID de Supabase NO sirven como UID de Firebase.')
  console.warn('Crea el usuario en Authentication y copia { role: "admin" } a admins/{nuevoUid}.')
}
