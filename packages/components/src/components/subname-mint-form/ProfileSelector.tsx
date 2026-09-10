import { Text } from "@/components/atoms";
import shurikenImage from "@/assets/shuriken.svg";

export interface ProfileSelectorProps {
  onSelect: () => void;
}

export const ProfileSelector = ({ onSelect }: ProfileSelectorProps) => {
  return (
    <div
      className="ens-profile-selector mt-2"
      onClick={onSelect}
      style={{ cursor: "pointer" }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="shuriken-cont d-flex align-items-center justify-content-center">
            <img
              className="shuriken"
              width={50}
              src={shurikenImage}
              alt="shuriken"
            />
          </div>
          <div className="ms-3">
            <Text size="sm" weight="medium">
              Complete your profile
            </Text>
            <Text size="xs" color="grey">
              Make your ENS more discoverable
            </Text>
          </div>
        </div>
        <span className="profile-cta-arrow" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M6 3.6 10.4 8 6 12.4" />
          </svg>
        </span>
      </div>
    </div>
  );
};

