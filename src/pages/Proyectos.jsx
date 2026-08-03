import { useState } from 'react'
import { Link } from 'react-router-dom'

const ambitos = [
  { label: 'Arquitectura interior y exterior', image: 'images/proyectos/entrada_torre_consuegra.webp' },
  { label: 'Espacios de trabajo', image: 'images/proyectos/oficinas.webp' },
  { label: 'Hogar', image: 'images/proyectos/decoracion_hogar.webp' },
  { label: 'Eventos', image: 'images/proyectos/centro_eventos.webp' },
  { label: 'Comercio', image: 'images/proyectos/senalizacion.webp' },
]

const proyectos = [
  {
    title: 'Hotel Rural Torre de Consuegra',
    type: 'Bañadores de pared',
    images: [
      'images/proyectos/torre_consuerga_1.webp',
      'images/proyectos/torre_consuerga_4.webp',
      'images/proyectos/torre_consuerga_2.webp',
    ],
  },
  {
    title: 'Túnel Calle Damas',
    type: 'Bañadores de pared',
    images: [
      'images/proyectos/tunel_calle_damas_azul.webp',
      'images/proyectos/tunel_calle_damas_2.webp',
      'images/proyectos/tunel_calle_damas_3.webp',
    ],
  },
  {
    title: 'Centro Médico',
    type: 'Tiras LED y perfiles',
    images: [
      'images/proyectos/centro_medico_3.webp',
      'images/proyectos/centro_medico_2.webp',
      'images/proyectos/centro_medico_1.webp',
    ],
  },
  {
    title: 'Centro Cultural Antonio López',
    type: 'Neón flex LED',
    images: [
      'images/proyectos/centro_cultural_antonio_lopez_1.webp',
      'images/proyectos/centro_cultural_antonio_lopez_3.webp',
      'images/proyectos/centro_cultural_antonio_lopez_2.webp',
    ],
  },
  {
    title: 'Centro Comercial Madrid Sur',
    type: 'Bañadores de pared',
    images: [
      'images/proyectos/Madrid-Sur_2.webp',
      'images/proyectos/Madrid-Sur1.webp',
      'images/proyectos/Madrid-Sur_3.webp',
    ],
  },
  {
    title: 'Hotel JC Santo Domingo (A Coruña)',
    type: 'Bañadores de pared',
    images: ['images/proyectos/jc-santo-domingo-1.webp'],
  },
]

function Carousel({ images, alt }) {
  const [index, setIndex] = useState(0)
  const total = images.length

  if (total <= 1) {
    return (
      <div className="carousel">
        <div className="carousel-track" style={{ transform: 'translateX(0%)' }}>
          <img src={images[0]} alt={alt} loading="lazy" />
        </div>
      </div>
    )
  }

  const prev = () => setIndex((i) => (i - 1 + total) % total)
  const next = () => setIndex((i) => (i + 1) % total)

  return (
    <div className="carousel">
      <div className="carousel-viewport">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((img, j) => (
            <img key={j} src={img} alt={alt} loading="lazy" />
          ))}
        </div>

        <button
          type="button"
          className="carousel-arrow carousel-prev"
          onClick={prev}
          aria-label="Imagen anterior"
        >
          ‹
        </button>
        <button
          type="button"
          className="carousel-arrow carousel-next"
          onClick={next}
          aria-label="Imagen siguiente"
        >
          ›
        </button>
      </div>

      <div className="carousel-dots">
        {images.map((_, j) => (
          <button
            key={j}
            type="button"
            className={`carousel-dot${j === index ? ' is-active' : ''}`}
            onClick={() => setIndex(j)}
            aria-label={`Imagen ${j + 1}`}
          />
        ))}
      </div>
      <div className="carousel-count">
        {index + 1} / {total}
      </div>
    </div>
  )
}

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
          <Link to="/contacto" className="btn btn-primary mt-2" style={{ display: 'inline-flex' }}>
            Contactar
          </Link>
        </div>
      </div>
    </>
  )
}