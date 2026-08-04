import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'
import { useAuth } from '../context/AuthContext'
import { ROOT } from '../data/categories'
import ProductForm from './ProductForm'

const emptyProduct = () => ({
  name: '',
  ref: '',
  category: '',
  price: '',
  unit: '',
  image: '',
  description: '',
  longDescription: '',
  features: '',
  applications: '',
  advantages: '',
  tags: '',
  gallery: '',
  icons: '',
  datasheet: '',
  variants: [],
  specs: [],
  featured: false,
  outlet: false,
})

export default function AdminPanel() {
  const { products, addProduct, updateProduct, deleteProduct, resetProducts, syncStatus, cloudEnabled } =
    useProducts()
  const categoriesCtx = useCategories()
  const { user, isAdmin, signOut } = useAuth()
  const [view, setView] = useState('products')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [catForm, setCatForm] = useState({ open: false, editing: null })

  if (!user) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.ref || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !catFilter || p.category === catFilter
    return matchSearch && matchCat
  })

  const catName = (slug) =>
    categoriesCtx.getCategoryPathLabel ? categoriesCtx.getCategoryPathLabel(slug) : slug

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

  const openNewCategory = () => setCatForm({ open: true, editing: null })
  const openEditCategory = (cat) => setCatForm({ open: true, editing: cat })
  const closeCatForm = () => setCatForm({ open: false, editing: null })

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
            <button className="btn btn-ghost btn-sm" onClick={signOut}>
              Salir
            </button>
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
          catForm.open ? (
            <CategoryForm
              initial={catForm.editing}
              ctx={categoriesCtx}
              onCancel={closeCatForm}
              onSaved={closeCatForm}
            />
          ) : (
            <CategoriesView ctx={categoriesCtx} onNew={openNewCategory} onEdit={openEditCategory} />
          )
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
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {cloudEnabled && (
                  <span
                    className={`sync-badge sync-${syncStatus}`}
                    title={
                      syncStatus === 'cloud'
                        ? 'Los productos se guardan en Supabase'
                        : syncStatus === 'error'
                          ? 'Error guardando en la nube'
                          : 'Cargando productos de la nube…'
                    }
                  >
                    {syncStatus === 'cloud'
                      ? '☁ En la nube'
                      : syncStatus === 'error'
                        ? '⚠ Error de sincronización'
                        : '⏳ Cargando…'}
                  </span>
                )}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (confirm('¿Vaciar el catálogo? Se eliminarán todos los productos de la nube.')) {
                      resetProducts()
                    }
                  }}
                >
                  Vaciar catálogo
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
                          <img src={p.image || 'images/placeholder.svg'} alt={p.name} />
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

function CategoriesView({ ctx, onNew, onEdit }) {
  const { categories, getChildren, getCategoryPathLabel, deleteCategory } = ctx
  const { products } = useProducts()

  const countByCat = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  const tree = getChildren(ROOT.slug)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Categorías</h2>
          <span className="muted" style={{ fontSize: '0.88rem' }}>
            {categories.length} en total · se guardan en Supabase
          </span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onNew}>
          + Nueva categoría
        </button>
      </div>

      {tree.length === 0 ? (
        <div className="empty-state">
          <h3>Aún no hay categorías</h3>
          <p>
            Crea la primera categoría y después asigna productos a ella desde el formulario de
            producto.
          </p>
          <button className="btn btn-primary" onClick={onNew}>
            Crear categoría
          </button>
        </div>
      ) : (
        <CategoryList
          nodes={tree}
          getChildren={getChildren}
          getCategoryPathLabel={getCategoryPathLabel}
          countByCat={countByCat}
          onEdit={onEdit}
          onDelete={deleteCategory}
        />
      )}
    </div>
  )
}

