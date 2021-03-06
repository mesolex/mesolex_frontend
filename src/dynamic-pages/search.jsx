import * as React from 'react';

import Layout from '../components/layout';
import Seo from '../components/seo';

import QueryComposer from '../components/query-composer';

const SearchPage = ({ pageContext }) => {
  const { dataset } = pageContext;

  return (
    <Layout>
      <Seo title={dataset.label} />
      <h1>{dataset.label}</h1>
 
      <QueryComposer dataset={dataset} />
    </Layout>
  );
};

export default SearchPage;
