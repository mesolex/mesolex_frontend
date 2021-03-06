import * as React from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import find from 'lodash/find';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import some from 'lodash-es/some';

import FilterSelector from './filter-selector';
import { humanReadableFilters } from '../util';

/**
 * Certain extra fields cannot be activated if certain values
 * are present in the form. For example, "neutralize vowel length"
 * cannot be active if the filter is in regular expression mode.
 *
 * This simple function returns `true` if any of the contraints
 * apply. Otherwise it returns `false`.
 */
 const applyConstraints = ({
  filterType,
  extraFields,
  extraFieldKey,
}) => {
  const config = find(extraFields, ({ field }) => field === extraFieldKey);

  if (isEmpty(config) || config === undefined) {
    return false;
  }

  const { constraints } = config;

  if (includes(constraints, 'no_regex') && filterType === 'regex') {
    return true;
  }

  return false;
};

const OperatorSelect = React.forwardRef((props, ref) => (
  <Form.Control
    ref={ref}
    as="select"
    className="search-form__filter-selector"
    custom
    onChange={props.onChange}
    value={props.value}
  >
    <option value="and">y</option>
    <option value="or">o</option>
    <option value="and_n">y no</option>
    <option value="or_n">o no</option>
  </Form.Control>
));

const FieldSelect = React.forwardRef((
  props,
  ref,
) => (
  <Form.Control
    ref={ref}
    as="select"
    className="search-form__filter-selector"
    custom
    onChange={props.onChange}
    value={props.value}
  >
    {
      map(
        props.fields,
        ({ field, label }) => <option value={field} key={field}>{ label }</option>,
      )
    }
  </Form.Control>
));

const isControlled = (
  fieldName,
  controlledVocabFields,
) => some(controlledVocabFields, ({ field }) => field === fieldName);

const isTextSearch = (
  fieldName,
  searchFields,
) => some(searchFields, ({ field }) => field === fieldName);


/**
 * When "filter on" changes, it may be necessary to set the value of
 * certain other fields. If the "filter on" has become a controlled vocab
 * field, the "filter" value can only be "is exactly"; if it has
 * become a text search field, it can only be "matches"; etc.
 */
 const propagatedFilterConditions = (
  filterOn,
  controlledVocabFields,
  searchFields,
) => {
  if (isControlled(filterOn, controlledVocabFields)) {
    return { filterType: 'exactly_equals' };
  }

  if (isTextSearch(filterOn, searchFields)) {
    return { filterType: 'text_search' };
  }

  return {};
};


const QueryForm = ({
  operator,
  filterType,
  typeTag,
  value,
  i,
  setters,
  controlledVocabFields,
  filterableFields,
  searchFields,
  extraFields,
  extraFieldValues,
  deleter,
  onSubmit,
}) => {
  const controlledVocabFieldItems = (isControlled(typeTag, controlledVocabFields)
    ? (find(controlledVocabFields, ({ field }) => field === typeTag)).items
    : []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Form.Group>
        <InputGroup>
          <DropdownButton
            as={InputGroup.Prepend}
            variant="outline-primary"
            id="filter-params"
            title={humanReadableFilters({
              i,
              operator,
              typeTag,
              filterType,
              filterableFields: filterableFields,
            })}
          >
            {
              i !== 0
                ? (
                  <Dropdown.Item
                    as={OperatorSelect}
                    onChange={(event) => setters.operator(event.target.value)}
                    value={operator}
                  />
                )
                : null
            }

            <Dropdown.Item
              as={FieldSelect}
              fields={filterableFields}
              onChange={(event) => {
                setters.form({
                  typeTag: event.target.value,
                  ...propagatedFilterConditions(
                    event.target.value,
                    controlledVocabFields,
                    searchFields,
                  ),
                });
              }}
              value={typeTag}
            />

            {/* TODO: add control and search determination */}
            <Dropdown.Item
              as={FilterSelector}
              controlled={isControlled(typeTag, controlledVocabFields)}
              onChange={(event) => setters.filterType(event.target.value)}
              textSearch={isTextSearch(typeTag, searchFields)}
              value={filterType}
            />

            { extraFields.map(({ field, label }) => (
              <Dropdown.Item
                as={Form.Check}
                checked={extraFieldValues[field]}
                disabled={applyConstraints({
                  filterType,
                  extraFields,
                  extraFieldKey: field,
                })}
                label={label}
                key={label}
                onChange={(event) => setters[field](event.target.checked)}
              />
            ))}
          </DropdownButton>

          {
            isControlled(typeTag, controlledVocabFields)
              ? (
                <Form.Control
                  as="select"
                  custom
                  name={`form-${i}-query_string`}
                  onChange={(event) => setters.value(event.target.value)}
                  value={some(controlledVocabFieldItems, ({ value: v }) => v === value)
                    ? value
                    : controlledVocabFieldItems[0].value}
                >
                  {map(
                    controlledVocabFieldItems,
                    ({ label, value }) => (
                      <option key={label} value={value}>{ label }</option>
                    ),
                  )}
                </Form.Control>
              )
              : (
                <Form.Control
                  placeholder={'Ingrese la consulta aqu??'}
                  name={`form-${i}-query_string`}
                  onChange={(event) => setters.value(event.target.value)}
                  type="text"
                  value={value}
                />
              )
          }

          {
            i !== 0 && (
              <InputGroup.Append>
                <Button
                  onClick={deleter}
                  variant="outline-secondary"
                >
                  <span aria-hidden="true">&times;</span>
                </Button>
              </InputGroup.Append>
            )
          }
        </InputGroup>
      </Form.Group>
    </form>
  );
};

export default QueryForm;