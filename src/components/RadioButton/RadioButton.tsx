import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import "./RadioButton.css";

export type RadioButtonOrientation = "horizontal" | "vertical";

export interface RadioButtonOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Figma: Orientation — the layout direction when used as a group (`items`). */
  orientation?: RadioButtonOrientation;
  /** For a single radio button, the text next to it; for a group, the group's title (legend). */
  label?: string;
  /** If given, draws a group of radio buttons (radiogroup). A single radio button gives nothing to choose between, so you usually use this. */
  items?: RadioButtonOption[];
  /** The selected value of the group (controlled). */
  selected?: string;
  /** The value selected at first in the group (uncontrolled). */
  defaultSelected?: string;
  onSelectedChange?: (value: string) => void;
  children?: ReactNode;
}

/**
 * A radio button for choosing one option from a set.
 *
 * Without `items`, it draws one native `input[type=radio]` (group several by giving them the same name).
 * With `items`, it draws a group with fieldset + legend — moving with the arrow keys is handled by
 * the native radios that share the same name. ref points to the input for a single radio, or to the first input for a group.
 */
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(
  { orientation = "horizontal", label, items, selected, defaultSelected, onSelectedChange, className, children, id: idProp, name: nameProp, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const [inner, setInner] = useState(defaultSelected ?? "");
  const current = selected ?? inner;

  if (items) {
    const name = nameProp ?? autoId;
    const choose = (value: string) => {
      if (selected === undefined) setInner(value);
      onSelectedChange?.(value);
    };
    const classes = ["ds-radiobutton", "ds-radiobutton--group", `ds-radiobutton--${orientation}`, className]
      .filter(Boolean)
      .join(" ");
    return (
      <fieldset className={classes} data-testid="ds-radiobutton" disabled={disabled}>
        {label ? <legend className="ds-radiobutton__legend">{label}</legend> : null}
        <div className="ds-radiobutton__options">
          {items.map((item, i) => {
            const id = `${autoId}-${i}`;
            return (
              <span key={item.value} className="ds-radiobutton__option">
                {/* rest 를 먼저 펼친다 — 묶음의 선택 상태는 onSelectedChange 로만 바뀐다. */}
                <input
                  {...rest}
                  ref={i === 0 ? ref : undefined}
                  id={id}
                  type="radio"
                  name={name}
                  value={item.value}
                  className="ds-radiobutton__field"
                  checked={current === item.value}
                  disabled={item.disabled}
                  onChange={() => choose(item.value)}
                />
                <label className="ds-radiobutton__label" htmlFor={id}>
                  {item.label}
                </label>
              </span>
            );
          })}
        </div>
        {children}
      </fieldset>
    );
  }

  const id = idProp ?? autoId;
  const text = label ?? children;
  const classes = ["ds-radiobutton", `ds-radiobutton--${orientation}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes} data-testid="ds-radiobutton">
      <input ref={ref} id={id} type="radio" name={nameProp} className="ds-radiobutton__field" disabled={disabled} {...rest} />
      {text ? (
        <label className="ds-radiobutton__label" htmlFor={id}>
          {text}
        </label>
      ) : null}
    </span>
  );
});
