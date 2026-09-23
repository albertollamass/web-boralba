import { Fragment } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Reveal from '../components/Reveal'
import Seo from '../components/Seo'
import ProyectoPilates from '../components/ProyectoPilates'
import { getProjectCategory, getProject } from '../data/proyectos'
import { SITE, canonicalFor, breadcrumbJsonLd } from '../lib/seo'

const isDev = import.meta.env.DEV

function ImagePlaceholder({ label, title, className = '' }) {
  const cls = `proy-ed-ph${title ? ' proy-ed-ph--title' : ''}${className ? ' ' + className : ''}`
  return (
    <div className={cls} role="img" aria-label={title || `IMAGEN PENDIENTE · ${label}`}>
      {title ? (
        <span>{title}</span>
      ) : (
        <>
          <span className="proy-ed-ph-kicker">IMAGEN PENDIENTE</span>
          <span className="proy-ed-ph-label">{label}</span>
        </>
      )}
    </div>
  )
}

function MediaSlot({ src, alt, label, className = '' }) {
  return (
    <Reveal variant="none" className={`proy-ed-media ${className}`}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <ImagePlaceholder label={label} />
      )}
    </Reveal>
  )
}

function PendingText({ children }) {
  return <p className="proy-ed-pending-text">{children}</p>
}

