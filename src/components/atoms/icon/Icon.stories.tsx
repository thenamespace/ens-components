import type { Meta, StoryObj } from "@storybook/react";
import { Icon, IconName } from "./Icon";

const meta: Meta<typeof Icon> = {
  title: "Atoms/Icon",
  component: Icon,
  args: {
    name: "person",
    size: 24,
    color: "currentColor",
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

const commonIcons: IconName[] = [
  "book",
  "box",
  "circle-alert",
  "circle-person",
  "globe",
  "image",
  "mail",
  "map-pin",
  "person",
  "search",
];

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {commonIcons.map((icon, index) => (
        <Icon key={icon} name={icon} size={24} />
      ))}
    </div>
  ),
};

export const SocialMediaIcons: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
      <Icon name="twitter" size={24} />
      <Icon name="discord" size={24} />
      <Icon name="github" size={24} />
      <Icon name="telegram" size={24} />
      <Icon name="youtube" size={24} />
    </div>
  ),
};
