/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState, useRef, useContext } from 'react';
import { CloseIcon, PipelineIcon, SparkleIcon, LightbulbIcon, DownloadIcon, ExpandIcon, CompressIcon } from './icons/Icons';
import { Company } from '../types';
// FIX: Correct import path
import { findFutureOpportunities, FutureOpportunityAnalysis } from '../lib/gemini';
import { upcomingProjects, UpcomingProject } from '../lib/upcomingProjects';
import ShareDropdown from './ShareDropdown';
import { ApiKeyContext } from '../context';

// FIX: Removed declare global block to prevent type conflicts.
// Global types are now centralized in `types.ts`.
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
    const { setIsKeyReady } = useContext(ApiKeyContext);
    const [step, setStep] = useState(1); // 1: Project, 2: Strategy, 3: Results
    const [selectedProjects, setSelectedProjects] = useState<UpcomingProject[]>([]);
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<FutureOpportunityAnalysis | null>(null);
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
                a.download = 'PDCI_Opportunity_Pipeline_Report.pdf';
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
             if (e instanceof Error && e.message.includes("Requested entity was not found.")) {
                setIsKeyReady(false);
             }
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
                    className="btn btn-primary"
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
                    className="btn btn-success"
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
                     <button onClick={handleStartOver} className="btn btn-secondary mt-4">Start Over</button>
                </div>
            )
        }
        
        return (
            <div ref={reportRef} className="p-6 bg-gray-900">
                <div className="space-y-4">
                    <div>
                        <button onClick={handleStartOver} className="text-sm text-accent-blue hover:underline mb-2 print:hidden">&larr; Start New Analysis</button>
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
                    <div className="mt-4 flex justify-end print:hidden">
                        <button onClick={onClose} className="btn btn-primary">
                            Finalize Strategy
                        </button>
                    </div>
                </div>
            </div>
        );
    };

     const modalContainerClasses = isFullScreen
        ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none z-50 flex flex-col'
        : 'glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={!isFullScreen ? onClose : undefined} role="dialog" aria-modal="true" aria-labelledby="pipeline-modal-title">
            <div className={modalContainerClasses} onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 id="pipeline-modal-title" className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <PipelineIcon />
                        PDCI Opportunity Pipeline
                    </h2>
                     <div className="flex items-center gap-2">
                        {step === 3 && !isLoading && result && (
                            <>
                                <ShareDropdown
                                    generatePdfBlob={generatePdfBlob}
                                    title="PDCI Opportunity Pipeline Report"
                                    text={`Check out this opportunity pipeline analysis from the PDCI Dashboard, focusing on ${selectedProjects.map(p=>p.name).join(', ')}.`}
                                    fileName="PDCI_Opportunity_Pipeline_Report.pdf"
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
                            </>
                        )}
                        <button onClick={() => setIsFullScreen(!isFullScreen)} className="btn btn-ghost rounded-full" title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                            {isFullScreen ? <CompressIcon /> : <ExpandIcon />}
                        </button>
                        <button onClick={onClose} className="btn btn-ghost rounded-full" aria-label="Close opportunity pipeline modal">
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto">
                    {step !== 3 && <div className="p-6">{step === 1 ? renderStep1_ProjectSelection() : renderStep2_StrategySelection()}</div>}
                    {step === 3 && renderStep3_Results()}
                </div>
            </div>
        </div>
    )
};

export default OpportunityPipelineModal;