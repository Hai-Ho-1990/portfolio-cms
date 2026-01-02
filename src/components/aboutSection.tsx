import * as React from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

export default function AboutSection() {
    const data = useStaticQuery(graphql`
        query {
            allContentfulAboutSection {
                nodes {
                    title
                    thumbnail {
                        file {
                            url
                        }
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

    if (!aboutSectionData) {
        return null; // or render a fallback UI
    }

    const { title, thumbnail, description, ctaReference } = aboutSectionData;

    return (
        <section className="about w-screen min-h-screen flex flex-col justify-center bg-[#fafafa] text-[#312B22]">
            {/* CTA LINKS (ARRAY) */}
            {ctaReference?.length > 0 &&
                ctaReference
                    .filter(
                        (cta: any) =>
                            cta &&
                            cta.page &&
                            typeof cta.page.slug === 'string' &&
                            cta.page.slug.trim() !== ''
                    )
                    .map((cta: { page: { slug: string } }, idx: number) => {
                        const slug = cta.page.slug;
                        // Fallback for key and to if slug is missing (shouldn't happen due to filter)
                        const safeKey = slug || `cta-${idx}`;
                        const safeTo = slug ? `/${slug}` : '/';
                        return (
                            <Link
                                key={safeKey}
                                to={safeTo}
                                className="self-center"
                            >
                                <button
                                    aria-label="About section CTA button"
                                    className="cta-button bg-white text-black py-4 px-10 rounded-3xl
    shadow-[0_2px_10px_-4px_rgba(0,0,0,0.16)]
    cursor-pointer
    relative left-16"
                                >
                                    {/* ICON (default) */}
                                    <span
                                        className="
      absolute inset-0 flex items-center justify-center text-[0.7rem]

    "
                                    >
                                        Click me
                                    </span>
                                </button>
                                {thumbnail?.file?.url && (
                                    <img
                                        src={thumbnail.file.url}
                                        alt="painting"
                                        className="w-24 h-24 align-middle rounded-full border-4 border-blue-500 p-1 mb-8 "
                                    />
                                )}
                            </Link>
                        );
                    })}

            <h1 className=" tracking-tighter text-center items-center lg:text-3xl">
                {title}
            </h1>

            {description && (
                <div className="mt-6 text-2xl text-center max-w-2xl w-[70%] self-center lg:text-[3rem] leading-[1.1]">
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

            {/* <div className="h-[40%] object-cover">
                <img
                    src={thumbnail.url}
                    alt="painting"
                    className="self-center pt-10 w-[70%] h-full object-cover"
                />
            </div> */}
        </section>
    );
}
