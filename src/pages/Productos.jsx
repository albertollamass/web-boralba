import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext'
import { useProducts } from '../context/ProductsContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { normalizeText, searchProducts } from '../lib/search'
import '../catalog.css'

const FILTERS = [
  { key: 'category', label: 'Categoría', placeholder: 'Todas las categorías' },
  { key: 'application', label: 'Aplicación', placeholder: 'Todas las aplicaciones' },
  { key: 'power', label: 'Potencia', placeholder: 'Cualquier potencia' },
  { key: 'temperature', label: 'Temperatura de color', placeholder: 'Cualquier temperatura' },
  { key: 'ip', label: 'Protección IP', placeholder: 'Cualquier protección IP' },
  { key: 'control', label: 'Sistema de control', placeholder: 'Cualquier sistema de control' },
  { key: 'cri', label: 'CRI', placeholder: 'Cualquier CRI' },
  { key: 'voltage', label: 'Tensión', placeholder: 'Cualquier tensión' },
]

const valueFor = (product, key) => {
  const specLabels = {
    power: ['potencia'], temperature: ['temperatura', 'temperatura de color'], ip: ['ip', 'proteccion ip'],
    control: ['control', 'tipo de control', 'sistema de control'], cri: ['cri', 'reproduccion cromatica'], voltage: ['voltaje', 'tension'],
  }
  if (key === 'category') return product.categoryValues || []
  if (key === 'application') return (Array.isArray(product.applications) ? product.applications : [product.applications]).map((item) => typeof item === 'string' ? item : item?.title || item?.name || item?.application || '').filter(Boolean)
  const spec = (product.specs || []).find((item) => specLabels[key]?.some((label) => normalizeText(item.label).includes(label)))
  return spec ? `${spec.value || ''} ${spec.unit || ''}`.trim() : ''
}

const valuesFor = (value) => (Array.isArray(value) ? value : [value])
  .flatMap((item) => String(item || '').split(/[,;|]/))
  .map((item) => item.trim())
  .filter(Boolean)

const comparable = (value) => normalizeText(value).replace(/\s+/g, '')

const filterMatches = (product, key, selected, getDescendantSlugs) => {
  const actual = valuesFor(valueFor(product, key))
  if (key === 'category') {
    const categorySlugs = new Set(actual)
    return getDescendantSlugs(selected).some((slug) => categorySlugs.has(slug))
  }
  return actual.some((value) => comparable(value) === comparable(selected))
}

function ProductTile({ product, categoryName }) {
  return (
    <Link className="catalog-product" to={`/producto/${product.id}`}>
      <div className="catalog-product-image">
        <img src={product.image || 'images/placeholder.svg'} alt={product.name || 'Producto Boralba'} loading="lazy" />
      </div>
      <div className="catalog-product-copy">
        <span>{categoryName || product.category}</span>
        <h3>{product.name}</h3>
        <small>{product.ref}</small>
      </div>
    </Link>
  )
}

