import * as React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import AnimatedContent from './animations/AnimatedContent';

/* =======================
   WorkIntro Component
   =======================
   Ansvar:
   - Hämta intro-content för Work/Projects från Contentful
   - Rendera titel, subtitle och rich text
   - Animera innehållet vid render
======================= */
export default function WorkIntro() {
    /* =======================
       GRAPHQL QUERY
       =======================
       Hämtar WorkIntro-content:
       - title
       - subTitle
       - rich text (content.raw)
       - (helpIcon / helpText finns
         men används ej här)
    ======================= */
    const data = useStaticQuery(graphql`
        query {
            allContentfulWorkIntro {
                nodes {
                    content {
                        raw
                    }
                    helpIcon {
                        file {
                            url
                        }
                    }
                    subTitle
                    title
                    helpText
                }
            }
        }
    `);

    /* =======================
       DATA SELECTION
       =======================
       Använder första noden
       (Contentful singleton-mönster)
       Optional chaining skyddar
       mot undefined
    ======================= */
    const workIntroData = data.allContentfulWorkIntro?.nodes?.[0];

    /* =======================
       SAFETY CHECK
       =======================
       Rendera inget om data
       saknas (bygger stabil UI)
    ======================= */
    if (!workIntroData) {
        return null;
    }

    /* =======================
       DATA DESTRUCTURING
       =======================
       Plockar bara det som
       faktiskt används
    ======================= */
    const { content, subTitle, title } = workIntroData;

    return (
        <>
            {/* =======================
               SECTION LAYOUT
               =======================
               Fullscreen intro-sektion
               centrerat innehåll
            ======================= */}
            <section className="w-screen h-screen flex flex-col items-center justify-center text-black bg-[#efefef]">
                {/* =======================
                   ANIMATION WRAPPER
                   =======================
                   Ger fade/slide-in
                   (beroende på AnimatedContent)
                ======================= */}
                <AnimatedContent>
                    {/* =======================
                       TITLE
                       ======================= */}
                    {title && (
                        <h1 className="text-2xl lg:text-3xl text-center">
                            {title}
                        </h1>
                    )}

                    {/* =======================
                       SUBTITLE
                       ======================= */}
                    {subTitle && (
                        <p className="text-xl lg:text-2xl mt-2 text-center">
                            {subTitle}
                        </p>
                    )}

                    {/* =======================
                       RICH TEXT CONTENT
                       =======================
                       - Contentful rich text
                       - JSON.parse krävs
                    ======================= */}
                    {content && (
                        <div className="px-10 mt-10 text-xl text-center max-w-3xl self-center lg:text-[3rem] leading-[1.1] ">
                            {(() => {
                                try {
                                    return documentToReactComponents(
                                        JSON.parse(content.raw)
                                    );
                                } catch (error) {
                                    console.error(
                                        'Failed to parse content:',
                                        error
                                    );
                                    return null;
                                }
                            })()}
                        </div>
                    )}
                </AnimatedContent>
            </section>
        </>
    );
}
