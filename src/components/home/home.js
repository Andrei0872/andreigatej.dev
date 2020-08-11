import React from 'react'
import Img from "gatsby-image"

import './home.css'
import { useStaticQuery } from 'gatsby'

export default function Home() {
  const data = useStaticQuery(graphql`
    query {
      placeholderImage: file(relativePath: { eq: "me.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 300) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `)
  
  return (
    <section id="home" className="c-home">
      <div className="c-home__desc">
        <p>Hello! I'm Andrei Gatej,</p>
        <p>
          a <span className="is-important">Software Developer</span> with a passion for solving problems and learning new things.
        </p>
      </div>
      <div className="c-home__img">
        <Img
          fluid={data.placeholderImage.childImageSharp.fluid}
          title="Hackathon Dec, 2020"
        />
        <div className="c-home__caption">
          <i>Dec 2018 - my very first hackathon</i>
        </div>
      </div>
    </section>
  )
}
