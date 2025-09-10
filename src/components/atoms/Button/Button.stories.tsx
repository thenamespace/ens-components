import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Icon } from "../icon/Icon";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with support for icons, loading states, and multiple variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['solid', 'outline', 'ghost'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Whether the button is in a loading state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    prefix: {
      control: false,
      description: 'Icon or component to display before the button text',
    },
  },
  args: {
    children: "Button",
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Button>;

// Component Documentation
export const ComponentDocs: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h2>Component Documentation</h2>
      
      <h3>Key Props</h3>
      <ul>
        <li><code>variant</code> - Style: 'solid', 'outline', 'ghost' (default: 'solid')</li>
        <li><code>size</code> - Size: 'sm', 'md', 'lg' (default: 'md')</li>
        <li><code>loading</code> - Show loading spinner (boolean)</li>
        <li><code>disabled</code> - Disable button (boolean)</li>
        <li><code>prefix</code> - Icon or component before text (ReactNode)</li>
      </ul>

      <h3>Usage Examples</h3>
      <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px', overflow: 'auto' }}>
{`// Basic button
<Button>Click me</Button>

// With icon
<Button prefix={<Icon name="check-circle" />}>
  Success
</Button>

// Loading state
<Button loading>Processing...</Button>`}
      </pre>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Documentation for the Button component.',
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button variants: solid, outline, and ghost.',
      },
    },
  },
};

export const WithPrefix: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button prefix={<Icon name="check-circle" />}>
        Success
      </Button>
      <Button prefix={<Icon name="x-circle" />} variant="outline">
        Error
      </Button>
      <Button prefix={<Icon name="search" />} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons and icon-only buttons.',
      },
    },
  },
};