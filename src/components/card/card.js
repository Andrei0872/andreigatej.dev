import React from 'react'

import './card.css'

export default function Card({ title, content, logo, className, ...props }) {

  return (
    <div {...props} className={"c-card " + className}>
      <div className="c-card__logo">{logo}</div>
      <div className="c-card__title">{title}</div>
      <div className="c-card__content">{content}</div>
    </div>
  )
}
