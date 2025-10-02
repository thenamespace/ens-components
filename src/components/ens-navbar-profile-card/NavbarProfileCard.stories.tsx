import type { Meta, StoryObj } from "@storybook/react";
import { NavbarProfileCard } from "./NavbarProfileCard";

export default {
  title: "Components/NavbarProfileCard",
  component: NavbarProfileCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# NavbarProfileCard

A compact profile card for navigation bars, showing avatar, name, address, and a logout action.
        `,
      },
    },
  },
  argTypes: {
    imageUrl: { control: "text", description: "Avatar image URL" },
    name: { control: "text", description: "Profile name" },
    address: { control: "text", description: "Wallet address" },
    onLogout: { action: "logout", description: "Logout callback" },
  },
} as Meta<typeof NavbarProfileCard>;

const Template = (args: any) => <NavbarProfileCard {...args} />;

export const Default: StoryObj<typeof NavbarProfileCard> = {
  render: Template,
  args: {
    imageUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
    name: "Artii.eth",
    address: "0x1234567890123456789012345678901234567890",
  },
  parameters: {
    docs: {
      description: {
        story: "Default NavbarProfileCard with sample data.",
      },
    },
  },
};

export const WithLogout: StoryObj<typeof NavbarProfileCard> = {
  render: Template,
  args: {
    imageUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    name: "Jane.eth",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    onLogout: () => alert("Logged out!"),
  },
  parameters: {
    docs: {
      description: {
        story: "NavbarProfileCard with logout action.",
      },
    },
  },
};
