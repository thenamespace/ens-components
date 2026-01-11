import { Button, Text } from "@/components/atoms";
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
        <Button style={{ width: 40, height: 40 }}>{`>`}</Button>
      </div>
    </div>
  );
};

