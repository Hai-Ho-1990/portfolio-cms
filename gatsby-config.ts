import type { GatsbyConfig } from 'gatsby';
import dotenv from 'dotenv';
dotenv.config();

console.log("CONTENTFUL vars present:", {
  accessToken: !!process.env.CONTENTFUL_ACCESS_TOKEN,
  spaceId: !!process.env.CONTENTFUL_SPACE_ID,
});

const config: GatsbyConfig = {
    siteMetadata: {
        title: `My Portfolio`,
        siteUrl: `https://www.yourdomain.tld`
    },
    // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
    // If you use VSCode you can also use the GraphQL plugin
    // Learn more at: https://gatsby.dev/graphql-typegen
    graphqlTypegen: true,
    plugins: [
        {
            resolve: 'gatsby-source-contentful',
            options: {
                accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
                spaceId: process.env.CONTENTFUL_SPACE_ID
            }
        },
        'gatsby-plugin-image',
        'gatsby-plugin-sharp',
        'gatsby-transformer-sharp',
        'gatsby-plugin-postcss'
    ]
};

export default config;
