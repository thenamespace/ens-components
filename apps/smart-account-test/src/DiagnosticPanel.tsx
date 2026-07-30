import {
  ALLOWED_FORMATS,
  AvatarSDKError,
  createAvatarClient,
  validateFile,
} from "@thenamespace/avatar";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { isAddressEqual, isErc6492Signature } from "viem";
import type { Address, Hex } from "viem";
import { mainnet } from "viem/chains";
import { parseSiweMessage, validateSiweMessage } from "viem/siwe";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { labConfig } from "./config";
import {
  classifyAccount,
  DiagnosticSummary,
  formatExpiry,
  hasDeployedCode,
  LabError,
  MediaType,
  SignedPayload,
  toLabError,
} from "./lab";

interface DiagnosticPanelProps {
  ensName: string;
  onEnsNameChange: (name: string) => void;
  connectionSlot?: ReactNode;
  eyebrow?: string;
  heading?: string;
  headingId?: string;
  signerOverride?: {
    address?: Address;
    chainId: number;
    isConnected: boolean;
    signMessage: (message: string) => Promise<Hex>;
  };
  tag?: string;
}

type LabPhase = "idle" | "signing" | "verified" | "uploading" | "uploaded";

const readSignatureBytes = (signature: Hex) =>
  Math.max(0, (signature.length - 2) / 2);

const isPayloadCurrent = (
  payload: SignedPayload,
  {
    address,
    ensName,
    file,
    mediaType,
  }: {
    address?: Address;
    ensName: string;
    file: File | null;
    mediaType: MediaType;
  }
) =>
  Boolean(
    address &&
    file &&
    payload.address === address &&
    payload.file === file &&
    payload.mediaType === mediaType &&
    payload.subname === ensName.trim()
  );

