import React from "react";

interface CeloSvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const CeloSvg: React.FC<CeloSvgProps> = ({ size = 20, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 2500 2500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="1250"
        cy="1250"
        r="1250"
        fill="#FCFF52"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M1949.3,546.2H550.7v1407.7h1398.7v-491.4h-232.1c-80,179.3-260.1,304.1-466.2,304.1    c-284.1,0-514.2-233.6-514.2-517.5c0-284,230.1-515.6,514.2-515.6c210.1,0,390.2,128.9,470.2,312.1h228.1V546.2z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
};
