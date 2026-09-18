import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { canonicalFor, breadcrumbJsonLd } from '../lib/seo'

const services = [
  {
    number: '01',
    name: 'Asesoramiento técnico',
    intro: 'Analizamos las necesidades del espacio y del proyecto para definir la solución de iluminación más adecuada.',
    text: 'Ponemos el conocimiento técnico al servicio de cada decisión. Revisamos planos, usos, requisitos y presupuesto para avanzar con una propuesta viable desde el primer momento.',
    image: null,
    imageLabel: 'espacio de trabajo y reunión técnica',
    actions: ['Análisis de necesidades y planos', 'Revisión de normativa y eficiencia', 'Definición de soluciones y presupuesto'],
  },
  {
    number: '02',
    name: 'Diseño de iluminación',
    intro: 'Estudiamos la distribución, los niveles de luz y la integración de las soluciones en cada espacio.',
    text: 'Diseñamos una iluminación que acompaña a la arquitectura. Equilibramos confort, funcionalidad y estética para que cada luminaria tenga un propósito claro.',
    image: 'images/imagen-3d.png',
    imageAlt: 'Diseño de iluminación para un proyecto',
    actions: ['Distribución de luminarias', 'Cálculos y niveles de iluminación', 'Integración con arquitectura e interiorismo'],
  },
  {
    number: '03',
    name: 'Suministro profesional',
    intro: 'Seleccionamos y suministramos luminarias, componentes y sistemas adaptados a las necesidades del proyecto.',
    text: 'Trabajamos con producto profesional y una selección precisa. Coordinamos referencias, cantidades y plazos para que el material llegue preparado para la instalación.',
    image: 'images/foto-halopack.png',
    imageAlt: 'Soluciones LED profesionales HALOPACK',
    actions: ['Selección de luminarias y componentes', 'Preparación de pedidos profesionales', 'Coordinación de suministro y plazos'],
    note: 'HALOPACK · soluciones LED propias para proyectos profesionales',
  },
  {
    number: '04',
    name: 'Sistemas inteligentes',
    intro: 'Diseñamos e integramos sistemas de regulación y control para gestionar la iluminación de forma sencilla y eficiente.',
    text: 'Conectamos la iluminación con la forma en que se utiliza el espacio. Definimos escenas, regulación y control para ganar confort, eficiencia y autonomía.',
    image: 'images/tridonic.png',
    imageAlt: 'Sistemas de control e iluminación Tridonic',
    actions: ['Definición de sistemas de control', 'Programación de escenas y regulación', 'Integración de soluciones Tridonic'],
    note: 'TRIDONIC · tecnología de control e iluminación profesional',
  },
  {
    number: '05',
    name: 'Puesta en marcha',
    intro: 'Configuramos, programamos y comprobamos el funcionamiento de los sistemas de iluminación.',
    text: 'Acompañamos la instalación hasta que todo funciona como debe. Comprobamos circuitos, ajustamos parámetros y dejamos el sistema listo para su uso.',
    image: 'images/puesta_en_marcha.png',
    imageAlt: 'Puesta en marcha de una instalación de iluminación',
    actions: ['Configuración y programación', 'Pruebas de funcionamiento', 'Ajuste final y entrega del sistema'],
    note: 'Con tecnología TRIDONIC cuando el proyecto necesita control conectado',
  },
  {
    number: '06',
    name: 'Soporte continuo',
    intro: 'Acompañamos al cliente durante la instalación y después de la finalización del proyecto.',
    text: 'Seguimos cerca cuando el proyecto entra en funcionamiento. Resolvemos dudas, ayudamos en los ajustes y damos continuidad al rendimiento de la instalación.',
    image: null,
    imageLabel: 'seguimiento y soporte de una instalación',
    actions: ['Asistencia durante la instalación', 'Resolución de dudas y ajustes', 'Seguimiento posterior del proyecto'],
  },
]

function PendingImage({ label }) {
  return (
    <div className="servicios-image-placeholder" role="img" aria-label={`Imagen pendiente: ${label}`}>
      <span>IMAGEN PENDIENTE</span>
      <small>— {label}</small>
    </div>
  )
}

