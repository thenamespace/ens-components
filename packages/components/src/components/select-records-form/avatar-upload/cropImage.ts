import { Area } from "react-easy-crop";

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
};

const cropCanvas = (
  image: HTMLImageElement,
  area: Area
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(area.width));
  canvas.height = Math.max(1, Math.floor(area.height));

  const context = canvas.getContext("2d");
  if (!context) {
    return Promise.reject(new Error("Failed to prepare image editor."));
  }

  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to process cropped image."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
};

const buildOutputName = (originalName: string): string => {
  const parts = originalName.split(".");
  if (parts.length <= 1) {
    return `${originalName}-avatar.png`;
  }

  parts.pop();
  return `${parts.join(".")}-avatar.png`;
};

export const getCroppedImageFile = async (
  file: File,
  area: Area
): Promise<File> => {
  const src = URL.createObjectURL(file);

  try {
    const image = await loadImage(src);
    const blob = await cropCanvas(image, area);

    return new File([blob], buildOutputName(file.name), {
      type: "image/png",
    });
  } finally {
    URL.revokeObjectURL(src);
  }
};
