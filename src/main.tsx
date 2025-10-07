import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { EnsAddressRecord, EnsRecords, EnsTextRecord } from "@/types";
import { zeroAddress } from "viem";
import { WalletConnect } from "./wallet-connect";

import { mainnet } from "viem/chains";

import { ENSNameCard, EnsOnchainRegisterModal, EnsOffChainRegisterModal, Icon, Input, Text } from "./components";
import { ProfileCard } from "./components";
import { NavbarProfileCard } from "./components";


export const dummyENSNames = [
  {
    name: "neeraj.eth",
    imageUrl:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
    expires: "2025-12-31",
    chain: "eth",
    isSubname: false,
  },
  {
    name: "nikku.eth",
    imageUrl:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
    expires: "2026-03-15",
    chain: "arb",
    isSubname: false,
  },
  {
    name: "buzzify.eth",
    imageUrl:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
    expires: "2025-11-10",
    chain: "base",
    isSubname: false,
  },
  {
    name: "cryptoqueen.eth",
    imageUrl:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
    expires: "2026-01-20",
    chain: "eth",
    isSubname: false,
  },
  {
    name: "web3dev.eth",
    imageUrl:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
    expires: "2025-10-05",
    chain: "eth",
    isSubname: false,
  },
  {
    name: "zkbuilder.eth",
    imageUrl: "https://picsum.photos/200?random=1",
    expires: "2026-02-12",
    chain: "eth",
    isSubname: false,
  },
  {
    name: "ethchamp.eth",
    imageUrl: "https://picsum.photos/200?random=2",
    expires: "2027-07-18",
    chain: "base",
    isSubname: false,
  },
  {
    name: "defiking.eth",
    imageUrl: "https://picsum.photos/200?random=3",
    expires: "2026-06-22",
    chain: "base",
    isSubname: false,
  },
  {
    name: "solmax.eth",
    imageUrl: "https://picsum.photos/200?random=4",
    expires: "2025-09-14",
    chain: "eth",
    isSubname: false,
  },
  {
    name: "chainmaster.eth",
    imageUrl: "https://picsum.photos/200?random=5",
    expires: "2027-01-03",
    chain: "arb",
    isSubname: false,
  },
  {
    name: "layerzero.eth",
    imageUrl: "https://picsum.photos/200?random=6",
    expires: "2026-12-09",
    chain: "arb",
    isSubname: false,
  },
  {
    name: "gasguru.eth",
    imageUrl: "https://picsum.photos/200?random=7",
    expires: "2025-05-21",
    chain: "arb",
    isSubname: false,
  },
  {
    name: "rollup.eth",
    imageUrl: "https://picsum.photos/200?random=8",
    expires: "2026-04-30",
    chain: "base",
    isSubname: false,
  },
  {
    name: "devwizard.eth",
    imageUrl: "https://picsum.photos/200?random=9",
    expires: "2027-03-12",
    chain: "base",
    isSubname: false,
  },
  {
    name: "stakingpro.eth",
    imageUrl: "https://picsum.photos/200?random=10",
    expires: "2025-08-08",
    chain: "base",
    isSubname: false,
  },
  {
    name: "rektlord.eth",
    imageUrl: "https://picsum.photos/200?random=11",
    expires: "2026-09-01",
    chain: "base",
    isSubname: false,
  },
  {
    name: "airdrophunter.eth",
    imageUrl: "https://picsum.photos/200?random=12",
    expires: "2027-10-17",
    chain: "base",
    isSubname: false,
  },
  {
    name: "wagmi.eth",
    imageUrl: "https://picsum.photos/200?random=13",
    expires: "2026-07-28",
    chain: "base",
    isSubname: false,
  },
  {
    name: "gmgn.eth",
    imageUrl: "https://picsum.photos/200?random=14",
    expires: "2025-11-02",
    chain: "base",
    isSubname: false,
  },
  {
    name: "daoqueen.eth",
    imageUrl: "https://picsum.photos/200?random=15",
    expires: "2027-05-25",
    chain: "base",
    isSubname: true,
  },
];

const _texts: EnsTextRecord[] = [
  {
    key: "name",
    value: "test",
  },
  {
    key: "description",
    value: "hello",
  },
];

const _addrs: EnsAddressRecord[] = [
  {
    coinType: 60,
    value: zeroAddress,
  },
];

const SEPOLIA_PUB_RES = "0x0dcD506D1Be162E50A2b434028A9a148F2686444";
const ENS_NAME = "artii.eth";
const NAME_CHAIN_ID = mainnet.id;

