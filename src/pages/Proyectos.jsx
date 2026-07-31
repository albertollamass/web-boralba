import { Link } from 'react-router-dom'

const proyectos = [
  {
    title: 'Hotel Boutique',
    place: 'Madrid',
    desc: 'Iluminación arquitectónica con tiras LED CCT y control DALI en zonas comunes y habitaciones.',
    image: '/images/lobby.png',
  },
  {
    title: 'Oficinas corporativas',
    place: 'Madrid',
    desc: 'Paneles LED y sistemas de control inteligente para puestos de trabajo con luz de calidad.',
    image: '/images/panel-led.png',
  },
  {
    title: 'Nave industrial',
    place: 'Getafe',
    desc: 'Pantallas estancas LED de alta eficiencia para iluminación industrial uniforme.',
    image: '/images/pantalla-estanca.png',
  },
  {
    title: 'Espacio comercial',
    place: 'Madrid',
    desc: 'Downlights CRI90 y proyectores de acento para destacar el producto en el punto de venta.',
    image: '/images/downlight.png',
  },
  {
    title: 'Alumbrado exterior',
    place: 'Toledo',
    desc: 'Proyectores LED IP65 y soluciones de control para fachadas y jardines.',
    image: '/images/proyectores.png',
  },
  {
    title: 'Restaurante',
    place: 'Valencia',
    desc: 'Tiras de neón flex y CCT para crear ambientes cálidos y personalizados.',
    image: '/images/neon.png',
  },
]

export default function Proyectos() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Proyectos</span>
          </div>
          <h1>Galería de proyectos</h1>
          <p>Algunos de los proyectos en los que hemos participado.</p>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div className="grid grid-2">
          {proyectos.map((p, i) => (
            <div key={i} className="card">
              <div className="card-img">
                <img src={p.image} alt={p.title} loading="lazy" />
              </div>
              <div className="card-body">
                <div className="ref">{p.place}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-head mt-3" style={{ marginTop: 56 }}>
          <h2>¿Tienes un proyecto de iluminación?</h2>
          <p>Te ayudamos a hacerlo realidad con asesoramiento técnico especializado.</p>
          <Link to="/contacto" className="btn btn-primary mt-2" style={{ display: 'inline-flex' }}>
            Contactar
          </Link>
        </div>
      </div>
    </>
  )
}
