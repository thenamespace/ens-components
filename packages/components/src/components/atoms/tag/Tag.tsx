import React from "react";
import "./Tag.css";

export type TagTone = "outline" | "blue" | "amber" | "pink";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** Status tone. Tags carry status, never decoration. */
  tone?: TagTone;
  dataTestId?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  tone = "outline",
  className = "",
  dataTestId,
  ...rest
}) => {
  const classes = ["ns-tag", `ns-tag--${tone}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} data-test-id={dataTestId} {...rest}>
      {children}
    </span>
  );
};

export default Tag;
