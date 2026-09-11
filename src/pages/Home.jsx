import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import FamilyCarousel from '../components/FamilyCarousel'
import Reveal, { useMediaFX } from '../components/Reveal'
import HomeHeader from '../components/HomeHeader'
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
]

const stats = [
  { num: '+', target: 500000, label: 'proyectos realizados por toda España' },
  { num: '100%', label: 'asesoramiento técnico personalizado' },
  { num: 'LED', label: 'soluciones profesionales' },
]

const testimonials = [
  ['Desde el primer contacto recibimos un asesoramiento impecable. La selección de perfiles y tiras LED encajó perfectamente con el proyecto de iluminación indirecta del nuevo restaurante.', 'Carlos Ruiz', 'Arquitecto · Estudio Ruiz'],
  ['Respuesta rápida, documentación técnica clara y productos de calidad. Son el aliado perfecto para cualquier instalación LED profesional.', 'María González', 'Instaladora eléctrica'],
  ['Nos ayudaron a diseñar la iluminación completa de nuestra tienda, desde la tira LED hasta el control inteligente. El resultado final superó todas las expectativas.', 'Javier Moreno', 'Directora de retail'],
]

const faqs = [
  ['¿Qué tira LED necesito para mi proyecto?', 'Depende de la tensión, la potencia, el color y la longitud necesaria. Para largas tiradas recomendamos tiras de 24V y para distancias muy grandes opciones de 220V. Nuestro equipo te asesora sobre la opción más adecuada según cada instalación.'],
  ['¿Qué diferencia hay entre IP20 e IP65?', 'La tira IP20 está pensada para instalaciones en interior protegidas. La IP65 lleva una protección adicional contra polvo y agua, ideal para exteriores, baños o zonas expuestas a humedad.'],
  ['¿Podéis ayudarme a elegir el perfil adecuado?', 'Sí. El perfil correcto depende del tipo de tira, el acabado deseado y la disipación de calor. Guiamos la selección según el uso y la forma de instalación.'],
  ['¿Qué driver necesito?', 'El driver debe coincidir con la tensión y la potencia total consumida por las tiras. También hay que decidir si es regulable y el protocolo de control.'],
  ['¿Disponéis de soluciones DALI, DMX o Casambi?', 'Sí, trabajamos con DALI, DMX y Casambi, así como otros sistemas de control profesional.'],
  ['¿Podéis preparar un presupuesto personalizado?', 'Por supuesto. Cuéntanos tu proyecto y preparamos un presupuesto personalizado.'],
]

function Heading({ number, eyebrow, title, children }) {
  return <div className="editorial-heading"><p className="eyebrow"><b>{number}</b>{eyebrow}</p><h2>{title}</h2>{children && <p>{children}</p>}</div>
}

function ApplicationsStrip() {
  const trackRef = useRef(null)
  const scrollBy = (direction) => trackRef.current?.scrollBy({ left: direction * 316, behavior: 'smooth' })
  return <div className="editorial-app-strip"><button type="button" onClick={() => scrollBy(-1)} aria-label="Aplicaciones anteriores">‹</button><div ref={trackRef}>{applications.map((item, index) => <figure key={item.label}><img src={item.img} alt={item.label} loading="lazy" /><figcaption><small>{String(index + 1).padStart(2, '0')}</small>{item.label}</figcaption></figure>)}</div><button type="button" onClick={() => scrollBy(1)} aria-label="Siguientes aplicaciones">›</button></div>
}

