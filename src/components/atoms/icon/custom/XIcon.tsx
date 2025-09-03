import React from 'react';

interface XIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const XIcon: React.FC<XIconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={props.color}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
  <path fill="inherit" d="m.058 1 9.267 12.39L0 23.463h2.099l8.163-8.82 6.596 8.82H24l-9.788-13.086L22.892 1h-2.1l-7.517 8.122L7.2 1zm3.087 1.546h3.28l14.488 19.37h-3.28z"></path>
  </svg>
); 