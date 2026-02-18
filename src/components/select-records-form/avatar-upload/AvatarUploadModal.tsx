import { ImageUploadModal } from "../image-upload/ImageUploadModal";

export interface AvatarUploadModalProps {
  isOpen: boolean;
  ensName: string;
  isTestnet?: boolean;
  siweDomain?: string;
  onClose: () => void;
  onUploaded: (data: { url: string; uploadedAt: string }) => void;
}

export const AvatarUploadModal = (props: AvatarUploadModalProps) => {
  return <ImageUploadModal {...props} imageType="avatar" />;
};

