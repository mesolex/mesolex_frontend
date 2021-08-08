import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import Card from 'react-bootstrap/card';

const Azz = ({
  item,
}: {
  item: any;
}) => {
  return (
    <Card className="mb-4">
      <Card.Header>
        <span className="h5">
          { item.headword }
        </span>

        {
          !isEmpty(item.citation_forms)
          && <>
            &nbsp;|&nbsp;
            <i>Citación: </i>
            {item.citation_forms.join(', ')}
            {!isEmpty(item.variant_forms) && '; '}
          </>
        }
        {
          !isEmpty(item.variant_forms)
          && <>
            <i>Formas alt.: </i>
            {item.variant_forms.join(', ')}
            {!isEmpty(item.glosses) && '; '}
          </>
        }
        {
          !isEmpty(item.glosses)
          && <>
            <i>Glosa: </i>
            {item.glosses.join(', ')}
          </>
        }

        {
          /* TODO: get this set up with proper inflectional type search linking */
          !isEmpty(item.grammar_groups)
          && <>
            &nbsp;|&nbsp;
            <i>Categoría gramatical: </i>
            {item.grammar_groups.map(({ part_of_speech }) => part_of_speech).join(', ')}
          </>
        }
      </Card.Header>
    </Card>
  );
};

export default Azz;
