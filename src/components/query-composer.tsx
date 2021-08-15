import * as React from 'react';
import { useMemo, useState } from 'react';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';

import axios from 'axios';

import dropWhile from 'lodash/dropWhile';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import pick from 'lodash/pick';
import takeWhile from 'lodash/takeWhile';
import uniqueId from 'lodash/uniqueId';

import QueryForm from './query-form';
import Results from './results';
import { DEFAULT_FILTER_TYPE } from '../constants';

import {
  ApiQuery,
  ApiQueryComponent,
  ControlledVocabField,
  Dataset,
  QueryFormData,
  SearchResults,
} from '../types';

const formSetterFor = (
  k: string,
  key: string,
  forms: Array<QueryFormData>,
  setForms: React.Dispatch<React.SetStateAction<Array<QueryFormData>>>,
) => (newValue: string) => setForms(forms.map(form => form.key === key ? { ...form, [k]: newValue } : form))

const defaultForDataset = (dataset: Dataset): QueryFormData => {
  const [ firstFilterableField ] = dataset.filterable_fields;
  return Object.assign(
    {
      typeTag: firstFilterableField.tag,
      filterType: DEFAULT_FILTER_TYPE,
      operator: 'and',
      value: '',
      key: uniqueId(),
    },
    ...dataset.extra_fields.map(({ field }) => ({ [field]: false })),
  );
};

const AddRemoveForms = ({
  disabled,
  onAddFilter,
  onSubmit,
}: {
  disabled: boolean;
  onAddFilter: () => void;
  onSubmit: () => Promise<void>;
}): JSX.Element => (
  <Form.Group>
    <Button
      onClick={onAddFilter}
      variant="primary"
    >
      Agregar filtro
    </Button>

    <Button
      disabled={disabled}
      className="float-right"
      type="submit"
      variant="success"
      onClick={onSubmit}
    >
      Buscar
    </Button>
  </Form.Group>
);

const Pagination = ({
  page,
  pageSize,
  total,
  nextPage,
  prevPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  nextPage: () => void;
  prevPage: () => void;
}) => {
  const hasPrev = page > 1;
  const totalPages = Math.ceil(total / pageSize);
  const hasNext = totalPages > page;

  return (
    <>
      <div className="h5 mt-4 mb-3">
        { total } resultados (página { page } de { totalPages })
      </div>
      <ButtonGroup
        className="my-2"
      >
        <Button
          disabled={!hasPrev}
          onClick={prevPage}
        >
          Anterior
        </Button>
        <Button
          disabled={!hasNext}
          onClick={nextPage}
        >
          Siguiente
        </Button>
      </ButtonGroup>
    </>
  );
};

const groupForms = (acc: Array<Array<QueryFormData>>, forms: Array<QueryFormData>): Array<Array<QueryFormData>> => {
  if (isEmpty(forms)) {
    return acc;
  }

  const [head, ...tail] = forms;
  const nextConjunctGroup = takeWhile(tail, (form: QueryFormData) => form.operator === 'and' || form.operator === 'and_n');
  const nextRest = dropWhile(tail, (form: QueryFormData) => form.operator === 'and' || form.operator === 'and_n');

  return groupForms(
    [ ...acc, [ head, ...nextConjunctGroup ]],
    nextRest,
  );
};

const formToApiQuery = (form: QueryFormData): ApiQueryComponent => {
  const {
    typeTag,
    filterType,
    operator,
    value,
  } = form;

  return {
    type_tag: typeTag,
    filter_type: filterType,
    value,
    exclude: operator === 'and_n' || operator === 'or_n',
  };
};

const formsToQuery = (dataset:Dataset, forms: Array<QueryFormData>): ApiQuery => {
  const groupedForms = groupForms([], forms.filter(form => form.value !== ''));

  return {
    dataset: dataset.code,
    query: groupedForms.map(group => group.map(formToApiQuery)),
  };
};

const QueryComposer = ({ dataset }: { dataset: Dataset }) => {
  const [searchInProgress, setSearchInProgress] = useState(false);
  const [results, setResults] = useState(null as SearchResults | null);

  const defaultFilter = useMemo(() => defaultForDataset(dataset), [dataset]);
  const [forms, setForms] = useState([
    { ...defaultFilter, key: uniqueId() } as QueryFormData,
  ]);

  const formSetters = useMemo(
    () => forms.map(({ key }) => Object.assign(
      {
        operator: formSetterFor('operator', key, forms, setForms),
        filterType: formSetterFor('filterType', key, forms, setForms),
        typeTag: formSetterFor('typeTag', key, forms, setForms),
        value: formSetterFor('value', key, forms, setForms),
      },
      ...dataset.extra_fields.map(({ field }) => ({ [field]: formSetterFor(field, key, forms, setForms) })),
    )),
    [dataset, forms],
  );
  const formDeleters = useMemo(
    () => forms.map(({ key }) => () => setForms(forms.filter(form => form.key !== key))),
    [forms],
  );
  const formExtraFieldValues = useMemo(
    () => forms.map(form => pick(form, dataset.extra_fields.map(({ field }) => field))),
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

  const searchForData = useMemo(
    () => {
      return async (data: any) => {
        setSearchInProgress(true);
  
        const response = await axios.post(
          `${process.env.GATSBY_API_HOST}/api/search/`,
          data,
        );
  
        setSearchInProgress(false);
        setResults(response.data);
      };
    },
    [],
  );

  const onSubmit = () => searchForData(formsToQuery(dataset, forms));

  const nextPage = () => {
    if (!results) {
      return;
    }

    const data = {
      ...formsToQuery(dataset, forms),
      page: results.page + 1,
    };

    searchForData(data);
  };

  const prevPage = () => {
    if (!results) {
      return;
    }

    const data = {
      ...formsToQuery(dataset, forms),
      page: results.page - 1,
    };

    searchForData(data);
  };

  return (
    <div>
      {forms.map((form, i) => (
        <QueryForm
          operator={form.operator}
          filterType={form.filterType}
          typeTag={form.typeTag}
          value={form.value}
          i={i}
          key={form.key}
          setters={formSetters[i]}
          deleter={formDeleters[i]}
          filterableFields={dataset.filterable_fields}
          controlledVocabFields={controlledVocabFields}
          searchFields={searchFields}
          extraFields={dataset.extra_fields}
          extraFieldValues={formExtraFieldValues[i]}
          onSubmit={onSubmit}
        />
      ))}

      <AddRemoveForms
        disabled={searchInProgress}
        onAddFilter={() => setForms(forms => [ ...forms, defaultForDataset(dataset) ])}
        onSubmit={onSubmit}
      />

      {
        results
        && (
          <>
            <Pagination
              page={results.page}
              pageSize={results.pageSize}
              total={results.total}
              nextPage={nextPage}
              prevPage={prevPage}
            />
            <Results
              dataset={dataset.code}
              page={results.page}
              data={results.data}
            />
          </>
        )
      }
    </div>
  );
};

export default QueryComposer;