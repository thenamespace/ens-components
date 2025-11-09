import React from "react";
import { ChevronLeft } from "lucide-react";
import { Icon } from "../../atoms";

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  onClose?: () => void;
}

export function Header({ showBack = true, onBack, onClose }: HeaderProps) {
  return (
    <div className="ens-names-register-header">
      {showBack && (
        <button className="ens-names-register-back-btn" onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
      )}
      <button className="ens-names-register-close-btn" onClick={onClose}>
        <Icon name="x" size={20} />
      </button>
    </div>
  );
}
