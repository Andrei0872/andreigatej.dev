import { graphql, navigate, useStaticQuery } from 'gatsby'
import React from 'react'
import CommonPagesLayout from '../../components/common-pages-layout/common-pages-layout';
import Layout from '../../components/layout';

import './my-dev-notes.css';

export default function MyDevNotes() {
  const { myDevNotes: { nodes: myDevNotes } } = useStaticQuery(graphql`
    query FetchMyDevNotes {
      myDevNotes: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/my-dev-notes/"}}, sort: {order: DESC, fields: frontmatter___date}) {
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

  return (
    <Layout>
      <CommonPagesLayout title="My Dev notes">
        <div className="c-notes-container">
          {
            myDevNotes.map(
              n => <div className="c-note" onClick={() => navigate(n.frontmatter.slug)} key={n.frontmatter.title}>
                {n.frontmatter.title}
              </div>
            )
          }
        </div>
      </CommonPagesLayout>
    </Layout>
  )
}
