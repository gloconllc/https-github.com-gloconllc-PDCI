import React, { useMemo } from 'react';
import { Company } from '../types';
import { TrashIcon, SparkleIcon, FlaskIcon, OptimizeIcon } from './icons/Icons';

interface PortfolioSidebarProps {
    portfolio: Company[];
    onRemove: (ticker: string) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
    onStressTest: () => void;
    onOptimize: () => void;
}

const KPIRow: React.FC<{ label: string; value: string; tooltip: string; colorClass: string }> = ({ label, value, tooltip, colorClass }) => (
    <div className="flex justify-between items-center" title={tooltip}>
        <span className="text-gray-400">{label}</span>
        <span className={`font-bold px-2 py-0.5 rounded ${colorClass}`}>{value}</span>
    </div>
);

const PortfolioSidebar: React.FC<PortfolioSidebarProps> = ({ portfolio, onRemove, onAnalyze, isAnalyzing, onStressTest, onOptimize }) => {
    
    const kpis = useMemo(() => {
        if (portfolio.length === 0) return null;

        const weight = 1 / portfolio.length;
        
        const uswa = portfolio.reduce((acc, c) => acc + c.Universal_Score * weight, 0);
        const cei = portfolio.reduce((acc, c) => acc + c.Criticality * weight, 0) / 10;
        const srs = portfolio.reduce((acc, c) => acc + c.Substitutability_Score * weight, 0);

        const twCount = portfolio.filter(c => c.Country === 'Taiwan').length;
        const krCount = portfolio.filter(c => c.Country === 'Korea').length;
        const gcr_tw_kr = ((twCount + krCount) / portfolio.length) * 100;
        
        return {
            uswa: {
                value: uswa.toFixed(1),
                color: uswa > 92 ? 'bg-green-800 text-green-300' : uswa >= 85 ? 'bg-yellow-800 text-yellow-300' : 'bg-red-800 text-red-300'
            },
            cei: {
                value: cei.toFixed(2),
                color: cei >= 9.0 ? 'bg-green-800 text-green-300' : 'bg-yellow-800 text-yellow-300'
            },
            srs: {
                value: srs.toFixed(1),
                color: srs < 35 ? 'bg-green-800 text-green-300' : srs <= 50 ? 'bg-yellow-800 text-yellow-300' : 'bg-red-800 text-red-300'
            },
            gcr_tw_kr: {
                value: `${gcr_tw_kr.toFixed(0)}%`,
                color: gcr_tw_kr < 40 ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'
            }
        };
    }, [portfolio]);

    const exportToCSV = () => {
        if (portfolio.length === 0) return;

        const headers = Object.keys(portfolio[0]).join(',');
        const rows = portfolio.map(company =>
            Object.values(company).map(value =>
                `"${String(value).replace(/"/g, '""')}"`
            ).join(',')
        );

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'pdci_portfolio.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="glass-panel p-4 sticky top-24">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-200">Portfolio</h2>
                <span className="text-sm font-medium bg-accent-green text-black rounded-full px-2 py-0.5">
                    {portfolio.length}
                </span>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {portfolio.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Your portfolio is empty. Add companies from the list.</p>
                ) : (
                    portfolio.map(company => (
                        <div key={company.Ticker} className="flex items-center justify-between bg-black/20 p-2 rounded-md">
                            <div className="flex items-center min-w-0">
                                <img src={company.logoUrl} alt={`${company.Company} logo`} className="w-6 h-6 rounded-full object-contain bg-white mr-3 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-200 text-sm truncate">{company.Company}</p>
                                    <p className="text-xs text-gray-400">{company.Ticker}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onRemove(company.Ticker)}
                                className="p-1 rounded-full text-gray-400 hover:bg-accent-red hover:text-white transition-colors ml-2 flex-shrink-0"
                                aria-label={`Remove ${company.Company} from portfolio`}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {portfolio.length > 0 && kpis && (
                <>
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <h3 className="text-md font-semibold text-gray-300 mb-3">BI Key Performance Indicators</h3>
                        <div className="space-y-2 text-sm">
                            <KPIRow label="Univ. Score W. Avg (USWA)" value={kpis.uswa.value} colorClass={kpis.uswa.color} tooltip="Target: >85" />
                            <KPIRow label="Criticality Index (CEI)" value={kpis.cei.value} colorClass={kpis.cei.color} tooltip="Target: >9.0" />
                            <KPIRow label="Substitutability Risk (SRS)" value={kpis.srs.value} colorClass={kpis.srs.color} tooltip="Target: <35" />
                            <KPIRow label="Geographic Risk (TW+KR)" value={kpis.gcr_tw_kr.value} colorClass={kpis.gcr_tw_kr.color} tooltip="Target: <40%" />
                        </div>
                    </div>
                     <div className="mt-6 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                             <button
                                onClick={onAnalyze}
                                disabled={isAnalyzing}
                                className="neuro-button w-full flex items-center justify-center gap-2 text-white font-bold py-2 px-3 text-sm disabled:opacity-50"
                            >
                                <SparkleIcon />
                                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                            </button>
                            <button
                                onClick={onStressTest}
                                className="neuro-button w-full flex items-center justify-center gap-2 text-white font-bold py-2 px-3 text-sm"
                            >
                                <FlaskIcon />
                                Stress Test
                            </button>
                        </div>
                         <button
                            onClick={onOptimize}
                            className="neuro-button w-full flex items-center justify-center gap-2 bg-accent-green text-black font-bold py-2 px-4"
                        >
                            <OptimizeIcon />
                            Optimize Portfolio
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="neuro-button w-full text-white font-bold py-2 px-4 text-sm"
                        >
                            Export to CSV
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PortfolioSidebar;