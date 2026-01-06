import * as React from 'react';
import { useState } from 'react';
import Experiences from '../components/Experiences';
import FooterComponent from '../components/footerComponent';
import { useSmoothScroll } from '../hook/smoothScroll';
import { graphql, useStaticQuery } from 'gatsby';

export default function About() {
    useSmoothScroll();
    useSmoothScroll();

    const data = useStaticQuery(graphql`
        query {
            allContentfulAboutMePage {
                nodes {
                    avatar {
                        file {
                            url
                        }
                    }
                    biography {
                        biography
                    }
                    title
                }
            }
        }
    `);

    const aboutData = data.allContentfulAboutMePage?.nodes?.[0];

    if (!aboutData) {
        return null; // or render a fallback UI
    }

    const { avatar, biography, title } = aboutData;

    return (
        <div className="about-page w-full flex flex-col items-center bg-[#fafafa] text-[#312B22]">
            {/* Hero / Intro Section */}
            <section className="max-w-4xl h-screen flex flex-col justify-center ">
                <h1 className=" tracking-tighter text-start  lg:text-8xl lowercase ">
                    {title}
                </h1>
                <div className="flex  gap-4 mt-10">
                    {avatar?.file?.url && (
                        <img
                            src={avatar.file.url}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    )}

                    <div className="flex flex-col items-start">
                        <h1 className="text-sm tracking-tighter font-bold">
                            Hai Ho
                        </h1>
                        <p className="text-sm">Junior Frontend Developer</p>
                    </div>
                </div>

                {biography?.biography && (
                    <p className="max-w-4xl text-2xl leading-[1.3] mt-6">
                        {`"${biography.biography}"`}
                    </p>
                )}
            </section>

            {/* Stepper Section */}

            <Experiences />
            <div className="footer w-screen min-h-screen  text-black flex flex-col justify-center items-center pt-20 pb-20">
                <FooterComponent />
            </div>
        </div>
    );
}
