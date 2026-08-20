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

      {/* One status line for every state, so "available" and "not available"
          read identically — a status dot plus a micro label. Update mode has
          no availability to report, so it stays silent. */}
      {!isUpdateMode && value.length > 0 && (
        <div className="ns-name-status">
          {value.length < minLength ? (
            <>
              <span className="ns-dot" />
              <span className="ns-name-status__text">
                Minimum subname length is {minLength} character
                {minLength === 1 ? "" : "s"}
              </span>
            </>
          ) : isChecking || isLoading ? (
            <>
              <ShurikenSpinner size={14} />
              <span className="ns-name-status__text">Checking availability</span>
            </>
          ) : isAvailable ? (
            <>
              <span className="ns-dot ns-dot--ok" />
              <span className="ns-name-status__text">
                {value}.{parentName} is available
              </span>
            </>
          ) : (
            <>
              <span className="ns-dot ns-dot--bad" />
              <span className="ns-name-status__text">
                {value}.{parentName} is not available
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
