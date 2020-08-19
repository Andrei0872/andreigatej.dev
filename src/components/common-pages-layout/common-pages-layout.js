import React from 'react'

import './common-pages-layout.css'

import { Link } from 'gatsby'

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function CommonPagesLayout({ children, title }) {
  return (
    <div className="c-common">
      <div className="c-common__header">
        <h1 className="c-common__title">{title}</h1>
        <Link className="c-common__back h-base-link" to="/#work">
          <FontAwesomeIcon icon={faArrowLeft} /> Work section
        </Link>
      </div>

      <div className="c-common__content">{children}</div>
    </div>
  )
}
