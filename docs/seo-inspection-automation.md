# Comprobacion SEO del catalogo

## Cambios de rendimiento

La cola anterior esperaba una respuesta y un segundo adicional antes de
consultar la siguiente URL. Con 191 URLs, el retardo fijo era de al menos 190
segundos, sin contar la latencia de Google. La nueva cola usa cuatro
trabajadores, por lo que el tiempo esperado de red baja aproximadamente a una
cuarta parte cuando Search Console responde con normalidad.

Cada respuesta se muestra y se guarda en Firestore inmediatamente. La cache
local permite continuar tras cerrar la pestaña o perder la red; los errores
transitorios se reintentan con backoff. Se respetan 550 inspecciones por
minuto y 1.900 por dia para dejar margen frente a los limites de Search
Console.

La interfaz registra `durationMs` en cada tanda. La comparacion real antes y
despues debe hacerse con la misma lista y las mismas condiciones de red:

1. Medir una tanda completa anterior con 191 URLs.
2. Vaciar solo la cache de inspecciones y ejecutar una tanda nueva.
3. Comparar la duracion mostrada y el numero de respuestas con error.

Las tandas con cache no son una comparacion valida de red.

## Ejecucion sin la web abierta

`functions/scheduledSeoCatalogInspection` se ejecuta diariamente mediante
Cloud Scheduler, usa la identidad de servicio de Firebase y guarda en la
misma coleccion `seo_inspections`. Antes de desplegar:

1. Concede a la cuenta de servicio de la Function acceso de lectura a la
   propiedad `https://boralba.es/` en Search Console.
2. Ejecuta `firebase deploy --only functions,firestore:rules`.
3. Comprueba los logs de `scheduledSeoCatalogInspection` y la coleccion de
   inspecciones.

La Function tiene un bloqueo distribuido para evitar dos tandas simultaneas.
No se guardan credenciales OAuth en Firestore ni en el navegador.
