import { type Address, type PublicClient } from "viem";
import {
  OnchainError,
  type OnchainClient,
  type PrepareRegistrationInput,
} from "@thenamespace/onchain-subnames";
import type { EnsRecords } from "@/types";
import {
  encodeRecordsUpdate,
  getEnsRecordsDiff,
  type ResolverStyle,
} from "@/utils";

export interface RegistrationResolver {
  address: Address;
  style: ResolverStyle;
}

interface RegistrationWithRecordsInput extends PrepareRegistrationInput {
  records: EnsRecords;
  recordResolver: RegistrationResolver;
}

export const prepareRegistrationWithRecords = async (
  client: OnchainClient,
  input: RegistrationWithRecordsInput
) => {
  const prepared = await client.prepareRegistration(input);
  const diff = getEnsRecordsDiff({ addresses: [], texts: [] }, input.records);
  if (diff.isDifferent) {
    if (
      prepared.resolver.toLowerCase() !==
      input.recordResolver.address.toLowerCase()
    )
      throw new OnchainError(
        "CONFIGURATION_CHANGED",
        "The parent resolver changed. Refresh this form before setting records."
      );
    prepared.calls.push({
      ...encodeRecordsUpdate(
        input.recordResolver.style,
        prepared.resolver,
        prepared.quote.name,
        diff
      ),
      value: 0n,
      title: "Setting records",
    });
  }
  return prepared;
};

export const canSetRecordsDuringRegistration = async (
  publicClient: PublicClient,
  client: OnchainClient,
  input: Omit<RegistrationWithRecordsInput, "records">
): Promise<boolean> => {
  const prepared = await prepareRegistrationWithRecords(client, {
    ...input,
    records: { addresses: [], texts: [{ key: "description", value: "-" }] },
  });
  const { results } = await publicClient.simulateCalls({
    account: input.account,
    calls: prepared.calls,
    stateOverrides: [{ address: input.account, balance: 10n ** 30n }],
  });
  return (
    results.length === prepared.calls.length &&
    results.every(result => result.status === "success")
  );
};
