import * as React from "react";

interface ChipsProps {
  chips: string[];
  max?: number;
  maxlength?: number;
  placeholder?: string;
  style?: React.CSSProperties;
  onChange?: (chips: string[]) => void;
}

interface ChipsState {
  chips: string[];
}

const INVALID_CHARS = /[^a-zA-Z0-9 ]/g;
const KEY = {
  backspace: 8,
  tab: 9,
  enter: 13
};

export default class Chips extends React.Component<ChipsProps, ChipsState> {
  state = {
    chips: []
  } as ChipsState;

  static defaultProps = {
    placeholder: "Add a chip...",
    maxlength: 20
  };

  componentDidMount() {
    this.setChips(this.props.chips);
  }

  componentWillReceiveProps(nextProps: ChipsProps) {
    this.setChips(nextProps.chips);
  }

  setChips(chips: string[]) {
    if (chips && chips.length) {
      this.setState({ chips });
    }
  }

  onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    let keyPressed = event.which;
    if (
      keyPressed === KEY.enter ||
      (keyPressed === KEY.tab && event.currentTarget.value)
    ) {
      event.preventDefault();
      this.updateChips(event);
    } else if (keyPressed === KEY.backspace) {
      let chips = this.state.chips;
      if (!event.currentTarget.value && chips.length) {
        this.deleteChip(chips[chips.length - 1]);
      }
    }
  };

  clearInvalidChars = (event: React.KeyboardEvent<HTMLInputElement>) => {
    let value = event.currentTarget.value;
    if (value.length > this.props.maxlength!) {
      event.currentTarget.value = value.substr(0, this.props.maxlength);
    }
  };

  updateChips = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!this.props.max || this.state.chips.length < this.props.max) {
      let value = event.currentTarget.value;

      if (!value) {
        return;
      }

      let chip = value.trim();

      if (chip && this.state.chips.indexOf(chip) < 0) {
        this.setState(
          {
            chips: [...this.state.chips, chip]
          },
          () => this.props.onChange && this.props.onChange(this.state.chips)
        );
      }
    }

    event.currentTarget.value = "";
  };

  deleteChip(chip: string) {
    let index = this.state.chips.indexOf(chip);
    if (index >= 0) {
      this.state.chips.splice(index, 1);

      this.setState(
        {
          chips: this.state.chips
        },
        () => this.props.onChange && this.props.onChange(this.state.chips)
      );
    }
  }

  focusInput = (event: React.MouseEvent<HTMLDivElement>) => {
    let children = event.currentTarget.children;
    if (children.length) {
      (children[children.length - 1] as any).focus();
    }
  };

  render() {
    let chips = this.state.chips.map((chip, index) => {
      return (
        <span
          style={{
            display: "inline-block",
            marginTop: 8,
            marginBottom: 8,
            marginLeft: 8,
            marginRight: 25,
            position: "relative"
          }}
          key={index}
        >
          <span
            style={{
              display: "inline-block",
              padding: 5,
              paddingLeft: 15,
              paddingRight: 7.5,
              background: "#555",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "15px 0 0 15px"
            }}
          >
            {chip}
          </span>
          <button
            type="button"
            style={{
              background: "#555",
              color: "#fff",
              border: 0,
              borderRadius: " 0 15px 15px 0",
              padding: "5px 10px",
              cursor: "pointer",
              position: "absolute",
              top: 0,
              bottom: 0,
              right: "-25",
              lineHeight: 0.5,
              fontWeight: "bold"
            }}
            onClick={() => this.deleteChip(chip)}
          >
            x
          </button>
        </span>
      );
    });
    let placeholder =
      !this.props.max || chips.length < this.props.max
        ? this.props.placeholder
        : "";
    return (
      <div
        style={{
          ...this.props.style,
          minHeight: 36,
          borderBottom: "2px solid blue",
          lineHeight: 1,
          fontSize: "1em"
        }}
        onClick={this.focusInput}
      >
        {chips}
        <input
          type="text"
          style={{
            display: "inline-block",
            width: "33%",
            minHeight: 36,
            marginBottom: 5,
            marginLeft: 10,
            border: 0,
            outline: "none",
            fontSize: "0.9rem",
            background: "transparent"
          }}
          placeholder={placeholder}
          onKeyDown={this.onKeyDown}
          onKeyUp={this.clearInvalidChars}
        />
      </div>
    );
  }
}
