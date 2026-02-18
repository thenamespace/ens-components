import { Input, Icon, Text, ShurikenSpinner } from "@/components/atoms";

interface SubnameInputProps {
  value: string;
  parentName: string;
  isUpdateMode: boolean;
  isLoading: boolean;
  isChecking: boolean;
  isDisabled: boolean;
  isAvailable: boolean;
  minLength: number;
  onChange: (value: string) => void;
}

export const SubnameInput = ({
  value,
  parentName,
  isUpdateMode,
  isLoading,
  isChecking,
  isDisabled,
  isAvailable,
  minLength,
  onChange,
}: SubnameInputProps) => {
  return (
    <div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isDisabled}
        size="lg"
        placeholder={isUpdateMode ? "Updating subname" : "Enter subname"}
        wrapperClassName="ns-offchain-subname-input"
        prefix={<Icon color="grey" size={20} name="search" />}
        suffix={
          isLoading || isChecking ? (
            <div style={{ display: "flex", alignItems: "center", minWidth: "80px", justifyContent: "center" }}>
              <ShurikenSpinner size={18} />
            </div>
          ) : (
            <div style={{ minWidth: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Text weight="medium" size="sm" color="grey">
                .{parentName}
              </Text>
            </div>
          )
        }
      />

      {/* Status Messages */}
      {value.length > 0 && value.length < minLength && (
        <div className="ns-text-center mt-2">
          <Text size="xs" color="grey">
            Minimum subname length is {minLength} character
          </Text>
        </div>
      )}

      {!isUpdateMode && value.length >= minLength &&
        !isChecking &&
        !isLoading &&
        !isAvailable && (
          <div className="mt-2">
            <Text size="xs" color="grey">
              {value}.{parentName} is not available
            </Text>
          </div>
        )}
    </div>
  );
};
