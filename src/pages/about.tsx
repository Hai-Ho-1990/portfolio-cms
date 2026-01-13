import React from 'react';
import Experiences from '../components/Experiences';
import NavBar from '../components/navbar';
import { SEOHead } from '../components/SEOHead';
import HorizontalScrollsection from '../components/reccommendations';
import { ReactLenis } from 'lenis/dist/lenis-react';
import { graphql } from 'gatsby';
import Biography from '../components/biography';

/* =======================
   PAGE COMPONENT
   =======================
   Huvudkomponenten för /about-sidan.
   Innesluter innehållet i ReactLenis för
   smooth scroll, renderar navbar, biografi,
   erfarenheter och en horisontell scrollsektion.
*/
export default function About() {
    return (
        <ReactLenis root>
            {/* Sticky/header-sektionen */}
            <header className="absolute top-0 w-full">
                <NavBar />
            </header>

            {/* Biografi-sektionen */}
            <Biography />

            {/* Erfarenheter och rekommendationer */}
            <Experiences />
            <HorizontalScrollsection />
        </ReactLenis>
    );
}

/* =======================
   HEAD (SEO)
   =======================
   Gatsby Head API används för att generera <head>-taggar.
   Renderar SEOHead-komponenten med antingen Contentful-data
   eller fallback/default värden.
*/
export const Head = ({ location, data }: any) => {
    const defaultSeo = {
        seoTitle: 'About – Hai Ho',
        seoDescription: {
            seoDescription:
                'Learn more about Hai Ho, junior frontend developer.'
        },
        openGraphImage: null
    };

    // Plocka SEO-data från Contentful om tillgänglig
    const seo = data?.allContentfulAboutMePage?.nodes?.[0]?.seo || defaultSeo;

    return <SEOHead seo={seo} pathname={location.pathname} />;
};

/* =======================
   PAGE QUERY
   =======================
   GraphQL-query som hämtar SEO-data från Contentful
   för /about-sidan och skickar dessa till SEOHead.tsx
   - Titel
   - Meta description
   - OpenGraph-bild
*/
export const query = graphql`
    query {
        allContentfulAboutMePage {
            nodes {
                seo {
                    openGraphImage {
                        url
                    }
                    seoTitle
                    seoDescription {
                        seoDescription
                    }
                }
            }
        }
    }
`;