function TechnologyPanel() {
  return (
    <section className="servicios-technology" aria-label="Tecnología y soluciones">
      <div className="container">
        <p className="servicios-eyebrow">TECNOLOGÍA Y SOLUCIONES</p>
        <h2>Tecnología que integra. Soluciones que se adaptan.</h2>
        <div className="servicios-brands">
          <article className="servicios-brand servicios-brand--tridonic">
            <p className="servicios-brand-label">PARTNER TECNOLÓGICO</p>
            <img className="servicios-brand-logo" src="images/logo-tridonic.png" alt="TRIDONIC" width="300" height="100" />
            <img className="servicios-brand-image" src="images/tridonic.png" alt="Tecnología de control e iluminación TRIDONIC" loading="lazy" width="800" height="500" />
            <p className="servicios-brand-text">Integramos soluciones TRIDONIC de control y gestión de iluminación para desarrollar instalaciones eficientes, conectadas y adaptadas a cada proyecto.</p>
            <a className="servicios-brand-cta" href="https://www.tridonic.com/en/int" target="_blank" rel="noreferrer">VISITAR TRIDONIC <span aria-hidden="true">↗</span></a>
          </article>
          <article className="servicios-brand servicios-brand--halopack">
            <p className="servicios-brand-label">MARCA PROPIA</p>
            <img className="servicios-brand-logo" src="images/logo-halopack.png" alt="HALOPACK" width="300" height="100" />
            <img className="servicios-brand-image" src="images/foto-halopack.png" alt="Soluciones LED HALOPACK" loading="lazy" width="800" height="500" />
            <p className="servicios-brand-text">Nuestra marca propia de soluciones LED para proyectos profesionales.</p>
            <Link className="servicios-brand-cta" to="/productos">DESCUBRIR HALOPACK <span aria-hidden="true">→</span></Link>
            <div className="servicios-custom">
              <p className="servicios-custom-title">DISEÑA TU PROPIA LUMINARIA</p>
              <p className="servicios-custom-text">Desarrollamos soluciones de iluminación a medida adaptadas a las necesidades específicas de cada proyecto.</p>
              <Link className="servicios-brand-cta" to="/disena-tu-luminaria">DISEÑAR MI LUMINARIA <span aria-hidden="true">→</span></Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default function Servicios() {
  const [selectedService, setSelectedService] = useState('technology')
  const service = selectedService === 'technology' ? null : services[selectedService]

  return (
    <div className="servicios-redesign">
      <Seo
        title="Servicios de iluminación profesional | Boralba Lighting"
        description="Acompañamos cada proyecto de iluminación desde el asesoramiento técnico y el diseño hasta el suministro, la puesta en marcha y el soporte continuo."
        path="/servicios"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', url: canonicalFor('/') },
          { name: 'Servicios', url: canonicalFor('/servicios') },
        ])}
      />
      <section className="servicios-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Ruta de navegación">
            <Link to="/">Home</Link><span>/</span><span>Servicios</span>
          </nav>
          <p className="servicios-eyebrow">SERVICIOS</p>
          <h1>Iluminación de principio a fin.</h1>
          <p className="servicios-hero-text">Acompañamos cada proyecto desde el estudio inicial hasta la puesta en marcha y el soporte de la instalación.</p>
        </div>
      </section>

      <section className="servicios-explorer" aria-label="Explora nuestros servicios">
        <div className="container">
          <p className="servicios-nav-intro">Explora nuestros servicios</p>
          <div className="servicios-nav" role="tablist" aria-label="Servicios">
            <button
              className={`servicios-nav-item${selectedService === 'technology' ? ' is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={selectedService === 'technology'}
              onClick={() => setSelectedService('technology')}
            >
              Tecnología y soluciones
            </button>
            {services.map((item, index) => (
              <button
                key={item.number}
                className={`servicios-nav-item${selectedService === index ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={selectedService === index}
                onClick={() => setSelectedService(index)}
              >
                {item.name}
              </button>
            ))}
          </div>

          {selectedService === 'technology' ? <TechnologyPanel key="technology" /> : <article className="servicio-panel" key={service.number} role="tabpanel" aria-label={service.name}>
            <div className="servicio-panel-copy">
              <span className="servicio-number">{service.number}</span>
              <h2>{service.name}</h2>
              <p className="servicio-intro">{service.intro}</p>
              <p className="servicio-text">{service.text}</p>
              <Link to="/contacto" className="servicio-cta">Hablar con nosotros <span aria-hidden="true">→</span></Link>
            </div>
            <figure className="servicio-panel-media">
              {service.image ? <img src={service.image} alt={service.imageAlt} width="1200" height="800" /> : <PendingImage label={service.imageLabel} />}
            </figure>
            <div className="servicio-actions">
              <div>
                <p className="servicio-actions-label">Qué hacemos</p>
                <ul>{service.actions.map((action) => <li key={action}>{action}</li>)}</ul>
              </div>
              {service.note && <p className="servicio-note">{service.note}</p>}
            </div>
          </article>}
        </div>
      </section>

      <section className="servicios-process">
        <div className="container">
          <h2>UN PROCESO CONECTADO</h2>
          <div className="servicios-process-line" aria-label="01 Asesoramos, 02 Diseñamos, 03 Suministramos, 04 Integramos, 05 Ponemos en marcha, 06 Acompañamos">
            {['Asesoramos', 'Diseñamos', 'Suministramos', 'Integramos', 'Ponemos en marcha', 'Acompañamos'].map((step, index) => (
              <span key={step}><b>0{index + 1}</b> {step}{index < 5 && <i aria-hidden="true">→</i>}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="servicios-final-cta">
        <div className="container">
          <p className="servicios-eyebrow">HABLEMOS</p>
          <h2>¿Tienes un proyecto en mente?</h2>
          <Link to="/contacto" className="servicios-brand-cta">HABLAR CON NOSOTROS <span aria-hidden="true">→</span></Link>
        </div>
      </section>

    </div>
  )
}
