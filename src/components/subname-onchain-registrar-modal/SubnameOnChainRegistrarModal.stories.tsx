import React, { useState, useEffect, useRef } from "react";
import {
  SubnameOnChainRegistrarModal,
  SubnameOnChainRegistrarModalProps,
} from "./SubnameOnChainRegistrarModal";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SubnameOnChainRegistrarModal> = {
  title: "Modals/SubnameOnChainRegistrarModal",
  component: SubnameOnChainRegistrarModal,
  parameters: {
    layout: "centered",
  },
};
export default meta;
type Story = StoryObj<typeof SubnameOnChainRegistrarModal>;
const Template = (args: Partial<SubnameOnChainRegistrarModalProps>) => {
  const [step, setStep] = useState(args.step ?? 0);
  const [name, setName] = useState(args.name ?? "");
  const [profileComplete, setProfileComplete] = useState(
    args.profileComplete ?? false
  );
  const [owner, setOwner] = useState(args.owner ?? "0x035eB...24117D3");
  const [duration, setDuration] = useState(args.duration ?? 1);
  const [useAsPrimary, setUseAsPrimary] = useState(args.useAsPrimary ?? false);
  const stepRef = useRef(step);

  // Update ref when step changes
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  return (
    <SubnameOnChainRegistrarModal
      key={step}
      step={step}
      name={name}
      profileComplete={profileComplete}
      domainSuffix={args.domainSuffix}
      owner={owner}
      duration={duration}
      registrationFee={args.registrationFee}
      networkFee={args.networkFee}
      totalCost={args.totalCost}
      useAsPrimary={useAsPrimary}
      profileImageUrl={args.profileImageUrl}
      onStepChange={setStep}
      onNameChange={setName}
      onProfileCompleteChange={setProfileComplete}
      onOwnerChange={setOwner}
      onDurationChange={setDuration}
      onUseAsPrimaryChange={setUseAsPrimary}
      onRegister={() => {
        // Advance to next step when register is clicked from step 1
        const currentStep = stepRef.current;
        if (currentStep === 1) {
          setStep(2);
        }
        alert("Register clicked");
      }}
      onCancel={() => alert("Cancel clicked")}
      onClose={() => alert("Close clicked")}
      onCompleteProfile={() => {
        setProfileComplete(true);
        alert("Complete Profile clicked");
      }}
      onCompleteRegistration={() => {
        // Advance to success screen (step 2) when registration is completed
        setStep(2);
        alert("Complete Registration clicked");
      }}
      onFinish={() => alert("Finish clicked")}
    />
  );
};

export const InitialStep: Story = {
  render: () => <Template step={0} name="" profileComplete={false} />,
};

export const InitialStepWithSubname: Story = {
  render: () => (
    <Template
      step={0}
      name=""
      domainSuffix="namespace.eth"
      profileComplete={false}
    />
  ),
};

export const RegistrationStep: Story = {
  render: () => (
    <Template
      step={1}
      name="magier"
      domainSuffix="namespace.eth"
      profileComplete={false}
      owner="0x035eBd096AFa6b98372494C7f08f3402324117D3"
      duration={1}
    />
  ),
};

export const RegistrationStepWithProfileComplete: Story = {
  render: () => (
    <Template
      step={1}
      name="magier"
      domainSuffix="namespace.eth"
      profileComplete={true}
      profileImageUrl="https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg"
      owner="0x035eBd096AFa6b98372494C7f08f3402324117D3"
      duration={1}
    />
  ),
};

export const SuccessScreen: Story = {
  render: () => (
    <Template step={2} name="magier.namespace.eth" profileComplete={true} />
  ),
};
