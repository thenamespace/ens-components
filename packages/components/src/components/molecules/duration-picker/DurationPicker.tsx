import React, { useRef, useState } from "react";
import "./DurationPicker.css";
import { Button, Text } from "@/components/atoms";
import {
  MIN_REGISTRATION_SECONDS,
  secondsFromYears,
  secondsToDateInput,
  roundDurationWithDay,
  formatDurationSummary,
  yearsFromSeconds,
} from "@/utils/date";

export interface DurationPickerProps {
  durationSeconds: number;
  onDurationChange: (seconds: number) => void;
  minSeconds?: number;
}

const CalendarSVG = () => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

export const DurationPicker: React.FC<DurationPickerProps> = ({
  durationSeconds,
  onDurationChange,
  minSeconds = MIN_REGISTRATION_SECONDS,
}) => {
  const [durationType, setDurationType] = useState<"years" | "date">("years");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const nowSecondsRef = useRef(Math.floor(Date.now() / 1000));
  const nowSeconds = nowSecondsRef.current;

  const years = Math.max(1, Math.floor(yearsFromSeconds(durationSeconds)));
  const minusSeconds = secondsFromYears(new Date(), years - 1);

  const handleMinusYear = () => {
    if (minusSeconds >= minSeconds) {
      onDurationChange(minusSeconds);
    }
  };

  const handlePlusYear = () => {
    onDurationChange(secondsFromYears(new Date(), years + 1));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { valueAsDate } = e.currentTarget;
    if (!valueAsDate) return;
    // <input type="date"> yields UTC midnight. Shift to local midnight so that
    // getDate()/getMonth()/getFullYear() in roundDurationWithDay resolve to the
    // user's intended calendar day (otherwise UTC+ zones see the prior day).
    const normalised = new Date(
      valueAsDate.getTime() + valueAsDate.getTimezoneOffset() * 60 * 1000
    );
    const minDate = new Date((nowSeconds + minSeconds) * 1000);
    const clamped = normalised < minDate ? minDate : normalised;
    onDurationChange(roundDurationWithDay(clamped, nowSeconds));
  };

  const handleToggleMode = () => {
    if (durationType === "years") {
      setDurationType("date");
    } else {
      // Snap back to nearest whole year (min 1) when switching to years mode
      const snapped = secondsFromYears(
        new Date(),
        Math.max(1, Math.floor(yearsFromSeconds(durationSeconds)))
      );
      onDurationChange(snapped);
      setDurationType("years");
    }
  };

  const minusDisabled = minusSeconds < minSeconds;
  const expirySeconds = nowSeconds + durationSeconds;
  const expiryDateDisplay = new Date(expirySeconds * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="ns-duration-picker">
      {durationType === "years" ? (
        <div className="ns-duration-picker__control">
          <Button
            className="ns-duration-picker__btn"
            onClick={handleMinusYear}
            disabled={minusDisabled}
          >
            −
          </Button>
          <span className="ns-duration-picker__label">
            {years} year{years !== 1 ? "s" : ""}
          </span>
          <Button
            className="ns-duration-picker__btn ns-duration-picker__btn--plus"
            onClick={handlePlusYear}
          >
            +
          </Button>
        </div>
      ) : (
        <div className="ns-duration-picker__calendar">
          <span className="ns-duration-picker__date-display">{expiryDateDisplay}</span>
          <input
            ref={dateInputRef}
            type="date"
            className="ns-duration-picker__date-input"
            value={secondsToDateInput(expirySeconds)}
            min={secondsToDateInput(nowSeconds + minSeconds)}
            onChange={handleDateChange}
          />
          <button
            type="button"
            className="ns-duration-picker__calendar-btn"
            onClick={() => dateInputRef.current?.showPicker?.()}
            aria-label="Open calendar"
          >
            <CalendarSVG />
          </button>
        </div>
      )}
      <div className="ns-duration-picker__footer">
        <Text size="xs" color="grey">
          {formatDurationSummary(durationSeconds)} registration.&nbsp;
        </Text>
        <button
          type="button"
          className="ns-duration-picker__toggle"
          onClick={handleToggleMode}
        >
          Pick by {durationType === "years" ? "date" : "years"}
        </button>
      </div>
    </div>
  );
};
