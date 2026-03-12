import { Helmet } from "react-helmet-async";

export const SITE_URL = "https://enscomponents.com";

const DEFAULT_TITLE = "ENS Components by Namespace";
const DEFAULT_DESC =
  "Production-ready React components for ENS name registration, record editing, and subname issuance. Drop them in, connect a wallet, ship.";
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
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image:width" content="2398" />
      <meta property="og:image:height" content="1300" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@namespace_eth" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
