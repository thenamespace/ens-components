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

      {/* Status Messages */}
      {showMinLengthMessage && (
        <div className="ns-text-center mt-2">
          <Text size="xs" color="grey">
            Minimum subname length is 1 character
          </Text>
        </div>
      )}

      {showCheckingMessage && (
        <div
          className="ns-text-center mt-2 d-flex align-items-center justify-content-center"
          style={{ gap: "8px" }}
        >
          <ShurikenSpinner size={18} />
          <Text size="sm" color="grey">
            Checking availability
          </Text>
        </div>
      )}

      {showUnavailableMessage && (
        <div className="ns-text-center mt-2">
          <Text size="xs" color="grey">
            {label}.{parentName} is not available
          </Text>
        </div>
      )}

      {showReservedMessage && (
        <div className="ns-text-center mt-2">
          <Text size="xs" color="grey">
            {label}.{parentName} is reserved
          </Text>
        </div>
      )}
    </div>
  );
};

