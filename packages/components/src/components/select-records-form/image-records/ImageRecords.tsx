import { useMemo } from "react";
import "./ImageRecords.css";
import { Icon } from "@/components/atoms";
import { Dropdown } from "@/components/molecules";

interface ImageActionItem {
  id: string;
  label: string;
  onSelect: () => void;
}

interface ImageRecordProps {
  avatar?: string;
  header?: string;
  onAvatarAdded: (value: string) => void;
  onHeaderAdded: (value: string) => void;
  onAvatarUploadRequested?: () => void;
  onAvatarManualUrlRequested?: () => void;
  onHeaderUploadRequested?: () => void;
  onHeaderManualUrlRequested?: () => void;
}

const commonBgStyles = {
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
};

export const ImageRecords = ({
  avatar,
  header,
  onAvatarAdded,
  onHeaderAdded,
  onAvatarUploadRequested,
  onAvatarManualUrlRequested,
  onHeaderUploadRequested,
  onHeaderManualUrlRequested,
}: ImageRecordProps) => {
  const avatarStyles = avatar
    ? { backgroundImage: `url(${avatar})`, ...commonBgStyles }
    : {};

  const headerStyles = header
    ? { backgroundImage: `url(${header})`, ...commonBgStyles }
    : {};

  const headerRecordSet = header !== undefined;
  const avatarRecordSet = avatar !== undefined;

  const requestAvatarManualUrl = () => {
    if (onAvatarManualUrlRequested) {
      onAvatarManualUrlRequested();
      return;
    }
    onAvatarAdded("");
  };

  const requestHeaderManualUrl = () => {
    if (onHeaderManualUrlRequested) {
      onHeaderManualUrlRequested();
      return;
    }
    onHeaderAdded("");
  };

  const avatarActions = useMemo<ImageActionItem[]>(() => {
    const actions: ImageActionItem[] = [];
    if (onAvatarUploadRequested) {
      actions.push({
        id: "upload",
        label: "Upload image",
        onSelect: onAvatarUploadRequested,
      });
    }
    actions.push({
      id: "manual-url",
      label: "Enter URL",
      onSelect: requestAvatarManualUrl,
    });
    return actions;
  }, [onAvatarUploadRequested, onAvatarManualUrlRequested, onAvatarAdded]);

  const headerActions = useMemo<ImageActionItem[]>(() => {
    const actions: ImageActionItem[] = [];
    if (onHeaderUploadRequested) {
      actions.push({
        id: "upload",
        label: "Upload image",
        onSelect: onHeaderUploadRequested,
      });
    }
    actions.push({
      id: "manual-url",
      label: "Enter URL",
      onSelect: requestHeaderManualUrl,
    });
    return actions;
  }, [onHeaderUploadRequested, onHeaderManualUrlRequested, onHeaderAdded]);

  return (
    <div className="ns-image-records">
      <div style={headerStyles} className="ns-cover-record-cont">
        <div className="ns-top-grad"></div>
        <div className="ns-bot-grad"></div>

        {!headerRecordSet && (
          <div className="ns-header-record-placeholder">
            <Dropdown
              placement="bottom"
              align="end"
              disabled={headerActions.length === 0}
              trigger={
                <div title="Add header" aria-label="Add header">
                  <Icon color="white" name="plus" size={22} />
                </div>
              }
            >
              <div className="ns-image-actions-menu">
                {headerActions.map(action => (
                  <button
                    key={`header-${action.id}`}
                    type="button"
                    className="ns-image-actions-menu-item"
                    onClick={() => action.onSelect()}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </Dropdown>
          </div>
        )}

        <div
          style={avatarStyles}
          className={`ns-avatar-record-cont ${avatarRecordSet ? "ns-avatar-record-cont--set" : ""}`}
        >
          {!avatarRecordSet && (
            <div className="ns-avatar-record-placeholder">
            <Dropdown
              placement="bottom"
              align="end"
              disabled={avatarActions.length === 0}
              trigger={
                <div title="Add avatar" aria-label="Add avatar">
                  <Icon color="grey" name="plus" size={28} />
                </div>
              }
            >
              <div className="ns-image-actions-menu">
                {avatarActions.map(action => (
                  <button
                    key={`avatar-${action.id}`}
                    type="button"
                    className="ns-image-actions-menu-item"
                    onClick={() => action.onSelect()}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </Dropdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
