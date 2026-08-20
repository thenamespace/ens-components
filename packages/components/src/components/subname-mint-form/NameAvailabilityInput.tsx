import { Icon, Input, Text, ShurikenSpinner } from "@/components/atoms";

export interface NameAvailabilityInputProps {
  label: string;
  parentName: string;
  minLength: number;
  disabled: boolean;
  isChecking: boolean;
  isAvailable: boolean;
  isReserved: boolean;
  onNameChange: (value: string) => void;
}

export const NameAvailabilityInput = ({
  label,
  parentName,
  minLength,
  disabled,
  isChecking,
  isAvailable,
  isReserved,
  onNameChange,
}: NameAvailabilityInputProps) => {
  const showMinLengthMessage = label.length < minLength;
  const showCheckingMessage = label.length >= minLength && isChecking;
  const showUnavailableMessage =
    label.length >= minLength && !isChecking && !isAvailable;
  const showReservedMessage =
    label.length >= minLength && !isChecking && isAvailable && isReserved;

  return (
    <div>
      <Input
        value={label}
        onChange={(e) => onNameChange(e.target.value)}
        disabled={disabled}
        size="lg"
        wrapperClassName="ns-subname-mint-input"
        prefix={<Icon color="grey" size={20} name="search" />}
        suffix={
          <Text weight="medium" size="sm" color="grey">
            {parentName}
          </Text>
        }
      />

      {/* One status line for every state, so all four read identically — a
          status dot plus a micro label (design flows lines 203-207). */}
      <div className="ns-name-status">
        {showMinLengthMessage ? (
          <>
            <span className="ns-dot" />
            <span className="ns-name-status__text">
              Minimum subname length is {minLength} character
              {minLength === 1 ? "" : "s"}
            </span>
          </>
        ) : showCheckingMessage ? (
          <>
            <ShurikenSpinner size={14} />
            <span className="ns-name-status__text">Checking availability</span>
          </>
        ) : showUnavailableMessage ? (
          <>
            <span className="ns-dot ns-dot--bad" />
            <span className="ns-name-status__text">
              {label}.{parentName} is not available
            </span>
          </>
        ) : showReservedMessage ? (
          <>
            <span className="ns-dot ns-dot--soon" />
            <span className="ns-name-status__text">
              {label}.{parentName} is reserved
            </span>
          </>
        ) : (
          <>
            <span className="ns-dot ns-dot--ok" />
            <span className="ns-name-status__text">
              {label}.{parentName} is available
            </span>
          </>
        )}
      </div>
    </div>
  );
};

