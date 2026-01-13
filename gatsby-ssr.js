// gatsby-ssr.js
// Ökar accessibility poäng
export const onRenderBody = ({ setHtmlAttributes }) => {
    setHtmlAttributes({ lang: 'en' });
};
