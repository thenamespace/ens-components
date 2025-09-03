import { EnsTextRecord } from "@/types";
import {
  getSupportedText,
  SupportedTextRecord,
  supportedTexts,
  TextRecordCategory,
} from "@/constants";
import { useMemo } from "react";
import { Icon, Input, Text } from "@/components";
import "./TextRecords.css";
import { capitalize } from "@/utils";

interface TextRecordsProps {
  texts: EnsTextRecord[];
  onTextsChanged: (texts: EnsTextRecord[]) => void;
}

export const TextRecords = ({ texts, onTextsChanged }: TextRecordsProps) => {
  const textsMap = useMemo<Record<string, SupportedTextRecord>>(() => {
    const textMap: Record<string, SupportedTextRecord> = {};
    supportedTexts.forEach(txt => {
      textMap[txt.key] = txt;
    });

    return textMap;
  }, []);

  const updateTextValue = (key: string, value: string) => {
    const _texts = [...texts];
    for (const text of _texts) {
      if (text.key === key) {
        text.value = value;
      }
    }
    onTextsChanged(_texts);
  };

  const sortedTexts = useMemo(() => {
    const weight: Record<TextRecordCategory, number> = {
      general: 1,
      social: 0,
      image: 2,
    };

    const _sortedTexts = [...texts];
    _sortedTexts.sort((a, b) => {
      const aType = textsMap[a.key]?.category || "general";
      const bType = textsMap[b.key]?.category || "general";
      return weight[bType] - weight[aType];
    });
    return _sortedTexts;
  }, [texts, textsMap]);

  const handleTextRemoved = (key: string) => {
    const _texts = texts.filter(text => text.key !== key);
    onTextsChanged(_texts);
  };

  return (
    <div className="ns-records-wrapper ns-styled-scrollbar">
      <div className="ns-text-records">
        {texts.length === 0 && (
          <div className="not-found-badge d-flex align-items-center">
            <Icon name="circle-alert" size={16} />
            <Text color="grey" weight="medium" size="sm" className="ns-ms-1">
              No texts found
            </Text>
          </div>
        )}
        {sortedTexts.map(text => {
          const supportedText = textsMap[text.key];
          return (
            <div key={text.key} className="row ns-mb-1">
              <div className="col-4 d-flex align-items-center">
                <div className="circle-icon d-flex align-items-center justify-content-center ns-me-1">
                  <Icon
                    color="white"
                    size={15}
                    name={(supportedText?.icon || "person") as any}
                  ></Icon>
                </div>
                <Text size="sm" weight="medium">
                  {supportedText ? supportedText.label : capitalize(text.key)}
                </Text>
              </div>
              <div className="col-8 d-flex align-items-center">
                <Input
                  value={text.value}
                  onChange={e => updateTextValue(text.key, e.target.value)}
                  size="md"
                  placeholder={supportedText?.placeholder}
                ></Input>
                <div onClick={() => handleTextRemoved(text.key)}>
                  <Icon name="x" size={18} className="ms-1 ns-close-icon" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
