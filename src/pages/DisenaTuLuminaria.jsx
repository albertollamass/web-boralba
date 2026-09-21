import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { canonicalFor, breadcrumbJsonLd } from '../lib/seo'

const TEMP_OPTS = ['2700K', '3000K', '4000K', '6000K', 'Otra', 'No lo sé']
const CRI_OPTS = ['CRI 80', 'CRI 90', 'CRI 95', 'No lo sé']
const CONTROL_OPTS = ['Sin regulación', 'DALI', '0-10V', 'Otro', 'No lo sé']
const INTEG_OPTS = ['Empotrada', 'Superficie', 'Suspendida', 'Otra']

const ENDPOINT = 'https://api.web3forms.com/submit'
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || ''

const ACCEPT_EXT = '.pdf,.png,.jpg,.jpeg,.webp'
const ACCEPT_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
const MAX_FILE = 10 * 1024 * 1024
const MAX_FILES = 3

const REQUIRED = {
  medidas: 'Indica las medidas aproximadas.',
  potencia: 'Indica la potencia aproximada.',
  temp: 'Selecciona la temperatura de color.',
  cri: 'Selecciona el CRI.',
  integracion: 'Selecciona el tipo de integración.',
  idea: 'Cuéntanos brevemente tu idea.',
  nombre: 'Escribe tu nombre.',
  email: 'Escribe tu email.',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function OptionGroup({ legend, options, value, onChange, complement, error }) {
  return (
    <div className="disena-field">
      <span className="disena-label">
        {legend} <span className="disena-req">*</span>
      </span>
      <div className="disena-opts" role="radiogroup" aria-label={legend}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            className={`disena-opt${value === opt ? ' is-selected' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      {complement && value === complement.trigger && (
        <input
          className="disena-input"
          placeholder={complement.placeholder}
          value={complement.value}
          onChange={complement.onChange}
        />
      )}
      {error && (
        <span className="disena-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default function DisenaTuLuminaria() {
  const [form, setForm] = useState({
    medidas: '',
    potencia: '',
    temp: '',
    tempOtra: '',
    cri: '',
    acabado: '',
    optica: '',
    opticaNoSe: false,
    control: '',
    controlOtra: '',
    integracion: '',
    integracionOtra: '',
    idea: '',
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    privacidad: false,
  })
  const [archivos, setArchivos] = useState([])
  const [fileError, setFileError] = useState('')
  const [honey, setHoney] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setChoice = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const setChecked = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

  const onFiles = (e) => {
    const files = Array.from(e.target.files || [])
    const invalid = files.find(
      (f) => !ACCEPT_TYPES.includes(f.type) || f.size > MAX_FILE
    )
    if (invalid) {
      setFileError('Solo plano, boceto, fotografía o PDF, de un máximo de 10 MB por archivo.')
      e.target.value = ''
      return
    }
    setFileError('')
    setArchivos((prev) => [...prev, ...files].slice(0, MAX_FILES))
  }

  const removeFile = (index) => setArchivos((prev) => prev.filter((_, i) => i !== index))

  const validate = () => {
    const errs = {}
    Object.entries(REQUIRED).forEach(([key, msg]) => {
      const value = form[key]
      if (!String(value ?? '').trim()) errs[key] = msg
    })
    const email = form.email.trim()
    if (email && !EMAIL_RE.test(email)) {
      errs.email = 'El email no parece válido.'
    }
    if (!form.privacidad) errs.privacidad = 'Debes aceptar la política de privacidad.'
    return errs
  }

  const submit = async (e) => {
    e.preventDefault()
    if (honey) return

    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length !== 0) {
      setStatus('idle')
      setErrorMsg('')
      return
    }

    if (!ACCESS_KEY) {
      setStatus('error')
      setErrorMsg('El formulario aún no está configurado para el envío. Inténtalo más tarde.')
      return
    }

    setStatus('sending')
    setErrorMsg('')

    try {
      const data = new FormData()
      data.append('access_key', ACCESS_KEY)
      data.append('subject', `Solicitud · Diseña tu luminaria — ${form.nombre.trim()}`)
      data.append('from_name', form.nombre.trim())
      data.append('website', honey)
      data.append('Medidas', form.medidas.trim())
      data.append('Potencia', form.potencia.trim())
      data.append(
        'Temperatura de color',
        form.temp === 'Otra' ? `Otra: ${form.tempOtra.trim() || 'sin especificar'}` : form.temp
      )
      data.append('CRI', form.cri)
      data.append('Acabado', form.acabado.trim() || 'Sin especificar')
      data.append('Óptica', form.opticaNoSe ? 'No lo sé' : form.optica.trim() || 'Sin especificar')
      data.append(
        'Control',
        form.control === 'Otro'
          ? `Otro: ${form.controlOtra.trim() || 'sin especificar'}`
          : form.control || 'Sin especificar'
      )
      data.append(
        'Integración',
        form.integracion === 'Otra'
          ? `Otra: ${form.integracionOtra.trim() || 'sin especificar'}`
          : form.integracion
      )
      data.append('Idea / descripción del proyecto', form.idea.trim())
      data.append('Nombre', form.nombre.trim())
      data.append('Empresa', form.empresa.trim() || '—')
      data.append('Email', form.email.trim())
      data.append('Teléfono', form.telefono.trim() || '—')
      data.append('Acepta política de privacidad', form.privacidad ? 'Sí' : 'No')
      data.append('Adjuntos', archivos.length ? `Sí (${archivos.length})` : 'No')
      archivos.forEach((file) => data.append('adjunto', file))

      const res = await fetch(ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      const json = await res.json().catch(() => ({
        success: false,
        message: 'El servicio no respondió correctamente.',
      }))

      if (json.success) {
        setStatus('success')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setStatus('error')
        setErrorMsg(
          typeof json.message === 'string'
            ? json.message
            : 'No se pudo enviar la solicitud. Vuelve a intentarlo.'
        )
      }
    } catch {
      setStatus('error')
      setErrorMsg('No se pudo enviar la solicitud. Comprueba tu conexión e inténtalo de nuevo.')
    }
  }

  return (
    <div className="disena-conf">
      <Seo
        title="Diseña tu luminaria a medida — HALOPACK"
        description="Configura tu luminaria LED a medida: medidas, potencia, temperatura de color, CRI, acabado, óptica, control e integración. Envíanos tu solicitud y la estudiamos contigo."
        path="/disena-tu-luminaria"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', url: canonicalFor('/') },
          { name: 'Diseña tu luminaria', url: canonicalFor('/disena-tu-luminaria') },
        ])}
      />

      <header className="disena-intro">
        <div className="container">
          <p className="disena-eyebrow">HALOPACK · Soluciones a medida</p>
          <h1>Una luminaria adaptada a tu proyecto</h1>
          <p className="disena-lead">
            Define las principales características de la luminaria que necesitas. Indícanos tus
            requisitos y estudiaremos contigo la solución más adecuada.
          </p>
        </div>
      </header>

      {status === 'success' ? (
        <section className="disena-form-section">
          <div className="container">
            <div className="disena-success" role="status">
              <h2>Solicitud enviada</h2>
              <p>
                Hemos recibido tu configuración, {form.nombre.trim()}. Nuestro equipo estudiará
                tu solicitud y te responderá lo antes posible con la solución más adecuada.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <form className="disena-form" onSubmit={submit} noValidate>
          <section className="disena-form-section">
            <div className="container">
              <h2 className="disena-section-title">Configura tu luminaria</h2>
              <div className="disena-grid">
                <div className="disena-field">
                  <span className="disena-label">
                    Medidas <span className="disena-req">*</span>
                  </span>
                  <input
                    className="disena-input"
                    placeholder="P. ej. 1200 × 200 mm"
                    value={form.medidas}
                    onChange={set('medidas')}
                    autoComplete="off"
                  />
                  {fieldErrors.medidas && (
                    <span className="disena-error" role="alert">
                      {fieldErrors.medidas}
                    </span>
                  )}
                </div>

                <div className="disena-field">
                  <span className="disena-label">
                    Potencia <span className="disena-req">*</span>
                  </span>
                  <input
                    className="disena-input"
                    placeholder="P. ej. 24 W"
                    value={form.potencia}
                    onChange={set('potencia')}
                    autoComplete="off"
                  />
                  {fieldErrors.potencia && (
                    <span className="disena-error" role="alert">
                      {fieldErrors.potencia}
                    </span>
                  )}
                </div>

                <OptionGroup
                  legend="Temperatura de color"
                  options={TEMP_OPTS}
                  value={form.temp}
                  onChange={setChoice('temp')}
                  error={fieldErrors.temp}
                  complement={{
                    trigger: 'Otra',
                    placeholder: 'Especifica (p. ej. 2200K)',
                    value: form.tempOtra,
                    onChange: set('tempOtra'),
                  }}
                />

                <OptionGroup
                  legend="CRI"
                  options={CRI_OPTS}
                  value={form.cri}
                  onChange={setChoice('cri')}
                  error={fieldErrors.cri}
                />

                <div className="disena-field">
                  <span className="disena-label">Acabado</span>
                  <input
                    className="disena-input"
                    placeholder="P. ej. RAL 9016"
                    value={form.acabado}
                    onChange={set('acabado')}
                    autoComplete="off"
                  />
                </div>

                <div className="disena-field">
                  <span className="disena-label">Óptica</span>
                  <input
                    className="disena-input"
                    placeholder="P. ej. difusa, estrecha…"
                    value={form.optica}
                    onChange={set('optica')}
                    disabled={form.opticaNoSe}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className={`disena-opt${form.opticaNoSe ? ' is-selected' : ''}`}
                    aria-pressed={form.opticaNoSe}
                    onClick={() => setForm((f) => ({ ...f, opticaNoSe: !f.opticaNoSe }))}
                  >
                    No lo sé
                  </button>
                </div>

                <OptionGroup
                  legend="Control"
                  options={CONTROL_OPTS}
                  value={form.control}
                  onChange={setChoice('control')}
                  complement={{
                    trigger: 'Otro',
                    placeholder: 'Especifica el protocolo',
                    value: form.controlOtra,
                    onChange: set('controlOtra'),
                  }}
                />

                <OptionGroup
                  legend="Integración"
                  options={INTEG_OPTS}
                  value={form.integracion}
                  onChange={setChoice('integracion')}
                  error={fieldErrors.integracion}
                  complement={{
                    trigger: 'Otra',
                    placeholder: 'Especifica (p. ej. integrada en obra)',
                    value: form.integracionOtra,
                    onChange: set('integracionOtra'),
                  }}
                />
              </div>
            </div>
          </section>

          <section className="disena-form-section">
            <div className="container">
              <h2 className="disena-section-title">Cuéntanos tu idea</h2>
              <div className="disena-grid">
                <div className="disena-field disena-span-2">
                  <span className="disena-label">
                    Descripción del proyecto <span className="disena-req">*</span>
                  </span>
                  <textarea
                    className="disena-textarea"
                    placeholder="Describe el espacio, el uso y el efecto de luz que buscas."
                    value={form.idea}
                    onChange={set('idea')}
                  />
                  {fieldErrors.idea && (
                    <span className="disena-error" role="alert">
                      {fieldErrors.idea}
                    </span>
                  )}
                </div>

                <div className="disena-field disena-span-2">
                  <span className="disena-label">Adjuntar documentación</span>
                  <label className="disena-file">
                    <input
                      type="file"
                      multiple
                      accept={ACCEPT_EXT}
                      onChange={onFiles}
                    />
                    <span className="disena-file-btn">Añadir archivos</span>
                    <span className="disena-file-hint">Plano · Boceto · Fotografía · PDF</span>
                  </label>
                  {fileError && (
                    <span className="disena-error" role="alert">
                      {fileError}
                    </span>
                  )}
                  {archivos.length > 0 && (
                    <ul className="disena-files">
                      {archivos.map((file, i) => (
                        <li key={`${file.name}-${file.size}`}>
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            aria-label={`Quitar ${file.name}`}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="disena-form-section">
            <div className="container">
              <h2 className="disena-section-title">Tus datos</h2>
              <div className="disena-grid">
                <div className="disena-field">
                  <span className="disena-label">
                    Nombre <span className="disena-req">*</span>
                  </span>
                  <input
                    className="disena-input"
                    value={form.nombre}
                    onChange={set('nombre')}
                    autoComplete="name"
                  />
                  {fieldErrors.nombre && (
                    <span className="disena-error" role="alert">
                      {fieldErrors.nombre}
                    </span>
                  )}
                </div>

                <div className="disena-field">
                  <span className="disena-label">Empresa</span>
                  <input
                    className="disena-input"
                    value={form.empresa}
                    onChange={set('empresa')}
                    autoComplete="organization"
                  />
                </div>

                <div className="disena-field">
                  <span className="disena-label">
                    Email <span className="disena-req">*</span>
                  </span>
                  <input
                    className="disena-input"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                  />
                  {fieldErrors.email && (
                    <span className="disena-error" role="alert">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div className="disena-field">
                  <span className="disena-label">Teléfono</span>
                  <input
                    className="disena-input"
                    value={form.telefono}
                    onChange={set('telefono')}
                    autoComplete="tel"
                  />
                </div>

                <div className="disena-field disena-span-2">
                  <label className="disena-check">
                    <input
                      type="checkbox"
                      checked={form.privacidad}
                      onChange={setChecked('privacidad')}
                    />
                    <span>
                      He leído y acepto la{' '}
                      <Link to="/legal/politica-privacidad">política de privacidad</Link>.
                    </span>
                  </label>
                  {fieldErrors.privacidad && (
                    <span className="disena-error" role="alert">
                      {fieldErrors.privacidad}
                    </span>
                  )}
                </div>
              </div>

              <div className="disena-actions">
                {errorMsg && (
                  <p className="disena-alert" role="alert">
                    {errorMsg}
                  </p>
                )}
                <button
                  type="submit"
                  className="disena-submit"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
                  <span aria-hidden="true">→</span>
                </button>
                <p className="disena-note">
                  Tus datos se tratarán conforme a la política de privacidad. No enviamos
                  publicidad.
                </p>
              </div>
            </div>
          </section>

          <input
            className="disena-hp"
            type="text"
            name="website"
            value={honey}
            onChange={(e) => setHoney(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
        </form>
      )}
    </div>
  )
}