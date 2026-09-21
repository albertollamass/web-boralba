import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal, { ParallaxMedia } from '../components/Reveal'
import Seo from '../components/Seo'
import { canonicalFor, breadcrumbJsonLd } from '../lib/seo'

const proceso = [
  { num: '01', title: 'Necesidad', desc: 'Analizamos el espacio, su uso y los requisitos del proyecto.' },
  { num: '02', title: 'Diseño', desc: 'Definimos formato, luz y las posibilidades de integración.' },
  { num: '03', title: 'Desarrollo', desc: 'Resolvemos la solución técnica y validamos su viabilidad.' },
  { num: '04', title: 'Producción', desc: 'Fabricamos la luminaria y la preparamos para la obra.' },
]

const personalizable = [
  { label: 'Dimensiones', note: 'Formatos y tamaños ajustados al espacio y a su geometría.' },
  { label: 'Potencia', note: 'Flujo luminoso y consumo según la aplicación y los niveles de luz.' },
  { label: 'CCT', note: 'Temperatura de color desde 2200 K hasta 6500 K.' },
  { label: 'CRI', note: 'Reproducción cromática hasta CRI 95.' },
  { label: 'Ópticas', note: 'Distribución e intensidad de la luz según lo que quieras iluminar.' },
  { label: 'Acabados', note: 'Colores RAL, materiales y texturas para cada proyecto.' },
  { label: 'Control', note: 'Regulación, escenas y sistemas conectados integrados.' },
  { label: 'Integración', note: 'Empotrado, superficie, suspensión o integración a medida.' },
]

const ejemplos = [
  {
    img: 'images/proyectos/torre_consuerga_1.jpg',
    role: 'Exterior · Monumento',
    name: 'Torre de Consuegra',
    to: '/proyectos/arquitectura-espacios-singulares/torre-consuegra-iluminacion-monumental',
    feature: true,
  },
  {
    img: 'images/proyectos/centro_medico_1.jpg',
    role: 'Corporativo',
    name: 'Centro médico',
    to: '/proyectos/corporativo-oficinas/centro-medico',
  },
  {
    img: 'images/proyectos/tunel_calle_damas_azul.jpg',
    role: 'Espacio público',
    name: 'Túnel Calle Damas',
    to: '/proyectos/publico-cultural/tunel-calle-damas',
  },
  {
    img: 'images/proyectos/centro_cultural_antonio_lopez_1.jpg',
    role: 'Cultural',
    name: 'Centro Antonio López',
    to: '/proyectos/publico-cultural/centro-cultural-antonio-lopez',
  },
  {
    img: 'images/proyectos/jc-santo-domingo-1.jpg',
    role: 'Hostelería',
    name: 'Hotel JC Santo Domingo',
    to: '/proyectos/hosteleria-restauracion/hotel-jc-santo-domingo',
  },
  {
    img: 'images/proyectos/Madrid-Sur1.jpg',
    role: 'Retail',
    name: 'Centro Comercial Madrid Sur',
    to: '/proyectos/retail-comercial/centro-comercial-madrid-sur',
  },
  {
    img: 'images/proyectos/chalet_pozuelo.png',
    role: 'Residencial',
    name: 'Chalet en Pozuelo',
    to: '/proyectos/residencial/chalet-en-pozuelo-de-alarcon',
  },
]

const etapas = [
  {
    num: '01',
    label: 'Idea',
    img: 'images/imagen-3d.png',
    alt: 'Render 3D del concepto de una luminaria a medida',
    text: 'Captamos la necesidad y proyectamos la solución en tres dimensiones.',
  },
  {
    num: '02',
    label: 'Desarrollo',
    img: 'images/perfiles.png',
    alt: 'Componentes y perfiles para el desarrollo de la luminaria',
    text: 'Definimos componentes, óptica, color y acabados hasta dar con la pieza exacta.',
  },
  {
    num: '03',
    label: 'Resultado',
    img: 'images/foto-halopack.png',
    alt: 'Luminaria HALOPACK fabricada a medida',
    text: 'Fabricamos bajo nuestra marca propia y entregamos la luminaria lista para el proyecto.',
  },
]

const campos = [
  { num: '01', name: 'Obra nueva y reforma', desc: 'La luminaria se proyecta junto al espacio, desde el origen.' },
  { num: '02', name: 'Interiorismo y residencial', desc: 'Luz integrada en la arquitectura interior y en el día a día del hogar.' },
  { num: '03', name: 'Hostelería y restauración', desc: 'Ambientes propios con una luz orientada al confort y al carácter.' },
  { num: '04', name: 'Retail y comercio', desc: 'Presentación de producto y recorridos que acompañan la marca.' },
  { num: '05', name: 'Oficinas y corporativo', desc: 'Confort visual y funcionalidad para los espacios de trabajo.' },
  { num: '06', name: 'Público y cultural', desc: 'Equipamientos y espacios urbanos con identidad luminosa.' },
  { num: '07', name: 'Exterior y monumental', desc: 'Puesta en escena de la arquitectura y el entorno durante la noche.' },
]

