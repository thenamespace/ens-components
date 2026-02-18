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
  closeCallback,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    closeCallback?.();
  }, [closeCallback]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => {
        const next = !prev;
        if (!next) {
          closeCallback?.();
        }
        return next;
      });
    }
  }, [disabled, closeCallback]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    },
    [closeDropdown]
  );

  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    },
    [closeDropdown]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, handleClickOutside, handleEscapeKey]);

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
          onClick={() => closeDropdown()}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
