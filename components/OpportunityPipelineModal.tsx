
import React, { useState } from 'react';
import { CloseIcon, PipelineIcon, SparkleIcon, LightbulbIcon } from './icons/Icons';
import { Company } from '../types';
// FIX: Correct import path
import { findFutureOpportunities, FutureOpportunityAnalysis } from '../lib/gemini';
import { upcomingProjects, UpcomingProject } from '../lib/upcomingProjects';

interface OpportunityPipelineModalProps {
    onClose: () => void;
    allCompanies: Company[];
    portfolio: Company[];
}

const strategies = [
    { name: "Growth at a Reasonable Price (GARP)", description: "Finds suppliers with strong growth potential who are not yet overvalued." },
    { name: "Deep Value (Graham Strategy)", description: "Identifies fundamentally strong suppliers with a significant margin of safety." },
    { name: "Quality & Momentum", description: "Targets top-tier industry leaders who are most likely to win major contracts." },
    { name: "Supply Chain Resilience", description: "Focuses on irreplaceable, critical-node suppliers essential for the project's success." },
];

const OpportunityPipelineModal: React.FC<OpportunityPipelineModalProps> = ({ onClose, allCompanies, portfolio }) => {
    const [step, setStep] = useState(1); // 1: Project, 2: Strategy, 3: Results
    const [selectedProjects, setSelectedProjects] = useState<UpcomingProject[]>([]);
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<FutureOpportunityAnalysis | null>(null);

    const handleProjectToggle = (project: UpcomingProject) => {
        setSelectedProjects(prev =>
            prev.some(p => p.name === project.name)
                ? prev.filter(p => p.name !== project.name)
                : [...prev, project]
        );
    };

    const handleRunAnalysis = async () => {
        if (selectedProjects.length === 0 || !selectedStrategy) return;
        setStep(3);
        setIsLoading(true);
        setResult(null);
        try {
            const analysisResult = await findFutureOpportunities(selectedProjects, selectedStrategy, allCompanies, portfolio);
            setResult(analysisResult);
        } catch(e) {
             console.error("Opportunity analysis failed:", e);
             setResult(null); // Explicitly set to null on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
        if (step === 3) {
            setResult(null);
        }
    };
    
    const handleStartOver = () => {
        setStep(1);
        setSelectedProjects([]);
        setSelectedStrategy(null);
        setResult(null);
    };

    const renderStep1_ProjectSelection = () => (
        <div>
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Step 1: Select Upcoming Data Center Project(s)</h3>
            <p className="text-sm text-gray-400 mb-4">Choose one or more future projects to analyze for supply chain needs.</p>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {upcomingProjects.map((project) => (
                    <div
                        key={project.name}
                        className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 flex items-center gap-4 ${selectedProjects.some(p => p.name === project.name) ? 'bg-accent-blue/20 border-accent-blue' : 'bg-black/20 border-gray-700 hover:border-gray-500'}`}
                        onClick={() => handleProjectToggle(project)}
                    >
                         <input
                            type="checkbox"
                            readOnly
                            checked={selectedProjects.some(p => p.name === project.name)}
                            className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-accent-blue focus:ring-accent-blue shrink-0"
                        />
                        <div>
                            <h4 className="font-bold text-gray-100">{project.name}</h4>
                            <p className="text-sm text-gray-400">{project.developer} - ${project.investmentBillion}B Investment</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => setStep(2)}
                    disabled={selectedProjects.length === 0}
                    className="neuro-button bg-accent-blue text-white font-bold py-2 px-4 disabled:opacity-50"
                >
                    Next: Select Strategy &rarr;
                </button>
            </div>
        </div>
    );
    
    const renderStep2_StrategySelection = () => (
        <div>
            <button onClick={handleBack} className="text-sm text-accent-blue hover:underline mb-2">&larr; Back to Projects</button>
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Step 2: Align with a Quantitative Strategy</h3>
            <p className="text-sm text-gray-400 mb-4">How should the PICOU AI hunt for opportunities within the <span className="font-bold text-gray-200">{selectedProjects.map(p=>p.name).join(', ')}</span> supply chain?</p>
            <div className="space-y-3">
                {strategies.map((strategy) => (
                     <div
                        key={strategy.name}
                        className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${selectedStrategy === strategy.name ? 'bg-accent-green/20 border-accent-green' : 'bg-black/20 border-gray-700 hover:border-gray-500'}`}
                        onClick={() => setSelectedStrategy(strategy.name)}
                    >
                        <h4 className="font-bold text-gray-100">{strategy.name}</h4>
                        <p className="text-sm text-gray-400">{strategy.description}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleRunAnalysis}
                    disabled={!selectedStrategy}
                    className="neuro-button flex items-center gap-2 bg-accent-green text-black font-bold py-2 px-4 disabled:opacity-50"
                >
                    <SparkleIcon />
                    Find Opportunities
                </button>
            </div>
        </div>
    );
    
    const renderStep3_Results = () => {
        if (isLoading) {
             return (
                <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
                    <SparkleIcon />
                    <p className="text-gray-300 text-lg animate-pulse mt-4">Analyzing future supply chain dynamics...</p>
                    <p className="text-gray-500 mt-2 max-w-md">The PICOU AI is deconstructing the project's bill of materials and mapping it to our company universe. This may take a moment.</p>
                </div>
            );
        }
        
        if (!result) {
            return (
                 <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
                    <p className="text-gray-400">Error generating analysis. The AI model may be unable to process the request. Please try again.</p>
                     <button onClick={handleStartOver} className="neuro-button mt-4 py-2 px-4 font-semibold">Start Over</button>
                </div>
            )
        }
        
        return (
            <div className="space-y-4">
                <div>
                     <button onClick={handleStartOver} className="text-sm text-accent-blue hover:underline mb-2">&larr; Start New Analysis</button>
                    <h3 className="text-2xl font-bold text-gray-100">Opportunity Report</h3>
                    <p className="text-md text-gray-400">Project(s): <span className="font-semibold text-accent-blue">{selectedProjects.map(p => p.name).join(', ')}</span> | Strategy: <span className="font-semibold text-accent-green">{selectedStrategy}</span></p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-panel p-4">
                        <h4 className="font-semibold text-gray-200 mb-2">Project Summary</h4>
                        <p className="text-sm text-gray-300">{result.projectSummary}</p>
                    </div>
                    <div className="glass-panel p-4">
                        <h4 className="font-semibold text-gray-200 mb-2">Inferred Supply Chain Needs</h4>
                        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                            {result.inferredSupplyChainNeeds.map(need => <li key={need.category}><span className="font-semibold text-gray-200">{need.category}:</span> {need.details}</li>)}
                        </ul>
                    </div>
                </div>

                <div className="glass-panel p-4">
                     <h4 className="font-semibold text-gray-200 mb-3 flex items-center gap-2"><LightbulbIcon className="text-yellow-400" /> Top Investment Opportunities</h4>
                     <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {result.investmentOpportunities.map(opp => (
                            <div key={opp.ticker} className="bg-black/20 p-3 rounded-md">
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-gray-100">{opp.companyName} ({opp.ticker})</p>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-accent-green">{opp.opportunityScore}/100</p>
                                        <p className="text-xs text-gray-500">Opportunity Score</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{opp.rationale}</p>
                            </div>
                        ))}
                     </div>
                </div>
                 <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="neuro-button bg-accent-blue text-white font-bold py-2 px-4">
                        Finalize Strategy
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <PipelineIcon />
                        PDCI Opportunity Pipeline
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {step === 1 && renderStep1_ProjectSelection()}
                    {step === 2 && renderStep2_StrategySelection()}
                    {step === 3 && renderStep3_Results()}
                </div>
            </div>
        </div>
    )
};

export default OpportunityPipelineModal;
