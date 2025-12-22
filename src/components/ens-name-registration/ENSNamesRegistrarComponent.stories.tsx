import React, { useState } from "react";
import {
  EnsNameRegistrationForm,
  EnsNameRegistrationFormProps
} from "./ENSNameRegistrationForm";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof EnsNameRegistrationForm> = {
  title: "Components/EnsNameRegistrationForm",
  component: EnsNameRegistrationForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A multi-step component for registering ENS names. The component has 4 steps: NameSearch (step 0), RegistrationForm (step 1), RegistrationProcess (step 2), and SuccessScreen (step 3). Click through the steps to see each state.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof EnsNameRegistrationForm>;

const Template = (args: Partial<EnsNameRegistrationFormProps>) => {
  const [name, setName] = useState(args.name ?? "");

  return (
    <EnsNameRegistrationForm
      name={name}
      isTestnet={false}
    />
  );
};

/**
 * **Step 0: NameSearch**
 *
 * The initial step where users search for an ENS name.
 * - Enter a name to check availability
 * - Click "Next" when name is available to proceed to RegistrationForm
 */
export const NameSearch: Story = {
  render: () => <Template name="artii.eth" />,
  parameters: {
    docs: {
      description: {
        story:
          "Initial step showing the name search interface. Enter a name and click Next to proceed.",
      },
    },
  },
};