# AGENTS.md — normas del repo web-boralba

## Commits: Conventional Commits obligatorio

A partir de ahora **cada commit** sigue Conventional Commits, en español,
minúsculas y sin punto final:

```
<tipo>(<alcance opcional>): <descripción breve>
```

- Tipos: `feat` (novedad), `fix` (corrección), `refactor` (reestructura sin
  cambio visible), `docs`, `style`, `perf`, `test`, `chore`, `ci`, `build`.
- Un cambio lógico por commit. Si hace falta, cuerpo con balas explicando el
  porqué (no el qué, que ya lo dice el diff).
- Ejemplos del historial: `feat: publica proyecto Torreon de la Tercia`,
  `fix: actualiza imagen del gimnasio`.

## Antes de commitear

1. `npm run build` y `npm run lint` en verde (0 errores).
2. Revisar `git status` + `git diff`: solo ficheros intencionados, sin secretos.
3. No commitear nunca: `.env`, `serviceAccount.json`, `firestore.seed.json`,
   `storage-export/`, `node_modules/`, `dist/` (están en `.gitignore`).
4. `db.sql` es copia local de respaldo: no se commitea.
5. `public/assets/` sí se commitea (los PDF/imágenes los sirve GitHub Pages).

## Despliegue

Push a `main` despliega automáticamente a GitHub Pages (`.github/workflows/deploy.yml`).
Las `VITE_*` se inyectan en el build desde Secrets del repo
(Settings → Secrets and variables → Actions → Secrets): el `.env` nunca sube.
(Ojo: al ir incrustadas en el JS público no son secretos reales; van en Secrets
y no en Variables solo por comodidad.)
Probar en local (`npm run dev`) antes de pushear a `main`.
