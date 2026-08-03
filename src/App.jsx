import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Buscar from './pages/Buscar'
import Productos from './pages/Productos'
import Categoria from './pages/Categoria'
import ProductoDetalle from './pages/ProductoDetalle'
import Outlet from './pages/Outlet'
import Proyectos from './pages/Proyectos'
import Servicios from './pages/Servicios'
import Contacto from './pages/Contacto'
import Legal from './pages/Legal'
import AdminLogin from './admin/AdminLogin'
import AdminPanel from './admin/AdminPanel'
import { useAuth } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import ScrollToTop from './components/ScrollToTop'

const BASENAME = import.meta.env.PROD ? '/web-boralba' : '/'

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (!isSupabaseConfigured || loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Cargando...
      </div>
    )
  }
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/categoria/:slug" element={<Categoria />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/outlet" element={<Outlet />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/legal/:slug" element={<Legal />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Layout />}>
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}