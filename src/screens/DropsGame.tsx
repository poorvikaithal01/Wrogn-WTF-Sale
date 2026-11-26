import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LOGO_PATH } from '../figma/svgs'
import { useCart } from './cartState'
import { GAME_MIN_ORDER, GAME_TIERS, GAME_WIN_SCORE, eligibleTier, inr } from '../data/sales'
import { BdeHead } from './SalesCards'
import { BagToast } from './BagSheets'
import './drops.css'

/** Padlock above each tier: open (pink, with sparks) once the cart value unlocks it, closed (grey) while it is still locked. */
function Lock({ open = false }: { open?: boolean }) {
  return open
    ? <svg className="gm-lk" width="28" height="24" viewBox="0 0 28 24" fill="none" aria-label="Unlocked"><rect x="2" y="10.500" width="14.500" height="11.500" rx="1.800" fill="#f50057" /><path d="M9.300 10.500V7.300a4.600 4.600 0 0 1 9.200 0v3.200" stroke="#f50057" strokeWidth="2.600" /><circle cx="9.250" cy="14.800" r="1.500" fill="#2a0f16" /><path d="M8.400 15.600h1.700l.6 3.400H7.800z" fill="#2a0f16" /><path d="M22.200 3.600l2.300-1.500M22.800 7.400h2.900M22.200 11.200l2.300 1.500" stroke="#f50057" strokeWidth="1.500" strokeLinecap="round" /></svg>
    : <svg className="gm-lk" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Locked"><rect x="5" y="10.500" width="14" height="10" rx="2.200" fill="#fff" /><path d="M8 10.500V8a4 4 0 0 1 8 0v2.500" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="15.300" r="1.300" fill="#2a2a2e" /></svg>
}

/** Copy the unlocked coupon so it can be pasted in the cart's coupon section. Shows "Code copied" on the button and a toast. */
function CopyCode({ code, className = '' }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState(false)
  const copy = () => {
    const done = () => { setCopied(true); setToast(true) }
    const fallback = () => {
      const t = document.createElement('textarea'); t.value = code; t.style.position = 'fixed'; t.style.opacity = '0'
      document.body.appendChild(t); t.select(); try { document.execCommand('copy') } catch { /* clipboard unavailable: still confirm in the prototype */ } t.remove(); done()
    }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).then(done, fallback); else fallback()
  }
  const copyIcon = <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.100" strokeLinejoin="round"><rect x="3.800" y="3.800" width="6.200" height="6.200" rx="1" /><path d="M8 3.800V2.600A.6.6 0 0 0 7.400 2H2.600a.6.6 0 0 0-.6.600v4.800a.6.6 0 0 0 .6.600h1.200" /></svg>
  const tick = <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.200l2.600 2.600L10 3.200" /></svg>
  return <>
    <button type="button" className={`cc${copied ? ' on' : ''} ${className}`} onClick={copy} aria-label={copied ? 'Code copied' : `Copy code ${code}`}>
      {className === 'gm'
        ? <><em>Use code:</em><span className="cc-pill"><b>{code}</b>{copied ? tick : copyIcon}</span></>
        : <><b>{code}</b><span>{copied ? <>{tick}Code copied</> : <>{copyIcon}Copy code</>}</span></>}
    </button>
    {toast && <BagToast text="Code copied, apply in cart" onClose={() => setToast(false)} />}
  </>
}

/** Cart bonus game: "Catch the Drops". A bottom sheet with a 15 second canvas game. Catch tags and tees in the bag,
 *  dodge SOLD OUT tiles. Anyone can play (no minimum cart). The score (GAME_WIN_SCORE) decides whether it is won; the cart value (see eligibleTier) decides which discount it is worth, and the texts say how much more to shop when the cart is below a tier. Unlimited tries; it stops at the first win.
 *  Prototype only: tries and result live in this component; dev owns the real outcome and attempt tracking. */

