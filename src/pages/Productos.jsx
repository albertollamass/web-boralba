import { Link } from 'react-router-dom'
import { ROOT, getChildren } from '../data/categories'

export default function Productos() {
  const cats = getChildren(ROOT.slug)

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Productos</span>
          </div>
          <h1>Conoce nuestros productos</h1>
          <p>Soluciones de iluminación LED profesional para cualquier proyecto.</p>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div className="grid grid-2">
          {cats.map((cat) => (
            <Link key={cat.slug} to={`/categoria/${cat.slug}`} className="card" style={{ textDecoration: 'none' }}>
              <div className="card-img">
                <img src={cat.image} alt={cat.name} loading="lazy" />
              </div>
              <div className="card-body">
                <h3>{cat.name}</h3>
                <p>{cat.tagline}</p>
                <span className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
                  Ver productos
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="section-head mt-3" style={{ marginTop: 56 }}>
          <span className="tag">Catálogo completo</span>
          <h2>Descubre todos nuestros productos</h2>
          <p>Accede a nuestro catálogo completo y encuentra la solución de iluminación perfecta para tu proyecto.</p>
          <a
            href="https://www.canva.com/design/DAG2mF_yVsU/ElFlARQAFFWe1Rs1c9D9AA/edit"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary mt-2"
            style={{ display: 'inline-flex' }}
          >
            Ver catálogo
          </a>
        </div>
      </div>
    </>
  )
}
