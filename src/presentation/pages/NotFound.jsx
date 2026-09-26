import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <>
      <Seo
        title="Página no encontrada"
        description="La página que buscas no existe o ha cambiado. Explora el catálogo de iluminación LED, proyectos y servicios de Boralba Lighting."
        path="/404"
        noindex
      />
      <div className="container section" style={{ textAlign: 'center' }}>
        <p className="tag">Error 404</p>
        <h1>Página no encontrada</h1>
        <p className="muted" style={{ maxWidth: 560, margin: '12px auto 24px' }}>
          Es posible que el enlace haya cambiado. Te ayudamos a seguir: catálogo, proyectos o
          contacto directo.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">Volver al inicio</Link>
          <Link to="/productos" className="btn btn-outline">Ver productos</Link>
          <Link to="/contacto" className="btn btn-outline">Contacto</Link>
        </div>
      </div>
    </>
  )
}
