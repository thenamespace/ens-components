import React from "react";
import { Icon, IconName } from "@/components/atoms/icon/Icon";
import "./Alert.css";

export type AlertVariant = "error" | "warning" | "info" | "success";

export interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  dismissible?: boolean;
  title?: string;
}

const variantConfig: Record<AlertVariant, { icon: IconName; colorClass: string }> = {
  error: { icon: "x-circle", colorClass: "ns-alert-error" },
  warning: { icon: "alert-triangle", colorClass: "ns-alert-warning" },
  info: { icon: "info", colorClass: "ns-alert-info" },
  success: { icon: "check-circle", colorClass: "ns-alert-success" },
};

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  children,
  className = "",
  onClose,
  dismissible = false,
  title,
}) => {
  const config = variantConfig[variant];
  
  return (
    <div className={`ns-alert ${config.colorClass} ${className}`} role="alert">
      <div className="ns-alert-content">
        <div className="ns-alert-icon">
          <Icon name={config.icon} size={20} />
        </div>
        <div className="ns-alert-message">
          {title && <div className="ns-alert-title">{title}</div>}
          <div className="ns-alert-description">{children}</div>
        </div>
        {dismissible && onClose && (
          <button
            className="ns-alert-close"
            onClick={onClose}
            aria-label="Close alert"
            type="button"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
