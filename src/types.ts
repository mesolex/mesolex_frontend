interface ControlledVocabFieldItem {
  label: string;
  value: string;
}

export interface ControlledVocabField {
  field: string;
  items: Array<ControlledVocabFieldItem>;
}

// export interface FilterableField {
//   field: string;
//   label: string;
//   terms: Array<string>;
//   user_languages?: Array<string>;
// }

export interface FilterableField {
  field: string;
  label: string;
  tag: string;
  length: string;
  items?: Array<ControlledVocabFieldItem>;
}

export interface ExtraField {
  field: string;
  label: string;
  constraints?: Array<string>;
}

export interface QueryFormData {
  typeTag: string;
  filterType: string;
  operator: string;
  value: string;
  key: string;
}

export interface SelectProps {
  onChange: (event: React.ChangeEvent) => void;
  value: string;
}

export interface GlobalFilter {
  field: string;
  label: string;
}

export interface Dataset {
  label: string;
  code: string;
  extra_fields: Array<ExtraField>;
  global_filters: Array<GlobalFilter>;
  filterable_fields: Array<FilterableField>;
}

export interface FormSetters {
  typeTag: (newValue: string) => void;
  filterType: (newValue: string) => void;
  operator: (newValue: string) => void;
  value: (newValue: string) => void;
}

// interface Modifier {
//   name: string;
// }
export interface ApiQueryComponent {
  type_tag: string;
  filter_type: string;
  value: string;
  exclude: boolean;
  // modifiers: Array<Modifier>;
}

export interface ApiQuery {
  pageSize?: number;
  page?: number;
  dataset: string;
  query: Array<Array<ApiQueryComponent>>
  // globalModifiers ...
}

export interface SearchResults {
  page: number;
  data: Array<object>;
}