export const DiagnosticPanel = ({
  ensName,
  onEnsNameChange,
  connectionSlot,
  eyebrow = "01 // diagnostic path",
  heading = "Sign. Inspect. Verify.",
  headingId = "diagnostic-heading",
  signerOverride,
  tag = "No write on step one",
}: DiagnosticPanelProps) => {
  const wagmiAccount = useAccount();
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const { data: walletClient } = useWalletClient({ chainId: mainnet.id });
  const usingSignerOverride = signerOverride !== undefined;
  const address = usingSignerOverride
    ? signerOverride.address
    : wagmiAccount.address;
  const chainId = usingSignerOverride
    ? signerOverride.chainId
    : wagmiAccount.chainId;
  const isConnected = usingSignerOverride
    ? signerOverride.isConnected
    : wagmiAccount.isConnected;
  const signMessage = usingSignerOverride
    ? signerOverride.signMessage
    : walletClient && address
      ? (message: string) =>
          walletClient.signMessage({
            account: address,
            message,
          })
      : undefined;

  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<LabError | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("avatar");
  const [phase, setPhase] = useState<LabPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<DiagnosticSummary | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const signedPayloadRef = useRef<SignedPayload | null>(null);

  const avatarClient = useMemo(
    () =>
      createAvatarClient({
        apiUrl: labConfig.metadataApiUrl,
        domain: labConfig.domain,
        network: "mainnet",
      }),
    []
  );

  const resetSignedState = () => {
    signedPayloadRef.current = null;
    setAcknowledged(false);
    setError(null);
    setPhase("idle");
    setProgress(0);
    setSummary(null);
    setUploadUrl(null);
  };

  useEffect(() => {
    resetSignedState();
  }, [address, chainId, ensName, file, mediaType]);

  const canSign =
    isConnected &&
    chainId === mainnet.id &&
    Boolean(address && signMessage && publicClient) &&
    Boolean(ensName.trim() && file) &&
    labConfig.mainnetRpcConfigured;

  const payloadIsCurrent =
    signedPayloadRef.current &&
    isPayloadCurrent(signedPayloadRef.current, {
      address,
      ensName,
      file,
      mediaType,
    });

  const canUpload =
    phase === "verified" &&
    acknowledged &&
    Boolean(summary?.verified && payloadIsCurrent);

  const handleSignAndVerify = async () => {
    if (!address || !file || !publicClient || !signMessage) return;

    setError(null);
    setPhase("signing");
    setProgress(0);
    setSummary(null);
    setUploadUrl(null);
    signedPayloadRef.current = null;

    try {
      validateFile(file, mediaType);

      const siwe =
        mediaType === "avatar"
          ? await avatarClient.getSIWEMessageForAvatar({
              address,
              chainId: mainnet.id,
            })
          : await avatarClient.getSIWEMessageForHeader({
              address,
              chainId: mainnet.id,
            });

      const parsed = parseSiweMessage(siwe.message);
      const expectedUri = `https://${labConfig.domain}`;
      const structureValid =
        validateSiweMessage({
          address,
          domain: labConfig.domain,
          message: parsed,
          nonce: siwe.nonce,
        }) &&
        parsed.address !== undefined &&
        isAddressEqual(parsed.address, address) &&
        parsed.chainId === mainnet.id &&
        parsed.statement === "Authorize a metadata update" &&
        parsed.uri === expectedUri &&
        parsed.version === "1" &&
        Date.now() < siwe.expiresAt;

      if (!structureValid) {
        throw new Error(
          "The SIWE message did not match the connected account, mainnet, domain, URI, nonce, or validity window."
        );
      }

      const codeBefore = await publicClient.getCode({ address });
      const signature = await signMessage(siwe.message);
      const wrapped = isErc6492Signature(signature);
      const cryptographicallyVerified = await publicClient.verifyMessage({
        address,
        message: siwe.message,
        signature,
      });
      const codeAfter = await publicClient.getCode({ address });
      const deploymentUnchanged = codeBefore === codeAfter;
      const verified =
        structureValid && cryptographicallyVerified && deploymentUnchanged;

      const nextSummary: DiagnosticSummary = {
        accountType: classifyAccount({
          code: codeBefore,
          isErc6492: wrapped,
        }),
        bytecodeBefore: hasDeployedCode(codeBefore)
          ? "deployed"
          : "not deployed",
        bytecodeAfter: hasDeployedCode(codeAfter) ? "deployed" : "not deployed",
        deploymentUnchanged,
        expiresAt: siwe.expiresAt,
        isErc6492: wrapped,
        signatureBytes: readSignatureBytes(signature),
        structureValid,
        verified,
      };

      setSummary(nextSummary);
      if (!verified) {
        setPhase("idle");
        throw new Error(
          deploymentUnchanged
            ? "The connected account did not validate this SIWE signature."
            : "Signature verification unexpectedly changed the account deployment state."
        );
      }

      signedPayloadRef.current = {
        address,
        expiresAt: siwe.expiresAt,
        file,
        mediaType,
        message: siwe.message,
        signature,
        subname: ensName.trim(),
      };
      setPhase("verified");
    } catch (caught) {
      setError(toLabError(caught));
      setPhase("idle");
    }
  };

  const handleUpload = async () => {
    const payload = signedPayloadRef.current;
    if (!payload || !summary?.verified || !canUpload) return;

    setError(null);
    setPhase("uploading");
    setProgress(0);

    try {
      if (Date.now() >= payload.expiresAt) {
        throw new AvatarSDKError(
          "The signed nonce has expired. Sign a fresh message before uploading.",
          "EXPIRED_NONCE"
        );
      }

      const options = {
        address: payload.address,
        file: payload.file,
        message: payload.message,
        onProgress: (nextProgress: number) =>
          setProgress(Math.max(0, Math.min(100, Math.round(nextProgress)))),
        signature: payload.signature,
        subname: payload.subname,
      };
      const result =
        payload.mediaType === "avatar"
          ? await avatarClient.uploadAvatarWithSignature(options)
          : await avatarClient.uploadHeaderWithSignature(options);

      setProgress(100);
      setUploadUrl(result.url);
      setPhase("uploaded");
      signedPayloadRef.current = null;
      setAcknowledged(false);
    } catch (caught) {
      setError(toLabError(caught));
      setPhase("verified");
    }
  };

  return (
    <section className="lab-panel" aria-labelledby={headingId}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={headingId}>{heading}</h2>
        </div>
        <span className="panel-tag">{tag}</span>
      </div>

      {connectionSlot}

      <div className="lab-grid">
        <div className="control-stack">
          <label className="field">
            <span>ENS name or subname</span>
            <input
              autoComplete="off"
              onChange={event => onEnsNameChange(event.target.value)}
              placeholder="smart-account-test.yourname.eth"
              spellCheck={false}
              type="text"
              value={ensName}
            />
            <small>The connected account must own this name.</small>
          </label>

          <fieldset className="segmented-field">
            <legend>Media operation</legend>
            <div>
              {(["avatar", "header"] as const).map(option => (
                <label key={option}>
                  <input
                    checked={mediaType === option}
                    name="media-type"
                    onChange={() => setMediaType(option)}
                    type="radio"
                    value={option}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="file-drop">
            <input
              accept={ALLOWED_FORMATS.join(",")}
              onChange={event => setFile(event.target.files?.[0] ?? null)}
              type="file"
            />
            <span className="file-drop-mark">＋</span>
            <span>
              <strong>{file?.name ?? "Select test media"}</strong>
              <small>
                {file
                  ? `${file.type || "unknown type"} · ${Math.ceil(file.size / 1024)} KB`
                  : "JPEG, PNG, GIF, WebP, or SVG"}
              </small>
            </span>
          </label>

          <button
            className="button button-primary"
            disabled={!canSign || phase === "signing" || phase === "uploading"}
            onClick={handleSignAndVerify}
            type="button"
          >
            {phase === "signing" ? "Check wallet…" : "Sign & verify locally"}
          </button>

          {!labConfig.mainnetRpcConfigured && (
            <p className="inline-error">
              Add VITE_MAINNET_RPC_URL before running signature verification.
            </p>
          )}
        </div>

        <div className="readout" aria-live="polite">
          <div className="readout-header">
            <span>Verification readout</span>
            <span
              className={`readout-state ${
                summary?.verified ? "is-success" : ""
              }`}
            >
              {summary?.verified ? "PASS" : "WAITING"}
            </span>
          </div>

          {summary ? (
            <dl className="readout-list">
              <div className="readout-wide">
                <dt>Classification</dt>
                <dd>{summary.accountType}</dd>
              </div>
              <div>
                <dt>SIWE structure</dt>
                <dd>{summary.structureValid ? "valid" : "invalid"}</dd>
              </div>
              <div>
                <dt>Signature bytes</dt>
                <dd>{summary.signatureBytes}</dd>
              </div>
              <div>
                <dt>6492 wrapper</dt>
                <dd>{summary.isErc6492 ? "detected" : "not detected"}</dd>
              </div>
              <div>
                <dt>Crypto verify</dt>
                <dd>{summary.verified ? "valid" : "invalid"}</dd>
              </div>
              <div>
                <dt>Code before</dt>
                <dd>{summary.bytecodeBefore}</dd>
              </div>
              <div>
                <dt>Code after</dt>
                <dd>{summary.bytecodeAfter}</dd>
              </div>
              <div>
                <dt>State unchanged</dt>
                <dd>{summary.deploymentUnchanged ? "yes" : "no"}</dd>
              </div>
              <div>
                <dt>Nonce expires</dt>
                <dd>{formatExpiry(summary.expiresAt)}</dd>
              </div>
            </dl>
          ) : (
            <div className="empty-readout">
              <span>1271</span>
              <span>6492</span>
              <p>
                Connect a wallet, choose owned ENS media, then request one
                domain-bound SIWE signature.
              </p>
            </div>
          )}
        </div>
      </div>

      {summary?.verified && phase !== "uploaded" && (
        <div className="upload-gate">
          <div>
            <p className="eyebrow danger-eyebrow">02 // mainnet write</p>
            <h3>Verification passed. Upload is still locked.</h3>
            <p>
              This writes to the production Metadata Service and may replace
              hosted {mediaType} media for <strong>{ensName.trim()}</strong>. It
              does not send an ENS resolver transaction.
            </p>
          </div>
          <label className="acknowledgement">
            <input
              checked={acknowledged}
              onChange={event => setAcknowledged(event.target.checked)}
              type="checkbox"
            />
            <span>
              I own this disposable mainnet name and understand this media
              write.
            </span>
          </label>
          <button
            className="button button-danger"
            disabled={!canUpload}
            onClick={handleUpload}
            type="button"
          >
            {phase === "uploading"
              ? `Uploading ${progress}%`
              : `Upload ${mediaType} to mainnet`}
          </button>
          {phase === "uploading" && (
            <div
              aria-label={`Upload progress ${progress}%`}
              className="progress-track"
              role="progressbar"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progress}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}

      {uploadUrl && (
        <div className="success-banner" role="status">
          <span>UPLOAD ACCEPTED</span>
          <a href={uploadUrl} rel="noreferrer" target="_blank">
            Open stable media URL ↗
          </a>
        </div>
      )}

      {error && (
        <div className="error-console" role="alert">
          <div>
            <span>ERROR</span>
            {error.status && <span>HTTP {error.status}</span>}
            {error.code && <span>{error.code}</span>}
            {error.serviceCode && <span>{error.serviceCode}</span>}
          </div>
          <p>{error.message}</p>
          {error.details !== undefined && (
            <pre>{JSON.stringify(error.details, null, 2)}</pre>
          )}
        </div>
      )}
    </section>
  );
};
