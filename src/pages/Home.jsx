import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCarousel from '../components/ProductCarousel'
import FamilyCarousel from '../components/FamilyCarousel'
import { useCategories } from '../context/CategoriesContext'
import { useProducts } from '../context/ProductsContext'
import { ROOT } from '../data/categories'

const heroFeatures = [
  'Calidad profesional',
  'Soluciones para proyectos',
  'Soporte técnico',
]

const solutions = [
  { name: 'Iluminación arquitectónica', desc: 'Luz integrada en arquitectura y diseño.', image: 'images/proyectos/tunel_calle_damas_3.jpg' },
  { name: 'Iluminación lineal', desc: 'Perfiles y tiras para líneas de luz limpias.', image: 'images/proyectos/centro_cultural_antonio_lopez_1.jpg' },
  { name: 'Integración en mobiliario', desc: 'Iluminación oculta en muebles y expositores.', image: 'images/proyectos/Madrid-Sur_3.jpg' },
  { name: 'Exterior y fachada', desc: 'Solución robusta para espacios exteriores.', image: 'images/proyectos/torre_consuerga_1.jpg' },
  { name: 'Control de iluminación', desc: 'Sistemas inteligentes y conectados.', image: 'images/proyectos/centro_eventos.jpg' },
]

const projects = [
  { name: 'Túnel de Calle Damas', type: 'Equipamiento público', image: 'images/proyectos/tunel_calle_damas_3.jpg' },
  { name: 'Centro Cultural Antonio López', type: 'Espacios interiores', image: 'images/proyectos/centro_cultural_antonio_lopez_1.jpg' },
  { name: 'Torre Consuegra', type: 'Arquitectura y paisaje', image: 'images/proyectos/torre_consuerga_1.jpg' },
]

const reasons = [
  { title: 'Asesoramiento técnico', text: 'Te ayudamos a encontrar la mejor solución.' },
  { title: 'Soluciones para proyectos', text: 'Productos y soporte para proyectos exigentes.' },
  { title: 'Catálogo profesional', text: 'Información técnica clara y actualizada.' },
  { title: 'Soporte cercano', text: 'Un equipo disponible para ayudarte.' },
]

const resources = [
  { title: 'Fichas técnicas', desc: 'Datos técnicos detallados de cada producto.', to: '/servicios' },
  { title: 'Catálogos', desc: 'Catálogos de producto y de soluciones.', to: '/servicios' },
  { title: 'Documentación', desc: 'Guías de instalación y normativa.', to: '/servicios' },
  { title: 'Descargas', desc: 'Archivos, mediciones y recursos útiles.', to: '/servicios' },
]

const reasonsIcons = [
  <path d="M8 9l3 3-3 3M13 15h4" key="0" />,
  <path d="M12 3l1 2h3l1 2-1 2h-3l-1 2-1-2-3-0.5-1-1.5 1-2h3l1-2z" key="1" />,
  <path d="M4 10v10M4 10c3 0 4-5 4-5s1 5 4 5 4-8 4-8 1 8 4 8 2-6 4-6v10" key="2" />,
  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" key="3" />,
]

