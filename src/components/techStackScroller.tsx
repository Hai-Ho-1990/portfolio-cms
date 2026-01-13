import * as React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { useEffect, useState } from 'react';

/* =======================
   TYPES
   =======================
   Struktur för ett tech-icon
   som kommer från Contentful
======================= */
type TechItem = {
    svg: {
        url: string;
    };
};

/* =======================
   TechStackScroller
   =======================
   Ansvar:
   - Hämta tech stack (SVG-ikoner) från Contentful
   - Duplicera ikoner så att de fyller skärmen
   - Skapa en oändlig horisontell scroll-animation
======================= */
export default function TechStackScroller() {
    /* =======================
       GRAPHQL QUERY
       =======================
       Hämtar techStack från Hero-contenttypen
    ======================= */
    const data = useStaticQuery(graphql`
        query TechStackQuery {
            allContentfulHero {
                nodes {
                    techStack {
                        svg {
                            url
                        }
                    }
                }
            }
        }
    `);

    /* =======================
       RAW TECH STACK DATA
       =======================
       Plockar första Hero-noden
       Fallback till tom array
    ======================= */
    const techStack: TechItem[] =
        data.allContentfulHero.nodes[0]?.techStack ?? [];

    /* =======================
       STATE
       =======================
       filledIcons = techStack
       duplicerad tillräckligt
       många gånger för att
       täcka hela scroll-ytan
    ======================= */
    const [filledIcons, setFilledIcons] = useState<TechItem[]>([]);

    /* =======================
       EFFECT: ICON FILL LOGIC
       =======================
       - Räknar hur många gånger
         ikonerna behöver upprepas
       - Anpassar sig vid resize
    ======================= */
    useEffect(() => {
        if (!techStack.length) return;

        const fillIcons = () => {
            const iconWidth = 60; // ikon + gap (px), total bredd = 60 px
            const screenWidth = window.innerWidth;

            /* =======================
               REPEAT CALCULATION
               =======================
               6x skärmbredd → säkerställer
               sömlös, oändlig animation
            ======================= */
            const repeats = Math.ceil(
                (screenWidth * 6) / (techStack.length * iconWidth)
            );

            /* =======================
                DUPLICATE ICONS
            =======================
            - Skapar en ny array där
            techStack upprepas flera gånger
            - Används för att fylla hela
            den horisontella scroll-ytan
            - flat() används för att
            slå ihop nästlade arrayer
            ======================= */
            const repeatedIcons = Array.from(
                { length: repeats }, // antal gånger techStack ska upprepas
                () => techStack // varje iteration returnerar techStack
            ).flat();

            /* =======================
                UPDATE STATE
            =======================
            - Sparar den duplicerade listan
            i state
            - Används vid rendering av ikoner
            ======================= */

            setFilledIcons(repeatedIcons);
        };

        /* =======================
        INITIAL FILL
        =======================
        - Kör fillIcons direkt när
        komponenten mountas
        ======================= */
        fillIcons();

        /* =======================
        RESIZE LISTENER
        =======================
        - Kör fillIcons igen vid resize
        - Säkerställer att ikonerna
        alltid täcker hela skärmbredden
        ======================= */
        window.addEventListener('resize', fillIcons);

        return () => window.removeEventListener('resize', fillIcons);
    }, [techStack]);

    /* =======================
       SAFETY CHECK
       =======================
       Rendera inget om
       ingen data finns
    ======================= */
    if (!techStack.length) return null;

    return (
        /* =======================
           SCROLLER CONTAINER
           ======================= */
        <section className="techStack-section bg-[#f8f9fa] py-5 overflow-hidden ">
            <div className="scroll-container relative w-full">
                {/* =======================
                   ANIMATED ROW
                   =======================
                   animate-tech-scroll
                   = CSS keyframes
                ======================= */}
                <div className="scroll-content flex animate-tech-scroll items-center">
                    {filledIcons.map((tech, index) => (
                        <img
                            key={`${tech.svg.url}-${index}`}
                            src={tech.svg.url}
                            alt="Tech icon"
                            className="w-6 lg:w-9 h-6 lg:h-9 shrink-0 opacity-80 hover:opacity-100 transition"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
