
import React, { useMemo, useState } from 'react';
import { Company, InvestmentTier } from '../types';
import { CloseIcon, SparkleIcon, OptimizeIcon } from './icons/Icons';
import AnalysisModal from './AnalysisModal';
import PortfolioOptimizerModal from './PortfolioOptimizerModal';
import { getPortfolioAnalysis, getPortfolioOptimization, PortfolioAnalysisResult, PortfolioOptimizationResult, SuggestedTrade } from '../lib/gemini';

interface PortfolioSidebarProps {
    portfolio: Company[];
    onRemove: (ticker: string) => void;
    onViewDetails: (company: Company) => void;
    allCompanies: Company[];
}

const PortfolioSidebar: React.FC<PortfolioSidebarProps> = ({ portfolio, onRemove, onViewDetails, allCompanies }) => {
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
            });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleRunOptimization = async (strategy: string) => {
        if (!strategy) { // Used for clearing results when going back
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
            // Handle error state in UI if necessary
        } finally {
            setIsOptimizing(false);
        }
    };
    
    const handleApplyTrades = (trades: SuggestedTrade[]) => {
        // This is a mock implementation. A real app would have more complex logic.
        console.log("Applying trades:", trades);
        // For simplicity, we just log this. In a real app, you'd update the portfolio state.
        setIsOptimizerModalOpen(false);
    };

    return (
        <div className="glass-panel p-4 sticky top-24 h-[calc(100vh-7rem)] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">My Portfolio ({portfolio.length})</h2>

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
            
            <div className="flex-grow overflow-y-auto pr-1 space-y-2">
                {portfolio.map(company => (
                    <div key={company.Ticker} className="bg-black/20 p-2 rounded-md flex items-center justify-between group">
                        <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => onViewDetails(company)}>
                            <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-7 h-7 rounded-full object-contain bg-white" />
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-200 text-sm truncate">{company.Company}</p>
                                <p className="text-xs text-gray-400">{company.Ticker}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onRemove(company.Ticker)} 
                            className="p-1 rounded-full text-gray-500 hover:bg-accent-red hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
                    className="w-full neuro-button flex items-center justify-center gap-2 bg-accent-blue text-white font-bold py-2 px-4 disabled:opacity-50"
                 >
                    <SparkleIcon />
                    Run AI Analysis
                </button>
                 <button 
                    onClick={() => setIsOptimizerModalOpen(true)}
                    disabled={portfolio.length === 0}
                    className="w-full neuro-button flex items-center justify-center gap-2 bg-gray-700 text-gray-200 font-bold py-2 px-4 hover:bg-gray-600 disabled:opacity-50"
                 >
                    <OptimizeIcon />
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
