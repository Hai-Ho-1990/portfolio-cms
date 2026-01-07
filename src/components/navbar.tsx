import * as React from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';

type NavItem = {
    itemOrder: number;
    label: string;
    newTab: boolean;
    page?: {
        slug: string;
    };
};

export default function NavBar() {
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

    const items: NavItem[] =
        data?.allContentfulNavigation?.nodes?.[0]?.items ?? [];
    const sortedItems = items
        .slice()
        .sort((a, b) => (a.itemOrder ?? 0) - (b.itemOrder ?? 0));

    if (!items.length) return null;

    return (
        <nav className=" w-screen border-b border-gray-200 pb-4">
            <ul className="flex gap-8 justify-center pt-4 uppercase text-sm">
                {sortedItems.map((item: NavItem, index: number) => {
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
