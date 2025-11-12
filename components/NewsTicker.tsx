import React from 'react';
// FIX: Correct import path
import { NewsItem } from '../lib/gemini';

interface NewsTickerProps {
    newsItems: NewsItem[];
    isLoading: boolean;
}

const NewsTicker: React.FC<NewsTickerProps> = ({ newsItems, isLoading }) => {
    const TickerContent = () => (
        <>
            {newsItems.map((item, index) => (
                <React.Fragment key={index}>
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center flex-shrink-0 px-6 py-2 hover:bg-white/10 transition-colors duration-200"
                    >
                        <span className="font-bold text-accent-green mr-2">[{item.ticker}]</span>
                        <span className="text-gray-300 text-sm">{item.headline}</span>
                    </a>
                    <div className="w-px h-4 bg-gray-600 self-center"></div>
                </React.Fragment>
            ))}
        </>
    );

    const LoadingSkeleton = () => (
         <div className="flex items-center px-6 py-2 animate-pulse">
            <div className="w-12 h-4 bg-gray-700 rounded mr-2"></div>
            <div className="w-64 h-4 bg-gray-700 rounded"></div>
        </div>
    )

    return (
        <div className="bg-gray-900/50 backdrop-blur-md border-b border-t border-white/10 ticker-container overflow-hidden whitespace-nowrap relative">
            <div className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-gray-900 to-transparent"></div>
            <div className="absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-gray-900 to-transparent"></div>
            
            {isLoading ? (
                <div className="flex">
                    <LoadingSkeleton />
                    <LoadingSkeleton />
                    <LoadingSkeleton />
                </div>
            ) : newsItems.length > 0 ? (
                <div className="flex animate-scroll-left">
                    {/* Render content twice for a seamless loop */}
                    <TickerContent />
                    <TickerContent />
                </div>
            ) : (
                <div className="text-center text-gray-500 py-2 text-sm">No recent news available.</div>
            )}
        </div>
    );
};

export default NewsTicker;
