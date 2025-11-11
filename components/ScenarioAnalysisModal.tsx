import React, { useState } from 'react';
import { CloseIcon, FlaskIcon, SparkleIcon, TrendingDownIcon, TrendingUpIcon, WarningIcon } from './icons/Icons';
import { ScenarioAnalysisResult } from '../lib/gemini';

interface ScenarioAnalysisModalProps {
    onClose: () => void;
    onRunScenario: (scenario: string) => void;
    isLoading: boolean;
    result: ScenarioAnalysisResult | null;
    onClearResult: () => void;
}

const scenarios = [
    {
        title: "Geopolitical Shock",
        description: "Simulate a 50% disruption to Taiwanese semiconductor manufacturing due to regional tensions.",
        details: "This scenario models significant production halts and shipping delays from key Taiwanese firms like TSMC and GlobalWafers, creating severe bottlenecks for downstream companies reliant on their advanced chips and wafers."
    },
    {
        title: "AI Demand Surge",
        description: "Simulate a 2x increase in AI compute demand, boosting networking and server companies.",
        details: "This models an unexpected explosion in demand for AI training and inference, leading to a rush for high-speed networking, HBM memory, and specialized GPU servers. Companies that can scale production fastest will benefit most."
    },
    {
        title: "Commodity Price Spike",
        description: "Simulate a 30% increase in copper and rare earth element prices due to mining disruptions.",
        details: "This scenario tests the impact of rising raw material costs on the entire supply chain, from cable and connector manufacturers to the companies that rely on magnets for storage and cooling systems."
    },
    {
        title: "Regulatory Change",
        description: "Simulate stricter global ESG regulations impacting mining and manufacturing operations.",
        details: "Models the financial impact of new carbon taxes and environmental compliance costs, disproportionately affecting companies with lower ESG scores and those in energy-intensive sectors like materials and fabrication."
    },
    {
        title: "Technological Disruption",
        description: "Simulate the breakthrough of a new memory technology, challenging SK Hynix's HBM dominance.",
        details: "This scenario introduces a hypothetical, more efficient memory alternative, testing the resilience of the market leader (SK Hynix) and assessing which other companies in the ecosystem could pivot or benefit from the shift."
    },
];

const ResilienceGauge: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s > 70) return '#00FF88'; // accent-green
        if (s > 35) return '#FFD700'; // yellow
        return '#FF0080'; // accent-red
    };

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="#1C2833" strokeWidth="10" fill="transparent" />
                <circle cx="50" cy="50" r="45" stroke={getColor(score)} strokeWidth="10" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color: getColor(score) }}>{score}</span>
                <span className="text-xs text-gray-400">Resilience Score</span>
            </div>
        </div>
    );
};

