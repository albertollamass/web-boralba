import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DRAG_STEP = 190

function wrapDelta(delta, total) {
  if (total <= 1) return 0
  let result = ((delta % total) + total) % total
  if (result > total / 2) result -= total
  return result
}

function getPosition(distance, cardWidth) {
  const amount = Math.abs(distance)
  const scale = amount < 0.5 ? 1 : amount < 1.5 ? 0.85 : amount < 2.5 ? 0.73 : 0.68
  const opacity = amount < 0.5 ? 1 : amount < 1.5 ? 0.9 : amount < 2.5 ? 0.8 : 0.72
  return {
    scale,
    opacity,
    x: distance * cardWidth * 0.72,
    zIndex: 100 - Math.round(Math.min(amount, 5) * 10),
    visible: amount <= 3.2,
  }
}

export default function ProductCarousel({ products }) {
  const navigate = useNavigate()
  const total = products.length
  const containerRef = useRef(null)
  const dragRef = useRef({ startX: 0, offset: 0, moved: false, active: false })
  const [active, setActive] = useState(0)
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [cardWidth, setCardWidth] = useState(280)

  useEffect(() => {
    const measure = () => {
      const card = containerRef.current?.querySelector('.coverflow-card')
      if (card) setCardWidth(card.getBoundingClientRect().width)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const moveTo = useCallback((index) => {
    if (total === 0) return
    setActive(((index % total) + total) % total)
  }, [total])

  const advance = useCallback((direction) => moveTo(active + direction), [active, moveTo])

  const onPointerDown = (event) => {
    if (event.target.closest?.('.coverflow-arrow, .coverflow-pagination')) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragRef.current = { startX: event.clientX, offset: 0, moved: false, active: true }
    setDragging(true)
  }

  const onPointerMove = (event) => {
    if (!dragRef.current.active) return
    const distance = event.clientX - dragRef.current.startX
    if (Math.abs(distance) > 8) dragRef.current.moved = true
    dragRef.current.offset = Math.max(-2.4, Math.min(2.4, distance / DRAG_STEP))
    setDrag(dragRef.current.offset)
  }

  const endDrag = useCallback(() => {
    if (!dragRef.current.active) return
    const steps = Math.round(-dragRef.current.offset)
    dragRef.current.active = false
    if (steps) moveTo(active + steps)
    dragRef.current.offset = 0
    setDrag(0)
    setDragging(false)
  }, [active, moveTo])

  const onCardClick = (event, index) => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false
      event.preventDefault()
      return
    }
    if (index !== active) {
      event.preventDefault()
      moveTo(index)
      return
    }
    navigate(`/producto/${products[index].id}`)
  }

  if (total === 0) return null

  return (
    <div
      ref={containerRef}
      className={`coverflow${dragging ? ' is-dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      {products.map((product, index) => {
        const distance = wrapDelta(index - (active + drag), total)
        const position = getPosition(distance, cardWidth)
        const isActive = index === active && Math.abs(drag) < 0.5
        return (
          <button
            key={product.id}
            type="button"
            className={`coverflow-card${isActive ? ' is-active' : ''}`}
            onClick={(event) => onCardClick(event, index)}
            style={{
              transform: `translate(-50%, -50%) translateX(${position.x}px) scale(${position.scale})`,
              opacity: position.opacity,
              zIndex: position.zIndex,
              visibility: position.visible ? 'visible' : 'hidden',
              pointerEvents: position.visible ? 'auto' : 'none',
            }}
            aria-label={`Ver producto ${product.name}`}
            tabIndex={position.visible ? 0 : -1}
          >
            <img src={product.image || 'images/placeholder.svg'} alt={product.name} loading="lazy" draggable={false} />
            <h3>{product.name}</h3>
            {product.ref && <span className="coverflow-ref">{product.ref}</span>}
          </button>
        )
      })}

      <button type="button" className="coverflow-arrow coverflow-arrow--prev" onClick={() => advance(-1)} aria-label="Producto anterior">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button type="button" className="coverflow-arrow coverflow-arrow--next" onClick={() => advance(1)} aria-label="Siguiente producto">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <div className="coverflow-pagination" aria-label="Seleccionar producto">
        {products.map((product, index) => <button key={product.id} type="button" className={index === active ? 'is-active' : ''} onClick={() => moveTo(index)} aria-label={`Mostrar ${product.name}`} />)}
      </div>
    </div>
  )
}