

export enum TextRecordCategory {
    Image = "image",
    General = "general",
    Social = "social"
}
export interface SupportedTextRecord {
    icon: string
    key: string
    category: TextRecordCategory
}

export const supportedTexts: SupportedTextRecord[] = [
    {
        icon: "",
        key: "avatar",
        category: TextRecordCategory.Image
    },
    {
        icon: "",
        key: "header",
        category: TextRecordCategory.Image
    },
    {
        icon: "",
        key: "name",
        category: TextRecordCategory.General
    },
    {
        icon: "",
        key: "description",
        category: TextRecordCategory.General
    },
    {
        icon: "",
        key: "url",
        category: TextRecordCategory.General
    },
    {
        icon: "",
        key: "location",
        category: TextRecordCategory.General
    },
    {
        icon: "",
        key: "url",
        category: TextRecordCategory.General
    },
    {
        icon: "",
        key: "location",
        category: TextRecordCategory.General
    },
]


export const a = 1;