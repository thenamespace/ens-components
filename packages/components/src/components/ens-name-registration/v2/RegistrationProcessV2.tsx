import { useEffect, useState } from "react";
import { type Address, type Hash, type Hex, type PublicClient, type WalletClient } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { Button, Text } from "@/components/atoms";
import { Alert, isUserDeniedError } from "@/components/molecules";
import type { EnsRecords } from "@/types";
import { paidFees, sendCallsWithFallback } from "@/utils";
import { Timer } from "../registration/Timer";
import { TransactionPendingScreen } from "../registration/TransactionPendingScreen";
import {
  buildEnsV2CommitCall,
  buildEnsV2RegisterCalls,
  type EnsV2RegistrationDeployment,
  type EnsV2RegistrationToken,
  getEnsV2CommitmentReadyAt,
  getEnsV2RegistrationPrice,
  getNameResolver,
  makeEnsV2Commitment,
  randomSecret,
} from "./ensv2-register";

type Phase =
  | { kind: "idle" }
  | { kind: "committing"; hash: Hash | null; sent?: boolean }
  | { kind: "waiting"; readyAt: number }
  | { kind: "ready" }
  | { kind: "registering"; hash: Hash | null; sent?: boolean; title?: string };

export interface RegistrationV2Result {
  price: bigint;
  transactionFees: string;
  txHash: Hash;
}

const COMMIT_WAIT_POLL_MS = 1000;
const MAX_COMMITMENT_AGE_SECONDS = 86_400;

type SavedCommitment = { secret: Hex; durationSeconds: number };

const commitmentKey = (chainId: number, owner: Address, label: string) =>
  `ns-ensv2-commitment:${chainId}:${owner.toLowerCase()}:${label}`;

const loadCommitment = (key: string): SavedCommitment | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SavedCommitment) : null;
  } catch {
    return null;
  }
};

const saveCommitment = (key: string, value: SavedCommitment | null) => {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
  }
};

