import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import { BACK_ARROW } from '../figma/svgs'
import { BANNERS_LP, FILTERS, PCT, PRODUCTS, SALE_END } from '../data/sales'
import { BdeHead, PctCard, ProductCard } from './SalesCards'
import BlacklistBanner from './Blacklist'
import DropsCard from './DropsGame'
import { useCart } from './cartState'
import { useOpenCart } from './useOpenCart'
import './sales.css'

/** Hero banner carousel: swipe to change. Dots match the PLP card dots. */
function HeroCarousel() {
  const track = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  return (
    <div className="s-banner">
      <div className="s-bn-track" ref={track} onScroll={e => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
        {BANNERS_LP.map((b, n) => <img key={b} src={b} alt={`Sale banner ${n + 1}`} draggable={false} />)}
      </div>
      <span className="pl-dots">{BANNERS_LP.map((b, n) => <i key={b} className={n === i ? 'on' : ''} />)}</span>
    </div>
  )
}

/** Sales landing page (/sales). Own css (classes: s-, pc, pl, bd-, dc-, gm-). */

function useCountdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const s = Math.floor(Math.max(0, SALE_END.getTime() - now) / 1000)
  return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60, p: Math.min(1, Math.max(0, 1 - s / (6 * 86400))) }
}
const p2 = (n: number) => String(n).padStart(2, '0')

const I = (d: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
const ICONS: Record<string, ReactElement> = {
  u1499: I('M3 12l9-9h8v8l-9 9-8-8zM15.500 8.500h.01'),
  checks: I('M4 4h16v16H4zM4 12h16M12 4v16'),
  linen: I('M12 3c4 3 6 6 6 9a6 6 0 0 1-12 0c0-3 2-6 6-9zM12 21V11'),
  straight: I('M8 3h8l-1 18h-2l-1-9-1 9H9z'),
  slim: I('M9 3h6l-1 18h-1.500L12 12l-.500 9H10z'),
}

const Units = ({ t }: { t: { d: number; h: number; m: number; s: number } }) => (
  <div className="s-units">{([['Days', 'd', t.d], ['Hrs', 'h', t.h], ['Min', 'm', t.m], ['Sec', 's', t.s]] as const).map(([l, , n]) => <div key={l} className={l === 'Sec' ? 'sec' : ''}><b>{p2(n)}</b><small>{l}</small></div>)}</div>
)

export default function Sales() {
  const nav = useNavigate()
  const t = useCountdown()
  const scroller = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLDivElement>(null)
  const [fil, setFil] = useState<string | null>(null)
  const cart = useCart()
  const openCart = useOpenCart()

  // header turns to glass; the big timer minimises over the first 90px (transform/opacity only, no layout shift)
  const onScroll = () => {
    const y = scroller.current?.scrollTop ?? 0
    bar.current?.style.setProperty('--p', String(Math.min(1, y / 90)))
    head.current?.classList.toggle('glass', y > 8)
  }
  const list = fil ? PRODUCTS.filter(FILTERS.find(f => f.id === fil)!.test) : PRODUCTS

  return (
    <div className="sales">
      <StatusBar />
      <div className="s-header" ref={head}>
        <button className="s-back" aria-label="Back" onClick={() => nav('/')} dangerouslySetInnerHTML={{ __html: BACK_ARROW }} />
        <button className="s-bag" aria-label="Bag" onClick={openCart}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l1 12H4zM9 8V6a3 3 0 0 1 6 0v2" /></svg>{cart.count > 0 && <b className="s-bag-n">{cart.count}</b>}</button>
      </div>
      <div className="scroll s-scroll" ref={scroller} onScroll={onScroll}>
        <div className="s-page">
          {/* timer: starts large, minimises into a slim pinned strip */}
          <div className="s-timer" ref={bar}>
            <div className="s-slim"><span className="s-lab"><i />Hurry, sale ends in</span><b>{([[t.d, 'd'], [t.h, 'h'], [t.m, 'm'], [t.s, 's']] as const).map(([n, u]) => <span key={u}>{n}<small>{u}</small></span>)}</b></div>
            <div className="s-big"><div className="s-card">
              <div className="s-meta"><i />Hurry, sale ends on 6th Dec, 2026</div>
              <Units t={t} />
            </div></div>
          </div>
          <div className="s-gap" />

          <HeroCarousel />

          {/* Big Discount Edit: no title, the creatives sit right under the banner */}
          <section className="s-strip">
            <div className="s-row">{PCT.map(c => <PctCard key={c.line} line={c.line} creative={c.creative} art={c.art} note="112 × 76" wide />)}</div>
          </section>

          <section className="s-game"><DropsCard /></section>

          <BlacklistBanner />

          {/* PLP: quick-view chips stick under the slim timer while you browse the grid */}
          <section className="s-sec s-plp">
            <BdeHead a="All sale" b="Picks" sub="1129 PRODUCTS" />
            <nav className="s-chips">
              {FILTERS.map(f => <button key={f.id} className={fil === f.id ? 'on' : ''} onClick={() => setFil(fil === f.id ? null : f.id)}>{ICONS[f.id]}{f.label}</button>)}
            </nav>
            <div className="s-grid">{list.map((p, i) => <ProductCard key={p.name} p={p} fresh={i % 3 === 0} />)}</div>
          </section>
        </div>
      </div>
    </div>
  )
}
