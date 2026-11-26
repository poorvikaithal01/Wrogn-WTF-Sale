const WTF_BANNER = '/img/wtf-banner.webp?v=2'
import './sale-hero.css'

/** Sale version of the homepage (sales mode only). A scrollable page: the Black Friday hero fills the first fold with the
 *  next image peeking above the bottom nav, so it reads as scrollable. Drop a film at public/video/sale.mp4 to play it over the photo. */
export default function SaleHero() {
  return (
    <div className="sh-scroll" aria-label="Wrogn WTF sale">
      <div className="sh-hero" onClick={() => { if (window.dispatchEvent(new CustomEvent('sale-open', { detail: { kind: 'hero' }, cancelable: true }))) window.location.assign('/sales') }}>
        <div className="sh-bg" style={{ backgroundImage: `url(${WTF_BANNER})` }} />
      </div>
      <div className="sh-next">
        <img className="sh-wide sh-dull" src="/img/workshop.webp" alt="" draggable={false} />
        <img className="sh-wide sh-more" src="/img/atlas.webp" alt="Atlas Collection, live now" draggable={false} />
      </div>
    </div>
  )
}
