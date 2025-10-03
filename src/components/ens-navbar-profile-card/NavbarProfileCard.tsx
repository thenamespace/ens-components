import React from "react";
import "./NavbarProfileCard.css";
import Icon from "../atoms/icon/Icon";
import { Text } from "../atoms";

/**
 * Compact profile card for navigation bars.
 * @param {NavbarProfileCardProps} props
 */
export interface NavbarProfileCardProps {
  imageUrl: string;
  name: string;
  address: string;
  onLogout?: () => void;
  className?: string;
}

export const NavbarProfileCard: React.FC<NavbarProfileCardProps> = ({
  imageUrl,
  name,
  address,
  onLogout,
  className = "",
}) => {
  return (
    <nav className={`ns-navbar-profile ${className}`} aria-label="Profile">
      <img
        src={imageUrl}
        alt={name + " avatar"}
        className="ns-navbar-profile-avatar"
      />
      <div className="ns-navbar-profile-info">
        <Text color="primary" size="md">
          {name}
        </Text>
        <Text color="grey" size="sm">
          {address}
        </Text>
      </div>
      <button
        className="ns-navbar-profile-action"
        onClick={onLogout}
        aria-label="Logout"
      >
        <Icon name="logout" size={18} />
      </button>
    </nav>
  );
};
