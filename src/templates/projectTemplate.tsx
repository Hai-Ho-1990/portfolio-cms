// =====================================================
// IMPORTER
// =====================================================
// React + hooks
import React, { useState } from 'react';

// Gatsby image utilities (optimerade bilder)
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';

// Gatsby navigation & GraphQL
import { navigate } from 'gatsby';
import { graphql, PageProps } from 'gatsby';

// Animation wrapper
import AnimatedContent from '../components/animations/AnimatedContent';

/* =====================================================
   TYPER
   =====================================================
   TypeScript-typer som speglar hur
   datan ser ut i Contentful.
*/

/**
 * Tech stack-item
 * Kan vara:
 * - vanlig ikon (svg)
 * - extern länk
 * - variant media
 */
type TechStackItem = {
    title?: string;
    url?: string;
    icon?: { file?: { url?: string }; url?: string };
    svg?: { url?: string };
};

/**
 * En sektion i projektet
 * (ex: Idea, Design, Frontend)
 */
type ProjectSection = {
    key: string; // används som ID & meny-nyckel
    title: string; // visas i menyn
    content: { content: string }; // textinnehåll
    techStack?: TechStackItem[]; // valfri tech per sektion
    thumbnail?: {
        gatsbyImageData?: IGatsbyImageData; // build-time (Gatsby GraphQL)
        url?: string; // SSR fallback (Contentful REST API)
    };
};

/**
 * workPage-struktur från Contentful
 * Innehåller alla sektioner
 */
type WorkPage = {
    projectName: ProjectSection[];
};

/**
 * GraphQL-sidans datatyp
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
 * ServerData-typ fran getServerData (SSR)
 * Samma struktur som PageData men utan gatsbyImageData
 */
type ServerDataWork = {
    slug: string;
    title: string;
    workPage?: WorkPage[];
    techStack: TechStackItem[];
};

