import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import FamilyCarousel from '../components/FamilyCarousel'
import Reveal, { ParallaxMedia, useScrollDrive } from '../components/Reveal'
import { useCategories } from '../context/CategoriesContext'
import { ROOT } from '../data/categories'

const advantages = [
  { num: '01', title: 'Producto técnico y fiable', desc: 'Materiales seleccionados para garantizar un funcionamiento estable y duradero.' },
  { num: '02', title: 'Asesoramiento especializado', desc: 'Te ayudamos a elegir la solución adecuada según el proyecto, la potencia, la temperatura de color y el sistema de control.' },
  { num: '03', title: 'Respuesta rápida', desc: 'Facilitamos presupuestos, fichas técnicas y documentación para que puedas avanzar sin perder tiempo.' },
  { num: '04', title: 'Soluciones personalizadas', desc: 'Adaptamos la propuesta a las necesidades de cada instalación.' },
]

const professionalLinks = [
  { label: 'Arquitectos e interioristas', to: '/servicios' },
  { label: 'Instaladores', to: '/productos' },
  { label: 'Distribuidores', to: '/contacto' },
  { label: 'Proyectos especiales', to: '/proyectos' },
]

const applications = [
  { label: 'Iluminación indirecta', img: 'images/proyectos/Madrid-Sur1.jpg' },
  { label: 'Iluminación de muebles', img: 'images/proyectos/decoracion_hogar.jpg' },
  { label: 'Hoteles y restauración', img: 'images/proyectos/centro_eventos.jpg' },
  { label: 'Tiendas y comercios', img: 'images/productos.png' },
  { label: 'Oficinas', img: 'images/proyectos/oficinas.jpg' },
  { label: 'Viviendas', img: 'images/proyectos/torre_consuerga_1.jpg' },
  { label: 'Centros educativos y deportivos', img: 'images/proyectos/centro_medico_1.jpg' },
]

const stats = [
  { num: '+25', label: 'años de experiencia' },
  { num: '100%', label: 'asesoramiento técnico personalizado' },
  { num: 'LED', label: 'soluciones profesionales' },
  { num: 'Madrid', label: 'envíos desde Madrid' },
]

const testimonials = [
  {
    quote: 'Desde el primer contacto recibimos un asesoramiento impecable. La selección de perfiles y tiras LED encajó perfectamente con el proyecto de iluminación indirecta del nuevo restaurante.',
    name: 'Carlos Ruiz',
    company: 'Arquitecto · Estudio Ruiz',
  },
  {
    quote: 'Respuesta rápida, documentación técnica clara y productos de calidad. Son el aliado perfecto para cualquier instalación LED profesional.',
    name: 'María González',
    company: 'Instaladora eléctrica',
  },
  {
    quote: 'Nos ayudaron a diseñar la iluminación completa de nuestra tienda, desde la tira LED hasta el control inteligente. El resultado final superó todas las expectativas.',
    name: 'Javier Moreno',
    company: 'Directora de retail',
  },
]

const faqs = [
  {
    q: '¿Qué tira LED necesito para mi proyecto?',
    a: 'Depende de la tensión, la potencia, el color y la longitud necesaria. Para largas tiradas recomendamos tiras de 24V y para distancias muy grandes opciones de 220V. Nuestro equipo te asesora sobre la opción más adecuada según cada instalación.',
  },
  {
    q: '¿Qué diferencia hay entre IP20 e IP65?',
    a: 'La tira IP20 está pensada para instalaciones en interior protegidas (dentro de perfiles o zonas secas). La IP65 lleva una protección adicional contra polvo y agua, ideal para exteriores, baños o zonas expuestas a humedad.',
  },
  {
    q: '¿Podéis ayudarme a elegir el perfil adecuado?',
    a: 'Sí. El perfil correcto depende del tipo de tira, el acabado deseado (empotrado, superficie, esquina) y la disipación de calor. Guiamos la selección según el uso y la forma de instalación.',
  },
  {
    q: '¿Qué driver necesito?',
    a: 'El driver debe coincidir con la tensión y la potencia total consumida por las tiras. También hay que decidir si es regulable y el protocolo de control. Calculamos la potencia necesaria y recomendamos el modelo compatible.',
  },
  {
    q: '¿Disponéis de soluciones DALI, DMX o Casambi?',
    a: 'Sí, trabajamos con DALI, DMX y Casambi, así como otros sistemas de control profesional. Diseñamos, configuramos y ponemos en marcha la instalación para que funcione a la primera.',
  },
  {
    q: '¿Podéis preparar un presupuesto personalizado?',
    a: 'Por supuesto. Cuéntanos tu proyecto y preparamos un presupuesto personalizado con los componentes, cantidades y documentación técnica necesaria.',
  },
]

