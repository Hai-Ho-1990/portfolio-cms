import * as React from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';

export default function AboutSection() {
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

    const aboutSectionData = data.allContentfulAboutSection?.nodes?.[0];
    if (!aboutSectionData) return null;

    const { title, thumbnail, description, ctaReference } = aboutSectionData;

    // Säkerställer att imageData aldrig blir undefined
    const imageData: IGatsbyImageData | null =
        thumbnail?.gatsbyImageData ?? null;

    return (
        <section className="about w-screen min-h-screen flex flex-col justify-center bg-[#fafafa] text-[#312B22]">
            {/* CTA LINKS */}
            {ctaReference?.length > 0 &&
                ctaReference
                    .filter((cta: any) => cta?.page?.slug)
                    .map((cta: { page: { slug: string } }, idx: number) => {
                        const slug = cta.page.slug;
                        return (
                            <Link
                                key={idx}
                                to={`/${slug}`}
                                className="self-center mb-4 flex flex-col items-center"
                            >
                                {/* BUTTON */}
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

                                {/* IMAGE OR FALLBACK */}
                                {imageData ? (
                                    <GatsbyImage
                                        image={imageData}
                                        alt="painting"
                                        className="w-24 h-24 mt-4 rounded-full border-4 border-blue-500 "
                                    />
                                ) : (
                                    <div className="w-24 h-24 mt-4 rounded-full bg-gray-200 border-4 border-blue-500" />
                                )}
                            </Link>
                        );
                    })}

            {/* TITLE */}
            <h1 className="tracking-tighter text-center lg:text-2xl mt-8">
                {title}
            </h1>

            {/* DESCRIPTION */}
            {description && (
                <div className="mt-8 text-2xl text-center max-w-2xl w-[70%] self-center lg:text-[3rem] leading-[1.1]">
                    {(() => {
                        try {
                            return documentToReactComponents(
                                JSON.parse(description.raw)
                            );
                        } catch (e) {
                            console.error('Failed to parse description:', e);
                            return null;
                        }
                    })()}
                </div>
            )}
        </section>
    );
}
