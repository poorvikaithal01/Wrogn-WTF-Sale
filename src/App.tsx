import { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Cart from './screens/Cart'
import CartOverlay from './screens/CartOverlay'
import Home from './screens/Home'
import Sales from './screens/Sales'
import SaleTransition, { SaleFilm } from './screens/SaleTransition'

/** Routes: `/` is the sale homepage (hero + widget), `/sales` the sale landing page, `/sale-scene?p=N` a still preview of the entry film. */
export default function App() {
  const location = useLocation()
  const nav = useNavigate()
  const [leaving, setLeaving] = useState(false)
  // opened from a page: keep that page mounted underneath and slide the cart over it
  const bg = (location.state as { background?: typeof location } | null)?.background
  const cartOver = location.pathname === '/cart' && !!bg
  // On phones (< 460px wide) scale the 360px column to the screen width; desktop keeps scale 1.
  useEffect(() => {
    const set = () => {
      const w = window.visualViewport?.width ?? window.innerWidth
      document.documentElement.style.setProperty('--s', String(w < 460 ? Math.min(w / 360, 1.3) : 1))
    }
    set()
    window.addEventListener('resize', set); window.addEventListener('orientationchange', set)
    return () => { window.removeEventListener('resize', set); window.removeEventListener('orientationchange', set) }
  }, [])
  return (
    <div className="stage">
      <div className="phone">
        <Routes location={cartOver ? bg : location}>
          <Route path="/" element={<Home />} />
          <Route path="/sales/*" element={<Sales />} />
          <Route path="/sale-scene" element={<div style={{ position: 'absolute', inset: 0 }}><SaleFilm force={Number(new URLSearchParams(window.location.search).get('p') ?? 0)} /></div>} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <SaleTransition />
        {(cartOver || leaving) && <CartOverlay onClose={() => { setLeaving(true); nav(-1) }} onDone={() => setLeaving(false)} />}
      </div>
    </div>
  )
}
