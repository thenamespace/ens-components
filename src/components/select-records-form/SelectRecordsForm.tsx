import { ReactElement, useMemo, useState } from "react";
import {
  EnsAddressRecord,
  EnsContenthashRecord,
  EnsRecords,
  EnsTextRecord,
} from "@/types";
import { Button, Text } from "../atoms";
import { TextRecords } from "./text-records/TextRecords";
import { AddressRecords } from "./address-record/AddressRecords";
import { ContenthashRecord } from "./contenthash-records/ContenthashRecord";
import "./SelectRecordsForm.css";
import {
  RecordsAddedParams,
  RecordsSelector,
  ScrollToRecordSegment,
} from "./records-selector/RecordsSelector";
import { ImageRecords } from "./image-records/ImageRecords";

const NAV_TEXTS = "Text Records";
const NAV_ADDRS = "Address Records";
const WEBSITE = "Website";

const navigation_items: string[] = [NAV_TEXTS, NAV_ADDRS, WEBSITE];

export interface SelectRecordsFormProps {
  records: EnsRecords;
  onRecordsUpdated: (records: EnsRecords) => void;
  actions?: ReactElement;
}

export const SelectRecordsForm = ({
  records,
  onRecordsUpdated,
  actions,
}: SelectRecordsFormProps) => {
  const [selectedItem, setSelectedItem] = useState<string>(NAV_TEXTS);
  const [selectRecords, setSelectRecords] = useState<boolean>(false);

  const handleTextsUpdated = (texts: EnsTextRecord[]) => {
    onRecordsUpdated({ ...records, texts });
  };

  const handleAddressesUpdated = (addresses: EnsAddressRecord[]) => {
    onRecordsUpdated({ ...records, addresses });
  };

  const handleRecordsAdded = (params: RecordsAddedParams) => {
    const newTexts = [...records.texts];
    if (params.keys.length > 0) {
      params.keys.forEach(key => {
        newTexts.push({ key: key, value: "" });
      });
    }
    const newAddresses = [...records.addresses];
    if (params.coins.length > 0) {
      params.coins.forEach(coin => {
        newAddresses.push({ coinType: coin, value: "" });
      });
    }

    let newContenthash = records.contenthash
      ? { ...records.contenthash }
      : undefined; 
    
    if (params.contenthash?.protocol) {
      const value = records.contenthash?.value || ""
      newContenthash = {
        protocol: params.contenthash.protocol,
        value: value,
      };
    }
    onRecordsUpdated({
      texts: newTexts,
      addresses: newAddresses,
      contenthash: newContenthash
    })
  };

  const { avatar, header } = useMemo(() => {
    return {
      avatar: records.texts.find(r => r.key === "avatar")?.value,
      header: records.texts.find(r => r.key === "header")?.value,
    };
  }, [records.texts]);

  const handleContenthashUpdated = (contenthash: EnsContenthashRecord) => {
    onRecordsUpdated({ ...records, contenthash });
  };

  const handleContenthashRemoved = () => {
    const _records = { ...records };
    delete _records.contenthash;
    onRecordsUpdated(_records);
  };

  // defines whether to scroll
  // to certai record category
  // when records selector is opened
  const getScrollToSegment = (): ScrollToRecordSegment | undefined => {
    if (selectedItem === NAV_ADDRS) {
      return "addresses";
    } else if (selectedItem === WEBSITE) {
      return "website";
    }
  };

  const handleImageRecordAdded = (
    record: "avatar" | "header",
    value: string
  ) => {
    const _texts = records.texts.filter(text => text.key !== record);
    onRecordsUpdated({
      ...records,
      texts: [..._texts, { key: record, value }],
    });
    setSelectedItem(NAV_TEXTS);
  };

  return (
    <div className="ns-select-records-form">
      {!selectRecords && (
        <>
          {/* // cover and avatar */}
          <div style={{ marginBottom: 50 }}>
            <ImageRecords
              avatar={avatar}
              header={header}
              onAvatarAdded={(value: string) =>
                handleImageRecordAdded("avatar", value)
              }
              onHeaderAdded={(value: string) =>
                handleImageRecordAdded("header", value)
              }
            />
          </div>

          {/* nav items */}
          <div className="ns-select-records-nav d-flex justify-content-around align-items-center">
            {navigation_items.map(item => (
              <div
                key={item}
                onClick={() => setSelectedItem(item)}
                className={`nav-cont d-flex align-items-center justify-content-center ${selectedItem === item ? "active" : ""}`}
              >
                <Text
                  size="sm"
                  weight="medium"
                  color={selectedItem === item ? "primary" : "grey"}
                >
                  {item}
                </Text>
              </div>
            ))}
          </div>

          {/* records */}
          <div className="ns-select-records-content">
            {selectedItem === NAV_TEXTS && (
              <TextRecords
                texts={records.texts}
                onTextsChanged={handleTextsUpdated}
              ></TextRecords>
            )}
            {selectedItem === NAV_ADDRS && (
              <AddressRecords
                addresses={records.addresses}
                onAddressesChanged={newAddresses =>
                  handleAddressesUpdated(newAddresses)
                }
              />
            )}
            {selectedItem === WEBSITE && (
              <ContenthashRecord
                contenthash={records.contenthash}
                onContenthashChanged={hash => handleContenthashUpdated(hash)}
                onContenthashRemoved={() => handleContenthashRemoved()}
              />
            )}
            <div
              style={{
                padding: 20,
                paddingTop: 0,
                paddingBottom: actions ? 0 : 20,
              }}
            >
              <Button
                onClick={() => setSelectRecords(true)}
                style={{ width: "100%", padding: "10px" }}
                variant="outline"
              >
                + Add Record
              </Button>
            </div>
            {actions && (
              <div className="ns-mt-2 ns-record-actions">{actions}</div>
            )}
          </div>
        </>
      )}
      {selectRecords && (
        <RecordsSelector
          texts={records.texts}
          addresses={records.addresses}
          contenthash={records.contenthash}
          onClose={() => setSelectRecords(false)}
          segment={getScrollToSegment()}
          onRecordsAdded={(params) => handleRecordsAdded(params)}
        />
      )}
    </div>
  );
};
