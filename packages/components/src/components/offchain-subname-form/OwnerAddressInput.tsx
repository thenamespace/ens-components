import { Input, Text } from "@/components/atoms";

interface OwnerAddressInputProps {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
}

export const OwnerAddressInput = ({ value, error, onChange }: OwnerAddressInputProps) => {
  return (
    <div className="mt-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Owner Address (Optional)"
        size="lg"
        wrapperClassName="ns-offchain-owner-input"
      />
      {error && (
        <div className="mt-1">
          <Text size="xs" color="grey">
            {error}
          </Text>
        </div>
      )}
    </div>
  );
};
