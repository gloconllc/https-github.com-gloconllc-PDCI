/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Company, SortConfig, StockPrediction } from '../types';
import DashboardSummary from './DashboardSummary';
import CompanyTable from './CompanyTable';
import PerformanceView from './PerformanceView';
import QuantitativeFactorAnalysis from './QuantitativeFactorAnalysis';
import DeepDive from './DeepDive';
import { GridIcon, MarketDataIcon, ChartBarIcon, DeepDiveIcon, ToolsIcon } from './icons/Icons';

type ViewMode = 'overview' | 'performance' | 'quant' | 'deepDive';

interface MainDashboardProps {
    companies: Company[];
    filteredAndSortedCompanies: Company[];
    onViewDetails: (company: Company) => void;
    onAddToPortfolio: (company: Company) => void;
    onAddToWatchlist: (company: Company) => void;
    onSort: (key: keyof Company) => void;
    sortConfig: SortConfig | null;
    predictions: Record<string, StockPrediction>;
    predictionsLoading: Record<string, boolean>;
    fetchPrediction: (company: Company) => void;
}

const TOGGLEABLE_COLUMNS: { key: keyof Company; label: string }[] = [
    { key: 'Sub_Category', label: 'Sub Category' },
    { key: 'Supply_Chain_Role', label: 'Supply Chain Role' },
    { key: 'Growth_Driver', label: 'Growth Driver' },
    { key: '52_Week_High', label: '52-Wk High' },
    { key: 'EPS', label: 'EPS' },
    { key: 'Dividend_Yield', label: 'Div. Yield' },
    { key: 'Beta', label: 'Beta' },
];

const ColumnToggleDropdown: React.FC<{
    visibleColumns: Set<keyof Company>;
    onToggle: (key: keyof Company) => void;
}> = ({ visibleColumns, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-secondary"
            >
                <ToolsIcon />
                <span className="hidden sm:inline">View Options</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-panel p-2 z-20">
                    <h4 className="text-sm font-semibold text-gray-300 px-2 pb-1">Toggle Columns</h4>
                    {TOGGLEABLE_COLUMNS.map(({ key, label }) => (
                        <label key={key} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-white/10">
                            <input
                                type="checkbox"
                                checked={visibleColumns.has(key)}
                                onChange={() => onToggle(key)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-accent-green focus:ring-accent-green"
                            />
                            <span className="text-gray-300 text-sm">{label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const MainDashboard: React.FC<MainDashboardProps> = ({
    companies,
    filteredAndSortedCompanies,
    onViewDetails,
    onAddToPortfolio,
    onAddToWatchlist,
    onSort,
    sortConfig,
    predictions,
    predictionsLoading,
    fetchPrediction
}) => {
    const [activeTab, setActiveTab] = useState<ViewMode>('overview');
    const [visibleColumns, setVisibleColumns] = useState<Set<keyof Company>>(new Set());

    const handleColumnToggle = (key: keyof Company) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const tabs = [
        { id: 'overview', label: 'Market Overview', icon: <GridIcon /> },
        { id: 'performance', label: 'Performance', icon: <MarketDataIcon /> },
        { id: 'quant', label: 'Factor Analysis', icon: <ChartBarIcon /> },
        { id: 'deepDive', label: 'Deep Dive Explorer', icon: <DeepDiveIcon /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'performance':
                return <PerformanceView 
                            companies={filteredAndSortedCompanies} 
                            onViewDetails={onViewDetails} 
                            onAddToPortfolio={onAddToPortfolio}
                        />;
            case 'quant':
                return <QuantitativeFactorAnalysis companies={filteredAndSortedCompanies} />;
            case 'deepDive':
                return <DeepDive allCompanies={companies} onViewDetails={onViewDetails} onAddToPortfolio={onAddToPortfolio} />;
            case 'overview':
            default:
                return (
                    <>
                        <DashboardSummary companies={filteredAndSortedCompanies} />
                        <CompanyTable
                            companies={filteredAndSortedCompanies}
                            onViewDetails={onViewDetails}
                            onAddToPortfolio={onAddToPortfolio}
                            onAddToWatchlist={onAddToWatchlist}
                            onSort={onSort}
                            sortConfig={sortConfig}
                            predictions={predictions}
                            predictionsLoading={predictionsLoading}
                            fetchPrediction={fetchPrediction}
                            visibleColumns={visibleColumns}
                        />
                    </>
                );
        }
    };

    return (
        <div>
            <div className="mb-4">
                <div className="border-b border-white/10 flex justify-between items-center">
                    <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ViewMode)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-accent-blue text-accent-blue'
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
                                } flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                aria-current={activeTab === tab.id ? 'page' : undefined}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                    {activeTab === 'overview' && (
                        <ColumnToggleDropdown
                            visibleColumns={visibleColumns}
                            onToggle={handleColumnToggle}
                        />
                    )}
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default MainDashboard;