function CategoryList({ nodes, getChildren, getCategoryPathLabel, countByCat, onEdit, onDelete }) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Categoría</th>
          <th>Ruta</th>
          <th>Subcategorías</th>
          <th>Productos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {nodes.map((node) => (
          <NodeRow
            key={node.slug}
            node={node}
            depth={0}
            getChildren={getChildren}
            getCategoryPathLabel={getCategoryPathLabel}
            countByCat={countByCat}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  )
}

function NodeRow({ node, depth, getChildren, getCategoryPathLabel, countByCat, onEdit, onDelete }) {
  const children = getChildren(node.slug)
  const total = (countByCat[node.slug] || 0) + totalDescendants(children, countByCat, getChildren)

  return (
    <>
      <tr>
        <td style={depth > 0 ? { paddingLeft: 32 + depth * 24 } : undefined}>
          <strong>{node.name}</strong>
        </td>
        <td>
          <span className="muted" style={{ fontSize: '0.84rem' }}>
            {getCategoryPathLabel(node.slug)}
          </span>
        </td>
        <td>{children.length}</td>
        <td>{total || '—'}</td>
        <td>
          <div className="actions">
            <button className="btn-edit" onClick={() => onEdit(node)}>
              Editar
            </button>
            <button
              className="btn-del"
              onClick={() => {
                if (confirm(`¿Eliminar la categoría "${node.name}"?`)) onDelete(node.slug)
              }}
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
      {children.map((child) => (
        <NodeRow
          key={child.slug}
          node={child}
          depth={depth + 1}
          getChildren={getChildren}
          getCategoryPathLabel={getCategoryPathLabel}
          countByCat={countByCat}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}

const totalDescendants = (cats, countBy, getChildren) =>
  cats.reduce(
    (acc, c) =>
      acc + (countBy[c.slug] || 0) + totalDescendants(getChildren(c.slug), countBy, getChildren),
    0,
  )

function CategoryForm({ initial, ctx, onCancel, onSaved }) {
  const { addCategory, updateCategory, categories, getChildren, getDescendantSlugs } = ctx
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    tagline: initial?.tagline || '',
    description: initial?.description || '',
    image: initial?.image || '',
    parent: initial && initial.parent !== ROOT.slug ? initial.parent : '',
  }))
  const [fileKey, setFileKey] = useState(0)
  const [uploading, setUploading] = useState(false)
  const isEdit = Boolean(initial)
  const originalSlug = initial?.slug

  const excluded = isEdit ? new Set(getDescendantSlugs(originalSlug)) : new Set()
  const catOptions = []
  const collectOptions = (slug, depth) => {
    getChildren(slug).forEach((child) => {
      if (!excluded.has(child.slug)) {
        catOptions.push({ slug: child.slug, name: child.name, depth })
      }
      collectOptions(child.slug, depth + 1)
    })
  }
  collectOptions(ROOT.slug, 0)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      setForm((f) => ({ ...f, image: dataUrl }))
    } catch {
      alert('No se pudo procesar la imagen.')
    } finally {
      setUploading(false)
      setFileKey((k) => k + 1)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('El nombre es obligatorio.')
      return
    }
    const slug = (initial?.slug || generateSlug(form.name)).toLowerCase()
    if (!isEdit && categories.some((c) => c.slug === slug)) {
      alert('Ya existe una categoría con ese slug.')
      return
    }
    const payload = {
      slug,
      name: form.name.trim(),
      tagline: form.tagline.trim() || '',
      description: form.description.trim() || '',
      image: form.image || 'images/placeholder.svg',
      parent: form.parent || ROOT.slug,
    }
    if (isEdit) {
      updateCategory(originalSlug, payload)
    } else {
      addCategory(payload)
    }
    onSaved()
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2 style={{ marginBottom: 16 }}>{isEdit ? 'Editar categoría' : 'Nueva categoría'}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label>Nombre *</label>
          <input value={form.name} onChange={set('name')} required />
        </div>
        <div>
          <label>Categoría padre</label>
          <select value={form.parent} onChange={set('parent')}>
            <option value="">{ROOT.name}</option>
            {catOptions.map((opt) => (
              <option key={opt.slug} value={opt.slug}>
                {'\u00A0'.repeat(opt.depth * 2)}
                {opt.name}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Mete la categoría dentro de otra si es una subcategoría.
          </span>
        </div>
      </div>

      <div>
        <label>Tagline (frase corta)</label>
        <input value={form.tagline} onChange={set('tagline')} />
      </div>

      <div>
        <label>Descripción</label>
        <textarea value={form.description} onChange={set('description')} />
      </div>

      <div>
        <label>Imagen</label>
        <input
          type="file"
          accept="image/*"
          key={fileKey}
          onChange={handleImage}
          style={{ padding: 8 }}
        />
        <input
          value={form.image?.startsWith('data:') ? '' : form.image}
          onChange={set('image')}
          placeholder="o pega una URL: images/xxx.jpg o https://..."
          style={{ marginTop: 8 }}
        />
        {uploading && (
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Procesando imagen...
          </span>
        )}
        {form.image && (
          <div style={{ marginTop: 8 }}>
            <img
              src={form.image}
              alt="Vista previa"
              style={{ width: 180, aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8 }}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary">
          {isEdit ? 'Guardar cambios' : 'Crear categoría'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

function fileToDataUrl(file, maxDim = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const supportsWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp')
        const format = supportsWebp ? 'image/webp' : 'image/jpeg'
        resolve(canvas.toDataURL(format, quality))
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const generateSlug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
