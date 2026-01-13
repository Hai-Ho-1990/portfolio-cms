import * as React from 'react';
import { useState } from 'react';
import { graphql, useStaticQuery, Link } from 'gatsby';
import BounceCards from './animations/BounceCards';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';

/* =====================================================
   TYPER FÖR CMS-DATA
   =====================================================
   Dessa typer beskriver exakt hur datan
   ser ut som kommer från Contentful via GraphQL.
   De används för bättre typkontroll i TypeScript.
*/

/* Tech stack kan bestå av flera olika Contentful-typer */
type TechStackItem = {
    title?: string;
    url?: string; // Finns om det är en extern länk
    icon?: { file?: { url?: string }; url?: string };
    svg?: { url?: string };
};

/* Wrapper runt GatsbyImage-data */
type WorkImage = {
    gatsbyImageData: IGatsbyImageData;
};

/* Ett enskilt projekt (work) */
type Work = {
    slug: string;
    title: string;
    description: { raw: string }; // Rich text från Contentful
    techStack: TechStackItem[];
    workImage: WorkImage[];
};

/* =====================================================
   PROPS
   =====================================================
   isMobile används för att avgöra
   vilken layout som ska renderas:
   - true  → mobil (vertikal)
   - false → desktop (horisontell)
*/
type WorkListProps = {
    isMobile: boolean;
};

