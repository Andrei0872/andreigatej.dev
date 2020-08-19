import React from 'react'
import Layout from '../../components/layout'
import Tag from '../../components/tag/'

import './blog.css'
import './article.css'
import CommonPagesLayout from '../../components/common-pages-layout/common-pages-layout';
import { graphql, useStaticQuery, navigate } from 'gatsby'

const isPublished = ({ frontmatter: { published } }) => published === true

const navigateToArticle = slug => {
  console.log(slug)
  
  navigate(slug)
};


export default function Blog() {
  const { blog: { nodes: articles } } = useStaticQuery(graphql`
    query FetchBlog {
      blog: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/blog/"}}, sort: {order: ASC, fields: frontmatter___order}) {
        totalCount
        nodes {
          fileAbsolutePath
          frontmatter {
            title
            tags
            published
            slug
          }
          html
        }
      }
    }
  `
  );

  
  let tags = new Set(['all tags']);
  articles.forEach(({ frontmatter: { tags: t } }) => (tags = new Set([...tags, ...t])));
    
  return (
    <Layout>
      <CommonPagesLayout title="Blog">
        <div className="c-tags-container">
          {
            [...tags].map((t, i) => (
              <Tag key={i} className="c-tags-container__tag">{t}</Tag>
            ))
          }
        </div>

        {
          articles.filter(isPublished).map((a, i) => (
            <article onClick={navigateToArticle.bind(null, a.frontmatter.slug)} key={i} className="c-article">
              <div className="c-article__title">{a.frontmatter.title}</div>
              <div className="c-article__tags">
                {
                  a.frontmatter.tags.map((t, i) => (
                    <Tag key={i} className="c-article__tag">{t}</Tag>
                  ))
                }
              </div>
            </article>
          ))
        }
      </CommonPagesLayout>
    </Layout>
  )
}