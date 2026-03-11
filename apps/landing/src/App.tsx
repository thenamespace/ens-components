import { useState } from "react";
import ninjaBanner from "./assets/ninja-banner.png";
import logoFull from "./assets/logo-full.png";
import logoIcon from "./assets/logo-icon.png";
import { NavWalletButton } from "./nav/NavWalletButton";
import { ComponentsDropdown } from "./nav/ComponentsDropdown";
import { QuickStartSection } from "./sections/QuickStartSection";
import { EnsRegistrationSection } from "./sections/EnsRegistrationSection";
import { EnsRecordsSection } from "./sections/EnsRecordsSection";
import { SelectRecordsSection } from "./sections/SelectRecordsSection";
import { OffchainSubnameSection } from "./sections/OffchainSubnameSection";
import { SubnameMintSection } from "./sections/SubnameMintSection";
import { ReportBugSection } from "./sections/ReportBugSection";
import { FAQSection } from "./sections/FAQSection";
import { SwitchChainModal } from "./components/SwitchChainModal";
import { SEO, SITE_URL } from "./components/SEO";
import { StructuredData } from "./components/StructuredData";
import "./landing.css";

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Namespace",
  url: "https://namespace.ninja",
  sameAs: [
    "https://github.com/thenamespace",
    "https://x.com/namespace_eth",
  ],
};

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "@thenamespace/ens-components",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "Production-ready React components for ENS name registration, record editing, and subname issuance.",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Namespace",
    url: "https://namespace.ninja",
  },
  codeRepository: "https://github.com/thenamespace/uikit",
  programmingLanguage: ["TypeScript", "React"],
  keywords: "ENS, Ethereum Name Service, React, subnames, Web3, wagmi",
};

export function App() {
  const [isTestnet, setIsTestnet] = useState(false);

  return (
    <>
      <SEO />
      <StructuredData schema={ORG_SCHEMA} />
      <StructuredData schema={PRODUCT_SCHEMA} />

      {/* NAV */}
      <nav className="nav" aria-label="Main navigation">
        <a className="nav-logo" href="#">
          <span className="nav-logo-stack">
            <img src={logoFull} alt="Namespace" className="nav-logo-full" />
            <span className="nav-logo-sub">ENS Components</span>
          </span>
          <img src={logoIcon} alt="Namespace" className="nav-logo-icon" />
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#quickstart">Quick Start</a>
          <ComponentsDropdown />
          <a className="nav-link" href="#report-bug">Report a bug</a>
          <div className="nav-sep" />
          <NavWalletButton />
        </div>
      </nav>

      <SwitchChainModal isTestnet={isTestnet} />

      {/* HERO + SECTIONS */}
      <div className="grid-wrapper">
        <header className="hero">
          <div className="hero-text">
            <h1 className="hero-title">
              ENS UI Components<br />
              for <em>any</em> React app
            </h1>
            <p className="hero-subtitle">
              Components for ENS name registration, record editing,
              and subname issuance. Drop them in, connect a wallet, ship.
            </p>
            <div className="hero-actions">
              <a className="hero-cta" href="#quickstart">Get Started</a>
            </div>
          </div>
          <div className="hero-image">
            <img src={ninjaBanner} alt="Namespace ninja mascot" />
          </div>
        </header>

        <main>
          <div className="section-divider" />
          <QuickStartSection />
          <div className="section-divider" />
          <EnsRegistrationSection isTestnet={isTestnet} onIsTestnetChange={setIsTestnet} />
          <div className="section-divider" />
          <EnsRecordsSection isTestnet={isTestnet} onIsTestnetChange={setIsTestnet} />
          <div className="section-divider" />
          <SelectRecordsSection />
          <div className="section-divider" />
          <OffchainSubnameSection isTestnet={isTestnet} onIsTestnetChange={setIsTestnet} />
          <div className="section-divider" />
          <SubnameMintSection isTestnet={isTestnet} onIsTestnetChange={setIsTestnet} />
          <div className="section-divider" />
          <FAQSection />
          <div className="section-divider" />
          <ReportBugSection />
        </main>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <a href="https://namespace.ninja" target="_blank" rel="noreferrer" className="footer-logo-link">
          <span className="footer-logo-stack">
            <img src={logoFull} alt="Namespace" className="footer-logo" />
            <span className="footer-logo-sub">ENS Components</span>
          </span>
        </a>
        <div className="footer-links">
          Built by{" "}
          <a href="https://namespace.ninja" target="_blank" rel="noreferrer">Namespace</a>
          {" · "}
          <a href="https://github.com/thenamespace/uikit" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </>
  );
}
