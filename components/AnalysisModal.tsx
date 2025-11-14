/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useRef, useState } from 'react';
import { CloseIcon, SparkleIcon, DownloadIcon, ThumbsUpIcon, WarningIcon, LightbulbIcon, ShieldIcon, ExpandIcon, CompressIcon } from './icons/Icons';
// FIX: Correct import path
import { PortfolioAnalysisResult } from '../lib/gemini';
import ShareDropdown from './ShareDropdown';

// Add jsPDF and html2canvas types for window object
// FIX: Removed declare global block to prevent type conflicts.
// Global types are now centralized in `types.ts`.

// --- Embedded Components ---

// Health Score Gauge
const HealthScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45; // 2 * pi * r
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s > 75) return '#00FF88'; // accent-green
        if (s > 40) return '#FFD700'; // yellow
        return '#FF0080'; // accent-red
    };

    return (
        <div className="relative flex items-center justify-center w-48 h-48">
            <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#1C2833" // gray-800
                    strokeWidth="10"
                    fill="transparent"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={getColor(score)}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-5xl font-bold" style={{ color: getColor(score) }}>{score}</span>
                <span className="text-sm text-gray-400">Health Score</span>
            </div>
        </div>
    );
};

// Bar Chart
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
    const colors = ['#00FF88', '#00D9FF', '#B0B8C8', '#F59E0B', '#FF0080', '#8B5CF6'];

    return (
        <div className="glass-panel p-4 h-full">
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

// Markdown Renderer
const MarkdownRenderer: React.FC<{ content: string | null }> = ({ content }) => {
    if (!content) return null;

    const renderLine = (line: string, key: number) => {
        if (line.trim().startsWith('###')) {
            return <h3 key={key} className="text-lg font-semibold text-gray-200 mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
        }
        if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
             return <p key={key}><strong className="font-semibold text-gray-100">{line.slice(2, -2)}</strong></p>;
        }
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const cleanLine = line.trim().substring(line.trim().indexOf(' ') + 1);
            const parts = cleanLine.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
            );
            return <li key={key} className="flex items-start"><span className="mr-2 mt-1 text-accent-blue">•</span><span>{parts}</span></li>;
        }
        if (line.trim() === '') {
            return <br key={key} />;
        }
        return <p key={key} className="text-gray-300 my-2">{line}</p>;
    };

    const lines = content.split('\n');
    const listItems = lines.filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));
    const nonListItems = lines.filter(line => !line.trim().startsWith('- ') && !line.trim().startsWith('* '));

    if (listItems.length > 0) {
        return (
            <>
                {nonListItems.map(renderLine)}
                <ul className="space-y-2 mt-2">
                    {listItems.map(renderLine)}
                </ul>
            </>
        )
    }

    return <>{lines.map(renderLine)}</>;
};

// Analysis Card
const AnalysisCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="glass-panel p-6 h-full">
        <div className="flex items-center gap-3 mb-4">
            <div className="text-accent-blue">{icon}</div>
            <h3 className="text-xl font-bold text-gray-100">{title}</h3>
        </div>
        <div className="text-gray-300 space-y-2 text-sm">
            {children}
        </div>
    </div>
);

