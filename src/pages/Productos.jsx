import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext'
import { useProducts } from '../context/ProductsContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { normalizeText, searchProducts } from '../lib/search'
import Seo from '../components/Seo'
import { canonicalFor, breadcrumbJsonLd } from '../lib/seo'
import '../catalog.css'

/* Primer nivel de navegación: únicamente estas categorías principales, en este orden. */
const PRIMARY_CATEGORY_SLUGS = [
  'tiras-220v',
  'tiras-led',
  'tiras-neon',
  'perfiles',
  'proyectores',
  'panel-led',
  'downlight-led',
  'apliques',
  'pantalla-estanca',
]

/* Nombres editoriales de las categorías principales (el resto sigue el nombre de la base de datos). */
const FAMILY_EDITORIAL_NAMES = {
  'tiras-220v': 'Tiras LED 220V',
  'tiras-led': 'Tiras LED 24V',
  'tiras-neon': 'Tiras Neón',
  perfiles: 'Perfiles',
  proyectores: 'Proyectores',
  'panel-led': 'Paneles LED',
  'downlight-led': 'Downlight LED',
  apliques: 'Apliques',
  'pantalla-estanca': 'Pantalla estanca',
}
const displayName = (category) => (category ? FAMILY_EDITORIAL_NAMES[category.slug] || category.name : '')

/* Assets editoriales únicos para las familias base del catálogo. Las categorías nuevas
   siguen usando siempre la imagen que se haya definido desde administración. */
const FAMILY_EDITORIAL_IMAGES = {
  'tiras-led': 'images/tiras-led.png',
  'tiras-220v': 'images/tira-28117-1.png',
  'tiras-neon': 'images/neon.png',
  perfiles: 'images/perfiles.png',
  'controladores-y-fuentes': 'images/fuentes-drivers.png',
  proyectores: 'images/proyectores.png',
  'downlight-led': 'images/downlight.png',
  'panel-led': 'images/panel-led.png',
  apliques: 'images/apliques.png',
  'pantalla-estanca': 'images/pantalla-estanca.png',
}

/* ---------- utilidades sobre datos reales ---------- */

const findSpec = (product, needles) =>
  (product.specs || []).find((spec) => needles.some((needle) => normalizeText(spec.label).includes(needle)))

const KEY_SPECS = [
  { needles: ['tipo de led'], label: 'LED' },
  { needles: ['potencia'], label: 'Potencia' },
  { needles: ['reproduccion cromatica', 'cri'], label: 'CRI' },
  { needles: ['temperaturas de color', 'temperatura de color', 'color de luz'], label: 'Temperatura' },
  { needles: ['proteccion', 'grado de proteccion'], label: 'Protección' },
  { needles: ['tension de alimentacion'], label: 'Tensión' },
]
const keySpecs = (product) => {
  const out = []
  for (const item of KEY_SPECS) {
    if (out.length >= 3) break
    const spec = findSpec(product, item.needles)
    if (spec) out.push({ label: item.label, value: `${spec.value || ''} ${spec.unit || ''}`.trim() })
  }
  return out
}

/* ---------- tarjeta de producto ---------- */

function ProductTile({ product, label }) {
  const specs = keySpecs(product)
  return (
    <Link className="pc-product" to={`/producto/${product.id}`}>
      <span className="pc-product-media">
        <img src={product.image || 'images/placeholder.svg'} alt={product.name || 'Producto Boralba'} loading="lazy" />
      </span>
      <span className="pc-product-body">
        {label && <span className="pc-product-cat">{label}</span>}
        <h3 className="pc-product-name">{product.name || 'Producto'}</h3>
        {product.ref && <p className="pc-product-ref">{product.ref}</p>}
        {specs.length > 0 && (
          <dl className="pc-product-specs">
            {specs.map((spec) => (
              <Fragment key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </Fragment>
            ))}
          </dl>
        )}
        <span className="pc-product-cta">Ver producto <i>→</i></span>
      </span>
    </Link>
  )
}

