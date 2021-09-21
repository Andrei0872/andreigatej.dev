/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import './layout.css';

import Header from "../header/"
import Footer from "../footer/footer";
import SEO from "../seo";

const links = [
  { name: 'Home', href: '/' },
  { name: 'Work', href: '/#work' },
  { name: 'About', href: '/#about' },
  { name: 'Resume', href: 'https://andreigatej.dev/resume.pdf', external: true },
];

const Layout = ({ children }) => {
  return (
    <>
      <SEO title="Andrei Gătej" />
      <Header siteTitle="Andrei Gătej" links={links} />
      <main className="c-main">{children}</main>
      <Footer />
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
