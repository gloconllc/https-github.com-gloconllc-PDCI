import React, { useState } from 'react';
import { Company, InvestmentTier, RiskLevel, Substitutability } from '../types';
import { CloseIcon, SparkleIcon, RenaissanceIcon, CitadelIcon, BridgewaterIcon, TwoSigmaIcon, DEShawIcon, MillenniumIcon, TrendingUpIcon, TrendingDownIcon } from './icons/Icons';
import { getLongTermThesis, getHistoricalAnalysis, getInfrastructureIntelligenceReport, getAcademicAndMacroReport, getPowerDensityAnalysis, getConvergedIntelligenceReport, getScholarlyValidationReport, ScholarlyReport, getTradeSimulationAnalysis } from '../lib/gemini';
import { supplyChainData } from '../lib/supplyChainData';
import { companiesData } from '../constants';
import SupplyChainVisualizer from './SupplyChainVisualizer';

interface CompanyModalProps {
    company: Company;
    onClose: () => void;
    onAddToPortfolio: (company: Company) => void;
    viewCompanyDetails: (company: Company) => void;
}

const tierColorMap: Record<InvestmentTier, string> = {
    [InvestmentTier.MustBuy]: 'bg-accent-green text-black',
    [InvestmentTier.HighConviction]: 'bg-accent-blue text-white',
    [InvestmentTier.OnRadar]: 'bg-gray-400 text-black'
};

const riskColorMap: Record<RiskLevel, string> = {
    [RiskLevel.Conservative]: 'bg-blue-900 text-blue-300',
    [RiskLevel.Moderate]: 'bg-yellow-900 text-yellow-300',
    [RiskLevel.Aggressive]: 'bg-orange-900 text-orange-300',
    [RiskLevel.High]: 'bg-red-900 text-red-300',
};

const substitutabilityColorMap: Record<Substitutability, string> = {
    'Impossible': 'border-red-500 text-red-400',
    'Difficult': 'border-orange-500 text-orange-400',
    'Moderate': 'border-yellow-500 text-yellow-400',
    'Easy': 'border-green-500 text-green-400',
};

const getSubstitutabilityScoreColor = (score: number) => {
    if (score <= 30) return 'bg-green-800 text-green-300'; // Impossible/Difficult = Good
    if (score <= 60) return 'bg-yellow-800 text-yellow-300'; // Moderate = Warning
    return 'bg-red-800 text-red-300'; // Easy = Bad
};

const getEsgTextColor = (score?: number) => {
    if (score === undefined) return 'text-gray-500';
    if (score > 75) return 'text-accent-green';
    if (score > 55) return 'text-yellow-400';
    return 'text-accent-red';
};

const getGrahamColor = (score?: number) => {
    if (score === undefined) return 'text-gray-500';
    if (score >= 8) return 'text-accent-green';
    if (score >= 6) return 'text-yellow-400';
    return 'text-accent-red';
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode; isBadge?: boolean }> = ({ label, value, isBadge = false }) => (
    <div className="py-3 px-4 flex justify-between items-center odd:bg-white/5 even:bg-transparent rounded">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        {isBadge ? value : <span className="text-sm text-right text-gray-200">{value}</span>}
    </div>
);

const Stat: React.FC<{ label: string; value: string | number; color?: string; subValue?: string }> = ({ label, value, color = 'text-gray-100', subValue }) => (
    <div className="bg-black/20 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
    </div>
);

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
            return <div key={key} className="flex items-start"><span className="mr-2 mt-1">•</span><span>{parts}</span></div>;
        }
        if (line.trim() === '') {
            return <br key={key} />;
        }
        return <p key={key} className="text-gray-300 my-2">{line}</p>;
    };

    const lines = content.split('\n');
    return <>{lines.map(renderLine)}</>;
};

