import * as React from 'react';

type SEOProps = {
    seo?: {
        seoTitle?: string;
        seoDescription?: { seoDescription?: string };

        openGraphImage?: { file?: { url?: string } };
    };
    pathname?: string;
};

export function SEOHead({ seo, pathname = '' }: SEOProps) {
    const title = seo?.seoTitle || 'Hai Ho – Frontend Developer';
    const description =
        seo?.seoDescription?.seoDescription ||
        'Portfolio of Hai Ho, junior frontend developer.';

    const siteUrl = 'https://hai-ho-portfolio.netlify.app';
    const url = `${siteUrl}${pathname}`;

    const ogImage = seo?.openGraphImage?.file?.url
        ? seo.openGraphImage.file.url.startsWith('//')
            ? `https:${seo.openGraphImage.file.url}`
            : seo.openGraphImage.file.url
        : undefined;

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />

            {ogImage && <meta property="og:image" content={ogImage} />}
        </>
    );
}
