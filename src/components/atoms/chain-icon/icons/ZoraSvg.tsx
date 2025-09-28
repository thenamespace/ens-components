import React from "react";

interface ZoraSvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const ZoraSvg: React.FC<ZoraSvgProps> = ({ size = 20, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 142 142"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <radialGradient
          id="ZoraIcon_svg__a"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(102.676 37.972)scale(-119.284)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.007" stopColor="#f2cefe" />
          <stop offset="0.191" stopColor="#afbaf1" />
          <stop offset="0.498" stopColor="#4281d3" />
          <stop offset="0.667" stopColor="#2e427d" />
          <stop offset="0.823" stopColor="#230101" />
          <stop offset="1" stopColor="#8f6b40" />
        </radialGradient>
      </defs>
      <path
        fill="url(#ZoraIcon_svg__a)"
        d="M70.615 141.23C31.615 141.23 0 109.615 0 70.615S31.616 0 70.615 0c39 0 70.615 31.615 70.615 70.615s-31.615 70.615-70.614 70.615Z"
      />
    </svg>
  );
};
