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
  },
};
export default meta;

type Story = StoryObj<typeof ENSNamesRegisterComponent>;

const Template = (args: Partial<ENSNamesRegisterComponentProps>) => {
  const [name, setName] = useState(args.name ?? "brightwave");
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
        setName("brightwave");
        setDuration(1);
        alert("Register Another clicked");
      }}
      onViewName={() => alert("View Name clicked")}
    />
  );
};

export const RegistrationForm: Story = {
  render: () => <Template name="brightwave" duration={1} />,
};

export const RegistrationFormWithLongName: Story = {
  render: () => <Template name="myverylongensname" duration={2} />,
};

export const RegistrationFormWithDifferentDuration: Story = {
  render: () => <Template name="brightwave" duration={3} />,
};

export const RegistrationFormEmpty: Story = {
  render: () => <Template name="" duration={1} />,
};
