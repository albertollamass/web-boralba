# Arquitectura

Estructura en capas inspirada en Clean Architecture + Hexagonal (puertos y
adaptadores), adaptada a un frontend React: sin CQRS, sin eventos, sin
entidades con comportamiento — el dominio aquí es fino y el CRUD sigue siendo
simple. Regla de dependencias: **las flechas apuntan hacia dentro**
(`presentation → application → domain`; `infrastructure → application/domain`).

```
src/
├── main.jsx / App.jsx        # Composition root + rutas (único lugar que conoce app e infra)
├── domain/                   # Puro: cero dependencias (lenguaje del catálogo)
│   ├── catalog/              #   árbol de categorías, slugs
│   ├── search/               #   buscador y sinónimos
│   ├── site/                 #   metadatos del sitio / SEO
│   └── showcase/             #   proyectos editoriales (contenido estático)
├── application/              # Casos de uso: orquesta, no implementa
│   ├── ports/                #   contratos (JSDoc): catalog, identity, telemetry, documents, contact
│   ├── catalog/              #   ProductsContext, CategoriesContext, SiteSettingsContext
│   ├── identity/             #   AuthContext
│   ├── telemetry/            #   cuota de lecturas (política + servicio)
│   └── logging/              #   fachada logError + configureLogger
├── infrastructure/           # Implementa los puertos (única capa con SDKs)
│   ├── firebase/             #   cliente (auth, db, colecciones)
│   ├── catalog/              #   repositorios Firestore (+ caché local)
│   ├── cache/                #   IndexedDB
│   ├── identity/             #   Firebase Auth
│   ├── telemetry/            #   contador diario en Firestore
│   ├── notifications/        #   Web3Forms (alertas + solicitudes)
│   ├── documents/            #   Cloudinary (PDFs del panel)
│   ├── logging/              #   destino persistente del log
│   └── browser/              #   directorio de contacto (localStorage)
└── presentation/             # React: pages, components, admin, utils, styles
```

## Decisiones

- **Los contextos son la capa de aplicación**: reciben los puertos por props
  desde `main.jsx` (`repository`, `telemetry`, `authService`…). Los hooks
  (`useProducts`, …) no cambian: son los puertos driver de la UI.
- **Repositorios con caché incluida**: el adaptador Firestore envuelve la lectura
  con IndexedDB (TTL 30 min) y devuelve `{ items, source }`; el proveedor decide
  el estado `cloud`/`cache` y la telemetría. Las escrituras atraviesan el mismo
  puerto (write-through).
- **`logError` es fachada**: `application/logging` solo escribe en consola; el
  destino Firestore se conecta en `main.jsx`. Así ningún módulo importa
  infraestructura para registrar errores.
- **`documentStorage`, `quoteSender` y `telemetry` viajan por props**
  (`App → AdminPanel → ProductForm`, `App → DisenaTuLuminaria`) en vez de
  importarse: cambiar de proveedor no toca la presentación.
- **Lo estático no se abstrae**: `public/assets`, `firestore.rules` y los scripts
  de migración viven fuera de `src/` como antes.

## Cambiar de backend mañana

Implementar los puertos de `application/ports/` con otra tecnología y
sustituir los adaptadores en `main.jsx`. Presentación, aplicación y dominio no
cambian (así se hizo ya una vez: Supabase → Firebase).
