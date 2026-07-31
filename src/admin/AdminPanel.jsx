import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { getCategory } from '../data/categories'
import ProductForm from './ProductForm'

const emptyProduct = () => ({
  name: '',
  ref: '',
  category: '',
  price: '',
  unit: '',
  image: '',
  description: '',
  specs: [],
  featured: false,
  outlet: false,
})

export default function AdminPanel() {
  const { products, addProduct, updateProduct, deleteProduct, resetProducts, isAdmin, logout } =
    useProducts()
  const [view, setView] = useState('products')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')

  if (!isAdmin) return <Navigate to="/admin/login" replace />

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.ref || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !catFilter || p.category === catFilter
    return matchSearch && matchCat
  })

  const catName = (slug) => {
    const c = getCategory(slug)
    return c ? c.name : slug
  }

  const handleSubmit = (data) => {
    if (editing) {
      updateProduct(editing.id, data)
    } else {
      addProduct(data)
    }
    setEditing(null)
    setCreating(false)
    setView('products')
  }

  return (
    <div className="admin-layout">
      <div className="admin-bar">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/">
              <strong>◄ Boralba</strong>
            </Link>
            <span style={{ opacity: 0.8, fontSize: '0.85rem' }}>Panel de administración</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link to="/" onClick={logout}>
              Salir
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px' }}>
        <div className="admin-tabs">
          <button className={view === 'products' ? 'active' : ''} onClick={() => setView('products')}>
            Productos
          </button>
          <button
            className={view === 'categorias' ? 'active' : ''}
            onClick={() => setView('categorias')}
          >
            Categorías
          </button>
        </div>

        {view === 'categorias' ? (
          <CategoriesView />
        ) : creating || editing ? (
          <div>
            <h2 style={{ marginBottom: 16 }}>{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
            <ProductForm
              initial={editing || emptyProduct()}
              onSubmit={handleSubmit}
              onCancel={() => {
                setEditing(null)
                setCreating(false)
              }}
            />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <h2 style={{ margin: 0 }}>Productos</h2>
                <span className="muted" style={{ fontSize: '0.88rem' }}>
                  {products.length} en total · {filtered.length} mostrados
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (confirm('¿Restaurar el catálogo por defecto? Se perderán los cambios.')) {
                      resetProducts()
                    }
                  }}
                >
                  Restaurar catálogo
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
                  + Nuevo producto
                </button>
              </div>
            </div>

            <div className="filter-row">
              <input
                placeholder="Buscar por nombre o referencia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                <option value="">Todas las categorías</option>
                {[...new Set(products.map((p) => p.category))].map((slug) => (
                  <option key={slug} value={slug}>
                    {catName(slug)}
                  </option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <h3>No hay productos que coincidan</h3>
                <p>Añade productos nuevos o cambia los filtros de búsqueda.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Producto</th>
                      <th>Ref.</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Etiquetas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.image || '/images/placeholder.svg'} alt={p.name} />
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          <div className="ref">{p.description?.slice(0, 60)}...</div>
                        </td>
                        <td>{p.ref}</td>
                        <td>{catName(p.category)}</td>
                        <td>
                          {p.price != null ? `${p.price.toLocaleString('es-ES')} €` : '—'}
                        </td>
                        <td>
                          {p.outlet && <span className="badge badge-outlet">Outlet</span>}{' '}
                          {p.featured && <span className="badge badge-featured">Destacado</span>}
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="btn-edit"
                              onClick={() => {
                                setEditing(p)
                                setCreating(false)
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-del"
                              onClick={() => {
                                if (confirm(`¿Eliminar "${p.name}"?`)) deleteProduct(p.id)
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CategoriesView() {
  const { products } = useProducts()
  const leafs = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})
  const cats = Object.keys(leafs)
    .map((slug) => getCategory(slug))
    .filter(Boolean)

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Categorías</h2>
      <p className="muted">
        Las categorías se definen en <code>src/data/categories.js</code>. Puedes navegar a cada una
        desde el sitio público.
      </p>
      {cats.length === 0 ? (
        <div className="empty-state">
          <h3>Aún no hay productos asignados a categorías</h3>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Productos</th>
              <th>Enlace</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.slug}>
                <td>
                  <strong>{c.name}</strong>
                </td>
                <td>{leafs[c.slug]}</td>
                <td>
                  <Link to={`/categoria/${c.slug}`} target="_blank">
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
