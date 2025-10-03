import "./ProfileCard.css";
import Icon from "../atoms/icon/Icon";
import Text from "../atoms/text/Text";
import { Button } from "../atoms";

/**
 * Card for displaying ENS profile details.
 * @param {ProfileCardProps} props
 */
export interface ProfileCardProps {
  bannerUrl: string;
  avatarUrl: string;
  name: string;
  username: string;
  bio: string;
  address: string;
  followers?: number;
  following?: number;
  ownedBy: string;
  expires: string;
  records?: string[];
  website?: string;
  subnames?: number;
  profit?: number;
  volume?: number;
  className?: string;
}

export const ProfileCard = ({
  bannerUrl,
  avatarUrl,
  name,
  username,
  bio,
  address,
  followers = 0,
  following = 0,
  ownedBy,
  expires,
  records = [],
  website,
  subnames = 0,
  profit = 0,
  volume = 0,
  className = "",
}: ProfileCardProps) => {
  return (
    <section className={`ns-profile-card ${className}`}>
      <header className="ns-profile-info">
        <div className="ns-profile-banner">
          <img src={bannerUrl} alt="Profile banner" />
          <div className="ns-profile-avatar">
            <img src={avatarUrl} alt={name + " avatar"} />
            <div className="ns-avatar-badge">
              <img
                src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"
                alt="chain icon"
                className="ns-avatar-badge-icon"
              />
            </div>
          </div>
        </div>
        <div className="ns-profile-body">
          <Text color="primary" weight="bold">
            {name}
          </Text>
          <div className="ns-username-container">
            <Text size="xl" weight="bold">
              {username}
            </Text>
            <span className="ns-edit-btn">
              <Icon name="edit" size={16} />
            </span>
          </div>
          <Text size="md" className="ns-profile-bio">
            {bio}
          </Text>
          <div className="ns-profile-socials">
            <div className="ns-address-box">
              <Text color="grey" className="ns-address-text" size="sm">
                {address}
              </Text>
              <Icon name="copy" size={16} />
            </div>
            <Button>
              <Icon name="twitter" color="#000000" size={16} />
            </Button>
            <Button>
              <Icon name="telegram" color="#000000" size={16} />
            </Button>
            <Button>
              <Icon name="globe" color="#000000" size={16} />
            </Button>
            <Button>
              <Icon name="github" color="#000000" size={16} />
            </Button>
          </div>
          <div className="ns-profile-stats">
            <div className="ns-stats-row">
              <Text size="sm">{followers} Followers</Text>
              <Text>•</Text>
              <Text size="sm">{following} Following</Text>
              <Button size="sm" variant="outline">
                Follow
              </Button>
            </div>
          </div>
        </div>
      </header>
      <section className="ns-profile-section ns-profile-links">
        <div className="ns-extra-item">
          <Text size="sm">Owned by {ownedBy}</Text>
          <button className="ns-extra-btn">
            <Icon name="check-circle" size={16} />
          </button>
        </div>
        <div className="ns-extra-item">
          <Text size="sm">Expires {expires}</Text>
          <Icon name="info" size={16} />
        </div>
        <div className="ns-extra-item">
          <Text size="sm">{address}</Text>
          <Icon name="map-pin" size={16} />
        </div>
        {website && (
          <div className="ns-extra-item">
            <Text size="sm">{website}</Text>
            <a href={website} target="_blank" rel="noreferrer">
              <Icon name="globe" size={16} />
            </a>
          </div>
        )}
      </section>
      <footer className="ns-profile-footer">
        <div className="ns-footer-item">
          <Text className="ns-footer-label">{subnames}</Text>
          <Text className="ns-footer-text">Subnames</Text>
        </div>
        <Text className="ns-footer-dot">•</Text>
        <div className="ns-footer-item">
          <Text className="ns-footer-label">{profit}</Text>
          <Text className="ns-footer-text">Profit</Text>
        </div>
        <Text className="ns-footer-dot">•</Text>
        <div className="ns-footer-item">
          <Text className="ns-footer-label">{volume}</Text>
          <Text className="ns-footer-text">Volume</Text>
        </div>
      </footer>
    </section>
  );
};
