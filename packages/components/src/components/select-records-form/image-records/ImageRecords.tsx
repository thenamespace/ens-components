import { useMemo } from "react";
import "./ImageRecords.css";
import { Icon } from "@/components/atoms";
import { Dropdown } from "@/components/molecules";

type ImageRecordType = "avatar" | "header";

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

const getManualActionLabel = (isSet: boolean): string => {
  return isSet ? "Edit URL" : "Enter URL";
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
    ? {
        backgroundImage: `url(${avatar})`,
        ...commonBgStyles,
      }
    : {};

  const headerStyles = header
    ? {
        backgroundImage: `url(${header})`,
        ...commonBgStyles,
      }
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
      label: getManualActionLabel(avatarRecordSet),
      onSelect: requestAvatarManualUrl,
    });
    return actions;
  }, [
    onAvatarUploadRequested,
    onAvatarManualUrlRequested,
    onAvatarAdded,
    avatarRecordSet,
  ]);

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
      label: getManualActionLabel(headerRecordSet),
      onSelect: requestHeaderManualUrl,
    });
    return actions;
  }, [
    onHeaderUploadRequested,
    onHeaderManualUrlRequested,
    onHeaderAdded,
    headerRecordSet,
  ]);

  const renderActionTrigger = (
    record: ImageRecordType,
    recordSet: boolean,
    actions: ImageActionItem[]
  ) => {
    const title = recordSet ? `Change ${record}` : `Add ${record}`;
    const hasActions = actions.length > 0;

    return (
      <Dropdown
        placement="bottom"
        align="end"
        disabled={!hasActions}
        trigger={
          <div
            className={`ns-image-action-plus ${recordSet ? "ns-image-action-plus--set" : ""} ${!hasActions ? "ns-image-action-plus--disabled" : ""}`}
            title={title}
            aria-label={title}
            aria-disabled={!hasActions}
          >
            <Icon name="plus" size={16} />
          </div>
        }
      >
        <div className="ns-image-actions-menu">
          {actions.map(action => (
            <button
              key={`${record}-${action.id}`}
              type="button"
              className="ns-image-actions-menu-item"
              onClick={() => action.onSelect()}
            >
              {action.label}
            </button>
          ))}
        </div>
      </Dropdown>
    );
  };

  return (
    <div className="ns-image-records">
      <div style={headerStyles} className="ns-cover-record-cont">
        <div className="ns-top-grad"></div>
        <div className="ns-bot-grad"></div>

        {!headerRecordSet && (
          <div className="ns-header-record-placeholder" aria-hidden="true">
            <Icon color="white" name="image" size={22} />
          </div>
        )}

        <div className="ns-header-action-anchor">
          {renderActionTrigger("header", headerRecordSet, headerActions)}
        </div>

        <div
          style={avatarStyles}
          className={`ns-avatar-record-cont ${avatarRecordSet ? "ns-avatar-record-cont--set" : ""}`}
        >
          {!avatarRecordSet && (
            <div className="ns-avatar-record-placeholder" aria-hidden="true">
              <Icon color="grey" name="image" size={28} />
            </div>
          )}

          <div className="ns-avatar-action-anchor">
            {renderActionTrigger("avatar", avatarRecordSet, avatarActions)}
          </div>
        </div>
      </div>

    </div>
  );
};
