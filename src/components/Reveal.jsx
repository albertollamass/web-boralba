import { useEffect, useRef, useState } from 'react'

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isSmallScreen = () => typeof window !== 'undefined' && window.innerWidth < 640

export function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReduced()) {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: options.threshold || 0.12, rootMargin: options.rootMargin || '0px 0px -8% 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [options.threshold, options.rootMargin])

  return { ref, inView }
}

export default function Reveal({ children, as: Tag = 'div', delay = 0, className = '', variant = 'up', ...rest }) {
  const { ref, inView } = useInView()
  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${variant}${inView ? ' is-visible' : ''}${className ? ' ' + className : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/**
 * Motor de imagen con movimiento dirigido por scroll.
 * - `--pvy`: traslación vertical (parallax), controlada por la posición.
 * - `--fxz`: factor de zoom que "asienta" la imagen (1.12 -> 1) al alcanzar el centro.
 * Solo escucha scroll cuando el elemento está cerca del viewport y se desactiva
 * en móvil pequeño y con prefers-reduced-motion.
 */
export function useMediaFX(speed = 0.16, zoom = 0.1) {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReduced() || isSmallScreen()) return
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < 0 || rect.top > vh) return
      const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)))
      const settle = Math.max(0, 1 - Math.abs(p - 0.5) * 2)
      el.style.setProperty('--pvy', `${((p - 0.5) * speed * 130).toFixed(1)}px`)
      el.style.setProperty('--fxz', `${(1 + (1 - settle) * zoom).toFixed(3)}`)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [speed, zoom])

  return ref
}

export function ParallaxMedia({ src, alt, speed = 0.16, zoom = 0.1, className = '' }) {
  const ref = useMediaFX(speed, zoom)
  return (
    <span className={`media-fx${className ? ' ' + className : ''}`} ref={ref}>
      <span className="fx-in">
        <img src={src} alt={alt} loading="lazy" />
      </span>
    </span>
  )
}

/**
 * Unidad de scrollytelling: expone el progreso del elemento a través del
 * viewport como variables CSS listas para usar.
 * - `--drive-op`:    opacidad (0 → 1) del elemento en su viaje.
 * - `--drive-y`:     desplazamiento vertical en px (negativo = hacia arriba).
 * - `--drive-scale`: escala del elemento (1 en reposo).
 * - `--drive-blur`:  desenfoque cinematográfico al entrar/salir (0 en reposo).
 * - `--drive-exit`:  0 → 1 mientras abandona la parte superior del viewport.
 * Solo escucha scroll cuando el elemento está cerca del viewport y respeta
 * `prefers-reduced-motion` (en ese caso las variables quedan en reposo).
 */
export function useScrollDrive({ range = 0.85, start = 0.08, y = 150, scale = 0.06, fade = 0.94, blur = 6 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReduced() || isSmallScreen()) return
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < 0 || rect.top > vh * 1.5) return
      const entryStart = vh * start
      const travel = Math.max(1, vh * range)
      const exit = Math.max(0, Math.min(1, (entryStart - rect.top) / travel))
      const entryTravel = vh + rect.height
      const enter = Math.max(0, Math.min(1, (vh - rect.top) / entryTravel))
      el.style.setProperty('--drive-op', String(1 - exit * fade))
      el.style.setProperty('--drive-y', `${(-exit * y).toFixed(1)}px`)
      el.style.setProperty('--drive-scale', (1 - exit * scale).toFixed(4))
      el.style.setProperty('--drive-blur', `${(exit * blur).toFixed(2)}px`)
      el.style.setProperty('--drive-exit', exit.toFixed(4))
      el.style.setProperty('--drive-in', enter.toFixed(4))
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [range, start, y, scale, fade, blur])

  return ref
}

export function useAmbientDrive() {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReduced() || isSmallScreen()) return
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      el.style.setProperty('--ambient-y', `${(-window.scrollY * 0.045).toFixed(1)}px`)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return ref
}

/** Zoom dirigido por scroll sobre cualquier contenedor (usa variables CSS). */
export function ScrollFX({ as: Tag = 'div', className = '', children, speed = 0.14, zoom = 0.08 }) {
  const ref = useMediaFX(speed, zoom)
  return (
    <Tag ref={ref} className={`fx${className ? ' ' + className : ''}`}>
      {children}
    </Tag>
  )
}

/** Inclinación 3D sutil al pasar el ratón (solo puntero tipo ratón). */
export function Tilt({ children, className = '', max = 7 }) {
  const ref = useRef(null)

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const rafRef = useRef(0)

  const onMove = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    if (prefersReduced()) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    const ry = (px - 0.5) * 2 * max
    const rx = (0.5 - py) * 2 * max
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty('--tilt-x', `${rx.toFixed(2)}deg`)
      el.style.setProperty('--tilt-y', `${ry.toFixed(2)}deg`)
      el.classList.add('is-tilting')
    })
  }

  const onLeave = () => {
    cancelAnimationFrame(rafRef.current)
    const el = ref.current
    if (!el) return
    el.classList.remove('is-tilting')
  }

  return (
    <div
      ref={ref}
      className={`tilt${className ? ' ' + className : ''}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  )
}

/** Banda de texto en movimiento continuo. */
export function Marquee({ items, className = '' }) {
  const row = [...items, ...items, ...items, ...items]
  return (
    <div className={`marquee${className ? ' ' + className : ''}`} aria-hidden="true">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
