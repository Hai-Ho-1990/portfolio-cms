import * as React from 'react';
import Layout from '../components/layout';
import AboutSection from '../components/aboutSection';
import WorkList from '../components/workList';
import WorksHeader from '../components/workHeader';
import ReasonSection from '../components/reasonSection';
import { useEffect, useRef } from 'react';
import { ReactLenis, useLenis } from 'lenis/dist/lenis-react';

const LenisScrollSection: React.FC = () => {
    const ulRef = useRef<HTMLUListElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const lenis = useLenis();

    useEffect(() => {
        if (!lenis) return;

        const section = sectionRef.current;
        const ul = ulRef.current;
        if (!section || !ul) return;

        const slides = ul.querySelectorAll('li');
        const slideCount = slides.length;

        // Save previous height before mutating
        const prevHeight = section.style.height;
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

            // progress kan gå <0 eller >1, används för header
            const progress = (scroll - start) / (end - start);

            // clampedProgress begränsar mellan 0-1 för translateX så animationen blir stabil
            const clampedProgress = Math.min(Math.max(progress, 0), 1);

            // Horizontal scroll
            const translateX = -clampedProgress * (slideCount - 1) * 100;
            ul.style.transform = `translateX(${translateX}vw)`;

            // Visa/göm WorksHeader vid 102% (efter scroll-animationen är klar)
            if (headerRef.current) {
                headerRef.current.style.display =
                    progress >= 1.02 ? 'none' : 'block';
            }
        };

        lenis.on('scroll', update);

        return () => {
            // Restore previous height or remove inline style
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

    return (
        <section ref={sectionRef} data-scroll className="relative min-h-screen">
            {/* Sticky WorksHeader */}
            <div
                ref={headerRef}
                className="sticky top-0 z-50 backdrop-blur-sm w-full"
            >
                <WorksHeader />
            </div>

            {/* Horisontell scroll */}
            <ul
                ref={ulRef}
                className="flex sticky top-0 left-0 h-screen will-change-transform"
            >
                <WorkList />
            </ul>
        </section>
    );
};

const IndexPage = () => {
    return (
        <Layout>
            <AboutSection />
            <ReactLenis root>
                <LenisScrollSection />
                <ReasonSection />
            </ReactLenis>
        </Layout>
    );
};

export const Head = () => <title>Home Page</title>;
export default IndexPage;
