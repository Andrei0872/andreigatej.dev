import React from 'react'

import './about.css'

export default function About() {
  return (
    <section id="about" className="c-about">
      <h2 className="c-about__title is-section-title">About</h2>
      
      <div className="c-about__content">
        <article className="c-about-section">
          <h3 className="is-section-title">Education</h3>
          <p>
            I'm a student in the <i>The Faculty of Mathematics and Computer Science</i> at the <i>University of Bucharest</i>.
            <br />
            I'm in my second year, expected to (<i>hopefully</i>) graduate in 2023.
          </p>
        </article>

        <article className="c-about-section">
          <h3 className="is-section-title">Programming</h3>
          <p>
            One of my ambitions is to become the best programmer I can humanly be.
            <br />
            <br />
            Although I find everything about programming interesting, <span className="is-important">web development</span> is my passion and I love working in all of its areas:
            Front-End, Back-End, DevOps, Databases and even Security.
            <br />
            My experience mostly spans the JavaScript ecosystem: <span className="is-important">JavaScript</span>, <span className="is-important">TypeScript</span>, <span className="is-important">Vue.js</span>, <span className="is-important">Angular</span>, <span className="is-important">RxJS</span>, <span className="is-important">Node.js</span> and <span className="is-important">webpack</span>. I'm also familiar with <span className="is-important">SQL</span>, <span className="is-important">Go</span> and <span className="is-important">Docker</span>.
            <br />
            <br />
            I'm always open to face new challenges and to learn new things.
          </p>
        </article>

        <article className="c-about-section">
          <h3 className="is-section-title">Hobbies</h3>
          <p>
            Programming is also a hobby. I like to find answers to my questions and then share my knowledge with other developers.
            <br />
            <br />
            As I'm a curious person, I enjoy watching all sorts of documentaries. Most of them are about history, especially because every time
            I learn something new about what happened in the past, I'm getting a sense of gratitude. It is quite hard to put into words!
            <br />
            <br />
            Because important chapters of my life have been dedicated to football(soccer), I can't leave out sport.
            Doing sports always brings me positive energy.
          </p>
        </article>
      </div>
    </section>
  )
}
