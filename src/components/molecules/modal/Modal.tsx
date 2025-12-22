import React, { useEffect, useRef } from "react";
import "./Modal.css";
import { Button, Text } from "@/components/atoms"; // alias imports [[memory:7847985]]

export type ModalSize = "sm" | "md" | "lg";

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
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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

  const sizeClass = `ns-modal--${size}`;
  const classes = ["ns-modal", className, sizeClass].filter(Boolean).join(" ");

  return (
    <div
      ref={overlayRef}
      className="ns-modal-overlay"
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
