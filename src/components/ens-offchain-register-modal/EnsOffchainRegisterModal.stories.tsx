import React, { useState } from "react";
import { EnsOffChainRegisterModal, EnsOffChainRegisterModalProps } from "./EnsOffChainRegisterModal";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof EnsOffChainRegisterModal> = {
  title: "Modals/EnsOffChainRegisterModal",
  component: EnsOffChainRegisterModal,
  parameters: {
    layout: "centered",
  },
};
export default meta;

type Story = StoryObj<typeof EnsOffChainRegisterModal>;

const Template = (args: Partial<EnsOffChainRegisterModalProps>) => {
  const [step, setStep] = useState(args.step ?? 0);
  const [name, setName] = useState(args.name ?? "newname");
  const [profileComplete, setProfileComplete] = useState(args.profileComplete ?? false);

  return (
    <EnsOnchainRegisterModal
      step={step}
      name={name}
      profileComplete={profileComplete}
      onStepChange={setStep}
      onNameChange={setName}
      onProfileCompleteChange={setProfileComplete}
      onRegister={() => alert("Register clicked")}
      onCancel={() => alert("Cancel clicked")}
    />
  );
};

export const Default: Story = {
  render: () => <Template step={0} name="newname" profileComplete={false} />,
};

export const Step1: Story = {
  render: () => <Template step={1} name="newname" profileComplete={false} />,
};

export const Step2: Story = {
  render: () => <Template step={2} name="newname" profileComplete={false} />,
};

export const Step3: Story = {
  render: () => <Template step={3} name="newname" profileComplete={false} />,
};

export const Step4: Story = {
  render: () => <Template step={4} name="newname" profileComplete={false} />,
};

export const Success: Story = {
  render: () => <Template step={5} name="newname" profileComplete={true} />,
};
