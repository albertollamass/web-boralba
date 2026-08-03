import { Link } from 'react-router-dom'

const icon = (path, opts = {}) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...opts}
  >
    {path}
  </svg>
)

const servicios = [
  {
    icon: icon(
      <>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </>
    ),
    title: 'Asesoramiento técnico',
    desc: 'Te ayudamos a elegir la mejor solución de iluminación para tu proyecto, analizando necesidades lumínicas, normativas y eficiencia energética.',
  },
  {
    icon: icon(
      <>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 3v18M17 3v18M3 7h18M3 17h18" />
      </>
    ),
    title: 'Diseño de iluminación',
    desc: 'Diseñamos esquemas de iluminación con cálculos fotométricos para conseguir el ambiente y los niveles de luz adecuados.',
  },
  {
    icon: icon(
      <>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </>
    ),
    title: 'Distribución profesional',
    desc: 'Suministramos materiales LED a almacenes, electricistas, arquitectos, interioristas, instaladores y empresas de reformas.',
  },
  {
    icon: icon(
      <>
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    title: 'Sistemas inteligentes',
    desc: 'Diseñamos, configuramos y ponemos en marcha sistemas de iluminación inteligente conectados y fáciles de controlar.',
  },
  {
    icon: icon(
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
    title: 'Puesta en marcha',
    desc: 'Nos encargamos de la configuración y puesta en marcha de los sistemas de control de iluminación.',
  },
  {
    icon: icon(
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    ),
    title: 'Soporte continuo',
    desc: 'Acompañamos a nuestros clientes durante todo el proceso, garantizando un funcionamiento correcto de las instalaciones.',
  },
]

export default function Servicios() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Servicios</span>
          </div>
          <h1>Servicios</h1>
          <p>Soluciones de iluminación profesional de principio a fin.</p>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <span className="tag">Qué hacemos</span>
          <h2>Controla la iluminación. Domina el ambiente.</h2>
          <p>
            Diseñamos, configuramos y ponemos en marcha sistemas de iluminación inteligente,
            conectados y fáciles de controlar.
          </p>
        </div>

        <div className="grid grid-3">
          {servicios.map((s, i) => (
            <div key={i} className="card">
              <div className="card-body">
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="split mt-3" style={{ marginTop: 48 }}>
          <div className="split-img">
            <img src="images/tridonic.png" alt="Tridonic" />
          </div>
          <div className="split-text">
            <span className="tag">Partner tecnológico</span>
            <h2>Soluciones basadas en tecnología Tridonic</h2>
            <p>
              Colaboramos con TRIDONIC para ofrecer soluciones de iluminación conectada de última
              generación.
            </p>
            <a
              href="https://www.tridonic.com/en/int"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              Visitar Tridonic
            </a>
          </div>
        </div>

        <div className="section surface section" style={{ borderRadius: 'var(--radius)', padding: 40 }}>
          <h2 style={{ textAlign: 'center' }}>Trabajamos con</h2>
          <p className="muted text-center">Profesionales del sector:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 20 }}>
            {['Almacenes', 'Electricistas', 'Arquitectos', 'Interioristas', 'Instaladores', 'Empresas de reformas'].map((t) => (
              <div
                key={t}
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: '14px',
                  textAlign: 'center',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow)',
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
