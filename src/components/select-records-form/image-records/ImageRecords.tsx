import { useEffect } from "react";
import "./ImageRecords.css";

interface ImageRecordProps {
  avatar?: string;
  header?: string;
  onAvatarAdded: (value: string) => void;
  onHeaderAdded: (value: string) => void;
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
}: ImageRecordProps) => {
  // load avatar here
  useEffect(() => {}, [avatar]);

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

  return (
    <div className="ns-image-records">
      <div
        style={headerStyles}
        className="ns-cover-record-cont"
        onClick={() => {
          if (!headerRecordSet) {
            onHeaderAdded("");
          }
        }}
      >
        <div
          style={avatarStyles}
          onClick={() => {
            if (!avatarRecordSet) {
              onAvatarAdded("");
            }
          }}
          className="ns-avatar-record-cont"
        ></div>
      </div>
    </div>
  );
};
