import type { Meta, StoryObj } from "@storybook/react";
import { ProfileCard } from "./ProfileCard";

export default {
  title: "Components/ProfileCard",
  component: ProfileCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# ProfileCard

A user profile card component for displaying ENS profile information, including avatar, banner, username, bio, address, stats, and social links.

## Features
- Banner and avatar
- Username, bio, and address
- Social and copy actions
- Stats and extra info
- Responsive layout
        `,
      },
    },
  },
  argTypes: {
    bannerUrl: { control: "text", description: "Banner image URL" },
    avatarUrl: { control: "text", description: "Avatar image URL" },
    name: { control: "text", description: "Full name" },
    username: { control: "text", description: "Username" },
    bio: { control: "text", description: "Profile bio" },
    address: { control: "text", description: "Wallet address" },
    followers: { control: "number", description: "Number of followers" },
    following: { control: "number", description: "Number of following" },
    ownedBy: { control: "text", description: "Owner address or name" },
    expires: { control: "text", description: "Expiry date" },
    records: { control: "object", description: "ENS records" },
    website: { control: "text", description: "Website URL" },
    subnames: { control: "number", description: "Subnames count" },
    profit: { control: "number", description: "Profit value" },
    volume: { control: "number", description: "Volume value" },
  },
} as Meta<typeof ProfileCard>;

const Template = (args: any) => <ProfileCard {...args} />;

export const Default: StoryObj<typeof ProfileCard> = {
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    avatarUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
    name: "Artii",
    username: "artii.eth",
    bio: "Web3 builder, ENS enthusiast, and open source contributor.",
    address: "0x1234567890123456789012345678901234567890",
    followers: 1200,
    following: 300,
    ownedBy: "artii.eth",
    expires: "2026-12-31",
    records: ["description", "url", "avatar"],
    website: "https://artii.eth.limo",
    subnames: 5,
    profit: 2.5,
    volume: 100,
  },
  parameters: {
    docs: {
      description: {
        story: "Default ProfileCard with sample data.",
      },
    },
  },
};

export const WithCustomData: StoryObj<typeof ProfileCard> = {
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    avatarUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    name: "Jane Doe",
    username: "jane.eth",
    bio: "Decentralized identity explorer.",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    followers: 800,
    following: 150,
    ownedBy: "jane.eth",
    expires: "2027-05-20",
    records: ["description", "avatar"],
    website: "https://jane.eth.limo",
    subnames: 2,
    profit: 1.2,
    volume: 50,
  },
  parameters: {
    docs: {
      description: {
        story: "ProfileCard with custom user data.",
      },
    },
  },
};

export const NoAvatar: StoryObj<typeof ProfileCard> = {
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    avatarUrl: "", // No avatar
    name: "No Avatar User",
    username: "noavatar.eth",
    bio: "This user has no avatar set.",
    address: "0x0000000000000000000000000000000000000000",
    followers: 0,
    following: 0,
    ownedBy: "noavatar.eth",
    expires: "2028-01-01",
    records: [],
    website: "",
    subnames: 0,
    profit: 0,
    volume: 0,
  },
  parameters: {
    docs: {
      description: {
        story: "ProfileCard with no avatar and zero stats.",
      },
    },
  },
};

export const LongBio: StoryObj<typeof ProfileCard> = {
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    avatarUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    name: "Long Bio User",
    username: "longbio.eth",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut laoreet cursus, enim erat dictum urna, nec cursus enim erat euismod nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam euismod, nunc ut laoreet cursus, enim erat dictum urna, nec cursus enim erat euismod nunc.",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    followers: 10,
    following: 5,
    ownedBy: "longbio.eth",
    expires: "2029-12-31",
    records: ["description"],
    website: "https://longbio.eth.limo",
    subnames: 1,
    profit: 0.1,
    volume: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "ProfileCard with a very long bio.",
      },
    },
  },
};

export const MissingWebsite: StoryObj<typeof ProfileCard> = {
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    avatarUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
    name: "No Website",
    username: "noweb.eth",
    bio: "No website provided.",
    address: "0x1234567890123456789012345678901234567890",
    followers: 100,
    following: 50,
    ownedBy: "noweb.eth",
    expires: "2027-07-07",
    records: ["description"],
    website: undefined,
    subnames: 3,
    profit: 0.5,
    volume: 10,
  },
  parameters: {
    docs: {
      description: {
        story: "ProfileCard with no website link.",
      },
    },
  },
};

export const ManyFollowers: StoryObj<typeof ProfileCard> = {
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    avatarUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    name: "Popular User",
    username: "popular.eth",
    bio: "This user is very popular!",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    followers: 100000,
    following: 1000,
    ownedBy: "popular.eth",
    expires: "2030-01-01",
    records: ["description", "avatar"],
    website: "https://popular.eth.limo",
    subnames: 10,
    profit: 100,
    volume: 1000,
  },
  parameters: {
    docs: {
      description: {
        story: "ProfileCard with a large number of followers and subnames.",
      },
    },
  },
};
