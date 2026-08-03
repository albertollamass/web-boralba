import { Link } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { products } = useProducts()
  const { getChildren, ROOT } = useCategories()
  const cats = getChildren(ROOT.slug)
  const featured = products.filter((p) => p.featured).slice(0, 4)
  const outletCount = products.filter((p) => p.outlet).length

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="hero-badge">+ de 30 años en el sector</span>
            <h1>Iluminación LED profesional para arquitectura</h1>
            <p>Soluciones lumínicas diseñadas para dar forma a tus espacios y elevar cada proyecto.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/productos" className="btn btn-accent">
                Ver productos
              </Link>
              <Link to="/contacto" className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>
                Asesoramiento
              </Link>
            </div>
          </div>
          <div className="hero-img">
            <img src="images/lobby.png" alt="Proyecto de iluminación LED" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="tag">Nuestro catálogo</span>
            <h2>Familias de productos para cada proyecto</h2>
            <p>Todo lo que necesitas para tus proyectos de iluminación arquitectónica y LED profesional.</p>
          </div>
          <div className="grid grid-4">
            {cats.map((cat) => (
              <Link key={cat.slug} to={`/categoria/${cat.slug}`} className="category-card">
                <img src={cat.image} alt={cat.name} loading="lazy" />
                <div className="overlay">
                  <h3>{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-3">
            <Link to="/productos" className="btn btn-primary">
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="container">
          <div className="section-head">
            <span className="tag">Destacados</span>
            <h2>Productos más demandados</h2>
          </div>
          <div className="grid grid-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <div className="split-text">
              <span className="tag">Sobre nosotros</span>
              <h2>+ de 30 años en el sector de iluminación</h2>
              <p>
                En Boralba Lighting trabajamos ofreciendo soluciones de iluminación profesional
                para proyectos comerciales, arquitectónicos y residenciales a través de
                distribución.
              </p>
              <p>
                Acompañamos a arquitectos e interioristas en el diseño técnico de la luz:
                cálculos fotométricos, control DALI y soluciones a medida para cada espacio.
              </p>
              <Link to="/contacto" className="btn btn-primary">
                Solicitar asesoramiento
              </Link>
            </div>
            <div className="split-img">
              <img src="images/asesoramiento.png" alt="Asesoramiento en iluminación" />
            </div>
          </div>

          <div className="split reverse">
            <div className="split-img">
              <img src="images/eslogan.png" alt="Controla la iluminación" />
            </div>
            <div className="split-text">
              <span className="tag">Smart Lighting</span>
              <h2>Controla la iluminación. Domina el ambiente.</h2>
              <p>
                Diseñamos, configuramos y ponemos en marcha sistemas de iluminación inteligente,
                conectados y fáciles de controlar.
              </p>
              <Link to="/servicios" className="btn btn-primary">
                Conocer nuestros servicios
              </Link>
            </div>
          </div>

          <div className="split">
            <div className="split-text">
              <span className="tag">Partner tecnológico</span>
              <h2>Soluciones basadas en tecnología Tridonic</h2>
              <p>
                Somos partner tecnológico de TRIDONIC y trabajamos con sus soluciones de control de
                iluminación en nuestros proyectos.
              </p>
              <a
                href="https://www.tridonic.com/en/int"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                Visitar Tridonic
              </a>
            </div>
            <div className="split-img">
              <img src="images/tridonic.png" alt="Tridonic" />
            </div>
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="container">
          <div className="outlet-banner">
            <h1>Outlet</h1>
            <p>Donde las mejores luces encuentran su mejor precio</p>
            {outletCount > 0 && (
              <p>
                Actualmente hay <strong>{outletCount} producto{outletCount > 1 ? 's' : ''}</strong> en
                oferta.
              </p>
            )}
            <Link to="/outlet" className="btn btn-accent">
              Visitar
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
