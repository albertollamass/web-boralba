-- CONFIGURACIÓN SEGURA PARA BORALBA LIGHTING
-- Ejecuta en Supabase: Dashboard > SQL Editor > New query > Run

-- === TABLAS ===

-- Productos (el catálogo completo, visible al público)
create table if not exists public.products (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Categorías (dinámicas, gestionadas desde el panel de admin)
create table if not exists public.categories (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Perfiles: quién es administrador (quién puede escribir)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- === SEGURIDAD (RLS) ===

-- Activar RLS. Con esto, nadie puede hacer nada salvo lo que permiten las políticas.
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.profiles enable row level security;

-- Limpiar políticas anteriores si re-ejecutas el script
drop policy if exists "Lectura pública de productos" on public.products;
drop policy if exists "Escritura solo administradores" on public.products;
drop policy if exists "Lectura pública de categorías" on public.categories;
drop policy if exists "Escritura solo administradores categorías" on public.categories;
drop policy if exists "Perfil propio" on public.profiles;

-- Cualquiera (visitante de la web) puede LEER el catálogo
create policy "Lectura pública de productos"
  on public.products for select
  using (true);

-- Solo un usuario autenticado que esté en la tabla profiles puede CREAR/MODIFICAR/BORRAR
create policy "Escritura solo administradores"
  on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Cualquiera puede LEER las categorías
create policy "Lectura pública de categorías"
  on public.categories for select
  using (true);

-- Solo administradores pueden CREAR/MODIFICAR/BORRAR categorías
create policy "Escritura solo administradores categorías"
  on public.categories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Cada usuario solo puede ver su propio perfil
create policy "Perfil propio"
  on public.profiles for select
  using (id = auth.uid());

-- === LOGS ===

-- Registro de errores enviados desde la app (login, sincronización, RLS denegado...).
-- Cualquiera puede INSERTAR (la app lo hace sin sesión, p.ej. intentos de login),
-- pero solo los administradores pueden LEER los logs.
create table if not exists public.logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  context text not null,
  message text not null,
  user_id uuid,
  details jsonb
);

alter table public.logs enable row level security;

drop policy if exists "Insertar logs" on public.logs;
drop policy if exists "Leer logs solo administradores" on public.logs;

create policy "Insertar logs"
  on public.logs for insert
  with check (true);

create policy "Leer logs solo administradores"
  on public.logs for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- === CREAR TU USUARIO ADMIN ===
-- 1) Dashboard > Authentication > Users > "Add user" y crea el admin con tu email y una
--    contraseña fuerte. Copia el UUID que se genera.
-- 2) Sustituye 'EL-UUID-DEL-USUARIO' por ese UUID y ejecuta:
insert into public.profiles (id, role) values ('EL-UUID-DEL-USUARIO', 'admin')
on conflict (id) do nothing;
