import React from 'react'
import Layout from '../../components/layout'

import './project.css'
import { graphql, useStaticQuery } from 'gatsby'
import Tag from '../../components/tag/'
import ImageSlider from '../../components/image-slider'

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

  // const projectsImagesLoader = require.context('/static/projects')
  const projectsImagesPaths = /* projectsImagesLoader.keys() */[];

  return (
    <Layout>
      <CommonPagesLayout title="Projects">
        {
          projects.map(proj => {
            // const { images_dir: imagesDir } = proj.frontmatter;
            const crtProjectImagesPaths = [];/* imagesDir */
              // ? projectsImagesPaths
              //   .filter(p => p.includes(`/${imagesDir}/`))
              //   // `.slice(2)` - getting rid of `./`.
              //   .map(p => require(`/static/projects/${p.slice(2)}`).default)
              // : [];
            
            return (
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
                        .replace(/<(a|strong)/g, (_, match) => `<${match} class="${match === 'a' ? "is-link" : "is-important"}"`)
                    }}
                    className="c-project__desc-content"
                  ></p>
                  <ImageSlider 
                    /* These are the image properties when taking a screenshot using ALT + PRINT SCREEN */
                    imageProps={{ width: 1848, height: 1053 }}
                    imagesPaths={crtProjectImagesPaths}
                  />
                </div>
              </article>
            )
          })
          }
      </CommonPagesLayout>
    </Layout>
  )
}