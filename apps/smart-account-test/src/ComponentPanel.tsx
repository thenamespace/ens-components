import {
  SelectRecordsForm,
  type EnsRecords,
} from "@thenamespace/ens-components";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { mainnet } from "wagmi/chains";
import { labConfig } from "./config";

interface ComponentPanelProps {
  ensName: string;
  onEnsNameChange: (name: string) => void;
}

const emptyRecords = (): EnsRecords => ({
  addresses: [],
  texts: [],
});

export const ComponentPanel = ({
  ensName,
  onEnsNameChange,
}: ComponentPanelProps) => {
  const { address, chainId, isConnected } = useAccount();
  const [acknowledged, setAcknowledged] = useState(false);
  const [records, setRecords] = useState<EnsRecords>(emptyRecords);

  useEffect(() => {
    setAcknowledged(false);
    setRecords(emptyRecords());
  }, [address, chainId, ensName]);

  const ready =
    acknowledged &&
    isConnected &&
    chainId === mainnet.id &&
    Boolean(address && ensName.trim());

  const mediaRecords = records.texts.filter(
    record => record.key === "avatar" || record.key === "header"
  );

  return (
    <section className="lab-panel" aria-labelledby="component-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">02 // production component path</p>
          <h2 id="component-heading">Prove the shipped UI.</h2>
        </div>
        <span className="panel-tag">SelectRecordsForm</span>
      </div>

      <div className="component-intro">
        <div>
          <h3>Same wallet. Same SDK. Production interaction.</h3>
          <p>
            This mounts the workspace package directly. Image upload writes to
            the production Metadata Service and places its returned URL into
            controlled local record state. There is no resolver save button and
            no onchain record transaction.
          </p>
        </div>
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
        </label>
      </div>

      <label className="acknowledgement component-acknowledgement">
        <input
          checked={acknowledged}
          disabled={!isConnected || chainId !== mainnet.id || !ensName.trim()}
          onChange={event => setAcknowledged(event.target.checked)}
          type="checkbox"
        />
        <span>
          Unlock the production component for this owned, disposable mainnet
          name.
        </span>
      </label>

      {!ready ? (
        <div className="component-lock">
          <span aria-hidden="true">LOCKED / MAINNET</span>
          <p>
            Connect a mainnet wallet, enter its owned ENS name, and acknowledge
            the media write to mount the component.
          </p>
        </div>
      ) : (
        <div className="component-workbench">
          <div className="component-shell">
            <SelectRecordsForm
              actionButtons={
                <div className="component-no-save">
                  Resolver save intentionally disabled in this lab.
                </div>
              }
              avatarUpload={{
                ensName: ensName.trim(),
                isTestnet: false,
                siweDomain: labConfig.domain,
              }}
              key={`${address}:${ensName.trim()}`}
              onRecordsUpdated={setRecords}
              records={records}
            />
          </div>

          <aside className="record-monitor">
            <div>
              <span>LOCAL RECORD MONITOR</span>
              <span>{mediaRecords.length} media record(s)</span>
            </div>
            <pre>
              {JSON.stringify(
                mediaRecords.length ? mediaRecords : { status: "waiting" },
                null,
                2
              )}
            </pre>
          </aside>
        </div>
      )}
    </section>
  );
};
