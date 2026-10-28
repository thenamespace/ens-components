import React from "react";
import { Icon, Text } from "@/components/atoms";
import { Dropdown } from "../dropdown/Dropdown";
import { TokenIcon } from "./TokenIcon";
import "./TokenSelect.css";

export interface TokenSelectOption {
  symbol: string;
  amount?: string;
}

export interface TokenSelectProps {
  label?: string;
  value: string;
  options: TokenSelectOption[];
  onChange: (symbol: string) => void;
  disabled?: boolean;
  inline?: boolean;
}

export const TokenSelect: React.FC<TokenSelectProps> = ({
  label = "Pay with",
  value,
  options,
  onChange,
  disabled,
  inline,
}) => {
  const dropdown = (
    <Dropdown
      align="end"
      disabled={disabled}
      trigger={
        <span
          className="ns-token-select__trigger"
          data-testid="token-select"
          data-value={value}
        >
          <TokenIcon symbol={value} />
          <Text size="sm" weight="medium">
            {value}
          </Text>
          <Icon name="chevron-down" size={14} />
        </span>
      }
    >
      <div className="ns-token-select__menu">
        {options.map(option => (
          <button
            className="ns-token-select__item"
            data-testid={`token-option-${option.symbol}`}
            data-selected={option.symbol === value}
            key={option.symbol}
            onClick={() => onChange(option.symbol)}
            type="button"
          >
            <span className="ns-token-select__symbol">
              <TokenIcon symbol={option.symbol} />
              {option.symbol}
            </span>
            {option.amount && (
              <span className="ns-token-select__amount">{option.amount}</span>
            )}
          </button>
        ))}
      </div>
    </Dropdown>
  );

  if (inline) return dropdown;

  return (
    <div className="ns-token-select d-flex justify-content-between align-items-center">
      <Text size="sm" color="grey">
        {label}
      </Text>
      {dropdown}
    </div>
  );
};

export default TokenSelect;
