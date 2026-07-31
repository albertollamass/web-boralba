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
12. [Conseguir las claves de conexión](#12-conseguir-las-claves-de-conexión)
13. [Crear el archivo `.env`](#13-crear-el-archivo-env)
14. [Arrancar la web en local](#14-arrancar-la-web-en-local)
15. [Probar la web y el panel de administración](#15-probar-la-web-y-el-panel-de-administración)
16. [Compilar la versión de producción](#16-compilar-la-versión-de-producción)
17. [Publicar la web en internet](#17-publicar-la-web-en-internet)
18. [Solución de problemas](#18-solución-de-problemas)

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

Ahora creamos la cuenta con la que entrarás en el panel `/admin`:

1. En Supabase, menú de la izquierda → **Authentication** → **Users** → **Add user**.
2. Rellena con un **email tuyo** y una **contraseña fuerte** (la que usarás para entrar en
   el panel). Pulsa **Create user**.
3. En la lista de usuarios, aparecerá tu usuario con un **UUID** (una serie de números y
   letras). **Cópialo**, lo necesitamos en el siguiente paso.

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

1. En el navegador entra en **http://localhost:5173/admin**.
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

## 18. Publicar la web en internet

Elige una de estas opciones (todas tienen plan gratis). La más sencilla para empezar es
**Vercel**.

### Opción A — Vercel (recomendada)

1. Crea cuenta en https://vercel.com (puedes usar tu cuenta de GitHub).
2. Pulsa **Add New → Project** e **Import** tu repositorio `web-boralba`.
3. Vercel detecta automáticamente que es un proyecto Vite:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Importante: en **Environment Variables** añade las dos variables del paso 14
   (`VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`). Sin esto la web no sabrá
   dónde está Supabase.
5. Pulsa **Deploy**. Cuando termine te dará una URL tipo `https://web-boralba.vercel.app`.
6. Cada vez que subas cambios a GitHub (`git push`), Vercel vuelve a publicar solo.

### Opción B — Netlify

1. Crea cuenta en https://www.netlify.com.
2. **Add new site → Import an existing project** → elige tu repositorio.
3. Build command: `npm run build` · Publish directory: `dist`.
4. Añade las mismas variables de entorno que en Vercel y **Deploy**.

### Opción C — GitHub Pages

Sirve para alojar estáticamente, pero requiere configurar el enrutado de React.
Es más incómodo para una web con varias páginas; si eres nuevo, usa Vercel o Netlify.

---

## Solución de problemas

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
   1. ¿Estás logueado en `/admin` con el usuario correcto?
   2. ¿Ejecutaste el `insert` del paso 12 con el UUID correcto?
   3. ¿Ejecutaste el script completo del paso 10?

**Error al iniciar sesión en `/admin`**
→ Confirma que el usuario existe en **Authentication → Users** y que la contraseña es la
que pusiste al crearlo.

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
