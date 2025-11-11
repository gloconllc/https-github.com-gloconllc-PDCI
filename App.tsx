import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import DashboardSummary from './components/DashboardSummary';
import { getPortfolioAnalysis, getMarketUpdate, GeminiResponse, PortfolioAnalysisResult, runScenarioAnalysis, ScenarioAnalysisResult, getNewsFeed, NewsItem, optimizePortfolio, PortfolioOptimizationResult, SuggestedTrade, HistoricalBacktestResult, runHistoricalBacktest, getMarketCommentary } from './lib/gemini';
import { SparkleIcon } from './components/icons/Icons';
import GlossaryModal from './components/GlossaryModal';
import FactorCorrelationMatrix from './components/FactorCorrelationMatrix';
import MarketDistribution from './components/MarketDistribution';
import ScenarioAnalysisModal from './components/ScenarioAnalysisModal';
import NewsTicker from './components/NewsTicker';
import AISyncModal from './components/AISyncModal';
import PortfolioOptimizerModal from './components/PortfolioOptimizerModal';
import HistoricalBacktestModal from './components/HistoricalBacktestModal';
import MarketCommentaryModal from './components/MarketCommentaryModal';


const categories = [...new Set(initialCompaniesData.map(c => c.Category))].sort();

const App: React.FC = () => {
    const [companies] = useState<Company[]>(initialCompaniesData);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [marketUpdateContent, setMarketUpdateContent] = useState<GeminiResponse | null>(null);
    const [isMarketUpdateLoading, setIsMarketUpdateLoading] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        tiers: new Set<InvestmentTier>(),
        risks: new Set<RiskLevel>(),
        category: 'All',
        maxPE: '',
        minGrowth: '',
        minCriticality: '',
    });
    const [portfolio, setPortfolio] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'Universal_Score', direction: 'descending' });

    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
    const [isQuantView, setIsQuantView] = useState(false);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isNewsLoading, setIsNewsLoading] = useState(true);

    const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
    const [scenarioAnalysisResult, setScenarioAnalysisResult] = useState<ScenarioAnalysisResult | null>(null);
    const [isScenarioLoading, setIsScenarioLoading] = useState(false);

    const [isOptimizerModalOpen, setIsOptimizerModalOpen] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<PortfolioOptimizationResult | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    
    const [isBacktestModalOpen, setIsBacktestModalOpen] = useState(false);
    
    const [isCommentaryModalOpen, setIsCommentaryModalOpen] = useState(false);
    const [marketCommentary, setMarketCommentary] = useState<string | null>(null);
    const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            setIsNewsLoading(true);
            const news = await getNewsFeed(initialCompaniesData);
            setNewsItems(news || []);
            setIsNewsLoading(false);
        };
        fetchNews();
    }, []);


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

    const handleSearchChange = useCallback((searchValue: string) => {
        setFilters(prevFilters => ({...prevFilters, search: searchValue}));
    }, []);

    const filteredCompanies = useMemo(() => {
        if (isQuantView) {
             return companies.filter(company => {
                const searchLower = filters.search.toLowerCase();
                return company.Company.toLowerCase().includes(searchLower) || company.Ticker.toLowerCase().includes(searchLower);
             });
        }

        const maxPE = filters.maxPE ? parseFloat(filters.maxPE) : Infinity;
        const minGrowth = filters.minGrowth ? parseFloat(filters.minGrowth) : -Infinity;
        const minCriticality = filters.minCriticality ? parseInt(filters.minCriticality, 10) : 0;

        return companies.filter(company => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = company.Company.toLowerCase().includes(searchLower) || company.Ticker.toLowerCase().includes(searchLower);
            const matchesTier = filters.tiers.size === 0 || filters.tiers.has(company.Investment_Tier);
            const matchesRisk = filters.risks.size === 0 || filters.risks.has(company.Risk_Level);
            const matchesCategory = filters.category === 'All' || company.Category === filters.category;
            
            const matchesPE = company.PE_Ratio <= maxPE;
            const matchesGrowth = company.Revenue_Growth_YoY >= minGrowth;
            const matchesCriticality = company.Criticality >= minCriticality;

            return matchesSearch && matchesTier && matchesRisk && matchesCategory && matchesPE && matchesGrowth && matchesCriticality;
        });
    }, [filters, companies, isQuantView]);

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

    const handleRunScenario = useCallback(async (scenario: string) => {
        if (portfolio.length === 0) return;
        setIsScenarioLoading(true);
        setScenarioAnalysisResult(null);
        const result = await runScenarioAnalysis(portfolio, scenario);
        setScenarioAnalysisResult(result);
        setIsScenarioLoading(false);
    }, [portfolio]);

    const handleClearScenarioResult = () => setScenarioAnalysisResult(null);
    
    const handleRunOptimization = useCallback(async (strategy: string) => {
        if (portfolio.length === 0) return;
        setIsOptimizing(true);
        setOptimizationResult(null);
        const result = await optimizePortfolio(portfolio, companies, strategy);
        setOptimizationResult(result);
        setIsOptimizing(false);
    }, [portfolio, companies]);

    const handleApplyOptimizations = useCallback((trades: SuggestedTrade[]) => {
        setPortfolio(currentPortfolio => {
            let newPortfolio = [...currentPortfolio];
            
            trades.forEach(trade => {
                if (trade.action === 'Remove') {
                    newPortfolio = newPortfolio.filter(c => c.Ticker !== trade.ticker);
                } else if (trade.action === 'Add') {
                    const companyToAdd = companies.find(c => c.Ticker === trade.ticker);
                    const isAlreadyIn = newPortfolio.some(c => c.Ticker === trade.ticker);
                    if (companyToAdd && !isAlreadyIn) {
                        newPortfolio.push(companyToAdd);
                    }
                }
            });
            
            return newPortfolio;
        });
        setIsOptimizerModalOpen(false);
    }, [companies]);

    const handleOpenBacktest = () => setIsBacktestModalOpen(true);
    
    const handleOpenCommentaryModal = useCallback(async () => {
        setIsCommentaryModalOpen(true);
        setIsCommentaryLoading(true);
        setMarketCommentary(null); // Clear old commentary
        const commentary = await getMarketCommentary(companies);
        setMarketCommentary(commentary);
        setIsCommentaryLoading(false);
    }, [companies]);

    return (
        <div className="min-h-screen text-gray-200">
            <Header
                onUpdate={handleUpdateData}
                lastUpdated={lastUpdated}
                isUpdating={isMarketUpdateLoading}
                searchValue={filters.search}
                onSearchChange={handleSearchChange}
                onOpenGlossary={() => setIsGlossaryOpen(true)}
                isQuantView={isQuantView}
                onToggleQuantView={() => setIsQuantView(!isQuantView)}
                onSyncAI={() => setIsSyncModalOpen(true)}
                onOpenBacktest={handleOpenBacktest}
                onOpenCommentary={handleOpenCommentaryModal}
            />
            <NewsTicker newsItems={newsItems} isLoading={isNewsLoading} />
            <main className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
                {isQuantView ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <FactorCorrelationMatrix companies={initialCompaniesData} />
                             <PortfolioSidebar
                                portfolio={portfolio}
                                onRemove={removeFromPortfolio}
                                onAnalyze={handleAnalyzePortfolio}
                                isAnalyzing={isAnalyzing}
                                onStressTest={() => setIsScenarioModalOpen(true)}
                                onOptimize={() => setIsOptimizerModalOpen(true)}
                            />
                        </div>
                        <div className="space-y-6">
                            <MarketDistribution companies={initialCompaniesData} />
                             <CompanyTable
                                companies={sortedCompanies}
                                onViewDetails={viewCompanyDetails}
                                onAddToPortfolio={addToPortfolio}
                                onSort={handleSort}
                                sortConfig={sortConfig}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <DashboardSummary companies={companies} />
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-3 space-y-6">
                                <FilterSidebar filters={filters} onFilterChange={handleFilterChange} categories={categories} />
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
                                    onStressTest={() => setIsScenarioModalOpen(true)}
                                    onOptimize={() => setIsOptimizerModalOpen(true)}
                                />
                            </div>
                        </div>
                    </>
                )}
            </main>
            {selectedCompany && <CompanyModal company={selectedCompany} onClose={closeModal} onAddToPortfolio={addToPortfolio} viewCompanyDetails={viewCompanyDetails} />}
            {isUpdateModalOpen && <UpdateModal isLoading={isMarketUpdateLoading} content={marketUpdateContent} onClose={() => setIsUpdateModalOpen(false)} />}
            {showAnalysisModal && <AnalysisModal analysis={portfolioAnalysis} isAnalyzing={isAnalyzing} onClose={() => setShowAnalysisModal(false)} />}
            {isGlossaryOpen && <GlossaryModal onClose={() => setIsGlossaryOpen(false)} />}
            {isScenarioModalOpen && <ScenarioAnalysisModal onClose={() => setIsScenarioModalOpen(false)} onRunScenario={handleRunScenario} isLoading={isScenarioLoading} result={scenarioAnalysisResult} onClearResult={handleClearScenarioResult} />}
            {isSyncModalOpen && <AISyncModal onClose={() => setIsSyncModalOpen(false)} />}
            {isOptimizerModalOpen && <PortfolioOptimizerModal onClose={() => setIsOptimizerModalOpen(false)} onRunOptimization={handleRunOptimization} isLoading={isOptimizing} result={optimizationResult} onApply={handleApplyOptimizations} />}
            {isBacktestModalOpen && <HistoricalBacktestModal onClose={() => setIsBacktestModalOpen(false)} />}
            {isCommentaryModalOpen && <MarketCommentaryModal onClose={() => setIsCommentaryModalOpen(false)} isLoading={isCommentaryLoading} commentary={marketCommentary} />}

            
            <div className="fixed bottom-6 right-6 z-40">
                {!isChatOpen && (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="bg-accent-blue text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-transform hover:scale-110 flex items-center gap-2"
                        aria-label="Open PDCI AI Chat"
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