// --- Main Modal Component ---
interface AnalysisModalProps {
    analysis: PortfolioAnalysisResult | null;
    onClose: () => void;
    isAnalyzing: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ analysis, onClose, isAnalyzing }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const generatePdfBlob = async (): Promise<Blob | null> => {
        if (!reportRef.current) return null;
        if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            alert('PDF generation library not loaded yet. Please wait a moment and try again.');
            return null;
        }
        const canvas = await window.html2canvas(reportRef.current, {
            backgroundColor: '#0A0E27',
            scale: 2,
            useCORS: true
        });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        return pdf.output('blob');
    };

    const handleDownloadPdf = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const blob = await generatePdfBlob();
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'PDCI_Portfolio_Analysis.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Sorry, there was an error creating the PDF report.");
        } finally {
            setIsDownloading(false);
        }
    };

    const renderContent = () => {
        if (isAnalyzing) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4">
                    <SparkleIcon className="w-12 h-12 text-accent-blue" />
                    <p className="text-gray-300 text-lg animate-pulse mt-4">Analyzing your portfolio with PDCI Network Intelligence...</p>
                    <p className="text-gray-500 mt-2">This may take a moment to generate your deep analysis report.</p>
                </div>
            );
        }

        if (!analysis || analysis.summary.startsWith("Error:")) {
             return (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <WarningIcon className="text-accent-red w-12 h-12" />
                    <p className="text-red-400 mt-4">{analysis?.summary || 'Analysis report will appear here.'}</p>
                </div>
            );
        }

        return (
             <div ref={reportRef} className="p-8 bg-gray-900">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-1 flex flex-col items-center justify-center glass-panel p-6">
                         <HealthScoreGauge score={analysis.healthScore} />
                    </div>
                    <div className="lg:col-span-2">
                        <AnalysisCard title="Executive Summary" icon={<SparkleIcon />}>
                           <MarkdownRenderer content={analysis.summary} />
                        </AnalysisCard>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <AnalysisCard title="Strengths" icon={<ThumbsUpIcon />}>
                        <MarkdownRenderer content={analysis.strengths} />
                    </AnalysisCard>
                    <AnalysisCard title="Weaknesses" icon={<WarningIcon />}>
                         <MarkdownRenderer content={analysis.weaknesses} />
                    </AnalysisCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                     <div className="lg:col-span-2">
                        <AnalysisCard title="Risk Analysis" icon={<ShieldIcon />}>
                           <MarkdownRenderer content={analysis.riskAnalysis} />
                        </AnalysisCard>
                    </div>
                     <div className="lg:col-span-1">
                        <AnalysisCard title="Recommendations" icon={<LightbulbIcon />}>
                            <MarkdownRenderer content={analysis.recommendations} />
                        </AnalysisCard>
                    </div>
                </div>
                
                {analysis.composition && (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-100 mb-4">Portfolio Composition</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <BarChart title="By Category" data={analysis.composition.byCategory} />
                            <BarChart title="By Risk Level" data={analysis.composition.byRisk} />
                            <BarChart title="By Investment Tier" data={analysis.composition.byTier} />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const modalContainerClasses = isFullScreen
        ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none z-50 flex flex-col'
        : 'glass-panel w-full max-w-7xl max-h-[95vh] flex flex-col';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={!isFullScreen ? onClose : undefined} role="dialog" aria-modal="true" aria-labelledby="analysis-modal-title">
            <div className={modalContainerClasses} onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 id="analysis-modal-title" className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <SparkleIcon />
                        PDCI AI Portfolio Analysis Report
                    </h2>
                    <div className="flex items-center gap-2">
                         <ShareDropdown
                            generatePdfBlob={generatePdfBlob}
                            title="PDCI Portfolio Analysis Report"
                            text="Check out this portfolio analysis from the PDCI Dashboard."
                            fileName="PDCI_Portfolio_Analysis.pdf"
                         />
                         <button
                            onClick={handleDownloadPdf}
                            disabled={isAnalyzing || !analysis || isDownloading || (analysis && analysis.summary.startsWith("Error:"))}
                            className="neuro-button flex items-center gap-2 text-white font-semibold py-2 px-4 disabled:opacity-50"
                            title="Download PDF"
                        >
                            <DownloadIcon className={isDownloading ? 'animate-pulse' : ''} />
                            <span className="hidden sm:inline">{isDownloading ? '...' : 'PDF'}</span>
                        </button>
                        <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 rounded-full text-gray-400 hover:bg-white/10" title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                            {isFullScreen ? <CompressIcon /> : <ExpandIcon />}
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10" aria-label="Close analysis modal">
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AnalysisModal;