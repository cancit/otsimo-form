import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { Labels } from "../materialComponents";
import { GeneralFormSchema } from "../types";
export function MapArea(props: {
  formKey: string;
  properties: GeneralFormSchema;
  value: { [key: string]: string };
  onChange: (key: string, value: { [key: string]: string }) => void;
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
      <Labels
        labels={props.value}
        onChange={(e: any) => props.onChange(props.formKey, e)}
      />
    </div>
  );
}
