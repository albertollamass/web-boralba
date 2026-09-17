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
  const ctaRef = useRef(null)

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

  useEffect(() => {
    const section = ctaRef.current
    if (!section) return
    const img = section.querySelector('.home-cta-bg img')
    if (!img) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = window.matchMedia('(max-width: 640px)')
    let raf = 0

    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const raw = (vh - rect.top) / (vh + rect.height)
      const progress = Math.min(1, Math.max(0, raw))
      const maxShift = mobile.matches ? 9 : 60
      const shift = (progress - 0.5) * 2 * maxShift
      img.style.transform = `translateY(${shift.toFixed(2)}px) scale(1.08)`
    }

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }

    const apply = () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (reduce.matches) {
        img.style.transform = ''
        return
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
      onScroll()
    }

    apply()
    reduce.addEventListener?.('change', apply)
    mobile.addEventListener?.('change', onScroll)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      reduce.removeEventListener?.('change', apply)
      mobile.removeEventListener?.('change', onScroll)
    }
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
        <section className="home-section home-section--products">
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
      <section className="home-section home-section--projects">
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
                <div className="projects-text-head">
                  <h2>Proyectos e inspiración</h2>
                  <Link to="/proyectos" className="home-projects-more-link">Ver todos los proyectos <span>→</span></Link>
                </div>
                <p className="home-sec-sub">Aplicaciones reales de nuestras soluciones de iluminación en arquitectura, interiorismo y espacios públicos.</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 4 · SERVICIOS ============ */}
      <section className="home-section home-section--services">
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
      <section className="home-section home-section--trust">
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
                  <Link to="/disena-tu-luminaria" className="home-trust-callout-link">Diseñar mi luminaria <span>→</span></Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 6 · SOBRE BORALBA ============ */}
      <section className="home-section home-section--company">
        <div className="container">
          <div className="home-company">
            <div className="home-company-content">
              <Reveal>
                <p className="home-eyebrow">Sobre Boralba</p>
                <h2 className="home-company-title">Más de 30 años evolucionando con la iluminación.</h2>
              </Reveal>
              <Reveal delay={80}>
<p className="home-company-text">Contamos con más de 30 años de experiencia en el sector. Desde 2006, Boralba Lighting ha evolucionado desde la distribución y comercialización hacia soluciones más completas para proyectos profesionales.</p>
              <p className="home-company-text">Hoy combinamos iluminación, asesoramiento, diseño, control, puesta en marcha y soluciones propias bajo HALOPACK.</p>
              </Reveal>
              <Reveal delay={140}>
                <div className="home-company-hits">
                  <div className="home-company-hit">
                    <strong>+30 AÑOS</strong>
                    <span>Experiencia en iluminación</span>
                  </div>
                  <div className="home-company-hit">
                    <strong>2006</strong>
                    <span>Boralba Lighting S.L.</span>
                  </div>
                  <div className="home-company-hit">
                    <strong>HOY</strong>
                    <span>Proyectos · Tecnología · HALOPACK</span>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={180}>
                <Link to="/empresa" className="home-company-link">Conocer Boralba <span>→</span></Link>
              </Reveal>
            </div>
            <Reveal delay={120} className="home-company-media">
              <img src="images/almacen.png" alt="Instalaciones de Boralba" loading="lazy" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 7 · CATÁLOGO DE PRODUCTOS ============ */}
      <section className="home-section home-section--resources">
        <div className="container">
          <div className="home-resources">
            <Reveal className="home-resources-content">
              <p className="home-eyebrow">Recursos</p>
              <h2 className="home-resources-title">Catálogo de productos</h2>
              <p className="home-resources-sub">Consulta nuestras gamas de iluminación, soluciones LED y especificaciones de producto.</p>
              <p className="home-resources-meta">Productos · Soluciones LED · Especificaciones</p>
              <Link to="/productos" className="home-resources-link">Ver catálogo <span>→</span></Link>
            </Reveal>
            <Reveal delay={120} className="home-resources-media">
              <img src="images/portada-catalogo.png" alt="Catálogo de productos de Boralba" loading="lazy" />
            </Reveal>
          </div>
        </div>
      </section>

      </div>

      {/* ============ 8 · CTA FINAL ============ */}
      <section className="home-cta" ref={ctaRef}>
        <div className="home-cta-bg">
          <img src="images/iluminacion-azul.png" alt="" aria-hidden="true" loading="lazy" />
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