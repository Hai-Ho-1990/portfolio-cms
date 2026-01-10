import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { graphql, navigate } from 'gatsby';
import { ReactLenis, useLenis } from 'lenis/dist/lenis-react';
import { PageProps } from 'gatsby';

import NavBar from '../components/navbar';
import WorkIntro from '../components/workIntro';
import WorkList from '../components/workList';
import WorksHeader from '../components/workHeader';
import { SEOHead } from '../components/SEO';

/* =======================
   HORIZONTAL WORK SECTION
======================= */

const HorizontalWorkSection = () => {
    const ulRef = useRef<HTMLUListElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const lenis = useLenis();
    const [showReturnButton, setShowReturnButton] = useState(false);

    useEffect(() => {
        if (!lenis) return;

        const section = sectionRef.current;
        const ul = ulRef.current;
        if (!section || !ul) return;

        const slides = ul.querySelectorAll('li');
        const slideCount = slides.length;

        section.style.height = `${slideCount * 100 + 100}vh`;

        const update = ({ scroll }: { scroll: number }) => {
            if (!sectionRef.current || !ulRef.current) return;

            const sectionRect = sectionRef.current.getBoundingClientRect();
            const sectionTop = sectionRect.top + scroll;
            const sectionHeight = sectionRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;

            const start = sectionTop;
            const end = sectionTop + sectionHeight - viewportHeight;

            const progress = (scroll - start) / (end - start);
            const clampedProgress = Math.min(Math.max(progress, 0), 1);

            ulRef.current.style.transform = `translateX(${
                -clampedProgress * (slideCount - 1) * 100
            }vw)`;

            if (headerRef.current) {
                headerRef.current.style.display =
                    progress >= 1.02 ? 'none' : 'block';
            }

            setShowReturnButton(progress >= 1);
        };

        lenis.on('scroll', update);
        return () => lenis.off('scroll', update);
    }, [lenis]);

    return (
        <section ref={sectionRef} className="relative min-h-screen">
            <div
                ref={headerRef}
                className="sticky top-0 z-50 backdrop-blur-sm w-full"
            >
                <WorksHeader />
            </div>

            <ul
                ref={ulRef}
                className="flex sticky top-0 left-0 h-screen will-change-transform"
            >
                <WorkList />
            </ul>

            {showReturnButton && (
                <button
                    onClick={() => navigate('/')}
                    aria-label="Return to home page"
                    className="fixed bottom-10 right-10 font-semibold text-[#c4b8a5] rounded-xl shadow-lg flex items-center gap-2 text-md uppercase"
                >
                    Return Home
                </button>
            )}
        </section>
    );
};

/* =======================
   PAGE
======================= */

const WorkPage = () => {
    return (
        <ReactLenis root>
            <header className="absolute top-0 w-full z-50">
                <NavBar />
            </header>

            <WorkIntro />

            <HorizontalWorkSection />
        </ReactLenis>
    );
};

export default WorkPage;

/* =======================
   HEAD (SEO)
======================= */
type WorkSeo = {
    seoTitle?: string;
    seoDescription?: {
        seoDescription?: string;
    };
    openGraphImage?: {
        file?: {
            url?: string;
        };
    };
};

type WorkPageData = {
    allContentfulWorks: {
        nodes: {
            seo?: WorkSeo;
        }[];
    };
};

export const Head = ({ location, data }: PageProps<WorkPageData>) => {
    const defaultSeo: WorkSeo = {
        seoTitle: 'Work – Hai Ho',
        seoDescription: {
            seoDescription:
                'Explore the work of Hai Ho, junior frontend developer.'
        },
        openGraphImage: undefined
    };

    const seo = data?.allContentfulWorks?.nodes?.[0]?.seo || defaultSeo;

    return <SEOHead seo={seo} pathname={location.pathname} />;
};

/* =======================
   PAGE QUERY
======================= */

export const query = graphql`
    query WorkPageQuery {
        allContentfulWorks {
            nodes {
                seo {
                    seoTitle
                    seoDescription {
                        seoDescription
                    }
                    openGraphImage {
                        file {
                            url
                        }
                    }
                }
            }
        }
    }
`;
