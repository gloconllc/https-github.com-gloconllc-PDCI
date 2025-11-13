/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Company, SortConfig, InvestmentTier } from '../types';
import { SortIcon, PlusIcon } from './icons/Icons';
import Sparkline from './Sparkline';

interface CompanyTableProps {
    companies: Company[];
    onViewDetails: (company: Company) => void;
    onAddToPortfolio: (company: Company) => void;
    onSort: (key: keyof Company) => void;
    sortConfig: SortConfig | null;
}

const tierColorMap: Record<InvestmentTier, string> = {
    [InvestmentTier.MustBuy]: 'border-l-4 border-accent-green bg-must-buy',
    [InvestmentTier.HighConviction]: 'border-l-4 border-accent-blue bg-high-conviction',
    [InvestmentTier.OnRadar]: 'border-l-4 border-gray-400 bg-on-radar'
};

const Th: React.FC<{ children: React.ReactNode; sortKey: keyof Company; onSort: (key: keyof Company) => void; sortConfig: SortConfig | null; className?: string; }> = ({ children, sortKey, onSort, sortConfig, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = isSorted ? sortConfig.direction : undefined;
    return (
        <th 
          className={`p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer ${className}`} 
          onClick={() => onSort(sortKey)}
          aria-sort={isSorted ? direction : 'none'}
        >
            <div className="flex items-center">
                {children}
                <SortIcon direction={direction} />
            </div>
        </th>
    );
};

const ROW_HEIGHT = 68; // Corresponds to h-17, adjust if row padding/content changes
const OVERSCAN = 5; // Number of rows to render above and below the viewport

const CompanyTable: React.FC<CompanyTableProps> = ({ companies, onViewDetails, onAddToPortfolio, onSort, sortConfig }) => {
    const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down'>>({});
    const prevPricesRef = useRef<Record<string, number>>({});
    
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const changes: Record<string, 'up' | 'down'> = {};
        companies.forEach(company => {
            const prevPrice = prevPricesRef.current[company.Ticker];
            if (prevPrice !== undefined && prevPrice !== company.Current_Price_USD) {
                changes[company.Ticker] = company.Current_Price_USD > prevPrice ? 'up' : 'down';
            }
        });
        // Update ref after comparison for the next render
        companies.forEach(company => {
            prevPricesRef.current[company.Ticker] = company.Current_Price_USD;
        });

        if (Object.keys(changes).length > 0) {
            setPriceChanges(changes);
            const timer = setTimeout(() => setPriceChanges({}), 700); // Duration of the flash animation
            return () => clearTimeout(timer);
        }
    }, [companies]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            setContainerHeight(container.clientHeight);
        });

        resizeObserver.observe(container);
        setContainerHeight(container.clientHeight); // Initial height

        return () => resizeObserver.disconnect();
    }, []);

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(event.currentTarget.scrollTop);
    }, []);

    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visibleRowCount = containerHeight > 0 ? Math.ceil(containerHeight / ROW_HEIGHT) + 2 * OVERSCAN : 0;
    const endIndex = Math.min(companies.length, startIndex + visibleRowCount);
    
    const visibleCompanies = companies.slice(startIndex, endIndex);

    const paddingTop = startIndex * ROW_HEIGHT;
    const paddingBottom = (companies.length - endIndex) * ROW_HEIGHT;

    return (
        <div ref={scrollContainerRef} onScroll={handleScroll} className="glass-panel overflow-y-auto h-[calc(100vh-350px)]">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 border-separate border-spacing-0">
                    <thead className="bg-white/5 sticky top-0 z-10">
                        <tr>
                            <Th sortKey="Company" onSort={onSort} sortConfig={sortConfig}>Company</Th>
                            <Th sortKey="Current_Price_USD" onSort={onSort} sortConfig={sortConfig}>Price</Th>
                            <Th sortKey="Universal_Score" onSort={onSort} sortConfig={sortConfig}>Score</Th>
                            <Th sortKey="Buy_Rank" onSort={onSort} sortConfig={sortConfig}>Rank</Th>
                            <Th sortKey="YTD_Performance" onSort={onSort} sortConfig={sortConfig} className="hidden md:table-cell">YTD %</Th>
                            <Th sortKey="Revenue_Growth_YoY" onSort={onSort} sortConfig={sortConfig} className="hidden lg:table-cell">Growth</Th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Add</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 relative">
                        {paddingTop > 0 && (
                            <tr>
                                <td colSpan={8} />
                            </tr>
                        )}
                        {visibleCompanies.map(company => {
                            const change = priceChanges[company.Ticker];
                            const flashClass = change === 'up' ? 'flash-green' : change === 'down' ? 'flash-red' : '';
                            return (
                                <tr key={company.Ticker} className={`${tierColorMap[company.Investment_Tier]} ${flashClass} ${company.isBlueChip ? 'opacity-80 hover:opacity-100 transition-opacity' : ''}`} style={{ height: `${ROW_HEIGHT}px` }}>
                                    <td className="p-3 whitespace-nowrap cursor-pointer" onClick={() => onViewDetails(company)}>
                                        <div className="flex items-center">
                                            <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-8 h-8 rounded-full mr-3 object-contain bg-white" />
                                            <div>
                                                <div className="font-semibold text-gray-200 flex items-center">
                                                    {company.Company}
                                                    {company.isBlueChip && (
                                                        <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-blue-900/50 text-blue-300 border border-blue-500/50">
                                                            BLUE CHIP
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-400">{company.Ticker}:{company.Exchange}</div>
                                            </div>
                                        </div>
                                    </td>
                                     <td className="p-3 whitespace-nowrap font-mono cursor-pointer" onClick={() => onViewDetails(company)}>
                                        <span className={change === 'up' ? 'text-accent-green' : change === 'down' ? 'text-accent-red' : 'text-gray-200'}>
                                            ${company.Current_Price_USD.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-center cursor-pointer" onClick={() => onViewDetails(company)}>
                                        <span className="font-bold text-lg text-gray-200">{company.Universal_Score}</span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-center font-mono cursor-pointer" onClick={() => onViewDetails(company)}>{company.Buy_Rank || 'N/A'}</td>
                                    <td className="p-3 whitespace-nowrap text-center font-mono hidden md:table-cell cursor-pointer" onClick={() => onViewDetails(company)}>
                                       <span className={company.YTD_Performance >= 0 ? 'text-accent-green' : 'text-accent-red'}>
                                            {company.YTD_Performance >= 0 ? '+' : ''}{company.YTD_Performance.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap hidden lg:table-cell cursor-pointer" onClick={() => onViewDetails(company)}>
                                        <span className={`font-semibold ${company.Revenue_Growth_YoY >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                            {company.Revenue_Growth_YoY >= 0 ? '+' : ''}{company.Revenue_Growth_YoY.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        <button
                                            onClick={() => onAddToPortfolio(company)}
                                            className="btn btn-ghost-success rounded-full"
                                            aria-label={`Add ${company.Company} to portfolio`}
                                        >
                                            <PlusIcon />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        {paddingBottom > 0 && (
                            <tr>
                                <td colSpan={8} />
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
             {companies.length === 0 && <p className="p-4 text-center text-gray-500">No companies match the current filters.</p>}
        </div>
    );
};

export default CompanyTable;