const resourcesIcons = [
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </>,
  <>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </>,
  <>
    <path d="M6 2h12v4H6zM6 6v14h12V6" />
    <path d="M9 10h6M9 14h6" />
  </>,
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </>,
]

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`home-reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const { categories, getCategory, getChildren } = useCategories()
  const { products } = useProducts()
  const flagged = categories.filter((category) => category.showInHome).sort((a, b) => (a.homeOrder ?? 999) - (b.homeOrder ?? 999))
  const source = flagged.length ? flagged : getChildren(ROOT.slug)
  const families = source.map((category) => ({ slug: category.slug, name: category.name }))
  const getCatImage = (slug) => getCategory(slug)?.image || 'images/placeholder.svg'
  const featuredProducts = products.filter((product) => !product.outlet).slice(0, 12)
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play()?.catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.2 }
    )
    obs.observe(video)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="home">
      {/* ============ 1 · HERO ============ */}
      <section className="home-hero">
        <div className="home-hero-media" aria-hidden="true">
          <video
            ref={videoRef}
            src="images/video tira.mp4"
            poster="images/tira 3d.jpg"
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="home-hero-side-note">
            <span>PEQUEÑOS DETALLES.</span>
            <strong>GRANDES PROYECTOS</strong>
          </div>
        </div>
        <div className="home-hero-copy">
          <Reveal>
            <p className="home-eyebrow">Luz que hace grandes proyectos</p>
            <h1>
              Iluminación LED para
              <br />
              grandes proyectos
            </h1>
            <p className="home-hero-sub">
              Soluciones de iluminación LED que buscan calidad, fiabilidad y un resultado profesional.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="home-hero-actions">
              <Link to="/productos" className="home-btn home-btn--red">Ver productos <span>→</span></Link>
              <Link to="/contacto" className="home-hero-textlink">Cuéntanos tu proyecto <span>→</span></Link>
            </div>
          </Reveal>
        </div>
        <div className="home-hero-values">
          {heroFeatures.map((feature) => (
            <span className="home-hero-value" key={feature}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5 6.5 12 13 4.5" /></svg>
              {feature}
            </span>
          ))}
        </div>
      </section>

      {/* ============ 2 · NUESTROS PRODUCTOS ============ */}
      <section className="home-section">
        <div className="container">
          <div className="home-sec-head">
            <Reveal>
              <p className="home-eyebrow">Producto</p>
              <h2>Nuestros productos</h2>
            </Reveal>
            <Reveal delay={100}>
              <Link to="/productos" className="home-sec-link">Ver todos los productos <span>→</span></Link>
            </Reveal>
          </div>
          {featuredProducts.length > 0 ? (
            <Reveal delay={150}>
              <ProductCarousel products={featuredProducts} />
            </Reveal>
          ) : (
            <Reveal delay={150}>
              <FamilyCarousel families={families} getCatImage={getCatImage} />
            </Reveal>
          )}
        </div>
      </section>

      {/* ============ 5 · PROYECTOS REALES ============ */}
      <section className="home-section home-section--mist">
        <div className="container">
          <div className="home-sec-head">
            <Reveal>
              <p className="home-eyebrow">Proyectos</p>
              <h2>Proyectos e inspiración</h2>
            </Reveal>
            <Reveal delay={100}>
              <Link to="/proyectos" className="home-sec-link">Ver todos los proyectos <span>→</span></Link>
            </Reveal>
          </div>
          <div className="home-projects">
            {projects.map((project, index) => (
              <Reveal key={project.name} delay={index * 80}>
                <Link to="/proyectos" className="home-project">
                  <div className="home-project-media">
                    <img src={project.image} alt={project.name} loading="lazy" />
                    <span className="home-project-foot">
                      <span className="home-project-name">{project.name}</span>
                      <span className="home-project-type">{project.type}</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4 · SOLUCIONES ============ */}
      <section className="home-section">
        <div className="container">
          <div className="home-sec-head">
            <Reveal>
              <p className="home-eyebrow">Aplicaciones</p>
              <h2>Soluciones</h2>
            </Reveal>
          </div>
          <div className="home-solutions">
            {solutions.map((solution, index) => (
              <Reveal key={solution.name} delay={index * 60}>
                <Link to="/servicios" className="home-solution">
                  <div className="home-solution-media">
                    <img src={solution.image} alt={solution.name} loading="lazy" />
                  </div>
                  <p className="home-solution-name">{solution.name}</p>
                  <p className="home-solution-desc">{solution.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 6 · POR QUÉ BORALBA ============ */}
      <section className="home-section">
        <div className="container">
          <div className="home-sec-head">
            <Reveal>
              <p className="home-eyebrow">Boralba</p>
              <h2>Por qué Boralba</h2>
            </Reveal>
          </div>
          <div className="home-reasons">
            {reasons.map((reason, index) => (
              <Reveal key={reason.title} delay={index * 60}>
                <div className="home-reason">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {reasonsIcons[index]}
                  </svg>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 7 · RECURSOS PROFESIONALES ============ */}
      <section className="home-section home-section--mist">
        <div className="container">
          <div className="home-sec-head">
            <Reveal>
              <p className="home-eyebrow">Información técnica</p>
              <h2>Recursos profesionales</h2>
            </Reveal>
          </div>
          <div className="home-resources">
            {resources.map((resource, index) => (
              <Reveal key={resource.title} delay={index * 60}>
                <Link to={resource.to} className="home-resource">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {resourcesIcons[index]}
                  </svg>
                  <h3>{resource.title}</h3>
                  <p>{resource.desc}</p>
                  <span className="home-resource-arrow">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 8 · CTA FINAL ============ */}
      <section className="home-cta">
        <div className="home-cta-bg">
          <img src="images/proyectos/tunel_calle_damas_2.jpg" alt="" aria-hidden="true" loading="lazy" />
        </div>
        <Reveal>
          <div className="home-cta-copy">
            <h2>¿Tienes un proyecto de iluminación?</h2>
            <p>Hablemos. Nuestro equipo te ayudará a encontrar la solución adecuada.</p>
            <Link to="/contacto" className="home-btn home-btn--red home-btn--light">Hablar con nosotros <span>→</span></Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}