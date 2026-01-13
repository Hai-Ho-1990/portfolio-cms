import * as React from 'react';
// Stepper = wrapper-komponent, StepItem = varje steg i tidslinjen
import Stepper, { StepItem } from '../components/animations/Stepper';
// GatsbyImage = optimerad bild, IGatsbyImageData = TypeScript-typ
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';
import { graphql, useStaticQuery } from 'gatsby';

/* =======================
   Experiences Component
   Visar erfarenheter i en tidslinje (Stepper)
======================= */

/**
 * TypeScript-interface som beskriver
 * hur ett experience-objekt ska se ut
 */
interface Experience {
    title: string; // Titel på erfarenheten
    period: string; // Tidsperiod (t.ex. 2022–2023)
    experience: string; // Beskrivning
    startYear: number; // Startår (används för sortering)
    thumbnail?: {
        // Valfri lista med bilder
        gatsbyImageData: IGatsbyImageData;
    }[];
}

export default function Experiences() {
    /**
     * useStaticQuery körs vid build-time
     * Hämtar alla experiences från Contentful
     * Sorteras stigande efter startYear
     */
    const data = useStaticQuery(graphql`
        query {
            allContentfulExperiences(sort: { fields: startYear, order: ASC }) {
                nodes {
                    experience
                    thumbnail {
                        gatsbyImageData(
                            placeholder: BLURRED
                            formats: [AUTO, WEBP, AVIF]
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

    /**
     * Hämtar arrayen med experiences
     * Om data saknas → använd tom array
     * (förhindrar .map()-fel)
     */
    const experiencesData = data.allContentfulExperiences?.nodes || [];

    return (
        <section className="w-screen flex items-center justify-start lg:pl-20 pr-4 bg-[#fafafa]">
            {/* Stepper-komponent som hanterar layout & animation */}
            <Stepper>
                {/* Loopar igenom alla experiences */}
                {experiencesData.map((experience: Experience) => (
                    <StepItem
                        /**
                         * key måste vara unikt i React
                         * Här kombineras title + startYear
                         */
                        key={`${experience.title}-${experience.startYear}`}
                        title={experience.period} // Visas i steppern
                    >
                        {/* Titel */}
                        <h2 className="lg:text-2xl font-semibold mb-2">
                            {experience.title}
                        </h2>

                        {/* Beskrivning */}
                        <p className="max-w-4xl text-xs md:text-sm lg:text-md">
                            {experience.experience}
                        </p>

                        {/* Bilder kopplade till experience */}
                        <div className="flex flex-row mt-4">
                            {experience.thumbnail?.map(
                                (
                                    image: {
                                        gatsbyImageData: IGatsbyImageData;
                                    },
                                    index: number
                                ) =>
                                    // Rendera endast om bilddata finns
                                    image?.gatsbyImageData ? (
                                        <GatsbyImage
                                            key={`${experience.title}-${index}`}
                                            image={image.gatsbyImageData}
                                            alt={`${experience.title}`}
                                            className="w-[60%] lg:w-[24%] rounded-lg mt-6 mx-auto object-fill"
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
