import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import Seo from '../components/Seo'
import { SITE, canonicalFor, breadcrumbJsonLd } from '../lib/seo'

function PilFigure({ src, alt, caption, className = '' }) {
  return (
    <figure className={`pil-fig${className ? ' ' + className : ''}`}>
      {src ? <img src={src} alt={alt} loading="lazy" /> : null}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

export default function ProyectoPilates({ project }) {
  const images = project.images || []
  const [hero, salaA, salaB, entrada, pasillo, pasillo2, escaleras, bano, garajeA, garajeB] = images

  return (
    <div className="pilates-editorial">
      <Seo
        title={`${project.name} — Proyecto de iluminación`}
        description={project.intro || project.subtitle || `Proyecto de iluminación ${project.name} de Boralba Lighting.`}
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

      {/* ============ 1 · CABECERA ============ */}
      <section className="pil-hero">
        <div className="pil-wrap">
          <nav className="pil-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/proyectos">Proyectos</Link>
            <span>/</span>
            <span>{project.name}</span>
          </nav>
          <Reveal>
            <p className="pil-eyebrow">PROYECTO · SALUD Y BIENESTAR</p>
            <h1>Centro de Pilates</h1>
            <p className="pil-hero-sub">{project.subtitle}</p>
            <p className="pil-hero-meta">Madrid — 2026</p>
          </Reveal>
          <Reveal variant="none" className="pil-hero-media">
            <PilFigure
              src={hero}
              alt="Sala principal del Centro de Pilates, Madrid"
              caption="Sala principal · Centro de Pilates, Madrid"
            />
          </Reveal>
        </div>
      </section>

      {/* ============ 2 · INTRODUCCIÓN ============ */}
      <section className="pil-section pil-intro">
        <div className="pil-wrap">
          <div className="pil-intro-grid">
            <Reveal className="pil-intro-left">
              <span className="pil-num">01</span>
              <h2>Una iluminación que acompaña al espacio</h2>
            </Reveal>
            <Reveal delay={80} className="pil-intro-right">
              <p>
                El proyecto de iluminación de este centro de pilates en Madrid se plantea como parte de
                la experiencia del espacio. La luz acompaña el recorrido desde la entrada hasta las salas
                de actividad, creando una atmósfera equilibrada, acogedora y visualmente continua.
              </p>
              <p>
                Cada zona responde a una necesidad diferente: una iluminación confortable en las salas,
                una orientación clara en pasillos y escaleras y soluciones funcionales en las áreas
                auxiliares.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 3 · LAS SALAS ============ */}
      <section className="pil-section pil-salas">
        <div className="pil-wrap">
          <Reveal className="pil-sec-head">
            <span className="pil-num">02</span>
            <h2>Luz para concentrarse, respirar y moverse</h2>
            <p className="pil-lead">
              En las salas, la iluminación se integra de forma discreta para favorecer una sensación de
              calma y amplitud. La distribución de la luz permite mantener un ambiente cómodo y uniforme,
              adecuado para la práctica y el movimiento.
            </p>
          </Reveal>
          <Reveal variant="none" className="pil-salas-grid">
            <PilFigure
              src={salaA}
              alt="Sala de actividad con iluminación integrada"
              caption="Sala de actividad · Iluminación integrada"
            />
            <PilFigure
              src={salaB}
              alt="Detalle de la iluminación del espacio"
              caption="Detalle de la iluminación del espacio"
              className="pil-fig--offset"
            />
          </Reveal>
        </div>
      </section>

      {/* ============ 4 · EL ACCESO ============ */}
      <section className="pil-section pil-acceso">
        <div className="pil-wrap">
          <div className="pil-acceso-grid">
            <Reveal variant="none" className="pil-acceso-media">
              <PilFigure
                src={entrada}
                alt="Panel LED flexible integrado en la entrada"
                caption="Panel LED flexible integrado en la entrada"
              />
            </Reveal>
            <Reveal delay={80} className="pil-acceso-copy">
              <span className="pil-num">03</span>
              <h2>Una entrada con identidad propia</h2>
              <p>
                En el acceso, la superficie de iluminación LED flexible funciona como un elemento visual
                de bienvenida. La luz se incorpora a la arquitectura y ayuda a definir el carácter del
                centro desde el primer contacto con el espacio.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 5 · RECORRIDOS Y CONEXIONES ============ */}
      <section className="pil-section pil-recorridos">
        <div className="pil-wrap">
          <Reveal className="pil-sec-head">
            <span className="pil-num">04</span>
            <h2>Continuidad entre los distintos espacios</h2>
            <p className="pil-lead">
              La iluminación de pasillos y escaleras mantiene la continuidad visual del proyecto y
              facilita una circulación clara. El tratamiento de estas zonas conecta las distintas
              estancias sin romper la atmósfera general del centro.
            </p>
          </Reveal>
          <Reveal variant="none" className="pil-gallery">
            <PilFigure
              src={pasillo}
              alt="Iluminación del pasillo"
              caption="Iluminación del pasillo"
              className="pil-gallery--top"
            />
            <PilFigure
              src={pasillo2}
              alt="Continuidad lumínica entre estancias"
              caption="Continuidad lumínica entre estancias"
            />
            <PilFigure
              src={escaleras}
              alt="Iluminación de la zona de escaleras"
              caption="Iluminación de la zona de escaleras"
            />
          </Reveal>
        </div>
      </section>

      {/* ============ 6 · ESPACIOS AUXILIARES ============ */}
      <section className="pil-section pil-aux">
        <div className="pil-wrap">
          <div className="pil-aux-head">
            <Reveal className="pil-aux-copy">
              <span className="pil-num">05</span>
              <h2>Funcionalidad en cada zona</h2>
              <p>
                El proyecto se extiende también a los espacios auxiliares. En baños y garaje, la
                iluminación responde a criterios funcionales y de visibilidad, manteniendo una estética
                coherente con el resto de la intervención.
              </p>
            </Reveal>
            <Reveal variant="none" delay={80} className="pil-aux-media">
              <PilFigure src={bano} alt="Iluminación del baño" caption="Iluminación del baño" />
            </Reveal>
          </div>
          <Reveal variant="none" className="pil-aux-grid">
            <PilFigure
              src={garajeA}
              alt="Iluminación funcional del garaje"
              caption="Iluminación funcional del garaje"
            />
            <PilFigure
              src={garajeB}
              alt="Distribución de luz en la zona de aparcamiento"
              caption="Distribución de luz en la zona de aparcamiento"
            />
          </Reveal>
        </div>
      </section>

      {/* ============ 7 · CIERRE ============ */}
      <section className="pil-close">
        <div className="pil-wrap">
          <Reveal className="pil-close-inner">
            <p className="pil-close-statement">
              La luz conecta cada espacio y acompaña toda la experiencia del centro.
            </p>
            <p className="pil-close-question">¿Tienes un proyecto de iluminación?</p>
            <Link to="/contacto" className="home-btn home-btn--red">
              Cuéntanos tu proyecto
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}