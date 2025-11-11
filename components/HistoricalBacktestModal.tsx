
import React, { useState } from 'react';
import { CloseIcon, HistoryIcon, SparkleIcon } from './icons/Icons';
import { HistoricalBacktestResult, runHistoricalBacktest } from '../lib/gemini';
import LineChart from './LineChart';

interface HistoricalBacktestModalProps {
    onClose: () => void;
}

const strategies = [
    {
        name: "'90s Tech Growth",
        description: "Focuses on emerging internet and semiconductor companies, prioritizing high revenue growth over valuation.",
    },
    {
        name: "Post-2008 Value Recovery",
        description: "Targets financially sound but undervalued companies in traditional sectors following the financial crisis.",
    },
    {
        name: "PDCI Data Center Revolution",
        description: "A specialized strategy investing in the core infrastructure of the data center supply chain since the early 2000s.",
    },
    {
        name: "All-Weather (Bridgewater Inspired)",
        description: "A diversified approach aiming for stable returns across different economic environments (growth, inflation, etc.).",
    }
];

const KPI: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'text-gray-100' }) => (
    <div className="bg-black/20 p-3 rounded-lg text-center">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
    </div>
);

const HistoricalBacktestModal: React.FC<HistoricalBacktestModalProps> = ({ onClose }) => {
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<HistoricalBacktestResult | null>(null);

    const handleRunBacktest = async () => {
        if (!selectedStrategy) return;
        setIsLoading(true);
        setResult(null);
        const backtestResult = await runHistoricalBacktest(selectedStrategy);
        setResult(backtestResult);
        setIsLoading(false);
    };

    const handleBack = () => {
        setResult(null);
        setSelectedStrategy(null);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
                    <SparkleIcon />
                    <p className="text-gray-300 text-lg animate-pulse mt-4">Simulating 30+ years of market history...</p>
                    <p className="text-gray-500 mt-2 max-w-md">The PDCI AI is analyzing decades of simulated data to generate your backtest report. This may take a moment.</p>
                </div>
            );
        }

        if (result) {
            return (
                <div className="p-6 space-y-6">
                    <div>
                        <button onClick={handleBack} className="text-sm text-accent-blue hover:underline mb-2">&larr; Run New Backtest</button>
                        <h3 className="text-2xl font-bold text-gray-100">Backtest Results: <span className="text-accent-blue">{selectedStrategy}</span></h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <KPI label="CAGR" value={`${result.keyMetrics.cagr.toFixed(2)}%`} color={result.keyMetrics.cagr > 10 ? 'text-accent-green' : 'text-yellow-400'}/>
                        <KPI label="Max Drawdown" value={`${result.keyMetrics.maxDrawdown.toFixed(2)}%`} color="text-accent-red" />
                        <KPI label="Sharpe Ratio" value={result.keyMetrics.sharpeRatio.toFixed(2)} />
                        <KPI label="Final Value" value={`$${result.keyMetrics.finalPortfolioValue.toLocaleString()}`} color="text-accent-green" />
                        <KPI label="Benchmark" value={`$${result.keyMetrics.finalBenchmarkValue.toLocaleString()}`} />
                    </div>

                    <div className="glass-panel p-4 h-80">
                         <LineChart data={result.performanceChartData} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-4">
                            <h4 className="font-semibold text-gray-200 mb-2">Period Analysis</h4>
                            <div className="space-y-3 text-sm text-gray-300 max-h-48 overflow-y-auto pr-2">
                                {result.periodAnalysis.map(period => (
                                    <div key={period.period}>
                                        <p className="font-bold text-gray-100">{period.period}</p>
                                        <p className="text-gray-400">{period.narrative}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div className="glass-panel p-4">
                            <h4 className="font-semibold text-gray-200 mb-2">Top Simulated Holdings</h4>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                {result.topPerformingSimulatedStocks.map(stock => <li key={stock}>{stock}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-200 mb-4">Select a Strategy to Backtest (1992-Present)</h3>
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
                        onClick={handleRunBacktest}
                        disabled={!selectedStrategy}
                        className="neuro-button flex items-center gap-2 bg-accent-green text-black font-bold py-2 px-4 disabled:opacity-50"
                    >
                        <HistoryIcon />
                        Run Backtest
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <HistoryIcon />
                        PDCI AI Market Backtesting Engine
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <div className="overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default HistoricalBacktestModal;
