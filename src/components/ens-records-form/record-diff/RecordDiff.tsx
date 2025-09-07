import { Text } from "@/components/atoms";
import { getSupportedTextMap, SupportedTextRecord } from "@/constants";
import { EnsRecordsDiff } from "@/utils";

interface RecordDiffProps {
  diff: EnsRecordsDiff;
}

const textMap: Record<string, SupportedTextRecord> = getSupportedTextMap();

export const RecordDiff = ({ diff }: RecordDiffProps) => {
  const {
    textsAdded,
    textsModified,
    textsRemoved,
    addressesAdded,
    addressesModified,
    addressesRemoved,
  } = diff;

  return (
    <div className="ns-record-diff">
      {textsAdded.length  > 0 && (
        <div>
          <Text>Texts added</Text>
          {textsAdded.map(txt => txt.key)}
        </div>
      )}
      {textsModified.length  > 0 && (
        <div>
          <Text>Texts modified</Text>
          {textsModified.map(txt => txt.key)}
        </div>
      )}
      {textsRemoved.length  > 0 && (
        <div>
          <Text>Texts removed</Text>
          {textsRemoved.map(txt => txt.key)}
        </div>
      )}
      {addressesAdded.length  > 0 && (
        <div>
          <Text>Address added</Text>
          {addressesAdded.map(addr => addr.coinType)}
        </div>
      )}
      {addressesModified.length > 0 && (
        <div>
          <Text>Address modified</Text>
          {addressesModified.map(addr => addr.coinType)}
        </div>
      )}
      {addressesRemoved.length  > 0 && (
        <div>
          <Text>Address removed</Text>
          {addressesRemoved.map(addr => addr.coinType)}
        </div>
      )}
    </div>
  );
};
