/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useRef, useState, useEffect } from 'react';
import { Company, FinancialHealthAnalysis, PredictiveAnalysis, GeopoliticalRiskLevel, StockPrediction } from '../types';
import { CloseIcon, PlusIcon, DownloadIcon, DocumentTextIcon, CalculatorIcon, SparkleIcon, ExpandIcon, CompressIcon, GlobeIcon, BrainCircuitIcon, BookmarkIcon, AcademicIcon, ThumbsUpIcon, ShieldIcon, PipelineIcon, CriticalityIcon } from './icons/Icons';
import { companiesData } from '../constants';
import { supplyChainData } from '../lib/supplyChainData';
import SupplyChainVisualizer from './SupplyChainVisualizer';
import StockChart from './StockChart';
import PeerComparison from './PeerComparison';
import { getFinancialHealthAnalysis, getPredictiveAnalysis, getAIStockPrediction } from '../lib/gemini';
import DataContextVisualizer from './DataContextVisualizer';
import ShareDropdown from './ShareDropdown';
import { terms as glossaryTerms } from './GlossaryModal';

// Global types are now centralized in `types.ts`.
interface CompanyModalProps {
    company: Company;
    onClose: () => void;
    onAddToPortfolio: (company: Company) => void;
    onAddToWatchlist: (company: Company) => void;
    viewCompanyDetails: (company: Company) => void;
}

const Stat: React.FC<{ label: string; value: string | number; subValue?: string; className?: string }> = ({ label, value, subValue, className = '' }) => (
    <div className={`bg-black/20 p-3 rounded-md ${className}`}>
        <h4 className="text-xs text-gray-400 uppercase tracking-wider">{label}</h4>
        <p className="text-xl font-bold text-gray-100">{value}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
    </div>
);

const findTerm = (term: string) => glossaryTerms.find(t => t.term === term)?.definition || 'No definition available.';

const ScoreStat: React.FC<{
    label: string;
    value: string | number | undefined;
    termKey: string;
    suffix?: string;
    maxValue?: number;
    icon?: React.ReactNode;
    invertScale?: boolean;
}> = ({ label, value, termKey, suffix = '', maxValue, icon, invertScale = false }) => {
    if (value === undefined || value === null) {
        return null;
    }
    
    const getBarColor = (val: number, max: number) => {
        let pct = (val / max) * 100;
        if (invertScale) {
            pct = 100 - Math.min(100, Math.max(0, pct)); // Clamp and invert
        }
        if (pct >= 80) return 'bg-accent-green';
        if (pct >= 60) return 'bg-accent-blue';
        if (pct >= 40) return 'bg-yellow-400';
        return 'bg-accent-red';
    };

    return (
        <div className="bg-black/20 p-2 rounded-md" title={findTerm(termKey)}>
            <div className="flex justify-between items-baseline">
                <div className="flex items-center gap-1.5">
                    {icon && <span className="text-gray-500">{icon}</span>}
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider">{label}</h4>
                </div>
                <p className="text-lg font-bold text-gray-100">{value}{suffix}</p>
            </div>
            {maxValue && typeof value === 'number' && (
                <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div className={`h-1 rounded-full ${getBarColor(value, maxValue)}`} style={{ width: `${(value/maxValue)*100}%` }}></div>
                </div>
            )}
        </div>
    );
};


