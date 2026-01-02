import React from 'react';

export default function SpeechBubble() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="relative inline-block bg-blue-500 text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-blue-600 transition-colors">
                Click me
                {/* Triangle (speech bubble's "tail") */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-blue-500"></div>
            </div>
        </div>
    );
}