/* =====================================================
   WORKLIST-KOMPONENT
   =====================================================
   Ansvarar för att rendera alla projekt
   från Contentful, med olika layout
   beroende på skärmstorlek.
*/
export default function WorkList({ isMobile }: WorkListProps) {
    /* =================================================
       STATE
       =================================================
       activeWork används endast på mobil:
       - håller koll på vilket projekt som är "aktivt"
       - används för att trigga animation via klick
    */
    const [activeWork, setActiveWork] = useState<string | null>(null);

    /* =================================================
       GRAPHQL QUERY
       =================================================
       Hämtar alla projekt från Contentful
       sorterade efter projectOrder.
    */
    const data = useStaticQuery(graphql`
        query {
            allContentfulWorks(sort: { fields: projectOrder, order: ASC }) {
                nodes {
                    title
                    techStack {
                        ... on ContentfulExternalLink {
                            title
                            url
                            icon {
                                file {
                                    url
                                }
                            }
                        }
                        ... on ContentfulTechStack {
                            svg {
                                url
                            }
                        }
                        ... on ContentfulVariantMedia {
                            icon {
                                url
                            }
                        }
                    }
                    description {
                        raw
                    }
                    workImage {
                        gatsbyImageData(
                            placeholder: BLURRED
                            formats: [AUTO, WEBP, AVIF]
                            layout: CONSTRAINED
                        )
                    }
                    slug
                    projectOrder
                }
            }
        }
    `);

    /* =================================================
       EXTRAHERAR PROJEKTEN
       =================================================
       nodes innehåller själva listan med projekt.
    */
    const works: Work[] = data.allContentfulWorks.nodes;

    /* Om inga projekt finns – rendera ingenting */
    if (!works.length) return null;

    /* =================================================
       TRANSFORM-STYLES FÖR BOUNCECARDS
       =================================================
       Dessa strängar används för att placera
       och rotera korten visuellt.
       Desktop och mobil har olika värden.
    */
    const transformStyles = [
        'rotate(10deg) translate(-170px)',
        'rotate(5deg) translate(-85px)',
        'rotate(-3deg)',
        'rotate(-10deg) translate(85px)',
        'rotate(2deg) translate(170px)'
    ];

    const mobileTransformStyles = [
        'rotate(8deg) translate(-60px)',
        'rotate(4deg) translate(-30px)',
        'rotate(-2deg)',
        'rotate(-8deg) translate(30px)',
        'rotate(3deg) translate(60px)'
    ];

    /* =================================================
       MOBIL: KLICKHANTERING
       =================================================
       Klick på ett projekt:
       - aktiverar animation
       - klick igen stänger den
    */
    const handleMobileClick = (slug: string) => {
        setActiveWork(activeWork === slug ? null : slug);
    };

    /* =================================================
       MOBIL-LAYOUT
       =================================================
       - Vertikal scroll
       - Ett projekt per sektion
       - Klick istället för hover
    */
    if (isMobile) {
        return (
            <>
                {works.map((work) => {
                    /* =====================================
                       EXTRAHERAR EN KORT BESKRIVNING
                       =====================================
                       Plockar första textnoden från
                       Contentful rich text.
                    */
                    let description = '';
                    try {
                        const richText = JSON.parse(work.description.raw);
                        description =
                            richText?.content?.[0]?.content?.[0]?.value ?? '';
                    } catch (error) {
                        console.error(
                            `Failed to parse description for work: ${work.slug}`,
                            error
                        );
                    }

                    /* =====================================
                       BILDER TILL BOUNCECARDS
                       ===================================== */
                    const workImages = work.workImage.map(
                        (img) => img.gatsbyImageData
                    );

                    const isActive = activeWork === work.slug;

                    return (
                        <section
                            key={work.slug}
                            className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-[#c4b8a5] px-6 py-10"
                        >
                            <div className="flex flex-col items-center justify-center max-w-md gap-8">
                                {/* Klickbara bilder */}
                                {workImages.length > 0 && (
                                    <div
                                        className="w-full flex items-center justify-center cursor-pointer"
                                        onClick={() =>
                                            handleMobileClick(work.slug)
                                        }
                                    >
                                        <BounceCards
                                            images={workImages}
                                            containerWidth={280}
                                            containerHeight={350}
                                            enableHover={false}
                                            transformStyles={
                                                mobileTransformStyles
                                            }
                                            animationDelay={0.5}
                                            animationStagger={0.06}
                                            easeType="power2.out"
                                            forceHover={isActive}
                                        />
                                    </div>
                                )}

                                {/* Textinnehåll */}
                                <div className="flex flex-col items-center">
                                    <Link
                                        to={`/work/${work.slug}`}
                                        className="text-3xl font-bold mb-4 text-center"
                                    >
                                        <h2>{work.title}</h2>
                                    </Link>

                                    <p className="text-center opacity-70 text-sm px-4 mb-6">
                                        {description}
                                    </p>

                                    {/* Tech stack-ikoner */}
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {work.techStack.map((tech, i) => {
                                            const iconUrl =
                                                tech?.icon?.file?.url ||
                                                tech?.icon?.url ||
                                                tech?.svg?.url;

                                            if (tech.url) {
                                                return (
                                                    <a
                                                        key={i}
                                                        href={tech.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={
                                                            tech.title ||
                                                            'External link'
                                                        }
                                                    >
                                                        {iconUrl && (
                                                            <img
                                                                src={`https:${iconUrl}`}
                                                                alt={
                                                                    tech.title ||
                                                                    ''
                                                                }
                                                                className="w-7 h-7"
                                                            />
                                                        )}
                                                    </a>
                                                );
                                            }

                                            return iconUrl ? (
                                                <img
                                                    key={i}
                                                    src={iconUrl}
                                                    alt={tech.title || ''}
                                                    className="w-7 h-7"
                                                />
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </>
        );
    }

    /* =================================================
       DESKTOP-LAYOUT
       =================================================
       - Horisontella fullscreen-slides
       - Hover-baserade animationer
    */
    return (
        <>
            {works.map((work) => {
                let description = '';
                try {
                    const richText = JSON.parse(work.description.raw);
                    description =
                        richText?.content?.[0]?.content?.[0]?.value ?? '';
                } catch (error) {
                    console.error(
                        `Failed to parse description for work: ${work.slug}`,
                        error
                    );
                }

                const workImages = work.workImage.map(
                    (img) => img.gatsbyImageData
                );

                return (
                    <li
                        key={work.slug}
                        className="w-screen h-screen shrink-0 flex flex-row items-center justify-around bg-black text-[#c4b8a5] px-10"
                    >
                        {/* Textsektion */}
                        <div className="flex flex-col items-center justify-center">
                            <Link
                                to={`/work/${work.slug}`}
                                className="text-6xl font-bold mb-6"
                            >
                                <h2>{work.title}</h2>
                            </Link>

                            <p className="text-center max-w-2xl opacity-70 text-lg mt-10">
                                {description}
                            </p>

                            {/* Tech stack */}
                            <div className="flex gap-4 mt-10">
                                {work.techStack.map((tech, i) => {
                                    const iconUrl =
                                        tech?.icon?.file?.url ||
                                        tech?.icon?.url ||
                                        tech?.svg?.url;

                                    if (tech.url) {
                                        return (
                                            <a
                                                key={i}
                                                href={tech.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {iconUrl && (
                                                    <img
                                                        src={`https:${iconUrl}`}
                                                        alt={tech.title || ''}
                                                        className="w-8 h-8"
                                                    />
                                                )}
                                            </a>
                                        );
                                    }

                                    return iconUrl ? (
                                        <img
                                            key={i}
                                            src={iconUrl}
                                            alt={tech.title || ''}
                                            className="w-8 h-8"
                                        />
                                    ) : null;
                                })}
                            </div>
                        </div>

                        {/* Bildanimation */}
                        {workImages.length > 0 && (
                            <BounceCards
                                images={workImages}
                                containerWidth={400}
                                containerHeight={500}
                                enableHover
                                transformStyles={transformStyles}
                                animationDelay={1}
                                animationStagger={0.08}
                                easeType="elastic.out(1, 0.5)"
                            />
                        )}
                    </li>
                );
            })}
        </>
    );
}
