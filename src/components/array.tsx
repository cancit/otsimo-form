import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { Chips } from "../materialComponents/index";
import { GeneralFormSchema } from "../types";
export function StringArray(props: {
  formKey: string;
  properties: GeneralFormSchema;
  value: string[];
  onChange: (key: string, value: string[]) => void;
}) {
  const { properties } = props;
  return (
    <div
      key={props.formKey}
      style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
    >
      <Typography variant="title" style={{ marginBottom: 8, marginTop: 8 }}>
        {properties.title}
      </Typography>
      <Typography variant="caption" style={{ marginBottom: 8 }}>
        {properties.description}
      </Typography>
      <Chips
        chips={props.value}
        placeholder="Add a value..."
        onChange={e => props.onChange(props.formKey, e)}
      />
    </div>
  );
}
