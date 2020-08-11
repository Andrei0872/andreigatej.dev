import React from 'react'

import './about.css'

export default function About() {
  return (
    <section id="about" className="c-about">
      <h1 className="c-about__title">About</h1>
      
      <div className="c-about__content">
        <p>
          I'm a student in the <i>The Faculty of Mathematics and Computer Science</i> at the <i>University of Bucharest</i>.
        </p>
        <p>
          Regarding development, I prefer working within the <b className="is-important">JavaScript ecosystem</b>, hence I'm familiar with <b className="is-important">TypeScript</b>,
          <b className="is-important">Angular</b>, <b className="is-important">RxJS</b> and <b className="is-important">Node.js</b>. I love working on both Front-End and Back-End. 
          Nevertheless, I'm always willing to explore and learn new skills or technologies. 
        </p>
        <p>
          Although I spend almost every waking hour studying articles, exploring a new technology or building something fun, I also enjoy doing sports, reading and spending time with my friends.
        </p>
      </div>
    </section>
  )
}
