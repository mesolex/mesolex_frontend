import * as React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

const Header = ({ siteTitle }) => (
  <Navbar bg="dark" variant="dark">
    <Container>
      <Navbar.Brand href="/">
        {siteTitle}
      </Navbar.Brand>
    </Container>
  </Navbar>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
