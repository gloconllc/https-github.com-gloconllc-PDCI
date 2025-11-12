import React, { useCallback } from 'react';
import { InvestmentTier, RiskLevel } from '../types';

interface FilterSidebarProps {
    filters: {
        search: string;
        tiers: Set<InvestmentTier>;
        risks: Set<RiskLevel>;
        category: string;
        maxPE: string;
        minGrowth: string;
        minCriticality: string;
        minUnivScore: string;
        showBlueChips: boolean;
    };
    onFilterChange: (filters: FilterSidebarProps['filters']) => void;
    categories: string[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, categories }) => {

    const handleTierChange = useCallback((tier: InvestmentTier) => {
        const newTiers = new Set(filters.tiers);
        if (newTiers.has(tier)) {
            newTiers.delete(tier);
        } else {
            newTiers.add(tier);
        }
        onFilterChange({ ...filters, tiers: newTiers });
    }, [filters, onFilterChange]);

    const handleRiskChange = useCallback((risk: RiskLevel) => {
        const newRisks = new Set(filters.risks);
        if (newRisks.has(risk)) {
            newRisks.delete(risk);
        } else {
            newRisks.add(risk);
        }
        onFilterChange({ ...filters, risks: newRisks });
    }, [filters, onFilterChange]);

    const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, category: e.target.value });
    }, [filters, onFilterChange]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({ ...filters, [e.target.name]: e.target.value });
    }, [filters, onFilterChange]);


    const tierOptions: { value: InvestmentTier; label: string; color: string }[] = [
      { value: InvestmentTier.MustBuy, label: 'Must Buy', color: 'border-accent-green' },
      { value: InvestmentTier.HighConviction, label: 'High Conviction', color: 'border-accent-blue' },
      { value: InvestmentTier.OnRadar, label: 'On Radar', color: 'border-gray-400' },
    ];
    
    const riskOptions = Object.values(RiskLevel);

    return (
        <div className="glass-panel p-4 sticky top-24">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Filters</h2>

            <div className="mb-6">
                <h3 className="font-semibold text-gray-300 mb-2">View Options</h3>
                <label htmlFor="blue-chip-toggle" className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-300">Show Blue Chips</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="blue-chip-toggle"
                            className="sr-only"
                            checked={filters.showBlueChips}
                            onChange={(e) => onFilterChange({ ...filters, showBlueChips: e.target.checked })}
                        />
                        <div className={`block w-10 h-6 rounded-full ${filters.showBlueChips ? 'bg-accent-blue' : 'bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.showBlueChips ? 'translate-x-full' : ''}`}></div>
                    </div>
                </label>
            </div>
            
            <div className="mb-6">
                <h3 className="font-semibold text-gray-300 mb-2">Investment Tier</h3>
                <div className="space-y-2">
                    {tierOptions.map(({value, label}) => (
                        <label key={value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.tiers.has(value)}
                                onChange={() => handleTierChange(value)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-accent-green focus:ring-accent-green"
                            />
                            <span className="text-gray-300">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

             <div className="mb-6">
                <h3 className="font-semibold text-gray-300 mb-2">Quantitative Filters</h3>
                <div className="space-y-3">
                    <div>
                        <label htmlFor="minUnivScore" className="block text-sm font-medium text-gray-400">Min Universal Score</label>
                        <input
                            type="number"
                            id="minUnivScore"
                            name="minUnivScore"
                            value={filters.minUnivScore}
                            onChange={handleInputChange}
                            placeholder="e.g., 90"
                            className="w-full mt-1 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        />
                    </div>
                     <div>
                        <label htmlFor="minCriticality" className="block text-sm font-medium text-gray-400">Min Criticality</label>
                        <select
                            id="minCriticality"
                            name="minCriticality"
                            value={filters.minCriticality}
                            onChange={handleInputChange}
                            className="w-full mt-1 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        >
                            <option value="">Any</option>
                            <option value="8">8+</option>
                            <option value="9">9+</option>
                            <option value="10">10</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="maxPE" className="block text-sm font-medium text-gray-400">Max P/E Ratio</label>
                        <input
                            type="number"
                            id="maxPE"
                            name="maxPE"
                            value={filters.maxPE}
                            onChange={handleInputChange}
                            placeholder="e.g., 50"
                            className="w-full mt-1 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        />
                    </div>
                    <div>
                        <label htmlFor="minGrowth" className="block text-sm font-medium text-gray-400">Min Revenue Growth (YoY %)</label>
                        <input
                            type="number"
                            id="minGrowth"
                            name="minGrowth"
                            value={filters.minGrowth}
                            onChange={handleInputChange}
                            placeholder="e.g., 20"
                            className="w-full mt-1 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-gray-300 mb-2">Category</h3>
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                    <option value="All">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div>
                <h3 className="font-semibold text-gray-300 mb-2">Risk Level</h3>
                <div className="grid grid-cols-2 gap-2">
                    {riskOptions.map(risk => (
                        <label key={risk} className="flex items-center space-x-2 cursor-pointer text-sm">
                            <input
                                type="checkbox"
                                checked={filters.risks.has(risk)}
                                onChange={() => handleRiskChange(risk)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-accent-green focus:ring-accent-green"
                            />
                            <span className="text-gray-300">{risk}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;