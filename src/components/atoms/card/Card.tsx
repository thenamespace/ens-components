import React from "react";
import "./Card.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = "", ...props }: CardProps) => {
  return (
    <div className={`ns-card ${className}`} {...props}>
      {children}
    </div>
  );
};
