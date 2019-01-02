import * as React from "react";
import { withStyles, StyleRules } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import TextField from "@material-ui/core/TextField";
import * as Autosuggest from "react-autosuggest";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";

const styleSheet = (theme: any) =>
  ({
    root: {
      width: "100%",
      minHeight: 50,
      display: "flex",
      flexDirection: "column"
    },
    labelDelete: {
      margin: theme.spacing.unit
    },
    textField: {},
    container: {
      width: "100%",
      position: "relative",
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit
    },
    suggestionsContainerOpen: {
      position: "absolute",
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit * 3,
      left: 0,
      right: 0,
      zIndex: 1000
    },
    suggestion: {
      display: "block"
    },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyleType: "none"
    }
  } as StyleRules);

const suggestions = [
  { label: "abstract" },
  { label: "level" },
  { label: "subject" },
  { label: "type" },
  { label: "usage" },
  { label: "analytics" },
  { label: "categories" },
  { label: "premium" },
  { label: "premium_settings" },
  { label: "premium_capable" },
  { label: "all" },
  { label: "always" },
  { label: "seldom" },
  { label: "daily" },
  { label: "number" },
  { label: "math" },
  { label: "choose" },
  { label: "match" },
  { label: "drawing-image" },
  { label: "generator-" }
];

function renderSuggestion(suggestion: any, { query, isHighlighted }: any) {
  return (
    <MenuItem selected={isHighlighted} component="div">
      {suggestion.label}
    </MenuItem>
  );
}

function renderInput(inputProps: any) {
  const { classes, value, ref, ...other } = inputProps;
  return (
    <TextField
      fullWidth
      className={classes.textField}
      value={value}
      inputRef={ref}
      InputProps={{
        ...other
      }}
    />
  );
}

function getSuggestionValue(suggestion: { label: string }) {
  return suggestion.label;
}

function getSuggestions(value: string) {
  const inputValue = value ? value.trim().toLowerCase() : "";
  const inputLength = inputValue.length;
  let count = 0;
  return inputLength === 0
    ? suggestions
    : suggestions.filter(suggestion => {
        const keep =
          count < 5 &&
          suggestion.label.toLowerCase().slice(0, inputLength) === inputValue;
        if (keep) {
          count += 1;
        }
        return keep;
      });
}

function renderSuggestionsContainer(options: any) {
  const { containerProps, children } = options;
  return (
    <Paper {...containerProps} square>
      {children}
    </Paper>
  );
}

interface LabelRowProps {
  label: Label;
  classes: any;
  onRemove: (id: number) => void;
  update: (label: Label, nextKey: string, nextValue: string) => void;
}
class LabelRow extends React.Component<LabelRowProps> {
  state = {
    suggestions: suggestions
  };

  handleSuggestionsFetchRequested = ({ value }: any) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const props = this.props;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "stretch"
        }}
      >
        <Autosuggest
          theme={{
            container: props.classes.container,
            suggestionsContainerOpen: props.classes.suggestionsContainerOpen,
            suggestionsList: props.classes.suggestionsList,
            suggestion: props.classes.suggestion
          }}
          renderInputComponent={renderInput}
          suggestions={this.state.suggestions}
          onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
          renderSuggestionsContainer={renderSuggestionsContainer}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={{
            fullWidth: true,
            classes: props.classes,
            className: props.classes.textField,
            placeholder: "key",
            error: props.label.status === "error",
            value: props.label.key || "",
            onChange: (event: any, t: { newValue: string }) => {
              props.update(props.label, t.newValue, props.label.value);
            },
            onDoubleClick: this.handleSuggestionsFetchRequested
          }}
        />
        <Autosuggest
          theme={{
            container: props.classes.container,
            suggestionsContainerOpen: props.classes.suggestionsContainerOpen,
            suggestionsList: props.classes.suggestionsList,
            suggestion: props.classes.suggestion
          }}
          renderInputComponent={renderInput}
          suggestions={this.state.suggestions}
          onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
          renderSuggestionsContainer={renderSuggestionsContainer}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={{
            fullWidth: true,
            classes: props.classes,
            className: props.classes.textField,
            placeholder: "value",
            value: props.label.value || "",
            error: props.label.status === "error",
            onChange: (event: any, t: { newValue: string }) => {
              props.update(props.label, props.label.key, t.newValue);
            },
            onDoubleClick: this.handleSuggestionsFetchRequested
          }}
        />
        <IconButton
          className={props.classes.button}
          aria-label="Delete"
          onClick={() => props.onRemove(props.label.id)}
          disabled={props.label.status === "new"}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    );
  }
}

class Labels extends React.Component<LabelsProps, LabelsState> {
  state = {
    labels: [{ key: "", value: "", status: "new", id: lastLabelID++ }]
  } as LabelsState;

  componentWillMount() {
    this.mapLabels(this.props.labels);
  }

  componentWillReceiveProps(nextProps: Readonly<LabelsProps>) {
    this.mapLabels(nextProps.labels);
  }

  mapLabels(labels: { [key: string]: string }) {
    let t: Label[] = this.state.labels;
    const lbl = this.props.labels || {};
    for (let k in labels) {
      let v = lbl[k];
      const index = t.findIndex(m => m.key === k);
      if (index < 0) {
        t.push({
          key: k,
          value: labels[k],
          status: "update",
          id: lastLabelID++
        });
      }
    }
    t.map(x => {
      if (labels) {
        const xl = labels[x.key];
        if (xl !== x.value) {
          x.value = xl;
        }
      }
      return x;
    });
    t.sort((k, l) => {
      if (k.status === "new") {
        return 1;
      }
      if (l.status === "new") {
        return -1;
      }
      return k.id - l.id;
    });
    this.setState({ labels: t });
  }

  updateLabel = (label: Label, nextKey: string, nextValue: string) => {
    let addNew = false;
    let ls = this.state.labels.map(l => {
      if (l.id !== label.id) {
        return l;
      }
      l.key = nextKey;
      l.value = nextValue;
      if (label.status === "new" && nextKey !== "" && nextValue !== "") {
        l.status = "update";
        addNew = true;
      }
      return l;
    });
    if (addNew) {
      ls.push({ key: "", value: "", status: "new", id: lastLabelID++ });
    }
    this.setState({ labels: ls }, this.labelsUpdated);
  };

  removeLabel = (id: number) => {
    let l = this.state.labels.filter(l => l.id !== id);
    this.setState({ labels: l }, this.labelsUpdated);
  };

  labelsUpdated = () => {
    const labels = this.state.labels.reduce(
      (pv, k) => {
        if (k.status === "new" && (k.key === "" || k.value === "")) {
          return pv;
        }
        pv[k.key] = k.value;
        return pv;
      },
      {} as { [key: string]: string }
    );

    if (this.props.onChange) {
      this.props.onChange(labels);
    }
  };

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root}>
        {this.state.labels.map(k => (
          <LabelRow
            key={k.id}
            label={k}
            onRemove={this.removeLabel}
            classes={classes}
            update={this.updateLabel}
          />
        ))}
      </div>
    );
  }
}

type LabelStatus = "update" | "new" | "error";
let lastLabelID = 0;

interface Label {
  key: string;
  value: string;
  status: LabelStatus;
  id: number;
}

interface LabelsProps {
  labels: { [key: string]: string };
  onChange?: (labels: { [key: string]: string }) => void;
  classes?: any;
}

interface LabelsState {
  labels: Label[];
}

export default withStyles(styleSheet)(Labels as any);
