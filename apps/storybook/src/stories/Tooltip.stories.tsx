import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip, TooltipPosition, Button, Icon } from "@thenamespace/ens-components";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Atoms/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible tooltip component that displays helpful information when users hover over, focus on, or click an element. Supports multiple positions, triggers, and styling variants.",
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: "The element that triggers the tooltip",
    },
    content: {
      control: { type: "text" },
      description: "The content to display in the tooltip",
    },
    position: {
      control: { type: "select" },
      options: [
        "top",
        "bottom",
        "left",
        "right",
        "top-start",
        "top-end",
        "bottom-start",
        "bottom-end",
      ],
      description: "Position of the tooltip relative to the trigger element",
    },
    delay: {
      control: { type: "number", min: 0, max: 2000, step: 100 },
      description: "Delay in milliseconds before showing the tooltip",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Whether the tooltip is disabled",
    },
    trigger: {
      control: { type: "select" },
      options: ["hover", "click", "focus"],
      description: "Event that triggers the tooltip",
    },
    maxWidth: {
      control: { type: "number", min: 100, max: 500, step: 50 },
      description: "Maximum width of the tooltip in pixels",
    },
    offset: {
      control: { type: "number", min: 0, max: 20, step: 2 },
      description: "Offset distance between tooltip and trigger element",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Default story
export const Default: Story = {
  args: {
    content: "This is a tooltip",
    position: "top",
    delay: 200,
    disabled: false,
    trigger: "hover",
    maxWidth: 200,
    offset: 8,
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Hover me</Button>
    </Tooltip>
  ),
};

// Different positions
export const Positions: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <Tooltip content="Top tooltip" position="top">
        <Button>Top</Button>
      </Tooltip>

      <Tooltip content="Bottom tooltip" position="bottom">
        <Button>Bottom</Button>
      </Tooltip>

      <Tooltip content="Left tooltip" position="left">
        <Button>Left</Button>
      </Tooltip>

      <Tooltip content="Right tooltip" position="right">
        <Button>Right</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic tooltip positioning options.",
      },
    },
  },
};

// Different triggers
export const Triggers: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <Tooltip content="Hover to see this tooltip" trigger="hover">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip content="Click to toggle this tooltip" trigger="click">
        <Button>Click</Button>
      </Tooltip>

      <Tooltip content="Focus to see this tooltip" trigger="focus">
        <Button>Focus</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different trigger modes: hover, click, and focus.",
      },
    },
  },
};

// Component Documentation
export const ComponentDocs: Story = {
  render: () => (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
      <h2>Component Documentation</h2>

      <h3>Key Props</h3>
      <ul>
        <li>
          <code>content</code> - Tooltip content (ReactNode)
        </li>
        <li>
          <code>position</code> - Position: 'top', 'bottom', 'left', 'right'
          (default: 'top')
        </li>
        <li>
          <code>trigger</code> - Trigger: 'hover', 'click', 'focus' (default:
          'hover')
        </li>
        <li>
          <code>delay</code> - Delay in milliseconds (default: 200)
        </li>
        <li>
          <code>disabled</code> - Disable tooltip (boolean)
        </li>
      </ul>

      <h3>Usage Examples</h3>
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: "16px",
          borderRadius: "8px",
          overflow: "auto",
        }}
      >
        {`// Basic usage
<Tooltip content="This is a tooltip">
  <Button>Hover me</Button>
</Tooltip>

// With custom position
<Tooltip content="Bottom tooltip" position="bottom">
  <Button>Custom</Button>
</Tooltip>

// Click trigger
<Tooltip content="Click to toggle" trigger="click">
  <Button>Click me</Button>
</Tooltip>`}
      </pre>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Documentation for the Tooltip component.",
      },
    },
  },
};
