import * as React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

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
        <section className="w-screen h-screen shrink-0 flex flex-col items-center justify-center text-[#c4b8a5] bg-black">
            <h1 className="text-3xl">{title}</h1>
            <p className="text-2xl mt-2">{subTitle}</p>
            {content && (
                <div className="mt-10 text-2xl text-center max-w-3xl self-center lg:text-[3rem] leading-[1.1]">
                    {documentToReactComponents(JSON.parse(content.raw))}
                </div>
            )}
            <div className=" px-5 py-2 flex items-center gap-2 mt-10">
                <h4 className="text-xl">{helpText}</h4>
                {helpIcon?.file?.url && (
                    <img
                        src={helpIcon.file.url}
                        alt="Help icon"
                        className="w-4"
                    />
                )}
            </div>
        </section>
    );
}
