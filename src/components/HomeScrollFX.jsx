import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function HomeScrollFX({ containerRef }) {
  useEffect(() => {
    const root = containerRef.current
    if (!root || reducedMotion()) return

    const animated = new Set()
    const lock = (elements) => {
      const list = Array.from(elements || []).filter(Boolean)
      list.forEach((el) => {
        if (!animated.has(el)) {
          animated.add(el)
          el.style.transition = 'none'
        }
      })
      return list
    }
    const one = (selector) => lock([gsap.utils.toArray(selector, root)[0]])[0]
    const many = (selector) => lock(gsap.utils.toArray(selector, root))

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      const hero = one('.home-hero')
      const heroImage = one('.home-hero-image')
      const heroOverlay = one('.home-hero-overlay')
      const heroCopy = one('.home-hero-copy')
      const families = one('.home-families')
      const famHead = one('.home-families .home-section-heading')
      const famFlow = one('.home-families .coverflow')
      const scenes = one('.home-scene-wrap')
      const scene1 = one('.home-scene-1')
      const scene2 = one('.home-scene-2')
      const solMedia = one('.home-solution-media')
      const solCopy = one('.home-solution-copy')
      const projects = many('.home-project')
      const professionals = one('.home-professionals')
      const profHead = one('.home-professionals h2')
      const profLinks = one('.home-professional-links')
      const brands = one('.home-brands')
      const clients = one('.home-clients')
      const clientsHead = one('.home-clients .home-section-heading')
      const testimonial = one('.home-testimonial')
      const cta = one('.home-cta')
      const ctaImg = one('.home-cta img')
      const ctaCopy = one('.home-cta > div')

      gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } })
        .fromTo(heroImage, { scale: 1.16, yPercent: -2 }, { scale: 1.03, yPercent: 4, ease: 'none' }, 0)
        .to(heroOverlay, { opacity: 0.5, ease: 'none' }, 0)
        .to(heroCopy, { y: -70, opacity: 0, ease: 'none' }, 0.12)

      gsap.timeline({ scrollTrigger: { trigger: families, start: 'top 85%', end: 'top 22%', scrub: 1 } })
        .fromTo(famHead, { y: 46, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0)
        .fromTo(famFlow, { y: 70, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, ease: 'none' }, 0.2)

      gsap.timeline({
        scrollTrigger: { trigger: scenes, start: 'top top', end: 'bottom bottom', scrub: 1 },
        defaults: { ease: 'none' },
      })
        .fromTo(solMedia, { scale: 1.05, yPercent: 1 }, { scale: 1, yPercent: 0, duration: 0.3 }, 0)
        .fromTo(solCopy, { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0)
        .to(scene1, { opacity: 1, duration: 0.35 }, 0)
        .to(scene2, { opacity: 0, duration: 0.35 }, 0)
        .to(scene1, { opacity: 0.6, scale: 0.98, yPercent: -2, duration: 0.15 }, 0.35)
        .to(scene2, { opacity: 0.4, scale: 1.015, yPercent: 1, duration: 0.15 }, 0.35)
        .to(scene1, { opacity: 0, scale: 0.97, yPercent: -4, duration: 0.15 }, 0.5)
        .to(scene2, { opacity: 1, scale: 1, yPercent: 0, duration: 0.15 }, 0.5)
        .set(scene1, { visibility: 'hidden' }, 0.66)
        .to(scene2, { opacity: 1, duration: 0.34 }, 0.66)

      projects.forEach((proj, i) => {
        const img = proj.querySelector('img')
        const txt = proj.querySelector(':scope > div')
        lock([img, txt])
        const base = i * 0.06
        gsap.timeline({ scrollTrigger: { trigger: proj, start: 'top 88%', end: 'top 32%', scrub: 1 } })
          .fromTo(img, { scale: 1.1, y: 44 }, { scale: 1, y: 0, ease: 'none' }, base)
          .fromTo(txt, { y: 50, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, base + 0.14)
      })

      gsap.timeline({ scrollTrigger: { trigger: professionals, start: 'top 88%', end: 'top 35%', scrub: 1 } })
        .fromTo(profHead, { y: 44, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0)
        .fromTo(profLinks, { y: 54, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0.2)

      gsap.timeline({ scrollTrigger: { trigger: brands, start: 'top 95%', end: 'top 60%', scrub: 1 } })
        .fromTo(brands, { y: 28, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0)

      gsap.timeline({ scrollTrigger: { trigger: clients, start: 'top 90%', end: 'top 30%', scrub: 1 } })
        .fromTo(clientsHead, { y: 40, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0)
        .fromTo(testimonial, { y: 70, opacity: 0, scale: 0.985 }, { y: 0, opacity: 1, scale: 1, ease: 'none' }, 0.15)

      gsap.timeline({ scrollTrigger: { trigger: cta, start: 'top 100%', end: 'top 25%', scrub: 1 } })
        .fromTo(ctaImg, { scale: 1.1 }, { scale: 1, ease: 'none' }, 0)
        .fromTo(ctaCopy, { y: 60, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0.1)
    })

    mm.add('(max-width: 767px)', () => {
      const hero = one('.home-hero')
      const heroImage = one('.home-hero-image')
      const heroCopy = one('.home-hero-copy')
      const families = one('.home-families')
      const famHead = one('.home-families .home-section-heading')
      const famFlow = one('.home-families .coverflow')
      const scenes = one('.home-scene-wrap')
      const scene1 = one('.home-scene-1')
      const scene2 = one('.home-scene-2')
      const solMedia = one('.home-solution-media')
      const solCopy = one('.home-solution-copy')
      const projects = many('.home-project')
      const professionals = one('.home-professionals')
      const profHead = one('.home-professionals h2')
      const profLinks = one('.home-professional-links')
      const brands = one('.home-brands')
      const clients = one('.home-clients')
      const clientsHead = one('.home-clients .home-section-heading')
      const testimonial = one('.home-testimonial')
      const cta = one('.home-cta')
      const ctaImg = one('.home-cta img')
      const ctaCopy = one('.home-cta > div')

      gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } })
        .fromTo(heroImage, { scale: 1.1, yPercent: -2 }, { scale: 1.02, yPercent: 5, ease: 'none' }, 0)
        .to(heroCopy, { y: -50, opacity: 0, ease: 'none' }, 0.1)

      gsap.timeline({ scrollTrigger: { trigger: families, start: 'top 90%', end: 'top 35%', scrub: 1 } })
        .fromTo(famHead, { y: 34, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0)
        .fromTo(famFlow, { y: 44, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0.18)

      gsap.timeline({
        scrollTrigger: { trigger: scenes, start: 'top top', end: 'bottom bottom', scrub: 1 },
        defaults: { ease: 'none' },
      })
        .fromTo(solMedia, { scale: 1.03, yPercent: 1 }, { scale: 1, yPercent: 0, duration: 0.25 }, 0)
        .fromTo(solCopy, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 }, 0)
        .to(scene1, { opacity: 1, duration: 0.35 }, 0)
        .to(scene2, { opacity: 0, duration: 0.35 }, 0)
        .to(scene1, { opacity: 0.6, scale: 0.99, yPercent: -1, duration: 0.15 }, 0.35)
        .to(scene2, { opacity: 0.4, scale: 1.01, yPercent: 1, duration: 0.15 }, 0.35)
        .to(scene1, { opacity: 0, scale: 0.985, yPercent: -2, duration: 0.15 }, 0.5)
        .to(scene2, { opacity: 1, scale: 1, yPercent: 0, duration: 0.15 }, 0.5)
        .set(scene1, { visibility: 'hidden' }, 0.66)
        .to(scene2, { opacity: 1, duration: 0.34 }, 0.66)

      projects.forEach((proj, i) => {
        const img = proj.querySelector('img')
        const txt = proj.querySelector(':scope > div')
        lock([img, txt])
        const base = i * 0.05
        gsap.timeline({ scrollTrigger: { trigger: proj, start: 'top 92%', end: 'top 45%', scrub: 1 } })
          .fromTo(img, { scale: 1.08, y: 34 }, { scale: 1, y: 0, ease: 'none' }, base)
          .fromTo(txt, { y: 40, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, base + 0.12)
      })

      gsap.timeline({ scrollTrigger: { trigger: professionals, start: 'top 92%', end: 'top 50%', scrub: 1 } })
        .fromTo(profHead, { y: 32, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0)
        .fromTo(profLinks, { y: 40, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0.18)

      gsap.timeline({ scrollTrigger: { trigger: brands, start: 'top 96%', end: 'top 70%', scrub: 1 } })
        .fromTo(brands, { y: 22, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0)

      gsap.timeline({ scrollTrigger: { trigger: clients, start: 'top 92%', end: 'top 45%', scrub: 1 } })
        .fromTo(clientsHead, { y: 32, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0)
        .fromTo(testimonial, { y: 54, opacity: 0, scale: 0.99 }, { y: 0, opacity: 1, scale: 1, ease: 'none' }, 0.12)

      gsap.timeline({ scrollTrigger: { trigger: cta, start: 'top 100%', end: 'top 40%', scrub: 1 } })
        .fromTo(ctaImg, { scale: 1.06 }, { scale: 1, ease: 'none' }, 0)
        .fromTo(ctaCopy, { y: 46, opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0.1)
    })

    ScrollTrigger.config({ ignoreMobileResize: true })
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    requestAnimationFrame(refresh)

    return () => {
      window.removeEventListener('load', refresh)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      mm.revert()
      animated.forEach((el) => el.style.removeProperty('transition'))
      ScrollTrigger.clearScrollMemory?.()
      ScrollTrigger.refresh()
    }
  }, [containerRef])

  return null
}