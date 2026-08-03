import { useState } from 'react'
import { Link } from 'react-router-dom'

const icons = {
  phone: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  pin: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  clock: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
}

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo: '',
    mensaje: '',
    privacidad: false,
    cookies: false,
    legal: false,
  })
  const [captcha, setCaptcha] = useState({ num1: 12, num2: 8, answer: '' })
  const [sent, setSent] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const updateCheck = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

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
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Contacto</span>
          </div>
          <h1>¿Tienes un proyecto de iluminación?</h1>
          <p>Te ayudamos a hacerlo realidad. Respuesta en menos de 24h, sin compromiso.</p>
          <ul className="checklist mt-2">
            <li>Respuesta en menos de 24h</li>
            <li>Asesoramiento técnico especializado</li>
            <li>Sin compromiso</li>
          </ul>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div className="section-head left">
          <h2>Cuéntanos tu proyecto</h2>
          <p>Te ayudamos a encontrar la mejor solución.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-item">
              <span className="icon">{icons.phone}</span>
              <div>
                <h4>Llámanos</h4>
                <p>
                  <a href="tel:+34918707113">(34) 91 870 71 13</a>
                </p>
              </div>
            </div>
            <div className="contact-item">
              <span className="icon">{icons.mail}</span>
              <div>
                <h4>Email</h4>
                <p>
                  <a href="mailto:boralba@boralba.es">boralba@boralba.es</a>
                </p>
              </div>
            </div>
            <div className="contact-item">
              <span className="icon">{icons.pin}</span>
              <div>
                <h4>Dirección</h4>
                <p>
                  Calle Destreza, 3. Nave D10
                  <br />
                  Polígono Los Olivos, 28906 Getafe
                </p>
              </div>
            </div>
            <div className="contact-item">
              <span className="icon">{icons.clock}</span>
              <div>
                <h4>Horario</h4>
                <p>
                  Lunes a Viernes
                  <br />
                  8:00 – 18:00
                </p>
              </div>
            </div>
          </div>

          {sent ? (
            <div className="form">
              <div className="form-success">
                ¡Gracias por contactar con nosotros! Nos pondremos en contacto contigo lo antes
                posible para ayudarte con tu proyecto y ofrecerte la mejor solución.
              </div>
            </div>
          ) : (
            <form className="form" onSubmit={submit}>
              <div>
                <label>Nombre</label>
                <input required value={form.nombre} onChange={update('nombre')} />
              </div>
              <div>
                <label>Tu correo electrónico</label>
                <input required type="email" value={form.email} onChange={update('email')} />
              </div>
              <div>
                <label>Teléfono</label>
                <input value={form.telefono} onChange={update('telefono')} />
              </div>
              <div>
                <label>Tipo de consulta</label>
                <select value={form.tipo} onChange={update('tipo')}>
                  <option value="">Selecciona...</option>
                  <option>Asesoramiento</option>
                  <option>Presupuesto</option>
                  <option>Productos</option>
                  <option>Proyecto</option>
                  <option>Outlet</option>
                  <option>Otros</option>
                </select>
              </div>
              <div>
                <label>Mensaje</label>
                <textarea value={form.mensaje} onChange={update('mensaje')} />
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
                  He leído y acepto el <Link to="/legal/aviso-legal">aviso legal de esta Web.</Link>
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
              <button type="submit" className="btn btn-primary">
                Solicitar asesoramiento
              </button>
            </form>
          )}
        </div>

        <div className="section-head mt-3" style={{ marginTop: 56 }}>
          <h2>Nuestra ubicación</h2>
          <a
            href="https://maps.app.goo.gl/JMsuqrwod9QZHpHs7"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary mt-2"
            style={{ display: 'inline-flex' }}
          >
            VER EN GOOGLE MAPS
          </a>
        </div>
      </div>
    </>
  )
}
