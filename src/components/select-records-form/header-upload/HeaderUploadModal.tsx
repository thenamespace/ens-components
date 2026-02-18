import { ImageUploadModal } from "../image-upload/ImageUploadModal";

export interface HeaderUploadModalProps {
  isOpen: boolean;
  ensName: string;
  isTestnet?: boolean;
  siweDomain?: string;
  onClose: () => void;
  onUploaded: (data: { url: string; uploadedAt: string }) => void;
}

export const HeaderUploadModal = (props: HeaderUploadModalProps) => {
  return <ImageUploadModal {...props} imageType="header" />;
};

