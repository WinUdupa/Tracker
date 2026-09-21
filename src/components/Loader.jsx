import { LOGO_SRC, WELCOME_MESSAGE } from '../config'
import './Loader.css'

export default function Loader({ fading }) {
  return (
    <div className={`loader-screen${fading ? ' fading' : ''}`}>
      <img src={LOGO_SRC} alt="" className="loader-logo" />
      <p className="loader-message">{WELCOME_MESSAGE}</p>
    </div>
  )
}
