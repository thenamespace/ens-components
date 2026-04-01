import { useState } from "react";
import ninjaBanner from "./assets/ninja-banner.png";
import logoFull from "./assets/logo-full.jpeg";
import logoIcon from "./assets/logo-icon.png";
import { NavWalletButton } from "./nav/NavWalletButton";
import { ComponentsDropdown } from "./nav/ComponentsDropdown";
import { QuickStartSection } from "./sections/QuickStartSection";
import { AgentQuickStartSection } from "./sections/AgentQuickStartSection";
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

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ENS Components by Namespace",
  url: "https://enscomponents.com",
  description: "Interactive documentation and live playground for @thenamespace/ens-components — production-ready React components for ENS name registration, record editing, and subname issuance.",
  publisher: {
    "@type": "Organization",
    name: "Namespace",
    url: "https://namespace.ninja",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://github.com/thenamespace/ens-components/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const HOWTO_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to install and use ENS Components in a React app",
  description: "Add ENS name registration, record editing, and subname issuance to any React app in minutes using @thenamespace/ens-components.",
  supply: [
    { "@type": "HowToSupply", name: "Node.js project" },
    { "@type": "HowToSupply", name: "React 19+ app" },
    { "@type": "HowToSupply", name: "wagmi-compatible wallet connection" },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Install the package",
      text: "Run: npm install @thenamespace/ens-components wagmi viem @tanstack/react-query",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Import the stylesheet",
      text: "Add import \"@thenamespace/ens-components/styles\" once at your app root.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Wrap your app with providers",
      text: "Wrap your component tree with WagmiProvider and QueryClientProvider from wagmi and @tanstack/react-query.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Drop in a component",
      text: "Import and render any of the five components: EnsNameRegistrationForm, EnsRecordsForm, SelectRecordsForm, OffchainSubnameForm, or SubnameMintForm.",
    },
  ],
};

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
  codeRepository: "https://github.com/thenamespace/ens-components",
  programmingLanguage: ["TypeScript", "React"],
  keywords: "ENS, Ethereum Name Service, React, subnames, Web3, wagmi",
};

const SOURCE_CODE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "@thenamespace/ens-components",
  description:
    "Production-ready React component library for ENS name registration, profile record editing, and subname issuance.",
  url: "https://github.com/thenamespace/ens-components",
  codeRepository: "https://github.com/thenamespace/ens-components",
  programmingLanguage: [
    { "@type": "ComputerLanguage", name: "TypeScript" },
    { "@type": "ComputerLanguage", name: "CSS" },
  ],
  runtimePlatform: "Node.js / Web Browser",
  targetProduct: {
    "@type": "SoftwareApplication",
    name: "@thenamespace/ens-components",
  },
  license: "https://opensource.org/licenses/MIT",
  author: {
    "@type": "Organization",
    name: "Namespace",
    url: "https://namespace.ninja",
  },
  version: __APP_VERSION__,
  keywords:
    "ENS, Ethereum Name Service, React, wagmi, viem, Web3, subnames, TypeScript",
};

