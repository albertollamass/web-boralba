# Boralba Lighting — Réplica web (LED Iluminación)

Réplica en **React (Vite)** de la web [led-iluminacion.es](https://led-iluminacion.es/), empresa
de soluciones de iluminación LED profesional. Se ejecuta 100% en local, sin backend: los
productos se guardan en el `localStorage` del navegador.

## Funcionalidades

- **Home** con hero, categorías, productos destacados y secciones corporativas.
- **Productos** con catálogo completo y menú desplegable por categorías (anidado).
- **Página de categoría** dinámica: subcategorías y productos, con migas de pan.
- **Ficha de producto** con precio, referencia, especificaciones y relacionados.
- **Outlet**, **Proyectos**, **Servicios**, **Contacto** (con formulario y validación) y páginas legales.
- **Modo administrador** (`/admin`): crear, editar y eliminar productos sin tocar código.

## Modo administrador

1. Entra en `http://localhost:5173/admin`.
2. Contraseña por defecto: `boralba2024` (configurable en `src/context/ProductsContext.jsx`).
3. Crea/edita/elimina productos: nombre, referencia, categoría, precio, imagen (URL), descripción y especificaciones técnicas.
4. Los cambios se guardan en `localStorage`. El botón **Restaurar catálogo** vuelve a los datos de fábrica.

> Los productos por defecto viven en `src/data/products.js`. Las categorías (árbol) en
> `src/data/categories.js`.

## Puesta en marcha

```bash
npm install
npm run dev        # desarrollo  -> http://localhost:5173
npm run build      # build producción -> dist/
npm run preview    # sirve el build
npm run lint       # oxlint
```

## Estructura

```
src/
├── admin/            # Modo administrador (login + panel + formulario)
├── components/       # Header, Footer, Layout, ProductCard, CookieBanner
├── context/          # ProductsContext (estado + localStorage)
├── data/             # categories.js (árbol) y products.js (catálogo inicial)
└── pages/            # Home, Productos, Categoría, Producto, Outlet, Proyectos, Servicios, Contacto, Legal
```

Imágenes descargadas de la web original en `public/images/` para su uso local.
