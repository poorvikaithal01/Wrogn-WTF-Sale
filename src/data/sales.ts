// Black Friday Sale content (placeholder copy + imagery until the final sale assets arrive). Sale window: 3 – 6 Dec.
// Real window is 3 – 6 Dec. The prototype shows the live state (4 days left) so the urgency can be judged; swap for the real end time.
export const SALE_END = new Date(Date.now() + (4 * 86400 + 5 * 3600 + 18 * 60) * 1000)
export const SALE_DATES = '3 – 6 Dec'

export const img = (h: string) => `/img/${h}.jpg`
export const BANNER = '/img/sale-banner.webp'          // homepage hero crop
export const BANNER_LP = '/img/sale-banner-lp.webp'    // sales landing page banner
export const BANNER_WTF = '/img/wtf-banner-lp.webp'    // WTF Sale landscape banner for the landing page
export const BANNERS_LP = [BANNER_WTF, BANNER_LP, '/img/sale-banner-2.webp', '/img/sale-banner-3.webp']  // landing page hero carousel

/** Big Discount Edit cards. `creative` is the optional background image the marketing team supplies; empty shows the image placeholder. */
/** Offer cards: `creative` is a finished image; `art` is a placeholder (photo + short text) that marketing replaces with real artwork. */
export type Art = { photo: string; tag: string; big: string; sub: string }
export const PCT: { n: number; line: string; creative?: string; art?: Art }[] = [
  { n: 50, line: 'Shirts', creative: '/img/bde-shirts.webp?v=3' },
  { n: 50, line: 'Trousers', creative: '/img/bde-trousers.webp?v=3' },
  { n: 50, line: 'Tees', creative: '/img/bde-tees.webp?v=3' },
  { n: 50, line: 'Sweatshirts', art: { photo: 'w-sweatshirts-5', tag: 'SWEATSHIRTS', big: '50%', sub: 'OFF' } },
  { n: 60, line: 'Jackets', creative: '/img/bde-50.webp' },
]

/** Price-point cards: tag + a stack of thumbnails from that price band. */
/** Shop by budget: a photo (the clean top of each creative) with the price set over a bottom fade; `label` is the line under the card. */
export const PRICE: { what: string; price: string; label: string; art: Art }[] = [
  { what: 'Graphic tees', price: '₹999', label: 'Graphic tees', art: { photo: '/img/budget-999.webp', tag: 'UNDER', big: '₹999', sub: '' } },
  { what: 'Shirts', price: '₹599', label: 'Shirts', art: { photo: '/img/budget-599.webp', tag: 'UNDER', big: '₹599', sub: '' } },
  { what: 'Accessories', price: '₹399', label: 'Accessories', art: { photo: '/img/budget-399.webp', tag: 'UNDER', big: '₹399', sub: '' } },
  { what: 'Basic tees', price: '₹299', label: 'Basic tees', art: { photo: '/img/budget-299.webp', tag: 'UNDER', big: '₹299', sub: '' } },
]


/** Cart-bonus game (example only). */
/** `code` is the coupon the player copies and pastes in the cart's coupon section (placeholder: one code, CARTOFF, for every tier; the cart applies the tier by cart value). */
export const GAME_TIERS: { above: number; n: string; code: string }[] = [
  { above: 1999, n: '5%', code: 'CARTOFF' },
  { above: 3999, n: '10%', code: 'CARTOFF' },
  { above: 5999, n: '15%', code: 'CARTOFF' },
]
/** Points needed in the game to win the discount the cart is eligible for. */
export const GAME_WIN_SCORE = 10
/** The cart decides WHICH discount a player can win (the highest tier the cart reaches, 0 = none yet); the game decides IF they win it. */
export const eligibleTier = (cart: number) => GAME_TIERS.filter(t => cart >= t.above).length
/** Anyone can play; the won offer unlocks in the cart on orders of at least this value. */
export const GAME_MIN_ORDER = 1999