function TestApp() {
  const [records, setRecords] = useState<EnsRecords>({
    texts: [..._texts],
    addresses: [..._addrs],
  });

  const handleRecordsUpdated = (newRecords: EnsRecords) => {
    setRecords(newRecords);
  };

  function filterENSNames(list, showSubnames) {
    return list.filter((item) => (showSubnames ? item.isSubname : !item.isSubname));
  }

  function MainContent() {
    const [showSubnames, setShowSubnames] = useState(false);
    const filteredENSNames = filterENSNames(dummyENSNames, showSubnames);
    return (
      <main className="ns-main">
        <div className="ns-page">
          <aside className="ns-left">
            <ProfileCard
              bannerUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s"
              avatarUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s"
              name="thecap.eth"
              username="thecap"
              bio="Builder, thinker, investor, optimist"
              address="0x035eB...24117D3"
              followers={1200}
              following={340}
              ownedBy="thecap.eth"
              expires="26/07/28"
              records={["0,0,0,0"]}
              website="https://thecap.eth.limo"
              subnames={3}
              profit={6}
              volume={0}
            // onFollowClick={() => console.log("Follow clicked")}
            />
          </aside>

          <section className="ns-right">
            <div className="ns-header">
              <div className="ns-tabs">
                <span className={!showSubnames ? "active" : ""} onClick={() => setShowSubnames(false)}>
                  <Text>ENS Names</Text>{" "}
                  <Text weight="bold" color="primary">
                    {dummyENSNames.filter((item) => !item.isSubname).length}
                  </Text>
                </span>
                <span className={showSubnames ? "active" : ""} onClick={() => setShowSubnames(true)}>
                  <Text>Subnames</Text>{" "}
                  <Text weight="bold" color="primary">
                    {dummyENSNames.filter((item) => item.isSubname).length}
                  </Text>
                </span>
                <span>
                  <Text>Wizard</Text>
                </span>
              </div>
              <div className="ns-search">
                <Input size="lg" placeholder="Search ENS, addresses, txns..." />
              </div>
            </div>

            <div className="ns-ens-grid">
              {filteredENSNames.map((ens, idx) => (
                <ENSNameCard
                  key={ens.name}
                  name={ens.name}
                  imageUrl={ens.imageUrl}
                  expires={ens.expires}
                  chain={ens.chain}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }
  function Navbar() {
    return (
      <nav className="ns-navbar">
        <div className="ns-navbar-left">
          <Input size="lg" placeholder="Search ENS, addresses, txns..." />
        </div>
        <div className="ns-navbar-right">
          <NavbarProfileCard
            imageUrl="https://avatars.githubusercontent.com/u/123456?v=4"
            name="thecap.eth"
            address="0x035eB...24117D3"
            onLogout={() => console.log("Logout clicked")}
          />
        </div>
      </nav>
    );
  }

  function Sidebar() {
    return (
      <aside className="ns-sidebar">
        <div className="ns-menu">
          <span>
            <div className="ns-logo">NS</div>
          </span>

          <span>
            <Icon name="person" />
          </span>

          <span>
            <Icon name="search" />
          </span>

          <span>
            <Icon name="globe" />
          </span>

          <span>
            <Icon name="globe" />
          </span>
        </div>
      </aside>
    );
  }

  // State for EnsOnchainRegisterModal and EnsOffChainRegisterModal
  const [onchainStep, setOnchainStep] = useState(0);
  const [offchainStep, setOffchainStep] = useState(0);
  const [offchainName, setOffchainName] = useState("");
  const [onchainName, setOnchainName] = useState("");
  const [offchainProfileComplete, setOffchainProfileComplete] = useState(false);
  const [onchainProfileComplete, setOnchainProfileComplete] = useState(false);
  return (
    <div>
      <WalletConnect>
        <div className="ns-layout">
          <div className="ns-body">
            <aside className="ns-sidebar">
              <Sidebar />
            </aside>
            <div className="ns-right-column">
              <Navbar />
              {/* <div className="ns-actions-buttons">
                <Button variant="outline" size="md">Account Page</Button>
                <Button variant="outline" size="md">ENS Name Page</Button>
              </div>
              <MainContent /> */}
   
                <EnsOnchainRegisterModal
                step={onchainStep}
                name={onchainName}
                profileComplete={onchainProfileComplete}
                onStepChange={setOnchainStep}
                onNameChange={setOnchainName}
                onProfileCompleteChange={setOnchainProfileComplete}
                onRegister={() => console.log("Register clicked")}
                onCancel={() => console.log("Cancel clicked")}
                />
       
              <EnsOffChainRegisterModal
                step={offchainStep}
                name={offchainName}
                profileComplete={offchainProfileComplete}
                onStepChange={setOffchainStep}
                onNameChange={setOffchainName}
                onProfileCompleteChange={setOffchainProfileComplete}
                onRegister={() => console.log("Offchain Register clicked")}
                onCancel={() => console.log("Offchain Cancel clicked")}
              />
            </div>
          </div>
        </div>
      </WalletConnect>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
}

