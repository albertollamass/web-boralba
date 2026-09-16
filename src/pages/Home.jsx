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

const services = [
  { num: '01', title: 'Asesoramiento técnico', desc: 'Analizamos las necesidades del proyecto y proponemos la solución de iluminación más adecuada.' },
  { num: '02', title: 'Diseño de iluminación', desc: 'Definimos la distribución, niveles de luz y solución técnica para cada espacio.' },
  { num: '03', title: 'Suministro profesional', desc: 'Seleccionamos y suministramos luminarias, componentes y sistemas adaptados a cada proyecto.' },
  { num: '04', title: 'Puesta en marcha', desc: 'Configuramos, programamos y comprobamos el funcionamiento de los sistemas de iluminación.' },
]

const projects = [
  { name: 'Obra con panel LED flexible', type: '', image: 'images/proyectos/obra_panel_led.png' },
  { name: 'Chalet en Pozuelo de Alarcón', type: '', image: 'images/proyectos/chalet_pozuelo.png' },
  { name: 'Torre Consuegra', type: 'Iluminación monumental · Arquitectura exterior', image: 'images/proyectos/torre_consuerga_home.png' },
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

const resourcesPaths = [
  ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6M16 13H8M16 17H8M10 9H8'],
  ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  ['M6 2h12v4H6zM6 6v14h12V6', 'M9 10h6M9 14h6'],
  ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3'],
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
      {/* ============ CONTENT SECTIONS ============ */}
      <div className="home-sections">

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
      <section className="home-section">
        <div className="container">
          <div className="projects-content">
            <div className="home-projects">
              <Reveal delay={0} className="home-projects-main">
                <Link to="/proyectos" className="home-project home-project--main">
                  <div className="home-project-media">
                    <img src={projects[0].image} alt={projects[0].name} loading="lazy" />
                    <div className="home-project-foot">
                      <span className="home-project-name">{projects[0].name}</span>
                      {projects[0].type && <span className="home-project-type">{projects[0].type}</span>}
                      <span className="home-project-link">Ver proyecto <span>→</span></span>
                    </div>
                  </div>
                </Link>
              </Reveal>
              <div className="home-projects-side">
                <Reveal delay={80}>
                  <Link to="/proyectos" className="home-project">
                    <div className="home-project-media">
                      <img src={projects[1].image} alt={projects[1].name} loading="lazy" />
                      <div className="home-project-foot">
                        <span className="home-project-name">{projects[1].name}</span>
                        {projects[1].type && <span className="home-project-type">{projects[1].type}</span>}
                        <span className="home-project-link">Ver proyecto <span>→</span></span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
                <Reveal delay={160}>
                  <Link to="/proyectos" className="home-project">
                    <div className="home-project-media">
                      <img src={projects[2].image} alt={projects[2].name} loading="lazy" />
                      <div className="home-project-foot">
                        <span className="home-project-name">{projects[2].name}</span>
                        <span className="home-project-type">{projects[2].type}</span>
                        <span className="home-project-link">Ver proyecto <span>→</span></span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              </div>
            </div>
            <div className="projects-text">
              <Reveal delay={0}>
                <p className="home-eyebrow">PROYECTOS</p>
                <h2>Proyectos e inspiración</h2>
                <p className="home-sec-sub">Aplicaciones reales de nuestras soluciones de iluminación en arquitectura, interiorismo y espacios públicos.</p>
              </Reveal>
              <Reveal delay={120} className="projects-text-more">
                <Link to="/proyectos" className="home-projects-more-link">Ver todos los proyectos <span>→</span></Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 4 · SERVICIOS ============ */}
      <section className="home-section">
        <div className="container">
          <div className="home-services">
            <div className="home-services-content">
              <Reveal>
                <p className="home-eyebrow">Servicios</p>
                <h2 className="home-services-title">Todo lo que necesita tu proyecto de iluminación</h2>
                <p className="home-services-sub">Le acompañamos desde el asesoramiento y el diseño hasta el suministro y la puesta en marcha de la instalación.</p>
              </Reveal>
              <Reveal delay={80} className="home-services-steps-wrap">
                <div className="home-services-steps">
                  {services.map((service) => (
                    <Link key={service.num} to="/servicios" className="home-service-step">
                      <span className="home-service-num">{service.num}</span>
                      <span className="home-service-rail" aria-hidden="true">
                        <span className="home-service-dot" />
                      </span>
                      <span className="home-service-body">
                        <span className="home-service-title">{service.title}</span>
                        <span className="home-service-desc">{service.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={120}>
                <Link to="/servicios" className="home-services-cta">Ver todos los servicios <span>→</span></Link>
              </Reveal>
            </div>
            <Reveal delay={120} className="home-services-media">
              <img src="images/puesta_en_marcha.png" alt="Puesta en marcha y control de iluminación" loading="lazy" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 4b · CONFIANZA Y MARCA ============ */}
      <section className="home-section">
        <div className="container">
          <div className="home-trust">
            <div className="home-trust-col">
              <Reveal>
                <p className="home-trust-label">Partner tecnológico</p>
                <img className="home-trust-logo" src="images/LOGO TIDONIC.png" alt="TRIDONIC" loading="lazy" />
                <div className="home-trust-media">
                  <img src="images/tridonic.png" alt="Control e iluminación profesional TRIDONIC" loading="lazy" />
                </div>
                <p className="home-trust-text">Integramos soluciones TRIDONIC de control e iluminación profesional en nuestros proyectos.</p>
                <Link to="/servicios" className="home-trust-link">Conocer colaboración <span>→</span></Link>
              </Reveal>
            </div>
            <div className="home-trust-col">
              <Reveal delay={100}>
                <p className="home-trust-label">Marca propia</p>
                <img className="home-trust-logo" src="images/LOGO HALOPACK .png" alt="HALOPACK" loading="lazy" />
                <div className="home-trust-media">
                  <img src="images/Foto halopack.png" alt="Soluciones LED HALOPACK" loading="lazy" />
                </div>
                <p className="home-trust-text">Nuestra marca propia de soluciones LED para proyectos profesionales.</p>
                <Link to="/productos" className="home-trust-link">Descubrir Halopack <span>→</span></Link>
                <div className="home-trust-callout">
                  <p className="home-trust-callout-title">Diseña tu propia luminaria</p>
                  <p className="home-trust-callout-text">Creamos soluciones de iluminación a medida para las necesidades específicas de cada proyecto.</p>
                  <Link to="/contacto" className="home-trust-callout-link">Diseñar mi luminaria <span>→</span></Link>
                </div>
              </Reveal>
            </div>
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
      <section className="home-section">
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
                    {resourcesPaths[index].map((d, i) => <path key={i} d={d} />)}
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

      </div>

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