export default function ProyectoDetalle() {
  const { categoria, slug } = useParams()
  const category = getProjectCategory(categoria)
  const project = getProject(categoria, slug)

  if (!category || !project) {
    return <Navigate to="/proyectos" replace />
  }

  if (project.template === 'reportaje') {
    return <ProyectoPilates project={project} />
  }

  const images = project.images || []
  const datos = project.datos || {}
  const extras = datos.extras || []

  const productos = (project.productos || []).map((producto) =>
    typeof producto === 'string'
      ? { nombre: producto }
      : { nombre: '', ref: '', id: '', image: '', ...producto }
  )

  const DETAIL_FIELDS = [
    { label: 'Temperatura de color', value: datos.temperatura },
    { label: 'CRI', value: datos.cri },
    { label: 'Sistema de control', value: project.control },
    { label: 'Tipo de iluminación', value: project.type },
  ]
  const detailItems = DETAIL_FIELDS.filter((field) => isDev || field.value).map((field) => ({
    label: field.label,
    value: field.value || '—',
  }))

  const metaParts = [project.location, category.name, project.year].filter(Boolean)

  const gallerySlots = [
    { src: images[4], label: 'Vista panorámica', className: 'proy-ed-gallery-item--pano' },
    { src: images[5], label: 'Vista vertical', className: 'proy-ed-gallery-item--portrait' },
    { src: images[6], label: 'Detalle de luminaria', className: 'proy-ed-gallery-item--detail' },
  ]

  const hasDetailItems = detailItems.length > 0 || extras.length > 0
  const showDetails = isDev || hasDetailItems
  const hasRealProductos = productos.length > 0

  return (
    <div className="proyectos-redesign proyectos-redesign--editorial">
      <Seo
        title={`${project.name} — Proyecto de iluminación`}
        description={project.intro || project.elProyecto?.slice(0, 155) || `Proyecto de iluminación ${project.name} de Boralba Lighting.`}
        path={`/proyectos/${project.category}/${project.slug}`}
        image={images[0] ? `${SITE.url}/${String(images[0]).replace(/^\//, '')}` : undefined}
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'Home', url: canonicalFor('/') },
            { name: 'Proyectos', url: canonicalFor('/proyectos') },
            { name: project.name, url: canonicalFor(`/proyectos/${project.category}/${project.slug}`) },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: project.name,
            description: project.intro || project.elProyecto || '',
            image: images[0] ? `${SITE.url}/${String(images[0]).replace(/^\//, '')}` : undefined,
            author: { '@type': 'Organization', name: SITE.legalName },
          },
        ]}
      />
      {/* ============ 1 · HERO ============ */}
      <section className="proy-ed-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Ruta de navegación">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/proyectos">Proyectos</Link>
            <span>/</span>
            <span>{project.name}</span>
          </nav>
        </div>
        <Reveal variant="none" className="proy-ed-hero-media">
          {images[0] ? (
            <img src={images[0]} alt={project.name} />
          ) : (
            <ImagePlaceholder title="IMAGEN PRINCIPAL DEL PROYECTO" />
          )}
        </Reveal>
        <div className="container">
          <header className="proy-ed-head">
            <Reveal>
              <p className="proy-eyebrow">{category.name}</p>
              <h1>{project.name}</h1>
            </Reveal>
            <Reveal delay={90} className="proy-ed-head-side">
              {metaParts.length > 0 && (
                <p className="proy-ed-head-meta">
                  {metaParts.map((part, index) => (
                    <Fragment key={part}>
                      {index > 0 && <i aria-hidden="true">·</i>}
                      <span>{part}</span>
                    </Fragment>
                  ))}
                </p>
              )}
              {project.intro ? (
                <p className="proy-ed-intro">{project.intro}</p>
              ) : (
                isDev && <PendingText>[Texto pendiente: frase introductoria]</PendingText>
              )}
            </Reveal>
          </header>
        </div>
      </section>

      {/* ============ 2 + 3 · COMPOSICIÓN EDITORIAL + EL PROYECTO ============ */}
      <section className="proy-ed-composition">
        <div className="container">
          <div className="proy-ed-comp">
            <MediaSlot
              src={images[1]}
              alt={`${project.name} — Vista general del espacio`}
              label="Vista general del espacio"
              className="proy-ed-media--lead"
            />
            <Reveal delay={80} className="proy-ed-copy proy-ed-copy--project">
              <span className="proy-ed-num">01</span>
              <h2>El proyecto</h2>
              {project.elProyecto ? (
                <p>{project.elProyecto}</p>
              ) : (
                <PendingText>[Texto pendiente: descripción del proyecto]</PendingText>
              )}
            </Reveal>
            <MediaSlot
              src={images[2]}
              alt={`${project.name} — Detalle de iluminación`}
              label="Detalle de iluminación"
              className="proy-ed-media--small-a"
            />
            <MediaSlot
              src={images[3]}
              alt={`${project.name} — Detalle arquitectónico`}
              label="Detalle arquitectónico"
              className="proy-ed-media--small-b"
            />
          </div>
        </div>
      </section>

      {/* ============ 4 · LA SOLUCIÓN ============ */}
      <section className="proy-ed-solucion">
        <div className="container">
          <Reveal className="proy-ed-copy proy-ed-copy--solucion">
            <span className="proy-ed-num">02</span>
            <h2>La solución</h2>
            {project.laSolucion ? (
              <p>{project.laSolucion}</p>
            ) : (
              <PendingText>[Texto pendiente: solución aplicada]</PendingText>
            )}
          </Reveal>
        </div>
      </section>

      {/* ============ 5 · DETALLES DE ILUMINACIÓN ============ */}
      {showDetails && (
        <section className="proy-ed-details">
          <div className="container">
            <Reveal className="proy-ed-section-head">
              <h2>Detalles de iluminación</h2>
            </Reveal>
            <Reveal delay={70}>
              <dl className="proy-ed-details-grid">
                {detailItems.map((item) => (
                  <div className="proy-ed-detail" key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
                {extras.map((extra) => (
                  <div className="proy-ed-detail" key={extra.label}>
                    <dt>{extra.label}</dt>
                    <dd>{extra.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ 6 · SOLUCIONES / PRODUCTOS UTILIZADOS ============ */}
      {(isDev || hasRealProductos) && (
        <section className="proy-ed-products">
          <div className="container">
            <Reveal className="proy-ed-section-head">
              <h2>Soluciones utilizadas</h2>
            </Reveal>
            <Reveal delay={70}>
              {hasRealProductos ? (
                <ul className="proy-ed-product-list">
                  {productos.map((producto, index) => (
                    <li className="proy-ed-product-row" key={`${producto.nombre}-${index}`}>
                      <span className="proy-ed-product-num">{String(index + 1).padStart(2, '0')}</span>
                      {producto.image ? (
                        <img className="proy-ed-product-thumb" src={producto.image} alt={producto.nombre} loading="lazy" />
                      ) : (
                        <span
                          className="proy-ed-ph-product"
                          role="img"
                          aria-label={`IMAGEN DE PRODUCTO PENDIENTE · ${producto.nombre}`}
                        >
                          <span className="proy-ed-ph-product-kicker">Imagen de producto</span>
                          <span className="proy-ed-ph-product-label">Pendiente</span>
                        </span>
                      )}
                      <span className="proy-ed-product-name">
                        {producto.nombre}
                        {producto.ref && <small>Ref. {producto.ref}</small>}
                      </span>
                      {producto.id && (
                        <Link className="proy-ed-product-link" to={`/producto/${producto.id}`}>
                          Ver producto <span aria-hidden="true">→</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <PendingText>[Productos pendientes: luminarias utilizadas en el proyecto]</PendingText>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ 7 · GALERÍA EDITORIAL ============ */}
      <section className="proy-ed-gallery">
        <div className="container">
          <Reveal variant="none" className="proy-ed-gallery-grid">
            {gallerySlots.map((slot) => (
              <figure className={`proy-ed-gallery-item ${slot.className}`} key={slot.label}>
                {slot.src ? (
                  <img src={slot.src} alt={`${project.name} — ${slot.label}`} loading="lazy" />
                ) : (
                  <ImagePlaceholder label={slot.label} />
                )}
              </figure>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============ 8 · CTA FINAL ============ */}
      <section className="proy-detail-cta">
        <Reveal>
          <div className="proy-detail-cta-copy">
            <p className="proy-eyebrow proy-eyebrow--light">¿Tienes un proyecto similar?</p>
            <h2>Hablemos <em>del tuyo</em>.</h2>
            <Link to="/contacto" className="home-btn home-btn--red">
              Hablar con nosotros <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
