import React, { useState } from "react";
import {
  ENSNamesRegisterComponent,
  ENSNamesRegisterComponentProps,
} from "./ENSNamesRegisterComponent";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof ENSNamesRegisterComponent> = {
  title: "Components/ENSNamesRegisterComponent",
  component: ENSNamesRegisterComponent,
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

type Story = StoryObj<typeof ENSNamesRegisterComponent>;

const Template = (args: Partial<ENSNamesRegisterComponentProps>) => {
  const [name, setName] = useState(args.name ?? "");
  const [duration, setDuration] = useState(args.duration ?? 1);

  return (
    <ENSNamesRegisterComponent
      name={name}
      duration={duration}
      onNameChange={setName}
      onDurationChange={setDuration}
      onBack={() => alert("Back clicked")}
      onClose={() => alert("Close clicked")}
      onNext={() => alert("Next clicked")}
      onCompleteProfile={() => alert("Complete Profile clicked")}
      onOpenWallet={() => alert("Open Wallet clicked")}
      onCompleteRegistration={() => alert("Complete Registration clicked")}
      onRegisterAnother={() => {
        setName("");
        setDuration(1);
        alert("Register Another clicked");
      }}
      onViewName={() => alert("View Name clicked")}
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
  render: () => <Template name="" duration={1} />,
  parameters: {
    docs: {
      description: {
        story:
          "Initial step showing the name search interface. Enter a name and click Next to proceed.",
      },
    },
  },
};

export const NameSearchWithName: Story = {
  render: () => <Template name="brightwave" duration={1} />,
  parameters: {
    docs: {
      description: {
        story: "NameSearch step with a pre-filled name.",
      },
    },
  },
};

export const NameSearchWithLongName: Story = {
  render: () => <Template name="myverylongensname" duration={1} />,
  parameters: {
    docs: {
      description: {
        story: "NameSearch step with a longer name to test layout.",
      },
    },
  },
};

/**
 * **Step 1: RegistrationForm**
 *
 * Shows after clicking Next in NameSearch.
 * - Displays the selected name
 * - Allows adjusting registration duration
 * - Shows cost breakdown
 * - Option to complete profile
 * - Click "Next" to proceed to RegistrationProcess
 */
export const RegistrationForm: Story = {
  render: () => <Template name="brightwave" duration={1} />,
  parameters: {
    docs: {
      description: {
        story:
          "Registration form step. To see this step, start from NameSearch and click Next with an available name.",
      },
    },
  },
};

export const RegistrationFormWithLongName: Story = {
  render: () => <Template name="myverylongensname" duration={2} />,
  parameters: {
    docs: {
      description: {
        story: "RegistrationForm with a longer name and 2-year duration.",
      },
    },
  },
};

export const RegistrationFormWithDifferentDuration: Story = {
  render: () => <Template name="brightwave" duration={3} />,
  parameters: {
    docs: {
      description: {
        story: "RegistrationForm with 3-year registration duration.",
      },
    },
  },
};

/**
 * **Step 2: RegistrationProcess**
 *
 * Shows after clicking Next in RegistrationForm.
 * - Displays registration progress
 * - Shows transaction steps
 * - Timer for completion
 * - Click "Open Wallet" to start the process
 */
export const RegistrationProcess: Story = {
  render: () => <Template name="brightwave" duration={1} />,
  parameters: {
    docs: {
      description: {
        story:
          "Registration process step. To see this step, navigate through NameSearch → RegistrationForm → Next.",
      },
    },
  },
};

/**
 * **Step 3: SuccessScreen**
 *
 * Shows after registration is complete.
 * - Displays success message
 * - Shows registration details
 * - Options to register another name or view the name
 */
export const SuccessScreen: Story = {
  render: () => <Template name="brightwave" duration={1} />,
  parameters: {
    docs: {
      description: {
        story:
          "Success screen shown after registration completion. To see this step, complete the full registration flow.",
      },
    },
  },
};