export function App() {
  const [isTestnet, setIsTestnet] = useState(false);

  return (
    <>
      <SEO />
      <StructuredData schema={WEBSITE_SCHEMA} />
      <StructuredData schema={HOWTO_SCHEMA} />
      <StructuredData schema={ORG_SCHEMA} />
      <StructuredData schema={PRODUCT_SCHEMA} />
      <StructuredData schema={SOURCE_CODE_SCHEMA} />

      {/* NAV */}
      <nav className="nav" aria-label="Main navigation">
        <a className="nav-logo" href="#">
          <span className="nav-logo-stack">
            <img src={logoFull} alt="Namespace" className="nav-logo-full" />
          </span>
          <img src={logoIcon} alt="Namespace" className="nav-logo-icon" />
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#quickstart">Quick Start</a>
          <ComponentsDropdown />
          <a className="nav-link" href="https://t.me/+zRyLIQoGGU9iNzIy" target="_blank" rel="noreferrer">Report a bug</a>
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
              <a className="hero-cta-secondary" href="#agent-quickstart">Agent Quick Start</a>
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
          <AgentQuickStartSection />
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
        <div className="footer-inner">
          <div className="footer-card">
            {/* Brand column */}
            <div className="footer-brand">
              <a href="https://enscomponents.com" target="_blank" rel="noreferrer" className="footer-logo-link">
                <img src={logoFull} alt="Namespace" className="footer-logo" />
              </a>
              <p className="footer-tagline"><strong>ENS UI Components for any React app.</strong></p>
              <p className="footer-desc">
                Part of <a href="https://namespace.ninja" target="_blank" rel="noreferrer">Namespace</a> — ENS subname<br />
                infrastructure, components, and tooling<br />
                for chains, wallets, and apps.
              </p>
              <a href="https://ens.domains" target="_blank" rel="noreferrer" className="footer-ens-badge">
                <svg width="14" height="16" viewBox="0 0 202 231" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M98.3592 2.80337L34.8353 107.327C34.3371 108.147 33.1797 108.238 32.5617 107.505C26.9693 100.864 6.13478 72.615 31.9154 46.8673C55.4403 23.3726 85.4045 6.62129 96.5096 0.831705C97.7695 0.174847 99.0966 1.59007 98.3592 2.80337Z" fill="#0080BC"/>
                  <path d="M94.8459 230.385C96.1137 231.273 97.6758 229.759 96.8261 228.467C82.6374 206.886 35.4713 135.081 28.9559 124.302C22.5295 113.67 9.88976 96.001 8.83534 80.8842C8.7301 79.3751 6.64332 79.0687 6.11838 80.4879C5.27178 82.7767 4.37045 85.5085 3.53042 88.6292C-7.07427 128.023 8.32698 169.826 41.7753 193.238L94.8459 230.386V230.385Z" fill="#0080BC"/>
                  <path d="M103.571 228.526L167.095 124.003C167.593 123.183 168.751 123.092 169.369 123.825C174.961 130.465 195.796 158.715 170.015 184.463C146.49 207.957 116.526 224.709 105.421 230.498C104.161 231.155 102.834 229.74 103.571 228.526Z" fill="#0080BC"/>
                  <path d="M107.154 0.930762C105.886 0.0433954 104.324 1.5567 105.174 2.84902C119.363 24.4301 166.529 96.2354 173.044 107.014C179.471 117.646 192.11 135.315 193.165 150.432C193.27 151.941 195.357 152.247 195.882 150.828C196.728 148.539 197.63 145.808 198.47 142.687C209.074 103.293 193.673 61.4905 160.225 38.078L107.154 0.930762Z" fill="#0080BC"/>
                </svg>
                ENS Service Provider
                <span className="footer-ens-badge-check">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#0080BC"/><path d="M3.5 6l1.8 1.8 3.2-3.6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </a>

              <div className="footer-social">
                <a href="https://github.com/thenamespace/ens-components" target="_blank" rel="noreferrer" aria-label="GitHub">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </a>
                <a href="https://x.com/namespace_eth" target="_blank" rel="noreferrer" aria-label="X / Twitter">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://t.me/namespace_eth" target="_blank" rel="noreferrer" aria-label="Telegram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
              </div>
            </div>

            {/* Components column */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Components</h4>
              <ul className="footer-col-links">
                <li><a href="#ens-registration">ENS Registration</a></li>
                <li><a href="#ens-records">ENS Records</a></li>
                <li><a href="#select-records">Select Records</a></li>
                <li><a href="#offchain-subname">Offchain Subnames</a></li>
                <li><a href="#subname-mint">Onchain Subnames</a></li>
              </ul>
            </div>

            {/* Products column */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Products and Services</h4>
              <ul className="footer-col-links">
                <li><a href="https://app.namespace.ninja" target="_blank" rel="noreferrer">Namespace App</a></li>
                <li><a href="https://resolvio.xyz" target="_blank" rel="noreferrer">Resolvio</a></li>
                <li><a href="https://app.namespace.ninja/offchain" target="_blank" rel="noreferrer">Offchain Subnames</a></li>
                <li><a href="https://app.namespace.ninja/onchain" target="_blank" rel="noreferrer">Onchain Subnames</a></li>
                <li><a href="https://docs.namespace.ninja/user-guide/ens-widget" target="_blank" rel="noreferrer">ENS Widget</a></li>
              </ul>
            </div>

            {/* Resources column */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Resources</h4>
              <ul className="footer-col-links">
                <li><a href="https://github.com/thenamespace/ens-components" target="_blank" rel="noreferrer">GitHub Repo</a></li>
                <li><a href="https://docs.namespace.ninja" target="_blank" rel="noreferrer">Docs</a></li>
                <li><a href="https://namespace.ninja/blog" target="_blank" rel="noreferrer">Blog</a></li>
                <li><a href="https://t.me/+zRyLIQoGGU9iNzIy" target="_blank" rel="noreferrer">Report a Bug</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()} Namespace. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
