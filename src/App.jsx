import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
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
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Layout />}>
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
