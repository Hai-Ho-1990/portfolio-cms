import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { graphql, navigate } from 'gatsby';
import { ReactLenis, useLenis } from 'lenis/dist/lenis-react';
import { PageProps } from 'gatsby';

import NavBar from '../components/navbar';
import WorkIntro from '../components/workIntro';
import WorkList from '../components/workList';
import WorksHeader from '../components/workHeader';
import { SEOHead } from '../components/SEOHead';

/* =====================================================
   DESKTOP HORIZONTAL WORK SECTION
   -----------------------------------------------------
   - Vertikal scroll omvandlas till horisontell rörelse
   - Varje <li> motsvarar en hel viewport-bredd
   - Sektionens höjd styr hur lång scrollen är
   - Header döljs när scrollen är klar
   - "Return Home"-knapp visas i slutet
===================================================== */
const DesktopHorizontalWorkSection = () => {
    const ulRef = useRef<HTMLUListElement>(null); // <ul> som flyttas horisontellt
    const sectionRef = useRef<HTMLElement>(null); // Wrapper-sektion som styr scroll-längden
    const headerRef = useRef<HTMLDivElement>(null); // Sticky header
    const lenis = useLenis(); // Lenis scroll-instans
    const [showReturnButton, setShowReturnButton] = useState(false);

    /* =================================================
       SCROLL-LOGIK
       -------------------------------------------------
       - Sätter sektionens höjd baserat på antal slides
       - Räknar scroll-progress (0–1)
       - Översätter progress till translateX
       - Togglar header och return-knapp
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

        // Extra 100vh för att ge utrymme efter sista slide
        section.style.height = `${slideCount * 100 + 100}vh`;

        const update = ({ scroll }: { scroll: number }) => {
            if (!sectionRef.current || !ulRef.current) return;

            // Beräkna sektionens position i dokumentet
            const sectionRect = sectionRef.current.getBoundingClientRect();
            const sectionTop = sectionRect.top + scroll;
            const sectionHeight = sectionRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;

            const start = sectionTop;
            const end = sectionTop + sectionHeight - viewportHeight;

            // Scroll-progress (0–1)
            const progress = (scroll - start) / (end - start);
            const clampedProgress = Math.min(Math.max(progress, 0), 1);

            // Horisontell förflyttning i pixlar
            const viewportWidth = window.innerWidth;
            const translateX =
                -clampedProgress * (slideCount - 1) * viewportWidth;

            ulRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`;

            // Dölj header när scroll-sektionen är klar
            if (headerRef.current) {
                headerRef.current.style.display =
                    progress >= 1.02 ? 'none' : 'block';
            }

            // Visa "Return Home" i slutet
            setShowReturnButton(progress >= 1);
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
        <section ref={sectionRef} className="relative min-h-screen">
            {/* Sticky header ovanför slides */}
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

            {/* Return-knapp visas efter sista slide */}
            {showReturnButton && (
                <button
                    onClick={() => navigate('/')}
                    aria-label="Return to home page"
                    className="fixed bottom-10 right-10 font-semibold text-[#c4b8a5] rounded-xl shadow-lg flex items-center gap-2 text-md uppercase z-50"
                >
                    Return Home
                </button>
            )}
        </section>
    );
};

/* =====================================================
   MOBILE VERTICAL WORK SECTION
   -----------------------------------------------------
   - Ingen horisontell scroll
   - Works renderas staplade vertikalt
   - Return-knapp längst ner
===================================================== */
const MobileVerticalWorkSection = () => {
    return (
        <section className="w-full">
            <WorkList isMobile={true} />

            <div className="w-full bg-black py-10 flex justify-center">
                <button
                    onClick={() => navigate('/')}
                    aria-label="Return to home page"
                    className="font-semibold text-[#c4b8a5] rounded-xl shadow-lg flex items-center gap-2 text-md uppercase px-6 py-3"
                >
                    Return Home
                </button>
            </div>
        </section>
    );
};

/* =====================================================
   ADAPTIVE WORK SECTION
   -----------------------------------------------------
   - Avgör layout baserat på viewport-bredd
   - Returnerar null tills client-side är redo
===================================================== */
const AdaptiveWorkSection = () => {
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

    return isMobile ? (
        <MobileVerticalWorkSection />
    ) : (
        <DesktopHorizontalWorkSection />
    );
};

/* =====================================================
   WORK PAGE
   -----------------------------------------------------
   - Lenis root-wrapper
   - Global navigation
   - Intro + adaptiv work-sektion
===================================================== */
const WorkPage = () => {
    return (
        <ReactLenis root>
            <header className="absolute top-0 w-full z-50">
                <NavBar />
            </header>

            <WorkIntro />

            <AdaptiveWorkSection />
        </ReactLenis>
    );
};

export default WorkPage;

/* =====================================================
   SEO / HEAD
===================================================== */
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

/* =====================================================
   GRAPHQL QUERY
   -----------------------------------------------------
   - Hämtar SEO-data för Work-sidan
===================================================== */
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
