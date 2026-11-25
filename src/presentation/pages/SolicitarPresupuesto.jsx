import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { useQuote } from '../../application/quote/QuoteContext'

const CAPTCHA = { num1: 12, num2: 8 }

export default function SolicitarPresupuesto({ quoteSender, analytics }) {
  const { items, clear } = useQuote()
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', telefono: '', observaciones: '', privacidad: false, cookies: false, legal: false, website: '' })
  const [captcha, setCaptcha] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  if (!items.length && status !== 'success') return <Navigate to="/presupuesto" replace />
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (form.website) return
    if (Number(captcha) !== CAPTCHA.num1 + CAPTCHA.num2) { setError('La solución de la operación no es correcta.'); return }
    if (!form.privacidad || !form.cookies || !form.legal) { setError('Debes aceptar la política de privacidad, cookies y aviso legal.'); return }
    if (!quoteSender?.isConfigured) { setError('El formulario aún no está configurado para el envío. Inténtalo más tarde.'); return }
     setStatus('sending'); setError(''); analytics?.track('quote_request_start', { items_count: items.length })
    const products = items.map((item, index) => [`${index + 1}. ${item.name}`, `Referencia: ${item.reference}`, `Variantes: ${(item.variantRows || []).map((row) => `${row.label}: ${row.value}`).join(' · ') || 'Sin variantes'}`, `Cantidad: ${item.quantity}${item.unit ? ` ${item.unit}` : ''}`].join('\n')).join('\n\n')
    const data = new FormData()
    data.append('subject', `Solicitud de presupuesto · ${form.nombre.trim()}`)
    data.append('to', 'boralba@boralba.es')
    data.append('from_name', form.nombre.trim())
    data.append('email', form.email.trim())
    data.append('website', form.website)
    data.append('message', ['SOLICITUD DE PRESUPUESTO', '', `Nombre y apellidos: ${form.nombre.trim()}`, `Empresa: ${form.empresa.trim() || 'No indicada'}`, `Correo electrónico: ${form.email.trim()}`, `Teléfono: ${form.telefono.trim() || 'No indicado'}`, '', 'PRODUCTOS SELECCIONADOS', products, '', 'OBSERVACIONES', form.observaciones.trim() || 'Sin observaciones'].join('\n'))
    data.append('Nombre y apellidos', form.nombre.trim()); data.append('Empresa', form.empresa.trim() || 'No indicada'); data.append('Correo electrónico', form.email.trim()); data.append('Teléfono', form.telefono.trim() || 'No indicado'); data.append('Productos seleccionados', products); data.append('Observaciones', form.observaciones.trim() || 'Sin observaciones'); data.append('Acepta privacidad, cookies y aviso legal', 'Sí')
    try {
      const result = await quoteSender.submitQuoteRequest(data)
      if (!result.success) throw new Error(typeof result.message === 'string' ? result.message : 'No se pudo enviar la solicitud. Vuelve a intentarlo.')
       setStatus('success'); analytics?.track('quote_request_success', { items_count: items.length, distinct_products: new Set(items.map((item) => item.productId || item.id)).size }); clear()
    } catch (submitError) { setStatus('error'); setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar la solicitud. Comprueba tu conexión e inténtalo de nuevo.') }
  }

  return <div className="quote-page quote-request-page"><Seo title="Solicitar presupuesto — Boralba Lighting" description="Solicita un presupuesto personalizado para tu selección de productos Boralba Lighting." path="/presupuesto/solicitar" />
    <div className="container quote-shell"><Link className="quote-back" to="/presupuesto">← Volver a mi presupuesto</Link><p className="product-kicker">Solicitud de presupuesto</p><h1>Cuéntanos qué necesitas</h1><p className="quote-lead">Revisa tu selección y déjanos tus datos. Prepararemos una oferta personalizada para tu proyecto.</p>
      {status === 'success' ? <div className="quote-success" role="status"><h2>Solicitud enviada</h2><p>Hemos recibido tu solicitud. Nuestro equipo comercial estudiará tus necesidades y contactará contigo.</p><Link className="btn btn-primary" to="/productos">Volver al catálogo</Link></div> : <form className="quote-request-form" onSubmit={submit}>
        <div className="quote-review"><h2>Productos incluidos</h2>{items.map((item) => <div key={item.id}><strong>{item.name}</strong><span>Ref. {item.reference} · Cantidad: {item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>{item.variantRows?.length > 0 && <small>{item.variantRows.map((row) => `${row.label}: ${row.value}`).join(' · ')}</small>}</div>)}</div>
        <div className="quote-form-grid"><label>Nombre y apellidos<input required value={form.nombre} onChange={update('nombre')} autoComplete="name" /></label><label>Empresa<input value={form.empresa} onChange={update('empresa')} autoComplete="organization" /></label><label>Correo electrónico<input required type="email" value={form.email} onChange={update('email')} autoComplete="email" /></label><label>Teléfono<input value={form.telefono} onChange={update('telefono')} autoComplete="tel" /></label><label className="span-2">Observaciones o necesidades del proyecto<textarea value={form.observaciones} onChange={update('observaciones')} /></label></div>
        {['privacidad', 'cookies', 'legal'].map((key) => <label className="check" key={key}><input type="checkbox" checked={form[key]} onChange={update(key)} /> <span>He leído y acepto la <Link to={`/legal/politica-${key === 'privacidad' ? 'privacidad' : key === 'cookies' ? 'cookies' : 'aviso-legal'}`}>política y condiciones aplicables</Link>.</span></label>)}
        <div className="quote-captcha"><span>{CAPTCHA.num1} + {CAPTCHA.num2} =</span><input required inputMode="numeric" value={captcha} onChange={(event) => setCaptcha(event.target.value)} aria-label="Resultado de la operación" /></div><input className="quote-honeypot" tabIndex="-1" autoComplete="off" value={form.website} onChange={update('website')} aria-hidden="true" />
        <p className="quote-disclaimer">Esta solicitud no constituye un pedido ni implica compromiso de compra. Nuestro equipo comercial estudiará tus necesidades y preparará una oferta personalizada</p>{error && <p className="disena-alert" role="alert">{error}</p>}<button className="btn btn-primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando…' : 'Solicitar presupuesto'} <span aria-hidden="true">→</span></button>
      </form>}
    </div>
  </div>
}
