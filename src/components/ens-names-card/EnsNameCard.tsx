import { Card, ChainIcon, Icon } from "@/components/atoms";
import { Text } from "@/components/atoms";
import "./EnsNameCard.css";
import { ChainName } from "@/types";

/**
 * Card for displaying ENS name details.
 * @param {ENSNameCardProps} props
 */
export interface ENSNameCardProps {
  name: string;
  imageUrl: string;
  expires: string;
  chain?: ChainName;
  className?: string;
}

export const ENSNameCard = ({
  name,
  imageUrl,
  expires,
  chain = "eth",
  className = "",
}: ENSNameCardProps) => (
  <Card className={`ens-name-card ${className}`}>
    <div className="ens-card-image-container">
      <img src={imageUrl} alt={`${name} avatar`} className="ens-card-image" />
      <div className="ens-card-badge">
        <ChainIcon chain={chain} size={25} />
      </div>
    </div>
    <div className="ens-card-body">
      <Text weight="bold">{name}</Text>
      <div className="ens-card-expiry">
        <Icon name="clock" size={14} />
        <Text size="sm">Expires {expires}</Text>
      </div>
    </div>
  </Card>
);
