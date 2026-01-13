import * as React from 'react';
import Layout from '../components/layout';
import AboutSection from '../components/aboutSection';
import WorkList from '../components/workList';
import WorksHeader from '../components/workHeader';
import ReasonSection from '../components/reasonSection';
import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/dist/lenis-react';
import { SEOHead } from '../components/SEOHead';
import { graphql } from 'gatsby';

/* =====================================================
   DESKTOP SCROLL SECTION
   -----------------------------------------------------
   - Skapar en horisontell scroll-effekt
   - Vertikal scroll översätts till translateX
   - Varje <li> motsvarar en hel skärmbredd
===================================================== */
const DesktopScrollSection: React.FC = () => {
    const ulRef = useRef<HTMLUListElement>(null); // Referens till <ul> som flyttas horisontellt
    const sectionRef = useRef<HTMLElement>(null); // Wrapper-sektion som styr scroll-längden
    const headerRef = useRef<HTMLDivElement>(null); // Sticky header (döljs i slutet)
    const lenis = useLenis(); // Lenis scroll-instans

    /* =================================================
       SCROLL-LOGIK
       -------------------------------------------------
       - Sätter sektionens höjd baserat på antal slides
       - Lyssnar på Lenis scroll-event
       - Räknar ut progress (0–1)
       - Översätter progress till translateX
    ================================================= */
    useEffect(() => {
        if (!lenis) return;

        const section = sectionRef.current;
        const ul = ulRef.current;
        if (!section || !ul) return;

        const slides = ul.querySelectorAll('li');
        const slideCount = slides.length;

        // Spara tidigare höjd för cleanup
        const prevHeight = section.style.height;

        // Varje slide = 100vh scroll
        section.style.height = `${slideCount * 100}vh`;

        const update = ({ scroll }: { scroll: number }) => {
            const section = sectionRef.current;
            const ul = ulRef.current;
            if (!section || !ul) return;

            const slides = ul.querySelectorAll('li');
            const slideCount = slides.length;

            // Beräkna sektionens position i dokumentet
            const sectionRect = section.getBoundingClientRect();
            const sectionTop = sectionRect.top + scroll;
            const sectionHeight = section.offsetHeight;
            const viewportHeight = window.innerHeight;

            const start = sectionTop;
            const end = sectionTop + sectionHeight - viewportHeight;

            // Scroll-progress (0–1)
            const progress = (scroll - start) / (end - start);
            const clampedProgress = Math.min(Math.max(progress, 0), 1);

            // Horisontell förflyttning baserat på viewport-bredd
            const viewportWidth = window.innerWidth;
            const translateX =
                -clampedProgress * (slideCount - 1) * viewportWidth;

            ul.style.transform = `translate3d(${translateX}px, 0, 0)`;

            // Dölj header när sektionen är klar
            if (headerRef.current) {
                headerRef.current.style.display =
                    progress >= 1.02 ? 'none' : 'block';
            }
        };

        // Koppla Lenis scroll
        lenis.on('scroll', update);

        // Kör direkt vid mount
        update({ scroll: window.scrollY });

        // Cleanup
        return () => {
            if (section) {
                if (prevHeight) {
                    section.style.height = prevHeight;
                } else {
                    section.style.removeProperty('height');
                }
            }
            lenis.off('scroll', update);
        };
    }, [lenis]);

    /* =================================================
       RENDER – DESKTOP
    ================================================= */
    return (
        <section ref={sectionRef} data-scroll className="relative min-h-screen">
            {/* Sticky header som ligger ovanför slides */}
            <div
                ref={headerRef}
                className="sticky top-0 z-50 backdrop-blur-sm w-full"
            >
                <WorksHeader />
            </div>

            {/* Horisontell lista som flyttas med translateX */}
            <ul
                ref={ulRef}
                className="flex sticky top-0 left-0 h-screen will-change-transform"
            >
                <WorkList isMobile={false} />
            </ul>
        </section>
    );
};

/* =====================================================
   MOBILE SCROLL SECTION
   -----------------------------------------------------
   - Ingen horisontell scroll
   - WorkList renderas vertikalt
===================================================== */
const MobileScrollSection: React.FC = () => {
    return (
        <section className="w-full">
            <WorkList isMobile={true} />
        </section>
    );
};

/* =====================================================
   RESPONSIVE SWITCH (MOBILE / DESKTOP)
   -----------------------------------------------------
   - Avgör layout baserat på viewport-bredd
   - Returnerar null tills client är redo
===================================================== */
const LenisScrollSection: React.FC = () => {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Förhindrar hydration mismatch
    if (isMobile === null) {
        return null;
    }

    return isMobile ? <MobileScrollSection /> : <DesktopScrollSection />;
};

/* =====================================================
   PAGE TYPES
===================================================== */
type IndexPageProps = {
    data: {
        allContentfulHero: {
            nodes: Array<{
                seo: {
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
            }>;
        };
    };
};

/* =====================================================
   INDEX PAGE
===================================================== */
const IndexPage = ({ data }: IndexPageProps) => {
    return (
        <Layout>
            <AboutSection />
            <LenisScrollSection />
            <ReasonSection />
        </Layout>
    );
};

/* =====================================================
   SEO / HEAD
===================================================== */
export const Head = ({ location, data }: any) => {
    const seo = data?.allContentfulHero?.nodes?.[0]?.seo;
    return <SEOHead seo={seo} pathname={location.pathname} />;
};

export default IndexPage;

/* =====================================================
   GRAPHQL QUERY
   -----------------------------------------------------
   - Hämtar SEO-data för startsidan
===================================================== */
export const query = graphql`
    query IndexPageQuery {
        allContentfulHero {
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
