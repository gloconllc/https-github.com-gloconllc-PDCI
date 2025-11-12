import React from 'react';
import { Company } from '../types';
import { supplyChainData } from '../lib/supplyChainData';

interface PeerComparisonProps {
    company: Company;
    allCompanies: Company[];
    onViewDetails: (company: Company) => void;
}

const PeerComparison: React.FC<PeerComparisonProps> = ({ company, allCompanies, onViewDetails }) => {
    const peers = (supplyChainData[company.Ticker]?.competitors || [])
        .map(ticker => allCompanies.find(c => c.Ticker === ticker))
        .filter((c): c is Company => c !== undefined)
        .slice(0, 3); // Limit to max 3 peers for clarity

    if (peers.length === 0) {
        return null; // Don't render the component if no peers are defined
    }

    const allInComparison = [company, ...peers];

    return (
        <div className="glass-panel p-4">
            <h3 className="font-semibold text-gray-200 mb-3">Peer Comparison</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400">
                            <th className="p-1.5 text-left">Ticker</th>
                            <th className="p-1.5 text-right">Score</th>
                            <th className="p-1.5 text-right">P/E</th>
                            <th className="p-1.5 text-right">Growth</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allInComparison.map(p => (
                            <tr
                                key={p.Ticker}
                                className={`border-b border-white/10 last:border-b-0 ${p.Ticker === company.Ticker ? 'bg-accent-blue/10' : 'hover:bg-white/5 cursor-pointer'}`}
                                onClick={() => p.Ticker !== company.Ticker && onViewDetails(p)}
                            >
                                <td className={`p-1.5 font-bold ${p.Ticker === company.Ticker ? 'text-accent-blue' : 'text-gray-200'}`}>{p.Ticker}</td>
                                <td className="p-1.5 text-right font-mono">{p.Universal_Score}</td>
                                <td className="p-1.5 text-right font-mono">{p.PE_Ratio.toFixed(1)}</td>
                                <td className={`p-1.5 text-right font-mono ${p.Revenue_Growth_YoY >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                    {p.Revenue_Growth_YoY.toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PeerComparison;
