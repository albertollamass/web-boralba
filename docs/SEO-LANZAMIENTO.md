# SEO de lanzamiento

## Build y sitemap

`npm run build` ejecuta `scripts/generate-sitemap.mjs` antes de Vite. El script
incluye las rutas editoriales y consulta la coleccion publica `products` de
Firestore mediante la API REST. No usa una cuenta de servicio. El resultado se
publica en `public/sitemap.xml` y contiene las fichas `/producto/{id}` reales.

El sitemap no incluye `/admin`, `/buscar`, `/legal` ni rutas con contenido
privado. Si Firestore no esta disponible durante un build, el script conserva
las rutas editoriales y avisa de que no ha podido anadir productos.

## Google Search Console

1. Verificar la propiedad del dominio definitivo en Search Console.
2. Publicar la web con `SITE_URL` igual al dominio definitivo.
3. Comprobar que `robots.txt` y `/sitemap.xml` devuelven HTTP 200.
4. Enviar `/sitemap.xml` y solicitar inspeccion de las paginas principales.
5. Revisar semanalmente cobertura, canonicas, paginas excluidas y Core Web Vitals.

Estas acciones requieren acceso a Search Console y no pueden ejecutarse desde
el repositorio.

## Dominio y redirecciones

GitHub Pages no permite configurar respuestas HTTP 301 por ruta. La migracion
desde `led-iluminacion.es` requiere conservar la web anterior con un servidor,
CDN o proveedor de redirecciones que responda con 301 desde cada URL antigua a
su equivalente nueva. No se debe sustituir por JavaScript.

La estructura confirmada de la web anterior incluye `/producto/{slug}/`,
categorias en la raiz y `/contacto/`. El catalogo nuevo usa `/producto/{id}`;
por tanto, la tabla slug antiguo a ID nuevo debe cerrarse con el inventario
definitivo antes de activar la migracion.

## Analitica

Definir el secreto `VITE_GA_MEASUREMENT_ID` en GitHub Actions. Es una variable
publica de configuracion del cliente, no una clave privada. La aplicacion no
inicializa GA4 hasta que el usuario acepta las cookies analiticas.

El evento `page_view` envia el referente disponible y clasifica solo estos
casos observables: `search_engine`, `ai_assistant`, `referral` o `direct`.
`ai_assistant` no implica que se haya identificado una conversacion de IA;
solo significa que el referente HTTP pertenece a un dominio conocido.
