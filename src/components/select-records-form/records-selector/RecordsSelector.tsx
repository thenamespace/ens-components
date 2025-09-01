import {
  EnsContenthashRecord,
  EnsAddressRecord,
  EnsTextRecord,
  ContenthashProtocol,
} from "@/types";
import "./RecordsSelector.css";
import {
  Button,
  ChainIcon,
  Icon,
  IconName,
  Input,
  Text,
} from "@/components/atoms";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getSupportedAddressByName,
  supportedAddresses,
  supportedContenthashRecords,
  SupportedTextRecord,
  supportedTexts,
  TextRecordCategory,
} from "@/constants";
import { ContenthashIcon } from "@/components/molecules";

// Segment tells component to scroll into view
// to a certain record type
export type ScrollToRecordSegment = "texts" | "addresses" | "website";

interface RecordsSelectorProps {
  texts: EnsTextRecord[];
  addresses: EnsAddressRecord[];
  contenthash?: EnsContenthashRecord;
  segment?: ScrollToRecordSegment;
  onTextsAdded: (keys: string[]) => void;
  onAddressesAdded: (coins: number[]) => void;
  onContenthashAdded: (contenthash: EnsContenthashRecord) => void;
  onClose: () => void;
}

enum SidebarNavItem {
  General = "General",
  Social = "Social",
  Addresses = "Addresses",
  Website = "Website",
}

const navIcons: Record<SidebarNavItem, IconName> = {
  General: "box",
  Social: "square-user",
  Addresses: "pin",
  Website: "globe",
};

