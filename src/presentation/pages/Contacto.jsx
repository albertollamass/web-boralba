import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSiteSettings } from '../../application/catalog/SiteSettingsContext'
import Seo from '../components/Seo'
import { canonicalFor, breadcrumbJsonLd } from '../../domain/site/site'

const ENDPOINT = 'https://api.web3forms.com/submit'
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || ''

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

export default function Contacto({ analytics }) {
  const { settings } = useSiteSettings()
  const [searchParams] = useSearchParams()
  const selectedRefs = searchParams.get('productos') || ''
  const phoneHref = `tel:+${settings.phone.replace(/\D/g, '')}`
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo: '',
    mensaje: selectedRefs ? `Referencias de la solución: ${selectedRefs}\n\n` : '',
    consentimiento: false,
  })
  const [captcha, setCaptcha] = useState({ num1: 12, num2: 8, answer: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const updateCheck = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

  const submit = async (e) => {
    e.preventDefault()
    if (sending) return
    if (document.getElementById('website')?.value || document.getElementById('botcheck')?.checked) return

    const errors = {}
    const name = form.nombre.trim()
    const email = form.email.trim()
    const message = form.mensaje.trim()
    if (!name) errors.nombre = 'Indica tu nombre.'
    if (!email) errors.email = 'Indica tu correo electrónico.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Introduce un correo electrónico válido.'
    if (!message) errors.mensaje = 'Cuéntanos brevemente tu proyecto.'
    if (!form.consentimiento) errors.consentimiento = 'Debes aceptar la política de privacidad para continuar.'
    if (parseInt(captcha.answer, 10) !== captcha.num1 + captcha.num2) errors.captcha = 'Resuelve la operación para continuar.'

    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setErrorMsg('Revisa los campos indicados antes de enviar la consulta.')
      const firstInvalid = Object.keys(errors)[0]
      document.getElementById(firstInvalid)?.focus()
      return
    }
    if (!ACCESS_KEY) {
      setErrorMsg('El formulario aún no está configurado para el envío. Inténtalo más tarde.')
      return
    }

    setSending(true)
    setErrorMsg('')

    try {
      const data = new FormData()
      data.append('access_key', ACCESS_KEY)
      data.append('subject', `Nueva consulta de contacto — ${name}`)
      data.append('from_name', name)
      data.append('replyto', email)
      data.append(
        'message',
        [
          'NUEVA CONSULTA DE CONTACTO',
          '',
          `Nombre: ${name}`,
          `Email: ${email}`,
          `Teléfono: ${form.telefono.trim() || 'No indicado'}`,
          `Tipo de consulta: ${form.tipo || 'No indicado'}`,
          '',
          'MENSAJE',
          message,
        ].join('\n')
      )
      data.append('Nombre', name)
      data.append('email', email)
      data.append('Teléfono', form.telefono.trim() || 'No indicado')
      data.append('Tipo de consulta', form.tipo || 'No indicado')
      data.append('Mensaje', message)
      data.append('Acepta privacidad, cookies y aviso legal', 'Sí')

      const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      const result = await response.json().catch(() => ({
        success: false,
        message: 'El servicio no respondió correctamente.',
      }))

      if (!response.ok || !result.success) {
        throw new Error(
          typeof result.message === 'string'
            ? result.message
            : 'No se pudo enviar la consulta. Vuelve a intentarlo.'
        )
      }

      setFieldErrors({})
      setSent(true)
      analytics?.track('contact_form_success')
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'No se pudo enviar la consulta. Comprueba tu conexión e inténtalo de nuevo.'
      )
    } finally {
      setSending(false)
    }
  }

  const scrollToForm = (e) => {
    e.preventDefault()
    document.getElementById('contacto-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="contacto-page">
      <Seo
        title="Contacto — Respuesta en menos de 24h"
        description="Cuéntanos tu proyecto de iluminación LED: asesoramiento técnico especializado sin compromiso. Getafe, Madrid. Tel. (34) 91 870 71 13, boralba@boralba.es."
        path="/contacto"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', url: canonicalFor('/') },
          { name: 'Contacto', url: canonicalFor('/contacto') },
        ])}
      />

      {/* 1 · Hero: imagen de fondo a sangre completa, texto superpuesto */}
      <section
        className="contacto-hero"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(26,26,30,.82) 0%, rgba(26,26,30,.62) 30%, rgba(26,26,30,.34) 56%, rgba(26,26,30,.12) 78%, rgba(26,26,30,0) 100%), url("images/contacto-hero.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 56%',
        }}
      >
        <div className="container contacto-hero-grid">
          <div className="contacto-hero-copy">
            <p className="eyebrow">Contacto</p>
            <h1>¿Tienes un proyecto de iluminación?</h1>
            <p className="contacto-hero-text">
              Te ayudamos a hacerlo realidad: asesoramiento técnico especializado, respuesta en
              menos de 24h y sin compromiso.
            </p>
            <a href="#contacto-form" onClick={scrollToForm} className="btn btn-primary">
              Cuéntanos tu proyecto
              <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2 · Cuéntanos tu proyecto: contenido y formulario */}
      <section className="contacto-contacto">
        <div className="container">
          <div className="contacto-info-grid">
            <aside className="contacto-info">
              <div className="contacto-section-head">
                <h2 className="contacto-section-title">Cuéntanos tu proyecto</h2>
                <p className="contacto-section-sub">
                  Cuéntanos qué necesitas y te ayudaremos a encontrar la solución más adecuada.
                </p>
              </div>
              <div className="contacto-info-item">
                <span className="contacto-info-icon">{icons.phone}</span>
                <div>
                  <h4>Llámanos</h4>
                  <p>
                     <a href={phoneHref} onClick={() => analytics?.track('click_phone', { location: 'contact_page' })}>{settings.phone}</a>
                  </p>
                </div>
              </div>
              <div className="contacto-info-item">
                <span className="contacto-info-icon">{icons.mail}</span>
                <div>
                  <h4>Email</h4>
                  <p>
                     <a href={`mailto:${settings.email}`} onClick={() => analytics?.track('click_email', { location: 'contact_page' })}>{settings.email}</a>
                  </p>
                </div>
              </div>
              <div className="contacto-info-item">
                <span className="contacto-info-icon">{icons.pin}</span>
                <div>
                  <h4>Dirección</h4>
                  <p>
                    Calle Destreza, 3. Nave D10
                    <br />
                    Polígono Los Olivos, 28906 Getafe
                  </p>
                </div>
              </div>
              <div className="contacto-info-item">
                <span className="contacto-info-icon">{icons.clock}</span>
                <div>
                  <h4>Horario</h4>
                  <p>{settings.hours}</p>
                </div>
              </div>
            </aside>

            <div className="contacto-main" id="contacto-form">
              {sent ? (
                <div className="form" role="status" aria-live="polite">
                  <div className="form-success" tabIndex="-1">
                    ¡Gracias por contactar con nosotros! Nos pondremos en contacto contigo lo antes
                    posible para ayudarte con tu proyecto y ofrecerte la mejor solución.
                  </div>
                </div>
              ) : (
                <form className="form" onSubmit={submit} noValidate>
                  <div className="contacto-honeypot" aria-hidden="true">
                    <label htmlFor="website">No rellenar este campo</label>
                    <input id="website" name="website" tabIndex="-1" autoComplete="off" />
                    <input id="botcheck" name="botcheck" type="checkbox" tabIndex="-1" />
                  </div>
                  <div className="contacto-form-grid">
                    <div>
                      <label htmlFor="nombre">Nombre <span aria-hidden="true">*</span></label>
                      <input id="nombre" name="nombre" required maxLength="100" autoComplete="name" value={form.nombre} onChange={update('nombre')} aria-invalid={Boolean(fieldErrors.nombre)} aria-describedby={fieldErrors.nombre ? 'nombre-error' : undefined} />
                      {fieldErrors.nombre && <p className="form-field-error" id="nombre-error">{fieldErrors.nombre}</p>}
                    </div>
                    <div>
                      <label htmlFor="email">Tu correo electrónico <span aria-hidden="true">*</span></label>
                      <input id="email" name="email" required type="email" maxLength="254" autoComplete="email" value={form.email} onChange={update('email')} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} />
                      {fieldErrors.email && <p className="form-field-error" id="email-error">{fieldErrors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="telefono">Teléfono</label>
                      <input id="telefono" name="telefono" type="tel" inputMode="tel" maxLength="30" autoComplete="tel" value={form.telefono} onChange={update('telefono')} />
                    </div>
                    <div>
                      <label htmlFor="tipo">Tipo de consulta</label>
                      <select id="tipo" name="tipo" value={form.tipo} onChange={update('tipo')}>
                        <option value="">Selecciona...</option>
                        <option>Asesoramiento</option>
                        <option>Presupuesto</option>
                        <option>Productos</option>
                        <option>Proyecto</option>
                        <option>Outlet</option>
                        <option>Otros</option>
                      </select>
                    </div>
                    <div className="span-2">
                      <label htmlFor="mensaje">Mensaje <span aria-hidden="true">*</span></label>
                      <textarea id="mensaje" name="mensaje" required maxLength="3000" value={form.mensaje} onChange={update('mensaje')} aria-invalid={Boolean(fieldErrors.mensaje)} aria-describedby={fieldErrors.mensaje ? 'mensaje-error' : undefined} />
                      {fieldErrors.mensaje && <p className="form-field-error" id="mensaje-error">{fieldErrors.mensaje}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="check" htmlFor="consentimiento">
                    <input id="consentimiento" name="consentimiento" type="checkbox" required checked={form.consentimiento} onChange={updateCheck('consentimiento')} aria-invalid={Boolean(fieldErrors.consentimiento)} aria-describedby={fieldErrors.consentimiento ? 'consentimiento-error' : undefined} />
                    <span>
                      He leído y acepto la <Link to="/legal/politica-privacidad">política de privacidad</Link>, la{' '}
                      <Link to="/legal/politica-cookies">política de cookies</Link> y el{' '}
                      <Link to="/legal/aviso-legal">aviso legal</Link> de esta Web.
                    </span>
                    </label>
                    {fieldErrors.consentimiento && <p className="form-field-error" id="consentimiento-error">{fieldErrors.consentimiento}</p>}
                  </div>
                  <div className="captcha-row">
                    <label className="captcha-label" htmlFor="captcha">
                      {captcha.num1} + {captcha.num2} =
                    </label>
                    <input
                      id="captcha"
                      name="captcha"
                      required
                      className="captcha-input"
                      inputMode="numeric"
                      maxLength="3"
                      value={captcha.answer}
                      onChange={(e) => setCaptcha((c) => ({ ...c, answer: e.target.value }))}
                      aria-invalid={Boolean(fieldErrors.captcha)}
                      aria-describedby={fieldErrors.captcha ? 'captcha-error' : undefined}
                    />
                  </div>
                  {fieldErrors.captcha && <p className="form-field-error" id="captcha-error">{fieldErrors.captcha}</p>}
                  {errorMsg && <p className="disena-alert" role="alert">{errorMsg}</p>}
                  <button type="submit" className="btn btn-primary" disabled={sending}>
                    {sending ? 'Enviando…' : 'Enviar consulta'}
                    <span className="btn-arrow" aria-hidden="true">→</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3 · Ubicación: sección independiente */}
      <section className="contacto-ubicacion">
        <div className="container">
          <div className="contacto-ubicacion-head">
            <div>
              <h2>Nuestra ubicación</h2>
              <p>Calle Destreza, 3. Nave D10 · Polígono Los Olivos, 28906 Getafe</p>
            </div>
            <a
              href="https://maps.app.goo.gl/JMsuqrwod9QZHpHs7"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              VER EN GOOGLE MAPS
              <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
          </div>
          <figure className="contacto-ubicacion-media">
            <img
              src="images/almacen.png"
              alt="Instalaciones de Boralba Lighting en el Polígono Los Olivos, Getafe"
              loading="lazy"
            />
          </figure>
        </div>
      </section>
    </div>
  )
}
