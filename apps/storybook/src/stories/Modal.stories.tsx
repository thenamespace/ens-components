import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal, Button, Text } from "@thenamespace/ens-components";

const meta: Meta<typeof Modal> = {
  title: "Molecules/Modal",
  component: Modal,
  parameters: { layout: "padded" },
  argTypes: {
    isOpen: {
      control: { type: "boolean" },
      description: "Controls visibility",
    },
    title: {
      control: { type: "text" },
      description: "Modal title (string or node)",
    },
    size: {
      control: { type: "radio" },
      options: ["sm", "md", "lg"],
      description: "Dialog width preset",
    },
    isDismissDisabled: {
      control: { type: "boolean" },
      description: "Disable overlay/Escape close",
    },
    footer: { control: false, description: "Custom footer content" },
    onClose: {
      action: "closed",
      description: "Called when modal requests to close",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: args => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal
          {...args}
          isOpen={open}
          onClose={() => setOpen(false)}
          title={args.title ?? "Example modal"}
        >
          <Text>
            This is a modal. Use it to present important information or request
            user actions.
          </Text>
        </Modal>
      </>
    );
  },
  args: {
    isOpen: true,
    size: "md",
  },
};

export const WithCustomFooter: Story = {
  render: args => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal
          {...args}
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Delete item"
          footer={
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Delete</Button>
            </div>
          }
        >
          <Text>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </Text>
        </Modal>
      </>
    );
  },
  args: { isOpen: true, size: "sm" },
};

export const Drawer: Story = {
  render: args => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Modal
          {...args}
          isOpen={open}
          onClose={() => setOpen(false)}
          presentation="drawer"
        >
          <Text>
            This modal renders as a bottom drawer. It slides up from the bottom
            and is full-width with top-only border radius.
          </Text>
        </Modal>
      </>
    );
  },
  args: { isOpen: true, size: "md" },
};

export const ResponsiveDrawer: Story = {
  render: args => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open responsive modal</Button>
        <Modal
          {...args}
          isOpen={open}
          onClose={() => setOpen(false)}
          presentation="dialog"
          responsivePresentation={{ mobile: "drawer", breakpointPx: 600 }}
        >
          <Text>
            This modal renders as a centered dialog on desktop and a bottom
            drawer on mobile viewports (below 600px). Resize the viewport to see
            it switch.
          </Text>
        </Modal>
      </>
    );
  },
  args: { isOpen: true, size: "md" },
};
