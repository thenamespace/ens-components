import React from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Icon.css";
import {
  User,
  Search,
  SquareUser,
  Globe,
  Pin,
  Box,
  Book,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  LogOut,
  Edit,
  CopyIcon,
  Clock,
  Image
} from "lucide-react";
import {
  DiscordIcon,
  GithubIcon,
  TelegramIcon,
  YoutubeIcon,
  XIcon,
} from "./custom";

type CustomIcon = React.ComponentType<{
  size?: number;
  color?: string;
  className?: string;
  "data-test-id"?: string;
}>;
type IconComponent = LucideIcon | CustomIcon;

export type IconName =
  | "person"
  | "x"
  | "search"
  | "square-user"
  | "globe"
  | "pin"
  | "box"
  | "book"
  | "map-pin"
  | "mail"
  | "discord"
  | "github"
  | "telegram"
  | "youtube"
  | "image"
  | "circle-person"
  | "twitter"
  | "circle-alert"
  | "check-circle"
  | "alert-triangle"
  | "info"
  | "x-circle"
  | "rotate-circle"
  | "logout"
  | "edit"
  | "copy"
  | "clock"
  | "image"
  | "xSocial"

const icons: Record<IconName, IconComponent> = {
  person: User,
  x: X,
  search: Search,
  "square-user": SquareUser,
  globe: Globe,
  pin: Pin,
  box: Box,
  book: Book,
  "map-pin": LucideIcons.MapPin,
  mail: LucideIcons.Mail,
  discord: DiscordIcon,
  github: GithubIcon,
  telegram: TelegramIcon,
  youtube: YoutubeIcon,
  image: Image,
  "circle-person": LucideIcons.CircleUser,
  twitter: XIcon,
  "circle-alert": LucideIcons.CircleAlert,
  "check-circle": CheckCircle,
  "alert-triangle": AlertTriangle,
  info: Info,
  "x-circle": XCircle,
  "rotate-circle": LucideIcons.CircleFadingPlus,
  logout: LogOut,
  edit: Edit,
  copy: CopyIcon,
  clock: Clock,
  xSocial: XIcon,
};

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
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Icons`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      className={`ns-icon ${className}`}
      data-test-id={dataTestId}
    />
  );
};

export default Icon;
