import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => ({
  // El sitio se sirve desde el dominio raíz, no desde el subdirectorio del
  // repositorio de GitHub Pages.
  base: '/',
  plugins: [react()],
}))
