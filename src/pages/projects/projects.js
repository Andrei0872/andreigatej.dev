import React from 'react'
import Layout from '../../components/layout'
import Img from "gatsby-image"

import './projects.css'
import './project.css'
import { Link, useStaticQuery } from 'gatsby'

export default function Projects() {
  const data = useStaticQuery(graphql`
    query {
      placeholderImage: file(relativePath: { eq: "nir1.png" }) {
        childImageSharp {
          fluid(maxWidth: 1500, quality: 100) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `)
  
  return (
    <Layout>
      <div className="c-projects">
        <div className="c-projects__header">
          <h1 className="c-projects__title">Projects</h1>
          <Link className="c-projects__back" to="/#work">Work section</Link>
        </div>

        <div className="c-projects__content">
          <article className="c-project">
            <div className="c-project__header">
              <h2 className="c-project__title">Project title</h2>
              <div className="c-project__tags">
                <div className="c-project__tag">tag1</div>
                <div className="c-project__tag">tag1</div>
                <div className="c-project__tag">tag1</div>
              </div>
            </div>

            <div className="c-project__image">image here</div>

            <div className="c-project__content">
              <h3 className="c-project__desc-title">Description</h3>
              <p className="c-project__desc-content">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam, assumenda.</p>
            </div>
          </article>
        </div>
      </div>
    </Layout>
  )
}
