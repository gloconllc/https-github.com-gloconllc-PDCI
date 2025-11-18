/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */

import React, { useMemo, useState } from 'react';
import { Company, RiskLevel, UserGoal } from '../types';
import { CloseIcon, ClipboardCheckIcon, FlaskIcon } from './icons/Icons';
import AnalysisModal from './AnalysisModal';
import PortfolioOptimizerModal from './PortfolioOptimizerModal';
import { getPortfolioAnalysis, getPortfolioOptimization, PortfolioAnalysisResult, PortfolioOptimizationResult, SuggestedTrade } from '../lib/gemini';
import Sparkline from './Sparkline';

interface PortfolioSidebarProps {
    portfolio: Company[];
    onRemove: (ticker: string) => void;
    onViewDetails: (company: Company) => void;
    allCompanies: Company[];
    userGoal: UserGoal | null;
}

const CompositionBar: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const colors = ['#00FF88', '#00D9FF', '#B0B8C8', '#F59E0B', '#FF0080', '#8B5CF6'];
    return (
        <div>
            <div className="flex w-full h-3 rounded-full overflow-hidden bg-black/20">
                {data.map((item, index) => (
                    <div
                        key={item.label}
                        className="h-full"
                        style={{ width: `${item.value}%`, backgroundColor: colors[index % colors.length] }}
                        title={`${item.label}: ${item.value.toFixed(1)}%`}
                    />
                ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {data.slice(0, 4).map((item, index) => ( // show top 4 for brevity
                    <div key={item.label} className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: colors[index % colors.length] }}></span>
                        <span className="text-gray-400">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PortfolioSidebar: React.FC<PortfolioSidebarProps> = ({ portfolio, onRemove, onViewDetails, allCompanies, userGoal }) => {
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isOptimizerModalOpen, setIsOptimizerModalOpen] = useState(false);
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<PortfolioAnalysisResult | null>(null);

    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<PortfolioOptimizationResult | null>(null);

    const { uswa, srs, totalMarketCap } = useMemo(() => {
        if (portfolio.length === 0) {
            return { uswa: 0, srs: 0, totalMarketCap: 0 };
        }
        const totalMarketCap = portfolio.reduce((sum, c) => sum + c.Market_Cap_B, 0);
        const uswa = portfolio.reduce((sum, c) => sum + c.Universal_Score * c.Market_Cap_B, 0) / totalMarketCap;
        const srs = portfolio.reduce((sum, c) => sum + c.Substitutability_Score * c.Market_Cap_B, 0) / totalMarketCap;
        return { uswa, srs, totalMarketCap };
    }, [portfolio]);

    const goalProgress = useMemo(() => {
        if (!userGoal || portfolio.length === 0 || totalMarketCap === 0) return null;
        
        const portfolioYTDPerformance = portfolio.reduce((sum, c) => sum + c.YTD_Performance * c.Market_Cap_B, 0) / totalMarketCap;
        const currentValue = userGoal.initialInvestment * (1 + portfolioYTDPerformance / 100);
        const progressPercent = Math.min(100, (currentValue / userGoal.targetAmount) * 100);

        return {
            currentValue,
            progressPercent
        };
    }, [userGoal, portfolio, totalMarketCap]);

    const portfolioAnalytics = useMemo(() => {
        if (portfolio.length === 0) {
            return {
                avgPE: 0,
                avgGrowth: 0,
                avgGeoRisk: 0,
                compositionByCategory: [],
                compositionByRisk: [],
            };
        }

        const totalMarketCap = portfolio.reduce((sum, c) => sum + c.Market_Cap_B, 0);
        if (totalMarketCap === 0) return { avgPE: 0, avgGrowth: 0, avgGeoRisk: 0, compositionByCategory: [], compositionByRisk: [] };

        const avgPE = portfolio.reduce((sum, c) => sum + (c.PE_Ratio * c.Market_Cap_B), 0) / totalMarketCap;
        const avgGrowth = portfolio.reduce((sum, c) => sum + (c.Revenue_Growth_YoY * c.Market_Cap_B), 0) / totalMarketCap;
        const avgGeoRisk = portfolio.reduce((sum, c) => sum + (c.Geopolitical_Risk_Score * c.Market_Cap_B), 0) / totalMarketCap;

        const byCategory = portfolio.reduce((acc: Record<string, number>, company) => {
            const weight = (company.Market_Cap_B / totalMarketCap) * 100;
            acc[company.Category] = (acc[company.Category] || 0) + weight;
            return acc;
        }, {} as Record<string, number>);

        const byRisk = portfolio.reduce((acc: Record<string, number>, company) => {
            const weight = (company.Market_Cap_B / totalMarketCap) * 100;
            acc[company.Risk_Level] = (acc[company.Risk_Level] || 0) + weight;
            return acc;
        }, {} as Record<string, number>);

        const compositionByCategory = Object.entries(byCategory)
            .map(([label, value]) => ({ label, value: value as number }))
            .sort((a, b) => b.value - a.value);
        const compositionByRisk = Object.entries(byRisk)
            .map(([label, value]) => ({ label, value: value as number }))
            .sort((a, b) => b.value - a.value);

        return { avgPE, avgGrowth, avgGeoRisk, compositionByCategory, compositionByRisk };
    }, [portfolio]);

    const handleRunAnalysis = async () => {
        setIsAnalysisModalOpen(true);
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const result = await getPortfolioAnalysis(portfolio);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Failed to get portfolio analysis:", error);
            setAnalysisResult({
                summary: `Error: Could not retrieve analysis. ${error instanceof Error ? error.message : ''}`,
                healthScore: 0,
                strengths: '',
                weaknesses: '',
                riskAnalysis: '',
                recommendations: '',
                composition: { byCategory: [], byRisk: [], byTier: [] }
            });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleRunOptimization = async (strategy: string) => {
        if (!strategy) {
            setOptimizationResult(null);
            return;
        }
        setIsOptimizing(true);
        setOptimizationResult(null);
        try {
            const result = await getPortfolioOptimization(portfolio, strategy, allCompanies);
            setOptimizationResult(result);
        } catch (error) {
            console.error("Failed to run optimization:", error);
        } finally {
            setIsOptimizing(false);
        }
    };
    
    const handleApplyTrades = (trades: SuggestedTrade[]) => {
        // This is a placeholder for a future feature to modify the portfolio state.
        console.log("Applying trades:", trades);
        alert("Trade application is a future feature. See console for trade details.");
        setIsOptimizerModalOpen(false);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Portfolio Command Center ({portfolio.length})</h2>

             {userGoal && goalProgress && (
                <div className="bg-black/20 p-3 rounded-md mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Goal Progress</h3>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                        <div
                            className="bg-accent-green h-4 rounded-full text-xs font-bold text-black flex items-center justify-center"
                            style={{ width: `${goalProgress.progressPercent}%` }}
                        >
                           {goalProgress.progressPercent > 15 && `${goalProgress.progressPercent.toFixed(1)}%`}
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Current: ${goalProgress.currentValue.toLocaleString()}</span>
                        <span>Target: ${userGoal.targetAmount.toLocaleString()}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="bg-black/20 p-2 rounded-md">
                    <h4 className="text-xs text-gray-400">USWA</h4>
                    <p className="font-bold text-lg text-accent-blue">{uswa.toFixed(1)}</p>
                </div>
                <div className="bg-black/20 p-2 rounded-md">
                    <h4 className="text-xs text-gray-400">SRS</h4>
                    <p className="font-bold text-lg text-accent-green">{srs.toFixed(1)}</p>
                </div>
                <div className="bg-black/20 p-2 rounded-md">
                    <h4 className="text-xs text-gray-400">Mkt Cap</h4>
                    <p className="font-bold text-lg text-gray-300">${totalMarketCap.toFixed(0)}B</p>
                </div>
            </div>
            
            {portfolio.length > 0 && (
                <div className="bg-black/20 p-3 rounded-md mb-4 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300">Portfolio Analytics</h3>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                         <div title="Market-Cap Weighted Average P/E Ratio">
                            <p className="text-xs text-gray-400">Avg P/E</p>
                            <p className="font-mono text-gray-200">{portfolioAnalytics.avgPE.toFixed(1)}</p>
                        </div>
                        <div title="Market-Cap Weighted Average YoY Revenue Growth">
                            <p className="text-xs text-gray-400">Avg Growth</p>
                            <p className={`font-mono ${portfolioAnalytics.avgGrowth >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{portfolioAnalytics.avgGrowth.toFixed(1)}%</p>
                        </div>
                         <div title="Market-Cap Weighted Average Geopolitical Risk Score">
                            <p className="text-xs text-gray-400">Avg Geo Risk</p>
                            <p className="font-mono text-gray-200">{portfolioAnalytics.avgGeoRisk.toFixed(1)}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 mb-1.5">Composition by Category</h4>
                        <CompositionBar data={portfolioAnalytics.compositionByCategory} />
                    </div>
                     <div>
                        <h4 className="text-xs font-semibold text-gray-400 mb-1.5">Composition by Risk Level</h4>
                        <CompositionBar data={portfolioAnalytics.compositionByRisk} />
                    </div>
                </div>
            )}
            
            <div className="flex-grow overflow-y-auto pr-1 space-y-2">
                {portfolio.map(company => (
                    <div key={company.Ticker} className="bg-black/20 p-2 rounded-md flex items-center justify-between group">
                        <div className="flex items-center gap-3 cursor-pointer min-w-0 flex-1" onClick={() => onViewDetails(company)}>
                            <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-7 h-7 rounded-full object-contain bg-white" />
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-200 text-sm truncate">{company.Company}</p>
                                <p className="text-xs text-gray-400">{company.Ticker}</p>
                            </div>
                        </div>
                        <div className="w-20 h-10 mx-2 hidden sm:block">
                             <Sparkline ticker={company.Ticker} />
                        </div>
                        <button 
                            onClick={() => onRemove(company.Ticker)} 
                            className="btn btn-ghost-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove ${company.Company}`}
                        >
                            <CloseIcon />
                        </button>
                    </div>
                ))}
                 {portfolio.length === 0 && (
                    <div className="text-center text-gray-500 pt-10">Your portfolio is empty. Add companies from the main table.</div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                 <button 
                    onClick={handleRunAnalysis}
                    disabled={portfolio.length === 0}
                    className="w-full btn btn-primary"
                 >
                    <ClipboardCheckIcon />
                    Run PDCI Analysis
                </button>
                 <button 
                    onClick={() => setIsOptimizerModalOpen(true)}
                    disabled={portfolio.length === 0}
                    className="w-full btn btn-secondary"
                 >
                    <FlaskIcon />
                    Quantitative Strategist
                </button>
            </div>
            
            {isAnalysisModalOpen && (
                <AnalysisModal 
                    onClose={() => setIsAnalysisModalOpen(false)}
                    isAnalyzing={isAnalyzing}
                    analysis={analysisResult}
                />
            )}
            
            {isOptimizerModalOpen && (
                <PortfolioOptimizerModal
                    onClose={() => setIsOptimizerModalOpen(false)}
                    onRunOptimization={handleRunOptimization}
                    isLoading={isOptimizing}
                    result={optimizationResult}
                    onApply={handleApplyTrades}
                />
            )}
        </div>
    );
};

export default PortfolioSidebar;