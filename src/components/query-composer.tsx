import * as React from 'react';
import { useMemo, useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import uniqueId from 'lodash/uniqueId';

import QueryForm from './query-form';
import { DEFAULT_FILTER_TYPE } from '../constants';

import { Dataset, QueryFormData, ControlledVocabField } from '../types';

const formSetterFor = (
  k: string,
  key: string,
  forms: Array<QueryFormData>,
  setForms: React.Dispatch<React.SetStateAction<Array<QueryFormData>>>,
) => (newValue: string) => setForms(forms.map(form => form.key === key ? { ...form, [k]: newValue } : form))

const defaultForDataset = (dataset: Dataset): QueryFormData => {
  const [ firstFilterableField ] = dataset.filterable_fields;
  return {
    typeTag: firstFilterableField.tag,
    filterType: DEFAULT_FILTER_TYPE,
    operator: 'and',
    value: '',
    key: uniqueId(),
  };
};

const QueryComposer = ({ dataset }: { dataset: Dataset }) => {
  const defaultFilter = useMemo(() => defaultForDataset(dataset), [dataset]);
  const [forms, setForms] = useState([
    { ...defaultFilter, key: uniqueId() } as QueryFormData,
  ]);

  const formSetters = useMemo(
    () => forms.map(({ key }) => ({
      operator: formSetterFor('operator', key, forms, setForms),
      filterType: formSetterFor('filterType', key, forms, setForms),
      typeTag: formSetterFor('typeTag', key, forms, setForms),
      value: formSetterFor('value', key, forms, setForms),
    })),
    [forms],
  );
  const formDeleters = useMemo(
    () => forms.map(({ key }) => () => setForms(forms.filter(form => form.key !== key))),
    [forms],
  );

  const controlledVocabFields = useMemo(
    () => dataset.filterable_fields.filter(field => !isUndefined(field.items)),
    [dataset],
  ) as Array<ControlledVocabField>;

  const searchFields = useMemo(
    () => dataset.filterable_fields.filter(field => field.length === 'long'),
    [dataset],
  );

  return (
    <div>
      {forms.map((form, i) => (
        <QueryForm
          operator={form.operator}
          filterType={form.filterType}
          typeTag={form.typeTag}
          value={form.value}
          i={i}
          setters={formSetters[i]}
          deleter={formDeleters[i]}
          filterableFields={dataset.filterable_fields}
          controlledVocabFields={controlledVocabFields}
          searchFields={searchFields}
        />
      ))}
    </div>
  );
};

export default QueryComposer;