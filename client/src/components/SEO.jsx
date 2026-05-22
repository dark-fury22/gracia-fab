import { Helmet } from "react-helmet-async";

function SEO({ title, description, keywords, image, url, type = "website" }) {
  const siteName = "Gracia Fab";
  const defaultDesc =
    "Gracia Fab is your AI-powered beauty advisor. Get personalized skincare routines, haircare tips, wig styles and bridal beauty recommendations made just for you.";
  const defaultImage =
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=630&fit=crop";
  const baseUrl = "https://graciafab.com";

  const fullTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} — AI-Powered Beauty Advisor`;
  const metaDesc = description || defaultDesc;
  const metaImage = image || defaultImage;
  const metaUrl = url ? `${baseUrl}${url}` : baseUrl;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Gracia Fab" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_NG" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@graciafab" />

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#FE938C" />

      {/* Geo - Nigeria targeting */}
      <meta name="geo.region" content="NG" />
      <meta name="geo.country" content="Nigeria" />
    </Helmet>
  );
}

export default SEO;
