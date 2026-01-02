import React from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';
import SplitText from './animations/SplitText';

export default function ReasonSection() {
    const data = useStaticQuery(graphql`
        query {
            allContentfulReasonSection {
                nodes {
                    reasonRef {
                        body {
                            body
                        }
                        title
                    }
                    thumbnail {
                        url
                    }
                    title
                    obs
                }
            }
        }
    `);

    const { title, thumbnail, reasonRef, obs } =
        data.allContentfulReasonSection.nodes?.[0] || {};

    return (
        <section className="w-screen h-screen flex flex-col justify-between bg-white  text-[#312B22]  items-center pt-10 pb-20 ">
            <h1 className="text-sm lg:text-md mb-6 text-gray-500 lg:mt-10">
                {title}
            </h1>

            <div className="w-full max-w-3xl lg:max-w-5xl p-8 m-6 text-center">
                <h2 className="text-md font-bold mb-6 text-gray-500">
                    {reasonRef?.title}
                </h2>
                <SplitText
                    text={reasonRef?.body?.body}
                    className="text-md lg:text-4xl text-center font-semibold"
                    splitType="lines"
                    delay={80}
                    duration={0.8}
                    from={{ opacity: 0, y: 60 }}
                    to={{ opacity: 1, y: 0 }}
                    textAlign="center"
                />
            </div>

            <p className="text-xs text-gray-500 w-[80%] mt-10 text-center">
                {obs}
            </p>
        </section>
    );
}
