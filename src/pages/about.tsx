import React from 'react';
import Experiences from '../components/Experiences';
import NavBar from '../components/navbar';

import HorizontalScrollsection from '../components/HorizontalScrollReccommendations';
import { ReactLenis } from 'lenis/dist/lenis-react';

import Biography from '../components/biography';

export default function About() {
    return (
        <ReactLenis root>
            <header className="absolute top-0 w-full">
                <NavBar />
            </header>

            <Biography />

            <Experiences />
            <HorizontalScrollsection />
        </ReactLenis>
    );
}
