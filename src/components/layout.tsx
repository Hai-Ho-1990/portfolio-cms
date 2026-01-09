import * as React from 'react';
import { ReactLenis } from 'lenis/dist/lenis-react';
import Hero from './hero';
import TechStackScroller from './techStackScroller';
import FooterComponent from './footerComponent';
import NavBar from './navbar';
import { graphql, useStaticQuery } from 'gatsby';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ReactLenis root>
            <header className="relative h-screen flex flex-col justify-between overflow-hidden bg-[#efefef]">
                <NavBar />
                <Hero />
                <TechStackScroller />
            </header>

            <main className="container min-h-screen">{children}</main>

            <footer
                id="footer"
                className="footer w-screen min-h-screen bg-white text-black flex flex-col justify-center items-center pt-20 pb-20"
            >
                <FooterComponent />
            </footer>
        </ReactLenis>
    );
};

export default Layout;
