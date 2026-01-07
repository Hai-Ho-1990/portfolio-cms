import { graphql, useStaticQuery } from 'gatsby';
import AnimatedContent from '../components/animations/AnimatedContent';
import React from 'react';

export default function Biography() {
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
        <div className="about-page w-screen flex flex-col items-center bg-[#fafafa] text-[#312B22] ">
            {/* Hero / Intro Section */}
            <section className="max-w-4xl h-screen w-[80%] flex flex-col justify-center ">
                <h1 className=" tracking-tighter text-start text-4xl lg:text-8xl lowercase ">
                    {title}
                </h1>
                <AnimatedContent>
                    <div className="flex  gap-4 mt-10">
                        {avatar?.file?.url && (
                            <img
                                src={avatar.file.url}
                                alt="Hai Ho's profile picture"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        )}

                        <div className="flex flex-col items-start">
                            <h2 className="text-sm tracking-tighter font-bold">
                                Hai Ho
                            </h2>

                            <p className="text-sm">Junior Frontend Developer</p>
                        </div>
                    </div>

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