export default function Productos() {
  const { products, hydrated } = useProducts()
  const { categories, ROOT, getCategory, getChildren, getBreadcrumb, getCategoryPathLabel, getDescendantSlugs } = useCategories()
  const { settings } = useSiteSettings()
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') || ''
  const g = searchParams.get('g') || ''
  const c = searchParams.get('c') || ''

  const [input, setInput] = useState(q)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const inputRef = useRef(null)
  const searchWrapRef = useRef(null)
  const drillRef = useRef(null)
  const hasDrilledRef = useRef(false)
  const setParams = (params) => setSearchParams(params)

  /* Sincroniza el campo con la búsqueda "confirmada" de la URL. */
  useEffect(() => { setInput(q) }, [q])
  /* Cierra las sugerencias al pulsar fuera. */
  useEffect(() => {
    const handler = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) setSuggestionsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Productos enriquecidos con categorías asignadas para el buscador. */
  const productsWithCategory = useMemo(() => products.map((product) => {
    const assigned = [...new Set([product.category, ...(Array.isArray(product.categories) ? product.categories : [])].filter(Boolean))]
    return {
      ...product,
      assignedCategories: assigned,
      categoryName: getCategory(product.category)?.name || product.category || '',
      categorySearch: assigned.flatMap((category) => getBreadcrumb(category).map((item) => item.name)).join(' '),
    }
  }), [products, getCategory, getBreadcrumb])

  /* Conjuntos de descendientes por categoría. */
  const descendantSets = useMemo(() => Object.fromEntries(
    categories.map((category) => [category.slug, new Set(getDescendantSlugs(category.slug))]),
  ), [categories, getDescendantSlugs])

  const productsIn = useMemo(() => (slug) => {
    const set = descendantSets[slug] || new Set([slug])
    return productsWithCategory.filter((product) => product.assignedCategories.some((assigned) => set.has(assigned)))
  }, [productsWithCategory, descendantSets])

  const productsInExact = useMemo(() => (slug) => (
    productsWithCategory.filter((product) => product.assignedCategories.includes(slug))
  ), [productsWithCategory])

  /* Familias reales de administración (data-driven, se autocompleta al añadir categorías). */
  const familySlugs = useMemo(() => {
    const set = new Set()
    categories.forEach((category) => {
      if (category.slug === ROOT.slug) return
      if (category.parent === ROOT.slug) set.add(category.slug)
      else {
        const parent = getCategory(category.parent)
        if (parent && parent.parent === ROOT.slug && getChildren(category.slug).length) set.add(category.slug)
      }
    })
    ;[...set].forEach((slug) => {
      const kids = getChildren(slug)
      if (kids.length && kids.every((kid) => set.has(kid.slug))) set.delete(slug)
    })
    return set
  }, [categories, ROOT.slug, getCategory, getChildren])

  const families = useMemo(() => (
    PRIMARY_CATEGORY_SLUGS.map((slug) => getCategory(slug)).filter(Boolean)
  ), [getCategory])

  const imageFor = (category) => (
    category.image && category.image !== 'images/placeholder.svg' && category.image.trim()
      ? category.image
      : 'images/placeholder-family.svg'
  )
  const imageForFamily = (category) => FAMILY_EDITORIAL_IMAGES[category.slug] || imageFor(category)

  /* ---------- selección actual ---------- */

  const rawFamily = g ? getCategory(g) : null
  const rawDeep = c ? getCategory(c) : null

  const effectiveFamilySlug = useMemo(() => {
    if (rawFamily) return rawFamily.slug
    if (rawDeep) {
      const fam = getBreadcrumb(rawDeep.slug).find((item) => familySlugs.has(item.slug))
      if (fam) return fam.slug
      if (rawDeep.parent === ROOT.slug && getChildren(rawDeep.slug).length) return rawDeep.slug
    }
    return ''
  }, [rawFamily, rawDeep, getBreadcrumb, familySlugs, getChildren, ROOT.slug])

  const family = effectiveFamilySlug ? getCategory(effectiveFamilySlug) : null

  const deep = useMemo(() => {
    if (!family || !rawDeep || rawDeep.slug === family.slug) return null
    const set = descendantSets[family.slug]
    return set && set.has(rawDeep.slug) ? rawDeep : null
  }, [family, rawDeep, descendantSets])

  const active = deep || family

  const isSearching = normalizeText(q).length > 0

  /* Ruta de niveles visibles desde la familia hasta la selección. */
  const drillRows = useMemo(() => {
    if (!family) return []
    const trail = active ? getBreadcrumb(active.slug) : [family]
    const start = Math.max(trail.findIndex((item) => item.slug === family.slug), 0)
    return trail.slice(start).map((level) => ({ level, children: getChildren(level.slug) }))
  }, [family, active, getBreadcrumb, getChildren])

  const isChipActive = (childSlug) => {
    if (!active) return false
    const set = descendantSets[childSlug]
    return !!set && set.has(active.slug)
  }

  /* Productos correspondientes a la selección (hoja o categoría con productos propios). */
  const showProducts = useMemo(() => {
    if (!active) return { visible: false, list: [] }
    const isLeaf = getChildren(active.slug).length === 0
    const hasDirectProducts = productsInExact(active.slug).length > 0
    if (!isLeaf && !hasDirectProducts) return { visible: false, list: [] }
    return { visible: true, list: productsIn(active.slug) }
  }, [active, getChildren, productsInExact, productsIn])

  /* Resultados de búsqueda en todo el catálogo. */
  const searchResults = useMemo(() => {
    const clean = normalizeText(q)
    if (!clean) return []
    return searchProducts(productsWithCategory, q, { synonyms: settings.searchSynonyms })
  }, [q, productsWithCategory, settings.searchSynonyms])

  /* ---------- navegación ---------- */

  const selectCategory = (slug) => {
    if (familySlugs.has(slug)) { setParams({ g: slug }); return }
    if (family) { setParams({ g: family.slug, c: slug }); return }
    const famSlug = getBreadcrumb(slug).find((item) => familySlugs.has(item.slug))?.slug
    setParams(famSlug && famSlug !== slug ? { g: famSlug, c: slug } : { g: slug })
  }
  const commitSearch = (event) => {
    if (event?.preventDefault) event.preventDefault()
    const clean = input.trim()
    if (!clean) return
    setInput(clean)
    setSuggestionsOpen(false)
    setParams({ q: clean })
  }

  /* Al elegir una familia en la cuadrícula, lleva la atención al explorador inferior. */
  useEffect(() => {
    if (!family) return
    const node = drillRef.current
    if (hasDrilledRef.current && node) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    hasDrilledRef.current = true
  }, [effectiveFamilySlug, family])

  /* ---------- sugerencias del buscador (datos reales en vivo) ---------- */
  const liveCategories = useMemo(() => {
    const clean = normalizeText(input)
    if (!clean) return []
    return categories
      .filter((category) => category.slug !== ROOT.slug && productsIn(category.slug).length > 0)
      .filter((category) => {
        const name = normalizeText(category.name)
        const path = normalizeText(getCategoryPathLabel(category.slug))
        return name.includes(clean) || path.includes(clean)
      })
      .slice(0, 3)
  }, [input, categories, ROOT.slug, productsIn, getCategoryPathLabel])

  const liveProducts = useMemo(() => {
    const clean = normalizeText(input)
    if (!clean) return { list: [], total: 0 }
    const results = searchProducts(productsWithCategory, input, { synonyms: settings.searchSynonyms })
    return { list: results.slice(0, 5), total: results.length }
  }, [input, productsWithCategory, settings.searchSynonyms])

  const suggestionsVisible = suggestionsOpen && normalizeText(input).length > 0
  const inputKind = (slug) => {
    const parts = getCategoryPathLabel(slug).split(' › ')
    return { name: parts[parts.length - 1] || '', path: parts.slice(1, -1).join(' › ') }
  }

  /* ---------- migas de la selección ---------- */
  const trail = active ? getBreadcrumb(active.slug) : []
  const crumbItems = trail.slice(trail.findIndex((item) => item.slug === family?.slug))
  const crumbSearch = (slug) => (
    slug === family?.slug ? `?g=${slug}` : `?g=${family?.slug}&c=${slug}`
  )

  const familyIndex = (
    <section className="pc-families" aria-labelledby="pc-families-title">
      <header className="pc-sec-head">
        <div>
          <p className="home-eyebrow">Nuestras familias</p>
          <h2 id="pc-families-title">Descubre nuestras gamas.</h2>
        </div>
        <Link className="pc-section-link" to="/productos">Ver todo el catálogo <i>→</i></Link>
      </header>
      <div className="pc-family-grid">
        {families.map((category) => (
          <Link
            key={category.slug}
            className={`pc-family ${family?.slug === category.slug ? 'is-active' : ''}`}
            to={{ pathname: '/productos', search: `?g=${category.slug}` }}
          >
            <span className="pc-family-media"><img src={imageForFamily(category)} alt={displayName(category)} loading="lazy" /></span>
            <span className="pc-family-copy">
              <strong>{displayName(category)}</strong>
              <span className="pc-family-cta">Ver gama <i>→</i></span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )

  const drill = family && (
    <section className="pc-drill" ref={drillRef} aria-labelledby="pc-drill-title">
      <nav className="pc-drill-crumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link><span>/</span>
        <Link to="/productos">Productos</Link>
        {crumbItems.map((item, index) => (
          <Fragment key={item.slug}>
            <span>/</span>
            {index === crumbItems.length - 1 ? (
              <span className="is-current">{displayName(item)}</span>
            ) : (
              <Link to={{ pathname: '/productos', search: crumbSearch(item.slug) }}>{displayName(item)}</Link>
            )}
          </Fragment>
        ))}
      </nav>

      <header className="pc-drill-head">
        <p className="home-eyebrow">Gama</p>
        <h2 id="pc-drill-title">{displayName(family)}</h2>
        {family.tagline && <p className="pc-drill-desc">{family.tagline}</p>}
      </header>

      {drillRows.map(({ level, children }) => (
        children.length > 0 && (
          <div className="pc-level" key={level.slug}>
            <p className="pc-level-label">{level.slug === family.slug ? 'Subcategorías' : level.name}</p>
            <div className="pc-chips">
              {children.map((child) => (
                <button
                  type="button"
                  key={child.slug}
                  className={`pc-chip${isChipActive(child.slug) ? ' is-active' : ''}`}
                  onClick={() => selectCategory(child.slug)}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )
      ))}

      {showProducts.visible && (
        <section className="pc-products" aria-labelledby="pc-products-title">
          <div className="pc-products-head">
            <div>
              <p className="home-eyebrow">Productos</p>
              <h2 id="pc-products-title">{displayName(active)}</h2>
            </div>
          </div>
          {showProducts.list.length > 0 ? (
            <div className="pc-product-grid">{showProducts.list.map((product) => <ProductTile key={product.id} product={product} label={displayName(active)} />)}</div>
          ) : (
            <div className="catalog-empty"><span>⌕</span><h3>Actualmente no hay productos disponibles en esta subcategoría.</h3><p>Puedes consultar otra opción o explorar el resto del catálogo.</p></div>
          )}
        </section>
      )}
    </section>
  )

  const searchView = (
    <section className="pc-search-view" aria-labelledby="pc-search-title">
      <header className="pc-sec-head">
        <div>
          <p className="home-eyebrow">Búsqueda</p>
          <h2 id="pc-search-title">Resultados para «{q}»</h2>
        </div>
        <Link className="pc-section-link" to="/productos">Explorar familias <i>→</i></Link>
      </header>
      {searchResults.length > 0 ? (
        <div className="pc-product-grid">{searchResults.map((product) => <ProductTile key={product.id} product={product} label={product.categoryName} />)}</div>
      ) : (
        <div className="catalog-empty"><span>⌕</span><h3>No hemos encontrado resultados para «{q}».</h3><p>Revisa la ortografía o prueba con un término más general.</p><Link to="/productos" className="pc-button">Ver todas las familias</Link></div>
      )}
    </section>
  )

  return (
    <main className="catalog-page pc-page">
      <Seo
        title="Productos — Iluminación LED profesional Boralba"
        description="Catálogo de iluminación LED Boralba: tiras LED 24V y 220V, neón flex, perfiles de aluminio y paneles LED flexibles. Explora por familia o busca por referencia, tecnología o aplicación."
        path="/productos"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', url: canonicalFor('/') },
          { name: 'Productos', url: canonicalFor('/productos') },
          ...(family ? [{ name: displayName(family), url: canonicalFor(`/productos?g=${family.slug}`) }] : []),
        ])}
      />

      {/* ============ HERO ============ */}
      <section className="pc-hero">
        <div className="container">
          <div className="pc-hero-grid">
            <div className="pc-hero-copy">
              <p className="home-eyebrow">Productos</p>
              <h1>Soluciones de iluminación<br /><em>para cada proyecto</em></h1>
              <p className="pc-hero-sub">
                Explora nuestras familias de producto y encuentra la solución adecuada por aplicación, formato o tecnología.
              </p>
              <div className="pc-search" ref={searchWrapRef}>
                <form className="pc-search-bar" onSubmit={commitSearch} role="search" aria-label="Buscar en el catálogo">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(event) => { setInput(event.target.value); setSuggestionsOpen(true) }}
                    onFocus={() => input.trim() && setSuggestionsOpen(true)}
                    onKeyDown={(event) => { if (event.key === 'Escape') setSuggestionsOpen(false) }}
                    placeholder="Buscar productos, referencias o categorías…"
                    aria-label="Buscar productos, referencias o categorías"
                  />
                  {input && <button type="button" className="pc-search-clear" onClick={() => { setInput(''); inputRef.current?.focus() }} aria-label="Borrar búsqueda">×</button>}
                  <button type="submit" className="pc-search-go">Buscar</button>
                </form>

                {suggestionsVisible && (
                  <div className="pc-search-dd">
                    {liveCategories.length > 0 && (
                      <div className="pc-search-dd-group">
                        <span className="pc-search-dd-label">Categorías</span>
                        {liveCategories.map((category) => {
                          const info = inputKind(category.slug)
                          return (
                            <button type="button" key={category.slug} className="pc-search-dd-item" onClick={() => { setSuggestionsOpen(false); selectCategory(category.slug) }}>
                              <span className="pc-search-dd-figure" aria-hidden="true">▣</span>
                              <span className="pc-search-dd-info">
                                <strong>{info.name}</strong>
                                {info.path && <small>{info.path}</small>}
                              </span>
                              <i className="pc-search-dd-arrow" aria-hidden="true">→</i>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {liveProducts.list.length > 0 && (
                      <div className="pc-search-dd-group">
                        <span className="pc-search-dd-label">Productos</span>
                        {liveProducts.list.map((product) => (
                          <Link key={product.id} className="pc-search-dd-item" to={`/producto/${product.id}`} onClick={() => setSuggestionsOpen(false)}>
                            <img src={product.image || 'images/placeholder.svg'} alt="" />
                            <span className="pc-search-dd-info">
                              <strong>{product.name}</strong>
                              {product.ref && <small>{product.ref}</small>}
                            </span>
                            <i className="pc-search-dd-arrow" aria-hidden="true">→</i>
                          </Link>
                        ))}
                      </div>
                    )}
                    {liveCategories.length === 0 && liveProducts.total === 0 && (
                      <div className="pc-search-dd-empty">
                        Sin coincidencias para «<strong>{input}</strong>». <Link to="/productos" onClick={() => setSuggestionsOpen(false)}>Ver todo el catálogo →</Link>
                      </div>
                    )}
                    {liveProducts.total > 0 && (
                      <button type="button" className="pc-search-dd-more" onClick={() => setParams({ q: input.trim() })}>
                        Ver todos los resultados ({liveProducts.total}) <i>→</i>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CUERPO ============ */}
      <div className="container pc-body">
        {!hydrated ? (
          <div className="pc-loading">Cargando catálogo…</div>
        ) : isSearching ? (
          searchView
        ) : (
          <>
            {familyIndex}
            {drill}
          </>
        )}
      </div>
    </main>
  )
}