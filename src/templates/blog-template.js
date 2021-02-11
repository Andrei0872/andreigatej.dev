import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import { defineCustomElements as deckDeckGoHighlightElement } from '@deckdeckgo/highlight-code/dist/loader';

import './blog-template.css';

deckDeckGoHighlightElement();

export default function Template({ data, }) {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  
  const parentPath = frontmatter.slug.slice(0, frontmatter.slug.indexOf('/', 1));
  
  return (
    <Layout>
      <div className="c-blog-post">
        <h1 className="c-blog-post__title">{frontmatter.title}</h1>

        <Link className="h-base-link c-blog-post__back" to={parentPath}>Back to {frontmatter.parent || 'Blog'}</Link>

        {parentPath.includes('blog') ? <div className="c-blog-post__date">Published on {new Date(frontmatter.date).toLocaleDateString()}</div> : null}

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
        parent
        date
      }
    }
  }
`