import React from 'react';
import Experiences from '../components/Experiences';

import HorizontalScrollsection from '../components/animations/HorizontalScrollReccomendations';
import { ReactLenis } from 'lenis/dist/lenis-react';

import Biography from '../components/biography';

export default function About() {
    return (
        <ReactLenis root>
            <Biography />

            <Experiences />
            <HorizontalScrollsection />
        </ReactLenis>
    );
}
