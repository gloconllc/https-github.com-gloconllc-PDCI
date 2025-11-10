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

const riskColorMap: Record<RiskLevel, string> = {
    [RiskLevel.Conservative]: 'bg-blue-900 text-blue-300',
    [RiskLevel.Moderate]: 'bg-yellow-900 text-yellow-300',
    [RiskLevel.Aggressive]: 'bg-orange-900 text-orange-300',
    [RiskLevel.High]: 'bg-red-900 text-red-300',
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
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <Th sortKey="Company" onSort={onSort} sortConfig={sortConfig}>Company</Th>
                            <Th sortKey="Universal_Score" onSort={onSort} sortConfig={sortConfig}>Score</Th>
                            <Th sortKey="Market_Cap_B" onSort={onSort} sortConfig={sortConfig} className="hidden md:table-cell">Market Cap (B)</Th>
                            <Th sortKey="YTD_Performance" onSort={onSort} sortConfig={sortConfig} className="hidden lg:table-cell">YTD</Th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Add</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {companies.map(company => (
                            <tr key={company.Ticker} className={`hover:bg-gray-700 transition-colors duration-200 ${tierColorMap[company.Investment_Tier]}`}>
                                <td className="p-3 whitespace-nowrap cursor-pointer" onClick={() => onViewDetails(company)}>
                                    <div className="flex items-center">
                                        <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-8 h-8 rounded-full mr-3 object-contain bg-white" />
                                        <div>
                                            <div className="font-semibold text-gray-200">{company.Company}</div>
                                            <div className="text-sm text-gray-400">{company.Ticker}:{company.Exchange}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 whitespace-nowrap text-center" onClick={() => onViewDetails(company)}>
                                    <span className="font-bold text-lg text-gray-200">{company.Universal_Score}</span>
                                </td>
                                <td className="p-3 whitespace-nowrap text-gray-300 hidden md:table-cell" onClick={() => onViewDetails(company)}>${company.Market_Cap_B.toLocaleString()}</td>
                                <td className="p-3 whitespace-nowrap hidden lg:table-cell" onClick={() => onViewDetails(company)}>
                                    <span className={`font-semibold ${company.YTD_Performance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {company.YTD_Performance > 0 ? '+' : ''}{company.YTD_Performance}%
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
                        ))}
                    </tbody>
                </table>
            </div>
             {companies.length === 0 && <p className="p-4 text-center text-gray-500">No companies match the current filters.</p>}
        </div>
    );
};

export default CompanyTable;