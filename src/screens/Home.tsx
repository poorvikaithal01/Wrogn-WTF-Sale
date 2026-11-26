import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import BottomNav from '../components/Nav'
import SalesWidget from '../components/SalesWidget'
import SaleHero from './SaleHero'
import './home.css'

/** Sale homepage: the Black Friday hero fills the first fold, the sale widget sits in the bottom-nav centre slot.
 *  Tapping the widget or the hero plays the entry film (SaleTransition) and opens /sales. */
export default function Home() {
  const nav = useNavigate()
  return (
    <div className="screen home">
      <SaleHero />
      <StatusBar />
      <div className="home-bottom">
        <BottomNav widget={null} />
        <div className="home-widget"><SalesWidget onOpen={() => nav('/sales')} /></div>
      </div>
    </div>
  )
}
