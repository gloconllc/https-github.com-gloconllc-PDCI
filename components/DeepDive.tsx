
import React, { useState } from 'react';
import { Company } from '../types';
import { PlusIcon } from './icons/Icons';

interface DeepDiveProps {
    allCompanies: Company[];
    onViewDetails: (company: Company) => void;
    onAddToPortfolio: (company: Company) => void;
}

const deepDiveStructure = [
    {
        system: "Compute & Networking",
        components: [
            { name: "GPUs", tickers: ["NVDA"] },
            { name: "Memory (HBM)", tickers: ["000660.KS"] },
            { name: "Networking (Switches, ASICs)", tickers: ["ANET", "AVGO"] },
            { name: "Servers & Systems", tickers: ["SMCI", "DELL"] }
        ],
        materials: [
            { name: "Foundry Services", tickers: ["TSM"] },
            { name: "Lithography Equipment", tickers: ["ASML"] },
            { name: "Silicon Wafers", tickers: ["6488.TWO", "3436.T"] },
            { name: "Purity & Materials", tickers: ["ENTG", "DD"] }
        ]
    },
    {
        system: "Power Infrastructure",
        components: [
            { name: "UPS, PDUs & Switchgear", tickers: ["ETN", "SIEGY", "VRT"] },
            { name: "Enclosures & Racks", tickers: ["NVT"] },
            { name: "Power Cables", tickers: ["PRY.MI"] }
        ],
        materials: [
            { name: "Connectors & Sensors", tickers: ["TEL", "APH"] },
            { name: "Copper", tickers: ["FCX", "SCCO"] }
        ]
    },
    {
        system: "Cooling Systems",
        components: [
            { name: "Liquid Cooling Solutions", tickers: ["VRT", "NVT"] },
            { name: "Fluid & Gas Handling", tickers: ["PH"] }
        ],
        materials: [
            { name: "Dielectric Fluids", tickers: ["CC"] },
            { name: "Specialty Polymers", tickers: ["DD"] }
        ]
    },
    {
        system: "Physical Infrastructure",
        components: [
            { name: "Cable Trays & Conduits", tickers: ["ATKR"] },
            { name: "Structural Steel & Flooring", tickers: ["NUE", "KGP.L"] }
        ],
        materials: [
             { name: "Rare Earth Magnets", tickers: ["MP"] }
        ]
    }
];

type Strategy = 'GARP' | 'Deep Value' | 'Resilience';

const checkStrategyFit = (company: Company, strategy: Strategy | null): boolean => {
    if (!strategy) return false;
    switch (strategy) {
        case 'GARP':
            // Refined GARP: Focus on strong growth (>20%) with a reasonable forward valuation (<45).
            return company.Revenue_Growth_YoY > 20 && company.Forward_PE < 45 && company.Forward_PE > 0;
        case 'Deep Value':
            // Deep Value: Prioritize companies with a Graham Score of 7 or higher and a P/E Ratio less than 20.
            return (company.Graham_Score ?? 0) >= 7 && company.PE_Ratio < 20 && company.PE_Ratio > 0;
        case 'Resilience':
            // Refined Resilience: Prioritize companies that are highly critical (>=9) and represent a severe supply chain bottleneck (high SCSI score > 300).
            return company.Criticality >= 9 && company.SCSI > 300;
        default:
            return false;
    }
};

const CompanyCard: React.FC<{ company: Company; onViewDetails: (c: Company) => void; onAddToPortfolio: (c: Company) => void; isHighlighted: boolean; }> = ({ company, onViewDetails, onAddToPortfolio, isHighlighted }) => {
    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToPortfolio(company);
    };

    const highlightClass = isHighlighted ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20 bg-yellow-400/10' : 'border-white/10';

    return (
        <div className="relative group" onClick={() => onViewDetails(company)}>
            <div className={`bg-black/30 p-2 rounded-lg border flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all duration-200 ${highlightClass}`}>
                <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-8 h-8 rounded-full object-contain bg-white flex-shrink-0" />
                <div className="min-w-0">
                    <p className="font-semibold text-gray-200 text-sm truncate">{company.Company}</p>
                    <p className="text-xs text-gray-400">{company.Ticker}</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="absolute top-1 right-1 p-1 rounded-full text-gray-400 bg-gray-900/40 hover:bg-accent-green hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Add ${company.Company} to portfolio`}
                >
                    <PlusIcon />
                </button>
            </div>
        </div>
    );
};


