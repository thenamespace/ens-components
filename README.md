# @thenamespace/ens-components

React components for ENS (Ethereum Name Service) name registration and subname minting.

## Installation

```bash
npm install @thenamespace/ens-components
```

## Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install wagmi @rainbow-me/rainbowkit @tanstack/react-query viem react react-dom
```

## Quick Start

### 1. Setup Required Providers

Wrap your application with the required providers:

```tsx
import React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";
import { http } from "wagmi";

// Import styles
import "@thenamespace/ens-components/index.css";
import "@rainbow-me/rainbowkit/styles.css";

const wagmiConfig = getDefaultConfig({
  appName: "My ENS App",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // Get from https://cloud.walletconnect.com
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 2. Use the Components

```tsx
import { ENSNamesRegistrarComponent, SubnameOnChainRegistrarModal, EnsRecordsForm } from "@thenamespace/ens-components";

function MyApp() {
  return (
    <AppProviders>
      {/* Your components here */}
    </AppProviders>
  );
}
```

## Components

### ENSNamesRegistrarComponent

Component for registering top-level ENS names (e.g., `myname.eth`).

#### Basic Usage

```tsx
import { useState } from "react";
import { ENSNamesRegistrarComponent } from "@thenamespace/ens-components";

function RegisterENSName() {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(1);

  return (
    <ENSNamesRegistrarComponent
      name={name}
      duration={duration}
      onNameChange={setName}
      onDurationChange={setDuration}
      onCompleteRegistration={() => {
        console.log("Registration complete!");
      }}
    />
  );
}
```

#### Component Flow

The component has 4 main steps:

1. **NameSearch** - User searches for an available ENS name
2. **RegistrationForm** - User reviews details and sets registration duration
3. **RegistrationProcess** - Transaction processing with multiple steps
4. **SuccessScreen** - Registration completion confirmation

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `name` | `string` | No | `"brightwave"` | Initial ENS name (without .eth suffix) |
| `duration` | `number` | No | `1` | Registration duration in years |
| `onNameChange` | `(name: string) => void` | No | - | Callback when name changes |
| `onDurationChange` | `(duration: number) => void` | No | - | Callback when duration changes |
| `onBack` | `() => void` | No | - | Callback when back button is clicked |
| `onClose` | `() => void` | No | - | Callback when close button is clicked |
| `onNext` | `() => void` | No | - | Callback when next button is clicked |
| `onCompleteProfile` | `() => void` | No | - | Callback when "Complete Profile" is clicked |
| `onOpenWallet` | `() => void` | No | - | Callback when wallet needs to be opened |
| `onCompleteRegistration` | `() => void` | No | - | Callback when registration completes |
| `onRegisterAnother` | `() => void` | No | - | Callback when "Register Another" is clicked |
| `onViewName` | `() => void` | No | - | Callback when "View Name" is clicked |

#### Complete Example

```tsx
import { useState } from "react";
import { ENSNamesRegistrarComponent } from "@thenamespace/ens-components";

function ENSRegistrationExample() {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(1);
  const [registeredNames, setRegisteredNames] = useState<string[]>([]);

  const handleCompleteRegistration = () => {
    if (name) {
      setRegisteredNames([...registeredNames, name]);
      alert(`Successfully registered ${name}.eth!`);
    }
  };

  return (
    <div>
      <ENSNamesRegistrarComponent
        name={name}
        duration={duration}
        onNameChange={setName}
        onDurationChange={setDuration}
        onBack={() => console.log("Back clicked")}
        onClose={() => console.log("Close clicked")}
        onNext={() => console.log("Next clicked")}
        onCompleteProfile={() => {
          console.log("Complete profile clicked");
          // Navigate to profile completion page
        }}
        onOpenWallet={() => console.log("Open wallet clicked")}
        onCompleteRegistration={handleCompleteRegistration}
        onRegisterAnother={() => {
          setName("");
          setDuration(1);
        }}
        onViewName={() => {
          if (name) {
            window.open(`https://app.ens.domains/${name}`, "_blank");
          }
        }}
      />
      
      {registeredNames.length > 0 && (
        <div>
          <h3>Registered Names:</h3>
          <ul>
            {registeredNames.map((n) => (
              <li key={n}>{n}.eth</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

### EnsRecordsForm

Component for editing ENS (Ethereum Name Service) records associated with a domain name. This component allows users to modify text records, address records, and contenthash records.

#### Basic Usage

```tsx
import { EnsRecordsForm } from "@thenamespace/ens-components";
import { EnsRecords } from "@thenamespace/ens-components";

function EditENSRecords() {
  const initialRecords: EnsRecords = {
    texts: [
      { key: "description", value: "My ENS profile" },
      { key: "url", value: "https://example.com" },
    ],
    addresses: [
      { coinType: 60, value: "0x1234567890123456789012345678901234567890" }, // ETH
    ],
  };

  return (
    <EnsRecordsForm
      name="example.eth"
      resolverAddress="0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"
      initialRecords={initialRecords}
      onSuccess={(txHash) => {
        console.log("Records updated! Transaction:", txHash);
      }}
      onCancel={() => {
        console.log("Edit cancelled");
      }}
    />
  );
}
```

#### Features

- **Text Records**: Edit various text records like description, URL, avatar, etc.
- **Address Records**: Manage cryptocurrency addresses for different coin types (ETH, BTC, etc.)
- **Contenthash Records**: Set content hash for decentralized websites (IPFS, Arweave, etc.)
- **Real-time Validation**: Validates ENS records before submission
- **Transaction Management**: Handles blockchain transactions for record updates
- **Network Switching**: Automatically prompts to switch networks if needed
- **Wallet Connection**: Handles wallet connection state

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | The ENS name to edit records for (e.g., "example.eth") |
| `resolverAddress` | `Address` | Yes | - | The resolver contract address for the ENS name |
| `initialRecords` | `EnsRecords` | No | `{ texts: [], addresses: [] }` | Initial records to populate the form with |
| `chainId` | `number` | No | `1` (mainnet) | The blockchain chain ID |
| `onCancel` | `() => void` | No | - | Callback when cancel button is clicked |
| `onSuccess` | `(txHash: Hash) => void` | No | - | Callback when records are successfully updated with transaction hash |

#### EnsRecords Type

```tsx
interface EnsRecords {
  texts: EnsTextRecord[];
  addresses: EnsAddressRecord[];
  contenthash?: EnsContenthashRecord;
}

interface EnsTextRecord {
  key: string;    // e.g., "description", "url", "avatar", "email"
  value: string;
}

interface EnsAddressRecord {
  coinType: number;  // e.g., 60 for ETH, 0 for BTC
  value: string;     // Address string
}

interface EnsContenthashRecord {
  protocol: "ipfs" | "onion3" | "arweave" | "skynet" | "swarm";
  value: string;
}
```

#### Complete Example

```tsx
import { useState } from "react";
import { EnsRecordsForm, EnsRecords } from "@thenamespace/ens-components";
import { Address } from "viem";

function ENSRecordsEditor() {
  const [ensName, setEnsName] = useState("example.eth");
  const [resolverAddress] = useState<Address>("0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41");
  
  const initialRecords: EnsRecords = {
    texts: [
      { key: "description", value: "My awesome ENS profile" },
      { key: "url", value: "https://mywebsite.com" },
      { key: "avatar", value: "https://mywebsite.com/avatar.png" },
      { key: "email", value: "me@example.com" },
    ],
    addresses: [
      { 
        coinType: 60, // ETH
        value: "0x1234567890123456789012345678901234567890" 
      },
      { 
        coinType: 0, // BTC
        value: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" 
      },
    ],
    contenthash: {
      protocol: "ipfs",
      value: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    },
  };

  const handleSuccess = (txHash: string) => {
    console.log("Records updated successfully!");
    console.log("Transaction hash:", txHash);
    // Optionally show a success message or navigate away
    alert(`Records updated! Transaction: ${txHash}`);
  };

  const handleCancel = () => {
    console.log("Edit cancelled");
    // Optionally navigate back or close modal
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>Edit ENS Records</h2>
      <div style={{ marginBottom: "20px" }}>
        <label>
          ENS Name:
          <input
            type="text"
            value={ensName}
            onChange={(e) => setEnsName(e.target.value)}
            placeholder="example.eth"
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>
      </div>
      
      <EnsRecordsForm
        name={ensName}
        resolverAddress={resolverAddress}
        initialRecords={initialRecords}
        chainId={1} // Mainnet
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
```

#### Supported Coin Types

Common coin types supported:
- `60` - Ethereum (ETH)
- `0` - Bitcoin (BTC)
- `700` - Polygon (MATIC)
- `137` - Binance Smart Chain (BNB)
- And many more...

#### Supported Text Record Keys

Common text record keys:
- `description` - Profile description
- `url` - Website URL
- `avatar` - Avatar image URL
- `email` - Email address
- `com.github` - GitHub username
- `com.twitter` - Twitter/X username
- `com.discord` - Discord username
- And any custom key you want to use

---

### SubnameOnChainRegistrarModal

Component for registering on-chain subnames (e.g., `mysubname.mydomain.eth`).

#### Basic Usage

```tsx
import { useState } from "react";
import { SubnameOnChainRegistrarModal } from "@thenamespace/ens-components";

function RegisterSubname() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [parentName] = useState("mydomain.eth");
  const [profileComplete, setProfileComplete] = useState(false);
  const [owner, setOwner] = useState("");
  const [duration, setDuration] = useState(1);
  const [useAsPrimary, setUseAsPrimary] = useState(false);

  return (
    <SubnameOnChainRegistrarModal
      step={step}
      name={name}
      parentName={parentName}
      profileComplete={profileComplete}
      owner={owner}
      duration={duration}
      useAsPrimary={useAsPrimary}
      onStepChange={setStep}
      onNameChange={setName}
      onProfileCompleteChange={setProfileComplete}
      onOwnerChange={setOwner}
      onDurationChange={setDuration}
      onUseAsPrimaryChange={setUseAsPrimary}
      onCompleteRegistration={() => {
        setStep(2); // Move to success screen
      }}
    />
  );
}
```

#### Component Flow

The component has 3 main steps:

1. **InitialStep** (step 0) - User enters subname label
2. **RegistrationStep** (step 1) - User reviews details and registers
3. **SuccessScreen** (step 2) - Registration completion confirmation

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `step` | `number` | No | `0` | Current step (0: Initial, 1: Registration, 2: Success) |
| `name` | `string` | No | `""` | Subname label (without parent domain) |
| `parentName` | `string` | No | `"celotest.eth"` | Parent domain name |
| `profileComplete` | `boolean` | No | `false` | Whether profile is complete |
| `domainSuffix` | `string` | No | `"eth"` | Domain suffix |
| `owner` | `string` | No | `"0x035eB...24117D3"` | Owner address for the subname |
| `duration` | `number` | No | `1` | Registration duration in years |
| `registrationFee` | `string` | No | - | Registration fee (optional) |
| `networkFee` | `string` | No | - | Network fee (optional) |
| `totalCost` | `string` | No | - | Total cost (optional) |
| `useAsPrimary` | `boolean` | No | `false` | Whether to use as primary name |
| `profileImageUrl` | `string` | No | - | Profile image URL (optional) |
| `onStepChange` | `(step: number) => void` | No | - | Callback when step changes |
| `onNameChange` | `(name: string) => void` | No | - | Callback when name changes |
| `onProfileCompleteChange` | `(complete: boolean) => void` | No | - | Callback when profile complete status changes |
| `onOwnerChange` | `(owner: string) => void` | No | - | Callback when owner changes |
| `onDurationChange` | `(duration: number) => void` | No | - | Callback when duration changes |
| `onUseAsPrimaryChange` | `(useAsPrimary: boolean) => void` | No | - | Callback when useAsPrimary changes |
| `onRegister` | `() => void` | No | - | Callback when register button is clicked |
| `onCancel` | `() => void` | No | - | Callback when cancel button is clicked |
| `onClose` | `() => void` | No | - | Callback when close button is clicked |
| `onCompleteProfile` | `() => void` | No | - | Callback when "Complete Profile" is clicked |
| `onOpenWallet` | `() => void` | No | - | Callback when wallet needs to be opened |
| `onCompleteRegistration` | `() => void` | No | - | Callback when registration completes |
| `onRegisterAnother` | `() => void` | No | - | Callback when "Register Another" is clicked |
| `onViewName` | `() => void` | No | - | Callback when "View Name" is clicked |
| `onFinish` | `() => void` | No | - | Callback when finish button is clicked (success screen) |

#### Complete Example

```tsx
import { useState } from "react";
import { SubnameOnChainRegistrarModal } from "@thenamespace/ens-components";

function SubnameRegistrationExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [parentName] = useState("mydomain.eth");
  const [profileComplete, setProfileComplete] = useState(false);
  const [owner, setOwner] = useState("");
  const [duration, setDuration] = useState(1);
  const [useAsPrimary, setUseAsPrimary] = useState(false);
  const [registeredSubnames, setRegisteredSubnames] = useState<string[]>([]);

  const handleCompleteRegistration = () => {
    const fullName = name ? `${name}.${parentName}` : "";
    if (fullName) {
      setRegisteredSubnames([...registeredSubnames, fullName]);
      setStep(2); // Move to success screen
      alert(`Successfully registered ${fullName}!`);
    }
  };

  const handleFinish = () => {
    setIsOpen(false);
    setStep(0);
    setName("");
    setProfileComplete(false);
    setDuration(1);
    setUseAsPrimary(false);
  };

  if (!isOpen) {
    return (
      <div>
        <button onClick={() => setIsOpen(true)}>
          Register Subname
        </button>
        {registeredSubnames.length > 0 && (
          <div>
            <h3>Registered Subnames:</h3>
            <ul>
              {registeredSubnames.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", maxWidth: "600px", width: "90%", maxHeight: "90vh", overflow: "auto" }}>
        <SubnameOnChainRegistrarModal
          step={step}
          name={name}
          parentName={parentName}
          profileComplete={profileComplete}
          owner={owner}
          duration={duration}
          useAsPrimary={useAsPrimary}
          onStepChange={setStep}
          onNameChange={setName}
          onProfileCompleteChange={setProfileComplete}
          onOwnerChange={setOwner}
          onDurationChange={setDuration}
          onUseAsPrimaryChange={setUseAsPrimary}
          onRegister={() => console.log("Register clicked")}
          onCancel={() => {
            console.log("Cancel clicked");
            setStep(0);
          }}
          onClose={handleFinish}
          onCompleteProfile={() => {
            console.log("Complete profile clicked");
            setProfileComplete(true);
          }}
          onCompleteRegistration={handleCompleteRegistration}
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
}
```

## Full Example with All Components

```tsx
import React, { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";
import { http } from "wagmi";
import { ENSNamesRegistrarComponent, SubnameOnChainRegistrarModal, EnsRecordsForm, EnsRecords } from "@thenamespace/ens-components";
import { Address } from "viem";
import "@thenamespace/ens-components/index.css";
import "@rainbow-me/rainbowkit/styles.css";

const wagmiConfig = getDefaultConfig({
  appName: "My ENS App",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<"ens" | "subname" | "records">("ens");
  
  // ENS Name Registration State
  const [ensName, setEnsName] = useState("");
  const [ensDuration, setEnsDuration] = useState(1);
  
  // Subname Registration State
  const [subnameStep, setSubnameStep] = useState(0);
  const [subname, setSubname] = useState("");
  const [parentName] = useState("mydomain.eth");
  const [profileComplete, setProfileComplete] = useState(false);
  const [owner, setOwner] = useState("");
  const [duration, setDuration] = useState(1);
  const [useAsPrimary, setUseAsPrimary] = useState(false);

  // ENS Records Form State
  const [recordsName, setRecordsName] = useState("example.eth");
  const [resolverAddress] = useState<Address>("0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41");
  const [initialRecords] = useState<EnsRecords>({
    texts: [
      { key: "description", value: "My ENS profile" },
      { key: "url", value: "https://example.com" },
    ],
    addresses: [
      { coinType: 60, value: "0x1234567890123456789012345678901234567890" },
    ],
  });

  return (
    <AppProviders>
      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <button 
            onClick={() => setActiveTab("ens")}
            style={{ marginRight: "10px", padding: "10px", backgroundColor: activeTab === "ens" ? "#007bff" : "#ccc", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Register ENS Name
          </button>
          <button 
            onClick={() => setActiveTab("subname")}
            style={{ marginRight: "10px", padding: "10px", backgroundColor: activeTab === "subname" ? "#007bff" : "#ccc", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Register Subname
          </button>
          <button 
            onClick={() => setActiveTab("records")}
            style={{ padding: "10px", backgroundColor: activeTab === "records" ? "#007bff" : "#ccc", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Edit Records
          </button>
        </div>

        {activeTab === "ens" && (
          <div>
            <h2>Register ENS Name</h2>
            <ENSNamesRegistrarComponent
              name={ensName}
              duration={ensDuration}
              onNameChange={setEnsName}
              onDurationChange={setEnsDuration}
              onCompleteRegistration={() => {
                alert(`Successfully registered ${ensName}.eth!`);
              }}
            />
          </div>
        )}

        {activeTab === "subname" && (
          <div>
            <h2>Register On-Chain Subname</h2>
            <SubnameOnChainRegistrarModal
              step={subnameStep}
              name={subname}
              parentName={parentName}
              profileComplete={profileComplete}
              owner={owner}
              duration={duration}
              useAsPrimary={useAsPrimary}
              onStepChange={setSubnameStep}
              onNameChange={setSubname}
              onProfileCompleteChange={setProfileComplete}
              onOwnerChange={setOwner}
              onDurationChange={setDuration}
              onUseAsPrimaryChange={setUseAsPrimary}
              onCompleteRegistration={() => {
                setSubnameStep(2);
                alert(`Successfully registered ${subname}.${parentName}!`);
              }}
              onFinish={() => {
                setSubnameStep(0);
                setSubname("");
              }}
            />
          </div>
        )}

        {activeTab === "records" && (
          <div>
            <h2>Edit ENS Records</h2>
            <div style={{ marginBottom: "20px" }}>
              <label>
                ENS Name:
                <input
                  type="text"
                  value={recordsName}
                  onChange={(e) => setRecordsName(e.target.value)}
                  placeholder="example.eth"
                  style={{ marginLeft: "10px", padding: "5px" }}
                />
              </label>
            </div>
            <EnsRecordsForm
              name={recordsName}
              resolverAddress={resolverAddress}
              initialRecords={initialRecords}
              onSuccess={(txHash) => {
                alert(`Records updated! Transaction: ${txHash}`);
              }}
              onCancel={() => {
                console.log("Edit cancelled");
              }}
            />
          </div>
        )}
      </div>
    </AppProviders>
  );
}

export default App;
```

## Styling

The components come with their own CSS. Make sure to import the styles:

```tsx
import "@thenamespace/ens-components/index.css";
import "@rainbow-me/rainbowkit/styles.css";
```

## Requirements

- React 18+
- Node.js 16+
- A WalletConnect Project ID (get one at https://cloud.walletconnect.com)

## License

ISC

## Support

For issues and questions, please visit the package repository.
