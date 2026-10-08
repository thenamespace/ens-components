import { EnsRecords } from "@/types";
import { Address, Hash } from "viem";

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
  commitment: { tx?: string; completed: boolean; time: number; feeWei?: bigint };
  timerStartedAt: number;
  registration: { tx?: string; completed: boolean };
  label: string;
  isTestnet?: boolean;
  secret: string;
  durationInSeconds: number;
  records: EnsRecords;
  referrer?: Address;
  isLoading?: boolean;
}

export type CommitmentSender = (state: RegistrationState) => Promise<Hash>;

export type RegistrationSender = (
  state: RegistrationState,
  onSent: (hash: Hash) => void,
) => Promise<{ txHash: Hash; price: string; extraFeeWei?: bigint }>;
