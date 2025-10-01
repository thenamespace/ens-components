
import "./ProfileCard.css";
import { FiCopy, FiX } from "react-icons/fi";
import { FaTwitter, FaTelegramPlane, FaGlobe } from "react-icons/fa";
import { FiClock, FiMapPin, FiExternalLink } from "react-icons/fi"
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


            <div className="ns-profile-body">
                <span className="ns-profile-tag">Cap</span>
                <div className="ns-username-container">
                    <h2 className="ns-profile-username">{username}</h2>
                    <button className="ns-edit-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                    </button>
                </div>

                <p className="ns-profile-bio">{bio}</p>


                <div className="ns-profile-socials">
                    <button className="ns-copy-btn">
                        <FiCopy size={16} />
                    </button>
                    <button className="ns-copy-btn">
                        <FiX size={16} />
                    </button>
                    <button className="ns-social-btn">
                        <FaTwitter size={16} />
                    </button>
                    <button className="ns-social-btn">
                        <FaTelegramPlane size={16} />
                    </button>
                    <button className="ns-social-btn">
                        <FaGlobe size={16} />
                    </button>
                </div>


                <div className="ns-profile-stats">
                    <span>{followers} Followers</span>
                    <span>•</span>
                    <span>{following} Following</span>
                    <button className="ns-follow-btn">Follow</button>
                </div>




                <div className="ns-profile-extra">

                    <div className="ns-extra-item">
                        <span className="ns-extra-text">
                            Owned by {ownedBy}
                        </span>
                        <button className="ns-extra-btn">
                            <FiCopy size={14} />
                        </button>
                    </div>


                    <div className="ns-extra-item">
                        <span className="ns-extra-text">
                            Expires {expires}
                        </span>
                        <FiClock size={14} />
                    </div>


                    <div className="ns-extra-item">
                        <span className="ns-extra-text">
                            {address}
                        </span>
                        <FiMapPin size={14} />
                    </div>


                    {website && (
                        <div className="ns-extra-item">
                            <span className="ns-extra-text">{website}</span>
                            <a href={website} target="_blank" rel="noreferrer">
                                <FiExternalLink size={14} />
                            </a>
                        </div>
                    )}
                </div>


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