const DeepDive: React.FC<DeepDiveProps> = ({ allCompanies, onViewDetails, onAddToPortfolio }) => {
    const [openSection, setOpenSection] = useState<string | null>(deepDiveStructure[0].system);
    const [strategyOverlay, setStrategyOverlay] = useState<Strategy | null>(null);

    const findCompany = (ticker: string) => allCompanies.find(c => c.Ticker === ticker);

    const strategyButtons: { name: Strategy, label: string }[] = [
        { name: 'GARP', label: 'GARP' },
        { name: 'Deep Value', label: 'Deep Value' },
        { name: 'Resilience', label: 'Resilience' }
    ];

    return (
        <div className="space-y-6">
            <div className="text-center">
                 <h1 className="text-3xl font-bold text-gray-200">PDCI Deep Dive Explorer</h1>
                 <p className="text-gray-400">Deconstruct the data center to uncover granular investment opportunities.</p>
                 <p className="text-xs text-gray-600 mt-1">Core logic by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.</p>
            </div>
            <div className="glass-panel p-3">
                 <div className="flex items-center justify-center gap-4">
                    <span className="font-semibold text-gray-300">Strategy Overlay:</span>
                     {strategyButtons.map(s => (
                        <button 
                            key={s.name}
                            onClick={() => setStrategyOverlay(prev => prev === s.name ? null : s.name)}
                            className={`px-4 py-1.5 text-sm rounded-full border-2 transition-colors ${strategyOverlay === s.name ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black/20 border-gray-600 hover:border-gray-400 text-gray-300'}`}
                        >{s.label}</button>
                     ))}
                 </div>
            </div>

            {deepDiveStructure.map(section => (
                <div key={section.system} className="glass-panel overflow-hidden">
                    <button
                        className="w-full p-4 text-left bg-white/5 hover:bg-white/10 transition-colors"
                        onClick={() => setOpenSection(openSection === section.system ? null : section.system)}
                    >
                        <h2 className="text-xl font-semibold text-gray-100">{section.system}</h2>
                    </button>
                    {openSection === section.system && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-accent-blue mb-2">Components & Systems</h3>
                                {section.components.map(comp => (
                                    <div key={comp.name} className="mb-3">
                                        <p className="text-sm text-gray-400 font-semibold mb-1">{comp.name}</p>
                                        <div className="space-y-2">
                                            {comp.tickers.map(findCompany).filter(Boolean).map(c => (
                                                <CompanyCard key={c.Ticker} company={c} onViewDetails={onViewDetails} onAddToPortfolio={onAddToPortfolio} isHighlighted={checkStrategyFit(c, strategyOverlay)} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <div>
                                <h3 className="font-bold text-accent-green mb-2">Underlying Materials & Equipment</h3>
                                {section.materials.length > 0 ? section.materials.map(mat => (
                                    <div key={mat.name} className="mb-3">
                                        <p className="text-sm text-gray-400 font-semibold mb-1">{mat.name}</p>
                                        <div className="space-y-2">
                                            {mat.tickers.map(findCompany).filter(Boolean).map(c => (
                                                <CompanyCard key={c.Ticker} company={c} onViewDetails={onViewDetails} onAddToPortfolio={onAddToPortfolio} isHighlighted={checkStrategyFit(c, strategyOverlay)} />
                                            ))}
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-gray-600 italic">No specific publicly-traded material suppliers in this category.</p>}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default DeepDive;
