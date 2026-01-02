import React from 'react';
import { useState } from 'react';
import { graphql, useStaticQuery } from 'gatsby';

export default function FooterComponent() {
    const data = useStaticQuery(graphql`
        query {
            allContentfulFooter {
                nodes {
                    buttonCtaText1
                    buttonCtaText2
                    buttonCtaText3
                    ctaHover1
                    ctaHover2
                    extarnalLink {
                        url
                    }
                    mainTitle
                    sideText
                    email
                    thumbnail {
                        url
                    }
                }
            }
        }
    `);

    const {
        buttonCtaText1,
        buttonCtaText2,
        buttonCtaText3,
        ctaHover1,
        ctaHover2,
        extarnalLink,
        mainTitle,
        sideText,
        email,
        thumbnail
    } = data?.allContentfulFooter?.nodes?.[0];

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);

            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    return (
        <>
            <div className="text-center leading-[12] ">
                <h1
                    className="text-4xl lg:text-7xl font-bold "
                    // style={{
                    //     backgroundImage: `url(${thumbnail?.url})`,
                    //     backgroundSize: 'cover',
                    //     backgroundPosition: 'center'
                    // }}
                >
                    {mainTitle}
                </h1>
                <h1 className="text-3xl lg:text-4xl mt-4">{sideText}</h1>{' '}
            </div>
            <div className="flex space-x-5 lg:space-x-16 justify-center  align-middle">
                <button
                    onClick={handleCopy}
                    aria-label="Copy email"
                    className="
    cursor-pointer
    bg-black text-white py-4 px-9 rounded-3xl text-[1rem] lg:text-[1.3rem]
    shadow-[0_12px_20px_-4px_rgba(0,0,0,0.86)]
    mt-20
    relative overflow-hidden group
  "
                >
                    {/* Default state */}
                    <span
                        className={`
      absolute inset-0 flex items-center justify-center
      transition-all duration-300 ease-out
      ${
          copied
              ? 'opacity-0 -translate-y-1'
              : 'opacity-100 translate-y-0 group-hover:opacity-0 group-hover:-translate-y-1'
      }
    `}
                    >
                        {buttonCtaText1}
                    </span>
                    {/* Hover state */}
                    <span
                        className={`
      absolute inset-0 flex items-center justify-center
      transition-all duration-300 ease-out
      ${
          copied
              ? 'opacity-0 translate-y-1'
              : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
      }
    `}
                    >
                        {ctaHover1}
                    </span>

                    {/* Copied state */}
                    <span
                        className={`
      absolute inset-0 flex items-center justify-center
      transition-all duration-300 ease-out
      ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
    `}
                    >
                        {buttonCtaText2}
                    </span>
                    {/* Keeps button height */}
                    <span className="opacity-0">{buttonCtaText1}</span>
                </button>

                <a
                    href={extarnalLink?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Navigate to external link"
                >
                    <button
                        className="cursor-pointer
    bg-black text-white py-4 px-9 rounded-3xl text-[1rem] lg:text-[1.3rem]
    shadow-[0_12px_20px_-4px_rgba(0,0,0,0.86)]
    mt-20
    relative overflow-hidden group
  "
                    >
                        {/* Default text */}
                        <span
                            className="
      absolute inset-0 flex items-center justify-center
      transition-all duration-300 ease-out
      opacity-100 translate-y-0
      group-hover:opacity-0 group-hover:-translate-y-1
    "
                        >
                            {buttonCtaText3}
                        </span>
                        {/* Hover text */}
                        <span
                            className="
      absolute inset-0 flex items-center justify-center
      transition-all duration-300 ease-out
      opacity-0 translate-y-1
      group-hover:opacity-100 group-hover:translate-y-0
    "
                        >
                            {ctaHover2}
                        </span>
                        {/* Space holder (keeps button height) */}
                        <span className="opacity-0">{buttonCtaText3}</span>
                    </button>
                </a>
            </div>
        </>
    );
}
