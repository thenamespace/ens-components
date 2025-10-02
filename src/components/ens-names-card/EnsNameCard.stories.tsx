import type { Meta, StoryObj } from "@storybook/react";
import { ENSNameCard } from "./EnsNameCard";

export default {
  title: "Components/ENSNameCard",
  component: ENSNameCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# ENSNameCard

A card component for displaying ENS name details, including avatar, name, expiry, and chain badge.
        `,
      },
    },
  },
  argTypes: {
    name: { control: "text", description: "ENS name" },
    imageUrl: { control: "text", description: "Avatar image URL" },
    expires: { control: "text", description: "Expiry date" },
    chain: { control: "text", description: "Chain name (e.g. eth, arb, base)" },
  },
} as Meta<typeof ENSNameCard>;

const Template = (args: any) => <ENSNameCard {...args} />;

export const Default: StoryObj<typeof ENSNameCard> = {
  render: Template,
  args: {
    name: "artii.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
    expires: "2026-12-31",
    chain: "eth",
  },
  parameters: {
    docs: {
      description: {
        story: "Default ENSNameCard with sample data.",
      },
    },
  },
};

export const WithCustomChain: StoryObj<typeof ENSNameCard> = {
  render: Template,
  args: {
    name: "jane.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    expires: "2027-05-20",
    chain: "arb",
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with custom chain badge.",
      },
    },
  },
};
