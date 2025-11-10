
import React, { useState, useMemo, useCallback } from 'react';
import { Company, InvestmentTier, RiskLevel, SortConfig } from './types';
import { companiesData as initialCompaniesData } from './constants';
import CompanyTable from './components/CompanyTable';
import FilterSidebar from './components/FilterSidebar';
import PortfolioSidebar from './components/PortfolioSidebar';
import CompanyModal from './components/CompanyModal';
import Header from './components/Header';
import AIChat from './components/AIChat';
import UpdateModal from './components/UpdateModal';
import AnalysisModal from './components/AnalysisModal';
// FIX: Imported GeminiResponse to fix a type error with the marketUpdateContent state.
import { getPortfolioAnalysis, getMarketUpdate, GeminiResponse, PortfolioAnalysisResult } from './lib/gemini';
import { SparkleIcon } from './components/icons/Icons';

const App: React.FC = () => {
    const [companies] = useState<Company[]>(initialCompaniesData);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    
    // State for the Update Data modal
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    // FIX: Changed type to GeminiResponse to allow optional groundingMetadata, resolving a type mismatch.
    const [marketUpdateContent, setMarketUpdateContent] = useState<GeminiResponse | null>(null);
    const [isMarketUpdateLoading, setIsMarketUpdateLoading] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        tiers: new Set<InvestmentTier>(),
        risks: new Set<RiskLevel>(),
        category: 'All'
    });
    const [portfolio, setPortfolio] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'Universal_Score', direction: 'descending' });

    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleUpdateData = useCallback(async () => {
        setIsUpdateModalOpen(true);
        setIsMarketUpdateLoading(true);
        setMarketUpdateContent(null);
        const update = await getMarketUpdate();
        setMarketUpdateContent(update);
        setLastUpdated(new Date());
        setIsMarketUpdateLoading(false);
    }, []);

    const handleFilterChange = useCallback((newFilters: typeof filters) => {
        setFilters(newFilters);
    }, []);

    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = company.Company.toLowerCase().includes(searchLower) || company.Ticker.toLowerCase().includes(searchLower);
            const matchesTier = filters.tiers.size === 0 || filters.tiers.has(company.Investment_Tier);
            const matchesRisk = filters.risks.size === 0 || filters.risks.has(company.Risk_Level);
            const matchesCategory = filters.category === 'All' || company.Category === filters.category;

            return matchesSearch && matchesTier && matchesRisk && matchesCategory;
        });
    }, [filters, companies]);

    const sortedCompanies = useMemo(() => {
        let sortableItems = [...filteredCompanies];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredCompanies, sortConfig]);

    const handleSort = (key: keyof Company) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const addToPortfolio = useCallback((company: Company) => {
        setPortfolio(prev => {
            if (prev.find(c => c.Ticker === company.Ticker)) return prev;
            return [...prev, company];
        });
    }, []);

    const removeFromPortfolio = useCallback((ticker: string) => {
        setPortfolio(prev => prev.filter(c => c.Ticker !== ticker));
    }, []);

    const viewCompanyDetails = useCallback((company: Company) => setSelectedCompany(company), []);
    const closeModal = useCallback(() => setSelectedCompany(null), []);

    const handleAnalyzePortfolio = useCallback(async () => {
        if (portfolio.length === 0) return;
        setShowAnalysisModal(true);
        setIsAnalyzing(true);
        setPortfolioAnalysis(null);
        const analysis = await getPortfolioAnalysis(portfolio);
        setPortfolioAnalysis(analysis);
        setIsAnalyzing(false);
    }, [portfolio]);


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            <Header onUpdate={handleUpdateData} lastUpdated={lastUpdated} isUpdating={isMarketUpdateLoading} />
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                    </div>
                    <div className="lg:col-span-6">
                        <CompanyTable
                            companies={sortedCompanies}
                            onViewDetails={viewCompanyDetails}
                            onAddToPortfolio={addToPortfolio}
                            onSort={handleSort}
                            sortConfig={sortConfig}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <PortfolioSidebar
                            portfolio={portfolio}
                            onRemove={removeFromPortfolio}
                            onAnalyze={handleAnalyzePortfolio}
                            isAnalyzing={isAnalyzing}
                        />
                    </div>
                </div>
            </main>
            {selectedCompany && <CompanyModal company={selectedCompany} onClose={closeModal} onAddToPortfolio={addToPortfolio} />}
            {isUpdateModalOpen && <UpdateModal isLoading={isMarketUpdateLoading} content={marketUpdateContent} onClose={() => setIsUpdateModalOpen(false)} />}
            {showAnalysisModal && <AnalysisModal analysis={portfolioAnalysis} isAnalyzing={isAnalyzing} onClose={() => setShowAnalysisModal(false)} />}
            
            <div className="fixed bottom-6 right-6 z-40">
                {!isChatOpen && (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="bg-accent-blue text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-transform hover:scale-110 flex items-center gap-2"
                        aria-label="Open AI Chat"
                    >
                        <SparkleIcon />
                    </button>
                )}
                 {isChatOpen && (
                    <AIChat
                        companies={companies}
                        onClose={() => setIsChatOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default App;