// Importerar React och useState-hooken för att hantera state
import React, { useState } from 'react';

import { navigate } from 'gatsby';
import AnimatedContent from '../components/animations/AnimatedContent';

// Importerar graphql och PageProps från Gatsby
import { graphql, PageProps } from 'gatsby';

/**---------------- TYPER ---------------- */

/**
 * Typ för varje item i tech stacken
 */
type TechStackItem = {
    title?: string;
    url?: string;
    icon?: { file?: { url?: string }; url?: string }; // ExternalLink or VariantMedia
    svg?: { url?: string };
};

/**
 * Typ för varje sektion i projektet
 * (ex. Idea, Frontend, Backend)
 */
type ProjectSection = {
    key: string; // unikt ID, t.ex. "idea"
    title: string; // rubrik som visas i menyn
    content: { content: string }; // innehållet från Contentful
    techStack?: TechStackItem[]; // valfri tech stack för sektionen
    thumbnail?: { url?: string }; // valfri thumbnail-bild för sektionen
};

/**
 * Typ för workPage-strukturen
 * Innehåller en lista av projektsektioner
 */
type WorkPage = {
    projectName: ProjectSection[];
};

/**
 * Typ för datan som kommer från GraphQL-queryn
 */
type PageData = {
    contentfulWorks: {
        slug: string;
        title: string;
        workPage?: WorkPage[];
        techStack: TechStackItem[];
        thumbnail?: { url?: string };
    };
};

/**
 * Huvudkomponenten för projektsidan
 */
