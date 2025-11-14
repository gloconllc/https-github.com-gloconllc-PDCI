/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Company, SortConfig, InvestmentTier, RiskLevel, GeopoliticalRiskLevel, StockPrediction } from './types';
import { companiesData } from './constants';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import CompanyModal from './components/CompanyModal';
import GlossaryModal from './components/GlossaryModal';
import UpdateModal from './components/UpdateModal';
import NewsTicker from './components/NewsTicker';
// FIX: Corrected function name from getPDCIStockPrediction to getAIStockPrediction.
import { getMarketNews, NewsItem, getAIStockPrediction } from './lib/gemini';
import PDCISyncModal from './components/AISyncModal';
import HistoricalBacktestModal from './components/HistoricalBacktestModal';
import MarketCommentaryModal from './components/MarketCommentaryModal';
import { getMarketCommentary } from './lib/gemini';
import OpportunityPipelineModal from './components/OpportunityPipelineModal';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import { FilterIcon, CloseIcon } from './components/icons/Icons';
import MainDashboard from './components/MainDashboard';
import RightSidebar from './components/RightSidebar';
import GoalPlannerModal from './components/GoalPlannerModal';
import ScenarioAnalysisModal from './components/ScenarioAnalysisModal';


const App: React.FC = () => {
    // Data and Filtering State
    const [companies, setCompanies] = useState<Company[]>(companiesData);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'Universal_Score', direction: 'descending' });
    const [filters, setFilters] = useState({
        search: '',
        tiers: new Set<InvestmentTier>(),
        risks: new Set<RiskLevel>(),
        geoRisks: new Set<GeopoliticalRiskLevel>(),
        category: new Set<string>(),
        maxPE: '',
        minGrowth: '',
        minCriticality: '',
        minUnivScore: '',
        showBlueChips: true,
        minESG: '',
        buyRank: '',
    });

    // UI State
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [portfolio, setPortfolio] = useState<Company[]>(companiesData.slice(0, 5)); // Initial portfolio
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Modal States
    const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isBacktestOpen, setIsBacktestOpen] = useState(false);
    const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
    const [isOpportunityPipelineOpen, setIsOpportunityPipelineOpen] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [isGoalPlannerOpen, setIsGoalPlannerOpen] = useState(false);
    const [isScenarioAnalysisOpen, setIsScenarioAnalysisOpen] = useState(false);
    
    // PDCI Content State
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isNewsLoading, setIsNewsLoading] = useState(true);
    const [marketCommentary, setMarketCommentary] = useState<string | null>(null);
    const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);
    const [predictions, setPredictions] = useState<Record<string, StockPrediction>>({});
    const [predictionsLoading, setPredictionsLoading] = useState<Record<string, boolean>>({});

    // Geolocation State
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState<string>('Initializing...');

    // Handlers
    const handleUpdate = () => {
        setIsUpdating(true);
        setTimeout(() => {
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
            const news = await getMarketNews(userLocation ?? undefined);
            setNewsItems(news);
        } catch (error) {
            console.error("Failed to fetch news:", error);
        } finally {
            setIsNewsLoading(false);
        }
    }, [userLocation]);
    
     const openCommentary = useCallback(async () => {
        setIsCommentaryOpen(true);
        if (!marketCommentary) {
            setIsCommentaryLoading(true);
            try {
                const commentaryText = await getMarketCommentary(userLocation ?? undefined);
                setMarketCommentary(commentaryText);
            } catch (error) {
                console.error("Failed to generate commentary:", error);
                setMarketCommentary("Error: Could not generate market commentary.");
            } finally {
                setIsCommentaryLoading(false);
            }
        }
    }, [marketCommentary, userLocation]);

     const fetchPrediction = useCallback(async (company: Company) => {
        if (predictions[company.Ticker] || predictionsLoading[company.Ticker]) {
            return;
        }
        setPredictionsLoading(prev => ({ ...prev, [company.Ticker]: true }));
        try {
            // FIX: Corrected function name from getPDCIStockPrediction to getAIStockPrediction.
            const prediction = await getAIStockPrediction(company);
            setPredictions(prev => ({ ...prev, [company.Ticker]: prediction }));
        } catch (e) {
            console.error(`Failed to fetch prediction for ${company.Ticker}`, e);
        } finally {
            setPredictionsLoading(prev => ({ ...prev, [company.Ticker]: false }));
        }
    }, [predictions, predictionsLoading]);

    useEffect(() => {
        if (navigator.geolocation) {
             const options: PositionOptions = {
                enableHighAccuracy: false, // Use less accurate but more reliable method
                timeout: 15000, // Increased timeout to 15 seconds
                maximumAge: 60000, // Allow using a cached position up to 1 minute old
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLocationStatus('Enabled');
                },
                (error: GeolocationPositionError) => {
                    let message = '';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = "Permission Denied";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = "Position Unavailable";
                            break;
                        case error.TIMEOUT:
                            message = "Request Timed Out";
                            break;
                        default:
                            message = "Unknown Error";
                            break;
                    }
                    console.error(`Geolocation Error (Code: ${error.code}): ${message}. Full message: ${error.message}`);
                    setLocationStatus(`Error: ${message}`);
                },
                options
            );
        } else {
            setLocationStatus("Not supported");
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Memoized Calculations
    const categories = useMemo(() => [...new Set(companiesData.map(c => c.Category))], []);

    const filteredAndSortedCompanies = useMemo(() => {
        let filtered = [...companies];

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(c =>
                c.Company.toLowerCase().includes(searchTerm) ||
                c.Ticker.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.tiers.size > 0) filtered = filtered.filter(c => filters.tiers.has(c.Investment_Tier));
        if (filters.risks.size > 0) filtered = filtered.filter(c => c.Risk_Level && filters.risks.has(c.Risk_Level));
        if (filters.geoRisks.size > 0) filtered = filtered.filter(c => c.Geopolitical_Risk && filters.geoRisks.has(c.Geopolitical_Risk));
        if (filters.category.size > 0) filtered = filtered.filter(c => filters.category.has(c.Category));
        if (!filters.showBlueChips) filtered = filtered.filter(c => !c.isBlueChip);
        if (filters.maxPE) filtered = filtered.filter(c => c.PE_Ratio <= parseFloat(filters.maxPE));
        if (filters.minGrowth) filtered = filtered.filter(c => c.Revenue_Growth_YoY >= parseFloat(filters.minGrowth));
        if (filters.minCriticality) filtered = filtered.filter(c => c.Criticality >= parseInt(filters.minCriticality, 10));
        if (filters.minUnivScore) filtered = filtered.filter(c => c.Universal_Score >= parseInt(filters.minUnivScore, 10));
        if (filters.minESG) filtered = filtered.filter(c => c.ESG_Score != null && c.ESG_Score >= parseFloat(filters.minESG));
        if (filters.buyRank) filtered = filtered.filter(c => c.Buy_Rank != null && c.Buy_Rank <= parseInt(filters.buyRank, 10));


        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [companies, filters, sortConfig]);


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
            <Header
                onUpdate={handleUpdate}
                lastUpdated={lastUpdated}
                isUpdating={isUpdating}
                searchValue={filters.search}
                onSearchChange={value => setFilters(f => ({ ...f, search: value }))}
                onOpenGlossary={() => setIsGlossaryOpen(true)}
                onSyncPDCI={() => setIsSyncing(true)}
                onOpenBacktest={() => setIsBacktestOpen(true)}
                onOpenCommentary={openCommentary}
                onOpenOpportunityPipeline={() => setIsOpportunityPipelineOpen(true)}
                onOpenGoalPlanner={() => setIsGoalPlannerOpen(true)}
                onOpenScenarioAnalysis={() => setIsScenarioAnalysisOpen(true)}
                locationStatus={locationStatus}
            />
            <NewsTicker newsItems={newsItems} isLoading={isNewsLoading} />

            <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 w-full flex-grow">
                 <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="btn btn-secondary w-full"
                    >
                        <FilterIcon />
                        Show Filters & Options
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-2 hidden lg:block">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            categories={categories}
                        />
                    </div>

                    <div className="lg:col-span-7">
                        <MainDashboard
                            companies={companies}
                            filteredAndSortedCompanies={filteredAndSortedCompanies}
                            onViewDetails={setSelectedCompany}
                            onAddToPortfolio={handleAddToPortfolio}
                            onSort={handleSort}
                            sortConfig={sortConfig}
                            predictions={predictions}
                            predictionsLoading={predictionsLoading}
                            fetchPrediction={fetchPrediction}
                        />
                    </div>

                    <div className="lg:col-span-3">
                         <RightSidebar
                            portfolio={portfolio}
                            onRemoveFromPortfolio={handleRemoveFromPortfolio}
                            onViewDetails={setSelectedCompany}
                            allCompanies={companies}
                         />
                    </div>
                </div>
            </main>

            <Footer onOpenLegal={() => setIsLegalModalOpen(true)} />

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
            {isLegalModalOpen && <LegalModal onClose={() => setIsLegalModalOpen(false)} />}
            {isSyncing && <PDCISyncModal onClose={() => setIsSyncing(false)} />}
            {isBacktestOpen && <HistoricalBacktestModal onClose={() => setIsBacktestOpen(false)} portfolio={portfolio} allCompanies={companies} />}
            {isCommentaryOpen && <MarketCommentaryModal onClose={() => setIsCommentaryOpen(false)} isLoading={isCommentaryLoading} commentary={marketCommentary} allCompanies={companies} newsItems={newsItems.slice(0, 3)} />}
            {isOpportunityPipelineOpen && <OpportunityPipelineModal onClose={() => setIsOpportunityPipelineOpen(false)} allCompanies={companies} portfolio={portfolio} />}
            {isGoalPlannerOpen && <GoalPlannerModal onClose={() => setIsGoalPlannerOpen(false)} contextCompanies={filteredAndSortedCompanies} />}
            {isScenarioAnalysisOpen && <ScenarioAnalysisModal onClose={() => setIsScenarioAnalysisOpen(false)} portfolio={portfolio} />}


            <div
                className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${isMobileFiltersOpen ? 'bg-black bg-opacity-75' : 'pointer-events-none bg-transparent'}`}
                onClick={() => setIsMobileFiltersOpen(false)}
                role="dialog"
                aria-modal="true"
            >
                <div
                    className={`absolute top-0 left-0 h-full w-80 bg-gray-900 shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-lg font-semibold text-gray-200">Filters & Options</h2>
                        <button onClick={() => setIsMobileFiltersOpen(false)} className="btn btn-ghost rounded-full -mr-2">
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-4">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            categories={categories}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;