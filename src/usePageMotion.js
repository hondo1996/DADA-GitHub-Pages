import { useEffect } from 'react'

export default function usePageMotion(progressRef) {
  useEffect(() => {
    let frame = null
    let maxScroll = 0
    let previous = -1
    const updateScroll = () => {
      if (frame !== null || document.hidden) return
      frame = requestAnimationFrame(() => {
        frame = null
        const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0
        if (progress !== previous && progressRef.current) {
          progressRef.current.style.transform = `scaleX(${progress})`
          previous = progress
        }
      })
    }
    const measure = () => {
      maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight)
      updateScroll()
    }
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(document.body)
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', measure, { passive: true })

    const targets = [...document.querySelectorAll('.hero, .discipline-strip, .contact-section')]
    const visible = new Set()
    const syncMotion = () => {
      targets.forEach(element => {
        element.dataset.motionActive = String(visible.has(element) && !document.hidden)
      })
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = null
      } else measure()
    }
    const motionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      })
      syncMotion()
    })
    targets.forEach(element => motionObserver.observe(element))
    document.addEventListener('visibilitychange', syncMotion)
    measure()
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      motionObserver.disconnect()
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', syncMotion)
    }
  }, [progressRef])
}
