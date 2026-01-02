// import * as React from 'react';
// import { graphql } from 'gatsby';
// import Layout from '../components/layout';

// const PortfolioItemTemplate: React.FC<{
//     data: {
//         contentfulPortfolioItem: {
//             title: string;
//             slug: string;
//         };
//     };
// }> = ({ data }) => {
//     const { title, slug } = data.contentfulPortfolioItem;

//     return (
//         <Layout>
//             <article>
//                 <h1 className="text-4xl font-bold mb-4">{title}</h1>
//                 <p>{slug}</p>
//             </article>
//         </Layout>
//     );
// };
// export const query = graphql`
//     query ($slug: String!) {
//         contentfulPortfolioItem(slug: { eq: $slug }) {
//             title
//             slug
//         }
//     }
// `;
// export default PortfolioItemTemplate;
