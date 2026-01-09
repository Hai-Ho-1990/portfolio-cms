import { graphql, useStaticQuery } from 'gatsby';
import * as React from 'react';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';

/* =======================
   Recommendations Component
======================= */

interface Recommendation {
    reference?: string;
    avatar?: { gatsbyImageData: IGatsbyImageData };
    name: string;
    position: string;
    recommendation: { recommendation: string };
}

export default function Recommendations() {
    const data = useStaticQuery(graphql`
        query MyQuery {
            allContentfulRecommendations {
                nodes {
                    avatar {
                        gatsbyImageData(
                            placeholder: BLURRED
                            layout: CONSTRAINED
                        )
                    }
                    name
                    position
                    recommendation {
                        recommendation
                    }
                    reference
                }
            }
        }
    `);
    const recommendationsData: Recommendation[] =
        data.allContentfulRecommendations?.nodes || [];
    if (!recommendationsData.length) return null;

    return (
        <>
            {recommendationsData.map(
                (recommendation: Recommendation, index: number) => (
                    <li
                        key={recommendation.name}
                        className="w-screen h-screen  flex flex-col justify-center bg-black text-[#c4b8a5] flex-shrink-0"
                    >
                        <div className="mb-8 max-w-4xl mx-auto px-4 w-[80%] lg:w-screen">
                            <div className="flex items-center gap-4 ">
                                {recommendation.avatar?.gatsbyImageData && (
                                    <GatsbyImage
                                        image={
                                            recommendation.avatar
                                                .gatsbyImageData
                                        }
                                        alt={recommendation.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                )}

                                <div>
                                    <h3 className="font-bold">
                                        {recommendation.name}
                                    </h3>
                                    <p className="text-sm text-[#c4b8a5]">
                                        {recommendation.position}
                                    </p>
                                </div>
                            </div>
                            <p className="mb-4 italic mt-6 text-xs lg:text-base tracking-wider">
                                "
                                {recommendation.recommendation
                                    ?.recommendation || ''}
                                "
                            </p>
                        </div>
                    </li>
                )
            )}
        </>
    );
}
