// =====================================================
// IMPORTER
// =====================================================
// Node.js path används för att skapa absoluta sökvägar
// till template-filer
const path = require('path');

/* =====================================================
   createPages – Gatsby Node API
   =====================================================
   Denna funktion körs vid build-tid och används för att
   skapa dynamiska sidor baserat på data (Contentful).
*/
exports.createPages = async ({ actions, graphql }) => {
    // -------------------------------------------------
    // Destrukturerar createPage från Gatsby actions
    // -------------------------------------------------
    const { createPage } = actions;

    /* -------------------------------------------------
       GraphQL-query
       -------------------------------------------------
       Hämtar alla projekt från Contentful
       men endast deras slug (det enda vi behöver här)
    */
    const result = await graphql(`
        {
            allContentfulWorks {
                nodes {
                    slug
                }
            }
        }
    `);

    // -------------------------------------------------
    // Felhantering – stoppar build om queryn misslyckas
    // -------------------------------------------------
    if (result.errors) {
        throw result.errors;
    }

    /* -------------------------------------------------
       Extraherar projekten från GraphQL-svaret
       -------------------------------------------------
       projects blir en array av objekt:
       [{ slug: "project-1" }, { slug: "project-2" }, ...]
    */
    const projects = result.data.allContentfulWorks.nodes;

    /* -------------------------------------------------
       Skapar en sida per projekt
       -------------------------------------------------
       För varje slug:
       - URL: /work/{slug}
       - Template: projectTemplate.tsx
       - context: skickar slug till template
    */
    projects.forEach((project) => {
        createPage({
            // URL-strukturen för projektet
            path: `/work/${project.slug}`,

            // React-template som används för sidan
            component: path.resolve(`./src/templates/projectTemplate.tsx`),

            /* -----------------------------------------
               context
               -----------------------------------------
               Gör slug tillgänglig i template-filen
               via GraphQL-queryn ($slug)
            */
            context: {
                slug: project.slug
            }
        });
    });
};
