import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "@thenamespace/ens-components";

const meta: Meta<typeof Alert> = {
  title: "Molecules/Alert",
  component: Alert,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["error", "warning", "info", "success"],
    },
    dismissible: {
      control: { type: "boolean" },
    },
    title: {
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Error: Story = {
  args: {
    variant: "error",
    children: "This is an error message that indicates something went wrong.",
    title: "Error",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "This is a warning message that indicates a potential issue.",
    title: "Warning",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    children: "This is an informational message that provides helpful context.",
    title: "Information",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children:
      "This is a success message that indicates something completed successfully.",
    title: "Success",
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: "info",
    children: "This is an alert without a title.",
  },
};

export const Dismissible: Story = {
  args: {
    variant: "warning",
    children: "This is a dismissible alert. Click the X to close it.",
    title: "Dismissible Alert",
    dismissible: true,
    onClose: () => alert("Alert closed!"),
  },
};

export const LongContent: Story = {
  args: {
    variant: "info",
    children:
      "This is a longer alert message that demonstrates how the component handles multiple lines of text. It should wrap properly and maintain good readability while preserving the visual hierarchy and spacing.",
    title: "Long Content Example",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Alert variant="error" title="Error">
        This is an error message.
      </Alert>
      <Alert variant="warning" title="Warning">
        This is a warning message.
      </Alert>
      <Alert variant="info" title="Info">
        This is an info message.
      </Alert>
      <Alert variant="success" title="Success">
        This is a success message.
      </Alert>
    </div>
  ),
};
