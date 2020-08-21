import React from 'react'
import Layout from '../../components/layout'
import Tag from '../../components/tag/'

import './blog.css'
import './article.css'
import CommonPagesLayout from '../../components/common-pages-layout/common-pages-layout';
import { graphql, useStaticQuery, navigate } from 'gatsby'

const isPublished = ({ frontmatter: { published } }) => published === true

const navigateToArticle = ({ slug, publication }) => publication ? window.open(publication) : navigate(slug)

const hasPostAllActiveTags = (activeTags, post) => 
  activeTags[allTagsKey] || Object.keys(activeTags).every(k => !activeTags[k] || post.frontmatter.tags.includes(k))

const allTagsKey = 'all tags';
const indepthDevKey = 'publication: inDepth.dev';

export default function Blog() {
  const { blog: { nodes: articles } } = useStaticQuery(graphql`
    query FetchBlog {
      blog: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/blog/"}}, sort: {order: DESC, fields: frontmatter___date}) {
        totalCount
        nodes {
          fileAbsolutePath
          frontmatter {
            title
            tags
            published
            slug
            publication
          }
          html
        }
      }
    }
  `
  );
  
  const [activeTags, setActiveTags] = React.useState({ [allTagsKey]: true });

  const toggleTag = tag => {
    setActiveTags(tags => {
      if (tag === allTagsKey) {
        return activeTags[tag] ? tags : { [allTagsKey]: true }
      }

      if (Object.keys(tags).length === 1 && tags[tag]) {
        return { [allTagsKey]: true }
      }

      const {[allTagsKey]: _, [tag]: crtTag, ...rest} = tags;

      return {
        ...rest,
        ...!crtTag &&  { [tag]: true }
      }
    });
  }

  const filteredArticles =  articles.filter(isPublished).filter(hasPostAllActiveTags.bind(null, activeTags))
  const noArticles = <h2 style={{ textAlign: 'center', marginTop: '5rem' }}>No articles available</h2>;
  
  let tags = new Set([allTagsKey, indepthDevKey]);
  filteredArticles.forEach(({ frontmatter: { tags: t } }) => (tags = new Set([...tags, ...t])));

  return (
    <Layout>
      <CommonPagesLayout title="Blog">
        <div className="c-tags-container">
          {
            [...tags].map(t => (
              <Tag 
                onClick={toggleTag.bind(null, t)}
                key={t} 
                className={`c-tags-container__tag ${activeTags[t] ? 'is-active' : ''}`}
              >
                {t}
              </Tag>
            ))
          }
        </div>

        {
         filteredArticles.length
            && filteredArticles
              .map(a => (
                <article onClick={navigateToArticle.bind(null, a.frontmatter)} key={a.frontmatter.title} className="c-article">
                  <div className="c-article__title">{a.frontmatter.title}</div>
                  <div className="c-article__tags">
                    {
                      a.frontmatter.tags.map(t => (
                        <Tag key={t} className="c-article__tag">{t}</Tag>
                      ))
                    }
                  </div>
                </article>
              ))
          || noArticles
        }
      </CommonPagesLayout>
    </Layout>
  )
}