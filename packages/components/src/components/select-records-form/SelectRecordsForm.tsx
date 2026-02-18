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
import { ImageUploadModal } from "./image-upload/ImageUploadModal";

enum RecordsSidebarItem {
  General = "General",
  Social = "Social",
  Addresses = "Addresses",
  Website = "Website",
}

type ImageRecordType = "avatar" | "header";

const IMAGE_RECORD_LABELS: Record<ImageRecordType, string> = {
  avatar: "Avatar",
  header: "Header",
};

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
  const [activeUploadTarget, setActiveUploadTarget] = useState<ImageRecordType | null>(
    null
  );
  const [imageUploadFeedback, setImageUploadFeedback] = useState<{
    record: ImageRecordType;
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [imagePreviewVersions, setImagePreviewVersions] = useState<
    Partial<Record<ImageRecordType, { url: string; version: string }>>
  >({});
  const [imageManualFocus, setImageManualFocus] = useState<{
    record: ImageRecordType;
    trigger: number;
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
    const previousByRecord: Record<ImageRecordType, string | undefined> = {
      avatar: records.texts.find(r => r.key === "avatar")?.value,
      header: records.texts.find(r => r.key === "header")?.value,
    };
    const nextByRecord: Record<ImageRecordType, string | undefined> = {
      avatar: texts.find(r => r.key === "avatar")?.value,
      header: texts.find(r => r.key === "header")?.value,
    };

    setImagePreviewVersions(prev => {
      let didChange = false;
      const next = { ...prev };
      (["avatar", "header"] as const).forEach(record => {
        const previewVersion = prev[record];
        if (previewVersion && nextByRecord[record] !== previewVersion.url) {
          delete next[record];
          didChange = true;
        }
      });
      return didChange ? next : prev;
    });

    if (
      imageUploadFeedback &&
      previousByRecord[imageUploadFeedback.record] !==
        nextByRecord[imageUploadFeedback.record]
    ) {
      setImageUploadFeedback(null);
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
    const headerRaw = records.texts.find(r => r.key === "header")?.value;

    const withVersion = (
      record: ImageRecordType,
      rawValue: string | undefined
    ): string | undefined => {
      const previewVersion = imagePreviewVersions[record];
      if (!rawValue || !previewVersion || previewVersion.url !== rawValue) {
        return rawValue;
      }
      return appendPreviewVersion(rawValue, previewVersion.version);
    };

    return {
      avatar: withVersion("avatar", avatarRaw),
      header: withVersion("header", headerRaw),
    };
  }, [records.texts, imagePreviewVersions]);

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

    let _value = typeof value === "string" ? value : "";
    if (_value.length === 0) {
      const initialValue = initialRecords.texts.find(txt => txt.key === record);
      _value = initialValue ? initialValue.value : "";
    }

    onRecordsUpdated({
      ...records,
      texts: [..._texts, { key: record, value: _value }],
    });

    if (opts?.scrollToGeneral !== false) {
      scrollToCategory(RecordsSidebarItem.General);
    }
  };

  const ensureImageRecordExists = (record: "avatar" | "header") => {
    const alreadyAdded = records.texts.some(text => text.key === record);
    if (alreadyAdded) {
      return;
    }

    const initialValue = initialRecords.texts.find(txt => txt.key === record);
    onRecordsUpdated({
      ...records,
      texts: [...records.texts, { key: record, value: initialValue?.value || "" }],
    });
  };

  const handleImageUploaded = (
    record: ImageRecordType,
    data: { url: string; uploadedAt: string }
  ) => {
    const uploadedUrl = data?.url?.trim();
    const label = IMAGE_RECORD_LABELS[record];

    if (!uploadedUrl) {
      setImageUploadFeedback({
        record,
        message: `No ${label.toLowerCase()} URL returned. Please try again.`,
        variant: "error",
      });
      return;
    }

    const currentUrl = records.texts.find(r => r.key === record)?.value?.trim();
    const isSameUrl = currentUrl === uploadedUrl;
    const safeVersion = Date.now().toString();

    handleImageRecordAdded(record, uploadedUrl, {
      scrollToGeneral: false,
    });
    setImagePreviewVersions(prev => ({
      ...prev,
      [record]: {
        url: uploadedUrl,
        version: safeVersion,
      },
    }));
    setImageUploadFeedback({
      record,
      message: isSameUrl ? `${label} refreshed.` : `${label} updated.`,
      variant: "success",
    });
  };

  const handleImageUploadRequested = (record: ImageRecordType) => {
    if (!avatarUpload) {
      return;
    }
    setImageUploadFeedback(null);
    setActiveUploadTarget(record);
  };

  const handleImageManualUrlRequested = (record: ImageRecordType) => {
    setImageUploadFeedback(null);
    ensureImageRecordExists(record);
    handleSidebarChange(RecordsSidebarItem.General);
    setImageManualFocus(prev => ({
      record,
      trigger: (prev?.trigger || 0) + 1,
    }));
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
          onAvatarUploadRequested={
            avatarUpload ? () => handleImageUploadRequested("avatar") : undefined
          }
          onAvatarManualUrlRequested={() => handleImageManualUrlRequested("avatar")}
          onHeaderUploadRequested={
            avatarUpload ? () => handleImageUploadRequested("header") : undefined
          }
          onHeaderManualUrlRequested={() => handleImageManualUrlRequested("header")}
        />
        {imageUploadFeedback && (
          <Alert
            variant={imageUploadFeedback.variant}
            dismissible
            onClose={() => setImageUploadFeedback(null)}
          >
            <Text size="sm">{imageUploadFeedback.message}</Text>
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
                focusRecordKey={imageManualFocus?.record}
                focusTrigger={imageManualFocus?.trigger}
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

      {avatarUpload && activeUploadTarget && (
        <ImageUploadModal
          isOpen={true}
          imageType={activeUploadTarget}
          ensName={avatarUpload.ensName}
          isTestnet={avatarUpload.isTestnet}
          siweDomain={avatarUpload.siweDomain}
          onClose={() => setActiveUploadTarget(null)}
          onUploaded={data => handleImageUploaded(activeUploadTarget, data)}
        />
      )}
    </div>
  );
};
