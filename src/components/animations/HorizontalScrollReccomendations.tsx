import React, { useRef, useEffect, useState } from 'react';
import { navigate } from 'gatsby';
import WorkList from '../workList';
import Recommendations from '../recommendations';
import RecommendationsHeader from '../recommendationsHeader';
import { ReactLenis, useLenis } from 'lenis/dist/lenis-react';

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
            const section = sectionRef.current;
            const ul = ulRef.current;
            if (!section || !ul) return;

            const slides = ul.querySelectorAll('li');
            const slideCount = slides.length;

            const sectionRect = section.getBoundingClientRect();
            const sectionTop = sectionRect.top + scroll;
            const sectionHeight = section.offsetHeight;
            const viewportHeight = window.innerHeight;

            const start = sectionTop;
            const end = sectionTop + sectionHeight - viewportHeight;

            const progress = (scroll - start) / (end - start);
            const clampedProgress = Math.min(Math.max(progress, 0), 1);

            // Horisontell scroll
            const translateX = -clampedProgress * (slideCount - 1) * 100;
            ul.style.transform = `translateX(${translateX}vw)`;

            // Visa/göm WorksHeader
            if (headerRef.current) {
                headerRef.current.style.display =
                    progress >= 1.02 ? 'none' : 'block';
            }

            // Visa Return Home-knappen när vi når slutet
            setShowReturnButton(progress >= 1);
        };

        lenis.on('scroll', update);
        return () => lenis.off('scroll', update);
    }, [lenis]);

    return (
        <section ref={sectionRef} className="relative min-h-screen">
            {/* Sticky WorksHeader */}
            <div
                ref={headerRef}
                className="sticky top-0 z-50 backdrop-blur-sm w-full"
            >
                <RecommendationsHeader />
            </div>

            {/* Horisontell scroll */}
            <ul
                ref={ulRef}
                className="flex sticky top-0 left-0 h-screen will-change-transform"
            >
                <Recommendations />
            </ul>

            {/* Return Home-knapp */}
            {showReturnButton && (
                <button
                    onClick={() => navigate('/')} // Gatsby navigate
                    aria-label="Return to home page"
                    className="fixed bottom-10 right-10 font-semibold text-[#c4b8a5] rounded-xl shadow-lg flex items-center gap-2 text-md uppercase"
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

export default HorizontalWorkSection;
