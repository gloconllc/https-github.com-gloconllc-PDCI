/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState } from 'react';
import { Company, SortConfig } from '../types';
import DashboardSummary from './DashboardSummary';
import CompanyTable from './CompanyTable';
import PerformanceView from './PerformanceView';
import QuantitativeFactorAnalysis from './QuantitativeFactorAnalysis';
import DeepDive from './DeepDive';
import { GridIcon, MarketDataIcon, ChartBarIcon, DeepDiveIcon } from './icons/Icons';

type ViewMode = 'overview' | 'performance' | 'quant' | 'deepDive';

interface MainDashboardProps {
    companies: Company[];
    filteredAndSortedCompanies: Company[];
    onViewDetails: (company: Company) => void;
    onAddToPortfolio: (company: Company) => void;
    onSort: (key: keyof Company) => void;
    sortConfig: SortConfig | null;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
    companies,
    filteredAndSortedCompanies,
    onViewDetails,
    onAddToPortfolio,
    onSort,
    sortConfig
}) => {
    const [activeTab, setActiveTab] = useState<ViewMode>('overview');

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
                            onSort={onSort}
                            sortConfig={sortConfig}
                        />
                    </>
                );
        }
    };

    return (
        <div>
            <div className="mb-4">
                <div className="border-b border-white/10">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
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
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default MainDashboard;