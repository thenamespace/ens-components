import React from "react";
import "./ShurikenSpinner.css";
import shurikenImage from "../../../assets/shuriken.svg";

export interface ShurikenSpinnerProps {
  size?: number;
  className?: string;
}

export const ShurikenSpinner: React.FC<ShurikenSpinnerProps> = ({
  size = 24,
  className = "",
}) => {
  return (
    <div
      className={`shuriken-spinner ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={shurikenImage}
        alt="Loading..."
        className="shuriken-spinner__image"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default ShurikenSpinner;

