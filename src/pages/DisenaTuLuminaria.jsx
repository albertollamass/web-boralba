import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'

const proceso = [
  { num: '01', title: 'Cuéntanos tu necesidad', desc: 'Analizamos el espacio, aplicación y requisitos del proyecto.' },
  { num: '02', title: 'Diseñamos la solución', desc: 'Estudiamos las características técnicas, formato y posibilidades de integración.' },
  { num: '03', title: 'Desarrollamos y validamos', desc: 'Definimos la solución y comprobamos su adecuación antes de la producción.' },
  { num: '04', title: 'Fabricamos y suministramos', desc: 'Preparamos la solución final para su incorporación al proyecto.' },
]

const personalizable = [
  'Formato y dimensiones',
  'Potencia y flujo luminoso',
  'Temperatura de color',
  'CRI',
  'Ópticas y distribución de luz',
  'Acabados',
  'Integración arquitectónica',
  'Control y regulación',
]

export default function DisenaTuLuminaria() {
  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    tipo: '',
    descripcion: '',
    privacidad: false,
    cookies: false,
    legal: false,
  })
  const [captcha, setCaptcha] = useState({ num1: 12, num2: 8, answer: '' })
  const [sent, setSent] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const updateCheck = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

  const scrollToForm = (e) => {
    e.preventDefault()
    document.getElementById('disena-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const submit = (e) => {
    e.preventDefault()
    if (parseInt(captcha.answer, 10) !== captcha.num1 + captcha.num2) {
      alert('La solución de la operación no es correcta.')
      return
    }
    if (!form.privacidad || !form.cookies || !form.legal) {
      alert('Debes aceptar la política de privacidad, cookies y aviso legal.')
      return
    }
    setSent(true)
  }

  return (
    <div className="disena">
      <section className="disena-hero">
        <div className="disena-hero-media" aria-hidden="true">
          <img src="images/IMAGEN 3D.png" alt="" />
        </div>
        <div className="disena-hero-copy">
          <Reveal>
            <p className="disena-hero-eyebrow">HALOPACK · Soluciones a medida</p>
            <h1>Diseña tu propia luminaria</h1>
            <p className="disena-hero-sub">
              Cuando un proyecto necesita algo diferente, desarrollamos soluciones de iluminación
              adaptadas a sus requisitos técnicos, estéticos y funcionales.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <a href="#disena-form" className="home-btn home-btn--red" onClick={scrollToForm}>
              Cuéntanos tu proyecto <span>→</span>
            </a>
          </Reveal>
        </div>
      </section>

      <div className="disena-sections">
        {/* Introducción */}
        <section className="disena-section">
          <div className="container">
            <div className="disena-intro">
              <Reveal>
                <p className="home-eyebrow">HALOPACK · Diseño a medida</p>
                <h2>De una necesidad a una solución propia</h2>
              </Reveal>
              <Reveal delay={80} className="disena-intro-body">
                <p>
                  Partimos de las necesidades de cada proyecto para estudiar y desarrollar una
                  solución de iluminación personalizada bajo nuestra marca HALOPACK.
                </p>
                <p>
                  Dimensiones, integración, potencia, temperatura de color, ópticas, acabados o
                  sistemas de control pueden formar parte del desarrollo según las necesidades del
                  proyecto.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Proceso de desarrollo */}
        <section className="disena-section">
          <div className="container">
            <div className="home-services">
              <div className="home-services-content">
                <Reveal>
                  <p className="home-eyebrow">Proceso</p>
                  <h2 className="home-services-title">Proceso de desarrollo</h2>
                </Reveal>
                <Reveal delay={80} className="home-services-steps-wrap">
                  <div className="home-services-steps">
                    {proceso.map((step) => (
                      <div className="home-service-step" key={step.num}>
                        <span className="home-service-num">{step.num}</span>
                        <span className="home-service-rail" aria-hidden="true">
                          <span className="home-service-dot" />
                        </span>
                        <span className="home-service-body">
                          <span className="home-service-title">{step.title}</span>
                          <span className="home-service-desc">{step.desc}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
              <Reveal delay={120} className="home-services-media">
                <img src="images/Foto halopack.png" alt="Soluciones LED HALOPACK a medida" loading="lazy" />
              </Reveal>
            </div>
          </div>
        </section>

        {/* Qué podemos personalizar */}
        <section className="disena-section">
          <div className="container">
            <Reveal className="disena-head">
              <p className="home-eyebrow">Personalización</p>
              <h2>Qué podemos personalizar</h2>
            </Reveal>
            <div className="disena-custom">
              {personalizable.map((item, i) => (
                <Reveal key={item} delay={i * 40} className="disena-custom-item">
                  <span className="disena-custom-num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{item}</h3>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Sección visual */}
        <section className="disena-section">
          <div className="container">
            <Reveal className="disena-visual-media">
              <img src="images/lobby.png" alt="Luminaria integrada en un proyecto arquitectónico" loading="lazy" />
            </Reveal>
            <div className="disena-visual-copy">
              <Reveal>
                <h2>Una luminaria pensada para el proyecto, no al revés.</h2>
              </Reveal>
              <Reveal delay={80}>
                <p>
                  El objetivo es adaptar la solución de iluminación al espacio y a sus necesidades,
                  evitando que el diseño del proyecto tenga que condicionarse únicamente a productos
                  estándar.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Formulario */}
        <section className="disena-section">
          <div className="container">
            <div className="disena-form-wrap">
              <div id="disena-form" className="disena-form-anchor">
                <Reveal className="disena-head">
                  <p className="home-eyebrow">Proyecto</p>
                  <h2>¿Tienes una idea o una necesidad concreta?</h2>
                  <p className="disena-head-sub">
                    Cuéntanos qué necesitas y estudiaremos contigo las posibilidades del proyecto.
                  </p>
                </Reveal>

                {sent ? (
                  <div className="form">
                    <div className="form-success">
                      ¡Gracias por tu interés! Hemos recibido tu solicitud. Nuestro equipo te
                      contactará lo antes posible para estudiar tu proyecto.
                    </div>
                  </div>
                ) : (
                  <form className="form" onSubmit={submit}>
                    <div>
                      <label>Nombre</label>
                      <input required value={form.nombre} onChange={update('nombre')} />
                    </div>
                    <div>
                      <label>Empresa</label>
                      <input value={form.empresa} onChange={update('empresa')} />
                    </div>
                    <div>
                      <label>Tu correo electrónico</label>
                      <input required type="email" value={form.email} onChange={update('email')} />
                    </div>
                    <div>
                      <label>Teléfono <span className="form-optional">(opcional)</span></label>
                      <input value={form.telefono} onChange={update('telefono')} />
                    </div>
                    <div>
                      <label>Tipo de proyecto</label>
                      <select value={form.tipo} onChange={update('tipo')}>
                        <option value="">Selecciona...</option>
                        <option>Obra o reforma</option>
                        <option>Interiorismo</option>
                        <option>Oficinas y corporativo</option>
                        <option>Retail y hostelería</option>
                        <option>Exterior y monumental</option>
                        <option>Otros</option>
                      </select>
                    </div>
                    <div>
                      <label>Descripción / Qué necesitas</label>
                      <textarea value={form.descripcion} onChange={update('descripcion')} />
                    </div>
                    <label className="check">
                      <input type="checkbox" checked={form.privacidad} onChange={updateCheck('privacidad')} />
                      <span>
                        He leído y acepto la{' '}
                        <Link to="/legal/politica-privacidad">política de privacidad de esta Web.</Link>
                      </span>
                    </label>
                    <label className="check">
                      <input type="checkbox" checked={form.cookies} onChange={updateCheck('cookies')} />
                      <span>
                        He leído y acepto la{' '}
                        <Link to="/legal/politica-cookies">política de cookies de esta Web.</Link>
                      </span>
                    </label>
                    <label className="check">
                      <input type="checkbox" checked={form.legal} onChange={updateCheck('legal')} />
                      <span>
                        He leído y acepto el{' '}
                        <Link to="/legal/aviso-legal">aviso legal de esta Web.</Link>
                      </span>
                    </label>
                    <div>
                      <label>
                        {captcha.num1} + {captcha.num2} =
                      </label>
                      <input
                        required
                        inputMode="numeric"
                        value={captcha.answer}
                        onChange={(e) => setCaptcha((c) => ({ ...c, answer: e.target.value }))}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">Enviar proyecto</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
