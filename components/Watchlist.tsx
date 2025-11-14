/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';
import { Company } from '../types';
import { CloseIcon } from './icons/Icons';
import Sparkline from './Sparkline';

interface WatchlistProps {
    watchlist: Company[];
    onRemove: (ticker: string) => void;
    onViewDetails: (company: Company) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ watchlist, onRemove, onViewDetails }) => {
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Watchlist ({watchlist.length})</h2>
            
            <div className="flex-grow overflow-y-auto pr-1 space-y-2">
                {watchlist.map(company => (
                    <div 
                        key={company.Ticker} 
                        className="watchlist-item group"
                        onClick={() => onViewDetails(company)}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-8 h-8 rounded-full object-contain bg-white" />
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-200 text-sm truncate">{company.Company}</p>
                                <p className="text-xs text-gray-400">{company.Ticker}</p>
                            </div>
                        </div>
                        <div className="w-20 h-10 mx-2">
                             <Sparkline ticker={company.Ticker} />
                        </div>
                        <div className="text-right">
                             <p className="font-mono text-sm text-gray-200">${company.Current_Price_USD.toFixed(2)}</p>
                             <p className={`font-mono text-xs ${company.YTD_Performance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                 {company.YTD_Performance >= 0 ? '+' : ''}{company.YTD_Performance.toFixed(1)}%
                             </p>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemove(company.Ticker); }} 
                            className="absolute top-1 right-1 btn btn-ghost-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            aria-label={`Remove ${company.Company} from watchlist`}
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                 {watchlist.length === 0 && (
                    <div className="text-center text-gray-500 pt-10">Your watchlist is empty. Add companies using the bookmark icon.</div>
                )}
            </div>
        </div>
    );
};

export default Watchlist;