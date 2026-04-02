import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import SplitText from './animations/SplitText';

/* =======================
   ReasonSection Component
   =======================
   Ansvar:
   - Hämta "reason"-innehåll från Contentful
   - Visa titel, huvudtext och kompletterande text (obs)
   - Animera huvudtexten med SplitText
======================= */

/* =======================
   ReasonSection Props Type
======================= */
type ReasonData = {
    title?: string;
    reasonRef?: { body?: { body?: string }; title?: string };
    thumbnail?: { url?: string };
    obs?: string;
};

export default function ReasonSection({ reasonData }: { reasonData?: ReasonData } = {}) {
    /* =======================
       DATA FETCHING
       =======================
       useStaticQuery körs vid build-time
       Hämtar reason-sektionens innehåll från Contentful
    ======================= */
    const data = useStaticQuery(graphql`
        query {
            allContentfulReasonSection {
                nodes {
                    reasonRef {
                        body {
                            body
                        }
                        title
                    }
                    thumbnail {
                        url
                    }
                    title
                    obs
                }
            }
        }
    `);

    /* =======================
       DATA SELECTION
       =======================
       Om reasonData prop finns → använd det (SSR)
       Annars → fallback till useStaticQuery (build-time)
    ======================= */
    const { title, reasonRef, obs } =
        reasonData ?? data.allContentfulReasonSection.nodes?.[0] ?? {};

    return (
        <section className="w-screen h-screen flex flex-col justify-between bg-white text-[#312B22] items-center pt-10 pb-20">
            {/* =======================
               SECTION TITLE
               =======================
               Mindre titel / intro-text
            ======================= */}
            <h1 className="text-sm lg:text-md mb-6 text-gray-500 lg:mt-10">
                {title}
            </h1>

            {/* =======================
               MAIN CONTENT
               =======================
               Huvudtexten animeras med SplitText
            ======================= */}
            <div className="w-full max-w-3xl lg:max-w-5xl p-8 m-6 text-center">
                <SplitText
                    text={reasonRef?.body?.body}
                    className="text-md lg:text-4xl text-center font-semibold"
                    splitType="lines"
                    delay={80}
                    duration={0.8}
                    from={{ opacity: 0, y: 60 }}
                    to={{ opacity: 1, y: 0 }}
                    textAlign="center"
                />
            </div>

            {/* =======================
               FOOTNOTE / OBS TEXT
               =======================
               Kompletterande eller förklarande text
            ======================= */}
            <p className="text-xs text-gray-500 w-[80%] mt-10 text-center">
                {obs}
            </p>
        </section>
    );
}
