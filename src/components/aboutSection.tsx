import * as React from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';
// Används för att rendera Contentful Rich Text (JSON) som React-komponenter
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
// GatsbyImage = optimerad bild, IGatsbyImageData = TypeScript-typ för bilddata
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';

export default function AboutSection() {
    /**
     * useStaticQuery körs vid build-time i Gatsby
     * och hämtar data från Contentful via GraphQL
     */
    const data = useStaticQuery(graphql`
        query {
            allContentfulAboutSection {
                nodes {
                    title
                    thumbnail {
                        gatsbyImageData(
                            placeholder: BLURRED
                            formats: [AUTO, WEBP, AVIF]
                            layout: CONSTRAINED
                        )
                    }
                    description {
                        raw
                    }
                    ctaReference {
                        page {
                            slug
                        }
                    }
                }
            }
        }
    `);

    /**
     * Tar första objektet i arrayen (index 0)
     * Optional chaining (?.) skyddar om data saknas
     */
    const aboutSectionData = data.allContentfulAboutSection?.nodes?.[0];

    // Om ingen data finns → rendera ingenting (förhindrar krasch)
    if (!aboutSectionData) return null;

    // Plockar ut fälten för enklare användning i JSX
    const { title, thumbnail, description, ctaReference } = aboutSectionData;

    /**
     * Säker hantering av bilddata:
     * - Om thumbnail eller bilddata saknas → null
     * - Aldrig undefined (stabilare rendering i React)
     */
    const imageData: IGatsbyImageData | null =
        thumbnail?.gatsbyImageData ?? null;

    return (
        <section className="about w-screen min-h-screen flex flex-col justify-center bg-[#fafafa] text-[#312B22]">
            {/* ================= CTA LINKS ================= */}
            {ctaReference?.length > 0 &&
                ctaReference
                    // Filtrerar bort CTA-objekt utan giltig slug
                    .filter((cta: any) => cta?.page?.slug)
                    // Renderar en länk per CTA
                    .map((cta: { page: { slug: string } }, idx: number) => {
                        const slug = cta.page.slug;

                        return (
                            <Link
                                key={idx}
                                to={`/${slug}`} // Intern navigering med Gatsby Link
                                className="self-center mb-4 flex flex-col items-center"
                            >
                                {/* ================= BUTTON ================= */}
                                <button
                                    aria-label="About section CTA button"
                                    className="cta-button bg-white text-black py-4 px-10 rounded-3xl
                                    shadow-[0_2px_10px_-4px_rgba(0,0,0,0.16)]
                                    cursor-pointer relative"
                                >
                                    <span className="absolute inset-0 flex items-center justify-center text-[0.7rem]">
                                        Click me
                                    </span>
                                </button>

                                {/* ================= IMAGE OR FALLBACK ================= */}
                                {imageData ? (
                                    // Optimerad Gatsby-bild (lazy loading, rätt format)
                                    <GatsbyImage
                                        image={imageData}
                                        alt="painting"
                                        className="w-24 h-24 mt-4 rounded-full border-4 border-blue-500"
                                    />
                                ) : (
                                    // Fallback om bild saknas
                                    <div className="w-24 h-24 mt-4 rounded-full bg-gray-200 border-4 border-blue-500" />
                                )}
                            </Link>
                        );
                    })}

            {/* ================= TITLE ================= */}
            <h1 className="tracking-tighter text-center lg:text-2xl mt-8">
                {title}
            </h1>

            {/* ================= DESCRIPTION ================= */}
            {description && (
                <div className="mt-8 text-2xl text-center max-w-2xl w-[70%] self-center lg:text-[3rem] leading-[1.1]">
                    {(() => {
                        try {
                            /**
                             * description.raw är JSON (Rich Text från Contentful)
                             * JSON.parse gör om strängen till ett objekt
                             * documentToReactComponents renderar det som React
                             */
                            return documentToReactComponents(
                                JSON.parse(description.raw)
                            );
                        } catch (e) {
                            // Säkerhet: kraschar inte om JSON är trasig
                            console.error('Failed to parse description:', e);
                            return null;
                        }
                    })()}
                </div>
            )}
        </section>
    );
}
