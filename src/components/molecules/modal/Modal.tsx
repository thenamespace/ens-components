import React, { useEffect, useRef } from "react";
import "./Modal.css";
import { Button, Text } from "@/components/atoms"; // alias imports [[memory:7847985]]

export type ModalSize = "sm" | "md" | "lg";
export type ModalPresentation = "dialog" | "drawer";

export interface ModalResponsivePresentation {
  mobile?: ModalPresentation;
  breakpointPx?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** Optional footer content. If not provided, a default Close button is shown. */
  footer?: React.ReactNode;
  /** Width preset for the dialog */
  size?: ModalSize;
  /** Disable closing on overlay click and Escape */
  isDismissDisabled?: boolean;
  /** Optional id for the title element to improve accessibility */
  titleId?: string;
  /** Additional className for the container */
  className?: string;
  /** Optional styles for the dialog container */
  style?: React.CSSProperties;
  /** Visual presentation mode */
  presentation?: ModalPresentation;
  /** Optional responsive presentation overrides */
  responsivePresentation?: ModalResponsivePresentation;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  isDismissDisabled,
  titleId,
  className = "",
  style,
  presentation = "dialog",
  responsivePresentation,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.matchMedia ||
      !responsivePresentation?.mobile
    ) {
      setIsMobileViewport(false);
      return;
    }

    const breakpointPx = responsivePresentation.breakpointPx ?? 600;
    const mediaQuery = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const update = () => setIsMobileViewport(mediaQuery.matches);

    update();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, [responsivePresentation?.mobile, responsivePresentation?.breakpointPx]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen || isDismissDisabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDismissDisabled, onClose]);

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = e => {
    if (isDismissDisabled) return;
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  const effectivePresentation =
    responsivePresentation?.mobile && isMobileViewport
      ? responsivePresentation.mobile
      : presentation;
  const sizeClass = `ns-modal--${size}`;
  const presentationClass = `ns-modal--${effectivePresentation}`;
  const classes = ["ns-modal", className, sizeClass, presentationClass]
    .filter(Boolean)
    .join(" ");
  const overlayClasses = [
    "ns-modal-overlay",
    `ns-modal-overlay--${effectivePresentation}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={overlayRef}
      className={overlayClasses}
      onMouseDown={handleOverlayClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={dialogRef}
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId || "ns-modal-title" : undefined}
        style={style}
      >
        {/* {(title || !isDismissDisabled) && (
          <div className="ns-modal__header">
            {title && (
              <div className="ns-modal__title" id={titleId || "ns-modal-title"}>
                {typeof title === "string" ? (
                  <Text size="lg" weight="medium">
                    {title}
                  </Text>
                ) : (
                  title
                )}
              </div>
            )}
            {!isDismissDisabled && (
              <button
                className="ns-modal__close"
                aria-label="Close"
                onClick={onClose}
              >
                ×
              </button>
            )}
          </div>
        )} */}

        <div className="ns-modal__body">{children}</div>

        <div className="ns-modal__footer">
          {footer !== undefined ? (
            footer
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
