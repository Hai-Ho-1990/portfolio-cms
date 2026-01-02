const path = require('path');

exports.createPages = async ({ actions, graphql }) => {
    const { createPage } = actions;

    const result = await graphql(`
        {
            allContentfulWorks {
                nodes {
                    slug
                }
            }
        }
    `);

    if (result.errors) {
        throw result.errors;
    }

    const projects = result.data.allContentfulWorks.nodes;

    projects.forEach((project) => {
        createPage({
            path: `/work/${project.slug}`,
            component: path.resolve(`./src/templates/projectTemplate.tsx`),
            context: { slug: project.slug }
        });
    });
};
