import React, { useState } from 'react';
import { graphql, PageProps } from 'gatsby';

type Work = {
    slug: string;
    title: string;
    description: { raw: string };
};

type PageData = {
    contentfulWorks: Work;
};

type MenuType = 'idea' | 'frontend' | 'backend';

const ProjectTemplate: React.FC<PageProps<PageData>> = ({ data }) => {
    if (!data?.contentfulWorks) return <p>Projekt hittades inte</p>;

    const work = data.contentfulWorks;
    const [activeMenu, setActiveMenu] = useState<MenuType>('idea');

    return (
        <div>
            <h1>{work.title}</h1>

            {/* MENY */}
            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setActiveMenu('idea')}>
                    Idea & Prototype
                </button>
                <button onClick={() => setActiveMenu('frontend')}>
                    Frontend
                </button>
                <button onClick={() => setActiveMenu('backend')}>
                    Backend
                </button>
            </div>

            {/* INNEHÅLL */}
            {activeMenu === 'idea' && (
                <section>
                    <h2>Idea & Prototype</h2>
                    <p>{work.description.raw}</p>
                </section>
            )}

            {activeMenu === 'frontend' && (
                <section>
                    <h2>Frontend</h2>
                    <p>Här kan du visa frontend-relaterat innehåll.</p>
                </section>
            )}

            {activeMenu === 'backend' && (
                <section>
                    <h2>Backend</h2>
                    <p>Här kan du visa backend-relaterat innehåll.</p>
                </section>
            )}
        </div>
    );
};

export default ProjectTemplate;

// Page query
export const query = graphql`
    query ($slug: String!) {
        contentfulWorks(slug: { eq: $slug }) {
            slug
            title
            description {
                raw
            }
        }
    }
`;
