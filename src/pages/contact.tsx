import React from 'react';
import FooterComponent from '../components/footerComponent';
import NavBar from '../components/navbar';

export default function Contact({ serverData }: any) {
    return (
        <section className=" bg-white h-screen text-black flex flex-col justify-center items-center">
            <header className="absolute top-0 w-full">
                <NavBar navItems={serverData?.navItems} />
            </header>

            <div
                id="footer"
                className="footer w-screen  flex flex-col justify-center items-center"
            >
                <FooterComponent footerData={serverData?.footerData} />
            </div>
        </section>
    );
}

/* =====================================================
   SERVER-SIDE RENDERING
===================================================== */
export async function getServerData() {
    try {
        const { fetchNavItems, fetchFooter } =
            await import('../utils/ssrDataFetchers');

        const [navItems, footerData] = await Promise.all([
            fetchNavItems(),
            fetchFooter(),
        ]);

        return { props: { navItems, footerData } };
    } catch (error) {
        console.error('getServerData error (contact):', error);
        return { props: {} };
    }
}
