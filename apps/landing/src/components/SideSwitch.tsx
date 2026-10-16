export function SideSwitch({
  left,
  right,
  isRight,
  onChange,
  disabled,
  title,
  className = "",
  testId,
}: {
  left: string;
  right: string;
  isRight: boolean;
  onChange: (isRight: boolean) => void;
  disabled?: boolean;
  title?: string;
  className?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={right}
      aria-checked={isRight}
      data-testid={testId}
      title={title}
      disabled={disabled}
      className={`side-switch prop-toggle ${isRight ? "on" : "off"} ${className}`}
      onClick={() => onChange(!isRight)}
    >
      <span className={`side-switch-label${isRight ? "" : " active"}`}>{left}</span>
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      <span className={`side-switch-label${isRight ? " active" : ""}`}>{right}</span>
    </button>
  );
}
