import React, { ReactElement } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Icon.css";
import { User } from 'lucide-react';

export type IconName = "person"

const icons: Record<IconName, LucideIcon> = {
  person: User
}

export interface IconProps {
  name: IconName;
  color?: string;
  size?: number;
  className?: string;
  dataTestId?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  color = "currentColor",
  size = 24,
  className = "",
  dataTestId,
}) => {
  const LucideIconComponent = icons[name] as LucideIcon;

  if (!LucideIconComponent) {
    console.warn(`Icon "${name}" not found in Lucide Icons`);
    return null;
  }

  return (
    <LucideIconComponent
      size={size}
      color={color}
      className={`ns-icon ${className}`}
      data-test-id={dataTestId}
    />
  );
};

export default Icon; 