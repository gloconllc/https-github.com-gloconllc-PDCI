/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState } from 'react';
import { Company, GoalPlannerResult, RiskLevel } from '../types';
import { CloseIcon, SparkleIcon, WarningIcon, LinkIcon } from './icons/Icons';
import { getGoalBasedPlan } from '../lib/gemini';
import LineChart from './LineChart';

interface GoalPlannerModalProps {
    onClose: () => void;
    contextCompanies: Company[];
}

const GoalPlannerModal: React.FC<GoalPlannerModalProps> = ({ onClose, contextCompanies }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GoalPlannerResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [initialInvestment, setInitialInvestment] = useState('50000');
    const [targetAmount, setTargetAmount] = useState('250000');
    const [horizon, setHorizon] = useState('10');
    const [riskProfile, setRiskProfile] = useState<RiskLevel>(RiskLevel.Moderate);

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        setError(null);
        setStep(2);

        try {
            const plan = await getGoalBasedPlan({
                initial: parseFloat(initialInvestment),
                target: parseFloat(targetAmount),
                horizon: parseInt(horizon, 10),
                risk: riskProfile,
            }, contextCompanies);
            setResult(plan);
        } catch (e) {
            console.error("Failed to generate goal plan:", e);
            setError("The AI model could not generate a plan based on the inputs. Please adjust your goals or try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Define Your Investment Goals</h3>
            <p className="text-sm text-gray-400 mb-6">The PDCI AI will generate a hypothetical plan to illustrate how you might reach your objectives.</p>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="initial" className="block text-sm font-medium text-gray-400">Initial Investment ($)</label>
                        <input type="number" id="initial" value={initialInvestment} onChange={e => setInitialInvestment(e.target.value)} className="w-full mt-1 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200" />
                    </div>
                    <div>
                        <label htmlFor="target" className="block text-sm font-medium text-gray-400">Target Amount ($)</label>
                        <input type="number" id="target" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full mt-1 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200" />
                    </div>
                </div>
                <div>
                    <label htmlFor="horizon" className="block text-sm font-medium text-gray-400">Investment Horizon (Years)</label>
                    <input type="number" id="horizon" value={horizon} onChange={e => setHorizon(e.target.value)} className="w-full mt-1 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Risk Profile</label>
                    <div className="flex gap-2 mt-2">
                        {Object.values(RiskLevel).map(risk => (
                            <button key={risk} onClick={() => setRiskProfile(risk)} className={`px-4 py-2 text-sm rounded-md border-2 transition-colors ${riskProfile === risk ? 'bg-accent-blue text-white border-accent-blue' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>
                                {risk}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                <button onClick={handleGeneratePlan} className="btn btn-success">
                    <SparkleIcon /> Generate Hypothetical Plan
                </button>
            </div>
        </div>
    );
    
     const renderStep2 = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-6">
                    <SparkleIcon className="w-12 h-12 text-accent-blue" />
                    <p className="text-gray-300 text-lg animate-pulse mt-4">Generating your personalized AI plan...</p>
                    <p className="text-gray-500 mt-2 max-w-md">The PDCI core is analyzing your goals against our universe of companies to build a suitable hypothetical strategy.</p>
                </div>
            );
        }

        if (error || !result) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-6">
                    <WarningIcon className="text-accent-red w-12 h-12"/>
                    <p className="text-red-400 mt-4">{error || "An unknown error occurred."}</p>
                    <button onClick={() => setStep(1)} className="btn btn-secondary mt-4">
                        &larr; Back to Goal Definition
                    </button>
                </div>
            )
        }
        
        const chartData = result.growthProjection.map(p => ({ year: p.year, portfolioValue: p.projectedValue, benchmarkValue: 0 }));

        return (
            <div className="p-6">
                <button onClick={() => setStep(1)} className="text-sm text-accent-blue hover:underline mb-4">&larr; Adjust Goals</button>
                <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-300 text-sm rounded-lg p-3 mb-4">
                    <strong>Disclaimer:</strong> {result.disclaimer}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <div className="glass-panel p-4">
                            <h4 className="font-semibold text-gray-200 mb-2">AI-Generated Strategy</h4>
                            <p className="text-sm text-gray-300">{result.strategySummary}</p>
                        </div>
                        <div className="glass-panel p-4">
                            <h4 className="font-semibold text-gray-200 mb-3">Hypothetical Portfolio</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {result.hypotheticalPortfolio.map(p => (
                                    <div key={p.ticker} className="bg-black/20 p-2 rounded-md">
                                        <p className="font-bold text-gray-100">{p.companyName} ({p.ticker})</p>
                                        <p className="text-xs text-gray-400 mt-1">{p.rationale}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div className="glass-panel p-4">
                            <h4 className="font-semibold text-gray-200 mb-2">Key Assumptions</h4>
                            <p className="text-sm text-gray-300">{result.keyAssumptions}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel p-4">
                             <h4 className="font-semibold text-gray-200 mb-2">Hypothetical Growth Projection</h4>
                             <div className="h-48">
                                <LineChart data={chartData} />
                             </div>
                        </div>
                        <div className="glass-panel p-4">
                            <h4 className="font-semibold text-gray-200 mb-2">Historical Analogy</h4>
                             <a href={result.realWorldExample.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-accent-blue hover:underline flex items-center gap-1">
                                <LinkIcon /> {result.realWorldExample.title}
                            </a>
                            <p className="text-xs text-gray-400 mt-1">{result.realWorldExample.narrative}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="goal-planner-title">
            <div className="glass-panel w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 id="goal-planner-title" className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <SparkleIcon />
                        PDCI AI Goal Planner
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10" aria-label="Close Goal Planner">
                        <CloseIcon />
                    </button>
                </div>
                <div className="overflow-y-auto">
                    {step === 1 ? renderStep1() : renderStep2()}
                </div>
            </div>
        </div>
    );
};

export default GoalPlannerModal;