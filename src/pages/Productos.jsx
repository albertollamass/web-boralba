import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext'
import { useProducts } from '../context/ProductsContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { normalizeText, searchProducts } from '../lib/search'

const FILTERS = [
  { key: 'application', label: 'Aplicación', placeholder: 'Todas las aplicaciones' },
  { key: 'power', label: 'Potencia', placeholder: 'Cualquier potencia' },
  { key: 'temperature', label: 'Temperatura de color', placeholder: 'Cualquier temperatura' },
  { key: 'ip', label: 'Protección IP', placeholder: 'Cualquier protección' },
  { key: 'control', label: 'Tipo de control', placeholder: 'Cualquier control' },
  { key: 'cri', label: 'CRI', placeholder: 'Cualquier CRI' },
  { key: 'voltage', label: 'Tensión', placeholder: 'Cualquier tensión' },
]

const valueFor = (product, key) => {
  const specLabels = {
    power: ['potencia'], temperature: ['temperatura', 'temperatura de color'], ip: ['ip', 'proteccion ip'],
    control: ['control', 'tipo de control', 'sistema de control'], cri: ['cri', 'reproduccion cromatica'], voltage: ['voltaje', 'tension'],
  }
  if (key === 'application') return product.applications || []
  const spec = (product.specs || []).find((item) => specLabels[key]?.includes(normalizeText(item.label)))
  return spec ? `${spec.value || ''} ${spec.unit || ''}`.trim() : ''
}

const asText = (value) => Array.isArray(value) ? value.map((item) => typeof item === 'object' ? Object.values(item).join(' ') : item).join(' ') : String(value || '')

const numericValue = (value) => Number(normalizeText(value).match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(',', '.'))

const filterMatches = (product, key, selected) => {
  const actual = asText(valueFor(product, key))
  if (!actual) return false
  if (key === 'voltage') return numericValue(actual) === numericValue(selected)
  if (key === 'ip' || key === 'cri') return numericValue(actual) >= numericValue(selected)
  return normalizeText(actual).includes(normalizeText(selected))
}

function ProductTile({ product, categoryName }) {
  return (
    <Link className="catalog-product" to={`/producto/${product.id}`}>
      <div className="catalog-product-image">
        <img src={product.image || 'images/placeholder.svg'} alt={product.name || 'Producto Boralba'} loading="lazy" />
        {product.featured && <span className="catalog-product-badge">Destacado</span>}
      </div>
      <div className="catalog-product-copy">
        <span>{categoryName || product.category || 'Producto LED'}</span>
        <h3>{product.name || 'Producto sin nombre'}</h3>
      </div>
    </Link>
  )
}

export default function Productos() {
  const { products } = useProducts()
  const { ROOT, getChildren, getCategory, getBreadcrumb, getDescendantSlugs } = useCategories()
  const { settings } = useSiteSettings()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filters, setFilters] = useState({})

  const categories = useMemo(() => getChildren(ROOT.slug), [getChildren, ROOT.slug])

  const productsWithCategory = useMemo(() => products.map((product) => {
    const assignedCategories = [...new Set([product.category, ...(Array.isArray(product.categories) ? product.categories : [])].filter(Boolean))]
    return {
      ...product,
      categoryName: getCategory(product.category)?.name || product.category || '',
      categorySearch: assignedCategories.flatMap((assignedCategory) => getBreadcrumb(assignedCategory).map((category) => category.name)).join(' '),
    }
  }), [products, getCategory, getBreadcrumb])

  const initialProducts = useMemo(() => [...productsWithCategory]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 8), [productsWithCategory])

  const options = useMemo(() => Object.fromEntries(FILTERS.map(({ key }) => {
    const values = productsWithCategory.flatMap((product) => asText(valueFor(product, key)).split(/[,;|]/))
      .map((value) => value.trim()).filter(Boolean)
    return [key, [...new Set(values)].slice(0, 24)]
  })), [productsWithCategory])

  const results = useMemo(() => {
    const hasQuery = Boolean(normalizeText(query))
    let result = hasQuery ? searchProducts(productsWithCategory, query, { synonyms: settings.searchSynonyms }) : selectedCategory ? productsWithCategory : initialProducts
    if (selectedCategory) {
      const slugs = new Set(getDescendantSlugs(selectedCategory))
      result = result.filter((product) => slugs.has(product.category) || (selectedCategory === 'downlight-led' && ['panel-led'].includes(product.category)))
    }
    return result.filter((product) => FILTERS.every(({ key }) => {
      if (!filters[key]) return true
      return filterMatches(product, key, filters[key])
    }))
  }, [query, selectedCategory, filters, productsWithCategory, initialProducts, getDescendantSlugs, settings.searchSynonyms])

  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const showingResults = Boolean(normalizeText(query) || selectedCategory || activeFilterCount)
  const clearAll = () => { setQuery(''); setSelectedCategory(''); setFilters({}) }

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
              <input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedCategory('') }} placeholder="Busca por producto, aplicación o característica" aria-label="Buscar productos" />
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
            <span className="catalog-category-image"><img src={category.image || 'images/placeholder.svg'} alt={category.name} /></span><span>{category.name}</span><b>↗</b>
          </Link>)}
        </div>
      </section>

      <section className="catalog-results container" id="catalog-results" aria-live="polite">
        <div className="catalog-results-head">
          <div><p className="catalog-kicker">{showingResults ? 'Resultados de búsqueda' : 'Selección Boralba'}</p><h2>{showingResults ? `${results.length} ${results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}` : 'Recomendados para empezar'}</h2></div>
          {(showingResults || activeFilterCount > 0) && <button type="button" className="catalog-reset" onClick={clearAll}>Limpiar búsqueda <span>×</span></button>}
        </div>
        <div className="catalog-filterbar">
          <span className="catalog-filter-label">Filtrar por</span>
          <label className="catalog-filter"><span className="sr-only">Categoría</span><select value={selectedCategory} onChange={(event) => { setSelectedCategory(event.target.value); setQuery('') }}><option value="">Todas las categorías</option>{categories.map((category) => <option value={category.slug} key={category.slug}>{category.name}</option>)}</select></label>
          {FILTERS.map(({ key, label, placeholder }) => <label key={key} className="catalog-filter"><span className="sr-only">{label}</span><select value={filters[key] || ''} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}><option value="">{placeholder}</option>{options[key].map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}
        </div>
        {results.length > 0 ? <div className="catalog-product-grid">{results.map((product) => <ProductTile key={product.id} product={product} categoryName={product.categoryName} />)}</div> : <div className="catalog-empty"><span>⌕</span><h3>No hemos encontrado productos que cumplan exactamente estos criterios.</h3><p>Puedes eliminar algún filtro o probar con una búsqueda más general.</p><button type="button" className="catalog-button" onClick={clearAll}>Limpiar criterios</button></div>}
      </section>
    </main>
  )
}
