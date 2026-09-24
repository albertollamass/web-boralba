import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import Seo from '../components/Seo'
import PilGallery from '../components/PilGallery'
import { getProjectCategory } from '../data/proyectos'
import { SITE, canonicalFor, breadcrumbJsonLd } from '../lib/seo'

export default function ProyectoEditorial({ project }) {
  const category = getProjectCategory(project.category)
  const images = project.images || []
  const hero = images[0]
  const b1 = images[1]
  const b2Photos = [images[2], images[3]].filter(Boolean)
  const carousel = project.gallery || images.slice(4)
  const metaParts = [project.location, project.year].filter(Boolean)

  return (
    <div className="pilates-editorial">
      <Seo
        title={`${project.name} — Proyecto de iluminación`}
        description={
          project.intro || `Proyecto de iluminación ${project.name} de Boralba Lighting.`
        }
        path={`/proyectos/${project.category}/${project.slug}`}
        image={hero ? `${SITE.url}/${String(hero).replace(/^\//, '')}` : undefined}
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
            description: project.intro || project.subtitle || '',
            image: hero ? `${SITE.url}/${String(hero).replace(/^\//, '')}` : undefined,
            author: { '@type': 'Organization', name: SITE.legalName },
          },
        ]}
      />

      {/* ============ 1 · HERO ============ */}
      <section className="pil-cover">
        <Reveal variant="none" className="pil-cover-frame">
          <img className="pil-cover-img" src={hero} alt={project.name} />
          <div className="pil-cover-copy">
            <h1>{project.name}</h1>
            {category && <p>{category.name}</p>}
          </div>
        </Reveal>
      </section>

      {/* ============ 2 · BLOQUE 01 · PRESENTACIÓN ============ */}
      <section className="pil-block pil-b1">
        <div className="container">
          <Reveal variant="none" className={`pil-b1-grid${b1 ? '' : ' is-text-only'}`}>
            <div className="pil-b1-copy">
              {category && <p className="pil-b1-label">Proyecto · {category.name}</p>}
              <h2>{project.intro}</h2>
              {project.elProyecto && <p className="pil-b1-p">{project.elProyecto}</p>}
              {project.laSolucion && <p className="pil-b1-p">{project.laSolucion}</p>}
              {metaParts.length > 0 && (
                <p className="pil-b1-meta">{metaParts.join(' · ')}</p>
              )}
            </div>
            {b1 && <img className="pil-b1-img" src={b1} alt={project.name} loading="lazy" />}
          </Reveal>
        </div>
      </section>

      {/* ============ 3 · BLOQUE 02 · DETALLES ============ */}
      {b2Photos.length > 0 && (
        <section className="pil-block pil-b2">
          <div className="container">
            <Reveal variant="none" className="pil-b2-grid">
              <div className={`pil-b2-media${b2Photos.length === 1 ? ' is-single' : ''}`}>
                {b2Photos.map((src, i) => (
                  <img
                    className="pil-b2-img"
                    key={src}
                    src={src}
                    alt={`${project.name} — detalle ${i + 1}`}
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="pil-b2-copy">
                <h2>La solución</h2>
                {project.iluminacion && <p>{project.iluminacion}</p>}
                {project.control && <p>{project.control}</p>}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ 4 · BLOQUE 03 · CARRUSEL ============ */}
      {carousel.length > 0 && (
        <section className="pil-block pil-b3">
          <div className="container">
            <PilGallery images={carousel} />
          </div>
        </section>
      )}

      {/* ============ 5 · CIERRE ============ */}
      <section className="pil-close">
        <div className="container">
          <div className="pil-close-inner">
            <p className="pil-close-text">¿Tienes un proyecto de iluminación?</p>
            <Link to="/contacto" className="home-btn home-btn--red">
              Cuéntanos tu proyecto
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}