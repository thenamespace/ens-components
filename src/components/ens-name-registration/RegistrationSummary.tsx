import React, { useCallback, useMemo } from "react";
import "./RegistrationSummary.css";
import { normalize } from "viem/ens";

import { debounce, formatFloat } from "@/utils";
import { Button, Icon, Input, Text, ShurikenSpinner } from "@/components";
import ninjaImage from "../../assets/banner.png";
import shurikenImage from "../../assets/shuriken.svg";
import { useRegisterENS } from "@/hooks";

const MIN_ENS_LEN = 3;

export interface RegistrationSummaryProps {
  label: string;
  years: number;
  price: {
    isChecking: boolean;
    wei: bigint;
    eth: number;
  };
  transactionFees?: {
    isChecking: boolean
    estimatedGas: number
    price: {
      wei: bigint
      eth: number
    }
  }
  nameValidation: {
    isChecking: boolean;
    isTaken: boolean;
    reason?: string;
  };
  isTestnet?: boolean;
  onLabelChange: (label: string) => void;
  onYearsChange: (years: number) => void;
  onPriceChange: (price: { isChecking: boolean; wei: bigint; eth: number }) => void;
  onNameValidationChange: (validation: { isChecking: boolean; isTaken: boolean; reason?: string }) => void;
  onSetProfile?: () => void;
  onStart?: () => void;
}