/** PLP at the end of the page. `tags` drive the sticky quick-view chips. */
export type Product = { name: string; price: number; mrp: number; img: string; offer: string; tags: string[] }
export const PRODUCTS: Product[] = [
  { name: "Slim Fit Checkered Shirt", price: 1849, mrp: 2599, img: 'w-shirts-2', offer: 'Flat 50% off', tags: ['checks', 'shirt', 'slim'] },
  { name: "Pink Slim Fit Checked Shirt", price: 1299, mrp: 2599, img: 'w-shirts-10', offer: 'Flat 50% off', tags: ['checks', 'shirt', 'slim'] },
  { name: "Slim Fit Full Sleeve Flannel Shirt", price: 1299, mrp: 2599, img: 'w-shirts-21', offer: 'Flat 50% off', tags: ['checks', 'shirt'] },
  { name: "Solid Linen Blend Slim Fit Shirt", price: 1899, mrp: 2799, img: 'w-shirts-23', offer: 'Flat 40% off', tags: ['linen', 'shirt', 'slim'] },
  { name: "Solid Linen Blend Shirt", price: 1899, mrp: 2599, img: 'w-shirts-37', offer: 'Flat 40% off', tags: ['linen', 'shirt'] },
  { name: "Solid Slim Fit Shirt", price: 1199, mrp: 2299, img: 'w-shirts-14', offer: 'Flat 50% off', tags: ['shirt', 'slim'] },
  { name: "Straight Fit Mens Trouser", price: 1299, mrp: 2799, img: 'w-trousers-1', offer: 'Flat 30% off', tags: ['straight'] },
  { name: "Men's casual straight fit trousers", price: 999, mrp: 2799, img: 'w-trousers-2', offer: 'Flat 30% off', tags: ['straight'] },
  { name: "Men's Casual Slim Fit Trousers", price: 899, mrp: 2199, img: 'w-trousers-3', offer: 'Flat 30% off', tags: ['slim'] },
  { name: "Wales Corduroy Straight Fit Trouser", price: 1699, mrp: 2599, img: 'w-trousers-5', offer: 'Flat 30% off', tags: ['straight'] },
  { name: "Solid Bomber Jacket", price: 2199, mrp: 2999, img: 'w-jackets-1', offer: 'Flat 30% off', tags: [] },
  { name: "Men's Comfort Fit Wrogn branded Sweatshirt", price: 1299, mrp: 1999, img: 'w-sweatshirts-4', offer: 'Flat 40% off', tags: [] },
]
/** BFS sale price shown on the PLP card (placeholder: a further 10% off the selling price). */
export const bfsPrice = (p: Product) => Math.round((p.price * 0.9) / 10) * 10
export const FILTERS = [
  { id: 'u1499', label: 'Under ₹1,499', test: (p: Product) => p.price <= 1499 },
  { id: 'checks', label: 'Checkered shirts', test: (p: Product) => p.tags.includes('checks') },
  { id: 'linen', label: 'Linen', test: (p: Product) => p.tags.includes('linen') },
  { id: 'straight', label: 'Straight fit', test: (p: Product) => p.tags.includes('straight') },
  { id: 'slim', label: 'Slim fit', test: (p: Product) => p.tags.includes('slim') },
]
export const off = (p: { price: number; mrp: number }) => Math.round((1 - p.price / p.mrp) * 100)
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN')

/** Category-level offers: every product in the category gets the same flat % off its MRP; the card shows only the BFS sale price. */
const cat = (pct: number, items: [name: string, img: string, mrp: number][]): Product[] =>
  items.map(([name, img, mrp]) => ({ name, img, mrp, price: Math.round((mrp * (1 - pct / 100)) / 10) * 10, offer: `Flat ${pct}% off`, tags: [] }))
export const CATS = [
  { a: 'T-shirts', b: '40% off', items: cat(40, [
    ["Casual Back Printed Oversized T-Shirt", 'w-tshirts-2', 1049], ["Classic Oversized Placement Printed T-Shirt", 'w-tshirts-3', 1199], ["Heavy GSM Placement Print T-Shirt", 'w-tshirts-4', 1399],
    ["Heavy GSM Printed Monster T-Shirt", 'w-tshirts-6', 1399], ["Heavy GSM Printed Faces T-Shirt", 'w-tshirts-9', 1399], ["Placement Print Slim Fit Fit T-Shirt", 'w-tshirts-10', 1299]]) },
  { a: 'Joggers', b: '30% off', items: cat(30, [
    ["Solid Relaxed Fit Cargo Jogger", 'w-joggers-2', 2999], ["Men's Casual Straight Fit Jogger", 'w-joggers-4', 2599], ["Men's Casual Straight Fit Cargo Knit Jogger", 'w-joggers-8', 2499],
    ["Men\u2019s Straight Fit Cargo Joggers", 'w-joggers-13', 2599], ["Men\u2019s Straight Fit Knit Jogger With Pockets", 'w-joggers-5', 2199]]) },
]
