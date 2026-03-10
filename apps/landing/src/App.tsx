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
import { SwitchChainModal } from "./components/SwitchChainModal";
import "./landing.css";

export function App() {
  const [isTestnet, setIsTestnet] = useState(false);

  return (
    <>
      {/* NAV */}
      <nav className="nav">
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
        <div className="hero">
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
            <img src={ninjaBanner} alt="Namespace ninja" />
          </div>
        </div>
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
        <ReportBugSection />
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
          <a href="https://github.com/thenamespace/ui-components" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </>
  );
}
