/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState, useCallback } from 'react';
import { Company } from '../types';
import { CloseIcon, SparkleIcon, WarningIcon, ThumbsUpIcon } from './icons/Icons';
import { getChatResponse } from '../lib/gemini'; // Re-using for simplicity

interface ScenarioAnalysisModalProps {
    onClose: () => void;
    portfolio: Company[];
}

const scenarios = [
    {
        title: "Geopolitical Conflict Halts Taiwan Production",
        description: "Simulates a complete stop of all semiconductor manufacturing and exports from Taiwan.",
        icon: <WarningIcon className="text-accent-red" />
    },
    {
        title: "Breakthrough in EUV-Alternative Lithography",
        description: "A competitor to ASML announces a viable, cheaper alternative to EUV lithography, threatening their monopoly.",
        icon: <SparkleIcon className="text-accent-blue" />
    },
    {
        title: "Global Copper Shortage Worsens",
        description: "Major copper mines go offline, causing a 50% spike in copper prices and severe shortages.",
        icon: <WarningIcon className="text-yellow-500" />
    },
    {
        title: "AI Demand Doubles Expectations",
        description: "Hyperscalers announce plans to double their AI infrastructure spending over the next 18 months.",
        icon: <ThumbsUpIcon className="text-accent-green" />
    }
];

const ScenarioAnalysisModal: React.FC<ScenarioAnalysisModalProps> = ({ onClose, portfolio }) => {
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const formatCompanyDataForPrompt = (companies: Company[]): string => {
        return companies.map(c =>
            `- ${c.Company} (${c.Ticker}): Role: ${c.Supply_Chain_Role}, Category: ${c.Category}, Key Product: ${c.Product_Component}`
        ).join('\n');
    };

    const handleRunAnalysis = useCallback(async (scenarioTitle: string) => {
        if (!portfolio.length) return;

        setSelectedScenario(scenarioTitle);
        setIsLoading(true);
        setResult(null);

        const prompt = `
            System: You are a geopolitical and financial risk analyst. Analyze the impact of a specific scenario on the user's investment portfolio.

            Scenario: "${scenarioTitle}"

            User's Portfolio:
            ${formatCompanyDataForPrompt(portfolio)}

            Task:
            1. Provide a brief (2-3 sentences) overview of the immediate impact of this scenario on the AI data center supply chain.
            2. Identify the **most impacted companies** (both positive and negative) in the portfolio and explain why in a bulleted list.
            3. Suggest **1-2 strategic considerations** for the portfolio owner in light of this scenario.
            Use markdown for formatting.
        `;

        try {
            // Using getChatResponse for simplicity, but a dedicated function would be better in a real app
            const response = await getChatResponse(prompt, portfolio);
            setResult(response.text);
        } catch (error) {
            console.error("Scenario analysis failed:", error);
            setResult("An error occurred while running the analysis. Please try again.");
        } finally {
            setIsLoading(false);
        }

    }, [portfolio]);

    const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
        return (
            <div className="prose prose-invert prose-sm max-w-none">
                {content.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                    if (line.startsWith('* ')) return <li key={i} className="my-1">{line.replace('* ', '')}</li>;
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i}>{line}</p>;
                })}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <SparkleIcon />
                        Scenario Analysis
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-200 mb-3">Select a Scenario</h3>
                        <div className="space-y-3">
                            {scenarios.map(s => (
                                <button
                                    key={s.title}
                                    onClick={() => handleRunAnalysis(s.title)}
                                    disabled={isLoading}
                                    className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait ${selectedScenario === s.title ? 'bg-accent-blue/20 border-accent-blue' : 'bg-black/20 border-gray-700 hover:border-gray-500'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">{s.icon}</div>
                                        <div>
                                            <h4 className="font-bold text-gray-100">{s.title}</h4>
                                            <p className="text-xs text-gray-400">{s.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="glass-panel p-4">
                        <h3 className="font-semibold text-gray-200 mb-3">AI-Generated Impact Analysis</h3>
                        <div className="min-h-[300px] overflow-y-auto text-sm">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <SparkleIcon className="animate-pulse" />
                                    <p className="mt-2 text-gray-400">Analyzing scenario impact...</p>
                                </div>
                            )}
                            {result && <MarkdownRenderer content={result} />}
                            {!isLoading && !result && (
                                <div className="flex items-center justify-center h-full text-center text-gray-500">
                                    Select a scenario to run analysis on your portfolio.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioAnalysisModal;