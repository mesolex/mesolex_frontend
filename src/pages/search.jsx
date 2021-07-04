import * as React from 'react';
import { Link } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';

const SearchPage = ({ pageContext }) => {
  const { dataset } = pageContext;

  return (
    <Layout>
      <Seo title={dataset.label} />
      <h1>{dataset.label}</h1>
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  );
};

export default SearchPage;
