import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { img, inr } from '../data/sales'
import { PinSheet, SizeChart } from './BagSheets'
import './bag.css'

/** Dark "Add to bag" bottom sheet, opened from the + on a PLP card. Prototype: nothing is sent anywhere; the pincode and measurements are placeholders. */
const SIZES = ['S', 'M', 'L', 'XL', '2XL']
const CROPS: [number, string][] = [[1, '50% 10%'], [1.55, '50% 18%'], [1.4, '50% 90%'], [1.9, '30% 45%']]   // placeholder gallery: crops of the one photo we have
const deliveryBy = () => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) }

export default function AddToBag({ photo, price, mrp, bfs, onAdded, onClose }: { photo: string; price: number; mrp: number; bfs: number; onAdded: (size: string) => void; onClose: () => void }) {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState<string | null>(null)
  const [warn, setWarn] = useState(false)
  const [adding, setAdding] = useState(false)
  const [pin, setPin] = useState('560012')
  const [guide, setGuide] = useState(false)
  const [pinSheet, setPinSheet] = useState(false)
  const sizes = useRef<HTMLDivElement>(null)
  useEffect(() => { const t = setTimeout(() => setOpen(true), 20); return () => clearTimeout(t) }, [])
  const close = () => { setOpen(false); setTimeout(onClose, 350) }
  const add = () => {
    if (adding) return
    if (!size) { setWarn(true); sizes.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return }
    // a short "adding" beat on the button first; the toast only appears once the item is in the bag. The sheet stays open.
    setAdding(true)
    setTimeout(() => { setAdding(false); onAdded(size) }, 800)
  }
  const node = (
    <div className={`ab-ov${open ? ' open' : ''}`} onClick={close}>
      <div className="ab-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label="Add to bag">
        <header><b>ADD TO BAG</b>
          <button className="ab-x" onClick={close} aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#e0e0e0" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg></button>
        </header>
        <div className="ab-body">
          <div className="ab-gallery">{CROPS.map(([z, pos]) => <span key={pos} className="ab-ph"><img src={img(photo)} style={{ objectPosition: pos, transform: `scale(${z})`, transformOrigin: pos }} alt="" draggable={false} /></span>)}</div>
          <section className="ab-price">
            <div className="ab-top"><b>{inr(price)}</b>
              <p>MRP: {mrp > price ? <s>{inr(mrp)}</s> : <span>{inr(mrp)}</span>} <em>Inclusive of all taxes</em></p></div>
            <strong>Sale price <b>{inr(bfs)}</b></strong>
          </section>
          <section className="ab-size" ref={sizes}>
            <div className="ab-row"><b>SELECT SIZE</b><button className="ab-guide" onClick={() => setGuide(true)}>SIZE GUIDE</button></div>
            <div className="ab-sizes">{SIZES.map(s => <button key={s} className={size === s ? 'on' : ''} onClick={() => { setSize(s); setWarn(false) }}>{s}</button>)}</div>
            {warn && !size && <p className="ab-warn">Please select a size</p>}
          </section>
          <section className="ab-del">
            <h4>Check Delivery</h4>
            <div className="ab-pin"><span><svg width="14" height="16" viewBox="0 0 14 18" fill="#fff"><path d="M7 0a7 7 0 0 0-7 7c0 5 7 11 7 11s7-6 7-11a7 7 0 0 0-7-7zm0 9.500A2.500 2.500 0 1 1 7 4.500a2.500 2.500 0 0 1 0 5z" /></svg>{pin}</span><button onClick={() => setPinSheet(true)}>CHANGE</button></div>
            <p><svg width="18" height="14" viewBox="0 0 26 20" fill="none" stroke="#bdbdc2" strokeWidth="1.4" strokeLinejoin="round"><path d="M1 3h15v11H1zM16 7h5l4 4v3h-9z" /><circle cx="6" cy="16" r="2" fill="#111113" /><circle cx="20" cy="16" r="2" fill="#111113" /></svg>Delivery by <b>{deliveryBy()}</b></p>
          </section>
        </div>
        <footer><button className={`ab-add${adding ? ' busy' : ''}`} onClick={add}>{adding ? <><i />ADDING</> : 'ADD TO BAG'}</button></footer>
      </div>
      {guide && <SizeChart photo={photo} price={price} mrp={mrp} picked={size} onPick={s => { setSize(s); setWarn(false) }} onClose={() => setGuide(false)} />}
      {pinSheet && <PinSheet initial={pin} onSave={setPin} onClose={() => setPinSheet(false)} />}
    </div>
  )
  return createPortal(node, document.querySelector('.sales') ?? document.body)
}
