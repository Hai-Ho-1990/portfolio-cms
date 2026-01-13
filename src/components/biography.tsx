import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
// Komponent som används för att animera innehåll (t.ex. fade/slide in)
import AnimatedContent from '../components/animations/AnimatedContent';
// GatsbyImage = optimerad bild, getImage = hämtar rätt bilddata från Contentful
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

export default function Biography() {
    /**
     * useStaticQuery körs vid build-time i Gatsby
     * och hämtar data från Contentful via GraphQL
     */
    const data = useStaticQuery(graphql`
        query {
            allContentfulAboutMePage {
                nodes {
                    avatar {
                        gatsbyImageData(
                            placeholder: BLURRED
                            formats: [AUTO, WEBP, AVIF]
                            layout: CONSTRAINED
                        )
                    }
                    biography {
                        biography
                    }
                    title
                    name
                    position
                }
            }
        }
    `);

    /**
     * Tar första objektet i arrayen (index 0)
     * Optional chaining (?.) skyddar om data saknas
     */
    const aboutData = data.allContentfulAboutMePage?.nodes?.[0];

    /**
     * getImage omvandlar Contentful-bildobjektet
     * till ett format som GatsbyImage kan använda
     */
    const avatarImage = getImage(aboutData?.avatar);

    /**
     * Om ingen data finns → rendera ingenting
     * Förhindrar att komponenten kraschar
     */
    if (!aboutData) {
        return null;
    }

    // Plockar ut fälten för enklare användning i JSX
    const { name, position, biography, title } = aboutData;

    return (
        <div className="about-page w-screen flex flex-col items-center bg-[#fafafa] text-[#312B22]">
            {/* ================= HERO / INTRO SECTION ================= */}
            <section className="max-w-4xl h-screen w-[80%] flex flex-col justify-center">
                {/* Titel / Hero-text från Contentful */}
                <h1 className="tracking-tighter text-start text-4xl lg:text-8xl lowercase">
                    {title}
                </h1>

                {/* AnimatedContent ger animation när innehållet visas */}
                <AnimatedContent>
                    <div className="flex gap-4 mt-10">
                        {/* Visar avatar endast om bild finns */}
                        {avatarImage && (
                            <GatsbyImage
                                image={avatarImage}
                                alt={`${name}'s profile picture`}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        )}

                        {/* Namn och position */}
                        <div className="flex flex-col items-start">
                            <h2 className="text-sm tracking-tighter font-bold">
                                {name}
                            </h2>
                            <p className="text-sm">{position}</p>
                        </div>
                    </div>

                    {/* Biografi-text (renderas endast om den finns) */}
                    {biography?.biography && (
                        <p className="max-w-4xl lg:text-2xl leading-[1.3] mt-6 italic">
                            {`"${biography.biography}"`}
                        </p>
                    )}
                </AnimatedContent>
            </section>
        </div>
    );
}
