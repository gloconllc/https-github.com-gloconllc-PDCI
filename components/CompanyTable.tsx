import React from 'react';
import { Company, SortConfig, InvestmentTier, RiskLevel } from '../types';
import { SortIcon, PlusIcon } from './icons/Icons';

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

const getEsgColor = (score?: number) => {
    if (score === undefined) return 'bg-gray-600 text-gray-300';
    if (score > 75) return 'bg-green-800 text-green-300';
    if (score > 55) return 'bg-yellow-800 text-yellow-300';
    return 'bg-red-800 text-red-300';
};

const getGrahamColor = (score?: number) => {
    if (score === undefined) return 'text-gray-500';
    if (score >= 8) return 'text-accent-green';
    if (score >= 6) return 'text-yellow-400';
    return 'text-accent-red';
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
    return (
        <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                        <tr>
                            <Th sortKey="Company" onSort={onSort} sortConfig={sortConfig}>Company</Th>
                            <Th sortKey="Universal_Score" onSort={onSort} sortConfig={sortConfig}>Score</Th>
                            <Th sortKey="Graham_Score" onSort={onSort} sortConfig={sortConfig}>Graham</Th>
                            <Th sortKey="YTD_Performance" onSort={onSort} sortConfig={sortConfig} className="hidden sm:table-cell">YTD Perf.</Th>
                            <Th sortKey="Market_Cap_B" onSort={onSort} sortConfig={sortConfig} className="hidden md:table-cell">Mkt Cap (B)</Th>
                            <Th sortKey="Revenue_Growth_YoY" onSort={onSort} sortConfig={sortConfig} className="hidden lg:table-cell">Rev Growth</Th>
                            <Th sortKey="ESG_Score" onSort={onSort} sortConfig={sortConfig} className="hidden lg:table-cell">ESG</Th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Add</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {companies.map(company => (
                            <tr key={company.Ticker} className={`hover:bg-white/10 transition-colors duration-200 ${tierColorMap[company.Investment_Tier]}`}>
                                <td className="p-3 whitespace-nowrap cursor-pointer" onClick={() => onViewDetails(company)}>
                                    <div className="flex items-center">
                                        <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-8 h-8 rounded-full mr-3 object-contain bg-white" />
                                        <div>
                                            <div className="font-semibold text-gray-200">{company.Company}</div>
                                            <div className="text-sm text-gray-400">{company.Ticker}:{company.Exchange}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 whitespace-nowrap text-center cursor-pointer" onClick={() => onViewDetails(company)}>
                                    <span className="font-bold text-lg text-gray-200">{company.Universal_Score}</span>
                                </td>
                                <td className="p-3 whitespace-nowrap text-center cursor-pointer" onClick={() => onViewDetails(company)}>
                                    <span className={`font-bold text-lg ${getGrahamColor(company.Graham_Score)}`}>{company.Graham_Score ?? '-'}</span>
                                </td>
                                <td className="p-3 whitespace-nowrap hidden sm:table-cell cursor-pointer" onClick={() => onViewDetails(company)}>
                                    <span className={`font-semibold ${company.YTD_Performance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                        {company.YTD_Performance >= 0 ? '+' : ''}{company.YTD_Performance.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="p-3 whitespace-nowrap text-gray-300 hidden md:table-cell cursor-pointer" onClick={() => onViewDetails(company)}>{company.Market_Cap_B.toLocaleString()}</td>
                                <td className="p-3 whitespace-nowrap hidden lg:table-cell cursor-pointer" onClick={() => onViewDetails(company)}>
                                    <span className={`font-semibold ${company.Revenue_Growth_YoY >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                        {company.Revenue_Growth_YoY >= 0 ? '+' : ''}{company.Revenue_Growth_YoY.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="p-3 whitespace-nowrap text-center hidden lg:table-cell cursor-pointer" onClick={() => onViewDetails(company)}>
                                    {company.ESG_Score ? (
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEsgColor(company.ESG_Score)}`}>
                                            {company.ESG_Score}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">-</span>
                                    )}
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
                        ))}
                    </tbody>
                </table>
            </div>
             {companies.length === 0 && <p className="p-4 text-center text-gray-500">No companies match the current filters.</p>}
        </div>
    );
};

export default CompanyTable;