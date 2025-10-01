import "./ProfileCard.css";
import Icon from "../atoms/icon/Icon";

interface ProfileCardProps {
  bannerUrl: string;
  avatarUrl: string;
  name: string;
  username: string;
  bio: string;
  address: string;
  followers: number;
  following: number;
  ownedBy: string;
  expires: string;
  records: string[];
  website?: string;
  subnames: number;
  profit: number;
  volume: number;
}

export const ProfileCard = ({
  bannerUrl,
  avatarUrl,
  name,
  username,
  bio,
  address,
  followers,
  following,
  ownedBy,
  expires,
  records,
  website,
  subnames,
  profit,
  volume,
}: ProfileCardProps) => {
  return (
    <div className="ns-profile-card">
      {/* Banner + Avatar */}
      <div className="ns-profile-banner">
        <img src={bannerUrl} alt="banner" />
        <div className="ns-profile-avatar">
          <img src={avatarUrl} alt={name} />

          <div className="ns-avatar-badge">
            <img
              src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"
              alt="chain icon"
              className="ns-avatar-badge-icon"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="ns-profile-body">
        <span className="ns-profile-tag">Cap</span>

        <div className="ns-username-container">
          <h2 className="ns-profile-username">{username}</h2>
          <button className="ns-edit-btn">
            <Icon name="book" size={16} />
          </button>
        </div>

        <p className="ns-profile-bio">{bio}</p>

        {/* Social / Copy actions */}
        <div className="ns-profile-socials">
          <button className="ns-copy-btn">
            <Icon name="check-circle" size={16} />
          </button>
          <button className="ns-copy-btn">
            <Icon name="x" size={16} />
          </button>
          <button className="ns-social-btn">
            <Icon name="twitter" size={16} />
          </button>
          <button className="ns-social-btn">
            <Icon name="telegram" size={16} />
          </button>
          <button className="ns-social-btn">
            <Icon name="globe" size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="ns-profile-stats">
          <span>{followers} Followers</span>
          <span>•</span>
          <span>{following} Following</span>
          <button className="ns-follow-btn">Follow</button>
        </div>

        {/* Extra Info */}
        <div className="ns-profile-extra">
          <div className="ns-extra-item">
            <span className="ns-extra-text">Owned by {ownedBy}</span>
            <button className="ns-extra-btn">
              <Icon name="check-circle" size={14} />
            </button>
          </div>

          <div className="ns-extra-item">
            <span className="ns-extra-text">Expires {expires}</span>
            <Icon name="info" size={14} />
          </div>

          <div className="ns-extra-item">
            <span className="ns-extra-text">{address}</span>
            <Icon name="map-pin" size={14} />
          </div>

          {website && (
            <div className="ns-extra-item">
              <span className="ns-extra-text">{website}</span>
              <a href={website} target="_blank" rel="noreferrer">
                <Icon name="globe" size={14} />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ns-profile-footer">
          <div className="ns-footer-item">
            <span className="ns-footer-label">{subnames}</span>
            <span className="ns-footer-text">Subnames</span>
          </div>

          <div className="ns-footer-item">
            <span className="ns-footer-label">{profit}</span>
            <span className="ns-footer-text">Profit</span>
          </div>

          <div className="ns-footer-item">
            <span className="ns-footer-label">{volume}</span>
            <span className="ns-footer-text">Volume</span>
          </div>
        </div>
      </div>
    </div>
  );
};
