import React from 'react';

interface LogoProps {
    className?: string;
    showName?: boolean;
}

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
    return (
        <div className="bg-indigo-600 p-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
            <svg viewBox="0 0 24 24" fill="none" className={`${className} text-white`} stroke="currentColor" strokeWidth="3">
                <path d="M4 20L4 4L12 12L12 4L20 20L20 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
};

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showName = true }) => {
    return (
        <div className={`flex items-center gap-2 group ${className}`}>
            <LogoIcon className="w-5 h-5" />
            {showName && <span className="text-xl font-bold tracking-tighter">NEXXO</span>}
        </div>
    );
};
