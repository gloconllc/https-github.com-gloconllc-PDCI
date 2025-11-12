
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Company, SortConfig, InvestmentTier, RiskLevel } from './types';
import { companiesData } from './constants';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import CompanyTable from './components/CompanyTable';
import PortfolioSidebar from './components/PortfolioSidebar';
import CompanyModal from './components/CompanyModal';
import GlossaryModal from './components/GlossaryModal';
import UpdateModal from './components/UpdateModal';
import NewsTicker from './components/NewsTicker';
import { getMarketNews, NewsItem } from './lib/gemini';
import AIChat from './components/AIChat';
import AISyncModal from './components/AISyncModal';
import HistoricalBacktestModal from './components/HistoricalBacktestModal';
import MarketCommentaryModal from './components/MarketCommentaryModal';
import { getMarketCommentary } from './lib/gemini';
import OpportunityPipelineModal from './components/OpportunityPipelineModal';
import DashboardSummary from './components/DashboardSummary';
import DeepDive from './components/DeepDive';
import QuantitativeFactorAnalysis from './components/QuantitativeFactorAnalysis';

type ViewMode = 'standard' | 'quant' | 'deepDive';

const App: React.FC = () => {
    // Data and Filtering State
    const [companies, setCompanies] = useState<Company[]>(companiesData);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'Universal_Score', direction: 'descending' });
    const [filters, setFilters] = useState({
        search: '',
        tiers: new Set<InvestmentTier>(),
        risks: new Set<RiskLevel>(),
        category: 'All',
        maxPE: '',
        minGrowth: '',
        minCriticality: '',
        minUnivScore: '',
        showBlueChips: true
    });

    // UI State
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [portfolio, setPortfolio] = useState<Company[]>(companiesData.slice(0, 5)); // Initial portfolio
    const [currentView, setCurrentView] = useState<ViewMode>('standard');
    
    // Modal States
    const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isBacktestOpen, setIsBacktestOpen] = useState(false);
    const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
    const [isOpportunityPipelineOpen, setIsOpportunityPipelineOpen] = useState(false);
    
    // AI Content State
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isNewsLoading, setIsNewsLoading] = useState(true);
    const [marketCommentary, setMarketCommentary] = useState<string | null>(null);
    const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);

    // Handlers
    const handleUpdate = () => {
        setIsUpdating(true);
        setTimeout(() => {
            // Simulate fetching new data and updating scores
            const updatedCompanies = companies.map(c => ({
                ...c,
                Current_Price_USD: c.Current_Price_USD * (1 + (Math.random() - 0.45) * 0.1),
            }));
            setCompanies(updatedCompanies);
            setLastUpdated(new Date());
            setIsUpdating(false);
            setIsUpdateModalOpen(true);
        }, 2000);
    };

    const handleSort = (key: keyof Company) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleAddToPortfolio = useCallback((company: Company) => {
        if (!portfolio.find(p => p.Ticker === company.Ticker)) {
            setPortfolio(prev => [...prev, company]);
        }
    }, [portfolio]);

    const handleRemoveFromPortfolio = useCallback((ticker: string) => {
        setPortfolio(prev => prev.filter(c => c.Ticker !== ticker));
    }, []);

    const fetchNews = useCallback(async () => {
        setIsNewsLoading(true);
        try {
            const news = await getMarketNews();
            setNewsItems(news);
        } catch (error) {
            console.error("Failed to fetch news:", error);
        } finally {
            setIsNewsLoading(false);
        }
    }, []);
    
     const openCommentary = useCallback(async () => {
        setIsCommentaryOpen(true);
        if (!marketCommentary) {
            setIsCommentaryLoading(true);
            try {
                const commentaryText = await getMarketCommentary();
                setMarketCommentary(commentaryText);
            } catch (error) {
                console.error("Failed to generate commentary:", error);
                setMarketCommentary("Error: Could not generate market commentary.");
            } finally {
                setIsCommentaryLoading(false);
            }
        }
    }, [marketCommentary]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Memoized Calculations
    const categories = useMemo(() => [...new Set(companiesData.map(c => c.Category))], []);

    const filteredAndSortedCompanies = useMemo(() => {
        let filtered = [...companies];

        // Search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(c =>
                c.Company.toLowerCase().includes(searchTerm) ||
                c.Ticker.toLowerCase().includes(searchTerm)
            );
        }

        // Tier filter
        if (filters.tiers.size > 0) {
            filtered = filtered.filter(c => filters.tiers.has(c.Investment_Tier));
        }
        
        // Risk filter
        if (filters.risks.size > 0) {
            filtered = filtered.filter(c => c.Risk_Level && filters.risks.has(c.Risk_Level));
        }

        // Category filter
        if (filters.category !== 'All') {
            filtered = filtered.filter(c => c.Category === filters.category);
        }

        // Blue Chip filter
        if (!filters.showBlueChips) {
            filtered = filtered.filter(c => !c.isBlueChip);
        }
        
        // Quantitative filters
        if (filters.maxPE) {
            filtered = filtered.filter(c => c.PE_Ratio <= parseFloat(filters.maxPE));
        }
        if (filters.minGrowth) {
             filtered = filtered.filter(c => c.Revenue_Growth_YoY >= parseFloat(filters.minGrowth));
        }
        if (filters.minCriticality) {
             filtered = filtered.filter(c => c.Criticality >= parseInt(filters.minCriticality, 10));
        }
        if (filters.minUnivScore) {
             filtered = filtered.filter(c => c.Universal_Score >= parseInt(filters.minUnivScore, 10));
        }

        // Sorting
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [companies, filters, sortConfig]);

    const renderView = () => {
        switch(currentView) {
            case 'quant':
                return <QuantitativeFactorAnalysis companies={filteredAndSortedCompanies} />;
            case 'deepDive':
                return <DeepDive allCompanies={companies} onViewDetails={setSelectedCompany} onAddToPortfolio={handleAddToPortfolio} />;
            case 'standard':
            default:
                return (
                    <>
                        <DashboardSummary companies={filteredAndSortedCompanies} />
                        <CompanyTable
                            companies={filteredAndSortedCompanies}
                            onViewDetails={setSelectedCompany}
                            onAddToPortfolio={handleAddToPortfolio}
                            onSort={handleSort}
                            sortConfig={sortConfig}
                        />
                    </>
                );
        }
    }


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header
                onUpdate={handleUpdate}
                lastUpdated={lastUpdated}
                isUpdating={isUpdating}
                searchValue={filters.search}
                onSearchChange={value => setFilters(f => ({ ...f, search: value }))}
                onOpenGlossary={() => setIsGlossaryOpen(true)}
                currentView={currentView}
                onSetView={setCurrentView}
                onSyncAI={() => setIsSyncing(true)}
                onOpenBacktest={() => setIsBacktestOpen(true)}
                onOpenCommentary={openCommentary}
                onOpenOpportunityPipeline={() => setIsOpportunityPipelineOpen(true)}
            />
            <NewsTicker newsItems={newsItems} isLoading={isNewsLoading} />

            <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-2 hidden lg:block">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            categories={categories}
                        />
                    </div>

                    <div className="lg:col-span-7">
                        {renderView()}
                    </div>

                    <div className="lg:col-span-3">
                         <PortfolioSidebar
                            portfolio={portfolio}
                            onRemove={handleRemoveFromPortfolio}
                            onViewDetails={setSelectedCompany}
                            allCompanies={companies}
                        />
                    </div>
                </div>
            </main>

            {selectedCompany && (
                <CompanyModal
                    company={selectedCompany}
                    onClose={() => setSelectedCompany(null)}
                    onAddToPortfolio={handleAddToPortfolio}
                    viewCompanyDetails={setSelectedCompany}
                />
            )}
            
            {isGlossaryOpen && <GlossaryModal onClose={() => setIsGlossaryOpen(false)} />}
            {isUpdateModalOpen && <UpdateModal onClose={() => setIsUpdateModalOpen(false)} />}
            {isSyncing && <AISyncModal onClose={() => setIsSyncing(false)} />}
            {isBacktestOpen && <HistoricalBacktestModal onClose={() => setIsBacktestOpen(false)} portfolio={portfolio} allCompanies={companies} />}
            {isCommentaryOpen && <MarketCommentaryModal onClose={() => setIsCommentaryOpen(false)} isLoading={isCommentaryLoading} commentary={marketCommentary} allCompanies={companies} newsItems={newsItems.slice(0, 3)} />}
            {isOpportunityPipelineOpen && <OpportunityPipelineModal onClose={() => setIsOpportunityPipelineOpen(false)} allCompanies={companies} portfolio={portfolio} />}

            {isChatOpen && (
                <div className="fixed bottom-4 right-4 z-40">
                    <AIChat companies={companies} onClose={() => setIsChatOpen(false)} />
                </div>
            )}
        </div>
    );
};

export default App;