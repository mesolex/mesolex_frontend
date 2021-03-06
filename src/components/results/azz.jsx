import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import AudioPlayer from './audio-player';
import Card from 'react-bootstrap/Card';

const safe = (text) => (
  <span dangerouslySetInnerHTML={{__html: text}} />
);

const Azz = ({
  item,
}) => {
  return (
    <Card className="mb-4">
      <Card.Header>
        <span className="h5">
          { item.headword }
        </span>

        {
          !isEmpty(item.media)
          && item.media.map(({ url }, i) => (
            <AudioPlayer
              key={`media_${item.headword}_${i}`}
              src={url}
            />
          ))
        }

        {
          !isEmpty(item.citation_forms)
          && <>
            &nbsp;|&nbsp;
            <i>Citación: </i>
            {safe(item.citation_forms.join(', '))}
            {!isEmpty(item.variant_forms) && '; '}
            {!(isEmpty(item.glosses) && isEmpty(item.variant_forms)) && ', '}
          </>
        }
        {
          !isEmpty(item.variant_forms)
          && <>
            <i>Formas alt.: </i>
            {safe(item.variant_forms.join(', '))}
            {!isEmpty(item.glosses) && '; '}
          </>
        }
        {
          !isEmpty(item.glosses)
          && <>
            <i>Glosa: </i>
            {safe(item.glosses.join(', '))}
          </>
        }

        {
          /* TODO: get this set up with proper inflectional type search linking */
          !isEmpty(item.grammar_groups)
          && <>
            &nbsp;|&nbsp;
            <i>Categoría gramatical: </i>
            {safe(item.grammar_groups.map(({ part_of_speech }) => part_of_speech).join(', '))}
          </>
        }

        {
          !isEmpty(item.categories)
          && <>
            &nbsp;|&nbsp;
            <i>Campo semántico: </i>
            {safe(item.categories.join(', '))}
          </>
        }

        {
          /* TODO: get <vnawa> elements working right */
          !isEmpty(item.non_native_etymologies)
          && <>
            &nbsp;|&nbsp;
            <i>Palabras con elementos no de náhuat: </i>
            {safe(item.non_native_etymologies.map(({ value }) => value).join(', '))}
          </>
        }
      </Card.Header>

      {
        !isEmpty(item.senses)
        && (
          <Card.Body>
            <ol className="search-results-list">
              {
                item.senses.map((sense) => (
                  <li>
                    <Card.Text>
                      <p>
                        {safe(sense.sense)}
                        {
                          !isEmpty(sense.ostentives)
                          && <>
                            &nbsp;({safe(sense.ostentives.join(' '))})
                          </>
                        }
                      </p>
                    </Card.Text>
                    {
                      sense.examples.map((example) => (
                        <blockquote className="card-text example font-weight-light">
                          <p>
                            {safe(example.original.text)}
                            {
                              !isEmpty(example.translation)
                              && <>&nbsp;<i>{safe(example.translation.text)}</i></>
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
        )
      }

      {
        !isEmpty(item.notes)
        && (
          <Card.Footer>
            {
              item.notes.map((note) => {
                switch (note.note_type) {
                  case 'semantics':
                    return <div><strong>Notas semánticas: </strong>{ safe(note.text) }</div>
                  case 'morphology':
                    return <div><strong>Notas morfológicas: </strong>{ safe(note.text) }</div>
                  case 'note':
                    return <div><strong>Notas gramaticales: </strong>{ safe(note.text) }</div>
                  default:
                    return null;
                }
              })
            }
          </Card.Footer>
        )
      }
    </Card>
  );
};

export default Azz;
