import { Link } from 'react-router-dom'
import Carousel from '../components/Carousel'

const BASE = `${import.meta.env.BASE_URL}images/proyectos/`
const CONTACT_URL = `${import.meta.env.BASE_URL}contacto`

const ambitos = [
  { label: 'Arquitectura interior y exterior', image: `${BASE}entrada_torre_consuegra.jpg` },
  { label: 'Espacios de trabajo', image: `${BASE}oficinas.jpg` },
  { label: 'Hogar', image: `${BASE}decoracion_hogar.jpg` },
  { label: 'Eventos', image: `${BASE}centro_eventos.jpg` },
  { label: 'Comercio', image: `${BASE}senalizacion.jpg` },
]

const proyectos = [
  {
    title: 'Hotel Rural Torre de Consuegra',
    type: 'Bañadores de pared',
    images: [
      `${BASE}torre_consuerga_1.jpg`,
      `${BASE}torre_consuerga_4.jpg`,
      `${BASE}torre_consuerga_2.jpg`,
    ],
  },
  {
    title: 'Túnel Calle Damas',
    type: 'Bañadores de pared',
    images: [
      `${BASE}tunel_calle_damas_azul.jpg`,
      `${BASE}tunel_calle_damas_2.jpg`,
      `${BASE}tunel_calle_damas_3.jpg`,
    ],
  },
  {
    title: 'Centro Médico',
    type: 'Tiras LED y perfiles',
    images: [
      `${BASE}centro_medico_3.jpg`,
      `${BASE}centro_medico_2.jpg`,
      `${BASE}centro_medico_1.jpg`,
    ],
  },
  {
    title: 'Centro Cultural Antonio López',
    type: 'Neón flex LED',
    images: [
      `${BASE}centro_cultural_antonio_lopez_1.jpg`,
      `${BASE}centro_cultural_antonio_lopez_3.jpg`,
      `${BASE}centro_cultural_antonio_lopez_2.jpg`,
    ],
  },
  {
    title: 'Centro Comercial Madrid Sur',
    type: 'Bañadores de pared',
    images: [
      `${BASE}Madrid-Sur_2.jpg`,
      `${BASE}Madrid-Sur1.jpg`,
      `${BASE}Madrid-Sur_3.jpg`,
    ],
  },
  {
    title: 'Hotel JC Santo Domingo (A Coruña)',
    type: 'Bañadores de pared',
    images: [`${BASE}jc-santo-domingo-1.jpg`],
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
          <p>Iluminación para todos los ámbitos de uso.</p>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2>Proyectos realizados</h2>
          <p>Iluminación para todos los ámbitos de uso: arquitectura, espacios de trabajo, hogar, eventos, comercio, señalización y publicidad.</p>
        </div>

        <div className="ambitos-strip">
          {ambitos.map((a, i) => (
            <figure key={i} className="ambito-item">
              <img src={a.image} alt={a.label} loading="lazy" />
              <figcaption>{a.label}</figcaption>
            </figure>
          ))}
        </div>

        <div className="grid grid-2 mt-3">
          {proyectos.map((p, i) => (
            <div key={i} className="card card-proyecto">
              <Carousel images={p.images} alt={p.title} />
              <div className="card-body">
                <span className="proyecto-tag">{p.type}</span>
                <h3>{p.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="section-head mt-3" style={{ marginTop: 56 }}>
          <h2>¿Tienes un proyecto de iluminación?</h2>
          <p>Te ayudamos a hacerlo realidad con asesoramiento técnico especializado.</p>
          <a href={CONTACT_URL} target="_blank" rel="noreferrer" className="btn btn-primary mt-2" style={{ display: 'inline-flex' }}>
            Contactar
          </a>
        </div>
      </div>
    </>
  )
}