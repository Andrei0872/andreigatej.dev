import React from "react"

import Layout from "../components/layout/"
import SEO from "../components/seo"
import Home from "../components/home"
import Work from "../components/work"
import About from "../components/about"

const IndexPage = () => (
  <Layout>
    <SEO title="Andrei Gatej" />
    <Home />
    <Work />
    <About />
  </Layout>
)

export default IndexPage
