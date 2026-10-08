import React from "react";
import { Icon, Text } from "@/components/atoms";
import { Dropdown } from "../dropdown/Dropdown";
import "./TokenSelect.css";

export interface TokenSelectOption {
  symbol: string;
  /** Amount to pay in this token, already formatted (e.g. "0.0031"). */
  amount?: string;
}

export interface TokenSelectProps {
  label?: string;
  value: string;
  options: TokenSelectOption[];
  onChange: (symbol: string) => void;
  disabled?: boolean;
}

/** Payment token picker: a labelled row whose value opens a dropdown of tokens. */
export const TokenSelect: React.FC<TokenSelectProps> = ({
  label = "Pay with",
  value,
  options,
  onChange,
  disabled,
}) => (
  <div className="ns-token-select d-flex justify-content-between align-items-center">
    <Text size="sm" color="grey">
      {label}
    </Text>
    <Dropdown
      align="end"
      disabled={disabled}
      trigger={
        <span className="ns-token-select__trigger">
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
            data-selected={option.symbol === value}
            key={option.symbol}
            onClick={() => onChange(option.symbol)}
            type="button"
          >
            <span>{option.symbol}</span>
            {option.amount && (
              <span className="ns-token-select__amount">{option.amount}</span>
            )}
          </button>
        ))}
      </div>
    </Dropdown>
  </div>
);

export default TokenSelect;
