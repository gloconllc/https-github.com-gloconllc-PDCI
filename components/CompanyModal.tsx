import React from 'react';
import { Company, InvestmentTier, RiskLevel, Substitutability } from '../types';
import { CloseIcon } from './icons/Icons';

interface CompanyModalProps {
    company: Company;
    onClose: () => void;
    onAddToPortfolio: (company: Company) => void;
}

const tierColorMap: Record<InvestmentTier, string> = {
    [InvestmentTier.MustBuy]: 'bg-accent-green text-black',
    [InvestmentTier.HighConviction]: 'bg-accent-blue text-white',
    [InvestmentTier.OnRadar]: 'bg-gray-400 text-black'
};

const riskColorMap: Record<RiskLevel, string> = {
    [RiskLevel.Conservative]: 'bg-blue-900 text-blue-300',
    [RiskLevel.Moderate]: 'bg-yellow-900 text-yellow-300',
    [RiskLevel.Aggressive]: 'bg-orange-900 text-orange-300',
    [RiskLevel.High]: 'bg-red-900 text-red-300',
};

const substitutabilityColorMap: Record<Substitutability, string> = {
    'Impossible': 'border-red-500 text-red-400',
    'Difficult': 'border-orange-500 text-orange-400',
    'Moderate': 'border-yellow-500 text-yellow-400',
    'Easy': 'border-green-500 text-green-400',
};

// FIX: Made the 'value' prop optional to allow for cases where only children are passed.
const DetailItem: React.FC<{ label: string; value?: string | number; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <h4 className="text-sm text-gray-400 font-semibold uppercase tracking-wider">{label}</h4>
        {value && <p className="text-gray-200 text-lg">{value}</p>}
        {children}
    </div>
);

const BIMetric: React.FC<{ label: string; value: string | number; description: string; }> = ({ label, value, description }) => (
    <div className="bg-gray-900 p-3 rounded-lg text-center">
        <h4 className="text-sm text-gray-400 font-semibold uppercase tracking-wider">{label}</h4>
        <p className="text-2xl font-bold text-gray-100 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
);


const CompanyModal: React.FC<CompanyModalProps> = ({ company, onClose, onAddToPortfolio }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-700 p-4 border-b border-gray-600 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-16 h-16 rounded-lg object-contain bg-white p-1" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-100">{company.Company} ({company.Ticker})</h2>
                            <p className="text-gray-400">{company.Sub_Category}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-600">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 border-b border-gray-700 pb-6">
                        <DetailItem label="Univ. Score">
                           <span className="text-4xl font-bold text-accent-green">{company.Universal_Score}</span>
                        </DetailItem>
                        <DetailItem label="Price (USD)" value={`$${company.Current_Price_USD.toFixed(2)}`} />
                        <DetailItem label="Market Cap (B)" value={`$${company.Market_Cap_B.toLocaleString()}`} />
                        <DetailItem label="YTD Perf.">
                            <span className={`text-lg font-semibold ${company.YTD_Performance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {company.YTD_Performance > 0 ? '+' : ''}{company.YTD_Performance}%
                            </span>
                        </DetailItem>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center mb-6">
                         <span className={`px-3 py-1 text-sm font-bold rounded-full ${tierColorMap[company.Investment_Tier]}`}>
                            {company.Investment_Tier}
                        </span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${riskColorMap[company.Risk_Level]}`}>
                            Risk: {company.Risk_Level}
                        </span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${substitutabilityColorMap[company.Substitutability]}`}>
                            Substitutability: {company.Substitutability}
                        </span>
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-600 text-gray-200">
                            Criticality: {company.Criticality}/10
                        </span>
                    </div>

                     <div className="space-y-6">
                        <div className="pt-6 border-t border-gray-700">
                             <h3 className="text-lg font-semibold text-accent-green mb-4">Business Intelligence Metrics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <BIMetric label="Constraint (SCSI)" value={company.SCSI} description="Higher = More Pricing Power" />
                                <BIMetric label="Supply Chain Depth" value={company.Supply_Chain_Depth_Score} description="Higher = Deeper Moat" />
                                <BIMetric label="Substitutability" value={company.Substitutability_Score} description="Lower = Stronger Moat" />
                                <BIMetric label="Country" value={company.Country} description="Geographic Base" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-accent-green mb-2">Product / Component</h3>
                            <p className="text-gray-300">{company.Product_Component}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-accent-green mb-2">Universal Presence</h3>
                            <p className="text-gray-300">{company.Universal_Presence}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-accent-green mb-2">Recent Developments (2024-2025)</h3>
                            <p className="text-gray-300">{company.Recent_Contracts_2024_2025}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-accent-green mb-2">Growth Driver</h3>
                            <p className="text-gray-300">{company.Growth_Driver}</p>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold text-accent-green mb-2">Competitive Position</h3>
                            <p className="text-gray-300">{company.Competitive_Position} - <span className="italic">{company.Supply_Chain_Role}</span></p>
                        </div>
                    </div>
                </div>
                 <div className="mt-auto bg-gray-700 p-4 border-t border-gray-600">
                    <button 
                        onClick={() => {
                            onAddToPortfolio(company);
                            onClose();
                        }}
                        className="w-full bg-accent-green text-black font-bold py-3 px-4 rounded-md hover:bg-green-400 transition-colors"
                    >
                        Add to Portfolio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyModal;
