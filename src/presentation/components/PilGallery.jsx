import { useEffect, useRef, useState } from 'react'
import Reveal from './Reveal'

export default function PilGallery({ images }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const lastChange = useRef(0)
  const start = useRef(null)
  const total = images.length

  useEffect(() => {
    if (paused || total <= 1) return undefined
    const id = window.setInterval(() => {
      if (Date.now() - lastChange.current < 600) return
      setIndex((i) => (i + 1) % total)
    }, 5000)
    return () => window.clearInterval(id)
  }, [paused, total])

  useEffect(() => {
    if (total <= 1 || lightboxOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setIndex((i) => (i + 1) % total)
        lastChange.current = Date.now()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setIndex((i) => (i - 1 + total) % total)
        lastChange.current = Date.now()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, total])

  useEffect(() => {
    if (!lightboxOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowRight') setIndex((i) => (i + 1) % total)
      if (event.key === 'ArrowLeft') setIndex((i) => (i - 1 + total) % total)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxOpen, total])

  const goNext = () => {
    setIndex((i) => (i + 1) % total)
    lastChange.current = Date.now()
  }
  const goPrev = () => {
    setIndex((i) => (i - 1 + total) % total)
    lastChange.current = Date.now()
  }

  const onPointerDown = (event) => {
    start.current = { x: event.clientX, y: event.clientY }
    setPaused(true)
  }
  const onPointerUp = (event) => {
    setPaused(false)
    if (!start.current) return
    const dx = event.clientX - start.current.x
    start.current = null
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext()
      else goPrev()
    }
  }

  return (
    <>
      <Reveal variant="none" className="pil-b3-head">
        <div>
          <span className="pil-b3-kicker">Galería</span>
          <h2>El proyecto, espacio a espacio</h2>
        </div>
        <span className="pil-b3-count" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </Reveal>
      <div
        className="pil-caro"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="pil-caro-stage"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          role="group"
          aria-roledescription="carrusel"
          aria-label="Galería del proyecto"
        >
          <div className="pil-caro-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {images.map((src, j) => (
              <button
                className="pil-caro-slide"
                key={src}
                type="button"
                aria-label={`Ampliar fotografía ${j + 1}`}
                onClick={() => setLightboxOpen(true)}
              >
                <img src={src} alt={`Fotografía ${j + 1} del proyecto`} loading="lazy" />
              </button>
            ))}
          </div>
          <div className="pil-caro-nav">
            <button type="button" className="pil-caro-btn" onClick={goPrev} aria-label="Imagen anterior">
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" className="pil-caro-btn" onClick={goNext} aria-label="Imagen siguiente">
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      </div>
      {lightboxOpen && (
        <div className="pil-lightbox" role="dialog" aria-modal="true" aria-label="Fotografía ampliada">
          <button
            type="button"
            className="pil-lightbox-backdrop"
            aria-label="Cerrar fotografía ampliada"
            onClick={() => setLightboxOpen(false)}
          />
          <div className="pil-lightbox-content">
            <img src={images[index]} alt={`Fotografía ${index + 1} ampliada del proyecto`} />
            <button
              type="button"
              className="pil-lightbox-close"
              aria-label="Cerrar fotografía ampliada"
              onClick={() => setLightboxOpen(false)}
            >
              ×
            </button>
            {total > 1 && (
              <div className="pil-lightbox-nav">
                <button type="button" className="pil-caro-btn" onClick={goPrev} aria-label="Imagen anterior">
                  <span aria-hidden="true">‹</span>
                </button>
                <button type="button" className="pil-caro-btn" onClick={goNext} aria-label="Imagen siguiente">
                  <span aria-hidden="true">›</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
