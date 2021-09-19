import * as React from 'react';
import { useMemo, useState } from 'react';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';

import axios from 'axios';

import dropWhile from 'lodash/dropWhile';
import fromPairs from 'lodash/fromPairs';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import pick from 'lodash/pick';
import takeWhile from 'lodash/takeWhile';
import toPairs from 'lodash/toPairs';
import uniqueId from 'lodash/uniqueId';

import QueryForm from './query-form';
import Results from './results';
import { DEFAULT_FILTER_TYPE } from '../constants';

/**
 * Returns a derived setter for an individual form within the state.
 *
 * @param key - The key of the form to be updated
 * @param forms - Array of forms from state
 * @param setForms - Form state setter
 */
const setFormFor = (
  key,
  forms,
  setForms,
) => (newForm) =>
setForms(forms.map(form =>
  form.key === key ? {
    ...form,
    ...newForm,
  } : form))

/**
 * Convenience function for a one-field derived setter for a particular
 * form within the state. Used to update individual fields, e.g. to
 * set the search value to "foo".
 * 
 * @param k - The keyword of the parameter to be updated in the form
 * @param key - The key of the form to be updated
 * @param forms - Array of forms from state
 * @param setForms - Form state setter
 * @returns 
 */
const formSetterFor = (
  k,
  key,
  forms,
  setForms,
) => {
  const setForm = setFormFor(key, forms, setForms);
  return (newValue) =>
    setForm({ [k]: newValue });
}

const defaultForDataset = (dataset) => {
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
}) => (
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

const GlobalFilters = (props) => (
  <Form.Group>
    { props.globalFiltersDataset.map(({ field, label }, i) => (
      <Form.Check
        key={i}
        checked={props.globalFilters[field]}
        label={label}
        name={field}
        onChange={(event) => {
          props.setGlobalFilters((prevGlobalFilters) => ({
            ...prevGlobalFilters,
            [field]: event.target.checked,
          }));
        }}
      />
    )) }
  </Form.Group>
);

const groupForms = (acc, forms) => {
  if (isEmpty(forms)) {
    return acc;
  }

  const [head, ...tail] = forms;
  const nextConjunctGroup = takeWhile(tail, (form) => form.operator === 'and' || form.operator === 'and_n');
  const nextRest = dropWhile(tail, (form) => form.operator === 'and' || form.operator === 'and_n');

  return groupForms(
    [ ...acc, [ head, ...nextConjunctGroup ]],
    nextRest,
  );
};

const formToApiQuery = (dataset) => (form) => {
  const {
    typeTag,
    filterType,
    operator,
    value,
  } = form;

  const modifiers = dataset.extra_fields
    .filter(({ field }) => form[field])
    .map(({ field }) => ({ name: field }));

  return {
    type_tag: typeTag,
    filter_type: filterType,
    value,
    exclude: operator === 'and_n' || operator === 'or_n',
    modifiers,
  };
};

const formsToQuery = (
  dataset,
  forms,
  globalFilters,
) => {
  const groupedForms = groupForms([], forms.filter(form => form.value !== ''));

  // const globalModifiers = keys(globalFilters).map(key => ({ name: key }));
  const globalModifiers = toPairs(globalFilters)
    .filter(([ k, v ]) => v)
    .map(([ k, v]) => ({ name: k}));

  return {
    dataset: dataset.code,
    query: groupedForms.map(group => group.map(formToApiQuery(dataset))),
    global_modifiers: globalModifiers,
  }; 
};

const QueryComposer = ({ dataset }) => {
  const [searchInProgress, setSearchInProgress] = useState(false);
  const [results, setResults] = useState(null);

  const defaultFilter = useMemo(() => defaultForDataset(dataset), [dataset]);
  const [forms, setForms] = useState([
    { ...defaultFilter, key: uniqueId() },
  ]);
  const [globalFilters, setGlobalFilters] = useState(
    fromPairs(dataset.global_filters.map(({ field, label }) => [field, false])),
  );

  const formSetters = useMemo(
    () => forms.map(({ key }) => Object.assign(
      {
        operator: formSetterFor('operator', key, forms, setForms),
        filterType: formSetterFor('filterType', key, forms, setForms),
        typeTag: formSetterFor('typeTag', key, forms, setForms),
        value: formSetterFor('value', key, forms, setForms),
        form: setFormFor(key, forms, setForms),
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
  );

  const searchFields = useMemo(
    () => dataset.filterable_fields.filter(field => field.length === 'long'),
    [dataset],
  );

  const searchForData = useMemo(
    () => {
      return async (data) => {
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

  const onSubmit = () => searchForData(formsToQuery(dataset, forms, globalFilters));

  const nextPage = () => {
    if (!results) {
      return;
    }

    const data = {
      ...formsToQuery(dataset, forms, globalFilters),
      page: results.page + 1,
    };

    searchForData(data);
  };

  const prevPage = () => {
    if (!results) {
      return;
    }

    const data = {
      ...formsToQuery(dataset, forms, globalFilters),
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

      <GlobalFilters
        globalFiltersDataset={dataset.global_filters}
        globalFilters={globalFilters}
        setGlobalFilters={setGlobalFilters}
      />

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