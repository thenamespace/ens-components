import React, { forwardRef } from "react";
import "./Input.css";

export type InputType = "text" | "number";
export type InputSize = "sm" | "md" | "lg";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  type?: InputType;
  size?: InputSize;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  dataTestId?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      size = "md",
      prefix,
      suffix,
      disabled = false,
      error = false,
      className = "",
      dataTestId,
      ...rest
    },
    ref
  ) => {
    const sizeClass = `ns-input--${size}`;
    const errorClass = error ? "ns-input--error" : "";
    const disabledClass = disabled ? "ns-input--disabled" : "";

    const classes = [
      "ns-input",
      sizeClass,
      errorClass,
      disabledClass,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`ns-input__wrapper ${sizeClass}`}>
        {prefix && <div className="ns-input__prefix">{prefix}</div>}
        <input
          ref={ref}
          type={type}
          className={classes}
          disabled={disabled}
          aria-invalid={error || undefined}
          data-test-id={dataTestId}
          {...rest}
        />
        {suffix && <div className="ns-input__suffix">{suffix}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
