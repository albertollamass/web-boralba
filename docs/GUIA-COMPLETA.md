# GUÍA COMPLETA: de cero a tener la web Boralba funcionando

Esta guía explica **todos los pasos** para montar la web de Boralba en tu ordenador y
publicarla en internet. Está pensada para **alguien que nunca ha usado estas herramientas**,
así que no damos nada por sabido.

> Se usa **Windows** con la terminal **PowerShell**. Si usas otro sistema, los conceptos
> son los mismos; cambian solo algunos comandos.

---

## Índice

1. [Qué es cada pieza](#1-qué-es-cada-pieza)
2. [Qué necesitas antes de empezar](#2-qué-necesitas-antes-de-empezar)
3. [Instalar Node.js](#3-instalar-nodejs)
4. [Instalar Git](#4-instalar-git)
5. [Configurar Git por primera vez](#5-configurar-git-por-primera-vez)
6. [Conseguir el proyecto en tu ordenador](#6-conseguir-el-proyecto-en-tu-ordenador)
7. [Subir el proyecto a GitHub](#7-subir-el-proyecto-a-github)
8. [Instalar las dependencias del proyecto](#8-instalar-las-dependencias-del-proyecto)
9. [Crear el proyecto en Supabase](#9-crear-el-proyecto-en-supabase)
10. [Crear las tablas y las políticas de seguridad (SQL)](#10-crear-las-tablas-y-las-políticas-de-seguridad-sql)
11. [Crear el usuario administrador](#11-crear-el-usuario-administrador)
12. [Marcar al usuario como administrador (y añadir/quitar más)](#12-marcar-al-usuario-como-administrador-y-añadirquitar-más)
13. [Conseguir las claves de conexión](#13-conseguir-las-claves-de-conexión)
14. [Crear el archivo `.env`](#14-crear-el-archivo-env)
15. [Arrancar la web en local](#15-arrancar-la-web-en-local)
16. [Probar la web y el panel de administración](#16-probar-la-web-y-el-panel-de-administración)
17. [Compilar la versión de producción](#17-compilar-la-versión-de-producción)
18. [Publicar la web en internet (GitHub Pages)](#18-publicar-la-web-en-internet-github-pages)
19. [Cómo se actualiza la web](#19-cómo-se-actualiza-la-web)
20. [Integración de Supabase con GitHub (opcional)](#20-opcional-integración-de-supabase-con-github-para-migraciones)
21. [Trabajar con OpenCode (asistente de IA gratuito)](#21-trabajar-con-opencode-asistente-de-ia-en-la-terminal)
22. [Solución de problemas](#22-solución-de-problemas)

---

## 1. Qué es cada pieza

Antes de empezar, así es "el mapa" de lo que vamos a montar:

| Pieza | Qué es | Para qué sirve |
|---|---|---|
| **Node.js** | Programa que ejecuta JavaScript fuera del navegador | Nos deja arrancar y compilar la web |
| **npm** | "Gestor de paquetes" que viene con Node | Descarga las librerías que usa la web |
| **Git** | Programa de control de versiones | Guarda el historial del proyecto y sirve para subirlo a GitHub |
| **GitHub** | Web para guardar proyectos en la nube | Copia de seguridad del código y colaboración |
| **Vite + React** | Tecnologías con las que está hecha la web | El propio proyecto |
| **Supabase** | Base de datos en la nube + sistema de login | Guarda los productos y autentica al administrador |
| **Vercel / Netlify** | Servicio de alojamiento web | Publica la web para que la vea todo el mundo |

---

## 2. Qué necesitas antes de empezar

- Un ordenador con **Windows**.
- Conexión a internet.
- Un navegador (Chrome, Edge o Firefox).
- Tu email para crear cuentas gratuitas (GitHub y Supabase).

Vamos a instalar las herramientas en este orden: **Node.js** → **Git** → cuentas (GitHub, Supabase).

---

## 3. Instalar Node.js

Node.js incluye **npm**, así que se instalan las dos cosas a la vez.

1. Abre https://nodejs.org/.
2. Pulsa el botón verde **"Download Node.js LTS"** (la versión LTS, la recomendada).
3. Ejecuta el archivo descargado y pulsa **Siguiente** en todo (deja las opciones por defecto).
4. Al terminar, abre la terminal:

   **Cómo abrir PowerShell:**
   - Pulsa la tecla de Windows y escribe `powershell`.
   - Pulsa Enter (no hace falta abrirla como administrador).

5. Escribe esto y pulsa Enter:

   ```powershell
   node --version
   npm --version
   ```

   Deberías ver dos números (p. ej. `v24.18.0` y `11.x.x`). Si ves "no se reconoce
   como un comando", cierra y reabre la terminal (o reinicia el ordenador) y vuelve a probar.

> **Nota Windows + PowerShell:** en algunos equipos el comando `npm` da error de
> "política de ejecución" o no existe como `npm.ps1`. La solución más sencilla es usar
> **`npm.cmd`** en lugar de `npm`. En esta guía usaremos siempre `npm.cmd` para que
> funcione igual en tu equipo.

---

## 4. Instalar Git

1. Abre https://git-scm.com/download/win.
2. Descarga e instala. En las pantallas del instalador deja todo por defecto y pulsa
   **Next** hasta el final, luego **Install** y **Finish**.
3. Comprueba que quedó bien. En PowerShell escribe:

   ```powershell
   git --version
   ```

   Debe salir algo como `git version 2.55.0.windows.3`.

---

## 5. Configurar Git por primera vez

Git necesita saber quién eres para firmar los cambios que hagas. Ejecuta (cambiando los
valores por los tuyos):

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

> Este email no tiene que ser el de una cuenta de GitHub; es solo para el historial.

---

## 6. Conseguir el proyecto en tu ordenador

Tienes el proyecto en una carpeta. Antes de trabajar con Git, la carpeta no es todavía un
"repositorio" (Git no la está vigilando). Lo convertimos en repositorio:

1. Abre PowerShell.
2. Ve a la carpeta del proyecto:

   ```powershell
   cd "C:\Users\TU_USUARIO\Desktop\...\web-boralba"
   ```

   > Truco: escribe `cd `, arrastra la carpeta dentro de la ventana de PowerShell y pulsa
   > Enter. Así se escribe la ruta sola.

3. Inicializa el repositorio:

   ```powershell
   git init
   git add .
   git commit -m "Primera versión de la web"
   ```

   - `git init` → crea el repositorio vacío.
   - `git add .` → marca todos los archivos para guardarlos.
   - `git commit` → los guarda con un mensaje (una "foto" del proyecto).

> El archivo `.gitignore` le dice a Git qué NO debe guardar (por ejemplo `node_modules`
> y `.env`, que contiene tus claves secretas). No lo borres.

---

## 7. Subir el proyecto a GitHub

GitHub es opcional, pero es la **copia de seguridad** de tu código y además permite
instalarlo en otro ordenador con un solo comando.

### 7.1 Crear la cuenta

1. Abre https://github.com y pulsa **Sign up**.
2. Rellena el formulario y confirma tu email.

### 7.2 Crear el repositorio

1. Pulsa el botón **"+"** (arriba a la derecha) → **New repository**.
2. **Repository name:** `web-boralba`.
3. Déjalo en **Private** (privado) o **Public** (público) según prefieras.
4. **No** marques ninguna casilla de "Add a README / .gitignore / license" (el proyecto ya
   tiene los suyos). Pulsa **Create repository**.

### 7.3 Conectar tu ordenador con GitHub (login desde la terminal)

Cuando ejecutes el comando de subida, GitHub te pedirá usuario y contraseña. Para que sea
más cómodo, instala la herramienta oficial `gh`:

1. Abre https://cli.github.com/ y descarga el instalador para Windows. Instálalo.
2. En PowerShell:

   ```powershell
   gh auth login
   ```

3. Sigue los pasos: elige **GitHub.com** → **HTTPS** → **Login with a web browser** y pulsa
   Enter. Se abrirá el navegador; confirma y vuelve a la terminal.

### 7.4 Subir el proyecto

En la página de tu repositorio recién creado, GitHub muestra unos comandos. Los que nos
interesan son los de "…or push an existing repository from the command line". En PowerShell:

```powershell
git remote add origin https://github.com/TU_USUARIO/web-boralba.git
git branch -M main
git push -u origin main
```

Recarga la página de GitHub: verás todos los archivos del proyecto.

### 7.5 (Opcional) Instalar el proyecto en otro ordenador

En el ordenador nuevo, con Node y Git instalados:

```powershell
git clone https://github.com/TU_USUARIO/web-boralba.git
cd web-boralba
```

Después sigue desde el paso 8 (recuerda que necesitarás crear tu `.env` local, paso 13).

---

## 8. Instalar las dependencias del proyecto

El proyecto necesita descargar las librerías que usa (React, Vite, Supabase…). Con la
terminal abierta **dentro de la carpeta del proyecto**:

```powershell
npm.cmd install
```

Esto crea la carpeta `node_modules` (no la toques) y tarda un par de minutos la primera vez.

> Si algún día se cambia de ordenador, no hace falta copiar `node_modules`: basta con
> ejecutar `npm.cmd install` otra vez.

---

## 9. Crear el proyecto en Supabase

Supabase nos da la **base de datos** (donde se guardan los productos) y el **sistema de
login** del administrador, todo en la nube y gratis.

1. Abre https://supabase.com y pulsa **Start your project** → crea una cuenta con tu email.
2. En el panel de Supabase, pulsa **New project**.
3. Rellena:
   - **Name:** `boralba-lightning` (o el nombre que quieras).
   - **Database Password:** crea una contraseña (anótala, sirve para acceder a la base de
     datos directamente).
   - **Region:** la más cercana a ti (p. ej. `EU West`).
4. Pulsa **Create new project** y espera a que termine (1-2 minutos).

---

## 10. Crear las tablas y las políticas de seguridad (SQL)

En el proyecto de Supabase:

1. Ve a la pestaña **SQL Editor** (en el menú de la izquierda).
2. Pulsa **New query**.
3. Abre el archivo `supabase/schema.sql` de tu proyecto con el Bloc de notas (clic derecho →
   **Abrir con** → **Bloc de notas**) y **copia todo su contenido**.
4. Pégalo en el editor de Supabase y pulsa **Run** (arriba a la derecha).

Qué hace ese script:

- Crea la tabla `products` (guardará el catálogo).
- Crea la tabla `profiles` (guardará quién es administrador).
- Activa **RLS** (Row Level Security): una política de seguridad que hace que
  **cualquiera pueda LEER el catálogo, pero solo los administradores puedan escribir**.

> Si te sale algún error del tipo "already exists" es porque ya lo habías ejecutado antes:
> no pasa nada, el script está preparado para repetirse.

---

## 11. Crear el usuario administrador

Ahora creamos la cuenta con la que entrarás en el panel (`#/admin`):

1. En Supabase, menú de la izquierda → **Authentication** → **Users** → **Add user**.
2. Rellena con un **email tuyo** y una **contraseña fuerte** (la que usarás para entrar en
   el panel). Pulsa **Create user**.
3. En la lista de usuarios, aparecerá tu usuario con un **UUID** (una serie de números y
   letras). **Cópialo**, lo necesitamos en el siguiente paso.

> **Ojo con la confirmación de email.** Por defecto Supabase envía un correo de
> confirmación y el usuario **no puede iniciar sesión hasta que lo confirme** (da el error
> "email o contraseña incorrectos" aunque sean correctos). Si quieres que el acceso sea
> inmediato, desactiva la confirmación en **Authentication → Providers → Email** →
> desmarca **"Confirm email"**. El usuario debe tener status **Active** en la lista.

---

## 12. Marcar a ese usuario como administrador

La web solo deja escribir a los usuarios que están en la tabla `profiles` con rol `admin`.

1. Vuelve al **SQL Editor** → **New query**.
2. Ejecuta lo siguiente **cambiando `EL-UUID-DEL-USUARIO` por el UUID que copiaste**:

   ```sql
   insert into public.profiles (id, role) values ('EL-UUID-DEL-USUARIO', 'admin')
   on conflict (id) do nothing;
   ```

3. Pulsa **Run**. Debe decir "Success".

### Añadir otro administrador

La web **no necesita redesplegarse** para esto; se hace todo en Supabase y es inmediato.

1. En **Authentication → Users → Add user** crea el nuevo usuario (email + contraseña).
2. Copia su **UUID** y ejecuta en el SQL Editor:

   ```sql
   insert into public.profiles (id, role) values ('EL-UUID-DEL-USUARIO', 'admin')
   on conflict (id) do nothing;
   ```

3. Ese usuario ya puede entrar en `https://TU_USUARIO.github.io/web-boralba/#/admin`
   con su email y contraseña.

> Recuerda el tema de la **confirmación de email** (paso 11): si el usuario está
> "Unconfirmed", no podrá iniciar sesión hasta confirmar el correo (o desactivar la
> confirmación).

### Quitar a un administrador

Borra su fila de la tabla `profiles`:

```sql
delete from public.profiles where id = 'EL-UUID-DEL-USUARIO';
```

Puede seguir iniciando sesión en `#/admin`, pero **no podrá modificar nada**.

---

## 13. Conseguir las claves de conexión

1. En Supabase, menú de la izquierda → **Project Settings** (ajustes del proyecto) → **API**.
2. Copia estos dos valores:
   - **Project URL** (empieza por `https://...supabase.co`).
   - La **publishable key** (empieza por `sb_publishable_...`). Supabase recomienda estas
     claves en lugar de las antiguas "anon keys".

> La **service role key** que aparece en esa misma página es **SECRETA**: nunca debe ir en
> el código de la web ni en GitHub. Solo la necesita un servidor, que aquí no usamos.

---

## 14. Crear el archivo `.env`

El archivo `.env` guarda las claves de conexión para que la web sepa dónde está Supabase.

1. En la carpeta del proyecto hay un archivo llamado `.env.example`. Haz una **copia** y
   renómbrala a `.env` (sin el `.example`).
   - En el Explorador de Windows: activa "Ver → Elementos ocultos" si no lo ves.
   - O en PowerShell: `Copy-Item .env.example .env`

2. Ábrelo con el Bloc de notas y rellénalo con tus claves (las del paso 13):

   ```env
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

3. Guárdalo.

> - Las variables de Vite **deben empezar por `VITE_`** para que la web pueda leerlas.
> - `.env` **no se sube a GitHub** (está en `.gitignore`). Si cambias de ordenador,
>   recréalo ahí. Por eso dejamos `.env.example` como plantilla.

---

## 15. Arrancar la web en local

Con la terminal abierta en la carpeta del proyecto:

```powershell
npm.cmd run dev
```

Verás un mensaje parecido a:

```
  ➜  Local:   http://localhost:5173/
```

Abre tu navegador y entra en **http://localhost:5173** → ¡ya está la web funcionando!

- El servidor se queda "escuchando": cualquier cambio que hagas en el código se ve al momento.
- Para pararlo, pulsa `Ctrl + C` en la terminal.

---

## 16. Probar la web y el panel de administración

1. En el navegador entra en **http://localhost:5173/#/admin**.
2. Te pedirá **email y contraseña**: los del usuario que creaste en Supabase (paso 11).
3. Dentro del panel verás el listado de productos y, arriba a la derecha, el botón
   **"Subir catálogo a la nube"**. Púlsalo: copia los productos iniciales a Supabase.
   Debe aparecer el aviso "Catálogo subido a la nube" y el badge verde **"☁ En la nube"**.
4. Crea, edita o borra un producto: se guarda **en la nube**, no en tu navegador.
5. Abre la web en una pestaña de **incógnito** (o en otro ordenador) y verás los mismos
   productos: eso confirma que está leyendo de Supabase.

---

## 17. Compilar la versión de producción

Para publicar la web hay que generar la versión "empaquetada" (más rápida y ligera):

```powershell
npm.cmd run build
```

Se crea la carpeta `dist/` con la web lista para publicar. Para probarla localmente:

```powershell
npm.cmd run preview
```

Abre http://localhost:4173/ para verla.

---

## 18. Publicar la web en internet (GitHub Pages)

Esta web **ya está publicada** en GitHub Pages en
**https://albertollamass.github.io/web-boralba/** y se actualiza sola con cada `git push`.
Estas son las piezas que lo hacen posible (por si hay que replicarlo en otro proyecto).

### Por qué el proyecto está preparado para GitHub Pages

GitHub Pages sirve la web dentro de una subcarpeta
(`https://TU_USUARIO.github.io/web-boralba/`). Para que imágenes, estilos y rutas carguen
bien ahí, el proyecto usa:

- **Rutas relativas** en las imágenes (`images/...` en vez de `/images/...`).
- **`base: './'`** en `vite.config.js`.
- **HashRouter**: las rutas llevan un `#/` delante (`#/productos`, `#/admin`…). Así GitHub
  Pages nunca da error 404 al refrescar una página interna, cosa que sí pasa con las rutas
  normales de React.

### Requisito: repositorio público

GitHub Pages en el plan gratuito solo funciona con repositorios **públicos**. El de este
proyecto es `https://github.com/albertollamass/web-boralba` (público).

### Despliegue automático con GitHub Actions

El archivo `.github/workflows/deploy.yml` hace que cada `push` a la rama `main`:

1. Instale las dependencias y compile el proyecto (`npm run build`).
2. Suba el resultado (carpeta `dist/`) como artefacto.
3. Lo publique en GitHub Pages.

### Variables de entorno en GitHub

El build necesita saber dónde está Supabase. Están guardadas en el repositorio en
**Settings → Secrets and variables → Actions → Variables**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

(son los mismos valores del paso 13). Si algún día cambian, actualízalas ahí y haz un push.

### Activar GitHub Pages (solo una vez)

**Settings → Pages → Source:** elige **GitHub Actions** y guarda. La primera vez que se
complete un despliegue, la web queda disponible en `https://TU_USUARIO.github.io/web-boralba/`.

### Subir una actualización

```powershell
git add .
git commit -m "qué he cambiado"
git push
```

GitHub compila y publica solo en ~1 minuto. Puedes seguir el proceso en la pestaña
**Actions** del repositorio.

### Alternativas (Vercel / Netlify)

Funcionan igual de bien si algún día quieres otra URL:

**Vercel** — https://vercel.com → **Add New → Project** → importa el repositorio.
*Framework Preset:* Vite · *Build Command:* `npm run build` · *Output:* `dist`. Añade las
dos variables de entorno y **Deploy**.

**Netlify** — https://www.netlify.com → **Add new site → Import an existing project**.
Build command: `npm run build` · Publish directory: `dist`. Añade las variables y **Deploy**.

---

## 19. Cómo se actualiza la web

Depende del tipo de cambio:

- **Código** (diseño, páginas, funcionalidad): con `git push` se compila y redespliega
  solo (paso 18). No hay que hacer nada más.
- **Productos (datos)**: la web los lee de Supabase en cada carga de página. Si añades,
  editas o borras un producto desde el panel `#/admin`, se ve en la web al recargar. Tampoco
  requiere redesplegar.
- **Usuarios administradores**: se gestionan en Supabase (paso 12), sin tocar la web.
- **Base de datos** (tablas, políticas de seguridad): se cambia con SQL en el dashboard, o
  automáticamente con la integración del paso 20 (opcional).

---

## 20. (Opcional) Integración de Supabase con GitHub para migraciones

Para no copiar/pegar SQL en el dashboard, Supabase puede aplicar automáticamente los
ficheros SQL de la carpeta `supabase/migrations/` del repositorio cuando haces push.

**Qué es una migración:** un fichero SQL con nombre numerado (p. ej.
`20260731120000_cambios.sql`).

**Cómo funciona:** con la integración activada, al hacer push a `main`, Supabase aplica las
migraciones nuevas que encuentre en `supabase/migrations/`.

**Qué NO cubre:**

- Crear/borrar **usuarios de Auth** (los admins se siguen gestionando en Authentication).
- Los **datos** (productos): eso va por la web/panel.

**Riesgos:**

- Se aplica a la base de datos de **producción**: una migración con errores puede romperla.
- Si editas la base de datos a mano en el dashboard, el repositorio se desincroniza
  ("deriva"): las migraciones deben ser la única fuente de verdad.
- Antes de activarla hay que hacer un "snapshot" del estado actual (`supabase db pull`)
  para que no intente re-aplicar lo que ya existe.

**Pasos (avanzado):**

1. Instala la CLI de Supabase: `npm.cmd install -g supabase`.
2. `supabase login` (abre el navegador para autorizar).
3. `supabase link --project-ref TU_PROJECT_REF` (el código de tu proyecto, p. ej.
   `hbpyxjjqgqmyhcrqoban`).
4. `supabase db pull` para capturar el esquema actual como migración inicial.
5. En el dashboard: **Database → Migrations → Connect GitHub repository** y elige tu repo.
6. A partir de ahí, cada cambio de base de datos se escribe en un fichero
   `supabase/migrations/` y se aplica solo al hacer push.

> Recomendación: usa esta integración solo cuando necesites cambiar la estructura de la
> base de datos. Para productos y administradores, lo que ya está montado es suficiente.

---

## 21. Trabajar con OpenCode (asistente de IA en la terminal)

OpenCode es un asistente de IA que se usa desde la terminal: le pides cosas en lenguaje
normal (en español funciona perfecto) y él **lee, edita y ejecuta comandos en el proyecto**
por ti. Así se ha construido esta web. Para que el asistente solo te ayude de forma
**gratuita**, se usan los modelos "Free" de OpenCode Zen.

### 21.1 Instalarlo

Con Node instalado (paso 3):

```powershell
npm.cmd install -g opencode-ai
```

También puedes instalarlo con el instalador oficial
(`curl -fsSL https://opencode.ai/install | bash`) o con Scoop/Chocolatey
(`scoop install opencode`, `choco install opencode`).

### 21.2 Configurar un modelo gratuito (OpenCode Zen)

1. Abre una terminal en la carpeta del proyecto y escribe:

   ```powershell
   opencode
   ```

2. Dentro de OpenCode, ejecuta el comando `/connect`, elige **opencode** (OpenCode Zen) y
   abre **https://opencode.ai/auth** para iniciar sesión y copiar tu API key.
   > Crearás una cuenta en OpenCode Zen. Puede pedirte datos de facturación, pero los
   > modelos "Free" no cobran nada (coste 0).
3. Pega la API key cuando OpenCode te la pida.
4. Ejecuta `/models` y selecciona un modelo **gratuito**, por ejemplo:
   `opencode/deepseek-v4-flash-free` (es el que se ha usado para construir esta web).

> El formato del modelo es `proveedor/modelo`. Con Zen, el proveedor es `opencode`.

Modelos gratuitos de Zen disponibles por ahora (algunos por tiempo limitado):
DeepSeek V4 Flash Free, MiMo-V2.5 Free, Laguna S 2.1 Free, Ling-3.0-flash Free,
North Mini Code Free, Nemotron 3 Ultra Free y Big Pickle.

Para que OpenCode arranque siempre con tu modelo gratuito, crea un archivo `opencode.json`
en la raíz del proyecto:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/deepseek-v4-flash-free"
}
```

### 21.3 Cómo trabajar con él (como con esta web)

1. **Arranca en el proyecto:** `cd web-boralba` y después `opencode`.
2. **Pídele las cosas en lenguaje normal**, describiendo qué quieres y dónde. Cuanta más
   información, mejor (p. ej. "en la ficha de producto haz que la galería tenga
   miniaturas clicables").
3. **Él usa herramientas solo:** lee archivos, busca en el código, edita, ejecuta
   `npm.cmd run build` para comprobar que no se rompe nada y reinicia el servidor si hace falta.
4. **Modo Plan vs. Modo Build:** pulsa **Tab** para alternar entre "solo proponer" (te
   explica cómo lo haría sin tocar nada) y "ejecutar" (hace los cambios).
5. **Referenciar archivos:** escribe `@` + el nombre para que lo tenga en cuenta
   (p. ej. `@src/pages/ProductoDetalle.jsx`).
6. **Deshacer/rehacer:** `/undo` y `/redo` si no te convence un cambio.
7. **Revisar antes de publicar:** comprueba lo que ha cambiado con `git status` y `git diff`,
   y sube los cambios solo cuando estés de acuerdo:

   ```powershell
   git add .
   git commit -m "lo que he cambiado"
   git push
   ```

   (El `git push` también publica la web sola, como en el paso 18.)

**Consejos:**

- Pide cambios **pequeños y concretos**; es más fácil revisarlos y corregirlos.
- Si algo falla, copia el mensaje de error y pídele que lo arregle.
- Nunca subas a GitHub sin revisar: **tú decides qué se publica**.
- Documentación oficial: https://opencode.ai/docs

---

## 22. Solución de problemas

**`npm` no se reconoce como comando**
→ Usa `npm.cmd` en vez de `npm`, o reinstala Node.js.

**`npm.cmd run dev` no arranca o da error de "execution policy"**
→ Cierra y reabre PowerShell. Si persiste:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

(ejecútalo una vez; puedes tener que confirmar escribiendo `S`).

**El puerto 5173 ya está en uso**
→ Cierra la otra terminal que tenga la web abierta, o arranca en otro puerto:

```powershell
npm.cmd run dev -- --port 5174
```

**La web carga pero no hay productos**
→ Revisa el paso 16: sube el catálogo desde el panel. También comprueba que `.env` tiene
las claves correctas.

**El panel dice "No se pudo subir a la nube"**
→ Casi siempre es un problema de permisos:
   1. ¿Estás logueado en `#/admin` con el usuario correcto?
   2. ¿Ejecutaste el `insert` del paso 12 con el UUID correcto?
   3. ¿Ejecutaste el script completo del paso 10?

**Error al iniciar sesión en `#/admin` ("email o contraseña incorrectos")**
→ Confirma que el usuario existe en **Authentication → Users** y que la contraseña es la
que pusiste al crearlo. Si el status del usuario no es **Active** (aparece "Unconfirmed" o
"Invited"), es la **confirmación de email**: desactívala en **Authentication → Providers →
Email → Confirm email** o haz que el usuario confirme el correo.

**En otro ordenador la web muestra el catálogo de fábrica y no mis cambios**
→ Es normal si ese ordenador no tiene `.env`. Crea el `.env` con las claves de Supabase
(paso 14) y volverá a leer la nube.

---

## Resumen de los comandos que usas a diario

```powershell
npm.cmd run dev      # arrancar la web en local (http://localhost:5173)
npm.cmd run build    # generar la versión de producción (dist/)
npm.cmd run preview  # probar la versión de producción en local
npm.cmd run lint     # revisar el código por errores

git status           # ver qué archivos han cambiado
git add .
git commit -m "mensaje"
git push             # subir cambios a GitHub
```
