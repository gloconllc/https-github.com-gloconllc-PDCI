/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';
import { Company } from '../types';
import StockChart from './StockChart';
import { PlusIcon } from './icons/Icons';

interface PerformanceViewProps {
    companies: Company[];
    onViewDetails: (company: Company) => void;
    onAddToPortfolio: (company: Company) => void;
}

const PerformanceView: React.FC<PerformanceViewProps> = ({ companies, onViewDetails, onAddToPortfolio }) => {
    return (
        <div className="space-y-6">
            <div className="text-center">
                 <h1 className="text-3xl font-bold text-gray-200">Historical Performance Dashboard</h1>
                 <p className="text-gray-400">Compare recent 60-day stock performance trends across the supply chain.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(company => (
                    <div key={company.Ticker} className="glass-panel p-4 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                             <div className="cursor-pointer flex-1 min-w-0" onClick={() => onViewDetails(company)}>
                                <h3 className="font-bold text-lg text-gray-100 truncate" title={company.Company}>{company.Company}</h3>
                                <p className="text-sm text-gray-400">{company.Ticker}</p>
                            </div>
                             <button
                                onClick={() => onAddToPortfolio(company)}
                                className="p-2 ml-2 rounded-full text-gray-400 bg-gray-900/40 hover:bg-accent-green hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label={`Add ${company.Company} to portfolio`}
                            >
                                <PlusIcon />
                            </button>
                        </div>
                        <div className="flex-grow my-2 cursor-pointer" onClick={() => onViewDetails(company)}>
                            <StockChart ticker={company.Ticker} />
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-white/10 pt-2 mt-2">
                            <span className="text-gray-400">YTD Performance</span>
                            <span className={`font-bold ${company.YTD_Performance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                {company.YTD_Performance >= 0 ? '+' : ''}{company.YTD_Performance.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {companies.length === 0 && <p className="text-center text-gray-500 col-span-full py-10">No companies match the current filters.</p>}
        </div>
    );
};

export default PerformanceView;