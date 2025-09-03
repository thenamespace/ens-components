import { IconName } from "@/components";

export enum TextRecordCategory {
  Image = "image",
  General = "general",
  Social = "social",
}
export interface SupportedTextRecord {
  icon: IconName;
  key: string;
  category: TextRecordCategory;
  label?: string;
  placeholder?: string;
}

export const supportedTexts: SupportedTextRecord[] = [
  {
    icon: "circle-person",
    key: "avatar",
    category: TextRecordCategory.Image,
    label: "Avatar",
    placeholder: "https://",
  },
  {
    icon: "image",
    key: "header",
    category: TextRecordCategory.Image,
    label: "Header",
    placeholder: "https://",
  },
  {
    icon: "person",
    key: "name",
    category: TextRecordCategory.General,
    label: "Nickname",
    placeholder: "John Smith",
  },
  {
    icon: "book",
    key: "description",
    category: TextRecordCategory.General,
    label: "Short bio",
    placeholder: "I am a ninja from far away land",
  },
  {
    icon: "globe",
    key: "url",
    category: TextRecordCategory.General,
    label: "Website",
    placeholder: "https://namespace.ninja",
  },
  {
    icon: "map-pin",
    key: "location",
    category: TextRecordCategory.General,
    label: "Location",
    placeholder: "Metaverse",
  },
  {
    icon: "mail",
    key: "mail",
    category: TextRecordCategory.General,
    label: "E-Mail",
    placeholder: "name@example.com",
  },
  {
    icon: "twitter",
    key: "com.twitter",
    category: TextRecordCategory.Social,
    label: "Twitter",
    placeholder: "eg. namespace",
  },
  {
    icon: "discord",
    key: "com.discord",
    category: TextRecordCategory.Social,
    label: "Discord",
    placeholder: "eg. namespace",
  },
  {
    icon: "github",
    key: "com.github",
    category: TextRecordCategory.Social,
    label: "Github",
  },
  {
    icon: "telegram",
    key: "org.telegram",
    category: TextRecordCategory.Social,
    label: "Telegram",
  },
  {
    icon: "youtube",
    key: "com.youtube",
    category: TextRecordCategory.Social,
    label: "Youtube",
  },
];

export const getSupportedText = (key: string) => {
  return supportedTexts.find(txt => txt.key === key);
};
