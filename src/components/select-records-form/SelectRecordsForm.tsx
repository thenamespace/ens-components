import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  ContenthashProtocol,
  EnsAddressRecord,
  EnsContenthashRecord,
  EnsRecords,
  EnsTextRecord,
} from "@/types";
import { Icon, Input, Text } from "../atoms";
import { Alert } from "../molecules";
import { TextRecords } from "./text-records/TextRecords";
import { AddressRecords } from "./address-record/AddressRecords";
import { ContenthashRecord } from "./contenthash-records/ContenthashRecord";
import "./SelectRecordsForm.css";
import { RecordsAddedParams } from "./records-selector/RecordsSelector";
import { ImageRecords } from "./image-records/ImageRecords";
import { deepCopy } from "@/utils";
import { TextRecordCategory } from "@/constants";
import { AvatarUploadModal } from "./avatar-upload/AvatarUploadModal";

enum RecordsSidebarItem {
  General = "General",
  Social = "Social",
  Addresses = "Addresses",
  Website = "Website",
}

const appendPreviewVersion = (url: string, version: string) => {
  return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
};

export interface AvatarUploadContext {
  ensName: string;
  isTestnet?: boolean;
  siweDomain?: string;
}

export interface SelectRecordsFormProps {
  records: EnsRecords;
  onRecordsUpdated: (records: EnsRecords) => void;
  actionButtons?: React.ReactNode;
  avatarUpload?: AvatarUploadContext;
}

