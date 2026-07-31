# Boralba Lighting — Web (LED Iluminación)

Réplica en **React (Vite)** de la web [led-iluminacion.es](https://led-iluminacion.es/), empresa
de soluciones de iluminación LED profesional. Interfaz pública + **panel de administración**
con los productos guardados en la nube (**Supabase**).

> Si nunca has montado un proyecto así, lee primero la guía completa para principiantes:
> **[docs/GUIA-COMPLETA.md](docs/GUIA-COMPLETA.md)**. Cubre desde instalar Git/Node hasta
> publicar la web en internet.

## Funcionalidades

- **Home** con hero, categorías, productos destacados y secciones corporativas.
- **Productos** con catálogo completo y menú desplegable por categorías (anidado).
- **Página de categoría** dinámica: subcategorías y productos, con migas de pan.
- **Ficha de producto** con galería, badges, precio, referencia, variantes, ficha técnica,
  descripción larga, características, aplicaciones y ventajas.
- **Outlet**, **Proyectos**, **Servicios**, **Contacto** (con formulario y validación) y páginas legales.
- **Modo administrador** (`#/admin`): crear, editar y eliminar productos sin tocar código.
  El acceso es con **Supabase Auth** (email + contraseña) y solo un perfil admin puede escribir.

## Web publicada

Desplegada automáticamente en **GitHub Pages**: https://albertollamass.github.io/web-boralba/

- Cada `git push` a `main` compila y publica solo (GitHub Actions).
- Los **productos** se leen en vivo de Supabase: los cambios del panel se ven al recargar,
  sin redesplegar.
- Detalles en `docs/GUIA-COMPLETA.md` (sección 18).

## Puesta en marcha (resumen)

Requisitos: **Node.js** (LTS) y **Git** instalados.

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Supabase: copiar .env.example a .env y rellenar claves
#    (ver docs/GUIA-COMPLETA.md sección "Supabase")

# 3. Arrancar el servidor de desarrollo
npm run dev        # -> http://localhost:5173

# 4. Panel de administración
#    http://localhost:5173/#/admin  (login con el usuario admin de Supabase)
```

Otros comandos:

```bash
npm run build      # build producción -> dist/
npm run preview    # sirve el build localmente
npm run lint       # oxlint
```

## Configuración (variables de entorno)

Copia `.env.example` a `.env` y rellena con los datos de tu proyecto Supabase
(**Project Settings → API**):

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

- La **publishable key** solo permite **leer** el catálogo (público).
- Para **escribir** hay que iniciar sesión como admin (Supabase Auth).
- `.env` está en `.gitignore`: nunca subas las claves a GitHub.

## Estructura

```
src/
├── admin/            # Login + panel + formulario de producto
├── components/       # Header, Footer, Layout, ProductCard, ScrollToTop, CookieBanner
├── context/          # ProductsContext (catálogo + Supabase) y AuthContext (login)
├── data/             # categories.js (árbol) y products.js (catálogo inicial)
├── lib/              # supabase.js (cliente Supabase)
└── pages/            # Home, Productos, Categoría, Producto, Outlet, Proyectos, Servicios, Contacto, Legal
supabase/schema.sql   # SQL para crear las tablas y políticas de seguridad en Supabase
docs/GUIA-COMPLETA.md # Guía paso a paso para principiantes
```

Imágenes descargadas de la web original en `public/images/` para su uso local.

## Notas de seguridad

- La contraseña del administrador **no está en el código**: vive en Supabase Auth.
- La base de datos usa **RLS (Row Level Security)**: lectura pública, escritura solo
  para usuarios autenticados que estén en la tabla `profiles`.
- Nunca pongas la `service_role key` de Supabase en el frontend: es secreta.
