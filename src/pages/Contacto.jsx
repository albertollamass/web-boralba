import { useState } from 'react'
import { Link } from 'react-router-dom'

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
        <div className="section-head" style={{ textAlign: 'left' }}>
          <h2>Cuéntanos tu proyecto</h2>
          <p>Te ayudamos a encontrar la mejor solución.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-item">
              <span className="icon">📞</span>
              <div>
                <h4>Llámanos</h4>
                <p>
                  <a href="tel:+34918707113">(34) 91 870 71 13</a>
                </p>
              </div>
            </div>
            <div className="contact-item">
              <span className="icon">✉️</span>
              <div>
                <h4>Email</h4>
                <p>
                  <a href="mailto:boralba@boralba.es">boralba@boralba.es</a>
                </p>
              </div>
            </div>
            <div className="contact-item">
              <span className="icon">📍</span>
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
              <span className="icon">🕒</span>
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
