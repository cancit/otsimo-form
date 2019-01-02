import * as React from "react";
import { GeneralFormSchema } from "../types";
import Typography from "@material-ui/core/Typography";
import { BlockPicker } from "react-color";
export function ColorArea(props: {
  formKey: string;
  properties: GeneralFormSchema;
  value: string;
  onChange: (key: string, value: string) => void;
}) {
  const { properties } = props;
  if (properties.readonly && (!props.value || props.value.length === 0)) {
    return null;
  }
  let color = props.value;
  if (color && color.length > 0 && color.charAt(0) !== "#") {
    color = "#" + color;
  }
  return (
    <div
      key={props.formKey}
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: 12
      }}
    >
      <Typography variant="title" style={{ marginBottom: 8, marginTop: 8 }}>
        {properties.title}
      </Typography>
      <BlockPicker
        triangle="hide"
        color={props.value || "#ffffff"}
        onChangeComplete={color => {
          props.onChange(props.formKey, color.hex);
          // this.setStrValue(color.hex);
        }}
      />
    </div>
  );
}
