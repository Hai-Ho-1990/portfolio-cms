// smoothScroll.tsx
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export const useSmoothScroll = () => {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.0, // något kortare = mer responsivt
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false
        });

        lenisRef.current = lenis;

        // 🔄 Viktigt: uppdatera onScroll för externa animationer
        lenis.on('scroll', ({ scroll, limit }) => {
            // exempel: uppdatera GSAP ScrollTrigger / Motion scroll
            // ScrollTrigger.update();
            // (Motion scroll läser automatiskt window.scrollY, så behövs ej extra)
        });

        let rafId: number;
        const raf = (time: number) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    return lenisRef;
};
