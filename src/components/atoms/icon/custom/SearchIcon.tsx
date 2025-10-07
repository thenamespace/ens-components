import React from "react";

interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const SearchIcon: React.FC<SearchIconProps> = ({ size = 24, ...props }) => (
  <svg
    className="search-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>

);
