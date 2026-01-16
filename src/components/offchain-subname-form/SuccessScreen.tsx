import { Text, Button } from "@/components/atoms";
import finishImage from "../../assets/finish.png";

interface SuccessScreenProps {
  fullSubname: string;
  isUpdateMode: boolean;
  onContinue: () => void;
}

export const SuccessScreen = ({ fullSubname, isUpdateMode, onContinue }: SuccessScreenProps) => {
  const actionText = isUpdateMode ? "updated" : "created";

  return (
    <div className="ns-offchain-subname-form">
      <div style={{ padding: 15 }}>
        <div className="ns-text-center">
          <div style={{ marginBottom: "20px" }}>
            <img 
              src={finishImage} 
              alt="Success" 
              style={{ width: "120px", height: "auto" }}
            />
          </div>
          
          <Text size="sm" color="grey" className="mb-2">
            Hooray! You've {actionText}
          </Text>
          <Text size="lg" weight="bold" className="mb-3">
            {fullSubname}
          </Text>

          <Button
            variant="solid"
            size="lg"
            onClick={onContinue}
            className="ns-wd-100 mt-3"
          >
            Great!
          </Button>
        </div>
      </div>
    </div>
  );
};
