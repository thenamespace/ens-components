import React from "react";
import { Sparkles } from "lucide-react";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="ens-names-register-progress-container">
      <div className="ens-names-register-progress-bar">
        <div
          className="ens-names-register-progress-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          <Sparkles size={25} className="ens-names-register-progress-sparkle" />
        </div>
      </div>
    </div>
  );
}
