import React from 'react'
import Img from "gatsby-image"

import './home.css'

export default function Home() {
  return (
    <section id="home" className="c-home">
      <div className="c-home__desc">
        <p className="is-important">Hello! I'm Andrei Gătej,</p>
        <p>
          a <span className="is-important">Software Developer</span> with a passion for solving problems and learning new things.
        </p>
      </div>
    </section>
  )
}
