import * as React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import AnimatedContent from './animations/AnimatedContent';

export default function WorkIntro() {
    const data = useStaticQuery(graphql`
        query {
            allContentfulWorkIntro {
                nodes {
                    content {
                        raw
                    }
                    helpIcon {
                        file {
                            url
                        }
                    }
                    subTitle
                    title
                    helpText
                }
            }
        }
    `);

    const workIntroData = data.allContentfulWorkIntro?.nodes?.[0];

    if (!workIntroData) {
        return null; // or a fallback UI
    }

    const { content, helpIcon, subTitle, title, helpText } = workIntroData;

    return (
        <>
            <section className="w-screen h-screen flex flex-col items-center justify-center text-black bg-[#efefef]">
                <AnimatedContent>
                    {title && (
                        <h1 className="text-2xl lg:text-3xl text-center">
                            {title}
                        </h1>
                    )}
                    {subTitle && (
                        <p className="text-xl lg:text-2xl mt-2 text-center">
                            {subTitle}
                        </p>
                    )}
                    {content && (
                        <div className="w-[80%] lg:w-screen mt-10 text-xl  text-center max-w-3xl self-center lg:text-[3rem] leading-[1.1]">
                            {(() => {
                                try {
                                    return documentToReactComponents(
                                        JSON.parse(content.raw)
                                    );
                                } catch (error) {
                                    console.error(
                                        'Failed to parse content:',
                                        error
                                    );
                                    return null;
                                }
                            })()}
                        </div>
                    )}
                </AnimatedContent>
            </section>
        </>
    );
}
