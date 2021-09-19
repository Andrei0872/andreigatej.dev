import React from 'react'

import './work.css'

import { navigate, useStaticQuery, graphql } from 'gatsby';

const sections = [
  { 
    name: <span>Stack Overflow</span>,
    desc: <p>
      I always find pleasure in <b>helping other developers</b>. 
      It is also a great way to <b>improve skills</b> and <b>discover</b> new approaches to all sorts of problems.
    </p>,
    clickHandler: () => window.open('https://stackoverflow.com/users/9632621/andrei-g%c4%83tej?tab=profile'),
    buttonText: 'Stack Overflow profile',
    customClasses: ['is-stackoverflow']
  },
  { 
    name: <span>YouTube Channel</span>,
    desc: <p>
      Sometimes explanations are more efficiently transmitted through videos. I also consider sharing my learnings through YouTube videos to be a good way to improve on
      my communication skills.
    </p>,
    clickHandler: () => window.open('https://www.youtube.com/channel/UCiE1tVkSC8aSk8EtnbbP8NQ'),
    buttonText: 'YouTube Channel',
    customClasses: ['is-youtube']
  },
  { 
    name: <span>Projects</span>,
    desc: <p>
      Undoubtedly, bringing your idea to life is an ineffable feeling.
      Whether it is about a personal project, a company project or an <b>Open Source</b> project, it's a joy to face the challenges involved.
    </p>,
    samples: [],
    clickHandler: () => navigate('/projects'),
    buttonText: 'More projects',
    customClasses: ['is-projects']
  },
  { 
    name: <span>Blog</span>,
    desc: <p>
      My curiosity makes me want to know more about the <b>how</b> and the <b>why</b> behind the tools I'm working with.
      Here I document my journey, share my findings/learnings and much more.
    </p>,
    samples: [],
    clickHandler: () => navigate('/blog'),
    buttonText: 'More articles',
    customClasses: ['is-blog']
  },
  {
    name: <span>My Dev notes</span>,
    desc: <p>
      I like to keep track of my learning journey. Considering the abundance of great material that can be found of the Internet, it's difficult to keep up with everything.
      Here I post things that are worth writing down, from my perspective.
    </p>,
    samples: [],
    clickHandler: () => navigate('/my-dev-notes'),
    buttonText: 'More Dev notes',
    customClasses: ['is-notes']
  },
];

const navigateToArticleOrBlog = ({ slug, publication }) => publication ? window.open(publication) : navigate(slug);

export default function Work() {
  const { 
    projects: { nodes: sampleProjects }, 
    blog: { nodes: sampleArticles },
    myDevNotes: { nodes: sampleNotes },
  } = useStaticQuery(graphql`
    query FetchSamples {
      blog: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/blog/"}, frontmatter: {isSample: {eq: true}}}) {
        totalCount
        nodes {
          fileAbsolutePath
          frontmatter {
            title
            isSample
            slug
            publication
          }
        }
      }
      
      projects: allMarkdownRemark(filter: { fileAbsolutePath:{ regex: "/projects/" }, frontmatter: {isSample: {eq: true}}}) {
        totalCount
        nodes{
          frontmatter {
            title
            isSample
            slug
          }
        }
      }

      myDevNotes: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/my-dev-notes/"}, frontmatter: {isArticleSample: {eq: true}}}) {
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
  `);

  sections[2].samples = sampleProjects;
  sections[3].samples = sampleArticles;
  sections[4].samples = sampleNotes;
  
  return (
    <section id="work" className="c-work">
      <h2 className="c-work__title is-section-title">My Work</h2>

      {
        sections.map(
          s => <div key={s.buttonText} className={["c-work-section",  ...s.customClasses && s.customClasses || []].join(' ') }>
            <h2 className="c-work-section__name">{s.name}</h2>

            <div className="c-work-section__content">
              {s.desc}
              {
                s.samples 
                  ?
                  <div className="c-samples">
                    {
                      s.samples
                        ? s.samples.map(
                          ({ frontmatter: sample }) => <div
                            onClick={() => navigateToArticleOrBlog(sample)}
                            key={sample.title}
                            className="c-samples__sample"
                          >
                            {sample.title}
                          </div>
                        )
                        : null
                    }
                  </div>
                  : null
            }
            </div>

            <button onClick={() => s.clickHandler()} className="c-work-section__button">{s.buttonText}</button>
          </div>
        )
      }
    </section>
  )
}
