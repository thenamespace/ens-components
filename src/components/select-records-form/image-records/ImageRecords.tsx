import { useEffect } from "react";
import "./ImageRecords.css";
import { Dropdown } from "@/components/molecules";
import { Icon, Text } from "@/components/atoms";

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
      <div style={headerStyles} className="ns-cover-record-cont">
        <div className="ns-top-grad"></div>
         <div className="ns-bot-grad"></div>
        {!headerRecordSet && <Dropdown
          trigger={
            <div className="ns-header-handle">
            <Icon color="white" name="rotate-circle"></Icon>
            </div>
          }
        >
          <div className="ns-upload-options">
            <Text
              onClick={e => {
                e.stopPropagation();
                if (!headerRecordSet) {
                  onHeaderAdded("");
                }
              }}
              weight="medium"
              className="option"
              size="sm"
            >
              Add Header Record
            </Text>
            <Text weight="medium" className="option disabled" size="sm">
              Upload image
            </Text>
            <Text weight="medium" className="option disabled" size="sm">
              Select NFT
            </Text>
          </div>
        </Dropdown>}
        <div style={avatarStyles} className="ns-avatar-record-cont">
          {!avatarRecordSet && <Dropdown
            trigger={
              <div className="ns-image-handle">
                <Icon color="grey" name="rotate-circle"></Icon>
              </div>
            }
          >
            <div className="ns-upload-options">
              <Text
                onClick={e => {
                  e.stopPropagation();
                  if (!avatarRecordSet) {
                    onAvatarAdded("");
                  }
                }}
                weight="medium"
                className="option"
                size="sm"
              >
                Add Avatar Record
              </Text>
              <Text weight="medium" className="option disabled" size="sm">
                Upload image
              </Text>
              <Text weight="medium" className="option disabled" size="sm">
                Select NFT
              </Text>
            </div>
          </Dropdown>}
        </div>
      </div>
    </div>
  );
};
