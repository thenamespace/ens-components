import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { EnsAddressRecord, EnsRecords, EnsTextRecord } from "@/types";
import { zeroAddress } from "viem";
import { WalletConnect } from "./providers/wallet-connect";

import { Sidebar } from "./components/sidebar";

import { mainnet } from "viem/chains";

import {
	Button,
	ENSNameCard,
	Icon,
	Input,
	SubnameBannerMint,
	SubnameProfileCard,
	Text,
} from "./components";
import { ProfileCard } from "./components";
import { NavbarProfileCard } from "./components";

export const dummyENSNames = [
	{
		name: "neeraj.eth",
		imageUrl: "https://picsum.photos/200?random=1",
		expires: "2025-12-31",
		chain: "eth",
		isSubname: false,
		subnames: [
			{
				name: "neeraj.base.eth",
				imageUrl: "https://picsum.photos/200?random=2",
				expires: "2026-03-10",
				chain: "base",
				isSubname: true,
			},
			{
				name: "neeraj.dev.eth",
				imageUrl: "https://picsum.photos/200?random=3",
				expires: "2026-06-18",
				chain: "eth",
				isSubname: true,
			},
		],
	},
	{
		name: "nikku.eth",
		imageUrl: "https://picsum.photos/200?random=4",
		expires: "2026-03-15",
		chain: "arb",
		isSubname: false,
		subnames: [
			{
				name: "nikku.base.eth",
				imageUrl: "https://picsum.photos/200?random=5",
				expires: "2027-01-22",
				chain: "base",
				isSubname: true,
			},
			{
				name: "nikku.app.eth",
				imageUrl: "https://picsum.photos/200?random=6",
				expires: "2026-05-11",
				chain: "eth",
				isSubname: true,
			},
		],
	},
	{
		name: "buzzify.eth",
		imageUrl: "https://picsum.photos/200?random=7",
		expires: "2025-11-10",
		chain: "base",
		isSubname: false,
		subnames: [
			{
				name: "buzzify.social.eth",
				imageUrl: "https://picsum.photos/200?random=8",
				expires: "2026-02-08",
				chain: "base",
				isSubname: true,
			},
			{
				name: "buzzify.zaps.eth",
				imageUrl: "https://picsum.photos/200?random=9",
				expires: "2026-08-21",
				chain: "eth",
				isSubname: true,
			},
		],
	},
	{
		name: "cryptoqueen.eth",
		imageUrl: "https://picsum.photos/200?random=10",
		expires: "2026-01-20",
		chain: "eth",
		isSubname: false,
		subnames: [
			{
				name: "cryptoqueen.dao.eth",
				imageUrl: "https://picsum.photos/200?random=11",
				expires: "2026-09-05",
				chain: "eth",
				isSubname: true,
			},
		],
	},
	{
		name: "web3dev.eth",
		imageUrl: "https://picsum.photos/200?random=12",
		expires: "2025-10-05",
		chain: "eth",
		isSubname: false,
		subnames: [
			{
				name: "web3dev.builders.eth",
				imageUrl: "https://picsum.photos/200?random=13",
				expires: "2026-04-14",
				chain: "base",
				isSubname: true,
			},
			{
				name: "web3dev.hub.eth",
				imageUrl: "https://picsum.photos/200?random=14",
				expires: "2026-12-01",
				chain: "arb",
				isSubname: true,
			},
		],
	},
	{
		name: "zkbuilder.eth",
		imageUrl: "https://picsum.photos/200?random=15",
		expires: "2026-02-12",
		chain: "eth",
		isSubname: false,
		subnames: [
			{
				name: "zkbuilder.dev.eth",
				imageUrl: "https://picsum.photos/200?random=16",
				expires: "2027-03-01",
				chain: "eth",
				isSubname: true,
			},
		],
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
		// For new structure, only top-level ENS names are in the root array; subnames are in .subnames
		if (!showSubnames) {
			return list.filter(
				(item: (typeof dummyENSNames)[number]) => !item.isSubname,
			);
		} else {
			// Flatten all subnames from all root ENS names
			return list.flatMap(
				(item: (typeof dummyENSNames)[number]) => item.subnames || [],
			);
		}
	}

	function MainContent() {
		const [showSubnames, setShowSubnames] = useState(false);
		const [search, setSearch] = useState("");
		// Types for ENS and subname
		type ENSRoot = (typeof dummyENSNames)[number];
		type ENSSub = ENSRoot["subnames"][number];
		type ENSItem = ENSRoot | ENSSub;
		const [selectedENS, setSelectedENS] = useState<ENSItem | null>(null);
		const filteredENSNames = filterENSNames(dummyENSNames, showSubnames).filter(
			(ens: ENSItem) => {
				const q = search.trim().toLowerCase();
				if (!q) return true;
				return (
					ens.name.toLowerCase().includes(q) ||
					(ens.chain && ens.chain.toLowerCase().includes(q))
				);
			},
		);
		return (
			<main className="ns-main">
				<div className="ns-page">
					<aside className="ns-left">
						<ProfileCard
							bannerUrl={
								selectedENS
									? selectedENS.imageUrl
									: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s"
							}
							avatarUrl={
								selectedENS
									? selectedENS.imageUrl
									: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s"
							}
							name={selectedENS ? selectedENS.name : "thecap.eth"}
							username={
								selectedENS ? selectedENS.name.replace(".eth", "") : "thecap"
							}
							bio="Builder, thinker, investor, optimist"
							address="0x035eB...24117D3"
							followers={1200}
							following={340}
							ownedBy="thecap.eth"
							expires={selectedENS ? selectedENS.expires : "26/07/28"}
							records={["0,0,0,0"]}
							website="https://thecap.eth.limo"
							subnames={
								selectedENS &&
								"subnames" in selectedENS &&
								Array.isArray(selectedENS.subnames)
									? selectedENS.subnames.length
									: 0
							}
							profit={6}
							volume={0}
							// onFollowClick={() => console.log("Follow clicked")}
						/>
						{/* <SubnameProfileCard
              bannerUrl={selectedENS?.imageUrl ? selectedENS.imageUrl : "https://t3.ftcdn.net/jpg/07/32/10/90/360_F_732109080_4lXwGofazqAiysUpcCnrbflsNOl9EMdW.jpg"}
              name={selectedENS?.name ? selectedENS.name : "thecap.eth"}
              followers={120}
              following={34}
              socials={{
                x: "thecap_eth",
                github: "thecap",
                discord: "thecap_channel",
                website: "https://thecap.eth.limo"
              }}
            /> */}
					</aside>

					<section className="ns-right">
						<div className="ns-header">
							<div className="ns-tabs">
								<span
									className={!showSubnames ? "active" : ""}
									onClick={() => setShowSubnames(false)}
								>
									<Text onClick={() => setSelectedENS(null)}>ENS Names</Text>
									<Text weight="bold" color="primary">
										{dummyENSNames.length}
									</Text>
								</span>
								<span
									className={showSubnames ? "active" : ""}
									onClick={() => setShowSubnames(true)}
								>
									<Text>Subnames</Text>{" "}
									<Text weight="bold" color="primary">
										{dummyENSNames.reduce(
											(acc, item) =>
												acc + (item.subnames ? item.subnames.length : 0),
											0,
										)}
									</Text>
								</span>
							</div>
						</div>
						<div className="ns-header">
							<Text size="xl" weight="bold">
								{selectedENS ? "Sub Names" : "ENS Names"}
							</Text>
							<div className="ns-search">
								<Input
									size="lg"
									placeholder="Search ENS, addresses, txns..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
						</div>

						{selectedENS && (
							<div>
								<SubnameBannerMint />
							</div>
						)}
						<div className="ns-ens-grid">
							{selectedENS &&
							!selectedENS.isSubname &&
							Array.isArray((selectedENS as any).subnames) &&
							(selectedENS as any).subnames.length > 0
								? (selectedENS as any).subnames.map((sub: any) => (
										<ENSNameCard
											key={sub.name}
											name={sub.name}
											imageUrl={sub.imageUrl}
											expires={sub.expires}
											chain={sub.chain}
										/>
									))
								: filteredENSNames.map((ens: ENSItem, idx: number) => (
										<ENSNameCard
											key={ens.name}
											name={ens.name}
											imageUrl={ens.imageUrl}
											expires={ens.expires}
											chain={ens.chain}
											{...(!ens.isSubname
												? { onClick: () => setSelectedENS(ens) }
												: {})}
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

	return (
		<div>
			<WalletConnect>
				<div className="ns-layout">
					<div className="ns-body">
						<Sidebar />

						<div className="ns-right-column">
							<Navbar />
							<div className="ns-actions-buttons">
								<Button variant="outline" size="md">
									Account Page
								</Button>
								{/* <Button variant="outline" size="md">ENS Name Page</Button> */}
							</div>
							<MainContent />
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
