import * as React from 'react';
import { graphql, useStaticQuery, navigate } from 'gatsby';
import BounceCards from './animations/BounceCards';

/* ---------------- TYPES ---------------- */

type TechStackItem = {
    title?: string;
    url?: string;
    icon?: { file?: { url?: string } };
    svg?: { url?: string };
};

type WorkImage = { file?: { url?: string } };

type Work = {
    slug: string;
    title: string;
    description: { raw: string };
    techStack: TechStackItem[];
    workImage: WorkImage[];
};

/* ---------------- COMPONENT ---------------- */

export default function WorkList() {
    const data = useStaticQuery(graphql`
        query {
            allContentfulWorks {
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
                    }
                    description {
                        raw
                    }
                    workImage {
                        file {
                            url
                        }
                    }
                    slug
                }
            }
        }
    `);

    const works: Work[] = data.allContentfulWorks.nodes;

    const transformStyles = [
        'rotate(10deg) translate(-170px)',
        'rotate(5deg) translate(-85px)',
        'rotate(-3deg)',
        'rotate(-10deg) translate(85px)',
        'rotate(2deg) translate(170px)'
    ];

    return (
        <>
            {works.map((work, index) => {
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

                const workImages: string[] =
                    work.workImage
                        ?.map((img) => img?.file?.url)
                        .filter(
                            (url): url is string => typeof url === 'string'
                        ) ?? [];

                return (
                    <li
                        key={index}
                        className="w-screen h-screen shrink-0 flex flex-col lg:flex-row items-center justify-around bg-black text-[#c4b8a5] px-10 pt-20"
                    >
                        <div className="flex flex-col items-center justify-center">
                            <h2
                                className="text-4xl lg:text-6xl font-bold mb-6 cursor-pointer"
                                onClick={() => navigate(`/work/${work.slug}`)}
                            >
                                {work.title}
                            </h2>
                            <p className="text-center max-w-2xl opacity-70 text-sm lg:text-lg w-[70%] md:w-[80%] md:mt-10">
                                {description}
                            </p>

                            <div className="flex gap-4 mt-10">
                                {work.techStack.map((tech, i) => {
                                    const iconUrl =
                                        tech?.icon?.file?.url || tech?.svg?.url;

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
                                                        alt={
                                                            tech.title ||
                                                            'External link'
                                                        }
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
                                            className="w-8 h-8 opacity-80"
                                        />
                                    ) : null;
                                })}
                            </div>
                        </div>

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
