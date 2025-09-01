import { EnsTextRecord } from "@/types";
import { SupportedTextRecord, supportedTexts } from "@/constants";
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

  const handleTextRemoved = (key: string) => {
    const _texts = texts.filter(text => text.key !== key);
    onTextsChanged(_texts);
  }
  
  return (
    <div className="ns-text-records">
      {texts.length === 0 && <Text>No texts</Text>}
      {texts.map(text => {
        const supportedText = textsMap[text.key];
        return (
          <div
            key={text.key}
            className="row ns-mb-1"
          >
            <div className="col-4 d-flex align-items-center">
              <div className="circle-icon d-flex align-items-center justify-content-center me-2">
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
              ></Input>
              <div onClick={() => handleTextRemoved(text.key)}>
                <Icon name="x" size={18} className="ms-1 ns-close-icon" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