function PanelHeading({ number, eyebrow, title, children }) {
  return (
    <div className="redesign-heading">
      <span className="redesign-kicker"><b>{number}</b>{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  )
}

function ApplicationsStrip() {
  const trackRef = useRef(null)
  const scrollBy = (direction) => {
    const track = trackRef.current
    const card = track?.querySelector('.redesign-application')
    if (track) track.scrollBy({ left: direction * ((card?.offsetWidth || 300) + 16), behavior: 'smooth' })
  }

  return (
    <div className="redesign-applications">
      <button type="button" className="redesign-arrow" onClick={() => scrollBy(-1)} aria-label="Aplicaciones anteriores">‹</button>
      <div className="redesign-application-track" ref={trackRef}>
        {applications.map((application, index) => (
          <figure className="redesign-application" key={application.label}>
            <ParallaxMedia src={application.img} alt={application.label} speed={0.1} zoom={0.06} />
            <figcaption><small>{String(index + 1).padStart(2, '0')}</small>{application.label}</figcaption>
          </figure>
        ))}
      </div>
      <button type="button" className="redesign-arrow" onClick={() => scrollBy(1)} aria-label="Siguientes aplicaciones">›</button>
    </div>
  )
}

function TestimonialSlider() {
  const [index, setIndex] = useState(0)
  const next = () => setIndex((i) => (i + 1) % testimonials.length)
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
  const t = testimonials[index]

  return (
    <div className="redesign-testimonial">
      <span className="redesign-quote">“</span>
      <p key={index} className="redesign-testimonial-text">{t.quote}</p>
      <div className="redesign-testimonial-meta">
        <strong>{t.name}</strong>
        <span>{t.company}</span>
      </div>
      <div className="redesign-testimonial-nav">
        <button type="button" onClick={prev} aria-label="Testimonio anterior">‹</button>
        <button type="button" onClick={next} aria-label="Siguiente testimonio">›</button>
      </div>
    </div>
  )
}

function FaqAccordion() {
  const [open, setOpen] = useState(null)
  return (
    <div className="redesign-faq">
      {faqs.map((item, i) => (
        <div className={`redesign-faq-item${open === i ? ' is-open' : ''}`} key={item.q}>
          <button
            type="button"
            className="redesign-faq-heading"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{item.q}</span>
            <span className="redesign-faq-arrow">{open === i ? '−' : '+'}</span>
          </button>
          <div className="redesign-faq-body">
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Home() {
  const { categories, getCategory, getChildren } = useCategories()
  const [menuOpen, setMenuOpen] = useState(false)
  const driveRef = useScrollDrive()
  const getCatImage = (slug) => getCategory(slug)?.image || 'images/placeholder.svg'

  // Carrusel: viene de Supabase (vía CategoriesContext).
  // Se muestran las categorías marcadas "Mostrar en home", ordenadas por
  // "Orden en home". Si ninguna está marcada, se usan las de nivel superior.
  const flagged = categories
    .filter((c) => c.showInHome)
    .sort((a, b) => (a.homeOrder ?? 999) - (b.homeOrder ?? 999))
  const homeSource = flagged.length > 0 ? flagged : getChildren(ROOT.slug)
  const families = homeSource.map((c) => ({ slug: c.slug, name: c.name }))

  const navItems = [
    { label: 'Productos', to: '/productos' },
    { label: 'Soluciones', to: '/servicios' },
    { label: 'Proyectos', to: '/proyectos' },
    { label: 'Recursos', to: '/buscar' },
    { label: 'Contacto', to: '/contacto' },
  ]

  return (
    <div className="home redesign-home">
      <div className="redesign-ambient" aria-hidden="true">
        <img src="images/lobby.png" alt="" />
      </div>
      <div className="redesign-editorial">
        {/* SECCIÓN 1: HERO */}
        <section className="redesign-section redesign-hero-section">
          <div ref={driveRef} className="redesign-hero">
            <div className="redesign-hero-top">
              <Link to="/" className="redesign-logo" onClick={() => setMenuOpen(false)}>
                <img src="images/logo.png" alt="Boralba Lighting" />
              </Link>
              <nav className="redesign-nav" aria-label="Navegación principal">
                {navItems.map((item) => (
                  <Link to={item.to} key={item.label}>{item.label}</Link>
                ))}
              </nav>
              <Link to="/contacto" className="redesign-btn-primary redesign-btn-compact redesign-cta-top">Solicitar presupuesto</Link>
              <button
                type="button"
                className="redesign-menu-toggle"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
            <div className={`redesign-mobile-menu${menuOpen ? ' is-open' : ''}`}>
              {navItems.map((item) => (
                <Link to={item.to} key={item.label} onClick={() => setMenuOpen(false)}>{item.label}</Link>
              ))}
              <Link to="/contacto" className="redesign-btn-primary redesign-btn-compact" onClick={() => setMenuOpen(false)}>Solicitar presupuesto</Link>
            </div>
            <img
              className="redesign-hero-image"
              src="images/lobby.png"
              alt="Instalación de iluminación arquitectónica"
              loading="eager"
              fetchPriority="high"
            />
            <div className="redesign-hero-wash" />
            <div className="redesign-hero-content">
              <span className="redesign-hero-pill">Iluminación técnica para proyectos que dejan huella</span>
              <h1>Creamos soluciones de iluminación que convierten cada proyecto en una referencia</h1>
              <p>Asesoramiento técnico, producto LED profesional y proyectos que marcan la diferencia en arquitectura, comercio y hostelería.</p>
              <div className="redesign-hero-actions">
                <Link to="/productos" className="redesign-btn-primary redesign-btn-compact">Explorar productos</Link>
                <Link to="/contacto" className="redesign-btn-outline redesign-btn-compact">Solicitar asesoramiento</Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: CARRUSEL DE FAMILIAS */}
        {families.length > 0 && (
          <Reveal as="section" className="redesign-section redesign-panel" delay={60}>
            <div className="redesign-panel-inner">
              <PanelHeading number="01" eyebrow="Familias de producto" title="Soluciones de iluminación para cada proyecto">Desde la tira LED hasta el control inteligente: todo lo necesario para crear instalaciones profesionales, eficientes y duraderas.</PanelHeading>
              <div className="redesign-carousel">
                <FamilyCarousel families={families} getCatImage={getCatImage} />
              </div>
            </div>
          </Reveal>
        )}

        {/* SECCIÓN 3: POR QUÉ ELEGIR BORALBA */}
        <Reveal as="section" className="redesign-section redesign-panel" delay={60}>
          <div className="redesign-panel-inner redesign-two-col">
            <div className="redesign-gallery">
              <div className="redesign-gallery-main">
                <ParallaxMedia src="images/asesoramiento.png" alt="Productos Boralba" speed={0.12} zoom={0.08} />
              </div>
              <div className="redesign-gallery-small">
                <ParallaxMedia src="images/perfiles.png" alt="Perfiles de aluminio" speed={0.1} zoom={0.06} />
              </div>
              <div className="redesign-gallery-small">
                <ParallaxMedia src="images/proyectos/Madrid-Sur1.jpg" alt="Instalación LED" speed={0.1} zoom={0.06} />
              </div>
            </div>
            <div className="redesign-advantages">
              <PanelHeading number="02" eyebrow="Por qué elegir Boralba" title="Una solución profesional de principio a fin" />
              <div className="redesign-advantages-list">
                {advantages.map((adv) => (
                  <div className="redesign-advantage" key={adv.num}>
                    <b>{adv.num}</b>
                    <div>
                      <strong>{adv.title}</strong>
                      <p>{adv.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* SECCIÓN 4: SOLUCIONES PARA PROFESIONALES */}
        <Reveal as="section" className="redesign-section redesign-panel" delay={60}>
          <div className="redesign-panel-inner redesign-two-col redesign-pro">
            <div className="redesign-pro-content">
              <p className="redesign-pro-eyebrow">Soluciones profesionales</p>
              <h2>Diseñado para profesionales</h2>
              <p className="redesign-pro-sub">Soluciones pensadas para arquitectos, interioristas, instaladores, distribuidores y empresas de proyectos.</p>
              <div className="redesign-pro-links">
                {professionalLinks.map((link) => (
                  <Link to={link.to} key={link.label} className="redesign-pro-link">
                    <span>{link.label}</span>
                    <em>→</em>
                  </Link>
                ))}
              </div>
              <Link to="/servicios" className="redesign-btn-primary redesign-btn-compact redesign-pro-cta">Descubrir soluciones profesionales</Link>
            </div>
            <div className="redesign-pro-media">
              <ParallaxMedia src="images/proyectos/centro_cultural_antonio_lopez_1.jpg" alt="Proyecto de arquitectura" speed={0.12} zoom={0.08} />
            </div>
          </div>
        </Reveal>

        {/* SECCIÓN 5: PROYECTOS Y APLICACIONES */}
        <Reveal as="section" className="redesign-section redesign-panel" delay={60}>
          <div className="redesign-panel-inner">
            <PanelHeading number="03" eyebrow="Proyectos" title="Iluminación que se adapta al espacio" />
            <ApplicationsStrip />
          </div>
        </Reveal>

        {/* SECCIÓN 6: DATOS DESTACADOS */}
        <Reveal as="section" className="redesign-section redesign-panel" delay={60}>
          <div className="redesign-panel-inner redesign-stats">
            {stats.map((stat) => (
              <div className="redesign-stat" key={stat.label}>
                <strong>{stat.num}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* SECCIÓN 7: TESTIMONIOS */}
        <Reveal as="section" className="redesign-section redesign-panel" delay={60}>
          <div className="redesign-panel-inner">
            <PanelHeading number="04" eyebrow="Clientes" title="Lo que dicen nuestros clientes" />
            <TestimonialSlider />
          </div>
        </Reveal>

        {/* SECCIÓN 8: PREGUNTAS FRECUENTES */}
        <Reveal as="section" className="redesign-section redesign-panel" delay={60}>
          <div className="redesign-panel-inner">
            <PanelHeading number="05" eyebrow="Ayuda" title="Preguntas frecuentes" />
            <FaqAccordion />
          </div>
        </Reveal>

        {/* SECCIÓN 9: CTA FINAL */}
        <Reveal as="section" className="redesign-section redesign-panel" delay={60}>
          <div className="redesign-cta">
            <ParallaxMedia src="images/proyectos/tunel_calle_damas_2.jpg" alt="Instalación LED profesional" speed={0.14} zoom={0.1} />
            <div className="redesign-cta-wash" />
            <div className="redesign-cta-content">
              <h2>¿Tienes un proyecto en mente?</h2>
              <p>Cuéntanos qué necesitas y te ayudaremos a encontrar la solución de iluminación adecuada.</p>
              <Link to="/contacto" className="redesign-btn-primary redesign-btn-compact">Solicitar presupuesto</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

export default Home
