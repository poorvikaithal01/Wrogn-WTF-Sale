import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import './sales-widget.css'

export type SalesWidgetProps = { onOpen: () => void }

/** Offers the widget cycles through once the intro is done; replace with the live sale offers. */
const OFFERS = [
  { a: 'FLAT', b: '50%', c: 'OFF' },
  { a: 'UNDER', b: '₹999', c: 'STYLES' },
  { a: 'EXTRA', b: '₹300', c: 'IN CART' },
  { a: 'FLAT', b: '40%', c: 'OFF' },
  { a: 'UNDER', b: '₹599', c: 'T-SHIRTS' },
]

/** Home bottom-nav centre widget for the sale. Fills the 70.4x73.6 centre slot of the bottom nav.
 *  A red ticket labelled BFS SALE that flips through the headline offers; tap to open the sale. */
export default function SalesWidget({ onOpen }: SalesWidgetProps) {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)
  // Intro on every landing: only "BLACK FRIDAY SALE" comes in, holds, then zooms away into the offers.
  const [phase, setPhase] = useState<'title' | 'leave' | 'offers'>('title')
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('leave'), 2600)
    const t2 = setTimeout(() => setPhase('offers'), 2950)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  useEffect(() => {
    if (phase !== 'offers') return
    const t = setInterval(() => { if (!document.hidden) setI(x => (x + 1) % OFFERS.length) }, reduced ? 3500 : 2000)
    return () => clearInterval(t)
  }, [phase, reduced])
  const o = OFFERS[i]
  return (
    <button className="sw" aria-label="Open the WTF sale" onClick={e => {
      // grow this card into the sale page (see SaleTransition); plain navigation if reduced motion or no listener
      const card = e.currentTarget.querySelector('.sw-card') as HTMLElement | null
      if (reduced || !card) return onOpen()
      const ev = new CustomEvent('sale-open', { detail: { kind: 'widget', rect: card.getBoundingClientRect() }, cancelable: true })
      if (window.dispatchEvent(ev)) onOpen()
    }}>
      <span className="sw-back" />
      <motion.span className={`sw-card${phase === 'offers' ? '' : ' intro'}`} animate={reduced ? undefined : { rotate: [-3, -1, -3] }} transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="sw-tag">WTF SALE</span>
        {phase !== 'offers' && <span className={`sw-title${phase === 'leave' ? ' out' : ''}`}><strong>WTF</strong><small>SALE</small></span>}
        {phase === 'offers' && <AnimatePresence mode="wait">
          <motion.span key={i} className="sw-offer"
            initial={{ opacity: 0, y: 10, rotateX: -50 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: -10, rotateX: 50 }}
            transition={{ duration: 0.22, ease: [0.2, 0, 0.2, 1] }}>
            <i>{o.a}</i><b>{o.b}</b><em className={o.c.length > 8 ? 'l' : ''}>{o.c}</em>
          </motion.span>
        </AnimatePresence>}
        <span className="sw-shine" />
      </motion.span>
      <span className="sw-go" aria-hidden><svg width="14" height="9" viewBox="0 0 28 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9h22M17 2l7 7-7 7" /></svg></span>
    </button>
  )
}
