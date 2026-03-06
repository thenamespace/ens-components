import { EnsTextRecord } from "@/types";
import {
  SupportedTextRecord,
  supportedTexts,
  TextRecordCategory,
} from "@/constants";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, Input, Text, Textarea } from "@/components/atoms";
import { capitalize } from "@/utils";

interface CustomDraft {
  id: string;
  key: string;
  value: string;
}

const SUPPORTED_KEY_SET = new Set(supportedTexts.map(t => t.key));
const genDraftId = () => `${Date.now()}-${Math.random()}`;

interface TextRecordsProps {
  initialTexts: EnsTextRecord[];
  texts: EnsTextRecord[];
  onTextsChanged: (texts: EnsTextRecord[]) => void;
  category: TextRecordCategory;
  searchFilter?: string;
  focusRecordKey?: string;
  focusTrigger?: number;
}

export const TextRecords = ({
  texts,
  onTextsChanged,
  category,
  initialTexts,
  searchFilter,
  focusRecordKey,
  focusTrigger,
}: TextRecordsProps) => {
  const existingTextsMap = useMemo(() => {
    const map: Record<string, EnsTextRecord> = {};
    texts.forEach(txt => {
      map[txt.key] = txt;
    });
    return map;
  }, [texts]);

  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);
  const [customDrafts, setCustomDrafts] = useState<CustomDraft[]>([]);
  const inputRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement | null>
  >({});

  const draftKeys = useMemo(
    () => new Set(customDrafts.map(d => d.key).filter(Boolean)),
    [customDrafts]
  );

  const committedCustomTexts = useMemo(
    () => texts.filter(t => !SUPPORTED_KEY_SET.has(t.key) && !draftKeys.has(t.key)),
    [texts, draftKeys]
  );

  const isValidDraftKey = (key: string, draftId: string): boolean => {
    if (!key.trim()) return false;
    if (SUPPORTED_KEY_SET.has(key)) return false;
    if (committedCustomTexts.some(t => t.key === key)) return false;
    if (customDrafts.some(d => d.id !== draftId && d.key === key)) return false;
    return true;
  };

  const handleAddCustomDraft = () => {
    setCustomDrafts(prev => [...prev, { id: genDraftId(), key: "", value: "" }]);
  };

  const handleCustomDraftKeyChange = (draftId: string, newKey: string) => {
    const draft = customDrafts.find(d => d.id === draftId)!;
    const oldKey = draft.key;
    const updatedDrafts = customDrafts.map(d =>
      d.id === draftId ? { ...d, key: newKey } : d
    );
    setCustomDrafts(updatedDrafts);

    let newTexts = oldKey ? texts.filter(t => t.key !== oldKey) : [...texts];
    const isValid =
      newKey.trim() &&
      !SUPPORTED_KEY_SET.has(newKey) &&
      !newTexts.filter(t => !SUPPORTED_KEY_SET.has(t.key)).some(t => t.key === newKey) &&
      updatedDrafts.filter(d => d.id !== draftId).every(d => d.key !== newKey);
    if (isValid) {
      newTexts = [...newTexts, { key: newKey, value: draft.value }];
    }
    onTextsChanged(newTexts);
  };

  const handleCustomDraftValueChange = (draftId: string, newValue: string) => {
    const draft = customDrafts.find(d => d.id === draftId)!;
    setCustomDrafts(prev =>
      prev.map(d => (d.id === draftId ? { ...d, value: newValue } : d))
    );
    if (draft.key && texts.some(t => t.key === draft.key)) {
      onTextsChanged(
        texts.map(t => (t.key === draft.key ? { ...t, value: newValue } : t))
      );
    }
  };

  const handleRemoveCustomDraft = (draftId: string) => {
    const draft = customDrafts.find(d => d.id === draftId)!;
    setCustomDrafts(prev => prev.filter(d => d.id !== draftId));
    if (draft.key && texts.some(t => t.key === draft.key)) {
      onTextsChanged(texts.filter(t => t.key !== draft.key));
    }
  };

  const handleCommittedCustomValueChange = (key: string, value: string) => {
    onTextsChanged(texts.map(t => (t.key === key ? { ...t, value } : t)));
  };

  const handleRemoveCommittedCustom = (key: string) => {
    onTextsChanged(texts.filter(t => t.key !== key));
  };

  useEffect(() => {
    if (lastAddedKey && inputRefs.current[lastAddedKey]) {
      inputRefs.current[lastAddedKey]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      inputRefs.current[lastAddedKey]?.focus();
      setLastAddedKey(null);
    }
  }, [texts, lastAddedKey]);

  const [pendingExternalFocus, setPendingExternalFocus] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!focusRecordKey || focusTrigger === undefined) {
      return;
    }
    setPendingExternalFocus(focusRecordKey);
  }, [focusRecordKey, focusTrigger]);

  useEffect(() => {
    if (!pendingExternalFocus) {
      return;
    }

    const inputToFocus = inputRefs.current[pendingExternalFocus];
    if (!inputToFocus) {
      return;
    }

    inputToFocus.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    inputToFocus.focus();
    setPendingExternalFocus(null);
  }, [texts, pendingExternalFocus]);

  const handleTextChanged = (key: string, value: string) => {
    const _texts = [...texts];
    for (const text of _texts) {
      if (text.key === key) {
        text.value = value;
      }
    }
    onTextsChanged(_texts);
  };

  const handleTextAdded = (key: string) => {
    const initialText = initialTexts.find(txt => txt.key === key);
    onTextsChanged([...texts, { key, value: initialText?.value || "" }]);
    setLastAddedKey(key);
  };

  const handleRemoveText = (key: string) => {
    onTextsChanged(texts.filter(text => text.key !== key));
  };

  const filterSuggestions = (record: SupportedTextRecord): boolean => {
    if (searchFilter && searchFilter.length > 0) {
      const lowercase = searchFilter.toLocaleLowerCase();
      const label = record.label || "";

      return (
        record.key.toLocaleLowerCase().includes(lowercase) ||
        label.toLocaleLowerCase().includes(lowercase)
      );
    }
    return true;
  };

  const filteredItems: SupportedTextRecord[] = useMemo(() => {
    const shownTextCategory = [category];
    if (category === TextRecordCategory.General) {
      // We also show image records under general
      shownTextCategory.push(TextRecordCategory.Image);
    }

    return supportedTexts.filter(
      record =>
        filterSuggestions(record) && shownTextCategory.includes(record.category)
    );
  }, [searchFilter]);

  const isGeneralCategory = category === TextRecordCategory.General;
  const hasCustomContent =
    isGeneralCategory &&
    (committedCustomTexts.length > 0 || customDrafts.length > 0);

  if (filteredItems.length === 0 && !hasCustomContent) {
    return <></>;
  }

  return (
    <div className="ns-text-records">
      <Text className="ns-mb-2" weight="bold">
        {capitalize(category)}
      </Text>
      {filteredItems
        .filter(record => existingTextsMap[record.key] !== undefined)
        .map(record => {
          const current = existingTextsMap[record.key];

          const isDescription = record.key === "description";

          return (
            <div key={record.key} style={{ marginBottom: 10 }}>
              <Text
                style={{ marginBottom: "4px" }}
                color="grey"
                size="xs"
                weight="medium"
              >
                {record.label}
              </Text>
              <div
                style={{ width: "100%" }}
                className="d-flex align-items-center"
              >
                {isDescription ? (
                  <Textarea
                    size="sm"
                    ref={(el: HTMLTextAreaElement | null) => {
                      inputRefs.current[record.key] = el;
                    }}
                    style={{ width: "100%", flex: 1, height: 70 }}
                    onChange={e =>
                      handleTextChanged(record.key, e.target.value)
                    }
                    prefix={<Icon name={record.icon} size={18} color="grey" />}
                    value={current.value}
                    placeholder={record.placeholder}
                    rows={4}
                  />
                ) : (
                  <Input
                    ref={(el: HTMLInputElement | null) => {
                      inputRefs.current[record.key] = el;
                    }}
                    style={{ width: "100%" }}
                    onChange={e =>
                      handleTextChanged(record.key, e.target.value)
                    }
                    prefix={<Icon name={record.icon} size={18} color="grey" />}
                    value={current.value}
                    placeholder={record.placeholder}
                  />
                )}
                <div
                  onClick={() => handleRemoveText(record.key)}
                  className="ns-close-icon ns-ms-1"
                  style={{ marginTop: isDescription ? "8px" : "0" }}
                >
                  <Icon name="x" size={18} />
                </div>
              </div>
            </div>
          );
        })}
      {isGeneralCategory && committedCustomTexts.map(custom => (
        <div key={custom.key} style={{ marginBottom: 10 }}>
          <Text
            style={{ marginBottom: "4px" }}
            color="grey"
            size="xs"
            weight="medium"
          >
            {custom.key}
          </Text>
          <div style={{ width: "100%" }} className="d-flex align-items-center">
            <Input
              style={{ width: "100%" }}
              onChange={e => handleCommittedCustomValueChange(custom.key, e.target.value)}
              prefix={<Icon name="edit" size={18} color="grey" />}
              value={custom.value}
              placeholder="Value"
            />
            <div
              onClick={() => handleRemoveCommittedCustom(custom.key)}
              className="ns-close-icon ns-ms-1"
            >
              <Icon name="x" size={18} />
            </div>
          </div>
        </div>
      ))}
      {isGeneralCategory && customDrafts.map(draft => {
        const keyIsInvalid = draft.key.trim().length > 0 && !isValidDraftKey(draft.key, draft.id);
        return (
          <div key={draft.id} style={{ marginBottom: 10 }}>
            <div className="d-flex align-items-center" style={{ gap: 6 }}>
              <Input
                style={{ flex: 1 }}
                value={draft.key}
                onChange={e => handleCustomDraftKeyChange(draft.id, e.target.value)}
                placeholder="Key (e.g. custom.record)"
                error={keyIsInvalid}
              />
              <Input
                style={{ flex: 1 }}
                value={draft.value}
                onChange={e => handleCustomDraftValueChange(draft.id, e.target.value)}
                placeholder="Value"
              />
              <div
                onClick={() => handleRemoveCustomDraft(draft.id)}
                className="ns-close-icon"
              >
                <Icon name="x" size={18} />
              </div>
            </div>
            {keyIsInvalid && (
              <Text size="xs" color="grey" style={{ marginTop: 4 }}>
                Key is reserved or already in use
              </Text>
            )}
          </div>
        );
      })}
      <div className="row g-2">
        {filteredItems
          .filter(
            record =>
              existingTextsMap[record.key] === undefined &&
              record.category !== TextRecordCategory.Image &&
              filterSuggestions(record)
          )
          .map(record => (
            <div key={record.key} className="col col-lg-3 col-sm-6 col-6">
              <div
                className="ns-text-suggestion"
                onClick={() => handleTextAdded(record.key)}
              >
                <Icon size={18} color="grey" name={record.icon} />
                <Text className="ns-mt-1" size="xs" weight="medium">
                  {record.label}
                </Text>
              </div>
            </div>
          ))}
        {isGeneralCategory && (
          <div className="col col-lg-3 col-sm-6 col-6">
            <div className="ns-text-suggestion" onClick={handleAddCustomDraft}>
              <Icon size={18} color="grey" name="circle-help" />
              <Text className="ns-mt-1" size="xs" weight="medium">
                Custom
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
