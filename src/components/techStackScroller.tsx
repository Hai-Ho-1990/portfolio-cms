import * as React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { useEffect, useState } from 'react';

type TechItem = {
    svg: {
        url: string;
    };
};

export default function TechStackScroller() {
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

    const techStack: TechItem[] =
        data.allContentfulHero.nodes[0]?.techStack ?? [];

    const [filledIcons, setFilledIcons] = useState<TechItem[]>([]);

    useEffect(() => {
        if (!techStack.length) return;

        const fillIcons = () => {
            const iconWidth = 60; // ikon + gap
            const screenWidth = window.innerWidth;
            const repeats = Math.ceil(
                (screenWidth * 6) / (techStack.length * iconWidth)
            );

            const repeatedIcons = Array.from(
                { length: repeats },
                () => techStack
            ).flat();

            setFilledIcons(repeatedIcons);
        };

        fillIcons();
        window.addEventListener('resize', fillIcons);
        return () => window.removeEventListener('resize', fillIcons);
    }, [techStack]);

    if (!techStack.length) return null;

    return (
        <section className="techStack-section bg-[#f8f9fa] py-5 overflow-hidden ">
            <div className="scroll-container relative w-full">
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