const CompanyModal: React.FC<CompanyModalProps> = ({ company, onClose, onAddToPortfolio, onAddToWatchlist, viewCompanyDetails }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    // State for PDCI-generated analysis
    const [financialAnalysis, setFinancialAnalysis] = useState<FinancialHealthAnalysis | null>(null);
    const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis | null>(null);
    const [stockPrediction, setStockPrediction] = useState<StockPrediction | null>(null);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setIsLoadingAnalysis(true);
            setFinancialAnalysis(null);
            setPredictiveAnalysis(null);
            setStockPrediction(null);
            try {
                // Run analysis sequentially to avoid rate-limiting
                const finHealth = await getFinancialHealthAnalysis(company);
                setFinancialAnalysis(finHealth);

                const predAnalysis = await getPredictiveAnalysis(company);
                setPredictiveAnalysis(predAnalysis);

                const stockPred = await getAIStockPrediction(company);
                setStockPrediction(stockPred);

            } catch (error) {
                console.error("Failed to fetch company analysis:", error);
            } finally {
                setIsLoadingAnalysis(false);
            }
        };
        fetchAnalysis();
    }, [company]);

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
        const imgData = canvas.toURL('image/png');
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
                a.download = `PDCI_Report_${company.Ticker}.pdf`;
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


    const growthColor = company.Revenue_Growth_YoY >= 0 ? 'text-accent-green' : 'text-accent-red';
    
    const geoRiskColorMap: Record<GeopoliticalRiskLevel, string> = {
        [GeopoliticalRiskLevel.Low]: 'text-accent-green',
        [GeopoliticalRiskLevel.Medium]: 'text-yellow-400',
        [GeopoliticalRiskLevel.High]: 'text-orange-500',
        [GeopoliticalRiskLevel.VeryHigh]: 'text-accent-red',
    };
    
    const geoRiskBgColorMap: Record<GeopoliticalRiskLevel, string> = {
        [GeopoliticalRiskLevel.Low]: 'bg-accent-green/5',
        [GeopoliticalRiskLevel.Medium]: 'bg-yellow-400/5',
        [GeopoliticalRiskLevel.High]: 'bg-orange-500/10',
        [GeopoliticalRiskLevel.VeryHigh]: 'bg-accent-red/10',
    };

    const getPredictionColor = (prediction: StockPrediction['prediction']) => {
        switch (prediction) {
            case 'Bullish':
            case 'Outperform':
                return 'text-accent-green';
            case 'Bearish':
            case 'Underperform':
                return 'text-accent-red';
            default:
                return 'text-gray-300';
        }
    };

    const AnalysisLoader: React.FC<{ message: string }> = ({ message }) => (
        <div className="space-y-3 animate-pulse p-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <SparkleIcon className="w-4 h-4" />
                <span>{message}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
                 <div className="bg-accent-blue h-1.5 rounded-full w-3/4"></div>
            </div>
        </div>
    );

    const modalContainerClasses = isFullScreen
        ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none z-30 flex flex-col'
        : 'glass-panel w-full max-w-7xl max-h-[95vh] flex flex-col';


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30 p-4" onClick={!isFullScreen ? onClose : undefined} role="dialog" aria-modal="true" aria-labelledby="company-modal-title">
            <div className={modalContainerClasses} onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-10 h-10 rounded-full object-contain bg-white" />
                        <div>
                            <h2 id="company-modal-title" className="text-2xl font-bold text-gray-100">{company.Company}</h2>
                            <p className="text-sm text-gray-400">{company.Ticker}:{company.Exchange}</p>
                        </div>
                         <div className="ml-4 flex items-center gap-2">
                             <span className={`font-semibold px-2 py-0.5 rounded-full text-xs bg-must-buy text-accent-green border border-accent-green/50`}>{company.Investment_Tier}</span>
                             <span className={`font-semibold px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300`}>{company.Risk_Level}</span>
                         </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <ShareDropdown generatePdfBlob={generatePdfBlob} company={company} />
                         <button
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="btn btn-secondary"
                            title="Download PDF"
                        >
                            <DownloadIcon className={isDownloading ? 'animate-pulse' : ''} />
                            <span className="hidden sm:inline">{isDownloading ? '...' : 'PDF'}</span>
                        </button>
                         <button
                            onClick={() => onAddToWatchlist(company)}
                            className="btn btn-secondary"
                            aria-label={`Add ${company.Company} to watchlist`}
                        >
                            <BookmarkIcon /> <span className="hidden lg:inline">Watchlist</span>
                        </button>
                         <button
                            onClick={() => onAddToPortfolio(company)}
                            className="btn btn-success"
                            aria-label={`Add ${company.Company} to portfolio`}
                        >
                            <PlusIcon /> <span className="hidden lg:inline">Add to Portfolio</span>
                        </button>
                        <button onClick={() => setIsFullScreen(!isFullScreen)} className="btn btn-ghost rounded-full" title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                            {isFullScreen ? <CompressIcon /> : <ExpandIcon />}
                        </button>
                        <button onClick={onClose} className="btn btn-ghost rounded-full" aria-label="Close company details modal">
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto">
                    <div ref={reportRef} className="p-6 bg-gray-900">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-6">
                                <div className="glass-panel p-4">
                                    <h3 className="font-semibold text-gray-200 mb-2">Simulated Price History (60 Days)</h3>
                                    <div className="h-64">
                                    <StockChart ticker={company.Ticker} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-panel p-4">
                                        <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2"><DocumentTextIcon /> PDCI Financial Analysis</h3>
                                        {isLoadingAnalysis && !financialAnalysis ? <AnalysisLoader message="Running financial health check..."/> : financialAnalysis ? (
                                            <div className="space-y-3 text-sm">
                                                <p><strong className="text-gray-300">Valuation:</strong> {financialAnalysis.valuation}</p>
                                                <p><strong className="text-gray-300">Health:</strong> {financialAnalysis.financialHealth}</p>
                                                <p><strong className="text-gray-300">Catalysts:</strong> {financialAnalysis.catalysts}</p>
                                                <p><strong className="text-gray-300">Risks:</strong> {financialAnalysis.risks}</p>
                                            </div>
                                        ) : <p className="text-sm text-gray-500">Analysis could not be generated.</p>}
                                    </div>
                                     <div className="glass-panel p-4">
                                        <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2"><CalculatorIcon /> PDCI Quantitative Outlook</h3>
                                        {isLoadingAnalysis && !predictiveAnalysis ? <AnalysisLoader message="Calculating predictive factors..."/> : predictiveAnalysis ? (
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <strong className="text-gray-300">Key Predictors:</strong>
                                                    <ul className="list-disc list-inside ml-2">
                                                        {predictiveAnalysis.keyPredictors.map(p => <li key={p.predictor}>{p.predictor}: <span className="text-gray-400">{p.rationale}</span></li>)}
                                                    </ul>
                                                </div>
                                                <p><strong className="text-gray-300">Confidence:</strong> {predictiveAnalysis.modelConfidence}%</p>
                                                <p><strong className="text-gray-300">Outlook:</strong> {predictiveAnalysis.outlook}</p>
                                            </div>
                                        ) : <p className="text-sm text-gray-500">Outlook could not be generated.</p>}
                                    </div>
                                </div>
                                 <div className="glass-panel p-4">
                                    <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2"><BrainCircuitIcon /> PDCI Prediction</h3>
                                    {isLoadingAnalysis && !stockPrediction ? <AnalysisLoader message="Generating stock prediction..."/> : stockPrediction ? (
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-gray-400">Outlook ({stockPrediction.timescale})</span>
                                                <span className={`text-xl font-bold ${getPredictionColor(stockPrediction.prediction)}`}>{stockPrediction.prediction}</span>
                                            </div>
                                            {stockPrediction.priceTarget && (
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-gray-400">Price Target</span>
                                                    <span className="font-mono text-lg text-gray-200">${stockPrediction.priceTarget.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-gray-400">Confidence</span>
                                                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                                                    <div className="bg-accent-blue h-2.5 rounded-full" style={{ width: `${stockPrediction.confidence}%` }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-300">Rationale:</p>
                                                <p className="text-gray-400 italic">{stockPrediction.rationale}</p>
                                            </div>
                                        </div>
                                    ) : <p className="text-sm text-gray-500">Prediction could not be generated.</p>}
                                </div>
                                <div className="glass-panel p-4">
                                    <h3 className="text-xl font-semibold text-gray-200 mb-3">Supply Chain Position</h3>
                                    <SupplyChainVisualizer 
                                        company={company} 
                                        allCompanies={companiesData}
                                        supplyChainData={supplyChainData}
                                        onViewDetails={viewCompanyDetails}
                                        onAddToPortfolio={onAddToPortfolio}
                                    />
                                </div>
                            </div>
                            
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-panel p-4">
                                    <h3 className="font-semibold text-gray-200 mb-2">Data Center Context</h3>
                                    <DataContextVisualizer companyCategory={company.Category} />
                                </div>
                                 <div className={`glass-panel p-4 transition-colors duration-300 ${geoRiskBgColorMap[company.Geopolitical_Risk]}`}>
                                    <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2"><GlobeIcon /> Geopolitical Risk</h3>
                                    <div className="text-center mb-4">
                                        <p className={`text-4xl font-bold ${geoRiskColorMap[company.Geopolitical_Risk]}`}>{company.Geopolitical_Risk.toUpperCase()}</p>
                                        <p className="text-xs text-gray-400">Score: {company.Geopolitical_Risk_Score}/100</p>
                                    </div>
                                    <div className={`p-3 rounded-lg text-sm transition-colors duration-300 ${
                                        (company.Geopolitical_Risk === GeopoliticalRiskLevel.High || company.Geopolitical_Risk === GeopoliticalRiskLevel.VeryHigh)
                                        ? 'bg-accent-red/10 ring-1 ring-accent-red/30'
                                        : 'bg-black/20'
                                    }`}>
                                        <p className="font-semibold text-gray-200 mb-1">Analyst Notes:</p>
                                        <p className="text-gray-300">{company.Geopolitical_Notes}</p>
                                    </div>
                                </div>
                                <div className="glass-panel p-4">
                                    <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2"><BrainCircuitIcon /> PDCI Proprietary Intelligence</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ScoreStat icon={<SparkleIcon className="w-4 h-4"/>} label="Universal Score" value={company.Universal_Score} termKey="Universal Score" maxValue={100} />
                                        <ScoreStat icon={<div className="font-bold text-gray-500 w-4 h-4 text-center text-sm">#</div>} label="Buy Rank" value={company.Buy_Rank} termKey="Buy Rank" invertScale={true} maxValue={companiesData.length} />
                                        <ScoreStat icon={<CriticalityIcon className="w-4 h-4" />} label="Criticality" value={company.Criticality} termKey="Criticality" maxValue={10} />
                                        <ScoreStat icon={<GlobeIcon className="w-4 h-4" />} label="Geo Risk Score" value={company.Geopolitical_Risk_Score} termKey="Geopolitical_Risk_Score" maxValue={100} invertScale={true} />
                                        <ScoreStat icon={<ShieldIcon className="w-4 h-4" />} label="Substitutability" value={company.Substitutability_Score} termKey="Substitutability Score" maxValue={100} invertScale={true} />
                                        <ScoreStat icon={<PipelineIcon className="w-4 h-4" />} label="SCSI" value={company.SCSI} termKey="SCSI" maxValue={500} />
                                        <ScoreStat icon={<AcademicIcon className="w-4 h-4" />} label="Graham Score" value={company.Graham_Score} termKey="Graham Score" maxValue={10} />
                                        <ScoreStat icon={<BrainCircuitIcon className="w-4 h-4" />} label="Psych Score" value={company.Psych_Score} termKey="Psych Score" maxValue={100} />
                                        <ScoreStat icon={<ThumbsUpIcon className="w-4 h-4" />} label="Success Prob." value={company.Probability_Of_Success} termKey="Probability_Of_Success" suffix="%" maxValue={100} />
                                    </div>
                                </div>
                                <div className="glass-panel p-4">
                                    <h3 className="font-semibold text-gray-200 mb-3">Key Metrics</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Stat label="P/E Ratio" value={company.PE_Ratio.toFixed(1)} subValue={`Fwd: ${company.Forward_PE.toFixed(1)}`} />
                                        <Stat label="Rev Growth (YoY)" value={`${company.Revenue_Growth_YoY.toFixed(1)}%`} className={growthColor} />
                                        <Stat label="Market Cap (B)" value={`$${company.Market_Cap_B.toFixed(1)}`} />
                                        <Stat label="EPS" value={company.EPS.toFixed(2)} />
                                        <Stat label="52-Wk Range" value={`${company['52_Week_Low'].toFixed(2)} - ${company['52_Week_High'].toFixed(2)}`} />
                                        <Stat label="Avg Volume (M)" value={company.Avg_Volume.toFixed(2)} />
                                        <Stat label="Div Yield" value={`${company.Dividend_Yield.toFixed(2)}%`} />
                                        <Stat label="Beta" value={company.Beta.toFixed(2)} />
                                        <Stat label="Debt-to-Equity" value={company.Debt_to_Equity.toFixed(2)} />
                                    </div>
                                </div>
                                <PeerComparison company={company} allCompanies={companiesData} onViewDetails={viewCompanyDetails} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyModal;