import * as React from "react";
import {
  TextField,
  Typography,
  IconButton,
  Card,
  Select,
  Input,
  MenuItem,
  ListItemText,
  Checkbox,
  Chip
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Delete";
import { SelectArea } from "./components/select";
import { BaseFormSchema, FormType } from "./types";
import { StringArray } from "./components/array";
import { TextArea } from "./components/text";
import { MapArea } from "./components/map";
import { ColorArea } from "./components/color";

interface Props {
  schema: FormType[];
  onChange: (jsonObject: any) => void;
  dataProvider?: { [key: string]: any[] | { [key: string]: any[] } | any };
  initialValue?: any;
}
interface State {}
export default class OtsimoForm extends React.Component<Props, State> {
  state = {
    output: this.props.initialValue || {},
    errorMessages: [],
    dynamicFields: []
  };
  handleUpdate = (key: string, value: any | any[]) => {
    const out = this.state.output;
    const keyPath = key.split(".");
    assign(out, keyPath, value);
    this.setState({ output: { ...this.state.output } });
    this.props.onChange(out);
    console.log(out);
  };
  componentWillMount() {
    console.log(this.state.output);
    this.checkMissingDataProvider(this.props.schema);
  }
  componentWillReceiveProps(next: Props) {
    this.checkMissingDataProvider(next.schema);
  }
  checkMissingDataProvider(schema: FormType[]) {
    const errorMessages = [] as any[];
    const dynamicFields = this.getDynamicSources(schema);
    dynamicFields.forEach(f => {
      if (!this.props.dataProvider || !this.props.dataProvider[f]) {
        errorMessages.push("Missing data provider for key '" + f + "'");
      }
    });
    this.setState({ errorMessages: errorMessages });
  }
  getDynamicSources = (schema: any) => {
    const keys = [] as any[];
    schema.forEach((s: any) => {
      if (s.hasDynamicSource) {
        if (s.sourceKey) {
          keys.push(s.sourceKey);
        } else {
          keys.push(s.key);
        }
      } else if (s.type === "parent") {
        const childSources = this.getDynamicSources(s.children);
        if (childSources.length > 0) {
          keys.concat(childSources);
        }
      }
    });
    return keys;
  };
  renderErrors = () => {
    if (this.state.errorMessages.length > 0) {
      return (
        <div style={{ marginBottom: 12 }}>
          {this.state.errorMessages.map(m => (
            <Typography style={{ backgroundColor: "#fdd835", padding: 12 }}>
              {m}
            </Typography>
          ))}
        </div>
      );
    }
  };
  renderArray(parentKey: string | undefined, item: any) {
    const itemsToRender = [];
    const currentArray = byString(
      this.state.output,
      (parentKey ? parentKey + "." : "") + item.key
    ) as any[];
    if (!currentArray || currentArray.length === 0) {
      return null;
    }
    for (let j = 0; j < currentArray.length; j++) {
      {
        itemsToRender.push(
          <Card
            style={{ padding: 12, marginBottom: 12 }}
            key={j + "-" + currentArray.length}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <Typography variant="title">Item {j}</Typography>
              <IconButton
                onClick={() => {
                  let currentArray =
                    (byString(
                      this.state.output,
                      (parentKey ? parentKey + "." : "") + item.key
                    ) as any[]) || [];
                  currentArray = currentArray.filter((item, index) => {
                    return index !== j;
                  });
                  this.handleUpdate(
                    (parentKey ? parentKey + "." : "") + item.key,
                    currentArray
                  );
                }}
              >
                <RemoveIcon />
              </IconButton>
            </div>
            {item.children.map((i: any, index: number) => {
              return this.renderItem(
                i,
                (parentKey ? parentKey + "." : "") + item.key + "." + j,
                index
              );
            })}
          </Card>
        );
      }
    }
    return <div>{itemsToRender}</div>;
  }
  renderStringType(item: any, key: string) {
    let value = byString(this.state.output, key);
    if (item.hasDynamicSource) {
      if (
        this.props.dataProvider &&
        value !== this.props.dataProvider[item.key]
      ) {
        this.handleUpdate(key, this.props.dataProvider[item.key]);
      }
      value = this.props.dataProvider ? this.props.dataProvider[item.key] : "";
    }
    if (item.format === "color") {
      return (
        <ColorArea
          formKey={key}
          properties={item}
          value={value}
          onChange={this.handleUpdate}
        />
      );
    }
    if (item.isArray) {
      return (
        <StringArray
          formKey={key}
          properties={{
            ...item,
            possibleValues: this.props.dataProvider![item.key] || []
          }}
          value={value}
          onChange={this.handleUpdate}
        />
      );
    }
    return (
      <TextArea
        formKey={key}
        properties={item}
        value={value}
        onChange={this.handleUpdate}
      />
    );
  }
  renderArrayWithChild(item: any, parentKey?: string) {
    return (
      <div
        key={item.key}
        style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <Typography variant="title">{item.title}</Typography>
          <IconButton
            onClick={() => {
              const currentArray =
                (byString(
                  this.state.output,
                  (parentKey ? parentKey + "." : "") + item.key
                ) as any[]) || [];
              currentArray.push({} as any);
              this.handleUpdate(
                (parentKey ? parentKey + "." : "") + item.key,
                currentArray
              );
            }}
          >
            <AddIcon />
          </IconButton>
        </div>
        <Typography variant="caption">{item.description}</Typography>

        <div
          style={{ display: "flex", flexDirection: "column", marginLeft: 16 }}
        >
          {this.renderArray(parentKey, item)}
        </div>
      </div>
    );
  }
  renderComplexType(item: any, parentKey?: string) {
    return (
      <div
        key={item.key}
        style={{ display: "flex", flexDirection: "column", marginTop: 16 }}
      >
        <Typography variant="title">{item.title}</Typography>
        <Typography variant="caption" style={{ marginTop: 4, marginLeft: 4 }}>
          {item.description}
        </Typography>
        <div
          style={{
            display: "flex",
            flexDirection:
              item.layoutDirection === "vertical" ? "row" : "column",
            justifyContent: "space-around",
            marginLeft: 16
          }}
        >
          {item.children.map((i: any, index: number) =>
            this.renderItem(
              i,
              (parentKey ? parentKey + "." : "") + item.key,
              index
            )
          )}
        </div>
      </div>
    );
  }
  renderSelectType(item: any, key: string) {
    if (item.hasDynamicSource) {
      console.log(
        "hasDynamicSource",
        item.key,
        this.props.dataProvider ? this.props.dataProvider[item.key] : undefined
      );
      return (
        <>
          <SelectArea
            formKey={key!}
            properties={{
              ...item,
              possibleValues: this.props.dataProvider
                ? this.props.dataProvider[item.key]
                : []
            }}
            value={byString(this.state.output, key)}
            onChange={this.handleUpdate}
          />
        </>
      );
    }
    return (
      <SelectArea
        formKey={key}
        properties={item}
        value={byString(this.state.output, key)}
        onChange={this.handleUpdate}
      />
    );
  }

  renderItem(item: any, parentKey?: string, index?: number) {
    if (item.children && item.isArray) {
      return this.renderArrayWithChild(item, parentKey);
    }
    if (item.children) {
      return this.renderComplexType(item, parentKey);
    }
    let key = item.key;
    if (parentKey) {
      key = parentKey + "." + item.key;
    }
    if (item.type === "string") {
      return this.renderStringType(item, key);
    }
    if (item.type === "number") {
      return (
        <TextArea
          formKey={key}
          number
          properties={item}
          value={byString(this.state.output, key)}
          onChange={this.handleUpdate}
        />
      );
    }
    if (item.type === "stringMap") {
      return (
        <MapArea
          formKey={key}
          properties={item}
          value={byString(this.state.output, key)}
          onChange={this.handleUpdate}
        />
      );
    }
    if (item.type === "select") {
      return this.renderSelectType(item, key);
    }
  }
  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {process.env.NODE_ENV !== "production" && this.renderErrors()}
        {this.props.schema.map(i => this.renderItem(i))}
      </div>
    );
  }
}
function assign(obj: any, keyPath: string[], value: any | any[]) {
  let lastKeyIndex = keyPath.length - 1;
  for (var i = 0; i < lastKeyIndex; ++i) {
    const key = keyPath[i];
    if (!(key in obj)) {
      obj[key] = {};
    }
    if (obj[key] === null) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}
function byString(o: any, s: string) {
  s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  s = s.replace(/^\./, ""); // strip a leading dot
  var a = s.split(".");

  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];
    if (!o || o === null || (!s || s === null)) {
      return;
    }
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
}
