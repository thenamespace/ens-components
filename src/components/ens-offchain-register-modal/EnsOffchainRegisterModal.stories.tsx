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

export const InitialStep: Story = {
  render: () => <Template step={0} name="" profileComplete={false} />,
};

export const InitialStepWithName: Story = {
  render: () => <Template step={0} name="magier" profileComplete={false} />,
};

export const SuccessScreen: Story = {
  render: () => (
    <Template step={2} name="magier.particle.eth" profileComplete={false} />
  ),
};

export const SuccessScreenWithProfile: Story = {
  render: () => (
    <Template step={2} name="magier.particle.eth" profileComplete={true} />
  ),
};
