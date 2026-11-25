import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './presentation/components/Layout'
import { useAuth } from './application/identity/AuthContext'
import ScrollToTop from './presentation/components/ScrollToTop'
import { useAnalyticsPageView } from './application/analytics/useAnalyticsPageView.js'

const Home = lazy(() => import('./presentation/pages/Home'))
const Productos = lazy(() => import('./presentation/pages/Productos'))
const Categoria = lazy(() => import('./presentation/pages/Categoria'))
const ProductoDetalle = lazy(() => import('./presentation/pages/ProductoDetalle'))
const Outlet = lazy(() => import('./presentation/pages/Outlet'))
const Buscar = lazy(() => import('./presentation/pages/Buscar'))
const Proyectos = lazy(() => import('./presentation/pages/Proyectos'))
const ProyectoDetalle = lazy(() => import('./presentation/pages/ProyectoDetalle'))
const Servicios = lazy(() => import('./presentation/pages/Servicios'))
const Empresa = lazy(() => import('./presentation/pages/Empresa'))
const Contacto = lazy(() => import('./presentation/pages/Contacto'))
const DisenaTuLuminaria = lazy(() => import('./presentation/pages/DisenaTuLuminaria'))
const Legal = lazy(() => import('./presentation/pages/Legal'))
const NotFound = lazy(() => import('./presentation/pages/NotFound'))
const MiPresupuesto = lazy(() => import('./presentation/pages/MiPresupuesto'))
const SolicitarPresupuesto = lazy(() => import('./presentation/pages/SolicitarPresupuesto'))
// La administración queda fuera del bundle público hasta que se visita /admin.
const AdminLogin = lazy(() => import('./presentation/admin/AdminLogin'))
const AdminPanel = lazy(() => import('./presentation/admin/AdminPanel'))

const BASENAME = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

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

export default function App({ backendEnabled, telemetry, analytics, documentStorage, quoteSender }) {
  return (
    <BrowserRouter basename={BASENAME}>
      <ScrollToTop />
      <AnalyticsPageViews analytics={analytics} />
      <Suspense fallback={<PageLoading />}>
       <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
           <Route path="/productos" element={<Productos analytics={analytics} />} />
           <Route path="/categoria/:slug" element={<Categoria />} />
           <Route path="/producto/:id" element={<ProductoDetalle analytics={analytics} />} />
           <Route path="/producto/:id/:slug" element={<ProductoDetalle analytics={analytics} />} />
          <Route path="/outlet" element={<Outlet />} />
          <Route path="/buscar" element={<Buscar analytics={analytics} />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/proyectos/:categoria/:slug" element={<ProyectoDetalle />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/empresa" element={<Empresa />} />
           <Route path="/contacto" element={<Contacto analytics={analytics} />} />
           <Route path="/presupuesto" element={<MiPresupuesto analytics={analytics} />} />
          <Route path="/presupuesto/solicitar" element={<SolicitarPresupuesto quoteSender={quoteSender} analytics={analytics} />} />
          <Route path="/disena-tu-luminaria" element={<DisenaTuLuminaria quoteSender={quoteSender} />} />
          <Route path="/legal/:slug" element={<Legal />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin backendEnabled={backendEnabled} />} />
        <Route
          path="/admin"
          element={
            <AdminRoute backendEnabled={backendEnabled}>
              <AdminPanel telemetry={telemetry} analytics={analytics} documentStorage={documentStorage} />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Layout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
       </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function PageLoading() {
  return <main className="container section page-loading" aria-live="polite"><p>Cargando contenido...</p></main>
}

function AnalyticsPageViews({ analytics }) {
  useAnalyticsPageView(analytics)
  return null
}
