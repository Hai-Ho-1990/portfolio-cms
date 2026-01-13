import * as React from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';

/* =======================
   Typ-definition för navigation items
   =======================
   - itemOrder: ordning i menyn
   - label: text som visas
   - newTab: öppnas i ny flik om true
   - page.slug: länkmål (om ingen slug → home "/")
======================= */
type NavItem = {
    itemOrder: number;
    label: string;
    newTab: boolean;
    page?: {
        slug: string;
    };
};

/* =======================
   NavBar Component
   =======================
   Ansvar:
   - Hämta navigation items från Contentful
   - Sortera items efter itemOrder
   - Rendera navigation som en horisontell lista
   - Hantera nya flikar med target="_blank" och rel
======================= */
export default function NavBar() {
    /* =======================
       DATA FETCHING
       =======================
       useStaticQuery körs vid build-time
       Hämtar alla navigation items från Contentful
    ======================= */
    const data = useStaticQuery(graphql`
        query {
            allContentfulNavigation {
                nodes {
                    items {
                        label
                        newTab
                        page {
                            slug
                        }
                        itemOrder
                    }
                }
            }
        }
    `);

    /* =======================
       DATA EXTRACTION
       =======================
       - Tar första Contentful navigation node
       - Om inga items → fallback till tom array
    ======================= */
    const items: NavItem[] =
        data?.allContentfulNavigation?.nodes?.[0]?.items ?? [];

    /* =======================
       SORTERA ITEMS
       =======================
       - Sorterar navigation items efter itemOrder
       - slice() för att skapa kopia innan sort
    ======================= */
    const sortedItems = items
        .slice()
        .sort((a, b) => (a.itemOrder ?? 0) - (b.itemOrder ?? 0));

    /* =======================
       SAFETY CHECK
       =======================
       - Om inga items → rendera inget
    ======================= */
    if (!items.length) return null;

    return (
        /* =======================
           NAV ELEMENT
           =======================
           - Flexbox horisontell lista
           - Styling: gap, text-transform, hover-effekt
        ======================= */
        <nav className="w-screen border-b border-gray-200 pb-4">
            <ul className="flex gap-8 justify-center pt-4 uppercase text-sm">
                {sortedItems.map((item: NavItem, index: number) => {
                    /* =======================
                       LINK LOGIK
                       =======================
                       - href bygger på slug
                       - target="_blank" om newTab = true
                       - rel="noopener noreferrer" för säkerhet vid nya flikar
                    ======================= */
                    const slug = item.page?.slug;
                    const href = slug ? `/${slug}` : `/`;

                    return (
                        <li key={index}>
                            <Link
                                to={href}
                                target={item.newTab ? '_blank' : undefined}
                                rel={
                                    item.newTab
                                        ? 'noopener noreferrer'
                                        : undefined
                                }
                                className="hover:opacity-70 transition"
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
