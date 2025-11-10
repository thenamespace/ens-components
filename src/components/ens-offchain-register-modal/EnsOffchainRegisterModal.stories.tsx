import React, { useState } from "react";
import {
  EnsOffChainRegisterModal,
  EnsOffChainRegisterModalProps,
} from "./EnsOffChainRegisterModal";
import type { Meta, StoryObj } from "@storybook/react";
const meta: Meta<typeof EnsOffChainRegisterModal> = {
  title: "Modals/EnsOffChainRegisterModal",
  component: EnsOffChainRegisterModal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A modal component for off-chain ENS name registration. The component has 2 main steps: InitialStep (step 0) for name search and selection, and OffchainSuccessScreen (step 2) shown after successful registration. Click through the steps to see each state.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof EnsOffChainRegisterModal>;

const Template = (args: Partial<EnsOffChainRegisterModalProps>) => {
  const [step, setStep] = useState(args.step ?? 0);
  const [name, setName] = useState(args.name ?? "");
  const [profileComplete, setProfileComplete] = useState(
    args.profileComplete ?? false
  );

  return (
    <EnsOffChainRegisterModal
      step={step}
      name={name}
      profileComplete={profileComplete}
      onStepChange={setStep}
      onNameChange={setName}
      onProfileCompleteChange={setProfileComplete}
      onRegister={() => alert("Register clicked")}
      onCancel={() => alert("Cancel clicked")}
      onClose={() => alert("Close clicked")}
      onCompleteProfile={() => {
        setProfileComplete(true);
        alert("Complete Profile clicked");
      }}
      onOpenWallet={() => alert("Open Wallet clicked")}
      onCompleteRegistration={() => alert("Complete Registration clicked")}
      onRegisterAnother={() => {
        setName("");
        setProfileComplete(false);
        setStep(0);
        alert("Register Another clicked");
      }}
      onViewName={() => alert("View Name clicked")}
    />
  );
};

/**
 * **Step 0: InitialStep**
 *
 * The initial step where users search for an ENS subname under the particle.eth domain.
 * - Enter a subname to check availability
 * - Shows checkmark when name is available
 * - Shows error message when name is unavailable
 * - Button text changes from "Register" to "Next" when name is available
 * - Click "Next" or "Register" to proceed to success screen
 */
export const InitialStep: Story = {
  render: () => <Template step={0} name="" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story:
          "Initial step showing the name search interface for off-chain registration. Enter a subname (e.g., 'magier') and it will be registered under particle.eth domain. The button shows 'Register' initially and changes to 'Next' when a name is available.",
      },
    },
  },
};

export const InitialStepWithName: Story = {
  render: () => <Template step={0} name="magier" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story:
          "InitialStep with a pre-filled name. The button will show 'Next' if the name is available (length > 3 and valid characters), or 'Register' if not yet checked.",
      },
    },
  },
};

export const InitialStepWithAvailableName: Story = {
  render: () => <Template step={0} name="brightwave" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story:
          "InitialStep with an available name that will show the checkmark and enable the 'Next' button.",
      },
    },
  },
};

export const InitialStepWithLongName: Story = {
  render: () => (
    <Template step={0} name="myverylongensname" profileComplete={false} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "InitialStep with a longer name to test layout and responsiveness. Useful for testing how the component handles longer subnames.",
      },
    },
  },
};

export const InitialStepWithUnavailableName: Story = {
  render: () => <Template step={0} name="abc" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story:
          "InitialStep showing an unavailable name (names must be longer than 3 characters). The error message will be displayed and the button will be disabled.",
      },
    },
  },
};

export const InitialStepWithInvalidName: Story = {
  render: () => <Template step={0} name="test@name" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story:
          "InitialStep showing an invalid name with special characters. Invalid characters are automatically filtered out, but if the resulting name is too short, it will show as unavailable.",
      },
    },
  },
};

/**
 * **Step 2: OffchainSuccessScreen**
 *
 * Shows after successful off-chain registration.
 * - Displays success message with the registered name
 * - Shows options to set profile or finish
 * - Can navigate back or close the modal
 * - Option to complete profile is shown if onSetProfile callback is provided
 */
export const SuccessScreen: Story = {
  render: () => (
    <Template step={2} name="magier.particle.eth" profileComplete={false} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Success screen shown after successful off-chain registration. To see this step, start from InitialStep and click Next/Register with an available name. Shows the registered name and options to complete profile or finish.",
      },
    },
  },
};

export const SuccessScreenWithProfile: Story = {
  render: () => (
    <Template step={2} name="magier.particle.eth" profileComplete={true} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Success screen with profile completion status. Shows when the user has completed their profile. The profile completion card may not be shown if profile is already complete.",
      },
    },
  },
};

export const SuccessScreenWithLongName: Story = {
  render: () => (
    <Template
      step={2}
      name="myverylongensname.particle.eth"
      profileComplete={false}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Success screen with a longer registered name to test layout and text wrapping. Useful for ensuring the component handles longer names gracefully.",
      },
    },
  },
};

export const SuccessScreenWithShortName: Story = {
  render: () => (
    <Template step={2} name="xyz.particle.eth" profileComplete={false} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Success screen with a shorter registered name to test layout with minimal text.",
      },
    },
  },
};
