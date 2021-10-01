import React from 'react'

import './home.css'

export default function Home() {
  return (
    <section id="home" className="c-home">
      <h1 className="c-home__intro-text">
        Hello! I'm Andrei Gătej, a <span className="is-important">software developer</span> with a passion for <span className="is-important">web development</span>.
      </h1>

      <p className="c-home__normal-text">
        I enjoy solving problems and I'm always seeking improvement in the work I do. Nevertheless, I have a curious mind which often leads me to want to learn more about how tools work under the hood.
      </p>

      <p className="c-home__normal-text">
        Here I'm sharing my programming journey, along with some of my thoughts.
      </p>
    </section>
  )
}