const ProjectTemplate: React.FC<PageProps<PageData>> = ({ data }) => {
    // Hämtar projektet från GraphQL-datan
    const work = data.contentfulWorks;

    /**
     * workPage är en array i Contentful,
     * så vi plockar första objektet och dess projectName.
     * Om något saknas → fallback till tom array.
     */
    const group =
        Array.isArray(work?.workPage) && work?.workPage[0]?.projectName
            ? work?.workPage[0].projectName
            : [];

    /**
     * State som håller vilken meny som är aktiv.
     * Default = första objektet i listan.
     */
    const [activeMenu, setActiveMenu] = useState(group[0]?.key ?? '');
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
    const visibleKey = hoveredMenu ?? activeMenu;

    // Om projektet inte finns → visa felmeddelande
    if (!work) return <p>Projekt hittades inte</p>;

    // Om inga sektioner finns
    if (group.length === 0)
        return <p>Inga sektioner hittades för detta projekt.</p>;

    return (
        <>
            <section className="w-screen h-screen bg-black text-[#c4b8a5] overflow-hidden">
                {/* Return to previous page */}

                <button
                    onClick={() => navigate('/work')} // Gatsby navigate
                    aria-label="Return to work page"
                    className="fixed left-5 top-5  md:left-10 font-semibold text-[#c4b8a5] rounded-xl shadow-lg flex items-center gap-2 text-xs md:text-sm uppercase"
                >
                    <p>Return</p>
                    <svg
                        viewBox="0 0 512 512"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#c4b8a5"
                        width={25}
                    >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                            <title>ionicons-v5-c</title>
                            <polyline
                                points="112 352 48 288 112 224"
                                style={{
                                    fill: 'none',
                                    stroke: '#c4b8a5',
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    strokeWidth: '20px'
                                }}
                            ></polyline>
                            <path
                                d="M64,288H358c58.76,0,106-49.33,106-108V160"
                                style={{
                                    fill: 'none',
                                    stroke: '#c4b8a5',
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    strokeWidth: '20px'
                                }}
                            ></path>
                        </g>
                    </svg>
                </button>

                <h1 className="text-center font-bold text-2xl pt-5">
                    {work.title}
                </h1>
                <h1 className="text-center text-sm lg:text-md pt-5">
                    {' '}
                    The tech stack used in this project includes:
                </h1>

                {/* // Tech stack för hela projektet */}
                <div className="tech-stack flex gap-4 mt-5 items-center justify-center">
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
                                    title={tech.title}
                                    className="opacity-80 hover:opacity-100 transition"
                                >
                                    {iconUrl && (
                                        <img
                                            src={iconUrl}
                                            alt={tech.title || 'External link'}
                                            className="w-5 h-5 lg:w-7 lg:h-7"
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
                                className="w-5 h-5 lg:w-7 lg:h-7 opacity-80"
                            />
                        ) : null;
                    })}
                </div>
                {/* Projektdetaljer */}
                <div className="project-template  pt-16 ">
                    <div className="flex flex-col lg:flex-row justify-center items-start">
                        {/* MENYKNAPPAR */}
                        {/* Projekttitel */}
                        <div className="lg:w-[42vw] flex flex-row justify-center self-center lg:flex-col gap-6">
                            {group.map((item) => {
                                const isActive = item.key === activeMenu;

                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => setActiveMenu(item.key)}
                                        onMouseEnter={() =>
                                            setHoveredMenu(item.key)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredMenu(null)
                                        }
                                        aria-label={item.title}
                                        className={
                                            'rounded-xl text-left px-2 lg:px-4 py-2 lg:py-9 transition-all duration-300 ' +
                                            (isActive
                                                ? 'bg-[#c4b8a5] text-black'
                                                : 'hover:text-black hover:bg-[#c4b8a5]')
                                        }
                                    >
                                        <h4 className="uppercase font-bold text-xs lg:text-lg">
                                            {item.title}
                                        </h4>
                                        <p className=" text-sm leading-6 mt-2 lg:block hidden">
                                            {item.content.content}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                        {/* THUMBNAIL */}
                        {group.map(
                            (item) =>
                                item.key === visibleKey && (
                                    <AnimatedContent
                                        key={item.key}
                                        className="lg:w-[35vw]"
                                        distance={20}
                                        direction="vertical"
                                        reverse={false}
                                        duration={0.8}
                                        initialOpacity={1}
                                        animateOpacity
                                        scale={1}
                                        threshold={0.6}
                                        delay={0}
                                    >
                                        <section key={item.key}>
                                            <p className="text-xs lg:text-sm leading-6 mt-10 block lg:hidden text-center w-[80%] items-center mx-auto">
                                                {item.content.content}
                                            </p>
                                            {item.thumbnail?.url ? (
                                                <img
                                                    src={item.thumbnail.url}
                                                    alt={`${item.title} thumbnail`}
                                                    className="w-[50%] lg:w-[85%]  object-cover rounded-xl mb-4  mt-10 lg:mt-0 mx-auto"
                                                />
                                            ) : (
                                                <p className="uppercase text-2xl lg:text-3xl text-[#c4b8a5] font-bold opacity-90 text-center ">
                                                    No image available
                                                </p>
                                            )}
                                        </section>
                                    </AnimatedContent>
                                )
                        )}
                    </div>

                    {/* INNEHÅLL SOM VISAS BASERAT PÅ AKTIV MENY */}
                    {/* <div className="block lg:hidden">
                        {group.map(
                            (item) =>
                                item.key === activeMenu && (
                                    <section key={item.key}>
                                        <h2>{item.title}</h2>
                                        <p>{item.content.content}</p>
                                    </section>
                                )
                        )}
                    </div> */}
                </div>
            </section>
        </>
    );
};

export default ProjectTemplate;

/**
 * GraphQL-query som hämtar:
 * - projekt baserat på slug
 * - workPage → projectName (sektionerna)
 * - Hämta det contentfulWorks-objekt där slug är exakt lika med värdet i $slug.
 */
export const query = graphql`
    query ($slug: String!) {
        contentfulWorks(slug: { eq: $slug }) {
            slug
            title
            workPage {
                projectName {
                    key
                    project
                    content {
                        content
                    }
                    title
                    thumbnail {
                        url
                    }
                }
            }
            techStack {
                ... on ContentfulTechStack {
                    techStack
                    svg {
                        url
                    }
                }
                ... on ContentfulExternalLink {
                    icon {
                        file {
                            url
                        }
                    }

                    url
                }
                ... on ContentfulVariantMedia {
                    icon {
                        url
                    }
                }
            }
        }
    }
`;
