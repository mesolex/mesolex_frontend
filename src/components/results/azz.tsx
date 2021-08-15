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

        {
          !isEmpty(item.categories)
          && <>
            &nbsp;|&nbsp;
            <i>Campo semántico: </i>
            {item.categories.join(', ')}
          </>
        }

        {
          /* TODO: get <vnawa> elements working right */
          !isEmpty(item.non_native_etymologies)
          && <>
            &nbsp;|&nbsp;
            <i>Palabras con elementos no de náhuat: </i>
            {item.non_native_etymologies.map(({ value }) => value).join(', ')}
          </>
        }
      </Card.Header>
      <Card.Body>
        <ol className="search-results-list">
          {
            item.senses.map((sense) => (
              <li>
                <Card.Text>
                  <p>
                    {sense.sense}
                    {
                      !isEmpty(sense.ostentives)
                      && <>
                        &nbsp;({sense.ostentives.join(' ')})
                      </>
                    }
                  </p>
                </Card.Text>
                {
                  sense.examples.map((example) => (
                    <blockquote className="card-text example font-weight-light">
                      <p>
                        {example.original.text}
                        {
                          !isEmpty(example.translation)
                          && <>&nbsp;<i>{example.translation.text}</i></>
                        }
                      </p>
                    </blockquote>
                  ))
                }
              </li>
            ))
          }
        </ol>
      </Card.Body>
    </Card>
  );
};

export default Azz;