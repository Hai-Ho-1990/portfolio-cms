import React, { useRef, useEffect, useState } from 'react';
import { navigate } from 'gatsby';
import Recommendations from './recommendationsRendering';
import RecommendationsHeader from './recommendationsHeader';
import { useLenis } from 'lenis/dist/lenis-react';

/* =======================
   DESKTOP HORIZONTAL SECTION
=======================
   - Horisontell Lenis-scroll
   - Sticky header (RecommendationsHeader)
   - Horisontell lista med Recommendations
   - Visar "Return Home"-knapp när scrollen når slutet
*/
const DesktopHorizontalRecommendationSection = () => {
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

        let cleanupFn: (() => void) | null = null;

        // Kort timeout för att säkerställa att DOM är renderad
        const timer = setTimeout(() => {
            const slides = ul.querySelectorAll('li');
            const slideCount = slides.length;

            if (slideCount === 0) {
                console.warn('No slides found in recommendations');
                return;
            }

            console.log('Found', slideCount, 'recommendation slides');

            // Sätt höjd på sektionen baserat på antal slides
            section.style.height = `${slideCount * 100 + 100}vh`;

            /* =======================
               Scrolluppdatering
               =======================
               - Beräknar progress
               - Flyttar horisontellt ul-element
               - Dölj/visa header
               - Visa Return Home-knapp
            */
            const update = ({ scroll }: { scroll: number }) => {
                if (!sectionRef.current || !ulRef.current) return;

                const slides = ulRef.current.querySelectorAll('li');
                const slideCount = slides.length;
                if (slideCount === 0) return;

                const sectionRect = sectionRef.current.getBoundingClientRect();
                const sectionTop = sectionRect.top + scroll;
                const sectionHeight = sectionRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;

                const start = sectionTop;
                const end = sectionTop + sectionHeight - viewportHeight;

                const progress = (scroll - start) / (end - start);
                const clampedProgress = Math.min(Math.max(progress, 0), 1);

                const translateX = -clampedProgress * (slideCount - 1) * 100;

                ulRef.current.style.transform = `translateX(${translateX}vw)`;

                if (headerRef.current) {
                    headerRef.current.style.display =
                        progress >= 1.02 ? 'none' : 'block';
                }

                setShowReturnButton(progress >= 1);
            };

            lenis.on('scroll', update);
            update({ scroll: window.scrollY });

            cleanupFn = () => {
                lenis.off('scroll', update);
            };
        }, 100);

        return () => {
            clearTimeout(timer);
            if (section) {
                section.style.removeProperty('height');
            }
            if (cleanupFn) {
                cleanupFn();
            }
        };
    }, [lenis]);

    return (
        <section ref={sectionRef} className="relative min-h-screen">
            {/* Sticky header */}
            <div
                ref={headerRef}
                className="sticky top-0 z-50 backdrop-blur-sm w-full"
            >
                <RecommendationsHeader />
            </div>

            {/* Horisontell lista */}
            <ul
                ref={ulRef}
                className="flex sticky top-0 left-0 h-screen will-change-transform"
            >
                <Recommendations isMobile={false} />
            </ul>

            {/* Return Home-knapp */}
            {showReturnButton && (
                <button
                    onClick={() => navigate('/')}
                    aria-label="Return to home page"
                    className="fixed bottom-10 right-10 font-semibold text-[#c4b8a5] rounded-xl shadow-lg flex items-center gap-2 text-md uppercase z-50"
                >
                    Return Home
                    <svg
                        viewBox="0 0 512 512"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#c4b8a5"
                        width={30}
                    >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                            <title>ionicons-v5-c</title>
                            <polyline
                                points="112 352 48 288 112 224"
                                style={{
                                    fill: 'none',
                                    stroke: '#c4b8a5',
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    strokeWidth: '32px'
                                }}
                            ></polyline>
                            <path
                                d="M64,288H358c58.76,0,106-49.33,106-108V160"
                                style={{
                                    fill: 'none',
                                    stroke: '#c4b8a5',
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    strokeWidth: '32px'
                                }}
                            ></path>
                        </g>
                    </svg>
                </button>
            )}
        </section>
    );
};

/* =======================
   MOBILE VERTICAL SECTION
=======================
   - Vertikal lista med Recommendations
   - Return Home-knapp längst ner
*/
const MobileVerticalRecommendationSection = () => {
    return (
        <section className="w-full bg-black">
            <RecommendationsHeader />

            <Recommendations isMobile={true} />

            <div className="w-full bg-black py-10 flex justify-center">
                <button
                    onClick={() => navigate('/')}
                    aria-label="Return to home page"
                    className="font-semibold text-[#c4b8a5] rounded-xl shadow-lg flex items-center gap-2 text-md uppercase px-6 py-3"
                >
                    Return Home
                    <svg
                        viewBox="0 0 512 512"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#c4b8a5"
                        width={30}
                    >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                            <title>ionicons-v5-c</title>
                            <polyline
                                points="112 352 48 288 112 224"
                                style={{
                                    fill: 'none',
                                    stroke: '#c4b8a5',
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    strokeWidth: '32px'
                                }}
                            ></polyline>
                            <path
                                d="M64,288H358c58.76,0,106-49.33,106-108V160"
                                style={{
                                    fill: 'none',
                                    stroke: '#c4b8a5',
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    strokeWidth: '32px'
                                }}
                            ></path>
                        </g>
                    </svg>
                </button>
            </div>
        </section>
    );
};

/* =======================
   ADAPTIVE SECTION
=======================
   - Väljer Desktop eller Mobile
   - Baserat på skärmbredd (<1024px = mobil)
   - Förhindrar hydration mismatch
*/
const AdaptiveRecommendationSection = () => {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        // När skärmen ändrar sin storlek då körs checkMobile
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile === null) {
        return null;
    }

    return isMobile ? (
        <MobileVerticalRecommendationSection />
    ) : (
        <DesktopHorizontalRecommendationSection />
    );
};

export default AdaptiveRecommendationSection;
