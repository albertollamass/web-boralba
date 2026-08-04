import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'

export default function Outlet() {
  const { products } = useProducts()
  const outletProducts = products.filter((p) => p.outlet)
  const regular = products.filter((p) => !p.outlet).slice(0, 4)

  return (
    <>
      <div className="container section">
        <div className="outlet-banner">
          <h1>Outlet</h1>
          <p>Donde las mejores luces encuentran su mejor precio</p>
          <Link to="/contacto" className="btn btn-accent" target="_blank" rel="noreferrer">
            Contactar
          </Link>
        </div>

        <div className="section-head">
          <span className="tag">Ofertas</span>
          <h2>Productos en oferta</h2>
        </div>

        {outletProducts.length > 0 ? (
          <div className="grid grid-4">
            {outletProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No hay productos en oferta actualmente</h3>
            <p>Estamos renovando el outlet. Vuelve pronto para ver nuevas ofertas.</p>
          </div>
        )}
      </div>

      {regular.length > 0 && (
        <div className="container section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <span className="tag">Catálogo</span>
            <h2>También te puede interesar</h2>
          </div>
          <div className="grid grid-4">
            {regular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
