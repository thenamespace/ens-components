// Simple error message formatter
const formatErrorMessage = (err: any | string): string => {
  if (typeof err === "string") {
    return err;
  }
  if (err instanceof Error) {
    return err.message;
  }
  if (err?.message) {
    return err.message;
  }
  if (err?.error?.message) {
    return err.error.message;
  }
  return "An unexpected error occurred";
};

export const showErrorModal = (err: any | string) => {
  const errorMessage = formatErrorMessage(err);
  
  // Console log the error
  console.error(err);
  
  // Show alert with the error message
  alert(errorMessage);
};

export const useErrorModal = () => {
  return {
    showErrorModal,
  };
};

