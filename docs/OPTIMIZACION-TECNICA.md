# Optimización técnica

## Cambios aplicados

- Se dividieron las páginas públicas y la administración mediante `React.lazy`.
  El chunk de `AdminPanel` no se solicita durante la navegación pública.
- Se añadió un estado accesible de carga para las rutas dinámicas.
- La primera imagen de la ficha de producto se carga con prioridad alta; el
  resto de la galería se difiere. Las tarjetas aceptan `imageSrcSet` y
  `sizes` sin cambiar el formato actual del catálogo.
- El catálogo expone un reintento tras un error de Firebase y deja de mostrar
  una carga infinita.
- Las fichas aceptan URLs descriptivas `/producto/:id/:slug` y mantienen la
  ruta anterior `/producto/:id` operativa.
- El sitemap se genera en cada build, excluye productos marcados como
  `published: false` o `noindex: true` y usa el nombre del producto para el
  segmento descriptivo.
- Se corrigieron todos los avisos actuales de Oxlint y se incorporó un estado
  de foco visible común sin alterar la paleta ni la composición existentes.

## Verificación realizada

- `npm run lint`: correcto, 0 avisos y 0 errores.
- `npm run build`: correcto; sitemap generado con los productos disponibles.
- El build genera chunks separados para las páginas y el panel de
  administración.

## Pendiente de verificación externa

- Lighthouse requiere ejecutarse contra una URL servida, idealmente en una
  preview de GitHub Pages o en Firebase Hosting, para comparar LCP, CLS,
  INP, accesibilidad y SEO antes/después.
- La generación física de WebP/AVIF y variantes necesita un pipeline de
  imágenes o transformación del proveedor de almacenamiento. No se han
  sobrescrito fotografías existentes ni se han inventado variantes.
- El prerenderizado completo de fichas depende de disponer del catálogo en el
  proceso de build. Actualmente el sitemap sí consulta Firestore, pero la
  aplicación sigue siendo SPA en GitHub Pages.
- Conviene confirmar en Firebase que `published` y `noindex` son los nombres
  definitivos de los campos de publicación antes de hacerlos obligatorios.
