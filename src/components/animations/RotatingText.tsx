import React, { useState, useEffect } from 'react';

interface RotatingTextProps {
    words: string[];
    interval?: number;
    className?: string;
}

export default function RotatingText({
    words,
    interval = 3000,
    className = ''
}: RotatingTextProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (words.length === 0) return;

        setCurrentIndex(0);
        setIsAnimating(false);

        let timeoutId: NodeJS.Timeout | null = null;
        const timer = setInterval(() => {
            setIsAnimating(true);
            timeoutId = setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
                setIsAnimating(false);
            }, 500);
        }, interval);

        return () => {
            clearInterval(timer);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [words, interval]);

    return (
        <span
            className={`inline-block transition-all duration-500 bg-clip-text text-transparent ${
                isAnimating
                    ? 'opacity-0 -translate-y-2'
                    : 'opacity-100 translate-y-0'
            } ${className}`}
            style={{
                backgroundImage:
                    'linear-gradient(90deg, #2563eb, #a855f7, #ec4899, #2563eb)',
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 3s linear infinite'
            }}
        >
            {words[currentIndex]}
        </span>
    );
}