function ProfessionalScene() {
  return <div className="professional-scene professional-video-scene"><video src="images/video tira.mp4" poster="images/IMAGEN 3D.png" autoPlay loop muted playsInline preload="auto" aria-label="Animación del perfil y la tira LED" /></div>
  /*
  return <div className="professional-scene" aria-hidden="true">
    <div className="reference-product-stage">
      <div className="reference-product-shadow" />
      <img className="reference-profile-image" src="images/perfiles.png" alt="" />
      <img className="reference-strip-image" src="images/tira 3d.jpg" alt="" />
    </div>
    <svg viewBox="0 0 620 520" role="presentation">
      <defs>
        <linearGradient id="scene-aluminium" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e1e4e1" /><stop offset=".25" stopColor="#a8aeab" /><stop offset=".62" stopColor="#737a77" /><stop offset="1" stopColor="#454b49" /></linearGradient>
        <linearGradient id="scene-diffuser" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".96" /><stop offset=".55" stopColor="#e9ece8" stopOpacity=".88" /><stop offset="1" stopColor="#c6cbc7" stopOpacity=".9" /></linearGradient>
        <filter id="scene-shadow" x="-30%" y="-100%" width="160%" height="300%"><feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#202522" floodOpacity=".2" /></filter>
        <filter id="scene-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      <g className="scene-camera">
        <ellipse className="scene-product-shadow" cx="310" cy="365" rx="205" ry="18" fill="#c5c9c5" opacity=".4" />
        <g className="scene-product" filter="url(#scene-shadow)">
          <g className="scene-profile">
            <path d="M106 276L128 262H500L522 276L500 309H128Z" fill="url(#scene-aluminium)" stroke="#4a514e" strokeWidth="2" />
            <path d="M128 309H500L488 327H140Z" fill="#555c59" stroke="#3f4643" strokeWidth="2" />
            <path d="M128 262L150 248H478L500 262Z" fill="#d7dad7" opacity=".7" />
          </g>
          <path className="scene-led-glow" d="M154 278H474" fill="none" stroke="#fff0a5" strokeWidth="22" filter="url(#scene-glow)" />
          <path className="scene-led" d="M154 278H474" fill="none" stroke="#fff3b8" strokeWidth="7" />
          <g className="scene-led-details">
            <path d="M154 270H474" stroke="#d6d9d6" strokeWidth="10" />
            <path d="M154 270H474" stroke="#b9784f" strokeWidth="2" strokeDasharray="18 14" />
            <rect x="170" y="265" width="11" height="10" rx="2" fill="#f1c94b" /><rect x="205" y="265" width="11" height="10" rx="2" fill="#f1c94b" /><rect x="240" y="265" width="11" height="10" rx="2" fill="#f1c94b" /><rect x="275" y="265" width="11" height="10" rx="2" fill="#f1c94b" /><rect x="310" y="265" width="11" height="10" rx="2" fill="#f1c94b" /><rect x="345" y="265" width="11" height="10" rx="2" fill="#f1c94b" /><rect x="380" y="265" width="11" height="10" rx="2" fill="#f1c94b" /><rect x="415" y="265" width="11" height="10" rx="2" fill="#f1c94b" /><rect x="450" y="265" width="11" height="10" rx="2" fill="#f1c94b" />
          </g>
          <g className="scene-diffuser">
            <path d="M130 252L149 240H479L498 252L479 273H149Z" fill="url(#scene-diffuser)" stroke="#aab0ad" strokeWidth="2" />
            <path d="M149 273H479" fill="none" stroke="#f7f8f4" strokeWidth="3" opacity=".9" />
          </g>
        </g>
      </g>
    </svg>
  </div> */
}

function AnimatedStat({ stat }) {
  const ref = useRef(null)
  const [value, setValue] = useState(stat.target ? 0 : null)

  useEffect(() => {
    if (!stat.target || !ref.current) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setValue(stat.target)
      return
    }
    let frame
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        cancelAnimationFrame(frame)
        setValue(0)
        return
      }
      const start = performance.now()
      const duration = 1400
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - (1 - progress) ** 3
        setValue(Math.round(stat.target * eased))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, { threshold: 0.2 })
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [stat.target])

  return <div ref={ref} className={stat.target ? 'stat-featured' : ''}><strong>{stat.target ? <><i>+</i><em>{new Intl.NumberFormat('es-ES').format(value)}</em></> : stat.num}</strong><span>{stat.label}</span></div>
}

function TestimonialSlider() {
  const [index, setIndex] = useState(0)
  const item = testimonials[index]
  return <div className="editorial-testimonial"><span>“</span><p>{item[0]}</p><strong>{item[1]}</strong><small>{item[2]}</small><div><button type="button" onClick={() => setIndex((index + testimonials.length - 1) % testimonials.length)} aria-label="Testimonio anterior">←</button><button type="button" onClick={() => setIndex((index + 1) % testimonials.length)} aria-label="Siguiente testimonio">→</button></div></div>
}

function FaqAccordion() {
  const [open, setOpen] = useState(null)
  return <div className="editorial-faq-list">{faqs.map(([question, answer], index) => <div key={question} className={open === index ? 'is-open' : ''}><button type="button" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index}><span>{question}</span><b>{open === index ? '−' : '+'}</b></button><p>{answer}</p></div>)}</div>
}

