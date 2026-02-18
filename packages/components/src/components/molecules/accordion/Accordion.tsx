import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Icon } from "../../atoms";
import "./Accordion.css";

export interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  disabled?: boolean;
  togglable?: boolean;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  disabled = false,
  togglable = true,
  className = "",
  titleClassName = "",
  bodyClassName = "",
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(
    controlledIsOpen !== undefined ? controlledIsOpen : defaultOpen
  );
  const [height, setHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync internal state with controlled prop when it changes (for programmatic control)
  useEffect(() => {
    if (controlledIsOpen !== undefined && !onToggle) {
      setInternalIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen, onToggle]);

  // Close accordion when disabled
  useEffect(() => {
    if (disabled && internalIsOpen) {
      setInternalIsOpen(false);
      if (onToggle) {
        onToggle(false);
      }
    }
  }, [disabled, internalIsOpen, onToggle]);

  // Use controlled state if provided AND onToggle is provided (fully controlled)
  // Otherwise, if controlledIsOpen is provided but no onToggle, use internal state for user clicks (hybrid mode)
  // If not controlled at all, use internal state (uncontrolled)
  // When disabled, always force closed
  const isOpen = disabled 
    ? false 
    : (controlledIsOpen !== undefined && onToggle) 
      ? controlledIsOpen 
      : internalIsOpen;

  // Initialize height for defaultOpen - use layout effect to prevent flash
  useLayoutEffect(() => {
    if (contentRef.current) {
      const initialOpen = controlledIsOpen !== undefined ? controlledIsOpen : defaultOpen;
      if (initialOpen) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        // Set to actual height for smooth animation
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }
  }, [isOpen]);

  // Update height when content changes (only when open)
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const updateHeight = () => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight);
        }
      };
      
      // Update immediately
      updateHeight();
      
      // Watch for content changes
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [isOpen, children]);

  const handleToggle = () => {
    if (!disabled && togglable) {
      const newIsOpen = !isOpen;
      
      // If controlled with onToggle callback, call it (parent manages state)
      if (controlledIsOpen !== undefined && onToggle) {
        onToggle(newIsOpen);
      } 
      // If controlled but no onToggle, use internal state (hybrid mode)
      else if (controlledIsOpen !== undefined && !onToggle) {
        setInternalIsOpen(newIsOpen);
      }
      // If uncontrolled, update internal state
      else {
        setInternalIsOpen(newIsOpen);
        // Call onToggle if provided
        if (onToggle) {
          onToggle(newIsOpen);
        }
      }
    }
  };

  return (
    <div
      className={`ns-accordion ${isOpen ? "ns-accordion--open" : ""} ${disabled ? "ns-accordion--disabled" : ""} ${!togglable ? "ns-accordion--not-togglable" : ""} ${className}`}
    >
      <div
        className="ns-accordion__header"
        onClick={handleToggle}
        role="button"
        aria-expanded={isOpen}
        aria-disabled={disabled || !togglable}
        tabIndex={disabled || !togglable ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && togglable) {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className={`ns-accordion__title ${titleClassName}`}>{title}</div>
        <div className="ns-accordion__icon">
          <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={20} />
        </div>
      </div>
      <div
        className={`ns-accordion__body ${isOpen ? "ns-accordion__body--open" : "ns-accordion__body--closed"}`}
        style={{
          height: `${height}px`,
        }}
      >
        <div ref={contentRef} className={`ns-accordion__body-inner ${bodyClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
