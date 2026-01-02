import * as React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import RotatingText from './animations/RotatingText';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

export default function Hero() {
    const data = useStaticQuery(graphql`
        query {
            allContentfulHero {
                nodes {
                    welcomeText {
                        raw
                    }
                    techStack {
                        svg {
                            url
                        }
                    }
                    ctaText
                    profileImage {
                        url
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

    const heroNode = data?.allContentfulHero?.nodes?.[0];

    if (!heroNode) {
        // Rendera inget, eller en placeholder
        return null;
    }

    const {
        welcomeText,

        ctaText,
        profileImage,
        properties,
        ctaHover
    } = heroNode;

    return (
        <section className="hero-component flex flex-col justify-center items-center pb-4">
            <img
                src={profileImage?.url}
                alt="Profile"
                className="w-24 h-24 align-middle rounded-full border-4 border-white"
            />
            <div className="hero-text  flex flex-col justify-center items-center text-center ">
                {/* Så här renderar man rich text i contentful */}
                {welcomeText?.raw && (
                    <div className="welcome-text text-[3rem] lg:text-[4.5rem] tracking-tighter  text-[#312B22] mt-6 lowercase leading-[1.1] w-[60%]">
                        {documentToReactComponents(JSON.parse(welcomeText.raw))}
                    </div>
                )}

                <RotatingText
                    words={[
                        properties.name || '',
                        properties.secondProperties || '',
                        properties.thirdProperties || ''
                    ]}
                    interval={3000}
                    className="text-[3rem] lg:text-[4rem] lg:mt-2 pb-8"
                />
            </div>

            <div className="pt-6">
                <button
                    className="cta-button bg-black text-white py-6 px-14 rounded-3xl
    shadow-[0_12px_20px_-4px_rgba(0,0,0,0.86)]
    cursor-pointer
    relative overflow-hidden group"
                    onClick={() => {
                        document.getElementById('footer')?.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }}
                >
                    {/* ICON (default) */}
                    <span
                        className="
      absolute inset-0 flex items-center justify-center
      transition-all duration-300 ease-out
      opacity-100 translate-y-0
      group-hover:opacity-0 group-hover:-translate-y-1
    "
                    >
                        {ctaHover?.file?.url && (
                            <img
                                src={ctaHover.file.url}
                                alt="CTA hover"
                                width={20}
                                height={20}
                            />
                        )}
                    </span>
                    {/* TEXT ON HOVER */}
                    <span
                        className="
      absolute inset-0 flex items-center justify-center
      transition-all duration-300 ease-out
      opacity-0 translate-y-1
      group-hover:opacity-100 group-hover:translate-y-0
      tracking-wide text-sm
    "
                    >
                        {ctaText || 'Get in touch'}
                    </span>
                </button>
            </div>
        </section>
    );
}