export const RecordsSelector = ({
  onClose,
  texts,
  addresses,
  contenthash,
  segment,
  onTextsAdded,
  onAddressesAdded,
  onContenthashAdded,
}: RecordsSelectorProps) => {
  const [selectedTextsMap, setSelectedTextsMap] = useState<
    Record<string, boolean>
  >({});
  const [selectedAddressesMap, setSelectedAddressesMap] = useState<
    Record<string, boolean>
  >({});
  const [selectedContenthash, setSelectedContenthash] =
    useState<ContenthashProtocol | null>(null);
  const [currentNav, setCurrentNav] = useState<SidebarNavItem>(
    SidebarNavItem.General
  );
  const [filterValue, setFilterValue] = useState("");

  const { addedTexts, addedAddrs } = useMemo(() => {
    const addedTexts: Record<string, boolean> = {};
    const addedAddrs: Record<number, boolean> = {};

    texts.forEach(txt => {
      addedTexts[txt.key] = true;
    });

    addresses.map(addr => {
      addedAddrs[addr.coinType] = true;
    });

    return { addedAddrs, addedTexts };
  }, [texts, addresses]);

  const parentRef = useRef<HTMLDivElement | null>(null);
  const generalCategoryRef = useRef<HTMLDivElement | null>(null);
  const socialCategoryRef = useRef<HTMLDivElement | null>(null);
  const addressesCategoryRef = useRef<HTMLDivElement | null>(null);
  const websiteCategoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      segment &&
      generalCategoryRef.current &&
      addressesCategoryRef.current &&
      websiteCategoryRef.current
    ) {
      if (segment === "addresses") {
        scrollToNav(SidebarNavItem.Addresses);
      } else if (segment === "website") {
        scrollToNav(SidebarNavItem.Website);
      }
    }
  }, [segment, generalCategoryRef, addressesCategoryRef, websiteCategoryRef]);

  const textRecordMap = useMemo<
    Record<"General" | "Social", SupportedTextRecord[]>
  >(() => {
    const records: Record<"General" | "Social", SupportedTextRecord[]> = {
      General: supportedTexts.filter(
        txt => txt.category === TextRecordCategory.General
      ),
      Social: supportedTexts.filter(
        txt => txt.category === TextRecordCategory.Social
      ),
    };

    return records;
  }, []);

  const recordsAddedCount = useMemo(() => {
    const addedTexts = Object.keys(selectedTextsMap).length;
    const addedAddrs = Object.keys(selectedAddressesMap).length;
    const contenthashAdded = selectedContenthash ? 1 : 0;

    return addedTexts + addedAddrs + contenthashAdded;
  }, [selectedTextsMap, selectedAddressesMap, selectedContenthash]);

  const handleAddRecords = () => {
    const textKeys = Object.keys(selectedTextsMap);
    if (textKeys.length > 0) {
      onTextsAdded(textKeys);
    }
    const addressKeys = Object.keys(selectedAddressesMap);
    if (addressKeys.length > 0) {
      onAddressesAdded(
        addressKeys.map(i => {
          const s = getSupportedAddressByName(i as any);
          return s?.coinType || -1;
        })
      );
    }

    if (selectedContenthash) {
      onContenthashAdded({ protocol: selectedContenthash, value: "" });
    }

    setSelectedContenthash(null);
    setSelectedTextsMap({});
    setSelectedAddressesMap({});
    onClose();
  };

  const handleNavChanged = (nav: SidebarNavItem) => {
    scrollToNav(nav);
    setCurrentNav(nav);
  };

  const scrollToNav = (nav: SidebarNavItem) => {
    if (nav === SidebarNavItem.General && generalCategoryRef.current) {
      generalCategoryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (nav === SidebarNavItem.Social && socialCategoryRef.current) {
      socialCategoryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (
      nav === SidebarNavItem.Addresses &&
      addressesCategoryRef.current
    ) {
      addressesCategoryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (nav === SidebarNavItem.Website && websiteCategoryRef.current) {
      websiteCategoryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const toggleSelectText = (textKey: string) => {
    const textMap = { ...selectedTextsMap };
    if (textMap[textKey]) {
      delete textMap[textKey];
    } else {
      textMap[textKey] = true;
    }
    setSelectedTextsMap(textMap);
  };

  const toggleSelectAddress = (chainName: string) => {
    const addressMap = { ...selectedAddressesMap };
    if (addressMap[chainName]) {
      delete addressMap[chainName];
    } else {
      addressMap[chainName] = true;
    }
    setSelectedAddressesMap(addressMap);
  };

  const toggleSelectContenthash = (protocol: ContenthashProtocol) => {
    if (selectedContenthash && selectedContenthash === protocol) {
      setSelectedContenthash(null);
    } else {
      setSelectedContenthash(protocol);
    }
  };

  const isTextSelected = (key: string) => {
    return selectedTextsMap[key];
  };

  const isAddressSelected = (chainName: string) => {
    return selectedAddressesMap[chainName];
  };

  return (
    <div className="ns-records-selector">
      <div
        onClick={onClose}
        className="ns-mb-3 text-center"
        style={{ textAlign: "center" }}
      >
        <Icon name="x"></Icon>
        <Text size="lg" weight="bold">
          Add Records
        </Text>
        <Text color="grey" size="sm" weight="medium">
          Lorem ipusm doalr sit amer
        </Text>
      </div>
      <div className="ns-mb-3">
        <Input value={filterValue} onChange={(e) => {
            setFilterValue(e.target.value)
        }} prefix={<Icon size={18} name="search" />} placeholder="Search" />
      </div>
      <div className="ns-records-sidebar row" ref={parentRef}>
        <div className="col-4">
          {Object.keys(SidebarNavItem).map(sideItem => {
            const item = sideItem as SidebarNavItem;
            const activeClass = item === currentNav ? "active" : "";

            return (
              <div
                onClick={() => handleNavChanged(item)}
                key={sideItem}
                className={`sidebar-item d-flex align-items-center ${activeClass}`}
              >
                <Icon className="ns-me-1" size={16} name={navIcons[item]} />
                <Text size="sm" weight="medium">
                  {item}
                </Text>
              </div>
            );
          })}
        </div>
        <div className="col-8 ns-records-content">
          <div
            ref={generalCategoryRef}
            className="ns-records-selector-category ns-mb-2"
          >
            <Text className="ns-mb-1" weight="bold">
              General
            </Text>
            <div className="row g-1">
              {textRecordMap.General.map(item => {
                const isActive = isTextSelected(item.key);
                const isDisabled = addedTexts[item.key];
                return (
                  <div className="col-6" key={item.key}>
                    <div
                      onClick={() => {
                        if (!isDisabled) {
                          toggleSelectText(item.key);
                        }
                      }}
                      className={`ns-text-record d-flex align-items-center ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
                    >
                      <div className="ns-icon-cont ns-me-1">
                        <Icon
                          color={isActive ? undefined : "white"}
                          name={item.icon}
                          size={12}
                        />
                      </div>
                      <Text
                        weight="medium"
                        color={isActive ? "white" : "primary"}
                        size="sm"
                      >
                        {item.label}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            ref={socialCategoryRef}
            className="ns-records-selector-category ns-mb-2"
          >
            <Text className="ns-mb-1" weight="bold">
              Social
            </Text>
            <div className="row g-1">
              {textRecordMap.Social.map(item => {
                const isActive = isTextSelected(item.key);
                const isDisabled = addedTexts[item.key];
                return (
                  <div key={item.key} className="col-6">
                    <div
                      onClick={() => {
                        if (!isDisabled) {
                          toggleSelectText(item.key);
                        }
                      }}
                      className={`ns-text-record d-flex align-items-center ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
                      key={item.key}
                    >
                      <div className="ns-icon-cont ns-me-1">
                        <Icon
                          color={isActive ? undefined : "white"}
                          name={item.icon}
                          size={12}
                        />
                      </div>
                      <Text
                        weight="medium"
                        color={isActive ? "white" : "primary"}
                        size="sm"
                      >
                        {item.label}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            ref={addressesCategoryRef}
            className="ns-records-selector-category ns-mb-2"
          >
            <Text className="ns-mb-1" weight="bold">
              Addresses
            </Text>
            <div className="row g-1">
              {supportedAddresses.map(item => {
                const isActive = isAddressSelected(item.chainName);
                const isAlreadySelected = addedAddrs[item.coinType];
                return (
                  <div className="col-6" key={item.chainName}>
                    <div
                      onClick={() => {
                        if (!isAlreadySelected) {
                          toggleSelectAddress(item.chainName);
                        }
                      }}
                      className={`ns-text-record d-flex align-items-center ${isActive ? "active" : ""} ${isAlreadySelected ? "disabled" : ""} `}
                      key={item.chainName}
                    >
                      <ChainIcon
                        className="me-1"
                        chain={item.chainName}
                        size={22}
                      />
                      <Text
                        weight="medium"
                        color={isActive ? "white" : "primary"}
                        size="sm"
                      >
                        {item.label}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            ref={websiteCategoryRef}
            className="ns-records-selector-category"
          >
            <Text className="ns-mb-1" weight="bold">
              Website
            </Text>
            <div className="row g-1">
              {supportedContenthashRecords.map(chash => {
                const isActive = chash.protocol === selectedContenthash;
                const isAlreadySelected =
                  contenthash && contenthash.protocol === chash.protocol;
                return (
                  <div className="col-6" key={chash.protocol}>
                    <div
                      onClick={() => {
                        if (!isAlreadySelected) {
                          toggleSelectContenthash(chash.protocol);
                        }
                      }}
                      className={`ns-text-record d-flex align-items-center ${isActive ? "active" : ""} ${isAlreadySelected ? "disabled" : ""} `}
                    >
                      <ContenthashIcon
                        className="me-1"
                        protocol={chash.protocol}
                        size={22}
                      />
                      <Text
                        weight="medium"
                        color={isActive ? "white" : "primary"}
                        size="sm"
                      >
                        {chash.label}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="ns-mt-3">
        <Button
          style={{ width: "50%" }}
          size="lg"
          onClick={() => onClose()}
          className="pe-2"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleAddRecords()}
          disabled={recordsAddedCount === 0}
          style={{ width: "50%" }}
          size="lg"
        >
          Add {recordsAddedCount}
        </Button>
      </div>
    </div>
  );
};
