import { Link } from 'react-router-dom'

const servicios = [
  {
    icon: '💡',
    title: 'Asesoramiento técnico',
    desc: 'Te ayudamos a elegir la mejor solución de iluminación para tu proyecto, analizando necesidades lumínicas, normativas y eficiencia energética.',
  },
  {
    icon: '🔌',
    title: 'Diseño de iluminación',
    desc: 'Diseñamos esquemas de iluminación con cálculos fotométricos para conseguir el ambiente y los niveles de luz adecuados.',
  },
  {
    icon: '📦',
    title: 'Distribución profesional',
    desc: 'Suministramos materiales LED a almacenes, electricistas, arquitectos, interioristas, instaladores y empresas de reformas.',
  },
  {
    icon: '🎛️',
    title: 'Sistemas inteligentes',
    desc: 'Diseñamos, configuramos y ponemos en marcha sistemas de iluminación inteligente conectados y fáciles de controlar.',
  },
  {
    icon: '⚙️',
    title: 'Puesta en marcha',
    desc: 'Nos encargamos de la configuración y puesta en marcha de los sistemas de control de iluminación.',
  },
  {
    icon: '🤝',
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
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{s.icon}</div>
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