export default function Productos() {
  const { products } = useProducts()
  const { ROOT, getChildren, getCategory, getBreadcrumb, getCategoryPathLabel, getDescendantSlugs } = useCategories()
  const { settings } = useSiteSettings()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [filtersOpen, setFiltersOpen] = useState(false)

  const categories = useMemo(() => getChildren(ROOT.slug), [getChildren, ROOT.slug])

  const productsWithCategory = useMemo(() => products.map((product) => {
    const assignedCategories = [...new Set([product.category, ...(Array.isArray(product.categories) ? product.categories : [])].filter(Boolean))]
    const categoryValues = [...new Set(assignedCategories.flatMap((category) => getBreadcrumb(category).map(({ slug }) => slug)))]
    return {
      ...product,
      categoryName: getCategory(product.category)?.name || product.category || '',
      categoryValues,
      categorySearch: assignedCategories.flatMap((assignedCategory) => getBreadcrumb(assignedCategory).map((category) => category.name)).join(' '),
    }
  }), [products, getCategory, getBreadcrumb])

  const options = useMemo(() => Object.fromEntries(FILTERS.map(({ key }) => {
    const values = productsWithCategory.flatMap((product) => valuesFor(valueFor(product, key)))
    const unique = [...new Set(values)]
    if (key === 'category') {
      return [key, unique.map((slug) => ({ value: slug, label: getCategoryPathLabel(slug) || getCategory(slug)?.name || slug }))]
    }
    return [key, unique.map((value) => ({ value, label: value }))]
  })), [productsWithCategory, getCategory, getCategoryPathLabel])

  const results = useMemo(() => {
    const hasQuery = Boolean(normalizeText(query))
    let result = hasQuery ? searchProducts(productsWithCategory, query, { synonyms: settings.searchSynonyms }) : productsWithCategory
    return result.filter((product) => FILTERS.every(({ key }) => {
      if (!filters[key]) return true
      return filterMatches(product, key, filters[key], getDescendantSlugs)
    }))
  }, [query, filters, productsWithCategory, getDescendantSlugs, settings.searchSynonyms])

  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const showingResults = Boolean(normalizeText(query) || activeFilterCount)
  const clearAll = () => { setQuery(''); setFilters({}); setFiltersOpen(false) }

  return (
    <main className="catalog-page">
      <section className="catalog-hero">
        <div className="container">
          <div className="catalog-breadcrumb"><Link to="/">Inicio</Link><span>/</span><span>Productos</span></div>
          <div className="catalog-heading">
            <div><p className="catalog-kicker">Catálogo Boralba</p><h1>La luz correcta<br /><em>para cada proyecto.</em></h1></div>
            <p className="catalog-intro">Soluciones LED profesionales para crear espacios que se sienten bien.</p>
          </div>
          <div className="catalog-search-wrap">
            <div className="catalog-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></svg>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por código, producto o característica" aria-label="Buscar por código, producto o característica" />
              {query && <button type="button" className="catalog-clear" onClick={() => setQuery('')} aria-label="Borrar búsqueda">×</button>}
            </div>
            {!query && <div className="catalog-search-note">Prueba con <button type="button" onClick={() => setQuery('tira cálida')}>tira cálida</button>, <button type="button" onClick={() => setQuery('perfil techo')}>perfil techo</button> o <button type="button" onClick={() => setQuery('DALI')}>DALI</button></div>}
          </div>
        </div>
      </section>

      <section className="catalog-categories container" aria-labelledby="catalog-categories-title">
        <div className="catalog-section-label"><span>Explora por familia</span><span className="catalog-line" /></div>
        <h2 id="catalog-categories-title">¿Qué estás buscando?</h2>
        <div className="catalog-category-grid">
          {categories.map((category) => <Link to={`/categoria/${category.slug}`} key={category.slug} className="catalog-category">
            <span className="catalog-category-image"><img src={category.image || 'images/placeholder.svg'} alt={category.name} /></span><span>{category.name}</span>
          </Link>)}
        </div>
      </section>

      <section className="catalog-results container" id="catalog-results" aria-live="polite">
        <div className="catalog-results-head">
          <div><p className="catalog-kicker">{showingResults ? 'Resultados filtrados' : 'Catálogo de productos'}</p><h2>{results.length} {results.length === 1 ? 'producto encontrado' : 'productos encontrados'}</h2></div>
          {(showingResults || activeFilterCount > 0) && <button type="button" className="catalog-reset" onClick={clearAll}>{activeFilterCount ? 'Limpiar filtros' : 'Limpiar búsqueda'} <span>×</span></button>}
        </div>
        <button type="button" className="catalog-filter-toggle" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen}>
          Filtrar productos{activeFilterCount > 0 && <b>{activeFilterCount}</b>}
        </button>
        {filtersOpen && <button type="button" className="catalog-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros" />}
        <div className={`catalog-filterbar${filtersOpen ? ' is-open' : ''}`}>
          <div className="catalog-filter-head"><span>Filtrar por</span><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros">×</button></div>
          {FILTERS.map(({ key, label, placeholder }) => <label key={key} className={`catalog-filter catalog-filter-${key}`}><span>{label}</span><select value={filters[key] || ''} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}><option value="">{placeholder}</option>{options[key].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}
          {activeFilterCount > 0 && <button type="button" className="catalog-filter-clear" onClick={() => setFilters({})}>Limpiar filtros</button>}
        </div>
        {activeFilterCount > 0 && <div className="catalog-active-filters" aria-label="Filtros seleccionados">{FILTERS.filter(({ key }) => filters[key]).map(({ key, label }) => {
          const selected = options[key].find((option) => option.value === filters[key])
          return <button type="button" key={key} className="catalog-filter-tag" onClick={() => setFilters((current) => { const next = { ...current }; delete next[key]; return next })} aria-label={`Quitar filtro ${label}`}><span>{selected?.label || filters[key]}</span><b>×</b></button>
        })}</div>}
        {results.length > 0 ? <div className="catalog-product-grid">{results.map((product) => <ProductTile key={product.id} product={product} categoryName={product.categoryName} />)}</div> : <div className="catalog-empty"><span>⌕</span><h3>No hemos encontrado productos que cumplan exactamente estos criterios.</h3><p>Puedes eliminar algún filtro o probar con una búsqueda más general.</p><button type="button" className="catalog-button" onClick={clearAll}>Borrar filtros</button></div>}
      </section>
    </main>
  )
}
