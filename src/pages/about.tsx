import React from 'react';
import Experiences from '../components/Experiences';
import NavBar from '../components/navbar';
import { SEOHead } from '../components/SEOHead';
import HorizontalScrollsection from '../components/reccommendations';
import { ReactLenis } from 'lenis/dist/lenis-react';
import { graphql } from 'gatsby';
import Biography from '../components/biography';

/* =======================
   SEO TYPE
======================= */
type AboutSeo = {
    seoTitle?: string;
    seoDescription?: {
        seoDescription?: string;
    };
    openGraphImage?: {
        file?: { url?: string };
    };
};

/* =======================
   PAGE COMPONENT
   =======================
   Huvudkomponenten for /about-sidan.
   Innesluter innehallet i ReactLenis for
   smooth scroll, renderar navbar, biografi,
   erfarenheter och en horisontell scrollsektion.
*/
export default function About({ data, serverData }: any) {
    return (
        <ReactLenis root>
            {/* Sticky/header-sektionen */}
            <header className="absolute top-0 w-full">
                <NavBar navItems={serverData?.navItems} />
            </header>

            {/* Biografi-sektionen */}
            <Biography biographyData={serverData?.biographyData} />

            {/* Erfarenheter och rekommendationer */}
            <Experiences experiencesData={serverData?.experiencesData} />
            <HorizontalScrollsection recommendationsData={serverData?.recommendationsData} />
        </ReactLenis>
    );
}

/* =======================
   HEAD (SEO)
   =======================
   Gatsby Head API anvands for att generera <head>-taggar.
   Prioriterar serverData (SSR) over static data.
*/
export const Head = ({ location, data, serverData }: any) => {
    const defaultSeo = {
        seoTitle: 'About – Hai Ho',
        seoDescription: {
            seoDescription:
                'Learn more about Hai Ho, junior frontend developer.'
        },
        openGraphImage: null
    };

    // Plocka SEO-data: serverData forst, sedan Contentful static, sedan default
    const seo =
        serverData?.seo ||
        data?.allContentfulAboutMePage?.nodes?.[0]?.seo ||
        defaultSeo;

    return <SEOHead seo={seo} pathname={location.pathname} />;
};

/* =======================
   PAGE QUERY
   =======================
   GraphQL-query som hamtar SEO-data fran Contentful
   for /about-sidan och skickar dessa till SEOHead.tsx
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

/* =======================
   SERVER-SIDE RENDERING
   =======================
   getServerData kors vid varje request.
   Hamtar SEO-data direkt fran Contentful REST API.
*/
export async function getServerData() {
    try {
        const {
            fetchNavItems, fetchBiography, fetchExperiences, fetchRecommendations,
        } = await import('../utils/ssrDataFetchers');

        const [navItems, bioResult, experiencesData, recommendationsData] =
            await Promise.all([
                fetchNavItems(),
                fetchBiography(),
                fetchExperiences(),
                fetchRecommendations(),
            ]);

        return {
            props: {
                seo: bioResult.seo,
                navItems,
                biographyData: bioResult.biographyData,
                experiencesData,
                recommendationsData,
            },
        };
    } catch (error) {
        console.error('getServerData error (about):', error);
        return { props: {} };
    }
}
