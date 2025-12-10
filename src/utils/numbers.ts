export const ensureFloatInput = (value: string): string => {
    if (value.length === 0) {
      return "0";
    }
  
    if (value.endsWith(".")) {
      return value;
    } else {
    }
  
    return "";
  };
  
  export const formatFloat = (value: string | number, decimals: number = 5) => {
  
      if (!value) {
          return 0;
      }
  
    let _value: string;
    if (typeof value === "number") {
      _value = value.toString();
    } else {
      _value = value;
    }
    return parseFloat(parseFloat(_value).toFixed(decimals));
  };
  