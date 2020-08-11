import React from 'react'

import './menu-overlay.css'
import { Link } from 'gatsby'

export default function MenuOverlay({ links, toggleOverlay, isOpened }) {
  const containerClassName = `c-overlay ${isOpened ? 'c-overlay--opened' : ''}`

  return (
    <div className={containerClassName}>
      <ul className="c-overlay__menu">
        {
          links.map((l, idx) => (
            <li key={idx} onClick={toggleOverlay} className="c-overlay__item">
              <Link className="h-base-link" to={l.href}>{l.name}</Link>
            </li>
          ))
        }
      </ul>
    </div>
  )
}
