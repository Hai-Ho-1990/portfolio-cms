import * as React from 'react';
import Stepper, { StepItem } from '../components/animations/Stepper';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';
import { graphql, useStaticQuery } from 'gatsby';

/* =======================
   Experiences Component
======================= */

interface Experience {
    title: string;
    period: string;
    experience: string;
    startYear: number;
    thumbnail?: { gatsbyImageData: IGatsbyImageData }[];
}

export default function Experiences() {
    const data = useStaticQuery(graphql`
        query {
            allContentfulExperiences(sort: { fields: startYear, order: ASC }) {
                nodes {
                    experience
                    thumbnail {
                        gatsbyImageData(
                            placeholder: BLURRED
                            layout: CONSTRAINED
                        )
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
        <section className="w-screen flex items-center justify-start lg:pl-20 pr-4 bg-[#fafafa]">
            <Stepper>
                {experiencesData.map((experience: Experience) => (
                    <StepItem
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
                                (
                                    image: {
                                        gatsbyImageData: IGatsbyImageData;
                                    },
                                    index: number
                                ) =>
                                    image?.gatsbyImageData ? (
                                        <GatsbyImage
                                            key={`${experience.title}-${index}`}
                                            image={image.gatsbyImageData}
                                            alt={`${experience.title}`}
                                            className=" w-[60%] lg:w-[24%] rounded-lg mt-6 mx-auto object-fill"
                                        />
                                    ) : null
                            )}
                        </div>
                    </StepItem>
                ))}
            </Stepper>
        </section>
    );
}
