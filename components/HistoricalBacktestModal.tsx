
import React, { useMemo, useState } from 'react';
import { Company } from '../types';
import { CloseIcon, HistoryIcon, ThumbsUpIcon, WarningIcon } from './icons/Icons';
import { historicalMarketData, MarketEvent } from '../lib/historicalMarketData';
import LineChart from './LineChart';

interface HistoricalBacktestModalProps {
    onClose: () => void;
    portfolio: Company[];
    allCompanies: Company[];
}

interface BacktestResult {
    history: { year: number; portfolioValue: number; benchmarkValue: number }[];
    eventImpacts: Record<number, { winners: { company: Company; change: number }[], losers: { company: Company; change: number }[] }>;
}

// A more sophisticated simulation logic that incorporates event impacts
const runBacktest = (portfolio: Company[], events: MarketEvent[]): BacktestResult => {
    if (portfolio.length === 0) return { history: [], eventImpacts: {} };

    const initialValue = 10000;
    const initialBenchmarkValue = events[0]?.simulatedDowJonesIndex || 1;

    let companyValues = portfolio.map(() => initialValue / portfolio.length);
    
    const history = [{
        year: events[0].year,
        portfolioValue: initialValue,
        benchmarkValue: initialValue,
    }];
    
    const eventImpacts: BacktestResult['eventImpacts'] = {};

    for (let i = 1; i < events.length; i++) {
        const prevEvent = events[i - 1];
        const currentEvent = events[i];
        const marketChange = (currentEvent.simulatedDowJonesIndex - prevEvent.simulatedDowJonesIndex) / prevEvent.simulatedDowJonesIndex;

        const periodReturns: { company: Company; change: number }[] = [];

        const newCompanyValues = companyValues.map((value, index) => {
            const company = portfolio[index];
            const baseAlpha = ((company.Revenue_Growth_YoY / 100) * 0.05) + ((company.Universal_Score / 100) * 0.02); // Base quality alpha

            let eventAlpha = 0;
            if (currentEvent.impact) {
                const isTarget = (
                    (currentEvent.impact.targetType === 'Sub_Category' && currentEvent.impact.targets.includes(company.Sub_Category)) ||
                    (currentEvent.impact.targetType === 'Country' && currentEvent.impact.targets.includes(company.Country))
                );
                if (isTarget) {
                    eventAlpha = currentEvent.impact.alpha;
                }
            }

            const totalReturn = marketChange + baseAlpha + eventAlpha;
            periodReturns.push({ company, change: totalReturn * 100 });
            return value * (1 + totalReturn);
        });
        
        companyValues = newCompanyValues;
        const portfolioValue = companyValues.reduce((sum, val) => sum + val, 0);
        const benchmarkValue = (currentEvent.simulatedDowJonesIndex / initialBenchmarkValue) * initialValue;

        history.push({
            year: currentEvent.year,
            portfolioValue: parseFloat(portfolioValue.toFixed(2)),
            benchmarkValue: parseFloat(benchmarkValue.toFixed(2)),
        });

        // Store winners and losers for this event period
        periodReturns.sort((a, b) => b.change - a.change);
        eventImpacts[currentEvent.year] = {
            winners: periodReturns.slice(0, 3),
            losers: periodReturns.slice(-3).reverse(),
        };
    }

    return { history, eventImpacts };
};

const HistoricalBacktestModal: React.FC<HistoricalBacktestModalProps> = ({ onClose, portfolio, allCompanies }) => {
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const { effectivePortfolio, isDefault } = useMemo(() => {
        if (portfolio.length > 0) {
            return { effectivePortfolio: portfolio, isDefault: false };
        }
        // Create a default portfolio if the user's is empty
        const defaultPortfolio = [...allCompanies]
            .sort((a, b) => b.Universal_Score - a.Universal_Score)
            .slice(0, 5);
        return { effectivePortfolio: defaultPortfolio, isDefault: true };
    }, [portfolio, allCompanies]);


    const backtestResult = useMemo(() => runBacktest(effectivePortfolio, historicalMarketData), [effectivePortfolio]);

    const { history, eventImpacts } = backtestResult;
    const finalPortfolioValue = history[history.length - 1]?.portfolioValue || 0;
    const finalBenchmarkValue = history[history.length - 1]?.benchmarkValue || 0;
    const outperformance = finalPortfolioValue - finalBenchmarkValue;

    const selectedEvent = historicalMarketData.find(e => e.year === selectedYear);
    const selectedImpact = selectedYear ? eventImpacts[selectedYear] : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <HistoryIcon />
                        Portfolio Historical Backtest (1992-2024)
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {isDefault && (
                        <div className="bg-yellow-400/10 border border-yellow-400/50 text-yellow-300 text-sm rounded-lg p-3 mb-4 text-center">
                            Your portfolio is empty. Running backtest on a default strategy (Top 5 companies by Universal Score).
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                             <div className="glass-panel p-4">
                                <h3 className="font-semibold text-gray-200 mb-2">Simulated Growth of $10,000</h3>
                                <div className="h-72">
                                  <LineChart data={history} />
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1 space-y-4">
                            <div className="glass-panel p-4 text-center">
                                <h4 className="text-sm text-gray-400">Final Portfolio Value</h4>
                                <p className="text-3xl font-bold text-accent-blue">${finalPortfolioValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                            </div>
                             <div className="glass-panel p-4 text-center">
                                <h4 className="text-sm text-gray-400">Final Benchmark Value</h4>
                                <p className="text-3xl font-bold text-gray-400">${finalBenchmarkValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                            </div>
                            <div className={`glass-panel p-4 text-center ${outperformance >= 0 ? 'bg-accent-green/20' : 'bg-accent-red/20'}`}>
                                <h4 className="text-sm text-gray-400">Out/Under Performance</h4>
                                <p className={`text-3xl font-bold ${outperformance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                    {outperformance >= 0 ? '+' : ''}${outperformance.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 glass-panel p-4">
                        <h3 className="font-semibold text-gray-200 mb-2">Explore Key Market Events</h3>
                        <div className="flex flex-wrap gap-2">
                            {historicalMarketData.map(event => (
                                <button
                                    key={event.year}
                                    onClick={() => setSelectedYear(event.year)}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedYear === event.year ? 'bg-accent-blue border-accent-blue text-white' : 'border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                                >
                                    {event.year}
                                </button>
                            ))}
                        </div>
                        {selectedEvent && (
                            <div className="mt-4 p-4 bg-black/20 rounded-md animate-fade-in-up">
                                <p className="font-bold text-gray-200 text-center">{selectedEvent.year}: <span className="text-accent-blue">{selectedEvent.event}</span></p>
                                {selectedImpact && (
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <h4 className="font-semibold text-accent-green flex items-center gap-1"><ThumbsUpIcon className="w-4 h-4" /> Winners in this Period</h4>
                                            <ul className="mt-1 space-y-1">
                                                {selectedImpact.winners.map(({company, change}) => (
                                                    <li key={company.Ticker} className="flex justify-between bg-black/20 p-1 rounded">
                                                        <span>{company.Ticker}</span>
                                                        <span className="font-mono text-accent-green">+{change.toFixed(1)}%</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold text-accent-red flex items-center gap-1"><WarningIcon className="w-4 h-4" /> Losers in this Period</h4>
                                            <ul className="mt-1 space-y-1">
                                                {selectedImpact.losers.map(({company, change}) => (
                                                    <li key={company.Ticker} className="flex justify-between bg-black/20 p-1 rounded">
                                                        <span>{company.Ticker}</span>
                                                        <span className="font-mono text-accent-red">{change.toFixed(1)}%</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoricalBacktestModal;
