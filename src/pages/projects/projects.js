import React from 'react'
import Layout from '../../components/layout'

import './project.css'
import { graphql, useStaticQuery } from 'gatsby'
import Tag from '../../components/tag/'

import CommonPagesLayout from '../../components/common-pages-layout/common-pages-layout'


export default function Projects(props) {  
  const { projects: { nodes: projects } } = useStaticQuery(graphql`
    query FetchProjects {
      projects: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/projects/"}}, sort: {order: DESC, fields: frontmatter___date}) {
        totalCount
        nodes {
          fileAbsolutePath
          frontmatter {
            title
            tags
            slug
          }
          html
        }
      }
    }
  `
  );

  if (props.location.hash) {
    setTimeout(() => {
      const elem = document.querySelector(props.location.hash)

      elem && elem.scrollIntoView();
    }, 0);
  }

  return (
    <Layout>
      <CommonPagesLayout title="Projects">
        {
          projects.map(proj => (
            <article id={proj.frontmatter.slug.slice(proj.frontmatter.slug.indexOf('#') + 1)} key={proj.frontmatter.title} className="c-project">
              <div className="c-project__header">
                <h2 className="c-project__title">{proj.frontmatter.title}</h2>
                <div className="c-project__tags">
                  {
                    proj.frontmatter.tags && 
                    proj.frontmatter.tags.map(t => (
                      <Tag key={t} className={`c-project__tag ${t === 'contribution' ? 'c-project__tag--important' : ''}`}>{t}</Tag>    
                    ))
                  }
                </div>
              </div>
              <div className="c-project__content">
                <p 
                  dangerouslySetInnerHTML={{ 
                    __html: proj.html
                      .replace(/<(a|strong)/g, (_, match) => `<${match} class="${match === 'a' ? "is-link" : "is-important" }"`)
                  }}
                  className="c-project__desc-content"
                ></p>
              </div>
            </article>
            ))
          }
      </CommonPagesLayout>
    </Layout>
  )
}