const ImpactBarChart: React.FC<{ companies: ScenarioAnalysisResult['affectedCompanies'] }> = ({ companies }) => {
    const winners = [...companies].filter(c => c.projectedImpact > 0).sort((a, b) => b.projectedImpact - a.projectedImpact).slice(0, 5);
    const losers = [...companies].filter(c => c.projectedImpact <= 0).sort((a, b) => a.projectedImpact - b.projectedImpact).slice(0, 5);

    const allRanked = [...winners.reverse(), ...losers];
    const maxAbsImpact = Math.max(...allRanked.map(c => Math.abs(c.projectedImpact)), 1);

    return (
        <div className="glass-panel p-4">
            <h4 className="font-semibold text-gray-200 mb-3">Projected Impact on Portfolio Companies</h4>
            <div className="space-y-2 h-60 overflow-y-auto pr-2">
                {allRanked.length === 0 && <p className="text-gray-500 text-center">No significant impacts identified.</p>}
                {allRanked.map(company => {
                    const isWinner = company.projectedImpact > 0;
                    const width = (Math.abs(company.projectedImpact) / maxAbsImpact) * 100;
                    return (
                        <div key={company.ticker} className="group relative" title={company.reasoning}>
                            <div className="flex items-center text-xs">
                                <span className="w-1/4 truncate text-gray-300 pr-2 text-right">{company.companyName}</span>
                                <div className="w-3/4 flex items-center">
                                    <div className="w-full bg-black/20 rounded-sm h-5 flex" style={{ justifyContent: isWinner ? 'flex-start' : 'flex-end' }}>
                                        <div
                                            className={`h-5 rounded-sm flex items-center px-2 ${isWinner ? 'bg-accent-green' : 'bg-accent-red'}`}
                                            style={{ width: `${width}%`, minWidth: '3rem' }}
                                        >
                                            <span className="font-bold text-black">{isWinner ? '+' : ''}{company.projectedImpact.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const ScenarioAnalysisModal: React.FC<ScenarioAnalysisModalProps> = ({ onClose, onRunScenario, isLoading, result, onClearResult }) => {
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

    const handleRunClick = () => {
        if (selectedScenario) {
            onRunScenario(selectedScenario);
        }
    };

    const handleBackToScenarios = () => {
        setSelectedScenario(null);
        onClearResult();
    };

    const renderSelectionScreen = () => (
        <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Select a Scenario to Stress Test Your Portfolio</h3>
            <div className="space-y-3">
                {scenarios.map((scenario) => (
                    <div
                        key={scenario.title}
                        className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${selectedScenario === scenario.description ? 'bg-accent-blue/20 border-accent-blue' : 'bg-black/20 border-gray-700 hover:border-gray-500'}`}
                        onClick={() => setSelectedScenario(scenario.description)}
                    >
                        <h4 className="font-bold text-gray-100">{scenario.title}</h4>
                        <p className="text-sm text-gray-400">{scenario.details}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleRunClick}
                    disabled={!selectedScenario}
                    className="neuro-button flex items-center gap-2 bg-accent-green text-black font-bold py-2 px-4 disabled:opacity-50"
                >
                    <FlaskIcon />
                    Run Simulation
                </button>
            </div>
        </div>
    );

    const renderLoadingScreen = () => (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center">
            <SparkleIcon />
            <p className="text-gray-300 text-lg animate-pulse mt-4">Running portfolio simulation...</p>
            <p className="text-gray-500 mt-2 max-w-md">Our PDCI AI is calculating the potential impacts based on your portfolio's unique composition and supply chain exposure. This advanced analysis may take up to 30 seconds.</p>
        </div>
    );

    const renderResultsScreen = () => {
        if (!result) return null;

        if (result.impactSummary.startsWith("Error:")) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center">
                    <WarningIcon className="text-accent-red w-12 h-12" />
                    <p className="text-red-400 mt-4 max-w-md">{result.impactSummary}</p>
                     <button onClick={handleBackToScenarios} className="neuro-button mt-4 py-2 px-4 font-semibold">Try Another Scenario</button>
                </div>
            );
        }

        return (
            <div className="p-6 space-y-6">
                <div>
                    <button onClick={handleBackToScenarios} className="text-sm text-accent-blue hover:underline mb-2">&larr; Back to Scenarios</button>
                    <h3 className="text-2xl font-bold text-gray-100">Stress Test Results</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center justify-center glass-panel p-4">
                        <ResilienceGauge score={result.resilienceScore} />
                    </div>
                    <div className="md:col-span-2 glass-panel p-4">
                        <h4 className="font-semibold text-gray-200 mb-2">Impact Summary</h4>
                        <p className="text-sm text-gray-300">{result.impactSummary}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImpactBarChart companies={result.affectedCompanies} />
                    <div className="glass-panel p-4">
                        <h4 className="font-semibold text-gray-200 mb-2">Strategic Recommendations</h4>
                        <p className="text-sm text-gray-300 max-h-60 overflow-y-auto pr-2">{result.recommendations}</p>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <FlaskIcon />
                        Portfolio Stress Test
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

export default ScenarioAnalysisModal;