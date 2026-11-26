import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { img, inr } from '../data/sales'

/** Second-level dark sheets opened from the Add to bag sheet: size chart and delivery pincode. Same shell as the Add to bag sheet. */
function Shell({ title, onClose, children }: { title: string; onClose: () => void; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false)
  useEffect(() => { const t = setTimeout(() => setOpen(true), 20); return () => clearTimeout(t) }, [])
  const close = () => { setOpen(false); setTimeout(onClose, 350) }
  return createPortal(
    <div className={`ab-ov top${open ? ' open' : ''}`} onClick={e => { e.stopPropagation(); close() }}>
      <div className="ab-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label={title}>
        <header><b>{title}</b>
          <button className="ab-x" onClick={close} aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#e0e0e0" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg></button>
        </header>
        {children(close)}
      </div>
    </div>,
    document.querySelector('.sales') ?? document.body)
}

const COLS = ['ACROSS SHOULDER', 'CHEST', 'LENGTH']
const ROWS: Record<string, string[]> = { S: ['16.5', '41.5', '29.0'], M: ['17.25', '43.5', '29.5'], L: ['18.0', '45.5', '30.0'], XL: ['19.0', '48.5', '31.0'], '2XL': ['20.0', '51.5', '32.0'] }

/** Add-to-bag toast: dark bar, the message, and a red VIEW BAG text button. Shown on the page after a successful add. */
export function BagToast({ text, onClose, onView }: { text: string; onClose: () => void; onView?: () => void }) {
  const [out, setOut] = useState(false)
  const close = useRef(onClose)
  close.current = onClose   // the page re-renders every second (timer), so the timers below must not depend on the callback's identity
  // stays for 3s, then slides back down and goes
  useEffect(() => {
    const a = setTimeout(() => setOut(true), 3000)
    const b = setTimeout(() => close.current(), 3350)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])
  return createPortal(
    <div className={`ab-toast${out ? ' out' : ''}`} role="status">
      <span>{text}</span>
      {onView && <button onClick={onView}>VIEW BAG</button>}
    </div>,
    document.querySelector('.sales') ?? document.body)
}

export function SizeChart({ photo, price, mrp, picked, onPick, onClose }: { photo: string; price: number; mrp: number; picked: string | null; onPick: (s: string) => void; onClose: () => void }) {
  const [unit, setUnit] = useState<'in' | 'cm'>('in')
  const [tab, setTab] = useState<'body' | 'garment'>('body')
  const [sel, setSel] = useState(picked ?? '')
  const conv = (x: string) => {
    let n = parseFloat(x)
    if (tab === 'garment') n += 1
    return unit === 'cm' ? (n * 2.54).toFixed(1) : n % 1 === 0 ? n.toFixed(1) : String(n)
  }
  return (
    <Shell title="Size chart" onClose={onClose}>
      {close => (
        <div className="ab-body">
          <div className="sc-pad">
            <div className="sc-prod"><img src={img(photo)} alt="" /><div><b>{inr(price)}</b>{mrp > price && <s>{inr(mrp)}</s>}<small>Fit: Regular</small></div></div>
            <div className="sc-row"><h4>Check Your Size :</h4>
              <div className="sc-unit">{(['in', 'cm'] as const).map(u => <button key={u} className={unit === u ? 'on' : ''} onClick={() => setUnit(u)}>{u === 'in' ? 'In' : 'Cm'}</button>)}</div>
            </div>
            <div className="sc-tabs">{(['body', 'garment'] as const).map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'body' ? 'Body Measurement' : 'Garment Measurement'}</button>)}</div>
            <div className="sc-table">
              <div className="sc-tr th"><span>SIZE</span>{COLS.map(c => <span key={c}>{c}</span>)}</div>
              {Object.entries(ROWS).map(([sz, v]) => (
                <button key={sz} className={`sc-tr${sel === sz ? ' on' : ''}`} onClick={() => setSel(sz)}>
                  <span className="a"><i />{sz}</span>{v.map((x, k) => <span key={k}>{conv(x)}</span>)}
                </button>
              ))}
            </div>
          </div>
          <footer className="in"><button className="ab-add" disabled={!sel} onClick={() => { onPick(sel); close() }}>Select size</button></footer>
        </div>
      )}
    </Shell>
  )
}

export function PinSheet({ initial, onSave, onClose }: { initial: string; onSave: (v: string) => void; onClose: () => void }) {
  const [v, setV] = useState(initial)
  const ref = useRef<HTMLInputElement>(null)
  const ok = /^[1-9]\d{5}$/.test(v)
  useEffect(() => { const t = setTimeout(() => ref.current?.focus({ preventScroll: true }), 400); return () => clearTimeout(t) }, [])
  return (
    <Shell title="Enter delivery pincode" onClose={onClose}>
      {close => (
        <div className="pn-wrap">
          <div className="pn-field">
            <input ref={ref} inputMode="numeric" maxLength={6} value={v} placeholder="Pincode" onChange={e => setV(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter' && ok) { onSave(v); close() } }} />
            <button className={ok ? 'on' : ''} disabled={!ok} onClick={() => { onSave(v); close() }}>Check</button>
          </div>
          {v.length === 6 && !ok && <p className="pn-err">Enter a valid 6-digit pincode</p>}
        </div>
      )}
    </Shell>
  )
}
