import * as React from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';

type NavItem = {
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
                    }
                }
            }
        }
    `);

    const items: NavItem[] =
        data?.allContentfulNavigation?.nodes?.[0]?.items ?? [];

    if (!items.length) return null;

    return (
        <nav className=" w-screen border-b border-gray-200 pb-4">
            <ul className="flex gap-8 justify-center pt-4 uppercase text-sm">
                {items.map((item: NavItem, index: number) => {
                    const slug = item.page?.slug;
                    if (!slug) return null;

                    return (
                        <li key={index}>
                            <Link
                                to={`/${slug}`}
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
