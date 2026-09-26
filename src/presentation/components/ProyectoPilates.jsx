import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import Seo from '../components/Seo'
import PilGallery from '../components/PilGallery'
import { SITE, canonicalFor, breadcrumbJsonLd } from '../../domain/site/site'

export default function ProyectoPilates({ project }) {
  const images = project.images || []
  const [salaPrincipal, sala, sala2, entrada, pasillo, pasillo2, escaleras, bano, garajeA, garajeB] = images
  const gallery = [sala2, pasillo2, escaleras, bano, garajeA, garajeB]

  return (
    <div className="pilates-editorial">
      <Seo
        title={`${project.name} — Proyecto de iluminación`}
        description={
          'Proyecto de iluminación para un centro de pilates en Madrid. La luz acompaña el movimiento ' +
          'y crea una atmósfera equilibrada, acogedora y visualmente continua.'
        }
        path={`/proyectos/${project.category}/${project.slug}`}
        image={sala ? `${SITE.url}/${String(sala).replace(/^\//, '')}` : undefined}
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
            image: sala ? `${SITE.url}/${String(sala).replace(/^\//, '')}` : undefined,
            author: { '@type': 'Organization', name: SITE.legalName },
          },
        ]}
      />

      {/* ============ 1 · HERO ============ */}
      <section className="pil-cover">
        <Reveal variant="none" className="pil-cover-frame">
          <img className="pil-cover-img" src={sala} alt="Centro de Pilates, Madrid" />
          <div className="pil-cover-copy">
            <h1>Centro de Pilates</h1>
            <p>SALUD Y BIENESTAR</p>
          </div>
        </Reveal>
      </section>

      {/* ============ 2 · BLOQUE 01 · PRESENTACIÓN ============ */}
      <section className="pil-block pil-b1">
        <div className="container">
          <Reveal variant="none" className="pil-b1-grid">
            <div className="pil-b1-copy">
              <p className="pil-b1-label">Proyecto · Salud y bienestar</p>
              <h2>Luz que acompaña el movimiento</h2>
              <p className="pil-b1-p">
                Este proyecto de iluminación para un centro de pilates en Madrid se plantea como parte de
                la experiencia del espacio. La luz acompaña el movimiento y contribuye a crear una
                atmósfera equilibrada, acogedora y visualmente continua.
              </p>
              <p className="pil-b1-p">
                Cada zona responde a una necesidad diferente, manteniendo un mismo lenguaje desde las
                salas de actividad hasta las áreas de circulación y los espacios auxiliares.
              </p>
              <p className="pil-b1-meta">Madrid · 2026</p>
            </div>
            <img className="pil-b1-img" src={salaPrincipal} alt="Sala de pilates" loading="lazy" />
          </Reveal>
        </div>
      </section>

      {/* ============ 3 · BLOQUE 02 · DETALLES ============ */}
      <section className="pil-block pil-b2">
        <div className="container">
          <Reveal variant="none" className="pil-b2-grid">
            <div className="pil-b2-media">
              <img className="pil-b2-img" src={entrada} alt="Pantalla LED flexible de la entrada" loading="lazy" />
              <img className="pil-b2-img" src={pasillo} alt="Iluminación del pasillo" loading="lazy" />
            </div>
            <div className="pil-b2-copy">
              <h2>Detalles que construyen el recorrido</h2>
              <p>
                En el acceso, la iluminación LED flexible crea un elemento visual de bienvenida y aporta
                identidad al espacio. A partir de este punto, las líneas de luz acompañan los recorridos
                y conectan las distintas estancias de una forma clara y continua.
              </p>
              <p>
                La iluminación se integra en la arquitectura sin ocupar un protagonismo excesivo,
                manteniendo una sensación de calma y coherencia en todo el centro.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 4 · BLOQUE 03 · CARRUSEL ============ */}
      <section className="pil-block pil-b3">
        <div className="container">
          <PilGallery images={gallery} />
        </div>
      </section>

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