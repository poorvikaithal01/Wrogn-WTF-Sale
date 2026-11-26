import { useLocation, useNavigate } from 'react-router-dom'

/** Every cart entry point uses this: the screen it was opened from stays mounted and the cart slides over it (see CartOverlay). */
export function useOpenCart() {
  const nav = useNavigate()
  const loc = useLocation()
  return () => nav('/cart', { state: { background: loc } })
}
