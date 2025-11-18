/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useCallback } from 'react';
import { InvestmentTier, RiskLevel, GeopoliticalRiskLevel } from '../types';

interface FilterSidebarProps {
    filters: {
        search: string;
        tiers: Set<InvestmentTier>;
        risks: Set<RiskLevel>;
        geoRisks: Set<GeopoliticalRiskLevel>;
        category: Set<string>;
        subCategory: Set<string>;
        supplyChainRole: Set<string>;
        growthDriver: string;
        maxPE: string;
        minGrowth: string;
        minCriticality: string;
        minUnivScore: string;
        showBlueChips: boolean;
        minESG: string;
        buyRank: string;
    };
    onFilterChange: (filters: FilterSidebarProps['filters']) => void;
    categories: string[];
    subCategories: string[];
    supplyChainRoles: string[];
}

const RangeSlider: React.FC<{ label: string; value: string; onChange: (val: string) => void; min: number; max: number; step?: number; suffix?: string }> = ({ label, value, onChange, min, max, step = 1, suffix = '' }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-400">{label}</label>
            <span className="text-xs font-mono text-accent-blue">{value || min}{suffix}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value || min}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
        />
    </div>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, categories, subCategories, supplyChainRoles }) => {

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
    
    const handleGeoRiskChange = useCallback((risk: GeopoliticalRiskLevel) => {
        const newGeoRisks = new Set(filters.geoRisks);
        if (newGeoRisks.has(risk)) {
            newGeoRisks.delete(risk);
        } else {
            newGeoRisks.add(risk);
        }
        onFilterChange({ ...filters, geoRisks: newGeoRisks });
    }, [filters, onFilterChange]);

    const handleCategoryChange = useCallback((category: string) => {
        const newCategories = new Set(filters.category);
        if (newCategories.has(category)) {
            newCategories.delete(category);
        } else {
            newCategories.add(category);
        }
        onFilterChange({ ...filters, category: newCategories });
    }, [filters, onFilterChange]);

    const handleSubCategoryChange = useCallback((subCategory: string) => {
        const newSubCategories = new Set(filters.subCategory);
        if (newSubCategories.has(subCategory)) {
            newSubCategories.delete(subCategory);
        } else {
            newSubCategories.add(subCategory);
        }
        onFilterChange({ ...filters, subCategory: newSubCategories });
    }, [filters, onFilterChange]);

    const handleSupplyChainRoleChange = useCallback((role: string) => {
        const newRoles = new Set(filters.supplyChainRole);
        if (newRoles.has(role)) {
            newRoles.delete(role);
        } else {
            newRoles.add(role);
        }
        onFilterChange({ ...filters, supplyChainRole: newRoles });
    }, [filters, onFilterChange]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({ ...filters, [e.target.name]: e.target.value });
    }, [filters, onFilterChange]);

    const tierOptions = Object.values(InvestmentTier);
    const riskOptions = Object.values(RiskLevel);
    const geoRiskOptions = Object.values(GeopoliticalRiskLevel);

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
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-300">PDCI Tier</h3>
                    <div className="flex items-center text-xs gap-2">
                        <button onClick={() => onFilterChange({ ...filters, tiers: new Set(Object.values(InvestmentTier)) })} className="text-accent-blue hover:underline">Select All</button>
                        {filters.tiers.size > 0 && (
                             <button onClick={() => onFilterChange({ ...filters, tiers: new Set() })} className="text-accent-blue hover:underline">Clear</button>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    {tierOptions.map((value) => (
                        <label key={value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.tiers.has(value)}
                                onChange={() => handleTierChange(value)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-accent-green focus:ring-accent-green"
                            />
                            <span className="text-gray-300">{value}</span>
                        </label>
                    ))}
                </div>
            </div>

             <div className="mb-6">
                <h3 className="font-semibold text-gray-300 mb-2">Metric Thresholds</h3>
                <div className="space-y-2">
                     <RangeSlider 
                        label="Min Universal Score" 
                        value={filters.minUnivScore} 
                        onChange={(val) => onFilterChange({...filters, minUnivScore: val})} 
                        min={0} max={100} 
                    />
                     <div>
                        <label htmlFor="minCriticality" className="block text-sm font-medium text-gray-400 mb-1">Min Criticality</label>
                        <select
                            id="minCriticality"
                            name="minCriticality"
                            value={filters.minCriticality}
                            onChange={handleInputChange}
                            className="w-full bg-black/20 border border-white/10 rounded-md py-1 px-3 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        >
                            <option value="">Any</option>
                            <option value="7">7+ (Important)</option>
                            <option value="8">8+ (High)</option>
                            <option value="9">9+ (Critical)</option>
                            <option value="10">10 (Vital)</option>
                        </select>
                    </div>
                     <div className="mt-4">
                         <RangeSlider
                            label="Max Buy Rank"
                            value={filters.buyRank}
                            onChange={(val) => onFilterChange({...filters, buyRank: val})}
                            min={1} max={50}
                            suffix="#"
                         />
                    </div>
                    <RangeSlider
                        label="Max P/E Ratio"
                        value={filters.maxPE}
                        onChange={(val) => onFilterChange({...filters, maxPE: val})}
                        min={5} max={200} step={5}
                    />
                    <RangeSlider
                        label="Min Revenue Growth (YoY)"
                        value={filters.minGrowth}
                        onChange={(val) => onFilterChange({...filters, minGrowth: val})}
                        min={-20} max={150} step={5}
                        suffix="%"
                    />
                     <RangeSlider
                        label="Min ESG Score"
                        value={filters.minESG}
                        onChange={(val) => onFilterChange({...filters, minESG: val})}
                        min={0} max={100} step={5}
                    />
                    
                    <div className="mt-4">
                        <label htmlFor="growthDriver" className="block text-sm font-medium text-gray-400">Growth Driver Keyword</label>
                        <input
                            type="text"
                            id="growthDriver"
                            name="growthDriver"
                            value={filters.growthDriver}
                            onChange={handleInputChange}
                            placeholder="e.g., liquid cooling"
                            className="w-full mt-1 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-300">Category</h3>
                     <div className="flex items-center text-xs gap-2">
                        <button onClick={() => onFilterChange({ ...filters, category: new Set(categories) })} className="text-accent-blue hover:underline">Select All</button>
                        {filters.category.size > 0 && (
                            <button onClick={() => onFilterChange({ ...filters, category: new Set() })} className="text-accent-blue hover:underline">Clear</button>
                        )}
                    </div>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {categories.map((value) => (
                        <label key={value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.category.has(value)}
                                onChange={() => handleCategoryChange(value)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-accent-green focus:ring-accent-green"
                            />
                            <span className="text-gray-300 text-sm">{value}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-300">Sub Category</h3>
                    <div className="flex items-center text-xs gap-2">
                        <button onClick={() => onFilterChange({ ...filters, subCategory: new Set(subCategories) })} className="text-accent-blue hover:underline">Select All</button>
                        {filters.subCategory.size > 0 && (
                            <button onClick={() => onFilterChange({ ...filters, subCategory: new Set() })} className="text-accent-blue hover:underline">Clear</button>
                        )}
                    </div>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {subCategories.map((value) => (
                        <label key={value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.subCategory.has(value)}
                                onChange={() => handleSubCategoryChange(value)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-accent-green focus:ring-accent-green"
                            />
                            <span className="text-gray-300 text-sm">{value}</span>
                        </label>
                    ))}
                </div>
            </div>

             <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-300">Supply Chain Role</h3>
                    <div className="flex items-center text-xs gap-2">
                        <button onClick={() => onFilterChange({ ...filters, supplyChainRole: new Set(supplyChainRoles) })} className="text-accent-blue hover:underline">Select All</button>
                        {filters.supplyChainRole.size > 0 && (
                            <button onClick={() => onFilterChange({ ...filters, supplyChainRole: new Set() })} className="text-accent-blue hover:underline">Clear</button>
                        )}
                    </div>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {supplyChainRoles.map((value) => (
                        <label key={value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.supplyChainRole.has(value)}
                                onChange={() => handleSupplyChainRoleChange(value)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-accent-green focus:ring-accent-green"
                            />
                            <span className="text-gray-300 text-sm">{value}</span>
                        </label>
                    ))}
                </div>
            </div>

             <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-300">Geopolitical Risk</h3>
                     <div className="flex items-center text-xs gap-2">
                        <button onClick={() => onFilterChange({ ...filters, geoRisks: new Set(Object.values(GeopoliticalRiskLevel)) })} className="text-accent-blue hover:underline">Select All</button>
                        {filters.geoRisks.size > 0 && (
                            <button onClick={() => onFilterChange({ ...filters, geoRisks: new Set() })} className="text-accent-blue hover:underline">Clear</button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {geoRiskOptions.map(risk => (
                        <label key={risk} className="flex items-center space-x-2 cursor-pointer text-sm">
                            <input
                                type="checkbox"
                                checked={filters.geoRisks.has(risk)}
                                onChange={() => handleGeoRiskChange(risk)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-accent-green focus:ring-accent-green"
                            />
                            <span className="text-gray-300">{risk}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-300">Financial Risk</h3>
                    <div className="flex items-center text-xs gap-2">
                        <button onClick={() => onFilterChange({ ...filters, risks: new Set(Object.values(RiskLevel)) })} className="text-accent-blue hover:underline">Select All</button>
                        {filters.risks.size > 0 && (
                            <button onClick={() => onFilterChange({ ...filters, risks: new Set() })} className="text-accent-blue hover:underline">Clear</button>
                        )}
                    </div>
                </div>
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