import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./Icon";

const meta: Meta<typeof Icon> = {
  title: "Atoms/Icon",
  component: Icon,
  args: {
    name: "user",
    size: 24,
    color: "currentColor",
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {};

export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Icon name="heart" size={16} />
      <Icon name="heart" size={24} />
      <Icon name="heart" size={32} />
      <Icon name="heart" size={48} />
    </div>
  ),
};

export const DifferentColors: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Icon name="star" color="gold" size={24} />
      <Icon name="star" color="red" size={24} />
      <Icon name="star" color="blue" size={24} />
      <Icon name="star" color="green" size={24} />
    </div>
  ),
};

export const CommonIcons: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
      <Icon name="user" size={24} />
      <Icon name="mail" size={24} />
      <Icon name="phone" size={24} />
      <Icon name="home" size={24} />
      <Icon name="search" size={24} />
      <Icon name="settings" size={24} />
      <Icon name="heart" size={24} />
      <Icon name="star" size={24} />
      <Icon name="check" size={24} />
      <Icon name="x" size={24} />
    </div>
  ),
}; 