import { useRef, useState, useEffect } from "react";
import { Icon, Input, Text, Button } from "@/components/atoms";
import { createAvatarClient } from "@thenamespace/avatar";
import type { WalletClient } from "viem";
import "./AvatarRecords.css";

interface AvatarRecordsProps {
  avatar?: string;
  onAvatarChanged: (value: string) => void;
  searchFilter?: string;
  name?: string;
  walletClient?: WalletClient;
  network?: "mainnet" | "sepolia";
  domain?: string;
}

export const AvatarRecords = ({
  avatar,
  onAvatarChanged,
  searchFilter = "",
  name,
  walletClient,
  network = "mainnet",
  domain = "myapp.com",
}: AvatarRecordsProps) => {
  const [avatarUrl, setAvatarUrl] = useState(avatar || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes
  useEffect(() => {
    setAvatarUrl(avatar || "");
  }, [avatar]);

  const handleUrlChange = (value: string) => {
    setAvatarUrl(value);
    onAvatarChanged(value);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    if (walletClient && name) {
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const client = createAvatarClient({
          domain,
          network,
          provider: walletClient,
        });

        const result = await client.uploadAvatar({
          subname: name,
          file: file,
          onProgress: (progress: number) => {
            setUploadProgress(progress);
          },
        });

        setAvatarUrl(result.url);
        onAvatarChanged(result.url);
        setIsUploading(false);
        setUploadProgress(0);
      } catch (error) {
        console.error("Error uploading avatar:", error);
        alert(
          `Error uploading avatar: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setAvatarUrl(dataUrl);
          onAvatarChanged(dataUrl);
          setIsUploading(false);
        };
        reader.onerror = () => {
          alert("Error reading file");
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading file");
        setIsUploading(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && isValidImageUrl(clipboardText)) {
        setAvatarUrl(clipboardText);
        onAvatarChanged(clipboardText);
      } else {
        alert("Clipboard does not contain a valid image URL");
      }
    } catch (error) {
      console.error("Error reading clipboard:", error);
      alert("Could not read from clipboard. Please paste the URL manually.");
    }
  };

  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Filter by search if needed
  if (
    searchFilter &&
    !"avatar".toLowerCase().includes(searchFilter.toLowerCase())
  ) {
    return null;
  }

  return (
    <div className="ns-avatar-records">
      <div className="ns-avatar-records-header">
        <div className="ns-avatar-records-title">
          <Icon name="person" size={20} />
          <Text weight="bold" size="md">
            Avatar
          </Text>
        </div>
        <Text size="sm" color="grey">
          Upload an image or paste an image URL to set your avatar
        </Text>
      </div>

      <div className="ns-avatar-records-content">
        {/* Avatar Preview */}
        {avatarUrl && (
          <div className="ns-avatar-preview">
            <div
              className="ns-avatar-preview-image"
              style={{
                backgroundImage: `url(${avatarUrl})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
            <button
              className="ns-avatar-remove"
              onClick={() => {
                setAvatarUrl("");
                onAvatarChanged("");
              }}
              type="button"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        )}

        {/* URL Input */}
        <div className="ns-avatar-url-input">
          <Input
            type="text"
            placeholder="Paste image URL here (e.g., https://example.com/image.png)"
            value={avatarUrl}
            onChange={e => handleUrlChange(e.target.value)}
            prefix={<Icon name="globe" size={18} />}
          />
        </div>

        {/* Action Buttons */}
        <div className="ns-avatar-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <Button
            variant="outline"
            size="md"
            onClick={handleUploadClick}
            disabled={isUploading || !walletClient || !name}
          >
            <Icon name="image" size={16} />
            {isUploading
              ? `Uploading... ${uploadProgress}%`
              : walletClient && name
                ? "Upload Image"
                : "Connect Wallet to Upload"}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handlePasteFromClipboard}
          >
            <Icon name="copy" size={16} />
            Paste from Clipboard
          </Button>
        </div>

        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="ns-avatar-progress">
            <div
              className="ns-avatar-progress-bar"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Help Text */}
        <div className="ns-avatar-help">
          <Text size="sm" color="grey">
            {walletClient && name
              ? "Supported formats: JPG, PNG, GIF, WebP. Max file size: 5MB"
              : "Connect your wallet and ensure you have a valid ENS name to upload avatars"}
          </Text>
        </div>
      </div>
    </div>
  );
};
