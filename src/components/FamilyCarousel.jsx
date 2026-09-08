import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEP_PX = 90

function shapeFor(d, W) {
  const a = Math.abs(d)
  const scale = a === 0 ? 1.15 : a === 1 ? 0.9 : a === 2 ? 0.78 : 0.68
  const angle = a === 0 ? 0 : a === 1 ? 26 : a === 2 ? 48 : 62
  const ry = d < 0 ? angle : d > 0 ? -angle : 0
  const tx = d * W * 0.52
  const ty = a === 0 ? -18 : a === 1 ? 4 : 12
  const opacity = a === 0 ? 1 : a === 1 ? 0.75 : a === 2 ? 0.6 : 0.5
  const z = 100 - a
  return { scale, ry, tx, ty, opacity, z }
}

export default function FamilyCarousel({ families, getCatImage }) {
  const navigate = useNavigate()
  const N = families.length
  const containerRef = useRef(null)
  const dragRef = useRef({ startX: 0, moved: false, offset: 0 })
  const autoRef = useRef(null)
  const dirRef = useRef(1)

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

  const goTo = useCallback((i) => setActive(Math.max(0, Math.min(N - 1, i))), [N])

  const advance = useCallback((dir) => {
    setActive((prev) => {
      const next = prev + dir
      const clamped = Math.max(0, Math.min(N - 1, next))
      if (next !== clamped) dirRef.current = -dirRef.current
      return clamped
    })
  }, [N])

  useEffect(() => {
    if (hovered || dragging) return
    autoRef.current = setInterval(() => advance(dirRef.current), 4200)
    return () => clearInterval(autoRef.current)
  }, [hovered, dragging, advance])

  const onPointerDown = (e) => {
    dragRef.current = { startX: e.clientX, moved: false, offset: 0 }
    setDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    const el = containerRef.current
    if (!el) return
    const dx = e.clientX - dragRef.current.startX
    if (Math.abs(dx) > 6) dragRef.current.moved = true
    dragRef.current.offset = Math.max(-2.5, Math.min(2.5, dx / STEP_PX))
    setDrag(dragRef.current.offset)
  }

  const onPointerUp = useCallback(() => {
    const target = Math.round(dragRef.current.offset)
    setActive((prev) => Math.max(0, Math.min(N - 1, prev + target)))
    setDrag(0)
    setDragging(false)
  }, [N])

  const onCardClick = (i) => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false
      return
    }
    if (i === active) navigate(`/categoria/${families[i].slug}`)
    else goTo(i)
  }

  return (
    <div
      ref={containerRef}
      className={`coverflow${dragging ? ' is-dragging' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {families.map((f, i) => {
        const { scale, ry, tx, ty, opacity, z } = shapeFor(i - (active + drag), baseW)
        return (
          <button
            key={f.slug}
            type="button"
            className={`coverflow-card${i === Math.round(active + drag) ? ' is-active' : ''}`}
            onClick={() => onCardClick(i)}
            style={{
              transform: `translate(-50%, -50%) translateX(${tx}px) translateY(${ty}px) rotateY(${ry}deg) scale(${scale})`,
              opacity,
              zIndex: z,
            }}
            aria-label={`Ver categoría ${f.name}`}
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
        onClick={() => advance(-1)}
        disabled={active === 0}
        aria-label="Categoría anterior"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button
        type="button"
        className="coverflow-arrow coverflow-arrow--next"
        onClick={() => advance(1)}
        disabled={active === N - 1}
        aria-label="Categoría siguiente"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  )
}