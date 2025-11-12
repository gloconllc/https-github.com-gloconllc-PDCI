import React from 'react';
import { Company } from '../types';
import { CloseIcon, PlusIcon } from './icons/Icons';
import { companiesData } from '../constants';
import { supplyChainData } from '../lib/supplyChainData';
import SupplyChainVisualizer from './SupplyChainVisualizer';
import StockChart from './StockChart';
import Gauge from './Gauge';
import PeerComparison from './PeerComparison';

interface CompanyModalProps {
    company: Company;
    onClose: () => void;
    onAddToPortfolio: (company: Company) => void;
    viewCompanyDetails: (company: Company) => void;
}

const Stat: React.FC<{ label: string; value: string | number; subValue?: string; className?: string }> = ({ label, value, subValue, className = '' }) => (
    <div className={`bg-black/20 p-3 rounded-md ${className}`}>
        <h4 className="text-xs text-gray-400 uppercase tracking-wider">{label}</h4>
        <p className="text-xl font-bold text-gray-100">{value}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
    </div>
);


const CompanyModal: React.FC<CompanyModalProps> = ({ company, onClose, onAddToPortfolio, viewCompanyDetails }) => {

    const growthColor = company.Revenue_Growth_YoY >= 0 ? 'text-accent-green' : 'text-accent-red';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-7xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-10 h-10 rounded-full object-contain bg-white" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-100">{company.Company}</h2>
                            <p className="text-sm text-gray-400">{company.Ticker}:{company.Exchange}</p>
                        </div>
                         <div className="ml-4 flex items-center gap-2">
                             <span className={`font-semibold px-2 py-0.5 rounded-full text-xs bg-must-buy text-accent-green border border-accent-green/50`}>{company.Investment_Tier}</span>
                             <span className={`font-semibold px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300`}>{company.Risk_Level}</span>
                         </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button
                            onClick={() => onAddToPortfolio(company)}
                            className="neuro-button flex items-center gap-2 bg-accent-green text-black font-bold py-2 px-4"
                            aria-label={`Add ${company.Company} to portfolio`}
                        >
                            <PlusIcon /> Add to Portfolio
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column - Main Chart & Info */}
                        <div className="lg:col-span-8 space-y-6">
                             <div className="glass-panel p-4">
                                <h3 className="font-semibold text-gray-200 mb-2">Simulated Price History (60 Days)</h3>
                                <div className="h-64">
                                  <StockChart ticker={company.Ticker} />
                                </div>
                            </div>
                            <div className="glass-panel p-4">
                                <h3 className="font-semibold text-gray-200 mb-2">Company Overview</h3>
                                <p className="text-sm text-gray-300">
                                    {company.Company} is a key player in the <span className="font-semibold text-accent-blue">{company.Category}</span> sector, specializing in <span className="font-semibold text-accent-blue">{company.Sub_Category}</span>. 
                                    Their primary contribution is <span className="font-semibold text-gray-200">{company.Product_Component}</span>, making them a <span className="font-semibold text-gray-200">{company.Competitive_Position}</span> in the AI supply chain.
                                </p>
                            </div>
                             <div className="glass-panel p-4">
                                <h3 className="text-xl font-semibold text-gray-200 mb-3">Supply Chain Position</h3>
                                <SupplyChainVisualizer 
                                    company={company} 
                                    allCompanies={companiesData}
                                    supplyChainData={supplyChainData}
                                    onViewDetails={viewCompanyDetails}
                                    onAddToPortfolio={onAddToPortfolio}
                                />
                            </div>
                        </div>
                        
                        {/* Right Column - KPIs & Metrics */}
                        <div className="lg:col-span-4 space-y-6">
                             <div className="glass-panel p-4">
                                <h3 className="font-semibold text-gray-200 mb-2">PDCI Universal Score</h3>
                                <p className="text-7xl font-bold text-center text-accent-blue py-4">{company.Universal_Score}</p>
                            </div>
                            <div className="glass-panel p-4">
                                <h3 className="font-semibold text-gray-200 mb-3">PDCI BI Gauges</h3>
                                <div className="grid grid-cols-3 gap-2">
                                  <Gauge value={company.Criticality} max={10} label="Criticality" />
                                  <Gauge value={company.Graham_Score || 0} max={10} label="Graham Score" />
                                  <Gauge value={company.ESG_Score || 0} max={100} label="ESG Score" />
                                </div>
                            </div>
                             <div className="glass-panel p-4">
                                <h3 className="font-semibold text-gray-200 mb-3">Key Metrics</h3>
                                 <div className="grid grid-cols-2 gap-3">
                                    <Stat label="P/E Ratio" value={company.PE_Ratio.toFixed(1)} subValue={`Fwd: ${company.Forward_PE.toFixed(1)}`} />
                                    <Stat label="Rev Growth (YoY)" value={`${company.Revenue_Growth_YoY.toFixed(1)}%`} className={growthColor} />
                                    <Stat label="Debt-to-Equity" value={company.Debt_to_Equity.toFixed(2)} />
                                    <Stat label="Market Cap (B)" value={`$${company.Market_Cap_B.toFixed(1)}`} />
                                </div>
                            </div>
                            <PeerComparison company={company} allCompanies={companiesData} onViewDetails={viewCompanyDetails} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyModal;