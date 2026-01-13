import { graphql, useStaticQuery } from 'gatsby';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';

/* =======================
   TYPER
======================= */
interface Recommendation {
    reference?: string; // Länk till profil / källa
    avatar?: { gatsbyImageData: IGatsbyImageData }; // Profilbild
    name: string;
    position: string;
    recommendation: { recommendation: string }; // Själva rekommendationen
}

interface RecommendationsProps {
    isMobile?: boolean; // Optional prop för att forcera mobil-layout
}

/* =======================
   HUVUDKOMPONENT
======================= */
export default function Recommendations({
    isMobile: propIsMobile
}: RecommendationsProps = {}) {
    // State för att kolla viewport (mobil eller desktop)
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 1024;
        }
        return false;
    });

    // State för att förhindra SSR/hydration-mismatch
    const [isClient, setIsClient] = useState(false);

    /* =======================
       CLIENT-SIDE CHECK
       =======================
       - Uppdaterar isMobile på resize
       - Sätter isClient = true för att rendera innehåll

    */
    useEffect(() => {
        setIsClient(true);

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    /* =======================
       GraphQL QUERY
       =======================
       Hämtar alla rekommendationer från Contentful
    */
    const data = useStaticQuery(graphql`
        query MyQuery {
            allContentfulRecommendations {
                nodes {
                    avatar {
                        gatsbyImageData(
                            placeholder: BLURRED
                            formats: [AUTO, WEBP, AVIF]
                            layout: CONSTRAINED
                        )
                    }
                    name
                    position
                    recommendation {
                        recommendation
                    }
                    reference
                }
            }
        }
    `);

    const recommendationsData: Recommendation[] =
        data.allContentfulRecommendations?.nodes || [];

    // Om inga rekommendationer finns → return null
    if (!recommendationsData.length) return null;

    // Förhindra SSR/hydration-mismatch -> Renderar ingenting
    if (!isClient) {
        return null;
    }

    // Använd prop om angivet, annars beräkna med isMobile
    // Props skickas till HorizontalScrollReccommendations.tsx
    //föratt bestämma mobil eller desktop som används
    const useMobileLayout =
        propIsMobile !== undefined ? propIsMobile : isMobile;

    /* =======================
       MOBIL-LAYOUT
       =======================
       - Vertikal sektion per rekommendation
       - Profilbild, namn, position + text
    */
    if (useMobileLayout) {
        return (
            <>
                {recommendationsData.map((recommendation: Recommendation) => (
                    <section
                        key={recommendation.name}
                        className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-[#c4b8a5] px-6 "
                    >
                        <div className="flex flex-col items-center justify-center max-w-md gap-6">
                            {/* Avatar + namn/position */}
                            <div className="flex flex-col items-center gap-4">
                                {recommendation.avatar?.gatsbyImageData && (
                                    <a
                                        href={recommendation.reference}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Visit ${recommendation.name}'s profile`}
                                        className="hover:opacity-70 transition"
                                    >
                                        <GatsbyImage
                                            image={
                                                recommendation.avatar
                                                    .gatsbyImageData
                                            }
                                            alt={recommendation.name}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    </a>
                                )}

                                <div className="text-center">
                                    <h3 className="font-bold text-lg">
                                        {recommendation.name}
                                    </h3>
                                    <p className="text-sm text-[#c4b8a5] opacity-70">
                                        {recommendation.position}
                                    </p>
                                </div>
                            </div>

                            {/* Rekommendationstext */}
                            <p className="text-center italic text-sm leading-relaxed tracking-wide opacity-70 px-4">
                                "
                                {recommendation.recommendation
                                    ?.recommendation || ''}
                                "
                            </p>
                        </div>
                    </section>
                ))}
            </>
        );
    }

    /* =======================
       DESKTOP-LAYOUT
       =======================
       - Horisontell slide per rekommendation
       - Avatar + namn/position + text
       - Flex-shrink för att hålla slides full screen
    */
    return (
        <>
            {recommendationsData.map((recommendation: Recommendation) => (
                <li
                    key={recommendation.name}
                    className="w-screen h-screen flex flex-col justify-center bg-black text-[#c4b8a5] flex-shrink-0"
                >
                    <div className="mb-8 max-w-4xl mx-auto px-4 w-[80%]">
                        <div className="flex items-center gap-4">
                            {recommendation.avatar?.gatsbyImageData && (
                                <a
                                    href={recommendation.reference}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Visit ${recommendation.name}'s profile`}
                                    className="hover:opacity-70 transition"
                                >
                                    <GatsbyImage
                                        image={
                                            recommendation.avatar
                                                .gatsbyImageData
                                        }
                                        alt={recommendation.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                </a>
                            )}

                            <div>
                                <h3 className="font-bold">
                                    {recommendation.name}
                                </h3>
                                <p className="text-sm text-[#c4b8a5]">
                                    {recommendation.position}
                                </p>
                            </div>
                        </div>

                        {/* Rekommendationstext */}
                        <p className="mb-4 italic mt-6 text-base tracking-wider">
                            "
                            {recommendation.recommendation?.recommendation ||
                                ''}
                            "
                        </p>
                    </div>
                </li>
            ))}
        </>
    );
}
