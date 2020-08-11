import React from 'react'

import './work.css'
import Card from '../card/card'

import { faStackOverflow } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faTasks } from '@fortawesome/free-solid-svg-icons';
import { navigate } from 'gatsby';

const cards = [
  { 
    name: 'Stack Overflow', 
    icon: <FontAwesomeIcon size="2x" icon={faStackOverflow} />, 
    desc: <p>
      I always find pleasure in <b>helping other developers</b>. 
      It is also a great way to <b>improve skills</b> and <b>discover</b> new approaches to all sorts of problems.
    </p>,
    clickHandler: () => window.open('https://stackoverflow.com/users/9632621/andrei-g%c4%83tej?tab=profile'),
  },
  { 
    name: 'Projects', 
    icon: <FontAwesomeIcon size="2x" icon={faTasks} />,
    desc: <p>
      Undoubtedly, bringing your idea to life is an ineffable feeling.
      Whether it is about a personal project, a company project or an <b>Open Source</b> project, it's a joy to face the challenges involved.
    </p>,
    clickHandler: () => navigate('/projects'),
  },
  { 
    name: 'Blog', 
    icon: <FontAwesomeIcon size="2x" icon={faBook} />,
    desc: <p>
      My curiosity makes me want to know more about the <b>how</b> and the <b>why</b> behind the tools I'm working with.
      Here I document my journey, share my findings/learnings and much more.
    </p>,
    clickHandler: () => navigate('/blog'),
  },
];

export default function Work() {
  return (
    <section id="work" className="c-work">
      <h1 className="c-work__title">Work</h1>

      <div className="c-work__cards">
        {
          cards.map((c, i) => (
            <Card
              className="c-work__card"
              key={i}
              title={c.name}
              logo={c.icon}
              content={c.desc}
              onClick={c.clickHandler}
            />
          ))
        }
      </div>
    </section>
  )
}
