import React from 'react';
import { Company, SupplyChainData, InvestmentTier } from '../types';
import { PlusIcon } from './icons/Icons';

interface SupplyChainVisualizerProps {
    company: Company;
    allCompanies: Company[];
    supplyChainData: SupplyChainData;
    onViewDetails: (company: Company) => void;
    onAddToPortfolio: (company: Company) => void;
}

// Consistent styling map for tiers, aligning with the main table
const tierStyling: Record<InvestmentTier, { bg: string; border: string; }> = {
    [InvestmentTier.MustBuy]: { bg: 'bg-must-buy', border: 'border-accent-green' },
    [InvestmentTier.HighConviction]: { bg: 'bg-high-conviction', border: 'border-accent-blue' },
    [InvestmentTier.OnRadar]: { bg: 'bg-on-radar', border: 'border-gray-600' },
};


interface CompanyNodeProps {
    company: Company | undefined;
    isCenter?: boolean;
    isSupplier?: boolean;
    onClick: (company: Company) => void;
    onAddToPortfolio: (company: Company) => void;
}

const CompanyNode: React.FC<CompanyNodeProps> = ({ company, isCenter = false, isSupplier = false, onClick, onAddToPortfolio }) => {
    if (!company) {
        return (
            <div className="flex items-center justify-center p-2 m-2 border-2 border-dashed border-gray-600 rounded-lg h-16 bg-gray-800">
                <p className="text-xs text-gray-500">Unknown Company</p>
            </div>
        );
    }

    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToPortfolio(company);
    };

    const isCriticalSupplier = isSupplier && company.Criticality >= 9;

    const { bg, border } = tierStyling[company.Investment_Tier];
    let finalBorder = border;
    if (isCriticalSupplier) {
        finalBorder = 'border-yellow-400';
    }

    const baseClasses = "flex items-center p-2 rounded-lg transition-transform transform hover:scale-105 w-full relative cursor-pointer";
    const centerClasses = `shadow-lg border-4 ${finalBorder} h-20 ${bg}`;
    const sideClasses = `shadow-md border-2 ${finalBorder} h-16 ${bg}`;

    return (
        <div className="relative group mx-2 my-1" onClick={() => onClick(company)}>
            <div className={`${baseClasses} ${isCenter ? centerClasses : sideClasses}`}>
                <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-8 h-8 rounded-full object-contain bg-white flex-shrink-0" />
                <div className="ml-3 overflow-hidden">
                    <p className="font-semibold truncate text-gray-200">{company.Company}</p>
                    <p className="text-xs text-gray-400">{company.Ticker}</p>
                </div>
                 <button
                    onClick={handleAddClick}
                    className="absolute top-1 right-1 p-1 rounded-full text-gray-400 bg-gray-900/40 hover:bg-accent-green hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Add ${company.Company} to portfolio`}
                >
                    <div className="transform scale-75">
                        <PlusIcon />
                    </div>
                </button>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible z-20 left-1/2 -translate-x-1/2 pointer-events-none">
                <p className="font-bold text-sm text-gray-200">{company.Company} ({company.Ticker})</p>
                <p className="text-gray-400">{company.Supply_Chain_Role}</p>
                <p className={`text-xs mt-1 font-semibold`}>Tier: {company.Investment_Tier}</p>
                {isCriticalSupplier && (
                    <p className="text-yellow-400 text-xs mt-1 font-semibold">Critical Supplier (Score: {company.Criticality})</p>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
            </div>
        </div>
    );
};


const ConnectingLine: React.FC = () => (
    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-600"></div>
);

const SupplyChainVisualizer: React.FC<SupplyChainVisualizerProps> = ({ company, allCompanies, supplyChainData, onViewDetails, onAddToPortfolio }) => {
    const node = supplyChainData[company.Ticker];

    if (!node) {
        return <div className="text-center text-gray-500 p-4">No supply chain data available for this company.</div>;
    }

    const findCompany = (ticker: string) => allCompanies.find(c => c.Ticker === ticker);

    const suppliers = node.upstream.map(findCompany).filter(Boolean) as Company[];
    const customers = node.downstream.map(findCompany).filter(Boolean) as Company[];

    return (
        <div className="flex items-center justify-center w-full p-4 bg-gray-900/50 rounded-lg relative min-h-[150px]">
            {/* Upstream Column */}
            <div className="w-1/3 flex flex-col justify-center relative">
                <h4 className="text-center text-sm font-semibold text-gray-400 mb-2">Upstream Suppliers</h4>
                {suppliers.length > 0 ? suppliers.map(sup => (
                    <CompanyNode key={sup.Ticker} company={sup} isSupplier={true} onClick={onViewDetails} onAddToPortfolio={onAddToPortfolio} />
                )) : <p className="text-center text-xs text-gray-500">None defined</p>}
                {suppliers.length > 0 && <div className="absolute top-1/2 right-0 w-1/2 h-0.5 bg-gray-600 -translate-y-1/2"></div>}
            </div>

            {/* Center Column */}
            <div className="w-1/3 flex flex-col justify-center relative z-10">
                <CompanyNode company={company} isCenter onClick={onViewDetails} onAddToPortfolio={onAddToPortfolio} />
            </div>

            {/* Downstream Column */}
            <div className="w-1/3 flex flex-col justify-center relative">
                <h4 className="text-center text-sm font-semibold text-gray-400 mb-2">Downstream Customers</h4>
                {customers.length > 0 ? customers.map(cust => (
                    <CompanyNode key={cust.Ticker} company={cust} onClick={onViewDetails} onAddToPortfolio={onAddToPortfolio} />
                )) : <p className="text-center text-xs text-gray-500">End User / Integrator</p>}
                {customers.length > 0 && <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-gray-600 -translate-y-1/2"></div>}
            </div>

            {/* Connecting Lines Logic */}
            <div className="absolute inset-0 flex items-center -z-1">
                <div className="w-1/3 h-full relative">
                    {suppliers.map((_, index) => (
                        <React.Fragment key={index}>
                           <div className="absolute h-full w-0.5 bg-gray-600 right-0 top-0" style={{ height: '50%', top: '25%' }}></div>
                           <div 
                                className="absolute right-0 h-0.5 bg-gray-600"
                                style={{
                                    width: '8px',
                                    top: `calc(${(((index + 1) / (suppliers.length + 1)) * 100)}% - 1px)`
                                }}
                            ></div>
                        </React.Fragment>
                    ))}
                </div>
                 <div className="w-1/3"></div>
                 <div className="w-1/3 h-full relative">
                    {customers.map((_, index) => (
                         <React.Fragment key={index}>
                           <div className="absolute h-full w-0.5 bg-gray-600 left-0 top-0" style={{ height: '50%', top: '25%' }}></div>
                           <div 
                                className="absolute left-0 h-0.5 bg-gray-600"
                                style={{
                                    width: '8px',
                                    top: `calc(${(((index + 1) / (customers.length + 1)) * 100)}% - 1px)`
                                }}
                            ></div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SupplyChainVisualizer;