export default function Home() {
  const { categories, getCategory, getChildren } = useCategories()
  const [menuOpen, setMenuOpen] = useState(false)
  const heroMediaRef = useMediaFX(0.16, 0)
  const flagged = categories.filter((category) => category.showInHome).sort((a, b) => (a.homeOrder ?? 999) - (b.homeOrder ?? 999))
  const homeSource = flagged.length ? flagged : getChildren(ROOT.slug)
  const families = homeSource.map((category) => ({ slug: category.slug, name: category.name }))
  const getCatImage = (slug) => getCategory(slug)?.image || 'images/placeholder.svg'

  return <div className="home redesign-home">
    <section className="editorial-header"><HomeHeader menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} onNavigate={() => setMenuOpen(false)} /></section>
    <main className="editorial-canvas">
      <section className="editorial-hero"><div className="editorial-hero-copy"><p className="eyebrow">Iluminación técnica para proyectos</p><h1>BORALBA</h1><div className="hero-note"><h2>Soluciones que convierten cada proyecto en una referencia</h2><p>Asesoramiento técnico, producto LED profesional y proyectos que marcan la diferencia.</p><Link to="/productos" className="editorial-button">Explorar productos</Link></div></div><span ref={heroMediaRef} className="editorial-hero-image"><img src="images/lobby.png" alt="Instalación de iluminación arquitectónica" loading="eager" fetchPriority="high" /></span></section>
      <Reveal as="section" className="editorial-intro"><h2>Una solución profesional de principio a fin</h2><p>Desde la tira LED hasta el control inteligente: todo lo necesario para crear instalaciones profesionales, eficientes y duraderas.</p></Reveal>
      {families.length > 0 && <Reveal as="section" className="editorial-families editorial-families-after-intro"><FamilyCarousel families={families} getCatImage={getCatImage} /></Reveal>}
      <Reveal as="section" className="editorial-corporate"><img className="editorial-corporate-image" src="images/almacen.png" alt="Almacén de Boralba Lighting" /><div><p className="eyebrow">Boralba Lighting</p><h2>+ de 30 años en el sector de iluminación</h2><p>En Boralba Lighting trabajamos ofreciendo soluciones de iluminación profesional para proyectos comerciales, arquitectónicos y residenciales a través de distribución.</p></div></Reveal>
      <Reveal as="section" className="editorial-stats">{stats.map((stat) => <AnimatedStat stat={stat} key={stat.label} />)}</Reveal>
      <Reveal as="section" className="editorial-why"><ProfessionalScene /><div className="editorial-advantages"><p className="eyebrow">Por qué elegir Boralba</p><h2>Una solución profesional de principio a fin</h2><div>{advantages.map((adv) => <article key={adv.num}><b>{adv.num}</b><span><strong>{adv.title}</strong><small>{adv.desc}</small></span></article>)}</div></div></Reveal>
      <Reveal as="section" className="editorial-statement"><img src="images/proyectos/tunel_calle_damas_2.jpg" alt="Instalación LED profesional" /><div><p>Proyectos que dejan huella</p><h2>La luz también construye espacios.</h2></div></Reveal>
      <Reveal as="section" className="editorial-solutions"><div className="solutions-copy"><p className="eyebrow">Soluciones profesionales</p><h2>Diseñado para profesionales</h2><p>Soluciones pensadas para arquitectos, interioristas, instaladores, distribuidores y empresas de proyectos.</p>{professionalLinks.map((link) => <Link to={link.to} key={link.label}>{link.label}<span>↗</span></Link>)}</div><div className="solutions-images"><img className="solution-large" src="images/proyectos/centro_cultural_antonio_lopez_1.jpg" alt="Proyecto de arquitectura" /><img className="solution-small" src="images/proyectos/decoracion_hogar.jpg" alt="Iluminación de muebles" /></div></Reveal>
      <Reveal as="section" className="editorial-applications"><Heading number="03" eyebrow="Proyectos" title="Iluminación que se adapta al espacio" /><ApplicationsStrip /></Reveal>
      <Reveal as="section" className="editorial-testimonials"><Heading number="04" eyebrow="Clientes" title="Lo que dicen nuestros clientes" /><TestimonialSlider /></Reveal>
      <Reveal as="section" className="editorial-faq"><Heading number="05" eyebrow="Ayuda" title="Preguntas frecuentes" /><FaqAccordion /></Reveal>
      <section className="editorial-contact"><div><p className="eyebrow">Hablemos de tu proyecto</p><h2>¿Tienes un proyecto de iluminación?</h2></div><form action="contacto" method="get"><p>Te ayudamos a encontrar la solución adecuada.</p><input name="nombre" placeholder="Nombre" /><input name="email" type="email" placeholder="Tu correo electrónico" /><textarea name="mensaje" placeholder="Mensaje" rows="2" /><button type="submit" className="editorial-button">Solicitar asesoramiento</button></form></section>
    </main>
  </div>
}
