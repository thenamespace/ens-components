import React, { useState, useRef, useEffect, ReactNode } from "react";
import "./Tooltip.css";

export type TooltipPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end";

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  trigger?: "hover" | "click" | "focus";
  maxWidth?: number;
  offset?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  delay = 200,
  disabled = false,
  className = "",
  contentClassName = "",
  trigger = "hover",
  maxWidth = 200,
  offset = 8,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const showTooltip = () => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let top = 0;
    let left = 0;

    const baseOffset = offset;
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    // Calculate initial position based on the specified position
    switch (position) {
      case "top":
        top = triggerRect.top - tooltipRect.height - baseOffset;
        left = triggerCenterX - tooltipRect.width / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + baseOffset;
        left = triggerCenterX - tooltipRect.width / 2;
        break;
      case "left":
        top = triggerCenterY - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - baseOffset;
        break;
      case "right":
        top = triggerCenterY - tooltipRect.height / 2;
        left = triggerRect.right + baseOffset;
        break;
      case "top-start":
        top = triggerRect.top - tooltipRect.height - baseOffset;
        left = triggerRect.left;
        break;
      case "top-end":
        top = triggerRect.top - tooltipRect.height - baseOffset;
        left = triggerRect.right - tooltipRect.width;
        break;
      case "bottom-start":
        top = triggerRect.bottom + baseOffset;
        left = triggerRect.left;
        break;
      case "bottom-end":
        top = triggerRect.bottom + baseOffset;
        left = triggerRect.right - tooltipRect.width;
        break;
    }

    // Smart viewport boundary detection and adjustment
    const margin = 8;

    // Horizontal adjustments
    if (left < margin) {
      left = margin;
    } else if (left + tooltipRect.width > viewport.width - margin) {
      left = viewport.width - tooltipRect.width - margin;
    }

    // Vertical adjustments
    if (top < margin) {
      // If tooltip would go above viewport, try to position it below
      if (position.includes("top")) {
        top = triggerRect.bottom + baseOffset;
      } else {
        top = margin;
      }
    } else if (top + tooltipRect.height > viewport.height - margin) {
      // If tooltip would go below viewport, try to position it above
      if (position.includes("bottom")) {
        top = triggerRect.top - tooltipRect.height - baseOffset;
      } else {
        top = viewport.height - tooltipRect.height - margin;
      }
    }

    // Final safety check - if still out of bounds, center it
    if (left < margin) left = margin;
    if (left + tooltipRect.width > viewport.width - margin) {
      left = Math.max(margin, viewport.width - tooltipRect.width - margin);
    }
    if (top < margin) top = margin;
    if (top + tooltipRect.height > viewport.height - margin) {
      top = Math.max(margin, viewport.height - tooltipRect.height - margin);
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure tooltip is rendered before positioning
      const timeoutId = setTimeout(() => {
        calculatePosition();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [isVisible, position, offset]);

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        calculatePosition();
      }
    };

    const handleResize = () => {
      if (isVisible) {
        calculatePosition();
      }
    };

    if (isVisible) {
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (trigger === "hover") showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") hideTooltip();
  };

  const handleClick = () => {
    if (trigger === "click") {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === "focus") showTooltip();
  };

  const handleBlur = () => {
    if (trigger === "focus") hideTooltip();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isVisible) {
      hideTooltip();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className={`ns-tooltip-trigger ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={trigger === "focus" ? 0 : undefined}
    >
      {children}
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={`ns-tooltip ns-tooltip--${position} ${contentClassName}`}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth: maxWidth,
          }}
          role="tooltip"
          aria-live="polite"
        >
          <div className="ns-tooltip__content">{content}</div>
          <div className={`ns-tooltip__arrow ns-tooltip__arrow--${position}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
