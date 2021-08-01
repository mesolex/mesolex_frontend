import * as React from 'react';

import Form from 'react-bootstrap/Form';

import { SelectProps } from '../types';

interface FilterSelectorProps extends SelectProps {
  controlled: boolean;
  textSearch: boolean;
}

const FilterSelector = React.forwardRef((
  props: FilterSelectorProps,
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
    {props.controlled || props.textSearch ? null : <option value="begins_with">empieza con</option>}
    {props.controlled || props.textSearch ? null : <option value="ends_with">termina con</option>}
    {props.controlled || props.textSearch ? null : <option value="contains">contiene secuencia</option>}
    {props.controlled || props.textSearch ? null : <option value="contains_word">contiene palabra</option>}
    {props.textSearch ? null : <option value="exactly_equals">es exactamente igual a</option>}
    {props.controlled || props.textSearch ? null : <option value="regex">expresión regular</option>}
    {props.textSearch ? <option value="text_search">coincide con</option> : null}
  </Form.Control>
));

export default FilterSelector;
