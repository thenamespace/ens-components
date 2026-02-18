import React from "react";
import "./ProfileHeader.css";

export interface ProfileHeaderProps {
  bannerUrl: string;
  avatarUrl: string;
  chainIcon?: string;
  name: string;
  username?: string;
  bio?: string;
  followers?: number;
  following?: number;
  primary?: boolean;
  onFollowClick?: () => void;
  dataTestId?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  bannerUrl,
  avatarUrl,
  chainIcon = "/icons/eth.svg",
  name,
  username,
  bio,
  followers = 0,
  following = 0,
  primary = false,
  onFollowClick,
  dataTestId,
}) => {
  return (
    <div className="ns-profile-header" data-test-id={dataTestId}>
      {/* Banner */}
      <div className="ns-profile-header__banner">
        <img src={bannerUrl} alt="profile banner" />
      </div>

      {/* Avatar */}
      <div className="ns-profile-header__avatar">
        <img src={avatarUrl} alt={name} className="ns-avatar-img" />
        {chainIcon && (
          <span className="ns-profile-header__chain">
            <img src={chainIcon} alt="chain icon" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="ns-profile-header__info">
        {username && (
          <div className="ns-profile-header__username">{username}</div>
        )}

        <h2 className="ns-profile-header__name">{name}</h2>

        {primary && (
          <span className="ns-profile-header__primary">Your primary name</span>
        )}

        {bio && <p className="ns-profile-header__bio">{bio}</p>}

        <div className="ns-profile-header__stats">
          <span>{followers} Followers</span>
          <span>·</span>
          <span>{following} Following</span>
          <button className="ns-profile-header__follow" onClick={onFollowClick}>
            Follow
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
