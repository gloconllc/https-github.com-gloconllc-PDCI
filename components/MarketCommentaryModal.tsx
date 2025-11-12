
import React, { useMemo } from 'react';
import { CloseIcon, SparkleIcon, NewsIcon } from './icons/Icons';
import { Company } from '../types';
import { NewsItem } from '../lib/gemini';

interface MarketCommentaryModalProps {
    onClose: () => void;
    isLoading: boolean;
    commentary: string | null;
    allCompanies: Company[];
    newsItems: NewsItem[];
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderLine = (line: string, key: number) => {
        if (line.startsWith('### ')) {
            return <h3 key={key} className="text-lg font-semibold text-gray-200 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
            return <h2 key={key} className="text-xl font-bold text-gray-100 mt-5 mb-2 border-b border-white/10 pb-1">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('* ')) {
            return <li key={key} className="text-gray-300 my-1 ml-4 list-disc">{line.replace('* ', '')}</li>;
        }
        if (line.trim() === '') {
            return <br key={key} />;
        }
        return <p key={key} className="text-gray-300 my-2">{line}</p>;
    };

    return <>{content.split('\n').map(renderLine)}</>;
};

const MarketMovers: React.FC<{ companies: Company[] }> = ({ companies }) => {
    const movers = useMemo(() => {
        const sorted = [...companies].sort((a, b) => b.YTD_Performance - a.YTD_Performance);
        const topGainers = sorted.slice(0, 3);
        const topLosers = sorted.slice(-3).reverse();
        return { topGainers, topLosers };
    }, [companies]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <h3 className="font-semibold text-accent-green mb-2">Top Gainers (YTD)</h3>
                <div className="space-y-2">
                    {movers.topGainers.map(c => (
                        <div key={c.Ticker} className="bg-black/20 p-2 rounded-md text-sm flex justify-between">
                            <span className="font-semibold text-gray-300">{c.Ticker}</span>
                            <span className="font-mono text-accent-green">+{c.YTD_Performance.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-accent-red mb-2">Top Losers (YTD)</h3>
                <div className="space-y-2">
                    {movers.topLosers.map(c => (
                        <div key={c.Ticker} className="bg-black/20 p-2 rounded-md text-sm flex justify-between">
                            <span className="font-semibold text-gray-300">{c.Ticker}</span>
                            <span className={`font-mono ${c.YTD_Performance < 0 ? 'text-accent-red' : 'text-gray-400'}`}>{c.YTD_Performance.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SectorPerformance: React.FC<{ companies: Company[] }> = ({ companies }) => {
     const sectorData = useMemo(() => {
        const sectors: Record<string, { sum: number; count: number }> = {};
        companies.forEach(c => {
            if (!sectors[c.Category]) {
                sectors[c.Category] = { sum: 0, count: 0 };
            }
            sectors[c.Category].sum += c.YTD_Performance;
            sectors[c.Category].count++;
        });
        return Object.entries(sectors)
            .map(([name, data]) => ({ name, avg: data.sum / data.count }))
            .sort((a, b) => b.avg - a.avg);
    }, [companies]);

    const maxAvg = Math.max(...sectorData.map(s => Math.abs(s.avg)), 1);

    return (
        <div>
            <h3 className="font-semibold text-gray-200 mb-2">Sector Performance (YTD Avg)</h3>
            <div className="space-y-2">
                {sectorData.map(sector => (
                    <div key={sector.name} className="flex items-center text-sm">
                        <span className="w-1/3 text-gray-400 truncate pr-2">{sector.name}</span>
                        <div className="w-2/3 bg-black/20 rounded-full h-5 flex items-center">
                             <div 
                                className={`h-5 rounded-full text-xs font-medium flex items-center justify-end pr-2 ${sector.avg >= 0 ? 'bg-accent-green text-black' : 'bg-accent-red text-white'}`}
                                style={{ width: `${(Math.abs(sector.avg) / maxAvg) * 100}%`, minWidth: '30px' }}
                            >
                                {sector.avg.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MarketCommentaryModal: React.FC<MarketCommentaryModalProps> = ({ onClose, isLoading, commentary, allCompanies, newsItems }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <SparkleIcon />
                        PDCI Daily Market Briefing
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                            <SparkleIcon />
                            <p className="text-gray-300 text-lg animate-pulse mt-4">Generating market briefing...</p>
                            <p className="text-gray-500 mt-2">Synthesizing real-time news and internal data.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3 space-y-6">
                                {commentary && <MarkdownRenderer content={commentary} />}
                            </div>
                            <div className="lg:col-span-2 space-y-6">
                                 <div className="glass-panel p-4">
                                    <MarketMovers companies={allCompanies} />
                                 </div>
                                 <div className="glass-panel p-4">
                                     <SectorPerformance companies={allCompanies} />
                                 </div>
                                 <div className="glass-panel p-4">
                                     <h3 className="font-semibold text-gray-200 mb-2 flex items-center gap-2"><NewsIcon /> Key News</h3>
                                     <div className="space-y-2">
                                        {newsItems.map((item, index) => (
                                             <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="block text-xs bg-black/20 p-2 rounded-md hover:bg-white/10">
                                                <span className="font-bold text-accent-green mr-1">[{item.ticker}]</span>
                                                <span className="text-gray-300">{item.headline}</span>
                                            </a>
                                        ))}
                                     </div>
                                 </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketCommentaryModal;
