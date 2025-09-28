import React from "react";

interface EthSvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const EthSvg: React.FC<EthSvgProps> = ({ size = 20, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <clipPath id="clip0_597_2890">
          <rect
            width="19"
            height="19"
            fill="white"
            transform="translate(0.255859 0.5)"
          />
        </clipPath>
      </defs>
      <g clipPath="url(#clip0_597_2890)">
        <path
          d="M9.75586 19.5C15.0026 19.5 19.2559 15.2467 19.2559 10C19.2559 4.75329 15.0026 0.5 9.75586 0.5C4.50915 0.5 0.255859 4.75329 0.255859 10C0.255859 15.2467 4.50915 19.5 9.75586 19.5Z"
          fill="#7A57DD"
        />
        <path
          d="M9.75488 3.66663V8.34801L13.7116 10.1161L9.75488 3.66663Z"
          fill="white"
          fillOpacity="0.602"
        />
        <path
          d="M9.75464 3.66663L5.79736 10.1161L9.75464 8.34801V3.66663Z"
          fill="white"
        />
        <path
          d="M9.75488 13.1498V16.3307L13.7143 10.8529L9.75488 13.1498Z"
          fill="white"
          fillOpacity="0.602"
        />
        <path
          d="M9.75464 16.3307V13.1493L5.79736 10.8529L9.75464 16.3307Z"
          fill="white"
        />
        <path
          d="M9.75488 12.4135L13.7116 10.1161L9.75488 8.34912V12.4135Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M5.79736 10.1161L9.75464 12.4135V8.34912L5.79736 10.1161Z"
          fill="white"
          fillOpacity="0.602"
        />
      </g>
    </svg>
  );
};