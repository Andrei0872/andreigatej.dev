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
import MenuOverlay from "../menu-overlay/menu-overlay";
import Footer from "../footer/footer";
import SEO from "../seo";

const links = [
  { name: 'Home', href: '/' },
  { name: 'Work', href: '/#work' },
  { name: 'About', href: '/#about' },
  { name: 'Contact', href: '/#contact' },
];

const Layout = ({ children }) => {
  const [isOverlayOpened, setOverlayStatus] = React.useState(false);

  const toggleOverlay = () => setOverlayStatus(!isOverlayOpened);
  
  return (
    <>
      <SEO title="Andrei Gatej" />
      <MenuOverlay isOpened={isOverlayOpened} toggleOverlay={toggleOverlay} links={links} />
      <Header siteTitle="Andrei Gatej" isActive={isOverlayOpened} links={links} toggleOverlay={toggleOverlay} />
      <main className="c-main">{children}</main>
      <Footer />
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
