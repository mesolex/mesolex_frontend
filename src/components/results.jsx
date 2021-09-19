import * as React from 'react';
import { useMemo } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Azz from './results/azz';

const Results = ({
  dataset,
  data,
}) => {
  const ResultComponent = useMemo(
    () => {
      if (dataset === 'azz') {
        return Azz;
      } else {
        return Azz;
      }
    },
    [dataset],
  );

  return (
    <Row>
      <Col>
        {data.map(item => <ResultComponent item={item} />)}
      </Col>
    </Row>
  );
}

export default Results;