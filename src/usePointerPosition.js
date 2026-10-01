import { useEffect, useRef } from 'react'

// One layout read/write per frame. Nested surfaces handle their own light.
export default function usePointerPosition(update, leave) {
  const frame = useRef(null)
  const point = useRef(null)
  const enabled = useRef(false)
  const callbacks = useRef({ update, leave })
  callbacks.current = { update, leave }

  useEffect(() => {
    const fine = matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      enabled.current = fine.matches && !reduced.matches && !document.hidden
      if (!enabled.current) {
        cancelAnimationFrame(frame.current)
        frame.current = null
        if (point.current) callbacks.current.leave?.(point.current.element)
      }
    }
    sync()
    fine.addEventListener('change', sync)
    reduced.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      cancelAnimationFrame(frame.current)
      fine.removeEventListener('change', sync)
      reduced.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return {
    onPointerMove(event) {
      if (event.pointerType !== 'mouse' || !enabled.current) return
      event.stopPropagation()
      point.current = { x: event.clientX, y: event.clientY, element: event.currentTarget }
      if (frame.current !== null) return
      frame.current = requestAnimationFrame(() => {
        frame.current = null
        const { x, y, element } = point.current
        const rect = element.getBoundingClientRect()
        callbacks.current.update(element, x - rect.left, y - rect.top, rect)
      })
    },
    onPointerLeave(event) {
      cancelAnimationFrame(frame.current)
      frame.current = null
      callbacks.current.leave?.(event.currentTarget)
    },
  }
}
