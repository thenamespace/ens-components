import React from "react";

interface YoutubeIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const YoutubeIcon: React.FC<YoutubeIconProps> = ({
  size = 24,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M22.54 6.42C22.42 5.945 22.183 5.51 21.828 5.156C21.474 4.802 21.038 4.565 20.56 4.44C18.88 4 12 4 12 4S5.12 4 3.46 4.46C2.982 4.585 2.546 4.822 2.192 5.176C1.838 5.53 1.6 5.965 1.48 6.44C1 8.12 1 12 1 12S1 15.88 1.46 17.54C1.6 18.015 1.838 18.45 2.192 18.804C2.546 19.158 2.982 19.395 3.46 19.52C5.12 20 12 20 12 20S18.88 20 20.54 19.54C21.018 19.415 21.454 19.178 21.808 18.824C22.162 18.47 22.4 18.035 22.52 17.56C23 15.88 23 12 23 12S23 8.12 22.54 6.42Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.75 15.02L15.5 12L9.75 8.98V15.02Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
