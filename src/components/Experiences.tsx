import * as React from 'react';
import Stepper, { Step } from '../components/animations/Stepper';

import { graphql, useStaticQuery } from 'gatsby';

/* =======================
   Experiences Component
======================= */

interface ContentfulImage {
    file: {
        url: string;
    };
}

interface Experience {
    title: string;
    period: string;
    experience: string;
    startYear: number;
    thumbnail?: ContentfulImage[];
}

export default function Experiences() {
    const data = useStaticQuery(graphql`
        query {
            allContentfulExperiences(sort: { fields: startYear, order: ASC }) {
                nodes {
                    experience
                    thumbnail {
                        file {
                            url
                        }
                    }
                    title
                    period
                    startYear
                }
            }
        }
    `);
    const experiencesData = data.allContentfulExperiences?.nodes || [];

    return (
        <section className="w-screen flex items-center justify-start pl-20 pr-4 bg-[#fafafa]">
            <Stepper>
                {experiencesData.map((experience: Experience) => (
                    <Step
                        key={`${experience.title}-${experience.startYear}`} // ✅ UNIK
                        title={experience.period}
                    >
                        <h2 className="lg:text-2xl font-semibold mb-2">
                            {experience.title}
                        </h2>
                        <p className="max-w-4xl text-xs md:text-sm lg:text-md">
                            {experience.experience}
                        </p>
                        <div className="flex flex-row mt-4">
                            {experience.thumbnail?.map(
                                (image: ContentfulImage) =>
                                    image?.file?.url ? (
                                        <img
                                            key={image.file.url} // ✅ UNIK
                                            src={`https:${image.file.url}`}
                                            alt={`${experience.title}`}
                                            className="w-[24%] rounded-lg mt-6 mx-auto object-fill"
                                        />
                                    ) : null
                            )}
                        </div>
                    </Step>
                ))}
            </Stepper>
        </section>
    );
}
