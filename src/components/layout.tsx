import * as React from 'react';
import { ReactLenis } from 'lenis/dist/lenis-react';
import Hero from './hero';
import TechStackScroller from './techStackScroller';
import FooterComponent from './footerComponent';
import NavBar from './navbar';

/* =======================
   Layout Component
   =======================
   Ansvar:
   - Wrappar hela sidan med ReactLenis (mjuk scroll)
   - Innehåller:
       - Header med navbar, hero och tech stack scroller
       - Main content (children)
       - Footer
   - Ger struktur och scroll-kontext för hela sidan
======================= */
/* =======================
   Layout Props Type
   =======================
   Optional SSR data props
   passed down to child components
======================= */
type LayoutProps = {
    children: React.ReactNode;
    navItems?: any[];
    heroData?: any;
    techStackData?: any[];
    footerData?: any;
};

const Layout = ({ children, navItems, heroData, techStackData, footerData }: LayoutProps) => {
    return (
        /* =======================
           ReactLenis wrapper
           =======================
           - Tillåter smidig scroll på hela sidan
           - Alla barnkomponenter får scroll-tracking
        ======================= */
        <ReactLenis root>
            {/* =======================
               Header section
               =======================
               - Sticky / full-height header
               - Innehåller navigeringsbar, Hero och TechStackScroller
            ======================= */}
            <header className="relative h-screen flex flex-col justify-between overflow-hidden bg-[#efefef]">
                <NavBar navItems={navItems} />
                <Hero heroData={heroData} />
                <TechStackScroller techStackData={techStackData} />
            </header>

            {/* =======================
               Main section
               =======================
               - Renderar barnkomponenter dynamiskt
               - Minsta höjd satt till viewport height
            ======================= */}
            <main className="container min-h-screen">{children}</main>

            {/* =======================
               Footer section
               =======================
               - Full height footer
               - Innehåller FooterComponent
               - Id "footer" används för CTA-scroll från Hero-knappen
            ======================= */}
            <footer
                id="footer"
                className="footer w-screen min-h-screen bg-white text-black flex flex-col justify-center items-center pt-20 pb-20"
            >
                <FooterComponent footerData={footerData} />
            </footer>
        </ReactLenis>
    );
};

export default Layout;
