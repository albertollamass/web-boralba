import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './presentation/components/Layout'
import Home from './presentation/pages/Home'
import Productos from './presentation/pages/Productos'
import { useCategories } from './application/catalog/CategoriesContext'
import ProductoDetalle from './presentation/pages/ProductoDetalle'
import Outlet from './presentation/pages/Outlet'
import Buscar from './presentation/pages/Buscar'
import Proyectos from './presentation/pages/Proyectos'
import ProyectoDetalle from './presentation/pages/ProyectoDetalle'
import Servicios from './presentation/pages/Servicios'
import Empresa from './presentation/pages/Empresa'
import Contacto from './presentation/pages/Contacto'
import DisenaTuLuminaria from './presentation/pages/DisenaTuLuminaria'
import Legal from './presentation/pages/Legal'
import NotFound from './presentation/pages/NotFound'
import AdminLogin from './presentation/admin/AdminLogin'
import AdminPanel from './presentation/admin/AdminPanel'
import { useAuth } from './application/identity/AuthContext'
import ScrollToTop from './presentation/components/ScrollToTop'

const BASENAME = import.meta.env.PROD ? '/web-boralba' : '/'

function AdminRoute({ children, backendEnabled }) {
  const { user, isAdmin, loading } = useAuth()
  if (!backendEnabled || loading) {
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

export default function App({ backendEnabled, telemetry, documentStorage, quoteSender }) {
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
          <Route path="/disena-tu-luminaria" element={<DisenaTuLuminaria quoteSender={quoteSender} />} />
          <Route path="/legal/:slug" element={<Legal />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin backendEnabled={backendEnabled} />} />
        <Route
          path="/admin"
          element={
            <AdminRoute backendEnabled={backendEnabled}>
              <AdminPanel telemetry={telemetry} documentStorage={documentStorage} />
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
