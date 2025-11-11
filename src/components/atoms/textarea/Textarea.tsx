import { forwardRef } from "react";
import "./Textarea.css";

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "prefix"> {
  size?: TextareaSize;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  dataTestId?: string;
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = "md",
      prefix,
      suffix,
      disabled = false,
      error = false,
      className = "",
      dataTestId,
      rows = 4,
      ...rest
    },
    ref
  ) => {
    const sizeClass = `ns-textarea--${size}`;
    const errorClass = error ? "ns-textarea--error" : "";
    const disabledClass = disabled ? "ns-textarea--disabled" : "";

    const classes = [
      "ns-textarea",
      sizeClass,
      errorClass,
      disabledClass,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`ns-textarea__wrapper ${sizeClass}`}>
        {prefix && <div className="ns-textarea__prefix">{prefix}</div>}
        <textarea
          ref={ref}
          className={classes}
          disabled={disabled}
          aria-invalid={error || undefined}
          data-test-id={dataTestId}
          rows={rows}
          {...rest}
        />
        {suffix && <div className="ns-textarea__suffix">{suffix}</div>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;

