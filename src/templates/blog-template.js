import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"

import './blog-template.css'

export default function Template({ data, }) {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  
  return (
    <Layout>
      <div className="c-blog-post">
        <h1 className="c-blog-post__title">{frontmatter.title}</h1>

        <Link className="h-base-link c-blog-post__back" to="/blog">Back to Blog</Link>

        <div className="c-blog-post__content" dangerouslySetInnerHTML={{ __html: html }}></div>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        slug
        title
      }
    }
  }
`