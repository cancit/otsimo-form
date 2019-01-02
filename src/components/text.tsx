import * as React from "react";
import TextField from "@material-ui/core/TextField";
import { GeneralFormSchema, TextFormSchema, Validator } from "../types";
export function TextArea(props: {
  formKey: string;
  properties: TextFormSchema;
  number?: boolean;
  value: any;
  onChange: (key: any, value: string | number) => void;
}) {
  const { properties } = props;
  if (properties.readonly && (!props.value || props.value.length === 0)) {
    return null;
  }
  const extraProps = {} as any;
  if (props.number) {
    extraProps.type = "number";
  }
  if (properties.description) {
    extraProps.helperText = properties.description;
  }
  if (properties.validator) {
    console.log("value", props.value);
    const errorText = getErrorText(props.value, properties.validator);
    if (errorText) {
      extraProps.error = true;
      extraProps.helperText = errorText;
    }
  }
  return (
    <TextField
      key={props.formKey}
      style={{ marginBottom: 8 }}
      fullWidth
      label={properties.title}
      defaultValue={props.value}
      disabled={properties.readonly}
      onChange={e => props.onChange(props.formKey, e.target.value)}
      {...extraProps}
    />
  );
}
function getErrorText(text: string, validator: Validator): string | undefined {
  if (!text) {
    return;
  }
  if (validator.regex && !text.match(new RegExp(validator.regex))) {
    return "Invalid input value";
  }
  if (validator.minLength && text.length < validator.minLength) {
    return "At least " + validator.minLength + " characters required";
  }
  if (validator.maxLength && text.length > validator.maxLength) {
    return "Should be less then " + validator.maxLength + " characters";
  }
  if (validator.min && parseInt(text) < validator.min) {
    return "Should be bigger then " + validator.min;
  }
  if (validator.max && parseInt(text) < validator.max) {
    return "Should be smaller then " + validator.max;
  }
}
