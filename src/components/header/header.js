import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

import './header.css'

const Header = ({ siteTitle, links, toggleOverlay, isActive }) => (
  <header className="c-header">
    <h1 className="c-header__title">
      <Link
        to="/"
        className="h-base-link"
      >
        {siteTitle}
      </Link>
    </h1>

    <nav className="c-header__nav">
      <ul className="c-header__list-container">
        {
          links.map((l, idx) => (
            <li key={idx} className="c-header__list-item">
              <Link className="h-base-link" to={l.href}>{l.name}</Link>
            </li>
          ))
        }
      </ul>

      <div 
        onClick={toggleOverlay} 
        className={"c-header__hamburger " + (isActive ? 'c-header__hamburger--active' : '')}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>
    </nav>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