/* =====================================================
   PROJECT TEMPLATE
   =====================================================
   Huvudkomponenten for varje projekt-sida.
   Renderas dynamiskt baserat pa slug.
   Prioriterar serverData (SSR) over static data.
*/
const ProjectTemplate: React.FC<PageProps<PageData> & { serverData?: { work?: ServerDataWork } }> = ({ data, serverData }) => {
    // -------------------------------------------------
    // Extraherar projektet: serverData forst, sedan static
    // -------------------------------------------------
    const work = serverData?.work || data.contentfulWorks;

    /* -------------------------------------------------
       workPage är en array i Contentful.
       Här:
       - tar vi första objektet
       - plockar ut projectName (sektionerna)
       - fallback till tom array om något saknas
    ------------------------------------------------- */
    const group =
        Array.isArray(work?.workPage) && work?.workPage[0]?.projectName
            ? work?.workPage[0].projectName
            : [];

    /* -------------------------------------------------
       STATE
       -------------------------------------------------
       activeMenu  → vilken sektion som är vald
       hoveredMenu → vilken sektion som hoveras
       visibleKey  → vilken sektion som visas visuellt
    ------------------------------------------------- */
    const [activeMenu, setActiveMenu] = useState(group[0]?.key ?? '');
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
    const visibleKey = hoveredMenu ?? activeMenu;

    // -------------------------------------------------
    // Säkerhets-checks
    // -------------------------------------------------
    if (!work) return <p>Projekt hittades inte</p>;
    if (group.length === 0)
        return <p>Inga sektioner hittades för detta projekt.</p>;

    return (
        <>
            {/* =================================================
                HUVUDSEKTION
               ================================================= */}
            <section className="w-screen min-h-screen lg:h-screen bg-black text-[#c4b8a5] lg:overflow-hidden">
                {/* -------------------------------------------------
                   RETURN-KNAPP
                   -------------------------------------------------
                   Tar användaren tillbaka till work-översikten
                */}
                <button
                    onClick={() => navigate('/work')}
                    aria-label="Return to work page"
                    className="fixed left-5 top-5 md:left-10 font-semibold text-[#c4b8a5] rounded-xl shadow-lg flex items-center gap-2 text-[0.7rem] md:text-sm uppercase"
                >
                    <p>Return</p>
                </button>

                {/* -------------------------------------------------
                   PROJEKTETS TITEL + INTRO
                ------------------------------------------------- */}
                <h1 className="text-center font-bold text-2xl pt-5">
                    {work.title}
                </h1>
                <p className="text-center text-xs lg:text-base pt-5">
                    The tech stack used in this project includes:
                </p>

                {/* -------------------------------------------------
                   TECH STACK (GLOBAL FÖR PROJEKTET)
                ------------------------------------------------- */}
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

                {/* =================================================
                   PROJEKTSEKTIONER
                   ================================================= */}
                <div className="project-template pt-16 flex flex-col items-center">
                    <div className="flex flex-col lg:flex-row gap-14 items-center lg:items-start">
                        {/* --------------------------------------------
                           MENY (SEKTIONER)
                           --------------------------------------------
                           Klick = aktiv sektion
                           Hover = förhandsvisning
                        */}
                        <div className="lg:w-[42vw] flex flex-row lg:flex-col gap-6">
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
                                        className={
                                            'rounded-xl text-left px-2 lg:px-4 py-2 lg:py-9 transition-all duration-300 ' +
                                            (isActive
                                                ? 'bg-[#c4b8a5] text-black'
                                                : 'hover:text-black hover:bg-[#c4b8a5]')
                                        }
                                    >
                                        <h4 className="uppercase font-bold text-[0.7rem] lg:text-lg">
                                            {item.title}
                                        </h4>
                                        {/* Beskrivning visas endast på desktop */}
                                        <p className="text-sm leading-6 mt-2 lg:block hidden">
                                            {item.content?.content}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* --------------------------------------------
                           INNEHÅLL / THUMBNAIL
                           --------------------------------------------
                           Visar endast den sektion som
                           matchar visibleKey
                        */}
                        {group.map(
                            (item) =>
                                item.key === visibleKey && (
                                    <AnimatedContent
                                        key={item.key}
                                        className="lg:w-[35vw] w-[80vw]"
                                    >
                                        <section>
                                            {/* Mobiltext */}
                                            <p className="text-xs lg:hidden text-center mt-10">
                                                {item.content?.content}
                                            </p>

                                            {/* Thumbnail-bild */}
                                            <div className="flex justify-center">
                                                {item.thumbnail
                                                    ?.gatsbyImageData ? (
                                                    <GatsbyImage
                                                        image={
                                                            item.thumbnail
                                                                .gatsbyImageData
                                                        }
                                                        alt={item.title}
                                                        className="rounded-xl mt-10"
                                                    />
                                                ) : item.thumbnail?.url ? (
                                                    <img
                                                        src={
                                                            item.thumbnail.url.startsWith('//')
                                                                ? `https:${item.thumbnail.url}`
                                                                : item.thumbnail.url
                                                        }
                                                        alt={item.title}
                                                        className="rounded-xl mt-10"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <p className="uppercase text-2xl font-bold mt-10">
                                                        No image available
                                                    </p>
                                                )}
                                            </div>
                                        </section>
                                    </AnimatedContent>
                                )
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProjectTemplate;

/* =====================================================
   GRAPHQL QUERY
   =====================================================
   Hämtar:
   - Ett specifikt projekt via slug
   - Alla sektioner (projectName)
   - Projektets globala tech stack
*/
export const query = graphql`
    query ($slug: String!) {
        contentfulWorks(slug: { eq: $slug }) {
            slug
            title
            workPage {
                projectName {
                    key
                    content {
                        content
                    }
                    title
                    thumbnail {
                        gatsbyImageData(
                            placeholder: BLURRED
                            formats: [AUTO, WEBP, AVIF]
                            layout: CONSTRAINED
                        )
                    }
                }
            }
            techStack {
                ... on ContentfulTechStack {
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

/* =====================================================
   SERVER-SIDE RENDERING
   =====================================================
   getServerData kors vid varje request for dynamiska
   projekt-sidor. Hamtar projektet via slug fran
   Contentful REST API och resolver alla referenser.
===================================================== */
export async function getServerData({ params, pageContext }: { params: Record<string, string>, pageContext: Record<string, string> }) {
    try {
        const { fetchContentful, buildAssetMap, buildEntryMap, resolveLink } =
            await import('../utils/contentful');

        const slug = pageContext.slug || params.slug || params['*'];

        // Hamta works-entry med matchande slug
        const result = await fetchContentful({
            content_type: 'musicalWork',
            'fields.slug': slug,
            include: '10',
            limit: '1',
        });

        const entry = result.items?.[0];
        if (!entry) {
            return { props: { work: null } };
        }

        const assetMap = buildAssetMap(result.includes);
        const entryMap = buildEntryMap(result.includes);

        // Resolva tech stack (blandning av olika content types)
        const techStack: TechStackItem[] = [];
        if (Array.isArray(entry.fields?.techStack)) {
            for (const ref of entry.fields.techStack) {
                const resolved = ref?.sys ? resolveLink(ref, assetMap, entryMap) : null;
                if (!resolved) continue;

                const contentTypeId = resolved.sys?.contentType?.sys?.id;
                const fields = resolved.fields || {};

                if (contentTypeId === 'techStack') {
                    // ContentfulTechStack: har svg-referens (asset)
                    const svgAsset = fields.svg?.sys
                        ? resolveLink(fields.svg, assetMap, entryMap)
                        : null;
                    techStack.push({
                        title: fields.title,
                        svg: svgAsset?.fields?.file
                            ? { url: svgAsset.fields.file.url }
                            : undefined,
                    });
                } else if (contentTypeId === 'externalLink') {
                    // ContentfulExternalLink: har icon (asset) + url
                    const iconAsset = fields.icon?.sys
                        ? resolveLink(fields.icon, assetMap, entryMap)
                        : null;
                    techStack.push({
                        title: fields.title,
                        url: fields.url,
                        icon: iconAsset?.fields?.file
                            ? { file: { url: iconAsset.fields.file.url } }
                            : undefined,
                    });
                } else if (contentTypeId === 'variantMedia') {
                    // ContentfulVariantMedia: har icon (asset)
                    const iconAsset = fields.icon?.sys
                        ? resolveLink(fields.icon, assetMap, entryMap)
                        : null;
                    techStack.push({
                        title: fields.title,
                        icon: iconAsset?.fields?.file
                            ? { url: iconAsset.fields.file.url }
                            : undefined,
                    });
                }
            }
        }

        // Resolva workPage -> projectName sektioner
        const workPageEntries: WorkPage[] = [];
        if (Array.isArray(entry.fields?.workPage)) {
            for (const wpRef of entry.fields.workPage) {
                const wpEntry = wpRef?.sys
                    ? resolveLink(wpRef, assetMap, entryMap)
                    : null;
                if (!wpEntry?.fields?.projectName) continue;

                const sections: ProjectSection[] = [];
                for (const secRef of wpEntry.fields.projectName) {
                    const secEntry = secRef?.sys
                        ? resolveLink(secRef, assetMap, entryMap)
                        : null;
                    if (!secEntry) continue;

                    // Resolva thumbnail (asset)
                    const thumbAsset = secEntry.fields?.thumbnail?.sys
                        ? resolveLink(secEntry.fields.thumbnail, assetMap, entryMap)
                        : null;

                    sections.push({
                        key: secEntry.fields?.key || secEntry.sys.id,
                        title: secEntry.fields?.title || '',
                        content: {
                            content: secEntry.fields?.content || '',
                        },
                        thumbnail: thumbAsset?.fields?.file
                            ? { url: thumbAsset.fields.file.url }
                            : undefined,
                    });
                }

                workPageEntries.push({ projectName: sections });
            }
        }

        const work: ServerDataWork = {
            slug: entry.fields?.slug || slug,
            title: entry.fields?.title || '',
            workPage: workPageEntries.length > 0 ? workPageEntries : undefined,
            techStack,
        };

        return { props: { work } };
    } catch (error) {
        console.error('getServerData error (projectTemplate):', error);
        return { props: { work: null } };
    }
}
