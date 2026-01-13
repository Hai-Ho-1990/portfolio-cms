import * as React from 'react';

/* =======================
   SEO TYPES
   =======================
   Props som skickas in till SEOHead
   - seo: SEO-data från Contentful
   - pathname: aktuell sidas path (ex: "/works")
======================= */
type SEOProps = {
    seo?: {
        seoTitle?: string;
        seoDescription?: { seoDescription?: string };
        openGraphImage?: { file?: { url?: string } };
    };
    pathname?: string;
};

/* =======================
   SEOHead Component
   =======================
   Ansvar:
   - Sätta <title> och meta-tags
   - Hantera Open Graph-data för sociala medier
   - Fallback-värden om Contentful-data saknas
======================= */
export function SEOHead({ seo, pathname = '' }: SEOProps) {
    /* =======================
       TITLE & DESCRIPTION
       =======================
       Prioriterar Contentful SEO-data
       Faller tillbaka till default-värden
    ======================= */
    const title = seo?.seoTitle || 'Hai Ho – Frontend Developer';
    const description =
        seo?.seoDescription?.seoDescription ||
        'Portfolio of Hai Ho, junior frontend developer.';

    /* =======================
       URL HANDLING
       =======================
       Bygger full URL för Open Graph
       Ex: https://site.com/works
    ======================= */
    const siteUrl = 'https://hai-ho-portfolio.netlify.app';
    const url = `${siteUrl}${pathname}`;

    /* =======================
       OPEN GRAPH IMAGE
       =======================
       Contentful returnerar ibland URL som "//images.ctf..."
       → vi säkerställer att den är giltig (https:)
    ======================= */
    const ogImage = seo?.openGraphImage?.file?.url
        ? seo.openGraphImage.file.url.startsWith('//')
            ? `https:${seo.openGraphImage.file.url}`
            : seo.openGraphImage.file.url
        : undefined;

    return (
        <>
            {/* =======================
               BASIC SEO
               ======================= */}
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* =======================
               OPEN GRAPH (Social media)
               ======================= */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />

            {ogImage && <meta property="og:image" content={ogImage} />}
        </>
    );
}
