import { useState } from 'react'

export default function Carousel({ images, alt }) {
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
