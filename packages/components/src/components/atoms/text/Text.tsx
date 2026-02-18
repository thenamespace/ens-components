import React from "react";
import "./Text.css";

export type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TextWeight = "light" | "regular" | "medium" | "bold";
export type TextColor = "primary" | "white" | "grey" | "danger";

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  dataTestId?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  size = "md",
  weight = "regular",
  color = "primary",
  className = "",
  style,
  dataTestId,
  ...rest
}) => {
  const sizeClass = `ns-text--${size}`;
  const weightClass = `ns-text--${weight}`;
  const colorClass = `ns-text--${color}`;

  const classes = ["ns-text", sizeClass, weightClass, colorClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style} data-test-id={dataTestId} {...rest}>
      {children}
    </div>
  );
};

export default Text;
