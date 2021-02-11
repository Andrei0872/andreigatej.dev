import React from 'react'

import { faStackOverflow, faTwitter, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

import './footer.css'

const contacts = [
  { icon: <FontAwesomeIcon size="2x" icon={faEnvelope} />, href: 'mailto:andreigtj01@gmail.com' },
  { icon: <FontAwesomeIcon size="2x" icon={faTwitter} />, href: 'https://twitter.com/anduser96' },
  { icon: <FontAwesomeIcon size="2x" icon={faGithub} />, href: 'https://github.com/Andrei0872' },
  { icon: <FontAwesomeIcon size="2x" icon={faLinkedin} />, href: 'https://www.linkedin.com/in/andrei-g%C4%83tej-808095193/' },
  { icon: <FontAwesomeIcon size="2x" icon={faStackOverflow} />, href: 'https://stackoverflow.com/users/9632621/andrei-g%c4%83tej?tab=profile' },
];

export default function Footer() {
  return (
    <footer id="contact" className="c-footer">
      <div className="c-footer__content">
        <ul className="c-footer__contacts">
          {
            contacts.map((c, i) => (
              <li key={i} className="c-footer__contact">
                <a className="h-base-link" href={c.href} { ...i > 0 && { target: '_blank' } }>{c.icon}</a>
              </li>
            ))
          }
        </ul>
      </div>
    </footer>
  )
}
