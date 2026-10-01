import usePointerPosition from './usePointerPosition'
import { useRef } from 'react'

export default function PointerSurface({ as: Element = 'div', className, children, ...props }) {
  const lightRef = useRef(null)
  const pointer = usePointerPosition((surface, x, y) => {
    lightRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    surface.classList.add('is-lit')
  }, surface => surface.classList.remove('is-lit'))
  return <Element {...props} className={`${className} pointer-surface`} {...pointer}><span ref={lightRef} className="pointer-glow" aria-hidden="true"/>{children}</Element>
}
