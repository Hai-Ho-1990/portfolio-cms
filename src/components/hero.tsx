import * as React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import RotatingText from './animations/RotatingText';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
// import SendIcon from '../images/send-white.svg';

/* =======================
   Hero Component
   =======================
   Ansvar:
   - Hämta hero-innehåll från Contentful
   - Rendera rich text
   - Visa optimerad profilbild
   - Visa roterande egenskaper
   - CTA-knapp som scrollar till footer
======================= */

export default function Hero() {
    /* =======================
       DATA FETCHING (CMS)
       =======================
       useStaticQuery körs vid build-time.
       Contentful returnerar alltid en array (nodes).
    ======================= */
    const data = useStaticQuery(graphql`
        query {
            allContentfulHero {
                nodes {
                    welcomeText {
                        raw
                    }
                    ctaText
                    profileImage {
                        gatsbyImageData(
                            placeholder: BLURRED
                            formats: [AUTO, WEBP, AVIF]
                            layout: CONSTRAINED
                        )
                    }
                    properties {
                        name
                        secondProperties
                        thirdProperties
                    }
                    ctaHover {
                        file {
                            url
                        }
                    }
                }
            }
        }
    `);

    /* =======================
       DATA SELECTION
       =======================
       Hero är unikt innehåll,
       därför används första objektet i arrayen.
       Optional chaining skyddar om data saknas.
    ======================= */
    const heroNode = data?.allContentfulHero?.nodes?.[0];

    /* =======================
       IMAGE HANDLING
       =======================
       getImage extraherar rätt bilddata
       till ett format som GatsbyImage kan använda.
    ======================= */
    const profileAvatar = getImage(heroNode?.profileImage);

    /* =======================
       SAFETY CHECK
       =======================
       Om ingen hero-data finns,
       renderas inget för att undvika fel.
    ======================= */
    if (!heroNode) return null;

    /* =======================
       DATA DESTRUCTURING
       ======================= */
    const { welcomeText, ctaText, properties, ctaHover } = heroNode;

    // Fallback for properties to prevent null reference
    const safeProperties = properties || {};

    return (
        <section className="hero-component flex flex-col justify-center items-center pb-4">
            {/* =======================
               PROFILE IMAGE
               =======================
               Renderas endast om bilddata finns.
            ======================= */}
            {profileAvatar && (
                <GatsbyImage
                    image={profileAvatar}
                    alt="Profile picture"
                    className="w-24 h-24 rounded-full border-4 border-white"
                />
            )}

            {/* =======================
               HERO TEXT CONTENT
               ======================= */}
            <div className="hero-text flex flex-col items-center text-center">
                {/* =======================
                   RICH TEXT (Contentful)
                   =======================
                   welcomeText.raw är JSON-string
                   → parsas och renderas till React.
                ======================= */}
                {welcomeText?.raw && (
                    <div className="welcome-text text-[3rem] lg:text-[4.5rem] tracking-tighter leading-[1.1] w-[60%]">
                        {(() => {
                            try {
                                return documentToReactComponents(
                                    JSON.parse(welcomeText.raw)
                                );
                            } catch (error) {
                                console.error(
                                    'Failed to parse welcome text:',
                                    error
                                );
                                return null;
                            }
                        })()}
                    </div>
                )}

                {/* =======================
                   ROTATING TEXT
                   =======================
                   Visar egenskaper/roller
                   med fallback-värden för säkerhet.
                ======================= */}
                <RotatingText
                    words={[
                        properties.name || '',
                        properties.secondProperties || '',
                        properties.thirdProperties || ''
                    ]}
                    interval={3000}
                    className="text-[3rem] lg:text-[4rem] pb-8"
                />
            </div>

            {/* =======================
               CALL TO ACTION (CTA)
               =======================
               Knapp med hover-animation
               som scrollar till footer.
            ======================= */}
            <div className="pt-6">
                <button
                    className="cta-button bg-black text-white py-6 px-14 rounded-3xl
                    shadow-[0_12px_20px_-4px_rgba(0,0,0,0.86)]
                    relative overflow-hidden group"
                    onClick={() => {
                        document.getElementById('footer')?.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }}
                >
                    {/* Default state – ikon */}
                    <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0">
                        {ctaHover?.file?.url && (
                            <img
                                src={`https:${ctaHover.file.url}`}
                                alt="CTA icon"
                                width={20}
                                height={20}
                            />
                        )}
                    </span>

                    {/* Hover state – text */}
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 text-sm">
                        {ctaText || 'Get in touch'}
                    </span>
                </button>
            </div>
        </section>
    );
}
