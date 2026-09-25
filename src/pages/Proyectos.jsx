import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import Seo from '../components/Seo'
import { PROJECT_CATEGORIES, PROJECTS } from '../data/proyectos'
import { canonicalFor, breadcrumbJsonLd } from '../lib/seo'

const DEFAULT_PROJECT_CATEGORY = 'salud-y-bienestar'

const FILTER_LABELS = {
  'salud-y-bienestar': 'Salud y bienestar',
  'oficinas-y-espacios-de-trabajo': 'Oficinas y espacios de trabajo',
  'comercios-y-hosteleria': 'Comercios y hostelería',
  'soluciones-especiales': 'Soluciones especiales',
  'espacios-publicos-y-educativos': 'Espacios públicos y educativos',
  'exterior-y-fachadas': 'Exterior y fachadas',
  viviendas: 'Viviendas',
}

export default function Proyectos() {
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_PROJECT_CATEGORY)
  const visibleProjects = PROJECTS.filter((project) => project.category === selectedCategory)

  return (
    <div className="proyectos-redesign">
      <Seo
        title="Proyectos de iluminación LED en espacios reales"
        description="Selección de proyectos Boralba: salud y bienestar, oficinas, comercios, hostelería, espacios públicos y viviendas. Iluminación LED aplicada a espacios reales."
        path="/proyectos"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', url: canonicalFor('/') },
          { name: 'Proyectos', url: canonicalFor('/proyectos') },
        ])}
      />
      <section className="proy-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Ruta de navegación">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Proyectos</span>
          </nav>
          <Reveal>
            <p className="proy-eyebrow">Proyectos</p>
            <h1>Iluminación aplicada a espacios reales</h1>
            <p className="proy-hero-text">
              Una selección de proyectos donde la iluminación forma parte del diseño, la funcionalidad
              y la experiencia del espacio.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="proy-cat-projects">
        <div className="container">
          <p className="proy-filters-intro">Explora nuestros proyectos por espacio</p>
          <div className="proy-filters" role="group" aria-label="Filtrar proyectos">
            {PROJECT_CATEGORIES.map((category) => (
              <button
                className={`proy-filter${selectedCategory === category.slug ? ' is-active' : ''}`}
                key={category.slug}
                type="button"
                aria-pressed={selectedCategory === category.slug}
                onClick={() => setSelectedCategory(category.slug)}
              >
                {FILTER_LABELS[category.slug] || category.name}
              </button>
            ))}
          </div>

          {visibleProjects.length > 0 ? (
            <div className="proy-grid proy-grid--filtered" key={selectedCategory}>
              {visibleProjects.map((project, index) => (
                <Reveal key={project.slug} delay={(index % 3) * 45} className="proy-item-reveal">
                  <Link
                    className={`proy-item${project.portraitCover ? ' proy-item--portrait' : ''}`}
                    to={`/proyectos/${project.category}/${project.slug}`}
                  >
                    <div className="proy-item-media">
                      <img src={project.images[0]} alt={project.name} loading="lazy" />
                    </div>
                    <div className="proy-item-body">
                      <h2>{project.name}</h2>
                      {project.location && (
                        <p className="proy-item-meta">
                          {project.location}
                          {project.year ? ` · ${project.year}` : ''}
                        </p>
                      )}
                      <span className="proy-item-cta">
                        Ver proyecto <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="proy-empty">Próximamente añadiremos proyectos en esta categoría.</p>
          )}
        </div>
      </section>
    </div>
  )
}
