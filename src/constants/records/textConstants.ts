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
  socialRecordPrefix?: string;
}

export const supportedTexts: SupportedTextRecord[] = [
  {
    icon: "image",
    key: "avatar",
    category: TextRecordCategory.Image,
    label: "Avatar",
    placeholder: "Your avatar image url...",
  },
  {
    icon: "image",
    key: "header",
    category: TextRecordCategory.Image,
    label: "Header",
    placeholder: "Your header image url...",
  },
  {
    icon: "person",
    key: "name",
    category: TextRecordCategory.General,
    label: "Nickname",
    placeholder: "e.g. John",
  },
  {
    icon: "book",
    key: "description",
    category: TextRecordCategory.General,
    label: "Short bio",
    placeholder: "e.g. john",
  },
  {
    icon: "globe",
    key: "url",
    category: TextRecordCategory.General,
    label: "Website",
    placeholder: "e.g. https://celo.org",
  },
  {
    icon: "map-pin",
    key: "location",
    category: TextRecordCategory.General,
    label: "Location",
    placeholder: "e.g. Jupiter",
  },
  {
    icon: "mail",
    key: "mail",
    category: TextRecordCategory.General,
    label: "E-Mail",
    placeholder: "e.g. example@email.com",
  },
  {
    icon: "xSocial",
    key: "com.twitter",
    category: TextRecordCategory.Social,
    label: "Twitter",
    placeholder: "e.g. celonames",
  },
  {
    icon: "discord",
    key: "com.discord",
    category: TextRecordCategory.Social,
    label: "Discord",
    placeholder: "e.g. celonames",
  },
  {
    icon: "github",
    key: "com.github",
    category: TextRecordCategory.Social,
    label: "Github",
    placeholder: "e.g. celonames",
  },
  {
    icon: "telegram",
    key: "org.telegram",
    category: TextRecordCategory.Social,
    label: "Telegram",
    placeholder: "e.g. celonames",
  },
  {
    icon: "youtube",
    key: "com.youtube",
    category: TextRecordCategory.Social,
    label: "Youtube",
    placeholder: "e.g. celonames",
  },
];

export const getSupportedText = (key: string) => {
  return supportedTexts.find(txt => txt.key === key);
};