const W = 328, H = 340, DUR = 15
// The bag floats BAG_LIFT px above the finger (so the thumb never covers it), within BAG_MIN..BAG_MAX from the top of the field.
const BAG_MAX = H - 34, BAG_MIN = H - 134, BAG_LIFT = 46
const BAG_SCALE = 56 / 60
type Kind = 'tag' | 'tee' | 'gold' | 'sold'
const PTS: Record<Kind, number> = { tag: 1, tee: 1, gold: 3, sold: -2 }
const HALF: Record<Kind, [number, number]> = { tag: [13, 17], tee: [18, 14], gold: [14, 14], sold: [24, 13] }
type Item = { k: Kind; x: number; y: number; v: number; r: number; w: number }
type Float = { x: number; y: number; t: number; txt: string; c: string }

const TEE = new Path2D('M-14 -11 L-8 -14 Q0 -8 8 -14 L14 -11 L18 -4 L12 0 L9 -3 L9 13 L-9 13 L-9 -3 L-12 0 L-18 -4 Z')
const LOGO = new Path2D(LOGO_PATH)

function chamfer(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, k: number) {
  c.moveTo(x + k, y); c.lineTo(x + w - k, y); c.lineTo(x + w, y + k); c.lineTo(x + w, y + h - k)
  c.lineTo(x + w - k, y + h); c.lineTo(x + k, y + h); c.lineTo(x, y + h - k); c.lineTo(x, y + k); c.closePath()
}

/** Draws one falling item centred on (0,0). */
function drawItem(c: CanvasRenderingContext2D, k: Kind) {
  c.save()
  c.textAlign = 'center'; c.textBaseline = 'middle'
  if (k === 'tag') {
    c.beginPath(); chamfer(c, -13, -17, 26, 34, 5); c.fillStyle = '#f1e8dc'; c.fill()
    c.beginPath(); c.arc(0, -11, 2.2, 0, 6.283); c.fillStyle = '#1a0b10'; c.fill()
    c.fillStyle = '#a51e52'; c.font = '700 14px "Source Sans 3",sans-serif'; c.fillText('%', 0, 5)
  } else if (k === 'tee') {
    c.fillStyle = '#8a264c'; c.fill(TEE)
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.4; c.lineJoin = 'round'; c.stroke(TEE)
  } else if (k === 'gold') {
    c.shadowColor = 'rgba(232,194,122,.8)'; c.shadowBlur = 14
    const g = c.createRadialGradient(-4, -5, 2, 0, 0, 14); g.addColorStop(0, '#fff0c9'); g.addColorStop(1, '#d9a84e')
    c.beginPath(); c.arc(0, 0, 13, 0, 6.283); c.fillStyle = g; c.fill()
    c.shadowBlur = 0; c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.2; c.stroke()
    c.fillStyle = '#5a3a0c'; c.font = '700 15px "Source Sans 3",sans-serif'; c.fillText('₹', 0, 1)
  } else {
    c.beginPath(); chamfer(c, -24, -13, 48, 26, 4); c.fillStyle = '#2a0b17'; c.fill()
    c.strokeStyle = '#f50057'; c.lineWidth = 1.5; c.stroke()
    c.fillStyle = '#f50057'; c.font = '700 9px "Source Sans 3",sans-serif'; c.fillText('SOLD OUT', 0, 1)
  }
  c.restore()
}

function drawBag(c: CanvasRenderingContext2D, x: number, y: number) {
  c.save(); c.translate(x, y); c.scale(BAG_SCALE, BAG_SCALE)   // 4px narrower than the original 60px bag
  c.beginPath(); c.moveTo(-12, -18); c.bezierCurveTo(-12, -36, 12, -36, 12, -18)
  c.strokeStyle = '#f50057'; c.lineWidth = 2.6; c.lineCap = 'round'; c.stroke()
  c.beginPath(); c.moveTo(-30, -18); c.lineTo(30, -18); c.lineTo(26, 26); c.lineTo(-26, 26); c.closePath()
  const g = c.createLinearGradient(0, -18, 0, 26); g.addColorStop(0, '#f50057'); g.addColorStop(1, '#f50057')
  c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.5; c.lineJoin = 'round'; c.stroke()
  c.translate(-10.5, -3); c.scale(.22, .22); c.fillStyle = '#fff'; c.fill(LOGO)
  c.restore()
}

