import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOGO_PATH } from '../figma/svgs'
import { SALE_DATES } from '../data/sales'
import './sale-transition.css'

/**
 * One film for both entries (widget tap or hero tap): ~3.9s on a fixed deep-maroon background, one page.
 *  0.0s logo + WROGN  ->  0.25s "BLACK FRIDAY SALE"; the pink-red divider under it draws outward from the star (the loading cue)
 *  0.5s "UP TO", then the 70% hero and OFF  ->  1.1s three offer cards, one after another  ->  1.55s sale dates
 *  3.3s (after a 1s hold on the finished page) the sales page is mounted underneath and the film cross-fades into it (no lift, no jump).
 *  Everything is a soft fade with a short rise; the sparkles only breathe slowly. */
export default function SaleTransition() {
  const [open, setOpen] = useState(false)
  const busy = useRef(false)
  busy.current = open
  useEffect(() => {
    const on = (e: Event) => {
      if (!document.querySelector('.phone')) return
      e.preventDefault()
      if (!busy.current) setOpen(true)
    }
    const w = window as unknown as { __saleOff?: () => void }
    w.__saleOff?.()
    window.addEventListener('sale-open', on)
    const off = () => window.removeEventListener('sale-open', on)
    w.__saleOff = off
    return off
  }, [])
  return open ? <Run done={() => setOpen(false)} /> : null
}

function Run({ done }: { done: () => void }) {
  const nav = useNavigate()
  const [leaving, setLeaving] = useState(false)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const ts = [setTimeout(() => setShown(true), 20), setTimeout(() => { nav('/sales'); setLeaving(true) }, 3300), setTimeout(done, 3950)]
    return () => ts.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="sf-wrap" style={{ opacity: shown && !leaving ? 1 : 0, transition: leaving ? 'opacity .6s ease' : 'opacity .2s ease-out' }}>
      <SaleFilm />
    </div>
  )
}

const CARDS = [
  { n: '50%', a: 'FLAT OFF', icon: (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M3 3h9.500L23 13.500 13.500 23 3 12.500z" fill="#CC0F5C" /><circle cx="8" cy="8" r="1.800" fill="#000" /><text x="14.500" y="15.500" textAnchor="middle" fontSize="9" fontWeight="800" fill="#000" transform="rotate(45 14.500 13)" fontFamily="Source Sans 3,sans-serif">%</text></svg>) },
  { n: '₹999', a: 'STYLES UNDER', icon: (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#CC0F5C" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9h18l1 14H3z" /><path d="M9 9V7a4 4 0 0 1 8 0v2" /></svg>) },
  { n: '₹300', a: 'EXTRA IN CART', icon: (
    <svg width="28" height="26" viewBox="0 0 28 26" fill="none" stroke="#CC0F5C" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 3h4l3 13h12l3-9H8" /><circle cx="11" cy="21.500" r="1.800" /><circle cx="20" cy="21.500" r="1.800" /></svg>) },
]
const Star = ({ s, x, y, d }: { s: number; x: number; y: number; d: string }) => (
  <svg className="sf-star" width={s} height={s} viewBox="0 0 24 24" style={{ left: x, top: y, '--d': d } as React.CSSProperties} aria-hidden="true"><path d="M12 0c.8 6.600 4.400 11.200 12 12-7.600.8-11.200 5.400-12 12-.8-6.600-4.400-11.200-12-12C7.600 11.200 11.200 6.600 12 0z" fill="#CC0F5C" /></svg>
)

/** The film. `force` pins a view for the preview at /sale-scene?p=1 (no cards) or 2 (with cards); animations are off then. */
export function SaleFilm({ force }: { force?: number }) {
  const still = force !== undefined
  const showCards = !still || force >= 2
  const r = (d: string) => ({ '--d': d }) as React.CSSProperties
  return (
    <div className={`sf${still ? ' still' : ''}`}>
      <i className="sf-streak a" /><i className="sf-streak b" /><i className="sf-streak c" />
      <Star s={13} x={48} y={96} d="0s" /><Star s={14} x={302} y={266} d="1.1s" /><Star s={14} x={314} y={602} d="2s" />
      <div className="sf-brand">
        <svg className="rise" style={r('0s')} width="42" height="32" viewBox="0 0 96 73.1" aria-hidden="true"><path d={LOGO_PATH} fill="#fff" /></svg>
      </div>
      <div className="sf-page">
        <div className="sf-label rise" style={r('.25s')}>WTF SALE</div>
        <div className="sf-div rise" style={r('.3s')}><u /><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.8 6.600 4.400 11.200 12 12-7.600.8-11.200 5.400-12 12-.8-6.600-4.400-11.200-12-12C7.600 11.200 11.200 6.600 12 0z" fill="#CC0F5C" /></svg><u /></div>
        <small className="sf-up rise" style={r('.5s')}>UP TO</small>
        <div className="sf-hero rise" style={r('.62s')}><b className="sf-n">70</b><i className="sf-pc">%</i></div>
        <b className="sf-off rise" style={r('.9s')}>OFF</b>
        <div className="sf-cards">
          {showCards && CARDS.map((x, i) => (
            <div key={x.n} className="sf-card rise" style={r(`${1.1 + i * 0.12}s`)}>{x.icon}<b>{x.n}</b><span>{x.a}</span></div>
          ))}
        </div>
        <div className="sf-dates rise" style={r('1.55s')}><u /><span>{SALE_DATES}</span><u /></div>
      </div>
    </div>
  )
}
