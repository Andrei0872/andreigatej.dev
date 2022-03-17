import { Link } from "gatsby"
import PropTypes from "prop-types"
import React, { useState } from "react"

import './header.css'

const Header = ({ siteTitle, links }) => {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      if (!window) {}
    } catch {
      return 'home';
    }
  
    const { hash, pathname } = window.location;
    // When clicking on the navigation tabs.
    if (hash && pathname === '/') {
      return hash.slice(1);
    }
    
    const nextSlashIdx = pathname.indexOf('/', 1);
    const path = nextSlashIdx === - 1 
      // When clicking in the links from the main page
      ? pathname.slice(1)
      // When clicking _refresh_ while being on a secondary work page(e.g blog, projects).
      : pathname.slice(1, nextSlashIdx);
    if (
      ['projects', 'blog'].find(
        navItem => path === navItem
      )
    ) {
      return 'work';
    }
    
    return 'home';
  });

  const [isHamburgerActive, setHamburgerStatus] = useState(false);

  return (
    <header className={`c-header ${isHamburgerActive ? 'is-hamburger-active' : ''}`}>
      <h1 onClick={() => setActiveTab('home')} className="c-header__title">
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
              <li key={idx} className={`c-header__list-item ${l.name.toLowerCase() === activeTab ? 'is-active' : ''}`}>
                {
                  l.external
                    ? <a className="h-base-link is-link" target="_blank" rel="noopener noreferrer" href={l.href}>{l.name}</a>
                    : <Link onClick={() => setActiveTab(l.name.toLowerCase())} className="h-base-link" to={l.href}>{l.name}</Link>
                }
              </li>
            ))
          }
        </ul>

        <div
          onClick={() => setHamburgerStatus(!isHamburgerActive)}
          className="c-header__hamburger"
        >
          <div></div>
          <div></div>
          <div></div>
        </div>
      </nav>
    </header>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
