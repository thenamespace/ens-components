import { Input, Text, Icon } from "@/components/atoms";
import { ContenthashIcon } from "@/components/molecules";
import {
  getSupportedChashByProtocol,
  isContenthashValid,
  SupportedContenthashRecord,
  supportedContenthashRecords,
} from "@/constants";
import { ContenthashProtocol, EnsContenthashRecord } from "@/types";
import { useMemo, useRef } from "react";

interface ContenthashRecordProps {
  contenthash?: EnsContenthashRecord;
  onContenthashChanged: (value: EnsContenthashRecord) => void;
  onContenthashRemoved: () => void;
  onContenthashAdded: (protocol: ContenthashProtocol) => void;
  searchFilter?: string;
}

export const ContenthashRecord = ({
  contenthash,
  onContenthashChanged,
  onContenthashRemoved,
  onContenthashAdded,
  searchFilter,
}: ContenthashRecordProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const metadata = useMemo<SupportedContenthashRecord | undefined>(() => {
    if (contenthash?.protocol) {
      return getSupportedChashByProtocol(contenthash?.protocol);
    }
  }, [contenthash]);

  const handleContenthashChanged = (
    protocol: ContenthashProtocol,
    inputValue: string
  ) => {
    const protocolPrefix = metadata!.protocolPrefix;
    
    // If input is shorter than or equal to prefix length, store empty string
    // This prevents issues when user deletes characters from the prefix
    if (inputValue.length <= protocolPrefix.length) {
      onContenthashChanged({ protocol, value: "" });
      return;
    }
    
    // Strip the protocol prefix from the value before storing
    let cleanValue = inputValue;
    if (cleanValue.startsWith(protocolPrefix)) {
      cleanValue = cleanValue.substring(protocolPrefix.length);
    } else {
      // If it doesn't start with prefix but is longer, it means user deleted part of prefix
      // In this case, extract what comes after where the prefix should be
      // But to be safe, just store empty to reset
      onContenthashChanged({ protocol, value: "" });
      return;
    }
    
    // Store only the clean value without the prefix
    onContenthashChanged({ protocol, value: cleanValue });
  };

  const filterChash = (record: SupportedContenthashRecord): boolean => {
    if (searchFilter && searchFilter.length > 0) {
      const lowercase = searchFilter.toLocaleLowerCase();
      return (
        record.protocol.toLocaleLowerCase().includes(lowercase) ||
        record.label.toLocaleLowerCase().includes(lowercase)
      );
    }

    return true;
  };

  const prefixWithProtocol = (value: string, protocol: ContenthashProtocol) => {
   const protocolPrefix = metadata!.protocolPrefix;
    
    // If value is empty, show just the prefix
    if (value.length === 0) {
      return protocolPrefix;
    }
    
    // If value already starts with the prefix, return as is (shouldn't happen but handle it)
    if (value.startsWith(protocolPrefix)) {
      return value;
    }
    
    // Always prefix the value for display
    return `${protocolPrefix}${value}`;
  };

  const filteredSuggestions: SupportedContenthashRecord[] = useMemo(() => {
    return supportedContenthashRecords.filter(record => filterChash(record));
  }, [searchFilter]);

  if (filteredSuggestions.length === 0) {
    return <></>;
  }


  return (
    <div className="ns-text-records">
      <Text className="ns-mb-2" weight="bold">
        Website
      </Text>
      {!contenthash && (
        <div className="row g-2">
          {filteredSuggestions.map(record => (
            <div key={record.protocol} className="col col-lg-3 col-sm-6 col-6">
              <div
                className="ns-text-suggestion"
                onClick={() => onContenthashAdded(record.protocol)}
              >
                <ContenthashIcon size={20} protocol={record.protocol} />
                <Text className="ns-mt-1" size="xs" weight="medium">
                  {record.label}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
      {contenthash && metadata && filterChash(metadata) && (
        <div>
          <Text
            style={{ marginBottom: "4px" }}
            color="grey"
            size="xs"
            weight="medium"
          >
            {metadata.label}
          </Text>
          <div style={{ width: "100%" }} className="d-flex align-items-center">
            <Input
              ref={inputRef}
              style={{ width: "100%" }}
              onChange={e =>
                handleContenthashChanged(contenthash.protocol, e.target.value)
              }
              onKeyDown={e => {
                const protocolPrefix = `${contenthash.protocol}://`;
                const input = e.currentTarget;
                const cursorPosition = input.selectionStart || 0;
                
                // Prevent deletion of the prefix part
                if (cursorPosition <= protocolPrefix.length) {
                  // If Backspace or Delete would remove part of the prefix, prevent it
                  if (e.key === "Backspace" && cursorPosition > 0) {
                    e.preventDefault();
                    // Move cursor to after the prefix
                    setTimeout(() => {
                      input.setSelectionRange(protocolPrefix.length, protocolPrefix.length);
                    }, 0);
                  } else if (e.key === "Delete" && cursorPosition < protocolPrefix.length) {
                    e.preventDefault();
                  }
                }
              }}
              error={
                contenthash.value.length > 0 &&
                !isContenthashValid(contenthash.protocol, contenthash.value)
              }
              prefix={
                <ContenthashIcon protocol={contenthash.protocol} size={18} />
              }
              value={prefixWithProtocol(contenthash.value, contenthash.protocol)}
              placeholder={`${contenthash.protocol}://`}
            />
            <div
              onClick={() => onContenthashRemoved()}
              className="ns-close-icon ns-ms-1"
            >
              <Icon name="x" size={18} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
