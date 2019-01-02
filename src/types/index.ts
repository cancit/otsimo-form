export interface BaseFormSchema {
  key: string;
  title: string;
  description?: string;
  format?: string;
}

export type FormType = GeneralFormSchema | SelectFormSchema | ParentFormSchema;

export interface Validator {
  regex: string;
  min: number;
  max: number;
  minLength: number;
  maxLength: number;
}

export interface GeneralFormSchema extends BaseFormSchema {
  readonly?: boolean;
  hasDynamicSource?: boolean;
  type: "stringMap" | "stringArray" | "color";
  children?: FormType[];
}
export interface TextFormSchema extends BaseFormSchema {
  readonly?: boolean;
  hasDynamicSource?: boolean;
  type: "string" | "number";
  validator: Validator;
  children?: FormType[];
}
export interface ParentFormSchema extends BaseFormSchema {
  isArray?: boolean;
  type: "parent";
  children?: FormType[];
}
export interface SelectFormSchema extends BaseFormSchema {
  multiple?: boolean;
  hasDynamicSource?: boolean;
  placeholder?: string;
  possibleValues: { key: string; value: string }[];
  type: "select";
}
