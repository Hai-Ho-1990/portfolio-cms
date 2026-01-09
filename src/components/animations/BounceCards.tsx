import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import React from 'react';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';

interface BounceCardsProps {
    className?: string;
    images?: IGatsbyImageData[];
    containerWidth?: number;
    containerHeight?: number;
    animationDelay?: number;
    animationStagger?: number;
    easeType?: string;
    transformStyles?: string[];
    enableHover?: boolean;
}

export default function BounceCards({
    className = '',
    images = [],
    containerWidth = 400,
    containerHeight = 400,
    animationDelay = 0.5,
    animationStagger = 0.06,
    easeType = 'elastic.out(1, 0.8)',
    transformStyles = [
        'rotate(10deg) translate(-170px)',
        'rotate(5deg) translate(-85px)',
        'rotate(-3deg)',
        'rotate(-10deg) translate(85px)',
        'rotate(2deg) translate(170px)'
    ],
    enableHover = false
}: BounceCardsProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        // Use gsap.context for scoped animations and cleanup
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.card',
                { scale: 0 },
                {
                    scale: 1,
                    stagger: animationStagger,
                    ease: easeType,
                    delay: animationDelay
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [animationDelay, animationStagger, easeType, images]);

    const getNoRotationTransform = (transformStr: string): string => {
        const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
        if (hasRotate) {
            return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
        } else if (transformStr === 'none') {
            return 'rotate(0deg)';
        } else {
            return `${transformStr} rotate(0deg)`;
        }
    };

    const getPushedTransform = (
        baseTransform: string,
        offsetX: number
    ): string => {
        const translateRegex = /translate\(([-0-9.]+)px\)/;
        const match = baseTransform.match(translateRegex);
        if (match) {
            const currentX = parseFloat(match[1]);
            const newX = currentX + offsetX;
            return baseTransform.replace(
                translateRegex,
                `translate(${newX}px)`
            );
        } else {
            return baseTransform === 'none'
                ? `translate(${offsetX}px)`
                : `${baseTransform} translate(${offsetX}px)`;
        }
    };

    const pushSiblings = (hoveredIdx: number) => {
        if (!enableHover || !containerRef.current) return;
        const q = gsap.utils.selector(containerRef.current);
        images.forEach((_, i) => {
            const cardEl = q(`.card-${i}`);
            if (!cardEl || cardEl.length === 0) return;
            gsap.killTweensOf(cardEl);
            const baseTransform = transformStyles[i] || 'none';
            if (i === hoveredIdx) {
                const noRotation = getNoRotationTransform(baseTransform);
                gsap.to(cardEl, {
                    transform: noRotation,
                    duration: 0.4,
                    ease: 'back.out(1.4)',
                    overwrite: 'auto'
                });
            } else {
                const offsetX = i < hoveredIdx ? -160 : 160;
                const pushedTransform = getPushedTransform(
                    baseTransform,
                    offsetX
                );
                const distance = Math.abs(hoveredIdx - i);
                const delay = distance * 0.05;
                gsap.to(cardEl, {
                    transform: pushedTransform,
                    duration: 0.4,
                    ease: 'back.out(1.4)',
                    delay,
                    overwrite: 'auto'
                });
            }
        });
    };

    const resetSiblings = () => {
        if (!enableHover || !containerRef.current) return;
        const q = gsap.utils.selector(containerRef.current);
        images.forEach((_, i) => {
            const cardEl = q(`.card-${i}`);
            if (!cardEl || cardEl.length === 0) return;
            gsap.killTweensOf(cardEl);
            const baseTransform = transformStyles[i] || 'none';
            gsap.to(cardEl, {
                transform: baseTransform,
                duration: 0.4,
                ease: 'back.out(1.4)',
                overwrite: 'auto'
            });
        });
    };

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center justify-center ${className}`}
            style={{
                width: containerWidth,
                height: containerHeight
            }}
        >
            {images.map((image, idx) => (
                <div
                    key={idx}
                    className={`card card-${idx} absolute w-[30%] lg:w-[60%] h-[50%] lg:h-[100%] aspect-square rounded-[30px] overflow-hidden`}
                    style={{
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        transform: transformStyles[idx] || 'none'
                    }}
                    onMouseEnter={() => pushSiblings(idx)}
                    onMouseLeave={resetSiblings}
                >
                    <GatsbyImage
                        image={image}
                        alt={`Bounce card ${idx + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    );
}
