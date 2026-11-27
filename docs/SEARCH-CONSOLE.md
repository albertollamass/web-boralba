# Integración de Search Console

El panel de administración usa Google Identity Services con el OAuth 2.0 Token
Model. El navegador solicita el permiso de solo lectura
`https://www.googleapis.com/auth/webmasters.readonly` y consulta directamente la
API oficial. No hay cuenta de servicio, secreto de cliente ni token persistente.

## Configuración

1. Habilita Google Search Console API en el proyecto `web-boralba`.
2. Crea un cliente OAuth web y configura `https://boralba.es` como origen autorizado.
3. Añade la cuenta administradora como usuario de prueba mientras la aplicación esté en modo externo de pruebas.
4. Define `VITE_GOOGLE_OAUTH_CLIENT_ID` en `.env` y en los Secrets de GitHub Actions.

El token se guarda únicamente en memoria, se revoca al desconectar y se elimina al
cerrar la sesión del panel. Las métricas se almacenan solo en una caché de memoria
de cinco minutos para evitar consultas repetidas durante la sesión.

## Límites funcionales

- Search Analytics aporta clics, impresiones, CTR, posición, consultas, páginas y fechas.
- La API de Sitemaps aporta el estado del sitemap, fechas y errores disponibles para Google.
- URL Inspection permite inspeccionar URLs individualmente, pero no solicitar indexaciones.
- El panel inspecciona únicamente las URLs canónicas definitivas `/producto/{id}/{slug}/` de los productos públicos indexables. Las rutas antiguas `/producto/{id}/` no se consultan ni se consideran errores.
- «Comprobar indexación del catálogo» revisa todos los productos, conserva los resultados seis horas en el navegador y separa indexados, pendientes, errores y sin comprobar. Las peticiones se espacian para no agotar la cuota de URL Inspection.
- Search Console puede retrasar los datos varios días.

No se requiere Firebase Functions, Cloud Run ni activar facturación para esta
integración. El cliente OAuth es público; nunca debe añadirse un `client_secret` al
frontend.
