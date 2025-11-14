/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Company, SortConfig, InvestmentTier, StockPrediction } from '../types';
import { SortIcon, PlusIcon, BrainCircuitIcon, BookmarkIcon } from './icons/Icons';
import Sparkline from './Sparkline';

interface CompanyTableProps {
    companies: Company[];
    onViewDetails: (company: Company) => void;
    onAddToPortfolio: (company: Company) => void;
    onAddToWatchlist: (company: Company) => void;
    onSort: (key: keyof Company) => void;
    sortConfig: SortConfig | null;
    predictions: Record<string, StockPrediction>;
    predictionsLoading: Record<string, boolean>;
    fetchPrediction: (company: Company) => void;
    visibleColumns: Set<keyof Company>;
}

const tierColorMap: Record<InvestmentTier, string> = {
    [InvestmentTier.MustBuy]: 'border-l-4 border-accent-green bg-must-buy',
    [InvestmentTier.HighConviction]: 'border-l-4 border-accent-blue bg-high-conviction',
    [InvestmentTier.OnRadar]: 'border-l-4 border-gray-400 bg-on-radar'
};

const getGeoRiskColor = (score: number): string => {
    if (score <= 30) return 'text-accent-green';
    if (score <= 65) return 'text-yellow-400';
    if (score <= 80) return 'text-orange-500';
    return 'text-accent-red';
};

const getESGColor = (score: number): string => {
    if (score >= 80) return 'text-accent-green';
    if (score >= 65) return 'text-yellow-400';
    return 'text-accent-red';
};

const getPredictionColorClass = (prediction: StockPrediction['prediction']) => {
    switch (prediction) {
        case 'Bullish':
        case 'Outperform':
            return 'bg-accent-green/20 text-accent-green';
        case 'Bearish':
        case 'Underperform':
            return 'bg-accent-red/20 text-accent-red';
        default:
            return 'bg-gray-600/50 text-gray-300';
    }
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

const CompanyTable: React.FC<CompanyTableProps> = ({ companies, onViewDetails, onAddToPortfolio, onAddToWatchlist, onSort, sortConfig, predictions, predictionsLoading, fetchPrediction, visibleColumns }) => {
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
    
    const visibleCompanies = useMemo(() => {
        return companies.slice(startIndex, endIndex);
    }, [companies, startIndex, endIndex]);

    useEffect(() => {
        visibleCompanies.forEach(company => {
            fetchPrediction(company);
        });
    }, [visibleCompanies, fetchPrediction]);

    const paddingTop = startIndex * ROW_HEIGHT;
    const paddingBottom = (companies.length - endIndex) * ROW_HEIGHT;
    const colSpan = 8 + visibleColumns.size;

    return (
        <div ref={scrollContainerRef} onScroll={handleScroll} className="glass-panel overflow-y-auto h-[calc(100vh-350px)]">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 border-separate border-spacing-0">
                    <thead className="bg-white/5 sticky top-0 z-10">
                        <tr>
                            <Th sortKey="Company" onSort={onSort} sortConfig={sortConfig}>Company</Th>
                            <Th sortKey="Current_Price_USD" onSort={onSort} sortConfig={sortConfig}>Price</Th>
                            <Th sortKey="Universal_Score" onSort={onSort} sortConfig={sortConfig}>Score</Th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                    <BrainCircuitIcon className="w-4 h-4" />
                                    <span>PDCI Outlook</span>
                                </div>
                            </th>
                            {visibleColumns.has('Sub_Category') && (
                                <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Sub Category</th>
                            )}
                            {visibleColumns.has('Supply_Chain_Role') && (
                                <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Supply Chain Role</th>
                            )}
                            {visibleColumns.has('Growth_Driver') && (
                                <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Growth Driver</th>
                            )}
                            <Th sortKey="Geopolitical_Risk_Score" onSort={onSort} sortConfig={sortConfig} className="hidden sm:table-cell">Geo Risk</Th>
                            <Th sortKey="ESG_Score" onSort={onSort} sortConfig={sortConfig} className="hidden lg:table-cell">ESG</Th>
                            <Th sortKey="YTD_Performance" onSort={onSort} sortConfig={sortConfig} className="hidden md:table-cell">YTD %</Th>
                            <th className="p-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 relative">
                        {paddingTop > 0 && (
                            <tr>
                                <td style={{ height: `${paddingTop}px` }} colSpan={12} />
                            </tr>
                        )}
                        {visibleCompanies.map(company => {
                            const change = priceChanges[company.Ticker];
                            const flashClass = change === 'up' ? 'flash-green' : change === 'down' ? 'flash-red' : '';
                            const prediction = predictions[company.Ticker];
                            const isLoadingPrediction = predictionsLoading[company.Ticker];
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
                                    <td className="p-3 whitespace-nowrap text-center hidden lg:table-cell">
                                        {prediction ? (
                                            <div title={`Confidence: ${prediction.confidence}%. Timescale: ${prediction.timescale}. Rationale: ${prediction.rationale}`}>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPredictionColorClass(prediction.prediction)}`}>
                                                    {prediction.prediction}
                                                </span>
                                            </div>
                                        ) : isLoadingPrediction ? (
                                            <div className="w-4 h-4 border-2 border-gray-600 border-t-accent-blue rounded-full animate-spin mx-auto"></div>
                                        ) : (
                                            <span className="text-gray-600">-</span>
                                        )}
                                    </td>
                                    {visibleColumns.has('Sub_Category') && (
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-400 hidden lg:table-cell" title={company.Sub_Category}>{company.Sub_Category}</td>
                                    )}
                                    {visibleColumns.has('Supply_Chain_Role') && (
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-400 hidden lg:table-cell" title={company.Supply_Chain_Role}>{company.Supply_Chain_Role}</td>
                                    )}
                                    {visibleColumns.has('Growth_Driver') && (
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-400 hidden lg:table-cell" title={company.Growth_Driver}>{company.Growth_Driver}</td>
                                    )}
                                    <td className="p-3 whitespace-nowrap text-center font-mono hidden sm:table-cell cursor-pointer" onClick={() => onViewDetails(company)}>
                                        <span className={`font-bold ${getGeoRiskColor(company.Geopolitical_Risk_Score)}`}>
                                            {company.Geopolitical_Risk_Score}
                                        </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-center font-mono hidden lg:table-cell cursor-pointer" onClick={() => onViewDetails(company)}>
                                        {company.ESG_Score !== undefined && company.ESG_Score !== null ? (
                                            <span className={`font-bold ${getESGColor(company.ESG_Score)}`}>
                                                {company.ESG_Score}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-center font-mono hidden md:table-cell cursor-pointer" onClick={() => onViewDetails(company)}>
                                       <span className={company.YTD_Performance >= 0 ? 'text-accent-green' : 'text-accent-red'}>
                                            {company.YTD_Performance >= 0 ? '+' : ''}{company.YTD_Performance.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-center">
                                        <div className="flex justify-center items-center gap-1">
                                            <button
                                                onClick={() => onAddToPortfolio(company)}
                                                className="btn btn-ghost-success rounded-full"
                                                aria-label={`Add ${company.Company} to portfolio`}
                                                title="Add to Portfolio"
                                            >
                                                <PlusIcon />
                                            </button>
                                            <button
                                                onClick={() => onAddToWatchlist(company)}
                                                className="btn btn-ghost rounded-full"
                                                aria-label={`Add ${company.Company} to watchlist`}
                                                title="Add to Watchlist"
                                            >
                                                <BookmarkIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {paddingBottom > 0 && (
                            <tr>
                                <td style={{ height: `${paddingBottom}px` }} colSpan={12} />
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