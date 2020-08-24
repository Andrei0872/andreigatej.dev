import React from "react"

import Layout from "../components/layout/"
import Home from "../components/home"
import Work from "../components/work"
import About from "../components/about"

const IndexPage = () => (
  <Layout>
    <Home />
    <Work />
    <About />
  </Layout>
)

export default IndexPage
