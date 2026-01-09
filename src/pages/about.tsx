import React from 'react';
import Experiences from '../components/Experiences';
import NavBar from '../components/navbar';
import { SEOHead } from '../components/SEO';
import HorizontalScrollsection from '../components/HorizontalScrollReccommendations';
import { ReactLenis } from 'lenis/dist/lenis-react';
import { graphql } from 'gatsby';

import Biography from '../components/biography';

/* =======================
   PAGE COMPONENT
======================= */
export default function About() {
    return (
        <ReactLenis root>
            <header className="absolute top-0 w-full">
                <NavBar />
            </header>

            <Biography />

            <Experiences />
            <HorizontalScrollsection />
        </ReactLenis>
    );
}

/* =======================
   HEAD (SEO)
======================= */

export const Head = ({ location, data }: any) => {
    const defaultSeo = {
        seoTitle: 'About – Hai Ho',
        seoDescription: {
            seoDescription:
                'Learn more about Hai Ho, junior frontend developer.'
        },
        openGraphImage: null,
        noIndex: false,
        canonical: 'https://hai-ho-portfolio.netlify.app/about'
    };

    const seo = data?.allContentfulAboutMePage?.nodes?.[0]?.seo || defaultSeo;

    return <SEOHead seo={seo} pathname={location.pathname} />;
};

/* =======================
   PAGE QUERY
======================= */

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
