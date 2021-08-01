import * as React from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import find from 'lodash/find';
import map from 'lodash/map';
import some from 'lodash-es/some';

import FilterSelector from './filter-selector';
import { ControlledVocabField, SelectProps, FormSetters, FilterableField } from '../types';

const OperatorSelect = React.forwardRef((props: SelectProps, ref: React.Ref<HTMLSelectElement>) => (
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

interface FieldSelectProps extends SelectProps {
  fields: Array<FilterableField>;
}

const FieldSelect = React.forwardRef((
  props: FieldSelectProps,
  ref: React.Ref<HTMLSelectElement>,
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
  fieldName: string,
  controlledVocabFields: Array<ControlledVocabField>,
): boolean => some(controlledVocabFields, ({ field }) => field === fieldName);

const isTextSearch = (
  fieldName: string,
  searchFields: Array<FilterableField>,
): boolean => some(searchFields, ({ field }) => field === fieldName);


/**
 * When "filter on" changes, it may be necessary to set the value of
 * certain other fields. If the "filter on" has become a controlled vocab
 * field, the "filter" value can only be "is exactly"; if it has
 * become a text search field, it can only be "matches"; etc.
 */
 const propagateFilterOnConditions = (
  filterOn: string,
  controlledVocabFields: Array<ControlledVocabField>,
  searchFields: Array<FilterableField>,
  setFilter: (newValue: string) => void,
): void => {
  if (isControlled(filterOn, controlledVocabFields)) {
    setFilter('exactly_equals');
  }

  if (isTextSearch(filterOn, searchFields)) {
    setFilter('text_search');
  }
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
  deleter,
}: {
  operator: string;
  filterType: string;
  typeTag: string;
  value: string;
  i: number;
  setters: FormSetters;
  controlledVocabFields: Array<ControlledVocabField>;
  filterableFields: Array<FilterableField>;
  searchFields: Array<FilterableField>;
  deleter: () => void;
}) => {
  const controlledVocabFieldItems = (isControlled(typeTag, controlledVocabFields)
    ? (find(controlledVocabFields, ({ field }) => field === typeTag) as ControlledVocabField).items
    : []);

  return (
    <Form.Group>
      <InputGroup>
        <DropdownButton
          as={InputGroup.Prepend}
          variant="outline-primary"
          id="filter-params"
          title={'tbd' /*humanReadableFilters({
            i,
            operator,
            typeTag,
            filterType,
            filterableFields: props.filterableFields,
          })*/}
        >
          {
            i !== 0
              ? (
                <Dropdown.Item
                  as={OperatorSelect}
                  onChange={(event: any): void => setters.operator(event.target.value)}
                  value={operator}
                />
              )
              : null
          }

          <Dropdown.Item
            as={FieldSelect}
            fields={filterableFields}
            onChange={(event: any): void => {
              setters.typeTag(event.target.value);
              propagateFilterOnConditions(
                event.target.value,
                controlledVocabFields,
                searchFields,
                setters.typeTag,
              );
            }}
            value={typeTag}
          />

          {/* TODO: add control and search determination */}
          <Dropdown.Item
            as={FilterSelector}
            controlled={isControlled(typeTag, controlledVocabFields)}
            onChange={(event: any): void => setters.filterType(event.target.value)}
            textSearch={isTextSearch(typeTag, searchFields)}
            value={filterType}
          />

          {/* { map(extra, (value, key) => (
            <Dropdown.Item
              key={key}
              as={Form.Check}
              checked={value}
              disabled={applyConstraints({
                filter,
                extraFields: props.extraFields,
                extraFieldKey: key,
              })}
              label={labelForExtraField(props.extraFields, key)}
              onChange={(event): void => {
                setExtra((prevExtra) => ({
                  ...prevExtra,
                  [key]: event.target.checked,
                }));
              }}
            />
          ))} */}
        </DropdownButton>

        {
          isControlled(typeTag, controlledVocabFields)
            ? (
              <Form.Control
                as="select"
                custom
                name={`form-${i}-query_string`}
                onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setters.value(event.target.value)}
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
                placeholder={'Ingrese la consulta aquí'}
                name={`form-${i}-query_string`}
                onChange={(event): void => setters.value(event.target.value)}
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

      {/* {<HiddenInputs
        i={props.index}
        filter={filter}
        filterOn={filterOn}
        operator={operator}
        extra={extra}
      />} */}
    </Form.Group>
  );
};

export default QueryForm;