function scrollTo(id) {
  return (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function Hero() {
  return (
    <section className="disena-hero">
      <div className="disena-hero-media" aria-hidden="true">
        <img src="images/lobby.png" alt="" />
      </div>
      <div className="disena-hero-copy">
        <Reveal>
          <nav className="disena-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Diseña tu luminaria</span>
          </nav>
          <p className="disena-hero-eyebrow">HALOPACK · Soluciones a medida</p>
          <h1>Diseña tu propia luminaria</h1>
          <p className="disena-hero-sub">
            Cuando un proyecto necesita algo diferente, desarrollamos luminarias adaptadas a sus
            requisitos técnicos, estéticos y de integración.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <div className="disena-hero-actions">
            <a href="#disena-form" className="home-btn home-btn--red" onClick={scrollTo('disena-form')}>
              Cuéntanos tu proyecto <span>→</span>
            </a>
            <a href="#disena-proceso" className="disena-hero-link" onClick={scrollTo('disena-proceso')}>
              Ver cómo trabajamos <span>↓</span>
            </a>
          </div>
        </Reveal>
      </div>
      <p className="disena-hero-meta" aria-hidden="true">
        Dimensiones · Potencia · CCT · CRI · Ópticas
        <br />
        Acabados · Control · Integración
      </p>
    </section>
  )
}

function Meaning() {
  return (
    <section className="disena-section">
      <div className="container">
        <div className="disena-meaning">
          <Reveal className="disena-meaning-copy">
            <p className="disena-eyebrow">Una solución a medida</p>
            <h2>Cuando el proyecto lo pide, creamos la luminaria.</h2>
            <p>
              No elegimos entre catálogos: partimos de la necesidad y diseñamos una luminaria que
              nace para ese espacio, ese material y ese momento del día.
            </p>
            <p>
              La desarrollamos con nuestra marca propia HALOPACK hasta obtener la pieza exacta,
              lista para integrarse en el proyecto.
            </p>
            <a href="#disena-form" className="disena-meaning-link" onClick={scrollTo('disena-form')}>
              Cuéntanos tu proyecto <span>→</span>
            </a>
          </Reveal>
          <Reveal delay={120} className="disena-meaning-media">
            <ParallaxMedia src="images/obra_panel_led.png" alt="Panel LED integrado a medida en un proyecto de obra" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Proceso() {
  return (
    <section className="disena-section disena-section--mist" id="disena-proceso">
      <div className="container">
        <Reveal className="disena-head">
          <p className="disena-eyebrow">Proceso</p>
          <h2>Cuatro fases, de la necesidad a la luminaria.</h2>
        </Reveal>
        <div className="disena-steps">
          {proceso.map((step, i) => (
            <Reveal key={step.num} delay={i * 90} className="disena-step">
              <span className="disena-step-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Personalizable() {
  const [chip, setChip] = useState(personalizable[0])
  return (
    <section className="disena-section">
      <div className="container">
        <Reveal className="disena-head">
          <p className="disena-eyebrow">Personalización</p>
          <h2>Qué puedes personalizar</h2>
          <p className="disena-head-sub">
            Cada parámetro de la luminaria puede adaptarse al proyecto. Selecciona una opción para
            descubrir qué ajustamos.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <div className="disena-chips">
            {personalizable.map((item) => (
              <button
                type="button"
                key={item.label}
                className={`disena-chip${chip.label === item.label ? ' is-active' : ''}`}
                aria-pressed={chip.label === item.label}
                onClick={() => setChip(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="disena-chip-note">
            <b>{chip.label}.</b> {chip.note}
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Ejemplos() {
  const feature = ejemplos.find((item) => item.feature)
  const rest = ejemplos.filter((item) => !item.feature)
  return (
    <section className="disena-section">
      <div className="container">
        <Reveal className="disena-head">
          <p className="disena-eyebrow">En la práctica</p>
          <h2>Luminarias que nacen para el proyecto.</h2>
          <p className="disena-head-sub">
            Integraciones reales desarrolladas a medida para arquitectura, interiorismo y espacios
            públicos.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <figure className="disena-example disena-example--feature">
            <Link className="disena-example-media" to={feature.to}>
              <img src={feature.img} alt={feature.name} loading="lazy" />
            </Link>
            <figcaption className="disena-example-cap">
              <span className="disena-example-name">{feature.name}</span>
              <span className="disena-example-role">{feature.role}</span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="disena-examples-grid">
          {rest.map((item, i) => (
            <Reveal key={item.name} delay={(i % 3) * 80}>
              <figure className="disena-example disena-example--row">
                <Link className="disena-example-media" to={item.to}>
                  <img src={item.img} alt={item.name} loading="lazy" />
                </Link>
                <figcaption className="disena-example-cap">
                  <span className="disena-example-name">{item.name}</span>
                  <span className="disena-example-role">{item.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <Link to="/proyectos" className="disena-more">
            Ver todos los proyectos <span>→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function Resultado() {
  return (
    <section className="disena-section disena-section--mist">
      <div className="container">
        <Reveal className="disena-head">
          <p className="disena-eyebrow">De la idea al resultado</p>
          <h2>Así nace cada luminaria.</h2>
        </Reveal>
        <div className="disena-flow">
          {etapas.map((etapa, i) => (
            <Reveal key={etapa.num} delay={i * 90} as="div" className="disena-stage-wrap" variant="up">
              <article className="disena-stage">
                <span className="disena-stage-num">{etapa.num}</span>
                <figure className="disena-stage-media">
                  <img src={etapa.img} alt={etapa.alt} loading="lazy" />
                </figure>
                <h3 className="disena-stage-label">{etapa.label}</h3>
                <p className="disena-stage-text">{etapa.text}</p>
              </article>
              {i < etapas.length - 1 && <span className="disena-flow-arrow" aria-hidden="true">→</span>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Campos() {
  return (
    <section className="disena-section">
      <div className="container">
        <Reveal className="disena-head">
          <p className="disena-eyebrow">Ámbitos</p>
          <h2>Dónde se aplica una luminaria a medida.</h2>
        </Reveal>
        <div className="disena-fields">
          {campos.map((campo, i) => (
            <Reveal key={campo.num} delay={(i % 2) * 80} className="disena-field">
              <span className="disena-field-num">{campo.num}</span>
              <div>
                <span className="disena-field-name">{campo.name}</span>
                <p className="disena-field-desc">{campo.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Solicitud() {
  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    descripcion: '',
  })
  const [archivo, setArchivo] = useState(null)
  const [sent, setSent] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section className="disena-section disena-contacto" id="disena-form">
      <div className="container">
        <Reveal className="disena-contacto-head">
          <p className="disena-eyebrow">Contacto</p>
          <h2>Cuéntanos tu proyecto</h2>
          <p className="disena-head-sub">
            Cuéntanos qué necesitas y estudiaremos contigo la mejor solución.
          </p>
        </Reveal>

        {sent ? (
          <div className="disena-form-success">
            ¡Gracias por tu consulta! Nuestro equipo estudiará tu proyecto y te responderá lo antes
            posible.
          </div>
        ) : (
          <Reveal delay={120}>
            <form className="disena-form" onSubmit={submit}>
              <div className="disena-form-row">
                <div className="disena-form-field">
                  <label htmlFor="d-nombre">Nombre</label>
                  <input
                    id="d-nombre"
                    required
                    value={form.nombre}
                    onChange={update('nombre')}
                    autoComplete="name"
                  />
                </div>
                <div className="disena-form-field">
                  <label htmlFor="d-empresa">Empresa</label>
                  <input
                    id="d-empresa"
                    value={form.empresa}
                    onChange={update('empresa')}
                    autoComplete="organization"
                  />
                </div>
              </div>
              <div className="disena-form-row">
                <div className="disena-form-field">
                  <label htmlFor="d-email">Email</label>
                  <input
                    id="d-email"
                    required
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    autoComplete="email"
                  />
                </div>
                <div className="disena-form-field">
                  <label htmlFor="d-telefono">Teléfono</label>
                  <input
                    id="d-telefono"
                    value={form.telefono}
                    onChange={update('telefono')}
                    autoComplete="tel"
                  />
                </div>
              </div>
              <div className="disena-form-field">
                <label htmlFor="d-descripcion">Cuéntanos brevemente tu proyecto</label>
                <textarea id="d-descripcion" value={form.descripcion} onChange={update('descripcion')} />
              </div>
              <div className="disena-form-field">
                <label htmlFor="d-archivo">
                  Adjuntar archivo <span className="form-optional">(opcional)</span>
                </label>
                <div className="disena-form-file">
                  <input
                    id="d-archivo"
                    type="file"
                    onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                  />
                  <span className="disena-form-file-btn" aria-hidden="true">
                    Añadir archivo
                  </span>
                  <span className="disena-form-file-name">{archivo ? archivo.name : ''}</span>
                </div>
              </div>
              <div className="disena-form-actions">
                <button type="submit" className="home-btn home-btn--red disena-submit">
                  Enviar consulta <span>→</span>
                </button>
                <p className="disena-form-legal">
                  Tu consulta se tratará conforme a nuestra{' '}
                  <Link to="/legal/politica-privacidad">política de privacidad</Link>.
                </p>
              </div>
            </form>
          </Reveal>
        )}
      </div>
    </section>
  )
}

export default function DisenaTuLuminaria() {
  return (
    <div className="disena">
      <Seo
        title="Diseña tu propia luminaria a medida — HALOPACK"
        description="Desarrollamos luminarias LED a medida bajo la marca HALOPACK: formato, potencia, temperatura de color, ópticas, acabados y control para tu proyecto."
        path="/disena-tu-luminaria"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', url: canonicalFor('/') },
          { name: 'Diseña tu luminaria', url: canonicalFor('/disena-tu-luminaria') },
        ])}
      />
      <Hero />
      <Meaning />
      <Proceso />
      <Personalizable />
      <Ejemplos />
      <Resultado />
      <Campos />
      <Solicitud />
    </div>
  )
}