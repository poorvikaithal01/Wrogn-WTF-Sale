import { useSyncExternalStore } from 'react'
import { PRODUCTS, bfsPrice } from '../data/sales'

/** Prototype cart shared by the cart page, the bag badge and the Catch the Drops banner.
 *  Starts with two items (?cart=0 starts empty); the Add to bag sheet adds to it and the cart page edits it.
 *  Replace with the real cart. */
export type CartItem = { id: string; name: string; img: string; price: number; mrp: number; size: string; qty: number }
type Snap = { items: CartItem[]; value: number; mrp: number; count: number }

const snap = (items: CartItem[]): Snap => ({
  items,
  value: items.reduce((n, i) => n + i.price * i.qty, 0),
  mrp: items.reduce((n, i) => n + i.mrp * i.qty, 0),
  count: items.reduce((n, i) => n + i.qty, 0),
})
const seed = (): CartItem[] => ['Slim Fit Checkered Shirt', 'Straight Fit Mens Trouser'].map(name => {
  const p = PRODUCTS.find(x => x.name === name)!
  return { id: p.name, name: p.name, img: p.img, price: bfsPrice(p), mrp: p.mrp, size: 'L', qty: 1 }
})

let state = snap(new URLSearchParams(window.location.search).get('cart') === '0' ? [] : seed())
const subs = new Set<() => void>()
const set = (items: CartItem[]) => { state = snap(items); subs.forEach(f => f()) }
const same = (i: CartItem, id: string, size: string) => i.id === id && i.size === size

export const addToCart = (item: Omit<CartItem, 'qty'>) =>
  set(state.items.some(i => same(i, item.id, item.size))
    ? state.items.map(i => (same(i, item.id, item.size) ? { ...i, qty: i.qty + 1 } : i))
    : [...state.items, { ...item, qty: 1 }])
export const setQty = (id: string, size: string, qty: number) =>
  set(state.items.map(i => (same(i, id, size) ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)))
export const removeItem = (id: string, size: string) => set(state.items.filter(i => !same(i, id, size)))
export const useCart = () => useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f) } }, () => state)