/** Small canvas with one item, for the legend. */
function Ico({ k }: { k: Kind }) {
  const r = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = r.current; if (!cv) return
    const dpr = window.devicePixelRatio || 1; cv.width = 44 * dpr; cv.height = 40 * dpr
    const c = cv.getContext('2d')!; c.scale(dpr, dpr); c.translate(22, 20); drawItem(c, k)
  }, [k])
  return <canvas ref={r} width={44} height={40} className="gm-ico" aria-hidden />
}

type Phase = 'intro' | 'play' | 'result'

function Sheet({ cart, onStart, onDone, onClose }: { cart: number; onStart: () => void; onDone: (rung: number) => void; onClose: () => void }) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('intro')
  const [count, setCount] = useState(3)
  const [score, setScore] = useState(0)
  const [final, setFinal] = useState(0)
  const cv = useRef<HTMLCanvasElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const clock = useRef<HTMLSpanElement>(null)
  const g = useRef({ items: [] as Item[], fl: [] as Float[], t: 0, bx: W / 2, tx: W / 2, by: BAG_MAX, ty: BAG_MAX, score: 0, spawn: 0.3, shake: 0, flash: 0 })

  useEffect(() => { const t = setTimeout(() => setOpen(true), 20); return () => clearTimeout(t) }, [])
  const close = () => { setOpen(false); setTimeout(onClose, 350) }

  const begin = () => {
    onStart()
    Object.assign(g.current, { items: [], fl: [], t: 0, bx: W / 2, tx: W / 2, by: BAG_MAX, ty: BAG_MAX, score: 0, spawn: 0.3, shake: 0, flash: 0 })
    setScore(0); setCount(3); setPhase('play')
  }

  // 3, 2, 1 before the drops start
  useEffect(() => {
    if (phase !== 'play' || count <= 0) return
    const t = setTimeout(() => setCount(c => c - 1), 650)
    return () => clearTimeout(t)
  }, [phase, count])

  // arrow keys on desktop
  useEffect(() => {
    if (phase !== 'play') return
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') g.current.tx -= 46; if (e.key === 'ArrowRight') g.current.tx += 46 }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [phase])

  // the game loop
  useEffect(() => {
    if (phase !== 'play' || count > 0) return
    const el = cv.current; if (!el) return
    const dpr = window.devicePixelRatio || 1; el.width = W * dpr; el.height = H * dpr
    const c = el.getContext('2d')!
    const s = g.current
    let last = performance.now()
    const step = () => {
      const now = performance.now(); const dt = Math.min(0.05, (now - last) / 1000); last = now
      s.t += dt
      if (s.t >= DUR) { clearInterval(id); setFinal(s.score); setPhase('result'); return }
      const p = s.t / DUR
      // spawn: faster and harder as time runs out
      s.spawn -= dt
      if (s.spawn <= 0) {
        s.spawn = 0.7 - 0.38 * p + Math.random() * 0.14
        const r = Math.random(), hz = 0.22 + 0.14 * p
        const k: Kind = r < hz ? 'sold' : r < hz + 0.07 ? 'gold' : Math.random() < 0.5 ? 'tag' : 'tee'
        s.items.push({ k, x: 26 + Math.random() * (W - 52), y: -26, v: (140 + 200 * p) * (0.9 + Math.random() * 0.25), r: (Math.random() - 0.5) * 0.5, w: Math.random() * 6 })
      }
      s.tx = Math.max(34, Math.min(W - 34, s.tx))
      s.bx += (s.tx - s.bx) * Math.min(1, dt * 22)
      s.by += (s.ty - s.by) * Math.min(1, dt * 22)
      const BY = s.by
      const mouth = BY - 18
      s.items = s.items.filter(it => {
        it.y += it.v * dt
        const [hw, hh] = HALF[it.k]
        if (it.y + hh >= mouth && it.y < BY && Math.abs(it.x - s.bx) < 30 * BAG_SCALE + hw * 0.4) {
          const d = PTS[it.k]; s.score = Math.max(0, s.score + d); setScore(s.score)
          s.fl.push({ x: it.x, y: mouth - 6, t: 0, txt: d > 0 ? `+${d}` : `${d}`, c: d > 0 ? (it.k === 'gold' ? '#e8c27a' : '#fff') : '#f50057' })
          if (d < 0) { s.shake = 0.3; s.flash = 0.5 }
          try { navigator.vibrate?.(d < 0 ? [70, 40, 110] : 8) } catch { /* not supported */ }  // haptics: a strong double buzz on SOLD OUT, a light tick on a catch (Android browsers; iOS Safari has no web vibration)
          return false
        }
        return it.y < H + 30
      })
      s.shake = Math.max(0, s.shake - dt); s.flash = Math.max(0, s.flash - dt)
      s.fl = s.fl.filter(f => (f.t += dt) < 0.7)
      // draw
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H)
      for (const it of s.items) {
        c.save(); c.translate(it.x, it.y); c.rotate(it.r + Math.sin(s.t * 3 + it.w) * 0.12); drawItem(c, it.k); c.restore()
      }
      // very soft shadow under the floating bag
      const sx = s.bx + (s.shake ? Math.sin(s.t * 90) * 3 : 0)
      c.save(); c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(sx, BY + 32, 28, 5, 0, 0, Math.PI * 2); c.fill(); c.restore()
      drawBag(c, sx, BY)
      c.textAlign = 'center'; c.textBaseline = 'middle'
      for (const f of s.fl) { c.globalAlpha = 1 - f.t / 0.7; c.fillStyle = f.c; c.font = '700 15px "Source Sans 3",sans-serif'; c.fillText(f.txt, f.x, f.y - f.t * 46) }
      c.globalAlpha = 1
      if (s.flash > 0) { const gr = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); gr.addColorStop(0, 'rgba(245,0,87,0)'); gr.addColorStop(1, `rgba(245,0,87,${s.flash * 0.7})`); c.fillStyle = gr; c.fillRect(0, 0, W, H) }
      if (bar.current) bar.current.style.transform = `scaleX(${1 - p})`
      if (clock.current) clock.current.textContent = `0:${String(Math.ceil(DUR - s.t)).padStart(2, '0')}`
    }
    const id = setInterval(step, 16)
    return () => clearInterval(id)
  }, [phase, count])

  // the cart decides which discount is on offer; scoring enough wins it
  const elig = eligibleTier(cart)
  // Anyone can play. Scoring enough always wins; the cart decides what the win is worth right now.
  // Cart below the first tier: the win is shown against the first tier and the text says how much more to shop.
  const won = final >= GAME_WIN_SCORE
  const shown = Math.max(elig, 1)
  const prize = won ? elig : 0
  const tier = GAME_TIERS[shown - 1]
  useEffect(() => { if (phase === 'result') onDone(won ? shown : 0) }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Shop now: close the sheet and bring the first product row into view
  const shop = () => {
    close()
    setTimeout(() => document.querySelector('.s-cat')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 420)
  }

  const aim = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect(); g.current.tx = (e.clientX - r.left) * (W / r.width)
    g.current.ty = Math.max(BAG_MIN, Math.min(BAG_MAX, (e.clientY - r.top) * (H / r.height) - BAG_LIFT))
  }

  const sheet = (
    <div className={`gm-ov${open ? ' open' : ''}`} onClick={() => phase !== 'play' && close()}>
      <div className={`gm-sheet${phase === 'result' ? ' res' : ''}`} onClick={e => e.stopPropagation()} role="dialog" aria-label="Catch the drops">
        <i className="gm-grab" />
        {phase !== 'play' && <button className="gm-x" onClick={close} aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#e0e0e0" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg></button>}

        {phase === 'intro' && <>
          <small className="gm-eye">WROGN THROWAWAY FESTIVAL GAME</small>
          <BdeHead a="Catch the" b="Drops" />
          <p className="gm-lead top">15s to play · Score <b>{GAME_WIN_SCORE} points</b> · Avoid SOLD OUT cards!</p>
          <div className="gm-el">
            <small>PLAY TO UNLOCK</small>
            <div className="gm-tiers">
              {GAME_TIERS.map(t => (
                <div key={t.n}>
                  <Lock />
                  <em><b>{t.n}</b><span>OFF</span></em>
                  <i>Min. order <b>{inr(t.above)}</b></i>
                </div>
              ))}
            </div>
          </div>
          <div className="gm-legend">
            {(['tag', 'tee', 'gold', 'sold'] as Kind[]).map(k => <div key={k} className={k === 'sold' ? 'bad' : ''}><Ico k={k} /><b>{PTS[k] > 0 ? `+${PTS[k]}` : `−${-PTS[k]}`}</b></div>)}
          </div>
          <button className="gm-btn" onClick={begin}>Start game</button>
        </>}

        {phase === 'play' && <>
          <div className="gm-hud">
            <div><small>SCORE</small><b>{score}</b></div>
            <div className="gm-clock"><small>TIME</small><span ref={clock}>0:15</span></div>
          </div>
          <div className="gm-time"><div ref={bar} /></div>
          <div className="gm-field">
            <canvas ref={cv} width={W} height={H} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); aim(e) }} onPointerMove={aim} />
            {count > 0 && <div className="gm-count" key={count}>{count}</div>}
          </div>
          <p className="gm-hint">Drag left or right to move the bag.</p>
        </>}

        {phase === 'result' && won && <div className="gm-win">
          <small className="gm-eye">WROGN THROWAWAY FESTIVAL GAME</small>
          <BdeHead a="Catch the" b="Drops" inline />
          <svg className="gm-win-art" viewBox="0 0 220 124" aria-hidden="true">
            <defs><linearGradient id="gmtk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe6da" /><stop offset="1" stopColor="#ff9ac1" /></linearGradient></defs>
            {/* confetti first, so it bursts out from behind the ticket; --fx/--fy point back to the ticket centre */}
            {([
              [46, 46, 9, 15, -32, '#f50057', 66, 16], [68, 69, 9, 14, 58, '#f50057', 44, -7], [154, 38, 9, 15, 28, '#f50057', -42, 24],
              [176, 82, 9, 15, -50, '#f50057', -64, -20], [26, 92, 8, 12, 35, '#f50057', 86, -30], [196, 52, 8, 12, -24, '#f50057', -84, 10],
              [192, 106, 8, 12, 48, '#f50057', -80, -44],
            ] as const).map(([x, y, w, h, r, c, fx, fy], i) => (
              <g key={i} className="gm-cf" style={{ '--fx': `${fx}px`, '--fy': `${fy}px`, '--d': `${0.12 + i * 0.05}s`, '--fl': `${i * 0.35}s` } as React.CSSProperties}>
                <g className="gm-fl"><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="1.500" fill={c} transform={`rotate(${r} ${x} ${y})`} /></g>
              </g>
            ))}
            {([[164, 63, -52, -1], [58, 101, 54, -39]] as const).map(([x, y, fx, fy], i) => (
              <g key={`s${i}`} className="gm-cf" style={{ '--fx': `${fx}px`, '--fy': `${fy}px`, '--d': `${0.3 + i * 0.1}s`, '--fl': `${i * 0.6}s` } as React.CSSProperties}>
                <g className="gm-fl"><path fill="#f50057" d={`M${x} ${y - 5}l1.800 4.200 4.200 1.800-4.200 1.800-1.800 4.200-1.800-4.200-4.200-1.800 4.200-1.800z`} /></g>
              </g>
            ))}
            <g transform="rotate(12 112 62)">
              <path d="M88 20h36l10 10v54l-12 12H88l-12-12V32z" fill="url(#gmtk)" stroke="#f50057" strokeWidth="2.500" strokeLinejoin="round" />
              <text x="106" y="76" textAnchor="middle" fontSize="42" fontWeight="800" fill="#f50057" fontFamily="Source Sans 3,sans-serif">%</text>
            </g>
          </svg>
          <h3 className="gm-won">You won!</h3>
          <p className="gm-cong">{`Congrats! ${tier.n} OFF unlocked, applicable on your cart.`}</p>
          <div className="gm-tk">
            <div className="gm-tk-l"><em><b>{tier.n}</b><span>OFF</span></em><small>ON YOUR ORDER</small></div>
            <i />
            <div className="gm-tk-r"><CopyCode code={tier.code} className="gm" /><span>Applicable on cart</span></div>
          </div>
          <button className="gm-btn gm-shop" onClick={shop}>SHOP NOW <svg width="18" height="12" viewBox="0 0 28 18" fill="none" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9h22M17 2l7 7-7 7" /></svg></button>
        </div>}

        {phase === 'result' && !won && <>
          <small className="gm-eye">YOUR SCORE</small>
          <div className="gm-score">{final}</div>
          <p className="gm-yours">You scored {final}</p>
          <div className={`gm-prize${prize ? '' : ' none'}`}>
            {prize ? <><small>YOU UNLOCKED</small><b>{GAME_TIERS[prize - 1].n}<i> off</i></b><span>Apply coupon code in cart · min. order {inr(GAME_MIN_ORDER)}</span></>
              : <><small>SO CLOSE!</small><b className="sm">Score {GAME_WIN_SCORE} to win <u>{GAME_TIERS[Math.max(elig, 1) - 1].n} off</u></b><span>You need {GAME_WIN_SCORE - final} more points.</span></>}
          </div>
          {!prize && <button className="gm-btn" onClick={begin}>Try again</button>}
          <button className={`gm-btn ${!prize ? 'ghost' : ''}`} onClick={close}>{prize ? 'Done' : 'Close'}</button>
        </>}
      </div>
    </div>
  )
  return createPortal(sheet, document.querySelector('.sales') ?? document.body)
}

