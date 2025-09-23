import { Card } from "@/components/atoms";
import { Text } from "@/components/atoms";
import { Clock } from "lucide-react";
import { chainIcons } from "@/constants";
import "./ENSNameCard.css";

interface ENSNameCardProps {
  name: string;
  imageUrl: string;
  expires: string;
  chainId?: number; 
}

export const ENSNameCard = ({ name, imageUrl, expires, chainId }: ENSNameCardProps) => {
  const iconSrc = chainId ? chainIcons[chainId] : "/icons/eth.svg";

  return (
    <Card className="ens-name-card">
  
      <div className="ens-card-image-container">
        <img src={imageUrl} alt={name} className="ens-card-image" />
        <div className="ens-card-badge">
          <img
            src={iconSrc}
            alt="chain icon"
            className="ens-card-badge-icon"
          />
        </div>
      </div>

      
      <div className="ens-card-body">
        <Text className="ens-card-title">{name}</Text>
        <div className="ens-card-expiry">
          <Clock size={14} />
          <span>Expires {expires}</span>
        </div>
      </div>
    </Card>
  );
};
