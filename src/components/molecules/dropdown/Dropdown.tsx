import React, { useRef, useEffect, useState, useCallback } from "react";
import "./Dropdown.css";

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  disabled?: boolean;
  dataTestId?: string;
  closeCallback?: () => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  placement = "bottom",
  align = "start",
  disabled = false,
  dataTestId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  }, [disabled]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", e => {
        if (e.key === "Escape") setIsOpen(false);
      });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const getPlacementClasses = () => {
    const placementClass = `ns-dropdown--${placement}`;
    const alignClass = `ns-dropdown--align-${align}`;
    return `${placementClass} ${alignClass}`;
  };

  return (
    <div className="ns-dropdown" data-test-id={dataTestId}>
      <div
        ref={triggerRef}
        className="ns-dropdown__trigger"
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`ns-dropdown__menu ${getPlacementClasses()}`}
          role="menu"
          aria-orientation="vertical"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