export const RegistrationProcessV2 = ({
  deployment,
  label,
  durationSeconds,
  token,
  records,
  onBack,
  onStart,
  onSuccess,
}: {
  deployment: EnsV2RegistrationDeployment;
  label: string;
  durationSeconds: number;
  token: EnsV2RegistrationToken;
  records: EnsRecords;
  onBack: () => void;
  onStart?: (name: string) => void;
  onSuccess: (result: RegistrationV2Result) => void;
}) => {
  const { chainId } = deployment;
  const { address, chain } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const publicClient = usePublicClient({ chainId }) as PublicClient | undefined;
  const { data: walletClient } = useWalletClient({ chainId });

  const storageKey = address ? commitmentKey(chainId, address, label) : null;
  const [saved] = useState(() => {
    const value = storageKey ? loadCommitment(storageKey) : null;
    return value?.durationSeconds === durationSeconds ? value : null;
  });
  const [secret] = useState<Hex>(() => saved?.secret ?? randomSecret());
  const [resolver, setResolver] = useState<{
    address: Address;
    deployed: boolean;
    salt: bigint;
  } | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [commitFeeHashes, setCommitFeeHashes] = useState<Hash[]>([]);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const duration = BigInt(durationSeconds);
  const name = `${label}.eth`;

  useEffect(() => {
    if (!publicClient || !address) return;
    getNameResolver(publicClient, deployment, address, label)
      .then(setResolver)
      .catch(() => setError("Couldn't look up the name's resolver."));
  }, [publicClient, address, deployment]);

  const commitment =
    address && resolver
      ? makeEnsV2Commitment({ label, owner: address, secret, resolver: resolver.address, duration })
      : null;

  useEffect(() => {
    if (!saved || !storageKey || !publicClient || !commitment || phase.kind !== "idle") return;
    getEnsV2CommitmentReadyAt(publicClient, deployment, commitment).then((readyAt) => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expired = readyAt === null || nowSeconds > readyAt + MAX_COMMITMENT_AGE_SECONDS - 60;
      if (expired) {
        saveCommitment(storageKey, null);
        return;
      }
      setNow(nowSeconds);
      setPhase(nowSeconds >= readyAt ? { kind: "ready" } : { kind: "waiting", readyAt });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commitment]);

  useEffect(() => {
    if (phase.kind !== "waiting") return;
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), COMMIT_WAIT_POLL_MS);
    return () => clearInterval(timer);
  }, [phase.kind]);

  useEffect(() => {
    if (phase.kind !== "waiting" || now < phase.readyAt || !publicClient) return;
    publicClient.getBlock().then((block) => {
      if (Number(block.timestamp) >= phase.readyAt) setPhase({ kind: "ready" });
    });
  }, [phase, now, publicClient]);

  const fail = (e: any, back: Phase) => {
    if (!isUserDeniedError(e)) setError(e?.shortMessage || e?.message || "Something went wrong");
    setPhase(back);
  };

  const handleCommit = async () => {
    if (!publicClient || !walletClient || !commitment) return;
    setError(null);
    setPhase({ kind: "committing", hash: null });
    try {
      const hashes = await sendCallsWithFallback(
        walletClient as WalletClient,
        publicClient,
        [buildEnsV2CommitCall(deployment, commitment)],
        chainId,
        ({ hash }) => setPhase({ kind: "committing", hash, sent: true }),
      );
      setCommitFeeHashes(hashes);
      if (storageKey) saveCommitment(storageKey, { secret, durationSeconds });
      onStart?.(name);
      const readyAt = await getEnsV2CommitmentReadyAt(publicClient, deployment, commitment);
      if (!readyAt) throw new Error("The commitment isn't on chain yet.");
      setNow(Math.floor(Date.now() / 1000));
      setPhase({ kind: "waiting", readyAt });
    } catch (e) {
      fail(e, { kind: "idle" });
    }
  };

  const handleRegister = async () => {
    if (!publicClient || !walletClient || !address || !resolver) return;
    setError(null);
    setPhase({ kind: "registering", hash: null });
    try {
      const price = await getEnsV2RegistrationPrice(publicClient, deployment, label, duration, token);
      const calls = await buildEnsV2RegisterCalls(publicClient, deployment, {
        label,
        owner: address,
        secret,
        resolver: resolver.address,
        duration,
        token,
        price,
        resolverDeployed: resolver.deployed,
        resolverSalt: resolver.salt,
        records,
      });
      const hashes = await sendCallsWithFallback(
        walletClient as WalletClient,
        publicClient,
        calls,
        chainId,
        ({ hash, call }) =>
          setPhase({ kind: "registering", hash, sent: true, title: call?.title }),
      );
      if (storageKey) saveCommitment(storageKey, null);
      onSuccess({
        price,
        transactionFees: await paidFees(publicClient, [...commitFeeHashes, ...hashes]),
        txHash: hashes[hashes.length - 1],
      });
    } catch (e) {
      fail(e, { kind: "ready" });
    }
  };

  if ((phase.kind === "committing" || phase.kind === "registering") && phase.sent) {
    const title =
      phase.kind === "committing"
        ? `Committing ${name}`
        : (phase.title ?? `Registering ${name}`);
    return (
      <div style={{ padding: 15 }}>
        <Text className="ns-text-center mb-3" weight="bold">
          {title}
        </Text>
        <TransactionPendingScreen
          hash={phase.hash ?? undefined}
          isCompleted={false}
          chainId={chainId}
        />
      </div>
    );
  }

  const needsSwitch = chain?.id !== chainId;
  const waitTotal = 60;
  const secondsLeft = phase.kind === "waiting" ? Math.max(0, phase.readyAt - now) : 0;
  const busy = phase.kind === "committing" || phase.kind === "registering";

  return (
    <div style={{ padding: 15 }}>
      <div className="ns-text-center mb-3">
        <Text weight="bold" size="lg">
          {name}
        </Text>
      </div>

      {phase.kind === "waiting" && (
        <div className="d-flex justify-content-center mb-3">
          <Timer
            seconds={secondsLeft}
            progress={Math.min(100, ((waitTotal - secondsLeft) / waitTotal) * 100)}
          />
        </div>
      )}

      {error && (
        <div className="mt-2">
          <Alert variant="error" position="vertical">
            <Text size="sm">{error}</Text>
          </Alert>
        </div>
      )}

      <div className="d-flex mt-3" style={{ gap: 8 }}>
        <Button variant="outline" size="lg" style={{ flex: 1 }} disabled={busy} onClick={onBack}>
          Back
        </Button>
        {needsSwitch ? (
          <Button
            size="lg"
            style={{ flex: 2 }}
            loading={isSwitching}
            onClick={() => switchChain?.({ chainId })}
          >
            Switch network
          </Button>
        ) : phase.kind === "idle" || phase.kind === "committing" ? (
          <Button
            size="lg"
            style={{ flex: 2 }}
            loading={phase.kind === "committing"}
            disabled={!commitment || busy}
            onClick={handleCommit}
          >
            Start registration
          </Button>
        ) : (
          <Button
            size="lg"
            style={{ flex: 2 }}
            loading={phase.kind === "registering"}
            disabled={phase.kind !== "ready"}
            onClick={handleRegister}
          >
            Register
          </Button>
        )}
      </div>
    </div>
  );
};
