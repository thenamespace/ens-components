export const capitalize = (value: string) => {
  return value.charAt(0).toLocaleUpperCase() + value.substring(1);
};

export const equalsIgnoreCase = (a: string, b: string) => {
  return a.toLocaleLowerCase() === b.toLocaleLowerCase();
};

export const deepCopy = (a: any): any => {
  return JSON.parse(JSON.stringify(a));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
};
