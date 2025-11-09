import React from "react";
import { Text } from "../../atoms";

interface TimerProps {
  seconds: number;
  progress: number;
}

export function Timer({ seconds, progress }: TimerProps) {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${mins}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="ens-names-register-timer-container">
      <div className="ens-names-register-timer-circle">
        <svg className="ens-names-register-timer-svg" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            className="ens-names-register-timer-progress"
          />
        </svg>
        <div className="ens-names-register-timer-text">
          <Text size="xl" weight="bold">
            {formatTime(seconds)}
          </Text>
        </div>
      </div>
    </div>
  );
}