export const RegistrationSummary: React.FC<RegistrationSummaryProps> = ({
  label,
  years,
  price,
  nameValidation,
  transactionFees,
  isTestnet = false,
  onLabelChange,
  onYearsChange,
  onPriceChange,
  onNameValidationChange,
  onSetProfile,
  onStart
}) => {
  const { isEnsAvailable, getRegistrationPrice } = useRegisterENS({
    isTestnet,
  });

  const { regPrice, regFees, regTotal } = useMemo(() => {

    let regPrice = 0;
    let regFees = 0;
    let total = 0;

    if (price) {
      regPrice += price.eth;
      total += price.eth;
    }

    if (transactionFees) {
      regFees += transactionFees.price.eth;
      total += transactionFees.price.eth;
    }

    return {
      regFees,
      regPrice,
      regTotal: formatFloat (total, 5)
    }

  },[price, transactionFees])

  const checkAvailability = async (labelToCheck: string) => {
    let _available = false;

    try {
      _available = await isEnsAvailable(labelToCheck);
      onNameValidationChange({ isChecking: false, isTaken: !_available });
    } catch (err) {
      onNameValidationChange({
        isChecking: false,
        isTaken: false,
        reason: "Something went wrong",
      });
    }
  };


  const checkRegistrationPrice = async (labelToCheck: string, expiry: number) => {
    try {
      const rentPrice = await getRegistrationPrice(labelToCheck, expiry);
      onPriceChange({
        isChecking: false,
        eth: rentPrice.eth,
        wei: rentPrice.wei,
      });
    } catch (err) {
      onPriceChange({
        isChecking: false,
        eth: -1,
        wei: 0n,
      });
    }
  };

  const debouncedCheckAvailability = useCallback(
    debounce((labelToCheck: string) => checkAvailability(labelToCheck), 500),
    []
  );

  const debouncedCheckPrice = useCallback(
    debounce(
      (labelToCheck: string, expiryYears: number) =>
        checkRegistrationPrice(labelToCheck, expiryYears),
      500
    ),
    []
  );

  const handleNameChanged = async (value: string) => {
    const _value = value.toLocaleLowerCase().trim();

    if (_value.includes(".")) {
      return;
    }

    try {
      normalize(_value);
    } catch (err) {
      return;
    }

    onLabelChange(_value);

    if (_value.length >= MIN_ENS_LEN) {
      onNameValidationChange({ isChecking: true, isTaken: false });
      onPriceChange({ isChecking: true, eth: 0, wei: 0n });
      debouncedCheckAvailability(_value);
      debouncedCheckPrice(_value, years);
    } else {
      onNameValidationChange({ isChecking: false, isTaken: false });
    }
  };

  const handleYearsChange = (newYears: number) => {
    if (newYears < 1) {
      return;
    }
    onPriceChange({ ...price, isChecking: true });
    onYearsChange(newYears);
    debouncedCheckPrice(label, newYears);
  };

  const isNameAvailable = useMemo(() => {
    return (
      label.length >= MIN_ENS_LEN &&
      !nameValidation.isChecking &&
      !nameValidation.isTaken
    );
  }, [label.length, nameValidation.isChecking, nameValidation.isTaken]);

  const nextBtnDisabled =
    label.length < MIN_ENS_LEN ||
    nameValidation.isChecking ||
    nameValidation.isTaken;

  const totalPriceLoading = transactionFees?.isChecking || price.isChecking;
  const transactionFeesLoading = transactionFees?.isChecking || false;

  return (
    <div className="ens-registration-summary">
      <div className="d-flex justify-content-center">
        <img
          style={{ width: "250px", margin: "auto" }}
          src={ninjaImage}
          alt="Ninja Image"
        ></img>
      </div>
      <div className="text-center mb-3" style={{ textAlign: "center" }}>
        <Text weight="bold" className="text-align-center" size="lg">
          ENS Name Registration
        </Text>
        <Text color="grey" className="text-align-center" size="sm">
          Register your ENS name and set a profile
        </Text>
      </div>
      <Input
        value={label}
        onChange={e => handleNameChanged(e.target.value)}
        size="lg"
        wrapperClassName="ens-name-input"
        prefix={<Icon color="grey" size={20} name="search" />}
        suffix={
          <Text weight="medium" size="sm" color="grey">
            .eth
          </Text>
        }
      />

      {/* Status Messages */}
      {label.length < MIN_ENS_LEN && (
        <div className="ns-text-center mt-2">
          <Text size="xs" color="grey">
            Minimum ENS name length is 3 characters
          </Text>
        </div>
      )}

      {label.length >= MIN_ENS_LEN && nameValidation.isChecking && (
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

      {label.length >= MIN_ENS_LEN &&
        !nameValidation.isChecking &&
        nameValidation.isTaken && (
          <div className="ns-text-center mt-2">
            <Text size="xs" color="grey">
              {label}.eth is not available
            </Text>
          </div>
        )}

      {/* RECEIPT - Only show when name is available */}
      {isNameAvailable && (
        <>
          <div className="ens-registration-pricing mt-2">
            <div className="ens-expiry-picker d-flex justify-content-between mb-2">
              <Button
                disabled={years <= 1}
                onClick={() => handleYearsChange(years - 1)}
              >
                -
              </Button>
              <Text>
                {years} year{years > 1 ? "s" : ""}
              </Text>
              <Button onClick={() => handleYearsChange(years + 1)}>
                +
              </Button>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <Text size="sm" color="grey">
                Registration Fee
              </Text>
              {price.isChecking ? (
                <ShurikenSpinner size={16} />
              ) : (
                <Text size="sm" color="grey">
                  {regPrice} ETH
                </Text>
              )}
            </div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <Text size="sm" color="grey">
                Est. network fees
              </Text>
              {transactionFeesLoading ? (
                <ShurikenSpinner size={16} />
              ) : (
                <Text size="sm" color="grey">
                  {regFees} ETH
                </Text>
              )}
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2 total-fee">
              <Text size="lg" weight="bold">
                Total
              </Text>
               {totalPriceLoading ? (
                <ShurikenSpinner size={20} />
              ) : (
                <Text size="lg" weight="bold">
                  {regTotal} ETH
                </Text>
              )}
            </div>
          </div>

          {/* COMPLETE PROFILE */}
          <div
            className="ens-profile-selector mt-2"
            onClick={onSetProfile}
            style={{ cursor: "pointer" }}
          >
            <div className="content-container d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="shuriken-cont d-flex align-items-center justify-content-center">
                  <img
                    className="shuriken"
                    width={50}
                    src={shurikenImage}
                    alt="shuricken"
                  ></img>
                </div>
                <div className="ms-3">
                  <Text size="sm" weight="medium">
                    Complete your profile
                  </Text>
                  <Text size="xs" color="grey">
                    Make your ENS more discoverable
                  </Text>
                </div>
              </div>
              <Button style={{ width: 40, height: 40 }}>{`>`}</Button>
            </div>
          </div>
        </>
      )}
      <Button
        style={{ width: "100%" }}
        size="lg"
        className="mt-2"
        disabled={nextBtnDisabled}
        onClick={() => onStart?.()}
      >
        Next
      </Button>
    </div>
  );
};
