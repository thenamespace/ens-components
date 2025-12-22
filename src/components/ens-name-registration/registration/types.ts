import { EnsRecords } from "@/types";

export enum ProcessSteps {
  Start = 0,
  CommitmentSent = 1,
  CommitmentCompleted = 2,
  TimerStarted = 3,
  TimerCompleted = 4,
  RegistrationSent = 5,
  RegistrationCompleted = 6,
}

export interface RegistrationState {
  step: ProcessSteps;
  commitment: { tx?: string; completed: boolean; time: number };
  timerStartedAt: number;
  registration: { tx?: string; completed: boolean };
  label: string;
  isTestnet?: boolean;
  secret: string;
  expiryInYears: number;
  records: EnsRecords;
}

