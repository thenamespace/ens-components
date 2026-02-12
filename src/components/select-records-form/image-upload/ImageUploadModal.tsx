import { useEffect, useMemo, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import {
  ALLOWED_FORMATS,
  AVATAR_MAX_SIZE,
  HEADER_MAX_SIZE,
} from "@thenamespace/avatar";
import { Button, ShurikenSpinner, Text } from "@/components/atoms";
import { Alert, Modal, ProgressBar } from "@/components/molecules";
import { useAvatarClient, UploadImageType } from "@/hooks";
import { getCroppedImageFile } from "../avatar-upload/cropImage";
import "./ImageUploadModal.css";

type UploadState = "idle" | "editing" | "signing" | "uploading";

interface ImageUploadModalProps {
  isOpen: boolean;
  ensName: string;
  imageType: UploadImageType;
  isTestnet?: boolean;
  siweDomain?: string;
  onClose: () => void;
  onUploaded: (data: { url: string; uploadedAt: string }) => void;
}

const IMAGE_UPLOAD_MODAL_LOG_PREFIX = "[ImageUploadModal]";

const IMAGE_CONFIG: Record<
  UploadImageType,
  {
    label: string;
    maxSize: number;
    cropAspect: number;
    cropShape: "round" | "rect";
  }
> = {
  avatar: {
    label: "avatar",
    maxSize: AVATAR_MAX_SIZE,
    cropAspect: 1,
    cropShape: "round",
  },
  header: {
    label: "header",
    maxSize: HEADER_MAX_SIZE,
    cropAspect: 3,
    cropShape: "rect",
  },
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getImageUploadErrorText = (imageType: UploadImageType) => {
  return imageType === "avatar"
    ? "Failed to upload avatar."
    : "Failed to upload header image.";
};

export const ImageUploadModal = ({
  isOpen,
  ensName,
  imageType,
  isTestnet,
  siweDomain,
  onClose,
  onUploaded,
}: ImageUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [modalStep, setModalStep] = useState<"edit" | "review">("edit");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { uploadAvatar, uploadHeader } = useAvatarClient({
    isTestnet,
    domain: siweDomain,
  });

  const isBusy = uploadState === "signing" || uploadState === "uploading";
  const isReviewStep = modalStep === "review";
  const imageConfig = IMAGE_CONFIG[imageType];
  const maxSizeLabel = formatFileSize(imageConfig.maxSize);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setSelectedFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setModalStep("edit");
    setUploadState("idle");
    setError(null);
    setUploadProgress(0);
  }, [isOpen]);

  const acceptedTypes = useMemo(() => {
    return ALLOWED_FORMATS.join(",");
  }, []);

  const openFilePicker = () => {
    if (!fileInputRef.current) {
      return;
    }
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileSelected = (file?: File) => {
    if (!file) {
      return;
    }

    setError(null);

    if (!ALLOWED_FORMATS.includes(file.type)) {
      setError("Unsupported file type. Please use JPEG, PNG, GIF, or WebP.");
      return;
    }

    if (file.size > imageConfig.maxSize) {
      setError(`Image is too large. Maximum size is ${maxSizeLabel}.`);
      return;
    }

    setSelectedFile(file);
    setModalStep("edit");
    setUploadState("editing");
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please choose an image first.");
      return;
    }
    if (!croppedAreaPixels) {
      setError("Please wait for the image cropper to load.");
      return;
    }

    setError(null);
    setUploadProgress(0);
    setUploadState("signing");
    console.info(`${IMAGE_UPLOAD_MODAL_LOG_PREFIX} sign+upload started`, {
      imageType,
      ensName,
      isTestnet: !!isTestnet,
      siweDomain: siweDomain || window.location.hostname,
      selectedFile: {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      },
      croppedAreaPixels,
    });

    try {
      const croppedFile = await getCroppedImageFile(
        selectedFile,
        croppedAreaPixels
      );
      console.info(`${IMAGE_UPLOAD_MODAL_LOG_PREFIX} cropped file ready`, {
        imageType,
        name: croppedFile.name,
        type: croppedFile.type,
        size: croppedFile.size,
      });
      const uploadImage = imageType === "avatar" ? uploadAvatar : uploadHeader;
      const result = await uploadImage({
        ensName,
        file: croppedFile,
        onProgress: progress => {
          setUploadState("uploading");
          setUploadProgress(Math.max(0, Math.min(100, Math.round(progress))));
        },
      });
      console.info(`${IMAGE_UPLOAD_MODAL_LOG_PREFIX} upload result`, {
        imageType,
        result,
      });

      onUploaded({
        url: result.url,
        uploadedAt: result.uploadedAt,
      });
      onClose();
    } catch (err) {
      console.error(`${IMAGE_UPLOAD_MODAL_LOG_PREFIX} upload error`, {
        imageType,
        error: err,
      });
      setUploadState("editing");
      const errorMessage =
        err instanceof Error ? err.message : getImageUploadErrorText(imageType);
      setError(errorMessage);
    }
  };

  const handleContinue = () => {
    if (!selectedFile) {
      setError("Please choose an image first.");
      return;
    }
    if (!croppedAreaPixels) {
      setError("Please wait for the image cropper to load.");
      return;
    }
    setError(null);
    setModalStep("review");
  };

  const handleBackToEdit = () => {
    if (isBusy) {
      return;
    }
    setError(null);
    setModalStep("edit");
    setUploadState("editing");
  };

  const footer = (
    <div className="ns-image-upload-modal__footer">
      {!isReviewStep && (
        <>
          <Button
            className="ns-image-upload-modal__footer-btn"
            variant="outline"
            onClick={onClose}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            className="ns-image-upload-modal__footer-btn"
            disabled={!selectedFile || isBusy}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </>
      )}

      {isReviewStep && (
        <>
          <Button
            className="ns-image-upload-modal__footer-btn"
            variant="outline"
            onClick={handleBackToEdit}
            disabled={isBusy}
          >
            Back
          </Button>
          <Button
            className="ns-image-upload-modal__footer-btn"
            disabled={!selectedFile || isBusy}
            onClick={handleUpload}
          >
            {uploadState === "signing"
              ? "Check wallet..."
              : uploadState === "uploading"
                ? "Uploading..."
                : "Sign & Upload"}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isDismissDisabled={isBusy}
      footer={footer}
      className="ns-image-upload-modal-wrapper"
      presentation="dialog"
      responsivePresentation={{ mobile: "drawer", breakpointPx: 600 }}
    >
      <div className="ns-image-upload-modal">
        <div className="ns-image-upload-modal__heading">
          <Text size="lg" weight="bold">
            {isReviewStep ? "Sign and upload" : "Edit image"}
          </Text>
        </div>

        {error && (
          <Alert variant="error">
            <Text size="sm">{error}</Text>
          </Alert>
        )}

        <div className="ns-image-upload-modal__content">
          <div
            className={`ns-image-upload-modal__crop-area ${isReviewStep ? "ns-image-upload-modal__crop-area--locked" : ""}`}
          >
            {!previewUrl && (
              <div className="ns-image-upload-modal__empty-state">
                <Text size="sm" weight="medium">
                  Choose an image to begin
                </Text>
                <Text size="xs" color="grey">
                  JPG, PNG, GIF, or WebP ({maxSizeLabel} max)
                </Text>
              </div>
            )}

            {previewUrl && (
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={imageConfig.cropAspect}
                onCropChange={nextCrop => {
                  if (!isReviewStep) {
                    setCrop(nextCrop);
                  }
                }}
                onZoomChange={nextZoom => {
                  if (!isReviewStep) {
                    setZoom(nextZoom);
                  }
                }}
                onCropComplete={(_, croppedPixels) => {
                  if (!isReviewStep) {
                    setCroppedAreaPixels(croppedPixels);
                  }
                }}
                cropShape={imageConfig.cropShape}
                showGrid={!isReviewStep}
              />
            )}
          </div>

          <div className="ns-image-upload-modal__controls">
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes}
              onChange={e => {
                handleFileSelected(e.target.files?.[0]);
              }}
              className="ns-image-upload-modal__file-input"
            />

            {!isReviewStep && (
              <>
                <Button
                  variant="outline"
                  onClick={openFilePicker}
                  disabled={isBusy}
                >
                  {selectedFile ? "Replace image" : "Choose image"}
                </Button>

                {previewUrl && (
                  <div className="ns-image-upload-modal__zoom">
                    <Text size="xs" color="grey">
                      Zoom
                    </Text>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.01}
                      value={zoom}
                      onChange={e => {
                        setZoom(Number(e.target.value));
                      }}
                      disabled={isBusy}
                    />
                  </div>
                )}
              </>
            )}

            {isReviewStep && (
              <div className="ns-image-upload-modal__review-note">
                <Text size="sm" color="grey">
                  Ready to sign a wallet message and upload this{" "}
                  {imageConfig.label}.
                </Text>
              </div>
            )}

            {uploadState === "signing" && (
              <div className="ns-image-upload-modal__status">
                <ShurikenSpinner size={18} />
                <Text size="xs" color="grey">
                  Waiting for signature...
                </Text>
              </div>
            )}

            {uploadState === "uploading" && (
              <div className="ns-image-upload-modal__progress">
                <Text size="xs" color="grey">
                  Uploading... {uploadProgress}%
                </Text>
                <ProgressBar progress={uploadProgress} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
