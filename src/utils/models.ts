export interface NameRegistration {
  label: string;
  durationInYears: number;
  price: {
    isChecking: boolean;
    ethValue: number;
    weiValue: bigint;
  };
}

export interface NameRegistrationProcessCache {
    currentStep: number
    registrations: any[]
}

export const formatPrice = (value: number) => {
  return parseFloat(value.toFixed(4));
};

export enum EnsRegistrationSteps {
    SelectNames,
    RegistrationBegin,
    CommitmentSent,
    TimerStarted,
    TimerCompleted,
    RegistrationSent,
    RegistrationCompleted

}