import { Card, ChainIcon } from "@/components/atoms";
import { Text } from "@/components/atoms";
import { Clock } from "lucide-react";
import "./ENSNameCard.css";
import { ChainName } from "@/types";

interface ENSNameCardProps {
  name: string;
  imageUrl: string;
  expires: string;
  chain?: ChainName | undefined; // optional, e.g., "eth", "arb", "base"
}

export const ENSNameCard = ({
  name,
  imageUrl,
  expires,
  chain,
}: ENSNameCardProps) => {
  return (
    <Card className="ens-name-card">
      <div className="ens-card-image-container">
        <img src={imageUrl} alt={name} className="ens-card-image" />
        <div className="ens-card-badge">
          <ChainIcon chain={chain ?? "eth"} size={25} />
        </div>
      </div>
      <div className="ens-card-body">
        <Text weight="bold">{name}</Text>

        <div className="ens-card-expiry">
          <Clock size={14} className="ens-expiry-icon" />
          <Text size="sm">Expires {expires}</Text>
        </div>
      </div>
    </Card>
  );
};
