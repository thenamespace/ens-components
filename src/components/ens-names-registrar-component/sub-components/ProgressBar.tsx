import React from "react";
import starImage from "../../../assets/star.png";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const progressPercent = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="ens-names-register-progress-container">
      <div className="ens-names-register-progress-bar">
        <div
          className="ens-names-register-progress-fill"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="ens-names-register-progress-star-wrapper">
            <img
              src={starImage}
              alt="Progress star"
              className="ens-names-register-progress-star"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
