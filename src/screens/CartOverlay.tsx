import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import Cart from './Cart'

const W = 360
const EASE = [0.22, 0.61, 0.36, 1] as const

/**
 * The cart as a sheet that slides in from the right over the screen it was opened from.
 * Back (or a swipe right from the left edge) slides it back out and hands control to onClose, which pops the route.
 */
export default function CartOverlay({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const x = useMotionValue(W)
  const closing = useRef(false)
  const start = useRef<{ x: number; id: number } | null>(null)
  useEffect(() => { animate(x, 0, { duration: 0.44, ease: EASE }) }, [x])

  const close = () => {
    if (closing.current) return
    closing.current = true
    onClose()                                            // route pops now, so the PDP behind starts moving back at the same time
    animate(x, W, { duration: 0.38, ease: EASE }).then(onDone)
  }
  // swipe back: drag from the left edge, release past ~90px (or with a flick) to close
  const down = (e: React.PointerEvent) => { start.current = { x: e.clientX, id: e.pointerId }; try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* synthetic pointer */ } }
  const move = (e: React.PointerEvent) => { if (!start.current || closing.current) return; const dx = e.clientX - start.current.x; if (dx > 0) x.set(dx) }
  const up = (e: React.PointerEvent) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x; start.current = null
    if (dx > 90) close(); else animate(x, 0, { duration: 0.25, ease: EASE })
  }
  return (
    <motion.div className="cart-slide" style={{ x }}>
      <Cart onBack={close} />
      <div className="cart-edge" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-hidden />
    </motion.div>
  )
}
