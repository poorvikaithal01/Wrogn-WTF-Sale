import './blacklist.css'

/** Wrogn Blacklist banner. Two states: member with coins ("You have N coins") and no coins / signed out ("Shop. Earn. Redeem.").
 *  Prototype: the state comes from ?coins=N in the URL (default 123; ?coins=0 shows the no-coins state). */
const coins = () => {
  const q = new URLSearchParams(window.location.search).get('coins')
  return q === null ? 123 : Math.max(0, parseInt(q, 10) || 0)
}

export default function BlacklistBanner() {
  const n = coins()
  const toPicks = () => document.querySelector('.s-plp')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <section className="s-sec s-bl">
      <div className="bl">
        <img className="bl-coin" src="/img/blacklist-coin.png?v=15" alt="" draggable={false} />
        <div className="bl-t">
          <small>WROGN <i>BLACKLIST</i></small>
          {n > 0 ? <h3>You have <i>{n}</i> coins</h3> : <h3>Shop. Earn. <i>Redeem.</i></h3>}
          <p>{n > 0 ? 'Turn your coins into savings.' : 'Earn coins. Unlock discounts.'}</p>
          <button className="bl-btn" onClick={toPicks}>{n > 0 ? 'Shop & Redeem' : 'Start Shopping'}</button>
        </div>
      </div>
    </section>
  )
}
