import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { EnsRecords } from "@/types";
import { getEnsRecordsDiff, EnsRecordsDiff } from "@/utils";
import { getSupportedAddressByCoin, getSupportedText } from "@/constants";
import { Accordion, ContractErrorLabel } from "@/components/molecules";
import { Text, Icon, ChainIcon } from "@/components/atoms";
import { Button } from "@/components/atoms";
import { ContractFunctionExecutionError } from "viem";
import ninjaImage from "../../assets/banner.png";
import "./RecordUpdateSummary.css";

interface ExpandableBadgeProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  id: string;
  isExpanded: boolean;
  onToggle: () => void;
}

interface SimpleBadgeProps {
  icon: React.ReactNode;
  label: string;
}

const SimpleBadge: React.FC<SimpleBadgeProps> = ({ icon, label }) => {
  return (
    <div className="record-summary-simple-badge">
      <div className="record-summary-badge-header">
        <div className="d-flex align-items-center" style={{ gap: "8px" }}>
          {icon}
          <Text weight="medium" size="xs" color="grey">
            {label}
          </Text>
        </div>
      </div>
    </div>
  );
};

const ExpandableBadge: React.FC<ExpandableBadgeProps> = ({
  icon,
  label,
  children,
  id,
  isExpanded,
  onToggle
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useLayoutEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }
  }, [isExpanded, children]);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      const updateHeight = () => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight);
        }
      };

      updateHeight();

      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [isExpanded, children]);

  return (
    <div
      className={`record-summary-expandable-badge ${isExpanded ? "record-summary-expandable-badge--expanded" : ""}`}
    >
      <div
        className="record-summary-badge-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="d-flex align-items-center" style={{ gap: "8px" }}>
          {icon}
          <Text weight="medium" size="xs" color="grey">
            {label}
          </Text>
        </div>
        <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={16} />
      </div>
      <div
        className="record-summary-badge-content"
        style={{
          height: `${height}px`,
        }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
};

export interface RecordUpdateSummaryProps {
  oldRecords: EnsRecords;
  newRecords: EnsRecords;
  isUpdating?: {
    waitingWallet: boolean;
    waitingTx: boolean;
  };
  error?: ContractFunctionExecutionError | null;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const RecordUpdateSummary: React.FC<RecordUpdateSummaryProps> = ({
  oldRecords,
  newRecords,
  isUpdating,
  error,
  onConfirm,
  onCancel,
}) => {
  const diff: EnsRecordsDiff = useMemo(
    () => getEnsRecordsDiff(oldRecords, newRecords),
    [oldRecords, newRecords]
  );

  if (!diff.isDifferent) {
    return null;
  }

  const getAddressLabel = (coinType: number): string => {
    const addressInfo = getSupportedAddressByCoin(coinType);
    return addressInfo?.label || `Coin Type ${coinType}`;
  };

  const getTextLabel = (key: string): string => {
    const textInfo = getSupportedText(key);
    return textInfo?.label || key;
  };

  const formatAddress = (address: string): string => {
    if (address.length > 20) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const formatValue = (value: string, maxLength: number = 50): string => {
    if (value.length > maxLength) {
      return `${value.slice(0, maxLength)}...`;
    }
    return value;
  };

  // Determine which sections have changes
  const hasAddressChanges =
    diff.addressesAdded.length > 0 ||
    diff.addressesModified.length > 0 ||
    diff.addressesRemoved.length > 0;
  const hasTextChanges =
    diff.textsAdded.length > 0 ||
    diff.textsModified.length > 0 ||
    diff.textsRemoved.length > 0;
  const hasContenthashChanges =
    diff.contenthashAdded !== undefined ||
    diff.contenthashModified !== undefined ||
    diff.contenthashRemoved;

  // Calculate counts
  const addressCount =
    diff.addressesAdded.length +
    diff.addressesModified.length +
    diff.addressesRemoved.length;
  const textCount =
    diff.textsAdded.length +
    diff.textsModified.length +
    diff.textsRemoved.length;
  const contenthashCount = hasContenthashChanges ? 1 : 0;

  // Determine which accordion should be open by default (first one with changes)
  const [openAccordion, setOpenAccordion] = useState<string | null>(() => {
    if (hasAddressChanges) return "addresses";
    if (hasTextChanges) return "texts";
    if (hasContenthashChanges) return "contenthash";
    return null;
  });

  // State for expanded items
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const btnDisabled = isUpdating?.waitingTx || isUpdating?.waitingWallet;
  const btnLabel = isUpdating?.waitingWallet 
    ? "Waiting Wallet..." 
    : isUpdating?.waitingTx 
    ? "Updating..." 
    : "Update";

  return (
    <div className="record-update-summary">
      <div className="d-flex justify-content-center">
        <img
          style={{ width: "250px", margin: "auto" }}
          src={ninjaImage}
          alt="Ninja Image"
        />
      </div>
      <div className="text-center mb-3" style={{ textAlign: "center" }}>
        <Text weight="bold" className="text-align-center" size="lg">
          Update Summary
        </Text>
        <Text color="grey" className="text-align-center" size="sm">
          Review the changes you're about to make
        </Text>
      </div>

      <div className="ns-card-container">
        {/* Addresses Section */}
      {hasAddressChanges && (
        <Accordion
          title={
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              <Text weight="medium" size="sm">
                Address Summary
              </Text>
              <div className="record-summary-badge">
                <Text size="sm" color="grey" weight="medium">
                  {addressCount}
                </Text>
              </div>
            </div>
          }
          isOpen={openAccordion === "addresses"}
          onToggle={isOpen => setOpenAccordion(isOpen ? "addresses" : null)}
          className="record-summary-accordion"
        >
          <div className="record-summary-content">
            {diff.addressesAdded.length > 0 && (
              <div className="record-summary-section">
                <Text
                  weight="medium"
                  size="sm"
                  color="grey"
                  className="ns-mb-1"
                >
                  Added ({diff.addressesAdded.length})
                </Text>
                <div className="record-summary-badges-container">
                  {diff.addressesAdded.map((addr, idx) => {
                    const addressInfo = getSupportedAddressByCoin(
                      addr.coinType
                    );
                    const itemId = `addr-added-${addr.coinType}-${idx}`;
                    const isExpanded = expandedItems.has(itemId);
                    return (
                      <ExpandableBadge
                        key={idx}
                        id={itemId}
                        icon={
                          addressInfo ? (
                            <ChainIcon
                              chain={addressInfo.chainName}
                              size={16}
                            />
                          ) : null
                        }
                        label={getAddressLabel(addr.coinType)}
                        isExpanded={isExpanded}
                        onToggle={() => toggleItem(itemId)}
                      >
                        <Text size="xs" color="grey">
                          New value → {formatAddress(addr.value)}
                        </Text>
                      </ExpandableBadge>
                    );
                  })}
                </div>
              </div>
            )}

            {diff.addressesModified.length > 0 && (
              <div className="record-summary-section">
                <Text
                  weight="medium"
                  size="sm"
                  color="grey"
                  className="ns-mb-1"
                >
                  Modified ({diff.addressesModified.length})
                </Text>
                <div className="record-summary-badges-container">
                  {diff.addressesModified.map((addr, idx) => {
                    const addressInfo = getSupportedAddressByCoin(
                      addr.coinType
                    );
                    const oldAddr = oldRecords.addresses.find(
                      a => a.coinType === addr.coinType
                    );
                    const itemId = `addr-modified-${addr.coinType}-${idx}`;
                    const isExpanded = expandedItems.has(itemId);
                    return (
                      <ExpandableBadge
                        key={idx}
                        id={itemId}
                        icon={
                          addressInfo ? (
                            <ChainIcon
                              chain={addressInfo.chainName}
                              size={16}
                            />
                          ) : null
                        }
                        label={getAddressLabel(addr.coinType)}
                        isExpanded={isExpanded}
                        onToggle={() => toggleItem(itemId)}
                      >
                        <Text size="xs" color="grey">
                          {oldAddr ? formatAddress(oldAddr.value) : "None"} →{" "}
                          {formatAddress(addr.value)}
                        </Text>
                      </ExpandableBadge>
                    );
                  })}
                </div>
              </div>
            )}

            {diff.addressesRemoved.length > 0 && (
              <div className="record-summary-section">
                <Text
                  weight="medium"
                  size="sm"
                  color="grey"
                  className="ns-mb-1"
                >
                  Removed ({diff.addressesRemoved.length})
                </Text>
                <div className="record-summary-badges-container">
                  {diff.addressesRemoved.map((addr, idx) => {
                    const addressInfo = getSupportedAddressByCoin(
                      addr.coinType
                    );
                    return (
                      <SimpleBadge
                        key={idx}
                        icon={
                          addressInfo ? (
                            <ChainIcon
                              chain={addressInfo.chainName}
                              size={16}
                            />
                          ) : null
                        }
                        label={getAddressLabel(addr.coinType)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Accordion>
          )}

          {/* Texts Section */}
      {hasTextChanges && (
        <Accordion
          title={
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              <Text weight="medium" size="sm">
                Texts Summary
              </Text>
              <div className="record-summary-badge">
                <Text size="sm" color="grey" weight="medium">
                  {textCount}
                </Text>
              </div>
            </div>
          }
          isOpen={openAccordion === "texts"}
          onToggle={isOpen => setOpenAccordion(isOpen ? "texts" : null)}
          className="record-summary-accordion"
        >
          <div className="record-summary-content">
            {diff.textsAdded.length > 0 && (
              <div className="record-summary-section">
                <Text
                  weight="medium"
                  size="sm"
                  color="grey"
                  className="ns-mb-1"
                >
                  Added ({diff.textsAdded.length})
                </Text>
                <div className="record-summary-badges-container">
                  {diff.textsAdded.map((txt, idx) => {
                    const textInfo = getSupportedText(txt.key);
                    const itemId = `text-added-${txt.key}-${idx}`;
                    const isExpanded = expandedItems.has(itemId);
                    return (
                      <ExpandableBadge
                        key={idx}
                        id={itemId}
                        icon={
                          textInfo ? (
                            <Icon name={textInfo.icon} size={16} />
                          ) : null
                        }
                        label={getTextLabel(txt.key)}
                        isExpanded={isExpanded}
                        onToggle={() => toggleItem(itemId)}
                      >
                        <Text size="xs" color="grey">
                          New value → {formatValue(txt.value)}
                        </Text>
                      </ExpandableBadge>
                    );
                  })}
                </div>
              </div>
            )}

            {diff.textsModified.length > 0 && (
              <div className="record-summary-section">
                <Text
                  weight="medium"
                  size="sm"
                  color="grey"
                  className="ns-mb-1"
                >
                  Modified ({diff.textsModified.length})
                </Text>
                <div className="record-summary-badges-container">
                  {diff.textsModified.map((txt, idx) => {
                    const textInfo = getSupportedText(txt.key);
                    const oldText = oldRecords.texts.find(
                      t => t.key === txt.key
                    );
                    const itemId = `text-modified-${txt.key}-${idx}`;
                    const isExpanded = expandedItems.has(itemId);
                    return (
                      <ExpandableBadge
                        key={idx}
                        id={itemId}
                        icon={
                          textInfo ? (
                            <Icon name={textInfo.icon} size={16} />
                          ) : null
                        }
                        label={getTextLabel(txt.key)}
                        isExpanded={isExpanded}
                        onToggle={() => toggleItem(itemId)}
                      >
                        <Text size="xs" color="grey">
                          {oldText ? formatValue(oldText.value) : "None"} →{" "}
                          {formatValue(txt.value)}
                        </Text>
                      </ExpandableBadge>
                    );
                  })}
                </div>
              </div>
            )}

            {diff.textsRemoved.length > 0 && (
              <div className="record-summary-section">
                <Text
                  weight="medium"
                  size="sm"
                  color="grey"
                  className="ns-mb-1"
                >
                  Removed ({diff.textsRemoved.length})
                </Text>
                <div className="record-summary-badges-container">
                  {diff.textsRemoved.map((txt, idx) => {
                    const textInfo = getSupportedText(txt.key);
                    return (
                      <SimpleBadge
                        key={idx}
                        icon={
                          textInfo ? (
                            <Icon name={textInfo.icon} size={16} />
                          ) : null
                        }
                        label={getTextLabel(txt.key)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Accordion>
          )}

          {/* Contenthash Section */}
      {hasContenthashChanges && (
        <Accordion
          title={
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              <Text weight="medium" size="sm">
                Contenthash Summary
              </Text>
              <div className="record-summary-badge">
                <Text size="sm" color="grey" weight="medium">
                  {contenthashCount}
                </Text>
              </div>
            </div>
          }
          isOpen={openAccordion === "contenthash"}
          onToggle={isOpen => setOpenAccordion(isOpen ? "contenthash" : null)}
          className="record-summary-accordion"
        >
          <div className="record-summary-content">
            {diff.contenthashAdded && (
              <div className="record-summary-section">
                <Text
                  weight="medium"
                  size="sm"
                  color="grey"
                  className="ns-mb-1"
                >
                  Added
                </Text>
                <div className="record-summary-badges-container">
                  <ExpandableBadge
                    id="contenthash-added"
                    icon={<Icon name="globe" size={16} />}
                    label={`Protocol: ${diff.contenthashAdded.protocol}`}
                    isExpanded={expandedItems.has("contenthash-added")}
                    onToggle={() => toggleItem("contenthash-added")}
                  >
                    <Text size="xs" color="grey">
                      New value → {formatValue(diff.contenthashAdded.value, 60)}
                    </Text>
                  </ExpandableBadge>
                </div>
              </div>
            )}

            {diff.contenthashModified && (
              <div className="record-summary-section">
                <Text
                  weight="medium"
                  size="sm"
                  color="grey"
                  className="ns-mb-1"
                >
                  Modified
                </Text>
                <div className="record-summary-badges-container">
                  <ExpandableBadge
                    id="contenthash-modified"
                    icon={<Icon name="globe" size={16} />}
                    label={`Protocol: ${diff.contenthashModified.protocol}`}
                    isExpanded={expandedItems.has("contenthash-modified")}
                    onToggle={() => toggleItem("contenthash-modified")}
                  >
                    <Text size="xs" color="grey">
                      {oldRecords.contenthash
                        ? `${oldRecords.contenthash.protocol} - ${formatValue(
                            oldRecords.contenthash.value,
                            40
                          )}`
                        : "None"}{" "}
                      → {formatValue(diff.contenthashModified.value, 40)}
                    </Text>
                  </ExpandableBadge>
                </div>
              </div>
            )}

            {diff.contenthashRemoved && (
              <div className="record-summary-section">
                <Text
                  weight="medium"
                  size="sm"
                  color="grey"
                  className="ns-mb-1"
                >
                  Removed
                </Text>
                {oldRecords.contenthash && (
                  <div className="record-summary-badges-container">
                    <SimpleBadge
                      icon={<Icon name="globe" size={16} />}
                      label={`Protocol: ${oldRecords.contenthash.protocol}`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </Accordion>
          )}

          {/* Error Display */}
          {error && <ContractErrorLabel error={error} />}

          {/* Action Buttons */}
          <div className="record-update-summary-actions">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onCancel}
              disabled={btnDisabled}
            >
              Cancel
            </Button>
            <Button 
              size="lg" 
              onClick={onConfirm}
              disabled={btnDisabled}
              loading={isUpdating?.waitingTx || isUpdating?.waitingWallet}
            >
              {btnLabel}
            </Button>
          </div>
      </div>
    </div>
  );
};

export default RecordUpdateSummary;
