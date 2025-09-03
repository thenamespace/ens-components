import { ContenthashProtocol } from "@/types";
import { IpfsIcon } from "./icons/IpfsIcon";
import { OnionIcon } from "./icons/OnionIcon";
import { ArweaveIcon } from "./icons/ArweaveIcon";
import { SkynetIcon } from "./icons/SkynetIcon";
import { SwarmIcon } from "./icons/SwarmIcon";

interface ContenthashIconProps extends React.SVGProps<SVGSVGElement> {
  protocol: ContenthashProtocol;
  size?: number;
}

const icons: Record<ContenthashProtocol, React.FC<{ size?: number }>> = {
  [ContenthashProtocol.Ipfs]: IpfsIcon,
  [ContenthashProtocol.Onion]: OnionIcon,
  [ContenthashProtocol.Arweave]: ArweaveIcon,
  [ContenthashProtocol.Skynet]: SkynetIcon,
  [ContenthashProtocol.Swarm]: SwarmIcon,
};

export const ContenthashIcon = (props: ContenthashIconProps) => {
  const { className, size, protocol, ...restProps } = props;
  const _size = size || 20;
  const IconComponent = icons[protocol];

  if (!IconComponent) {
    console.warn(`No icon found for protocol: ${protocol}`);
    return null;
  }

  return (
    <div className={`ns-chain-icon ${className || ""}`}>
      <IconComponent size={_size} />
    </div>
  );
};
