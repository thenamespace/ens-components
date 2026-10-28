export type BoolProp = {
  key: string;
  type: "boolean";
  default: boolean;
  tip?: string;
  required?: boolean;
  readonly?: boolean;
};
export type StrProp = {
  key: string;
  type: "string";
  default: string;
  tip?: string;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
};
export type NumProp = {
  key: string;
  type: "number";
  default: number;
  tip?: string;
  required?: boolean;
  readonly?: boolean;
};
export type PropDef = BoolProp | StrProp | NumProp;
