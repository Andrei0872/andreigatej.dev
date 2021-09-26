import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"

import './blog-template.css';

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

        <div
          className="c-blog-post__content"
          dangerouslySetInnerHTML={{
            // __html: html.replace(/<(a(?![^>]+?href="#)|strong)/g, (_, match) => `<${match} class="${match === 'a' ? "is-link" : "is-important"}"`)
            __html: html
              .replace(/<(a(?=[^>]+?(?<!.*class.*)href="(#|https)(?![^>]+?class[^>]+?))|strong)/g, (_, match) => `<${match} class="${match === 'a' ? "is-link" : "is-important"}"`)
              
              // The `prismjs` plugin appends & prepends some identification symbols to `href`s and `id`s too.
              // There RegExps are to extract the actual id from the modifications that `prismjs` does.
              .replace(/<a[^>]+?href="#([^>]+)?code-classlanguage-text([^>]+?)code([^>"]{0,})"/g, (_, beforeFragment = '', realFragment, afterFragment = '') => `<a href="#${beforeFragment}${realFragment}${afterFragment}"`)
              .replace(/<(h[1-6])[^>]+?id="([^>]+)?code-classlanguage-text([^>]+?)code([^>"]{0,})"/g, (_, headingTag, beforeId = '', readId, afterId = '') => `<${headingTag} id="${beforeId}${readId}${afterId}"`)
          }}
        ></div>
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