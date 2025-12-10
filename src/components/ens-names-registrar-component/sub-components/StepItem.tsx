import React from "react";
import { ChevronUp, ChevronDown, Check } from "lucide-react";
import { Text } from "../../atoms";

interface StepItemProps {
  stepNumber: number;
  title: string;
  isExpanded: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function StepItem({
  stepNumber,
  title,
  isExpanded,
  isCompleted,
  onToggle,
  children,
}: StepItemProps) {
  return (
    <div className={`ens-names-register-step ${isExpanded ? "expanded" : ""}`}>
      <div className="ens-names-register-step-header" onClick={onToggle}>
        <div
          className={`ens-names-register-step-number ${isCompleted ? "completed" : ""}`}
        >
          {isCompleted ? (
            <Check size={18} className="ens-names-register-step-check" />
          ) : (
            <span className={isExpanded ? "active" : ""}>{stepNumber}</span>
          )}
        </div>
        <Text size="md" weight="bold" className="ens-names-register-step-title">
          {title}
        </Text>
        <div className="ens-names-register-step-chevron">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      {isExpanded && children && (
        <div className="ens-names-register-step-content">{children}</div>
      )}
    </div>
  );
}
