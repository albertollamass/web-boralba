import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEP_PX = 90

// Distancia circular más corta en [-N/2, N/2]. Acepta fracciones (para el drag).
function wrapDelta(delta, N) {
  if (N <= 1) return 0
  let r = ((delta % N) + N) % N
  if (r > N / 2) r -= N
  return r
}

function shapeFor(d, W) {
  const a = Math.abs(d)
  const scale = a < 0.5 ? 1.15 : a < 1.5 ? 0.9 : a < 2.5 ? 0.78 : 0.68
  const angle = a < 0.5 ? 0 : a < 1.5 ? 26 : a < 2.5 ? 48 : 62
  const ry = d < 0 ? angle : d > 0 ? -angle : 0
  const tx = d * W * 0.52
  const ty = a < 0.5 ? -18 : a < 1.5 ? 4 : 12
  // Ocultar las tarjetas traseras para que el loop no se vea amontonado
  const opacity = a < 0.5 ? 1 : a < 1.5 ? 0.75 : a < 2.5 ? 0.6 : 0
  const z = 100 - Math.round(Math.min(a, 5) * 10)
  return { scale, ry, tx, ty, opacity, z }
}

export default function FamilyCarousel({ families, getCatImage }) {
  const navigate = useNavigate()
  const N = families.length
  const containerRef = useRef(null)
  const dragRef = useRef({ startX: 0, startY: 0, moved: false, offset: 0, isDown: false })
  const autoRef = useRef(null)

  const [active, setActive] = useState(0)
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [baseW, setBaseW] = useState(240)

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const card = el.querySelector('.coverflow-card')
    if (card) setBaseW(card.offsetWidth)
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  // Navegación circular: nunca llega al final, da la vuelta.
  const advance = useCallback((dir) => {
    if (N <= 0) return
    setActive((prev) => (((prev + dir) % N) + N) % N)
  }, [N])

  // Autoplay siempre hacia adelante (circular, sin ping-pong).
  useEffect(() => {
    if (hovered || dragging || N <= 1) return
    autoRef.current = setInterval(() => advance(1), 4200)
    return () => clearInterval(autoRef.current)
  }, [hovered, dragging, advance, N])

  const onPointerDown = (e) => {
    // Las flechas no inician drag.
    if (e.target.closest?.('.coverflow-arrow')) return
    // Solo botón principal / toque.
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, moved: false, offset: 0, isDown: true }
    setDragging(true)
    // Nota: sin setPointerCapture a propósito — capturarlo en el contenedor
    // roba el evento click a las tarjetas y rompe la navegación.
  }

  const onPointerMove = (e) => {
    if (!dragRef.current.isDown) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - (dragRef.current.startY ?? e.clientY)
    if (Math.abs(dx) > 6 || Math.abs(dy) > 8) dragRef.current.moved = true
    dragRef.current.offset = Math.max(-2.5, Math.min(2.5, dx / STEP_PX))
    setDrag(dragRef.current.offset)
  }

  const endDrag = useCallback(() => {
    if (!dragRef.current.isDown) return
    dragRef.current.isDown = false
    // Arrastrar a la derecha (offset +) muestra la anterior → active - offset.
    // El signo es negativo porque tx = d * W y d = i - active.
    const steps = Math.round(-dragRef.current.offset)
    if (steps !== 0 && N > 0) {
      setActive((prev) => (((prev + steps) % N) + N) % N)
    }
    dragRef.current.offset = 0
    setDrag(0)
    setDragging(false)
  }, [N])

  const onCardClick = (e, i) => {
    // Si hubo arrastre, es un drag — no navegar.
    if (dragRef.current.moved) {
      dragRef.current.moved = false
      e.preventDefault()
      return
    }
    // Un solo clic navega siempre a la categoría, sea la central o lateral.
    navigate(`/categoria/${families[i].slug}`)
  }

  if (N === 0) return null

  return (
    <div
      ref={containerRef}
      className={`coverflow${dragging ? ' is-dragging' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); endDrag() }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {families.map((f, i) => {
        const d = wrapDelta(i - (active + drag), N)
        const { scale, ry, tx, ty, opacity, z } = shapeFor(d, baseW)
        const isActive = i === active && Math.abs(drag) < 0.5
        const hidden = Math.abs(d) > 2.5
        return (
          <button
            key={f.slug}
            type="button"
            className={`coverflow-card${isActive ? ' is-active' : ''}`}
            onClick={(e) => onCardClick(e, i)}
            style={{
              transform: `translate(-50%, -50%) translateX(${tx}px) translateY(${ty}px) rotateY(${ry}deg) scale(${scale})`,
              opacity,
              zIndex: z,
              visibility: hidden ? 'hidden' : 'visible',
              pointerEvents: hidden ? 'none' : 'auto',
            }}
            aria-label={`Ver categoría ${f.name}`}
            tabIndex={hidden ? -1 : 0}
          >
            <img src={getCatImage(f.slug)} alt={f.name} loading="lazy" draggable={false} />
            <span className="coverflow-shade" />
            <h3>{f.name}</h3>
          </button>
        )
      })}

      <button
        type="button"
        className="coverflow-arrow coverflow-arrow--prev"
        onClick={(e) => { e.stopPropagation(); advance(-1) }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Categoría anterior"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button
        type="button"
        className="coverflow-arrow coverflow-arrow--next"
        onClick={(e) => { e.stopPropagation(); advance(1) }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Categoría siguiente"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  )
}
