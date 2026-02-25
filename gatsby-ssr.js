import React from 'react';

// gatsby-ssr.js
export const onRenderBody = ({ setHtmlAttributes, setHeadComponents }) => {
    // Ökar accessibility poäng
    setHtmlAttributes({ lang: 'en' });

    // Google Analytics (gtag.js)
    setHeadComponents([
        <script
            key="gtag-src"
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-VBLZKENM4M"
        />,
        <script
            key="gtag-config"
            dangerouslySetInnerHTML={{
                __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-VBLZKENM4M');
                `,
            }}
        />,
    ]);
};
