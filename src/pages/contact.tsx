import React from 'react';
import FooterComponent from '../components/footerComponent';
import NavBar from '../components/navbar';

export default function Contact() {
    return (
        <section className=" bg-white h-screen text-black flex flex-col justify-center items-center">
            <header className="absolute top-0 w-full">
                <NavBar />
            </header>

            <div
                id="footer"
                className="footer w-screen  flex flex-col justify-center items-center"
            >
                <FooterComponent />
            </div>
        </section>
    );
}

/* =====================================================
   SERVER-SIDE RENDERING
   -------------------------------------------------
   Aven om contact-sidan inte har nagon data att hamta
   aktiverar getServerData SSR-rendring pa Netlify,
   sa sidan serveras dynamiskt vid varje request.
===================================================== */
export async function getServerData() {
    return {
        props: {},
    };
}
