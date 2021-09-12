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
  [modifier_key: string]: string | boolean;
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
  form: (newForm: any) => void;
}

export interface Modifier {
  name: string;
}
export interface ApiQueryComponent {
  type_tag: string;
  filter_type: string;
  value: string;
  exclude: boolean;
  modifiers: Array<Modifier>;
}

export interface ApiQuery {
  pageSize?: number;
  page?: number;
  dataset: string;
  query: Array<Array<ApiQueryComponent>>;
  global_modifiers: Array<Modifier>;
}

export interface SearchResults {
  page: number;
  data: Array<object>;
  total: number;
  pageSize: number;
}