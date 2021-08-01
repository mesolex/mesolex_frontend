import fromPairs from 'lodash-es/fromPairs';
import isUndefined from 'lodash-es/isUndefined';
import map from 'lodash-es/map';
import negate from 'lodash-es/negate';

import { FilterableField } from './types';

export const humanReadableFilters = ({
  i,
  operator,
  typeTag,
  filterType,
  vln,
  nahuatOrthography,
  filterableFields,
}: {
  i: number;
  operator: string;
  typeTag: string;
  filterType: string;
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

  const modifiers: Array<string> = [
    vln ? 'NCV' : undefined,
    nahuatOrthography ? 'flex. ort.' : undefined,
  ].filter(negate(isUndefined)) as Array<string>;

  const prefix = i === 0 ? initOpDict[operator] : opDict[operator];
  const typeTagLabel = filterableFieldsDict[typeTag] || 'ítem';
  const filterLabel = filterDict[filterType];
  const modifiersLabel = modifiers.length ? `(${modifiers.join(', ')})` : '';

  return [prefix, typeTagLabel, filterLabel, modifiersLabel].join(' ');
};
