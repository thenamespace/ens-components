import { CircleHelp } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { FAQ } from "../components/FAQ";
import { StructuredData } from "../components/StructuredData";

const FAQ_ITEMS = [
  {
    question: "What is @thenamespace/ens-components?",
    answer:
      "It is a production-ready React component library for building ENS (Ethereum Name Service) experiences. It provides drop-in UI components for ENS name registration, profile record editing, and subname issuance — all with built-in wallet integration via wagmi and viem.",
  },
  {
    question: "What are the peer dependencies?",
    answer:
      "The library requires wagmi, viem, and @tanstack/react-query as peer dependencies. Install them with: npm install @thenamespace/ens-components wagmi viem @tanstack/react-query",
  },
  {
    question: "Does it support testnets?",
    answer:
      "Yes. Pass isTestnet={true} to any component to switch it to Sepolia testnet. The component will use the correct ENS registry and resolver addresses for that network.",
  },
  {
    question: "What are offchain subnames?",
    answer:
      "Offchain subnames are ENS subnames created via the Namespace API without any on-chain transaction. They resolve through an EIP-3668 CCIP-Read gateway, making them instant and gas-free for end users.",
  },
  {
    question: "What are onchain subnames?",
    answer:
      "Onchain subnames are subnames mintable under ENS names that have been activated on the Namespace platform. Minting happens on-chain via a wallet transaction and gives the holder a fully decentralised, censorship-resistant subname.",
  },
  {
    question: "How do I get an API key for offchain subnames?",
    answer: (
      <>
        Connect your wallet on the{" "}
        <a href="https://dev.namespace.ninja" target="_blank" rel="noreferrer">
          Developer Portal
        </a>{" "}
        and generate an API key for your ENS name.
      </>
    ),
    schemaAnswer:
      "Connect your wallet on the Developer Portal (dev.namespace.ninja) and generate an API key for your ENS name.",
  },
  {
    question: "Can I customise the component appearance?",
    answer:
      "Yes. Components accept props like title, subtitle, noBorder, hideBanner, and bannerImage. The stylesheet uses CSS custom properties so you can theme the components to match your app.",
  },
  {
    question: "Is the library open source?",
    answer:
      "Yes. The source is available on GitHub at github.com/thenamespace/ens-components under an open-source licence.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: "schemaAnswer" in item
        ? item.schemaAnswer
        : typeof item.answer === "string"
          ? item.answer
          : item.question,
    },
  })),
};

export function FAQSection() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-heading">
      <StructuredData schema={FAQ_SCHEMA} />
      <SectionHeader
        icon={CircleHelp}
        name="FAQ"
        title="Frequently Asked Questions"
        desc="Common questions about ENS Components, subnames, and integration."
      />
      <FAQ items={FAQ_ITEMS} />
    </section>
  );
}
