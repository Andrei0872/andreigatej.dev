import React from 'react'
import Layout from '../../components/layout'

import './projects.css'
import './project.css'
import { Link, graphql, useStaticQuery } from 'gatsby'
import Tag from '../../components/tag/'

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default function Projects() {  
  const { projects: { nodes: projects } } = useStaticQuery(graphql`
    query FetchProjects {
      projects: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/projects/"}}, sort: {order: ASC, fields: frontmatter___order}) {
        totalCount
        nodes {
          fileAbsolutePath
          frontmatter {
            title
            tags
          }
          html
        }
      }
    }
  `
  );

  return (
    <Layout>
      <div className="c-projects">
        <div className="c-projects__header">
          <h1 className="c-projects__title">Projects</h1>
          <Link className="c-projects__back h-base-link" to="/#work">
            < FontAwesomeIcon icon={faArrowLeft} /> Work section
          </Link>
        </div>
        
        <div className="c-projects__content">
          {
            projects.map(proj => (
              <article className="c-project">
                <div className="c-project__header">
                  <h2 className="c-project__title">{proj.frontmatter.title}</h2>
                  <div className="c-project__tags">
                    {
                      proj.frontmatter.tags && 
                      proj.frontmatter.tags.map(t => (
                        <Tag className={`c-project__tag ${t === 'contribution' ? 'c-project__tag--important' : ''}`}>{t}</Tag>    
                      ))
                    }
                  </div>
                </div>

                <div className="c-project__content">
                  <h3 className="c-project__desc-title">Description</h3>
                  <p dangerouslySetInnerHTML={{ __html: proj.html }} className="c-project__desc-content"></p>
                </div>
              </article>
            ))
          }
        </div>
      </div>
    </Layout>
  )
}