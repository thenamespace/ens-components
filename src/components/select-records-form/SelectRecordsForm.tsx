import { RefObject, useMemo, useRef, useState } from "react";
import {
  ContenthashProtocol,
  EnsAddressRecord,
  EnsContenthashRecord,
  EnsRecords,
  EnsTextRecord,
} from "@/types";
import { Icon, Input, Text } from "../atoms";
import { TextRecords } from "./text-records/TextRecords";
import { AddressRecords } from "./address-record/AddressRecords";
import { ContenthashRecord } from "./contenthash-records/ContenthashRecord";
import "./SelectRecordsForm.css";
import { RecordsAddedParams } from "./records-selector/RecordsSelector";
import { ImageRecords } from "./image-records/ImageRecords";
import { deepCopy } from "@/utils";
import { TextRecordCategory } from "@/constants";

enum RecordsSidebarItem {
  General = "General",
  Social = "Social",
  Addresses = "Addresses",
  Website = "Website",
}

export interface SelectRecordsFormProps {
  records: EnsRecords;
  onRecordsUpdated: (records: EnsRecords) => void;
}

export const SelectRecordsForm = ({
  records,
  onRecordsUpdated,
}: SelectRecordsFormProps) => {
  const [initialRecords] = useState<EnsRecords>(deepCopy(records));

  const generalCategoryRef = useRef<HTMLDivElement | null>(null);
  const socialCategoryRef = useRef<HTMLDivElement | null>(null);
  const addressesCategoryRef = useRef<HTMLDivElement | null>(null);
  const websiteCategoryRef = useRef<HTMLDivElement | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const [currentNav, setCurrentNav] = useState<RecordsSidebarItem>(
    RecordsSidebarItem.General
  );

  const handleTextsUpdated = (texts: EnsTextRecord[]) => {
    onRecordsUpdated({ ...records, texts });
  };

  const handleAddressesUpdated = (addresses: EnsAddressRecord[]) => {
    onRecordsUpdated({ ...records, addresses });
  };

  const scrollToCategory = (category: RecordsSidebarItem) => {
    const references: Record<
      RecordsSidebarItem,
      RefObject<HTMLDivElement | null>
    > = {
      General: generalCategoryRef,
      Social: socialCategoryRef,
      Website: websiteCategoryRef,
      Addresses: addressesCategoryRef,
    };

    const currentRef = references[category];

    if (currentRef && currentRef.current) {
      currentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSidebarChange = (
    nav: RecordsSidebarItem,
    scroll: boolean = true
  ) => {
    setCurrentNav(nav);
    if (scroll) {
      scrollToCategory(nav);
    }
  };

  const handleContenthashAdded = (protocol: ContenthashProtocol) => {
    const oldContenthash = initialRecords.contenthash;

    let value = "";
    if (oldContenthash && oldContenthash.protocol === protocol) {
      value = oldContenthash.value;
    }
    onRecordsUpdated({ ...records, contenthash: { protocol, value } });
  };

  const handleRecordsAdded = (params: RecordsAddedParams) => {
    const newTexts = [...records.texts];
    if (params.keys.length > 0) {
      params.keys.forEach(key => {
        // If someone removes text thats initialy existed
        // and readed it, let also set the initial value
        const initialValue = initialRecords.texts.find(txt => txt.key === key);
        newTexts.push({
          key: key,
          value: initialValue ? initialValue.value : "",
        });
      });
    }
    const newAddresses = [...records.addresses];
    if (params.coins.length > 0) {
      params.coins.forEach(coin => {
        const initialValue = initialRecords.addresses.find(
          addr => addr.coinType === coin
        );
        newAddresses.push({
          coinType: coin,
          value: initialValue ? initialValue.value : "",
        });
      });
    }

    let newContenthash = records.contenthash
      ? { ...records.contenthash }
      : undefined;

    if (params.contenthash?.protocol) {
      const value = initialRecords.contenthash?.value || "";
      newContenthash = {
        protocol: params.contenthash.protocol,
        value: value,
      };
    }
    onRecordsUpdated({
      texts: newTexts,
      addresses: newAddresses,
      contenthash: newContenthash,
    });
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

  const handleImageRecordAdded = (
    record: "avatar" | "header",
    value: string
  ) => {
    const _texts = records.texts.filter(text => text.key !== record);

    let _value = value;
    if (_value.length === 0) {
      const initialValue = initialRecords.texts.find(txt => txt.key === record);
      _value = initialValue ? initialValue.value : value;
    }

    onRecordsUpdated({
      ...records,
      texts: [..._texts, { key: record, value: _value }],
    });
    scrollToCategory(RecordsSidebarItem.General);
  };

  return (
    <div className="ns-select-records-form">
      {/* Avatar and header */}
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
      {/* Search Input */}
      <div className="ns-records-content-wrapper">
        <div className="ns-records-content row g-2">
          <div className="col-12 ns-mb-1">
            <Input
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search"
              prefix={<Icon name="search" size={18} />}
            />
          </div>
          {/* Sidebar Navigation */}
          <div className="col col-sm-3 col-12 ns-records-sidebar">
            {Object.keys(RecordsSidebarItem).map(item => {
              return (
                <div
                  onClick={() =>
                    handleSidebarChange(item as RecordsSidebarItem)
                  }
                  key={item}
                  className={`sidebar-item ${item === currentNav ? "active" : ""}`}
                >
                  <Text weight="medium" size="sm">
                    {item}
                  </Text>
                </div>
              );
            })}
          </div>
          {/* Record Container */}
          <div className="col col-sm-9 col-12 ns-records-inner ns-styled-scrollbar">
            {/* General Records */}
            <div ref={generalCategoryRef} className="ns-mb-2">
              <TextRecords
                initialTexts={initialRecords.texts}
                texts={records.texts}
                onTextsChanged={handleTextsUpdated}
                category={TextRecordCategory.General}
                searchFilter={searchFilter}
              />
            </div>
            {/* Social Records Records */}
            <div ref={socialCategoryRef} className="ns-mb-2">
              <TextRecords
                initialTexts={initialRecords.texts}
                texts={records.texts}
                onTextsChanged={handleTextsUpdated}
                category={TextRecordCategory.Social}
                searchFilter={searchFilter}
              />
            </div>
            {/* Address Records */}
            <div ref={addressesCategoryRef} className="ns-mb-2">
              <AddressRecords
                initialAddresses={initialRecords.addresses}
                addresses={records.addresses}
                onAddressesChanged={e => handleAddressesUpdated(e)}
                searchFilter={searchFilter}
              />
            </div>
            {/* Address Records */}
            <div ref={websiteCategoryRef} className="ns-mb-2">
              <ContenthashRecord
                contenthash={records.contenthash}
                onContenthashChanged={e => handleContenthashUpdated(e)}
                onContenthashRemoved={() => handleContenthashRemoved()}
                onContenthashAdded={e => handleContenthashAdded(e)}
                searchFilter={searchFilter}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
