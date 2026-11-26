import { LOCATION_ARROW, STATUS_ICONS } from '../figma/svgs'
import { SHOW_STATUS_BAR } from '../config'

export default function StatusBar() {
  if (!SHOW_STATUS_BAR) return null
  return (
    <div className="statusbar" aria-hidden>
      <div className="sb-icons" dangerouslySetInnerHTML={{ __html: STATUS_ICONS }} />
      <div className="sb-time">
        <span>9:41</span>
        <i dangerouslySetInnerHTML={{ __html: LOCATION_ARROW }} />
      </div>
    </div>
  )
}