const HedgeFundReportRenderer: React.FC<{ content: string | null; onSimulateTrade: (type: 'Buy' | 'Sell') => void; tradeSimulation: string | null; isTradeSimLoading: boolean; isReportLoading: boolean }> = ({ content, onSimulateTrade, tradeSimulation, isTradeSimLoading, isReportLoading }) => {
    if (!content) return null;

    const sections = content.split('### ').slice(1);

    const iconMap: { [key: string]: React.FC } = {
        'Renaissance Technologies Analysis': RenaissanceIcon,
        'Citadel Analysis': CitadelIcon,
        'Bridgewater Associates Analysis': BridgewaterIcon,
        'Two Sigma Analysis': DEShawIcon,
        'D.E. Shaw Analysis': DEShawIcon,
        'Millennium Management Analysis': MillenniumIcon,
    };

    return (
        <div className="space-y-4">
            {sections.map((section, index) => {
                const [title, ...bodyParts] = section.split('\n');
                const body = bodyParts.join('\n');
                const Icon = iconMap[title.trim()];

                if (title.trim() === 'Executive Summary' || title.trim().startsWith('Final Converged Conviction')) {
                    return (
                        <div key={index}>
                            <h3 className="text-lg font-semibold text-gray-200 mt-4 mb-2">{title.trim()}</h3>
                            <MarkdownRenderer content={body} />
                        </div>
                    );
                }

                return (
                    <div key={index} className="bg-black/20 p-4 rounded-lg">
                        <h4 className="text-md font-semibold text-gray-200 mb-2 flex items-center gap-2">
                            {Icon && <Icon />}
                            {title.trim()}
                        </h4>
                        <MarkdownRenderer content={body} />
                    </div>
                );
            })}

            {content && !isReportLoading && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-md font-semibold text-gray-300 mb-3">Trade Impact Simulation</h4>
                    <div className="flex items-center gap-4">
                        <button onClick={() => onSimulateTrade('Buy')} disabled={isTradeSimLoading} className="neuro-button flex-1 flex items-center justify-center gap-2 bg-accent-green/20 text-accent-green font-semibold py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed">
                            <TrendingUpIcon /> Simulate Buy Impact
                        </button>
                        <button onClick={() => onSimulateTrade('Sell')} disabled={isTradeSimLoading} className="neuro-button flex-1 flex items-center justify-center gap-2 bg-accent-red/20 text-accent-red font-semibold py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed">
                            <TrendingDownIcon /> Simulate Sell Impact
                        </button>
                    </div>

                    {isTradeSimLoading && <div className="text-gray-400 animate-pulse mt-4 text-center">Simulating trade impact...</div>}
                    
                    {tradeSimulation && (
                        <div className="mt-4 p-4 bg-black/30 rounded-lg border border-white/10">
                             <h5 className="font-semibold text-accent-blue mb-2">Trade Simulation Analysis:</h5>
                            <MarkdownRenderer content={tradeSimulation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ScholarlyReportRenderer: React.FC<{ report: ScholarlyReport | null }> = ({ report }) => {
    if (!report) return null;

    const recommendationColorMap = {
        'Academically Validated Buy': 'bg-green-800 text-green-300',
        'Hold/Neutral': 'bg-yellow-800 text-yellow-300',
        'Academically Invalidated': 'bg-red-800 text-red-300',
    };

    const Metric: React.FC<{label: string, value: string | number, pValue?: number, tooltip: string}> = ({label, value, pValue, tooltip}) => (
        <div className="bg-black/20 p-3 rounded-md text-center" title={tooltip}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-lg font-bold text-gray-100">{value}</p>
            {pValue !== undefined && <p className="text-xs text-gray-500">(p={pValue.toFixed(3)})</p>}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Metric label="Annualized Alpha" value={`${report.annualAlpha.toFixed(2)}%`} pValue={report.pValue} tooltip="Excess return over benchmark (S&P 500)" />
                <Metric label="Sharpe Ratio" value={report.sharpeRatio.toFixed(2)} tooltip="Risk-adjusted return" />
                <Metric label="Information Ratio" value={report.informationRatio.toFixed(2)} tooltip="Consistency of excess returns" />
                <Metric label="Max Drawdown" value={`${report.maxDrawdown.toFixed(2)}%`} tooltip="Worst peak-to-trough decline" />
            </div>
            <div className="text-center text-sm text-gray-400">
                95% Confidence Interval for Alpha: <span className="font-semibold text-gray-200">[{report.confidenceInterval.lower.toFixed(2)}%, {report.confidenceInterval.upper.toFixed(2)}%]</span>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-300 mb-1">Backtest Summary</h4>
                <p className="text-sm text-gray-400">{report.summary}</p>
            </div>
             <div className="text-center p-3 rounded-lg flex flex-col items-center">
                <p className="text-sm text-gray-400 mb-2">Academic Recommendation</p>
                <span className={`px-4 py-1.5 text-md font-bold rounded-full ${recommendationColorMap[report.recommendation]}`}>
                    {report.recommendation}
                </span>
            </div>
        </div>
    );
};


const PowerDensityTimeline: React.FC = () => {
    const timelineEvents = [
        { era: '1940s', name: 'ENIAC', power: '150 kW', color: 'bg-red-500' },
        { era: '1990s', name: 'Colocation', power: '1-3 kW / Rack', color: 'bg-orange-500' },
        { era: '2000s', name: 'Cloud', power: '3-8 kW / Rack', color: 'bg-yellow-500' },
        { era: '2010s', name: 'Edge', power: '8-15 kW / Rack', color: 'bg-lime-500' },
        { era: '2020s', name: 'AI', power: '100+ kW / Rack', color: 'bg-green-500' },
    ];

    return (
        <div className="mt-4">
            <div className="relative">
                {/* Timeline bar */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-600"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>

                {/* Timeline events */}
                <div className="relative flex justify-between">
                    {timelineEvents.map((event, index) => (
                        <div key={index} className="flex flex-col items-center text-center w-1/5">
                             <div className={`w-4 h-4 rounded-full ${event.color} border-2 border-gray-800 z-10`}></div>
                            <div className="mt-2">
                                <p className="text-xs font-semibold text-gray-300">{event.era}</p>
                                <p className="text-xs text-gray-400">{event.name}</p>
                                <p className={`text-sm font-bold ${event.color.replace('bg-', 'text-')}`}>{event.power}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface AIAnalysisSectionProps {
    title: string;
    onGenerate: () => void;
    isLoading: boolean;
    content: any;
    children?: React.ReactNode;
    renderer?: React.FC<any>;
    // FIX: Allow arbitrary extra props to be passed through to the renderer.
    [key: string]: any;
}


const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ title, onGenerate, isLoading, content, children, renderer: Renderer = MarkdownRenderer, ...rest }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasContent = content != null && (!Array.isArray(content) || content.length > 0);
    
    // Pass all extra props to the renderer
    const finalProps = { content, report: content, ...rest };

    return (
        <div className="bg-white/5 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">
                <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-white/10">
                    {children}
                    {!hasContent && !isLoading && (
                        <button onClick={onGenerate} className="neuro-button flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-lg mt-2">
                            <SparkleIcon />
                            Generate Analysis
                        </button>
                    )}
                    {isLoading && <div className="text-gray-400 animate-pulse mt-2">Generating report... This may take up to 30 seconds for deep analysis.</div>}
                    {hasContent && <Renderer {...finalProps} />}
                </div>
            )}
        </div>
    );
};

const CompanyModal: React.FC<CompanyModalProps> = ({ company, onClose, onAddToPortfolio, viewCompanyDetails }) => {
    const [longTermThesis, setLongTermThesis] = useState<string | null>(null);
    const [isThesisLoading, setIsThesisLoading] = useState(false);
    
    const [historicalAnalysis, setHistoricalAnalysis] = useState<string | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    
    const [infrastructureReport, setInfrastructureReport] = useState<string | null>(null);
    const [isInfraLoading, setIsInfraLoading] = useState(false);

    const [academicReport, setAcademicReport] = useState<string | null>(null);
    const [isAcademicLoading, setIsAcademicLoading] = useState(false);

    const [powerDensityAnalysis, setPowerDensityAnalysis] = useState<string | null>(null);
    const [isPowerDensityLoading, setIsPowerDensityLoading] = useState(false);

    const [convergedReport, setConvergedReport] = useState<string | null>(null);
    const [isConvergedReportLoading, setIsConvergedReportLoading] = useState(false);

    const [scholarlyReport, setScholarlyReport] = useState<ScholarlyReport | null>(null);
    const [isScholarlyReportLoading, setIsScholarlyReportLoading] = useState(false);

    const [tradeSimulation, setTradeSimulation] = useState<string | null>(null);
    const [isTradeSimLoading, setIsTradeSimLoading] = useState(false);

    const handleGetThesis = async () => {
        setIsThesisLoading(true);
        const thesis = await getLongTermThesis(company);
        setLongTermThesis(thesis);
        setIsThesisLoading(false);
    };

    const handleGetHistoricalAnalysis = async () => {
        setIsHistoryLoading(true);
        const analysis = await getHistoricalAnalysis(company);
        setHistoricalAnalysis(analysis);
        setIsHistoryLoading(false);
    };

    const handleGetInfrastructureReport = async () => {
        setIsInfraLoading(true);
        const report = await getInfrastructureIntelligenceReport(company);
        setInfrastructureReport(report);
        setIsInfraLoading(false);
    };

    const handleGetAcademicReport = async () => {
        setIsAcademicLoading(true);
        const report = await getAcademicAndMacroReport(company);
        setAcademicReport(report);
        setIsAcademicLoading(false);
    };

    const handleGetPowerDensityAnalysis = async () => {
        setIsPowerDensityLoading(true);
        const analysis = await getPowerDensityAnalysis(company);
        setPowerDensityAnalysis(analysis);
        setIsPowerDensityLoading(false);
    };

    const handleGetConvergedReport = async () => {
        setIsConvergedReportLoading(true);
        const report = await getConvergedIntelligenceReport(company);
        setConvergedReport(report);
        setIsConvergedReportLoading(false);
    };

    const handleGetScholarlyReport = async () => {
        setIsScholarlyReportLoading(true);
        const report = await getScholarlyValidationReport(company);
        setScholarlyReport(report);
        setIsScholarlyReportLoading(false);
    };

    const handleSimulateTrade = async (tradeType: 'Buy' | 'Sell') => {
        if (!convergedReport) return;
        setIsTradeSimLoading(true);
        setTradeSimulation(null);
        const result = await getTradeSimulationAnalysis(company, convergedReport, tradeType);
        setTradeSimulation(result);
        setIsTradeSimLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-12 h-12 rounded-full object-contain bg-white" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-100">{company.Company} ({company.Ticker})</h2>
                            <p className="text-sm text-gray-400">{company.Product_Component}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                         <span className={`px-3 py-1 text-sm font-semibold rounded-full ${tierColorMap[company.Investment_Tier]}`}>{company.Investment_Tier}</span>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <Stat label="Universal Score" value={company.Universal_Score} color="text-accent-blue" />
                        <Stat label="Graham Score" value={company.Graham_Score ?? 'N/A'} color={getGrahamColor(company.Graham_Score)} />
                        <Stat label="Market Cap (B)" value={`$${company.Market_Cap_B.toLocaleString()}`} />
                        <Stat label="P/E Ratio" value={company.PE_Ratio.toFixed(1)} subValue={`Fwd: ${company.Forward_PE.toFixed(1)}`} />
                        <Stat label="Rev Growth (YoY)" value={`${company.Revenue_Growth_YoY.toFixed(1)}%`} color={company.Revenue_Growth_YoY > 0 ? 'text-accent-green' : 'text-accent-red'} />
                        <Stat label="ESG Score" value={company.ESG_Score ?? 'N/A'} color={getEsgTextColor(company.ESG_Score)} />
                    </div>

                    {/* Main Details */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <InfoRow label="Category" value={`${company.Category} / ${company.Sub_Category}`} />
                            <InfoRow label="Supply Chain Role" value={company.Supply_Chain_Role} />
                            <InfoRow label="Competitive Position" value={company.Competitive_Position} />
                            <InfoRow label="Risk Level" value={<span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${riskColorMap[company.Risk_Level]}`}>{company.Risk_Level}</span>} isBadge />
                            <InfoRow 
                                label="Substitutability" 
                                value={
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${substitutabilityColorMap[company.Substitutability]}`}>
                                            {company.Substitutability}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getSubstitutabilityScoreColor(company.Substitutability_Score)}`}>
                                            Score: {company.Substitutability_Score}
                                        </span>
                                    </div>
                                } 
                                isBadge 
                            />
                        </div>
                         <div className="space-y-1">
                            <InfoRow label="Current Price" value={`$${company.Current_Price_USD.toFixed(2)}`} />
                            <InfoRow label="YTD Performance" value={`${company.YTD_Performance.toFixed(1)}%`} />
                            <InfoRow label="Debt-to-Equity" value={company.Debt_to_Equity.toFixed(2)} />
                            <InfoRow label="Geographic Presence" value={company.Geographic_Presence} />
                            <InfoRow label="Country" value={company.Country} />
                        </div>
                    </div>
                    
                    {/* Supply Chain Visualizer */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">Supply Chain Visualizer</h3>
                        <SupplyChainVisualizer company={company} allCompanies={companiesData} supplyChainData={supplyChainData} onViewDetails={viewCompanyDetails} onAddToPortfolio={onAddToPortfolio} />
                    </div>
                    
                    {/* AI Analysis Sections */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-100 border-b border-white/10 pb-2">PDCI AI-Powered Intelligence Reports</h3>
                        
                        <div className="border border-yellow-400/50 p-0.5 rounded-lg bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent">
                             <AIAnalysisSection 
                                title="Scholarly-Grade Quantitative Validation" 
                                onGenerate={handleGetScholarlyReport} 
                                isLoading={isScholarlyReportLoading} 
                                content={scholarlyReport}
                                renderer={ScholarlyReportRenderer}
                            />
                        </div>

                        <div className="bg-gradient-to-r from-accent-blue/20 to-accent-green/20 p-0.5 rounded-lg">
                             <AIAnalysisSection 
                                title="Converged Intelligence Report (Hedge Fund Playbook)" 
                                onGenerate={handleGetConvergedReport} 
                                isLoading={isConvergedReportLoading} 
                                content={convergedReport}
                                renderer={HedgeFundReportRenderer}
                                // Props for the new trade simulation feature
                                onSimulateTrade={handleSimulateTrade}
                                tradeSimulation={tradeSimulation}
                                isTradeSimLoading={isTradeSimLoading}
                                isReportLoading={isConvergedReportLoading}
                            />
                        </div>

                        <AIAnalysisSection title="Historical Context: 85 Years of Power Density" onGenerate={handleGetPowerDensityAnalysis} isLoading={isPowerDensityLoading} content={powerDensityAnalysis}>
                            <PowerDensityTimeline />
                        </AIAnalysisSection>

                        <AIAnalysisSection title="Long-Term Thesis (Graham/Bogle/Kindleberger)" onGenerate={handleGetThesis} isLoading={isThesisLoading} content={longTermThesis} />
                        <AIAnalysisSection title="Historical Context & Analogs" onGenerate={handleGetHistoricalAnalysis} isLoading={isHistoryLoading} content={historicalAnalysis} />
                        <AIAnalysisSection title="Infrastructure Intelligence Report" onGenerate={handleGetInfrastructureReport} isLoading={isInfraLoading} content={infrastructureReport} />
                        <AIAnalysisSection title="Academic & Macro Intelligence" onGenerate={handleGetAcademicReport} isLoading={isAcademicLoading} content={academicReport} />
                    </div>

                </div>

                <div className="mt-auto bg-white/5 p-4 border-t border-white/10 flex justify-end">
                    <button
                        onClick={() => onAddToPortfolio(company)}
                        className="neuro-button bg-accent-green text-black font-bold py-2 px-4"
                    >
                        Add to Portfolio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyModal;