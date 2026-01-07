import { graphql, useStaticQuery } from 'gatsby';
import * as React from 'react';

interface Recommendation {
    avatar?: { url: string };
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
                        url
                    }
                    name
                    position
                    recommendation {
                        recommendation
                    }
                }
            }
        }
    `);
    const recommendationsData = data.allContentfulRecommendations?.nodes || [];

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
                                {recommendation.avatar?.url && (
                                    <img
                                        src={recommendation.avatar.url}
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
                            <p className="mb-4 italic mt-6 text-xs lg:text-base">
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
