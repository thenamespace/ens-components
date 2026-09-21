import { Helmet } from "react-helmet-async";

export const SITE_URL = "https://enscomponents.com";

const DEFAULT_TITLE = "ENS Components — React UI Library for ENS by Namespace";
const DEFAULT_DESC =
  "Production-ready React components for ENS name registration, record editing, and subname issuance. Five drop-in components built on wagmi and viem. Works with Next.js, Remix, and Vite.";
const DEFAULT_KEYWORDS =
  "ENS components, React ENS, Ethereum Name Service React, ENS name registration, ENS records, ENS subnames, offchain subnames, onchain subnames, wagmi ENS, viem ENS, Web3 React components, ENS UI, @thenamespace/ens-components, Namespace, EnsNameRegistrationForm, EnsRecordsForm, SubnameMintForm, OffchainSubnameForm, SelectRecordsForm";
const DEFAULT_IMAGE = `${SITE_URL}/preview.png`;

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical = SITE_URL,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={DEFAULT_KEYWORDS} />
      <meta name="author" content="Namespace" />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="theme-color" content="#0080BC" />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content="ENS Components" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="2398" />
      <meta property="og:image:height" content="1300" />
      <meta property="og:image:alt" content="ENS Components by Namespace — React UI library for ENS" />
      <meta property="og:type" content={ogType} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@namespace_eth" />
      <meta name="twitter:creator" content="@namespace_eth" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="ENS Components by Namespace" />

      {/* AI / LLM discovery — llms.txt files are alternate text representations of this page */}
      <link rel="api-catalog" href={`${SITE_URL}/.well-known/api-catalog`} />
      <link rel="alternate" type="text/plain" href={`${SITE_URL}/llms.txt`} title="LLM-friendly summary" />
      <link rel="alternate" type="text/plain" href={`${SITE_URL}/llms-full.txt`} title="LLM full API reference" />
    </Helmet>
  );
}
