import React, { useRef } from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"

import './blog-template.css';

export default function Template({ data, }) {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  const parentPath = frontmatter.slug.slice(0, frontmatter.slug.indexOf('/', 1));
  
  const ref = useRef();

  const checkBackToTop = ({ target }) => {
    if (target.dataset.src !== 'back-to-top') {
      return;
    }

    ref.current.scrollIntoView(false);
  };

  return (
    <Layout>
      <button onClick={checkBackToTop} className="back-to-top" data-src="back-to-top">Back to top</button>

      <div className="c-blog-post">
        <h1 ref={ref} className="c-blog-post__title">{frontmatter.title}</h1>

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
              // .replace(/<h2[^>]{0,}>/g, fullMatch => `${fullMatch}<button data-src="back-to-top">Back to top</button>`)
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
        part
        date
      }
    }
  }
`