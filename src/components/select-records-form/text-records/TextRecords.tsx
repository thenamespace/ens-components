import { EnsTextRecord } from "@/types";
import {
  SupportedTextRecord,
  supportedTexts,
  TextRecordCategory,
} from "@/constants";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, Input, Text, Textarea } from "@/components/atoms";
import { capitalize } from "@/utils";

interface TextRecordsProps {
  initialTexts: EnsTextRecord[];
  texts: EnsTextRecord[];
  onTextsChanged: (texts: EnsTextRecord[]) => void;
  category: TextRecordCategory;
  searchFilter?: string;
}

export const TextRecords = ({
  texts,
  onTextsChanged,
  category,
  initialTexts,
  searchFilter,
}: TextRecordsProps) => {
  const existingTextsMap = useMemo(() => {
    const map: Record<string, EnsTextRecord> = {};
    texts.forEach(txt => {
      map[txt.key] = txt;
    });
    return map;
  }, [texts]);

  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

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

  if (filteredItems.length === 0) {
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
                    onChange={e => handleTextChanged(record.key, e.target.value)}
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
                    onChange={e => handleTextChanged(record.key, e.target.value)}
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
      </div>
    </div>
  );
};