export const SelectRecordsForm = ({
  records,
  onRecordsUpdated,
  actionButtons,
  avatarUpload,
}: SelectRecordsFormProps) => {
  const [initialRecords] = useState<EnsRecords>(deepCopy(records));
  const [isAvatarUploadOpen, setIsAvatarUploadOpen] = useState(false);
  const [avatarUploadFeedback, setAvatarUploadFeedback] = useState<
    string | null
  >(null);
  const [avatarPreviewVersion, setAvatarPreviewVersion] = useState<{
    url: string;
    version: string;
  } | null>(null);

  const generalCategoryRef = useRef<HTMLDivElement | null>(null);
  const socialCategoryRef = useRef<HTMLDivElement | null>(null);
  const addressesCategoryRef = useRef<HTMLDivElement | null>(null);
  const websiteCategoryRef = useRef<HTMLDivElement | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const [currentNav, setCurrentNav] = useState<RecordsSidebarItem>(
    RecordsSidebarItem.General
  );

  const recordsInnerRef = useRef<HTMLDivElement | null>(null);
  const isScrollingProgrammatically = useRef(false);

  // Update active nav based on scroll position
  useEffect(() => {
    const scrollContainer = recordsInnerRef.current;
    if (!scrollContainer) return;

    const refs = [
      { ref: generalCategoryRef, nav: RecordsSidebarItem.General },
      { ref: socialCategoryRef, nav: RecordsSidebarItem.Social },
      { ref: addressesCategoryRef, nav: RecordsSidebarItem.Addresses },
      { ref: websiteCategoryRef, nav: RecordsSidebarItem.Website },
    ];

    const updateActiveNav = () => {
      // Don't update if we're programmatically scrolling
      if (isScrollingProgrammatically.current) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const containerTop = containerRect.top;

      // Find which section is closest to the top of the visible area
      let closestSection: RecordsSidebarItem | null = null;
      let closestDistance = Infinity;

      refs.forEach(({ ref, nav }) => {
        if (ref.current) {
          const sectionRect = ref.current.getBoundingClientRect();
          const sectionTop = sectionRect.top - containerTop;

          // If section is visible and above or near the top
          if (sectionTop <= 100 && sectionTop > -100) {
            const distance = Math.abs(sectionTop);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestSection = nav;
            }
          }
        }
      });

      if (closestSection) {
        setCurrentNav(closestSection);
      }
    };

    // Initial check
    updateActiveNav();

    // Listen to scroll events
    scrollContainer.addEventListener("scroll", updateActiveNav);

    return () => {
      scrollContainer.removeEventListener("scroll", updateActiveNav);
    };
  }, []);

  const handleTextsUpdated = (texts: EnsTextRecord[]) => {
    const previousAvatar = records.texts.find(r => r.key === "avatar")?.value;
    const nextAvatar = texts.find(r => r.key === "avatar")?.value;

    if (avatarPreviewVersion && nextAvatar !== avatarPreviewVersion.url) {
      setAvatarPreviewVersion(null);
    }

    if (avatarUploadFeedback && previousAvatar !== nextAvatar) {
      setAvatarUploadFeedback(null);
    }

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
      isScrollingProgrammatically.current = true;
      currentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      // Reset flag after scroll animation completes
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 1000);
    }
  };

  const handleSidebarChange = (
    nav: RecordsSidebarItem,
    scroll: boolean = true
  ) => {
    // Set nav immediately when clicking
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
    const avatarRaw = records.texts.find(r => r.key === "avatar")?.value;
    const avatarWithVersion =
      avatarRaw &&
      avatarPreviewVersion &&
      avatarPreviewVersion.url === avatarRaw
        ? appendPreviewVersion(avatarRaw, avatarPreviewVersion.version)
        : avatarRaw;

    return {
      avatar: avatarWithVersion,
      header: records.texts.find(r => r.key === "header")?.value,
    };
  }, [records.texts, avatarPreviewVersion]);

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
    value: string,
    opts?: {
      scrollToGeneral?: boolean;
    }
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

    if (opts?.scrollToGeneral !== false) {
      scrollToCategory(RecordsSidebarItem.General);
    }
  };

  const handleAvatarUploaded = (data: { url: string; uploadedAt: string }) => {
    const uploadedAtMs = new Date(data.uploadedAt).getTime();
    const safeVersion = Number.isFinite(uploadedAtMs)
      ? uploadedAtMs.toString()
      : Date.now().toString();

    handleImageRecordAdded("avatar", data.url, {
      scrollToGeneral: false,
    });
    setAvatarPreviewVersion({
      url: data.url,
      version: safeVersion,
    });
    setAvatarUploadFeedback("Avatar uploaded. Avatar text record updated.");
  };

  const handleAvatarImageClick = () => {
    if (!avatarUpload) {
      return;
    }
    setAvatarUploadFeedback(null);
    setIsAvatarUploadOpen(true);
  };

  return (
    <div className="ns-select-records-form">
      {/* Avatar and header */}
      <div style={{ marginBottom: 30 }}>
        <ImageRecords
          avatar={avatar}
          header={header}
          onAvatarAdded={(value: string) =>
            handleImageRecordAdded("avatar", value)
          }
          onHeaderAdded={(value: string) =>
            handleImageRecordAdded("header", value)
          }
          onAvatarImageClick={avatarUpload ? handleAvatarImageClick : undefined}
        />
        {avatarUploadFeedback && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setAvatarUploadFeedback(null)}
          >
            <Text size="sm">{avatarUploadFeedback}</Text>
          </Alert>
        )}
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
          <div
            ref={recordsInnerRef}
            className="col col-sm-9 col-12 ns-records-inner ns-styled-scrollbar"
          >
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
            {/* Contenthash Records */}
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
      {actionButtons && (
        <div className="ns-select-records-actions">{actionButtons}</div>
      )}

      {avatarUpload && (
        <AvatarUploadModal
          isOpen={isAvatarUploadOpen}
          ensName={avatarUpload.ensName}
          isTestnet={avatarUpload.isTestnet}
          siweDomain={avatarUpload.siweDomain}
          onClose={() => setIsAvatarUploadOpen(false)}
          onUseManualUrl={() => handleImageRecordAdded("avatar", "")}
          onUploaded={handleAvatarUploaded}
        />
      )}
    </div>
  );
};
