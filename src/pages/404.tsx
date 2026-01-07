import * as React from 'react';
import { Link, HeadFC, PageProps, graphql, useStaticQuery } from 'gatsby';

export default function NotFoundPage({}: PageProps) {
    const data = useStaticQuery(graphql`
        query {
            allContentfulPageNotFound {
                nodes {
                    message
                    title
                    ctaText
                }
            }
        }
    `);

    const pageData = data.allContentfulPageNotFound?.nodes?.[0];

    const { message, title, ctaText } = pageData;

    return (
        <main className="w-screen h-screen flex flex-col justify-center items-center bg-[#fafafa] text-[#312B22]">
            <h1 className="text-6xl lg:text-9xl font-bold mb-8">{title}</h1>
            <p className="text-xl lg:text-2xl mb-8">{message}</p>
            <Link
                to="/"
                className="px-6 py-3 bg-[#312B22] text-[#fafafa] rounded hover:bg-[#4a4237] transition"
            >
                {ctaText}
            </Link>
        </main>
    );
}

export const Head: HeadFC = () => <title>Not found</title>;
