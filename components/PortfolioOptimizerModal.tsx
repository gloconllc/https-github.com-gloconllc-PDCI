

import React, { useState, useRef } from 'react';
import { CloseIcon, OptimizeIcon, SparkleIcon, PlusIcon, MinusIcon, DownloadIcon, ExpandIcon, CompressIcon } from './icons/Icons';
// FIX: Correct import path
import { PortfolioOptimizationResult, SuggestedTrade } from '../lib/gemini';
import ShareDropdown from './ShareDropdown';

// FIX: Removed declare global block to prevent type conflicts.
// Global types are now centralized in `types.ts`.
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

const TradeCard: React.FC<{ trade: SuggestedTrade }> = ({ trade }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-black/20 p-3 rounded-md transition-all duration-200">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    {trade.action === 'Add' ? <PlusIcon className="text-accent-green" /> : <MinusIcon className="text-accent-red" />}
                    <div>
                        <p className={`font-bold ${trade.action === 'Add' ? 'text-accent-green' : 'text-accent-red'}`}>{trade.action} {trade.companyName} ({trade.ticker})</p>
                        <p className="text-xs text-gray-400 mt-1">{trade.reasoning}</p>
                    </div>
                </div>
                <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>&#9660;</span>
            </div>
            {isExpanded && (
                 <div className="mt-2 pl-8 pt-2 border-t border-white/10 text-xs text-gray-300 animate-fade-in-up">
                    <p className="font-semibold text-gray-200">Detailed Rationale:</p>
                    <p>{trade.detailedReasoning}</p>
                </div>
            )}
        </div>
    );
}


const PortfolioOptimizerModal: React.FC<PortfolioOptimizerModalProps> = ({ onClose, onRunOptimization, isLoading, result, onApply }) => {
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const generatePdfBlob = async (): Promise<Blob | null> => {
        if (!reportRef.current) return null;
        if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            alert('PDF generation library not loaded yet. Please wait a moment and try again.');
            return null;
        }
        const canvas = await window.html2canvas(reportRef.current, { backgroundColor: '#0A0E27', scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
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
                a.download = 'PDCI_Optimization_Report.pdf';
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
    
    const handleRunClick = () => {
        if (selectedStrategy) {
            onRunOptimization(selectedStrategy);
        }
    };

    const renderSelectionScreen = () => (
        <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Select a Quantitative Strategy</h3>
            <p className="text-sm text-gray-400 mb-4">The PICOU AI will analyze your current portfolio and suggest trades to align it with your chosen strategy.</p>
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
                    className="btn btn-success"
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
            <p className="text-gray-500 mt-2 max-w-md">Our PICOU AI is running thousands of simulations to find the optimal trades for your selected strategy.</p>
        </div>
    );
    
    const renderResultsScreen = () => {
        if (!result) return null;

        return (
             <div ref={reportRef} className="p-6 bg-gray-900">
                <div className="space-y-4">
                    <div className="print:hidden">
                        <button onClick={() => { setSelectedStrategy(null); onRunOptimization(''); /* Clear results */ }} className="text-sm text-accent-blue hover:underline mb-2">&larr; Back to Strategies</button>
                        <h3 className="text-2xl font-bold text-gray-100">Optimization Report</h3>
                        <p className="text-md text-gray-400">Strategy: <span className="font-semibold text-accent-blue">{result.strategy}</span></p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-panel p-4">
                            <h4 className="font-semibold text-gray-200 mb-2">Strategy Rationale</h4>
                            <p className="text-sm text-gray-300">{result.strategyRationale}</p>
                        </div>
                        <div className="glass-panel p-4">
                            <h4 className="font-semibold text-gray-200 mb-2">Risk Considerations</h4>
                            <p className="text-sm text-gray-300">{result.riskConsiderations}</p>
                        </div>
                    </div>

                    <div className="glass-panel p-4">
                        <h4 className="font-semibold text-gray-200 mb-3">Suggested Trades</h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {result.suggestedTrades.map((trade, index) => (
                            <TradeCard key={index} trade={trade} />
                            ))}
                        </div>
                    </div>
                    
                    <div className="glass-panel p-4">
                        <h4 className="font-semibold text-gray-200 mb-2">AI Summary</h4>
                        <p className="text-sm text-gray-300">{result.summary}</p>
                    </div>

                    <div className="mt-4 flex justify-end gap-3 print:hidden">
                         <ShareDropdown
                            generatePdfBlob={generatePdfBlob}
                            title="PDCI Portfolio Optimization Report"
                            text={`Check out this portfolio optimization report from the PDCI Dashboard, based on the ${selectedStrategy} strategy.`}
                            fileName="PDCI_Optimization_Report.pdf"
                         />
                         <button
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="btn btn-secondary"
                             title="Download PDF"
                        >
                            <DownloadIcon className={isDownloading ? 'animate-pulse' : ''} />
                            <span className="hidden sm:inline">{isDownloading ? '...' : 'PDF'}</span>
                        </button>
                        <button onClick={() => onApply(result.suggestedTrades)} className="btn btn-success">
                            Apply Suggestions to Portfolio
                        </button>
                    </div>
                </div>
             </div>
        )
    };
    
    const modalContainerClasses = isFullScreen
        ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none z-50 flex flex-col'
        : 'glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col';


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={!isFullScreen ? onClose : undefined}>
            <div className={modalContainerClasses} onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <OptimizeIcon />
                        PDCI AI Quantitative Strategist
                    </h2>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setIsFullScreen(!isFullScreen)} className="btn btn-ghost rounded-full" title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                            {isFullScreen ? <CompressIcon /> : <ExpandIcon />}
                        </button>
                        <button onClick={onClose} className="btn btn-ghost rounded-full">
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto">
                    {isLoading ? renderLoadingScreen() : result ? renderResultsScreen() : renderSelectionScreen()}
                </div>
            </div>
        </div>
    );
};

export default PortfolioOptimizerModal;