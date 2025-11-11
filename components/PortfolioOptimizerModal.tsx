
import React, { useState } from 'react';
import { CloseIcon, OptimizeIcon, SparkleIcon, PlusIcon, MinusIcon } from './icons/Icons';
import { PortfolioOptimizationResult, SuggestedTrade } from '../lib/gemini';

interface PortfolioOptimizerModalProps {
    onClose: () => void;
    onRunOptimization: (strategy: string) => void;
    isLoading: boolean;
    result: PortfolioOptimizationResult | null;
    onApply: (trades: SuggestedTrade[]) => void;
}

const strategies = [
    { name: "Growth at a Reasonable Price (GARP)", description: "Balances strong growth metrics (high Rev Growth YoY) with disciplined valuation (moderate P/E)." },
    { name: "Deep Value (Graham Strategy)", description: "Prioritizes a 'margin of safety' by focusing on companies with high Graham Scores and low P/E Ratios." },
    { name: "Quality & Momentum", description: "Targets industry leaders (high SCSI, high Universal Score) with strong recent performance." },
    { name: "Supply Chain Resilience", description: "Optimizes for companies that are critical (Criticality > 9) and difficult to substitute (Substitutability Score < 35)." },
];

const PortfolioOptimizerModal: React.FC<PortfolioOptimizerModalProps> = ({ onClose, onRunOptimization, isLoading, result, onApply }) => {
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

    const handleRunClick = () => {
        if (selectedStrategy) {
            onRunOptimization(selectedStrategy);
        }
    };

    const renderSelectionScreen = () => (
        <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Select a Quantitative Strategy</h3>
            <p className="text-sm text-gray-400 mb-4">The PDCI AI will analyze your current portfolio and suggest trades to align it with your chosen strategy.</p>
            <div className="space-y-3">
                {strategies.map((strategy) => (
                    <div
                        key={strategy.name}
                        className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${selectedStrategy === strategy.name ? 'bg-accent-blue/20 border-accent-blue' : 'bg-black/20 border-gray-700 hover:border-gray-500'}`}
                        onClick={() => setSelectedStrategy(strategy.name)}
                    >
                        <h4 className="font-bold text-gray-100">{strategy.name}</h4>
                        <p className="text-sm text-gray-400">{strategy.description}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleRunClick}
                    disabled={!selectedStrategy}
                    className="neuro-button flex items-center gap-2 bg-accent-green text-black font-bold py-2 px-4 disabled:opacity-50"
                >
                    <OptimizeIcon />
                    Generate Suggestions
                </button>
            </div>
        </div>
    );
    
    const renderLoadingScreen = () => (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <SparkleIcon />
            <p className="text-gray-300 text-lg animate-pulse mt-4">Optimizing your portfolio...</p>
            <p className="text-gray-500 mt-2 max-w-md">Our PDCI AI is running thousands of simulations to find the optimal trades for your selected strategy.</p>
        </div>
    );
    
    const renderResultsScreen = () => {
        if (!result) return null;

        return (
             <div className="p-6 space-y-4">
                <div>
                    <button onClick={() => { setSelectedStrategy(null); onRunOptimization(''); /* Clear results */ }} className="text-sm text-accent-blue hover:underline mb-2">&larr; Back to Strategies</button>
                    <h3 className="text-2xl font-bold text-gray-100">Optimization Results</h3>
                    <p className="text-md text-gray-400">Strategy: <span className="font-semibold text-accent-blue">{result.strategy}</span></p>
                </div>
                
                <div className="glass-panel p-4">
                    <h4 className="font-semibold text-gray-200 mb-2">PDCI AI Summary</h4>
                    <p className="text-sm text-gray-300">{result.summary}</p>
                </div>
                
                <div className="glass-panel p-4">
                    <h4 className="font-semibold text-gray-200 mb-3">Suggested Trades</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {result.suggestedTrades.map((trade, index) => (
                            <div key={index} className="bg-black/20 p-3 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {trade.action === 'Add' ? <PlusIcon /> : <MinusIcon />}
                                        <div>
                                            <p className={`font-bold ${trade.action === 'Add' ? 'text-accent-green' : 'text-accent-red'}`}>{trade.action} {trade.companyName} ({trade.ticker})</p>
                                        </div>
                                    </div>
                                </div>
                                 <p className="text-xs text-gray-400 mt-1 pl-8">{trade.reasoning}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button onClick={() => onApply(result.suggestedTrades)} className="neuro-button bg-accent-green text-black font-bold py-2 px-4">
                        Apply Suggestions to Portfolio
                    </button>
                </div>
            </div>
        )
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <OptimizeIcon />
                        PDCI AI Quantitative Strategist
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <div className="overflow-y-auto">
                    {isLoading ? renderLoadingScreen() : result ? renderResultsScreen() : renderSelectionScreen()}
                </div>
            </div>
        </div>
    );
};

export default PortfolioOptimizerModal;
