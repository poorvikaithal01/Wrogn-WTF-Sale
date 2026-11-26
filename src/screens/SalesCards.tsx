import { useEffect, useRef, useState } from 'react'
import { bfsPrice, img, inr, type Art, type Product } from '../data/sales'
import { useOpenCart } from './useOpenCart'
import { addToCart } from './cartState'
import AddToBag from './AddToBag'
import { BagToast } from './BagSheets'

export const Arrow = ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>

/** Section heading: big serif lockup, red italic second line, star divider. The divider's light sweep plays `plays` times (once by default) each time the heading is on screen, and stops when it leaves. */
export function BdeHead({ a = 'Big Discount', b = 'Edit', sub, inline, plays = 1 }: { a?: string; b?: string; sub?: string; inline?: boolean; plays?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setRun(e.isIntersecting), { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className={`bd-head${inline ? ' inline' : ''}${run ? ' run' : ''}`} ref={ref} style={{ '--plays': plays } as React.CSSProperties}>
      <h2>{a}<i>{b}</i></h2>
      <div className="bd-div"><u /><svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 0c.8 6.600 4.400 11.200 12 12-7.600.8-11.200 5.400-12 12-.8-6.600-4.400-11.200-12-12C7.600 11.200 11.200 6.600 12 0z" fill="#F50057" /></svg><u /></div>
      {sub && <p>{sub}</p>}
    </div>
  )
}

/** Big Discount Edit card: a creative slot (the marketing image; placeholder when empty) with an arrow on it.
 *  Chamfered black card with a white hairline, lifted by stacked layers and soft shadows. */
/** Placeholder offer creative: a product photo with the offer set over a dark fade, in the same fonts as the page. */
function Creative({ a }: { a: Art }) {
  return (
    <div className="cr">
      <img src={a.photo.startsWith('/') ? a.photo : img(a.photo)} alt="" draggable={false} />
      <div className="cr-t"><small>{a.tag}</small><b>{a.big}{a.sub && <span>{a.sub}</span>}</b><u /></div>
    </div>
  )
}

export function PctCard({ line, creative, art, note = '108 × 120', label, wide }: { line: string; creative?: string; art?: Art; note?: string; label?: string; wide?: boolean }) {
  return (
    <a className={`pc${label ? ' cat' : ''}${wide ? ' wide' : ''}`} aria-label={line}>
      <div className="pc-in">
        <i className="pc-l1" /><i className="pc-l2" />
        <div className="pc-bg">
          {creative
            ? <div className="pc-art"><img src={creative} alt="" draggable={false} /></div>
            : art ? <div className="pc-art"><Creative a={art} /></div>
            : <div className="pc-ph">
                <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"><rect x="6" y="8" width="36" height="32" rx="3" /><circle cx="31" cy="18" r="3" /><path d="M6 36l10-11 8 8 6-5 12 10" /></svg>
                <small>CREATIVE</small><em>{note}</em>
              </div>}
        </div>
        {label && <div className="pc-txt"><u /><p>{label}</p></div>}
        <span className="pc-go"><Arrow s={13} /></span>
      </div>
    </a>
  )
}

/** Shop by budget: the Big Discount Edit card, taller, with the budget as its label. */
export const PriceCard = ({ what, price, label, art }: { what: string; price: string; label: string; art?: Art }) => <PctCard line={`${what} under ${price}`} art={art} note={`${what} under ${price}`} label={label} />

/** PLP card in the app's layout: image with a NEW DROP tag, quick-add and carousel dots; name; price and mrp; BFS sale price. */
export function ProductCard({ p, fresh, compact }: { p: Product; fresh?: boolean; compact?: boolean }) {
  const [sheet, setSheet] = useState(false)
  const [toast, setToast] = useState(false)
  const openCart = useOpenCart()
  const bfs = compact ? p.price : bfsPrice(p)
  return (
    <div className={compact ? 'pl compact' : 'pl'}>
      <div className="pl-img"><img src={img(p.img)} alt="" draggable={false} />
        {fresh && <span className="pl-tag">NEW DROP</span>}
        <button className="pl-add" aria-label="Quick add" onClick={() => setSheet(true)}><svg width="14" height="14" viewBox="0 0 14 14" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"><path d="M7 1v12M1 7h12" /></svg></button>
        <span className="pl-dots"><i className="on" /><i /><i /><i /></span>
      </div>
      {!compact && <div className="pl-title">{p.name}</div>}
      {!compact && <div className="pl-price"><b>{inr(p.price)}</b><s>{inr(p.mrp)}</s></div>}
      <div className="pl-bfs">Sale price <b>{inr(bfs)}</b></div>
      {sheet && <AddToBag photo={p.img} price={compact ? p.mrp : p.price} mrp={p.mrp} bfs={bfs} onAdded={size => { setToast(true); addToCart({ id: p.name, name: p.name, img: p.img, price: bfs, mrp: p.mrp, size }) }} onClose={() => setSheet(false)} />}
      {toast && <BagToast text="Added to bag" onClose={() => setToast(false)} onView={() => { setToast(false); openCart() }} />}
    </div>
  )
}
