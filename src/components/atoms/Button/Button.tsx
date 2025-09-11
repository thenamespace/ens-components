import React, { ReactNode } from "react";
import "./Button.css";

export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  prefix?: ReactNode;
  dataTestId?: string;
}

const sizeToClass: Record<ButtonSize, string> = {
  sm: "ns-btn--sm",
  md: "ns-btn--md",
  lg: "ns-btn--lg",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "solid",
  size = "md",
  className = "",
  children,
  loading = false,
  disabled,
  prefix,
  dataTestId,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const classes = [
    "ns-btn",
    `ns-btn--${variant}`,
    sizeToClass[size],
    loading ? "ns-btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-test-id={dataTestId}
      {...rest}
    >
      {loading && <span className="ns-btn__spinner" aria-hidden="true" />}
      {prefix && !loading && <span className="ns-btn__prefix">{prefix}</span>}
      <span className="ns-btn__label">{children}</span>
    </button>
  );
};

export default Button;
