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
  placeholder?: string
  socialRecordPrefix?: string
}

export const supportedTexts: SupportedTextRecord[] = [
  {
    icon: "person",
    key: "avatar",
    category: TextRecordCategory.Image,
    label: "Avatar",
  },
  {
    icon: "person",
    key: "header",
    category: TextRecordCategory.Image,
    label: "Header",
  },
  {
    icon: "person",
    key: "name",
    category: TextRecordCategory.General,
    label: "Nickname",
  },
  {
    icon: "book",
    key: "description",
    category: TextRecordCategory.General,
    label: "Short bio",
  },
  {
    icon: "globe",
    key: "url",
    category: TextRecordCategory.General,
    label: "Website",
  },
  {
    icon: "map-pin",
    key: "location",
    category: TextRecordCategory.General,
    label: "Location",
  },
  {
    icon: "mail",
    key: "mail",
    category: TextRecordCategory.General,
    label: "E-Mail",
  },
  {
    icon: "person",
    key: "com.twitter",
    category: TextRecordCategory.Social,
    label: "Twitter",
  },
  {
    icon: "discord",
    key: "com.discord",
    category: TextRecordCategory.Social,
    label: "Discord",
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
