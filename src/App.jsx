import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Productos from './pages/Productos'
import { useCategories } from './context/CategoriesContext'
import ProductoDetalle from './pages/ProductoDetalle'
import Outlet from './pages/Outlet'
import Buscar from './pages/Buscar'
import Proyectos from './pages/Proyectos'
import ProyectoDetalle from './pages/ProyectoDetalle'
import Servicios from './pages/Servicios'
import Empresa from './pages/Empresa'
import Contacto from './pages/Contacto'
import DisenaTuLuminaria from './pages/DisenaTuLuminaria'
import Legal from './pages/Legal'
import NotFound from './pages/NotFound'
import AdminLogin from './admin/AdminLogin'
import AdminPanel from './admin/AdminPanel'
import { useAuth } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import ScrollToTop from './components/ScrollToTop'

const BASENAME = import.meta.env.PROD ? '/web-boralba' : '/'

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (!isSupabaseConfigured || loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Cargando...
      </div>
    )
  }
  if (!user) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

/* Las antiguas páginas de categoría redirigen al explorador de Productos para
   mantener toda la navegación por familia y subcategoría dentro de una sola página. */
function CategoriaRedirect() {
  const { slug } = useParams()
  const { getCategory, ROOT, getChildren } = useCategories()

  const category = getCategory(slug)
  if (!category) return <Navigate to="/productos" replace />

  const parent = getCategory(category.parent)
  const isFamily =
    category.slug !== ROOT.slug &&
    (category.parent === ROOT.slug ||
      (!!parent && parent.parent === ROOT.slug && getChildren(category.slug).length > 0))

  return (
    <Navigate
      to={{ pathname: '/productos', search: isFamily ? `?g=${category.slug}` : `?c=${category.slug}` }}
      replace
    />
  )
}

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/categoria/:slug" element={<CategoriaRedirect />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/outlet" element={<Outlet />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/proyectos/:categoria/:slug" element={<ProyectoDetalle />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/empresa" element={<Empresa />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/disena-tu-luminaria" element={<DisenaTuLuminaria />} />
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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
