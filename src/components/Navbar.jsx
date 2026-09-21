import { Link } from 'react-router-dom'
import { LOGO_SRC, CLUB_NAME } from '../config'
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={LOGO_SRC} alt="" className="navbar-logo" />
        <span>{CLUB_NAME}</span>
      </Link>
    </header>
  )
}
