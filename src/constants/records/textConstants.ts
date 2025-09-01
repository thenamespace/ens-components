import { IconName } from "@/components";

export enum TextRecordCategory {
  Image = "image",
  General = "general",
  Social = "social",
}
export interface SupportedTextRecord {
  icon: IconName | string;
  key: string;
  category: TextRecordCategory;
  label?: string
}

export const supportedTexts: SupportedTextRecord[] = [
  {
    icon: "person",
    key: "avatar",
    category: TextRecordCategory.Image,
    label: "Avatar"
  },
  {
    icon: "person",
    key: "header",
    category: TextRecordCategory.Image,
    label: "Header"
  },
  {
    icon: "person",
    key: "name",
    category: TextRecordCategory.General,
    label: "Nickname"
  },
  {
    icon: "x",
    key: "description",
    category: TextRecordCategory.General,
    label: "Short bio"
  },
  {
    icon: "person",
    key: "url",
    category: TextRecordCategory.General,
    label: "Website"
  },
  {
    icon: "person",
    key: "location",
    category: TextRecordCategory.General,
    label: "Location"
  },
  {
    icon: "person",
    key: "mail",
    category: TextRecordCategory.General,
    label: "E-Mail"
  },
   {
    icon: "person",
    key: "com.twitter",
    category: TextRecordCategory.Social,
    label: "Twitter"
  },
    {
    icon: "person",
    key: "com.discord",
    category: TextRecordCategory.Social,
    label: "Discord"
  },
    {
    icon: "person",
    key: "com.github",
    category: TextRecordCategory.Social,
    label: "Github"
  },
    {
    icon: "person",
    key: "org.telegram",
    category: TextRecordCategory.Social,
    label: "Telegram"
  },
    {
    icon: "person",
    key: "com.youtube",
    category: TextRecordCategory.Social,
    label: "Youtube"
  },
];

export const getSupportedText = (key: string) => {
  return supportedTexts.find(txt => txt.key === key);
};
