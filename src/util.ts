import fromPairs from 'lodash-es/fromPairs';
import map from 'lodash-es/map';
import reduce from 'lodash-es/reduce';

import { FilterableField } from './types';

export const humanReadableFilters = ({
  i,
  operator,
  filterOn,
  filter,
  vln,
  nahuatOrthography,
  filterableFields,
}: {
  i: number;
  operator: string;
  filterOn: string;
  filter: string;
  vln?: boolean;
  nahuatOrthography?: boolean;
  filterableFields: Array<FilterableField>;
}): string => {
  const initOpDict = {
    and: '',
    and_n: 'no',
    or: '',
    or_n: 'no',
  };

  const opDict = {
    and: 'y',
    or: 'o',
    and_n: 'y no',
    or_n: 'o no',
  };

  const filterDict = {
    begins_with: 'empieza con',
    ends_with: 'termina con',
    contains: 'contiene secuencia',
    contains_word: 'contiene palabra',
    exactly_equals: 'es exactamente igual a',
    regex: 'coincide con expresión regular',
    text_search: 'coincide con',
  };

  const filterableFieldsDict: { [fieldName: string]: string } = fromPairs(
    map(filterableFields, ({ field, label }) => [field, label]),
  );

  const modifiers: Array<string> = reduce(
    [
      [vln, 'NCV'],
      [nahuatOrthography, 'flex. ort.'],
    ],
    (acc, [val, repr]) => (val ? acc.concat(repr) : acc),
    [],
  );

  const prefix = i === 0 ? initOpDict[operator] : opDict[operator];
  const filterOnLabel = filterableFieldsDict[filterOn] || 'ítem';
  const filterLabel = filterDict[filter];
  const modifiersLabel = modifiers.length ? `(${modifiers.join(', ')})` : '';

  return [prefix, filterOnLabel, filterLabel, modifiersLabel].join(' ');
};
