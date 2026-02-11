import "./ImageRecords.css";
import { Icon } from "@/components/atoms";

interface ImageRecordProps {
  avatar?: string;
  header?: string;
  onAvatarAdded: (value: string) => void;
  onHeaderAdded: (value: string) => void;
  onAvatarImageClick?: () => void;
}

const commonBgStyles = {
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
};

export const ImageRecords = ({
  avatar,
  header,
  onAvatarAdded,
  onHeaderAdded,
  onAvatarImageClick,
}: ImageRecordProps) => {
  let avatarStyles = {};
  if (avatar && avatar.length > 0) {
    avatarStyles = {
      backgroundImage: `url(${avatar})`,
      ...commonBgStyles,
    };
  }

  let headerStyles = {};
  if (header && header.length > 0) {
    headerStyles = {
      backgroundImage: `url(${header})`,
      ...commonBgStyles,
    };
  }

  let headerRecordSet = header !== undefined;
  let avatarRecordSet = avatar !== undefined;
  const canUploadAvatar = !!onAvatarImageClick;

  return (
    <div className="ns-image-records">
      <div style={headerStyles} className="ns-cover-record-cont">
        <div className="ns-top-grad"></div>
        <div className="ns-bot-grad"></div>
        {!headerRecordSet && (
          <div
            style={{ zIndex: 10 }}
            onClick={e => {
              e.stopPropagation();
              if (!headerRecordSet) {
                onHeaderAdded("");
              }
            }}
            className="ns-header-handle"
          >
            <Icon color="white" name="rotate-circle"></Icon>
          </div>

          // We will allow this when we start supporting avatar uploads
          // <Dropdown
          //   trigger={
          //     <div className="ns-header-handle">
          //       <Icon color="white" name="rotate-circle"></Icon>
          //     </div>
          //   }
          // >
          //   <div className="ns-upload-options">
          //     <Text
          //       onClick={e => {
          //         e.stopPropagation();
          //         if (!headerRecordSet) {
          //           onHeaderAdded("");
          //         }
          //       }}
          //       weight="medium"
          //       className="option"
          //       size="sm"
          //     >
          //       Add Header Record
          //     </Text>
          //     <Text weight="medium" className="option disabled" size="sm">
          //       Upload image
          //     </Text>
          //     <Text weight="medium" className="option disabled" size="sm">
          //       Select NFT
          //     </Text>
          //   </div>
          // </Dropdown>
        )}
        <div
          style={avatarStyles}
          className={`ns-avatar-record-cont ${canUploadAvatar ? "ns-avatar-record-cont--clickable" : ""}`}
          onClick={() => onAvatarImageClick?.()}
        >
          {canUploadAvatar && (
            <div
              className="ns-avatar-upload-handle"
              onClick={e => {
                e.stopPropagation();
                onAvatarImageClick?.();
              }}
              title="Upload avatar"
            >
              <Icon color="grey" name="edit" size={16} />
            </div>
          )}
          {!avatarRecordSet && (
            <div
              style={{ zIndex: 10 }}
              onClick={e => {
                e.stopPropagation();
                if (!avatarRecordSet) {
                  onAvatarAdded("");
                }
              }}
              className="ns-image-handle"
              title="Add avatar record manually"
            >
              <Icon color="grey" name="rotate-circle"></Icon>
            </div>
            // We will allow this when we start supporting avatar uploads
            // <Dropdown
            //   trigger={
            //     <div className="ns-image-handle">
            //       <Icon color="grey" name="rotate-circle"></Icon>
            //     </div>
            //   }
            // >
            //   <div className="ns-upload-options">
            //     <Text
            //       onClick={e => {
            //         e.stopPropagation();
            //         if (!avatarRecordSet) {
            //           onAvatarAdded("");
            //         }
            //       }}
            //       weight="medium"
            //       className="option"
            //       size="sm"
            //     >
            //       Add Avatar Record
            //     </Text>
            //     <Text weight="medium" className="option disabled" size="sm">
            //       Upload image
            //     </Text>
            //     <Text weight="medium" className="option disabled" size="sm">
            //       Select NFT
            //     </Text>
            //   </div>
            // </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
};
