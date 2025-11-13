/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Company, SortConfig, InvestmentTier, RiskLevel, GeopoliticalRiskLevel } from './types';
import { companiesData } from './constants';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import CompanyModal from './components/CompanyModal';
import GlossaryModal from './components/GlossaryModal';
import UpdateModal from './components/UpdateModal';
import NewsTicker from './components/NewsTicker';
import { getMarketNews, NewsItem } from './lib/gemini';
import AISyncModal from './components/AISyncModal';
import HistoricalBacktestModal from './components/HistoricalBacktestModal';
import MarketCommentaryModal from './components/MarketCommentaryModal';
import { getMarketCommentary } from './lib/gemini';
import OpportunityPipelineModal from './components/OpportunityPipelineModal';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import { FilterIcon } from './components/icons/Icons';
import MainDashboard from './components/MainDashboard';
import RightSidebar from './components/RightSidebar';
import GoalPlannerModal from './components/GoalPlannerModal';

const App: React.FC = () => {
    // Data and Filtering State
    const [companies, setCompanies] = useState<Company[]>(companiesData);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'Universal_Score', direction: 'descending' });
    const [filters, setFilters] = useState({
        search: '',
        tiers: new Set<InvestmentTier>(),
        risks: new Set<RiskLevel>(),
        geoRisks: new Set<GeopoliticalRiskLevel>(),
        category: 'All',
        maxPE: '',
        minGrowth: '',
        minCriticality: '',
        minUnivScore: '',
        showBlueChips: true,
        minESG: '',
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
    
    // AI Content State
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isNewsLoading, setIsNewsLoading] = useState(true);
    const [marketCommentary, setMarketCommentary] = useState<string | null>(null);
    const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);

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
        if (filters.category !== 'All') filtered = filtered.filter(c => c.Category === filters.category);
        if (!filters.showBlueChips) filtered = filtered.filter(c => !c.isBlueChip);
        if (filters.maxPE) filtered = filtered.filter(c => c.PE_Ratio <= parseFloat(filters.maxPE));
        if (filters.minGrowth) filtered = filtered.filter(c => c.Revenue_Growth_YoY >= parseFloat(filters.minGrowth));
        if (filters.minCriticality) filtered = filtered.filter(c => c.Criticality >= parseInt(filters.minCriticality, 10));
        if (filters.minUnivScore) filtered = filtered.filter(c => c.Universal_Score >= parseInt(filters.minUnivScore, 10));
        if (filters.minESG) filtered = filtered.filter(c => c.ESG_Score != null && c.ESG_Score >= parseFloat(filters.minESG));


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
                onSyncAI={() => setIsSyncing(true)}
                onOpenBacktest={() => setIsBacktestOpen(true)}
                onOpenCommentary={openCommentary}
                onOpenOpportunityPipeline={() => setIsOpportunityPipelineOpen(true)}
                onOpenGoalPlanner={() => setIsGoalPlannerOpen(true)}
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
            {isSyncing && <AISyncModal onClose={() => setIsSyncing(false)} />}
            {isBacktestOpen && <HistoricalBacktestModal onClose={() => setIsBacktestOpen(false)} portfolio={portfolio} allCompanies={companies} />}
            {isCommentaryOpen && <MarketCommentaryModal onClose={() => setIsCommentaryOpen(false)} isLoading={isCommentaryLoading} commentary={marketCommentary} allCompanies={companies} newsItems={newsItems.slice(0, 3)} />}
            {isOpportunityPipelineOpen && <OpportunityPipelineModal onClose={() => setIsOpportunityPipelineOpen(false)} allCompanies={companies} portfolio={portfolio} />}
            {isGoalPlannerOpen && <GoalPlannerModal onClose={() => setIsGoalPlannerOpen(false)} contextCompanies={filteredAndSortedCompanies} />}


            {isMobileFiltersOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden" onClick={() => setIsMobileFiltersOpen(false)}>
                    <div className="absolute top-0 left-0 h-full w-80 bg-gray-900 shadow-xl p-4 overflow-y-auto animate-slide-in-left" onClick={e => e.stopPropagation()}>
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            categories={categories}
                        />
                         <button onClick={() => setIsMobileFiltersOpen(false)} className="mt-4 btn btn-secondary w-full">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;