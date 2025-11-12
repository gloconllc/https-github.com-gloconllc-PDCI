import React, { useState, useEffect, useRef } from 'react';
import { Company, SortConfig, InvestmentTier, RiskLevel } from '../types';
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
        <th className={`p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => onSort(sortKey)}>
            <div className="flex items-center">
                {children}
                <SortIcon direction={direction} />
            </div>
        </th>
    );
};


const CompanyTable: React.FC<CompanyTableProps> = ({ companies, onViewDetails, onAddToPortfolio, onSort, sortConfig }) => {
    const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down'>>({});
    const prevPricesRef = useRef<Record<string, number>>({});

    useEffect(() => {
        const changes: Record<string, 'up' | 'down'> = {};
        companies.forEach(company => {
            const prevPrice = prevPricesRef.current[company.Ticker];
            if (prevPrice !== undefined && prevPrice !== company.Current_Price_USD) {
                changes[company.Ticker] = company.Current_Price_USD > prevPrice ? 'up' : 'down';
            }
            prevPricesRef.current[company.Ticker] = company.Current_Price_USD;
        });

        if (Object.keys(changes).length > 0) {
            setPriceChanges(changes);
            const timer = setTimeout(() => setPriceChanges({}), 700); // Duration of the flash animation
            return () => clearTimeout(timer);
        }
    }, [companies]);
    
    return (
        <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                        <tr>
                            <Th sortKey="Company" onSort={onSort} sortConfig={sortConfig}>Company</Th>
                            <Th sortKey="Current_Price_USD" onSort={onSort} sortConfig={sortConfig}>Price</Th>
                            <Th sortKey="Universal_Score" onSort={onSort} sortConfig={sortConfig}>Score</Th>
                            <Th sortKey="Market_Cap_B" onSort={onSort} sortConfig={sortConfig} className="hidden md:table-cell">Mkt Cap (B)</Th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">60-Day Trend</th>
                            <Th sortKey="Revenue_Growth_YoY" onSort={onSort} sortConfig={sortConfig} className="hidden lg:table-cell">Growth</Th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Add</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {companies.map(company => {
                            const change = priceChanges[company.Ticker];
                            const flashClass = change === 'up' ? 'flash-green' : change === 'down' ? 'flash-red' : '';
                            return (
                                <tr key={company.Ticker} className={`${tierColorMap[company.Investment_Tier]} ${flashClass} ${company.isBlueChip ? 'opacity-80 hover:opacity-100 transition-opacity' : ''}`}>
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
                                    <td className="p-3 whitespace-nowrap text-gray-300 hidden md:table-cell cursor-pointer font-mono" onClick={() => onViewDetails(company)}>${company.Market_Cap_B.toFixed(2)}</td>
                                    <td className="p-3 hidden lg:table-cell" onClick={() => onViewDetails(company)}>
                                        <div className="w-24 h-10">
                                            <Sparkline ticker={company.Ticker} />
                                        </div>
                                    </td>
                                    <td className="p-3 whitespace-nowrap hidden lg:table-cell cursor-pointer" onClick={() => onViewDetails(company)}>
                                        <span className={`font-semibold ${company.Revenue_Growth_YoY >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                            {company.Revenue_Growth_YoY >= 0 ? '+' : ''}{company.Revenue_Growth_YoY.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        <button
                                            onClick={() => onAddToPortfolio(company)}
                                            className="p-2 rounded-full text-gray-400 hover:bg-accent-green hover:text-white transition-colors duration-200"
                                            aria-label={`Add ${company.Company} to portfolio`}
                                        >
                                            <PlusIcon />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
             {companies.length === 0 && <p className="p-4 text-center text-gray-500">No companies match the current filters.</p>}
        </div>
    );
};

export default CompanyTable;