/** The section: one compact card with the entry to the game; the cart value comes from cartState. */
export default function DropsCard() {
  const v = useCart().value
  const [played, setPlayed] = useState(false)   // unlimited tries: after the first round the button reads "Try again"
  const [best, setBest] = useState(0)
  const [show, setShow] = useState(false)
  const top = GAME_TIERS[GAME_TIERS.length - 1].n   // the biggest prize
  return (
    <div className="dc">
      <div className={`dc-play${best > 0 ? ' won' : ''}`}>
        <img className="dc-art" src="/img/bag-art.png" alt="" draggable={false} />
        <small>WROGN THROWAWAY FESTIVAL GAME</small>
        {best > 0 ? <h3>You won <i>{GAME_TIERS[best - 1].n} off</i></h3> : <h3>Catch the <i>Drops</i></h3>}
        {best > 0 ? <div className="dc-code"><CopyCode code={GAME_TIERS[best - 1].code} className="gm" /><span>{v < GAME_TIERS[best - 1].above ? <>Shop for <b>{inr(GAME_TIERS[best - 1].above - v)}</b> more to apply the coupon in cart.</> : `Apply this code in cart to get ${GAME_TIERS[best - 1].n} off.`}</span></div> : null}
        {best === 0 && <>
          <div className="dc-pill">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f50057" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h3l2.600 12.400a1 1 0 0 0 1 .8h9.600a1 1 0 0 0 1-.8L21 7H6" /><circle cx="9" cy="20" r="1.400" /><circle cx="17" cy="20" r="1.400" /></svg>
            <i />
            <span><em>Win up to <b>{top} OFF</b> on your order</em>
              <small>Play to unlock exclusive cart discounts</small></span>
          </div>
          <button className="dc-btn" onClick={() => setShow(true)}>{played ? 'Try again' : 'Play to win'}</button>
        </>}
      </div>
      {show && <Sheet cart={v} onStart={() => setPlayed(true)} onDone={r => setBest(b => Math.max(b, r))} onClose={() => setShow(false)} />}
    </div>
  )
}
