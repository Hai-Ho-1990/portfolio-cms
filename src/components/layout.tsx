import * as React from 'react';
import Hero from './hero';
import TechStackScroller from './techStackScroller';
import FooterComponent from './footerComponent';
import NavBar from './navbar';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <header className="relative h-screen flex flex-col justify-between overflow-hidden bg-[#efefef]">
                <NavBar />
                <Hero />
                <TechStackScroller />
            </header>

            <main className="container">{children}</main>

            <footer
                id="footer"
                className="footer w-screen min-h-screen bg-white text-black flex flex-col justify-center items-center pt-20 pb-20"
            >
                <FooterComponent />
            </footer>
        </>
    );
};

export default Layout;
