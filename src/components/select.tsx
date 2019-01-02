import * as React from "react";
import {
  Chip,
  Typography,
  Select,
  Input,
  MenuItem,
  Checkbox,
  ListItemText
} from "@material-ui/core";
import { SelectFormSchema } from "../types";

export function SelectArea(props: {
  formKey: string;
  properties: SelectFormSchema;
  value: any;
  onChange: (key: string, value: any) => void;
}) {
  const { properties } = props;
  const renderMultiple = (selected: any) => (
    <div style={{ marginTop: -20 }}>
      {selected &&
        (selected as any).length &&
        (selected as React.ReactText[]).map(value => (
          <Chip
            key={value}
            label={
              properties.possibleValues.find(i => i.key === value)
                ? properties.possibleValues.find(i => i.key === value)!.value
                : value
            }
            style={{ marginRight: 8 }}
          />
        ))}
    </div>
  );
  const renderSingle = (selected: any) => {
    console.log("selected", selected);
    return (
      <div style={{ marginTop: -12 }}>
        {properties.possibleValues.find(i => i.key === selected)
          ? properties.possibleValues.find(i => i.key === selected)!.value
          : selected}
      </div>
    );
  };
  return (
    <div
      key={props.formKey}
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: 8,
        marginBottom: 16
      }}
    >
      <Typography variant="title" style={{ marginBottom: 8, marginTop: 8 }}>
        {props.properties.title}
      </Typography>
      <Select
        multiple={properties.multiple}
        value={props.value || []}
        onChange={event => {
          props.onChange(props.formKey, event.target.value);
        }}
        style={{
          height: 40
        }}
        input={<Input name="type" id="cmp-type" />}
        renderValue={properties.multiple ? renderMultiple : renderSingle}
      >
        {properties.possibleValues.map(t => (
          <MenuItem key={t.key} value={t.key}>
            {properties.multiple && (
              <Checkbox
                checked={props.value && props.value.indexOf(t.key) > -1}
              />
            )}
            <ListItemText>{t.value}</ListItemText>
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}
