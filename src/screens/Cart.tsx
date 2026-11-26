import { useNavigate } from 'react-router-dom'
import { img, inr } from '../data/sales'
import { removeItem, setQty, useCart } from './cartState'
import './cart.css'

/** The bag: light page like the Looks cart. Each item has − / + for quantity and a delete icon; the total follows. */
export default function Cart({ onBack }: { onBack?: () => void }) {
  const nav = useNavigate()
  const back = onBack ?? (() => (window.history.length > 1 ? nav(-1) : nav('/sales', { replace: true })))
  const cart = useCart()
  const saved = cart.mrp - cart.value
  return (
    <div className="cart">
      <div className="cart-head">
        <button aria-label="Back" onClick={back}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#161601" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg></button>
        <b>CART</b>
        {cart.count > 0 && <span>{cart.count} {cart.count === 1 ? 'item' : 'items'}</span>}
      </div>
      {cart.items.length === 0 ? (
        <div className="cart-empty">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#8a8c90" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l1 12H4zM9 8V6a3 3 0 0 1 6 0v2" /></svg>
          <h3>Your bag is empty</h3>
          <button onClick={back}>CONTINUE SHOPPING</button>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.items.map(it => (
              <div className="ci" key={it.id + it.size}>
                <img src={img(it.img)} alt="" draggable={false} />
                <div className="ci-b">
                  <div className="ci-top">
                    <h3>{it.name}</h3>
                    <button className="ci-del" aria-label={`Remove ${it.name}`} onClick={() => removeItem(it.id, it.size)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#161601" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /></svg>
                    </button>
                  </div>
                  <div className="ci-price"><b>{inr(it.price)}</b><s>{inr(it.mrp)}</s><em>{Math.round((1 - it.price / it.mrp) * 100)}% OFF</em></div>
                  <p className="ci-size">Size : <b>{it.size}</b></p>
                  <div className="ci-qty">
                    <button aria-label="Decrease quantity" disabled={it.qty <= 1} onClick={() => setQty(it.id, it.size, it.qty - 1)}>−</button>
                    <span>{it.qty}</span>
                    <button aria-label="Increase quantity" disabled={it.qty >= 10} onClick={() => setQty(it.id, it.size, it.qty + 1)}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-foot">
            <div className="cart-sum">
              <small>Total payable</small>
              <div><b>{inr(cart.value)}</b>{saved > 0 && <s>{inr(cart.mrp)}</s>}</div>
              {saved > 0 && <em>You save {inr(saved)}</em>}
            </div>
            <button className="cart-go">PROCEED TO CHECKOUT</button>
          </div>
        </>
      )}
    </div>
  )
}
