
import React from 'react';
import { CloseIcon, SparkleIcon } from './icons/Icons';
import { PortfolioAnalysisResult } from '../lib/gemini';

// --- Embedded BarChart Component ---
interface ChartDataItem {
    label: string;
    value: number;
}

interface BarChartProps {
    data: ChartDataItem[];
    title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
    if (!data || data.length === 0) return null;
    const maxValue = Math.max(...data.map(item => item.value), 1);
    const colors = ['#1DB954', '#2D72D9', '#B3B3B3', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div>
            <h4 className="text-md font-semibold text-gray-300 mb-3">{title}</h4>
            <div className="space-y-2.5">
                {data.map((item, index) => (
                    <div key={item.label} className="flex items-center group">
                        <div className="w-1/3 text-sm text-gray-400 truncate pr-2 group-hover:text-gray-200 transition-colors">{item.label}</div>
                        <div className="w-2/3 bg-gray-700 rounded-full h-5">
                            <div
                                className="h-5 rounded-full text-xs font-medium text-black flex items-center justify-end pr-2 transition-all duration-500 ease-out"
                                style={{
                                    width: `${(item.value / maxValue) * 100}%`,
                                    backgroundColor: colors[index % colors.length],
                                    minWidth: '24px'
                                }}
                            >
                                {item.value.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Analysis Section Component ---
const AnalysisSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div>
        <h3 className="text-lg font-semibold text-accent-green mb-3 border-b-2 border-accent-green pb-1 inline-block">{title}</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
            {items.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-100">$1</strong>') }}></li>
            ))}
        </ul>
    </div>
);

// --- Main Modal Component ---
interface AnalysisModalProps {
    analysis: PortfolioAnalysisResult | null;
    onClose: () => void;
    isAnalyzing: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ analysis, onClose, isAnalyzing }) => {
    const renderContent = () => {
        if (isAnalyzing) {
            return (
                <div className="text-center py-10">
                    <p className="text-gray-300 text-lg animate-pulse">Analyzing your portfolio with Network Intelligence...</p>
                    <p className="text-gray-500 mt-2">This may take a moment to generate your BI report.</p>
                </div>
            );
        }

        if (!analysis) {
             return (
                <div className="text-center py-10">
                    <p className="text-gray-400">Analysis report will appear here.</p>
                </div>
            );
        }
        
        if (analysis.summary.startsWith("Error:")) {
             return (
                <div className="text-center py-10">
                    <p className="text-red-400">{analysis.summary}</p>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-accent-green mb-3 border-b-2 border-accent-green pb-1 inline-block">Executive Summary</h3>
                    <p className="text-gray-300">{analysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnalysisSection title="Strengths" items={analysis.strengths} />
                    <AnalysisSection title="Weaknesses" items={analysis.weaknesses} />
                </div>
                
                <AnalysisSection title="Key Risk Analysis" items={analysis.riskAnalysis} />
                <AnalysisSection title="Recommendations" items={analysis.recommendations} />

                <div>
                     <h3 className="text-lg font-semibold text-accent-green mb-4 border-b-2 border-accent-green pb-1 inline-block">Portfolio Composition</h3>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 bg-gray-900 rounded-lg">
                        <BarChart title="By Category" data={analysis.composition.byCategory} />
                        <BarChart title="By Risk Level" data={analysis.composition.byRisk} />
                        <BarChart title="By Investment Tier" data={analysis.composition.byTier} />
                     </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-700 p-4 border-b border-gray-600 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <SparkleIcon />
                        AI Portfolio Analysis Report
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-600">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AnalysisModal;
